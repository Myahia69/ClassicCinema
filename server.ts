/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { fallbackMovies } from './src/data/fallbackMovies';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API Status indicator
app.get('/api/status', (req, res) => {
  const clientKey = req.headers['x-tmdb-key'] as string;
  const tmdbKey = (clientKey && clientKey.trim() !== '') ? clientKey : process.env.TMDB_API_KEY;
  const hasKey = !!(tmdbKey && tmdbKey.trim() !== '' && tmdbKey !== 'MY_TMDB_API_KEY');
  
  res.json({
    connected: hasKey,
    source: hasKey ? 'tmdb' : 'fallback',
    message: hasKey 
      ? 'Connected to TMDB API' 
      : 'Using premium local fallback dataset (Arabic & International Classics)'
  });
});

/**
 * API Endpoint: Fetch classic movies.
 * This endpoint proxies queries to TMDB if a key is provided, or returns our highly polished fallback movie list.
 */
app.get('/api/movies', async (req, res) => {
  const clientKey = req.headers['x-tmdb-key'] as string;
  const tmdbKey = (clientKey && clientKey.trim() !== '') ? clientKey : process.env.TMDB_API_KEY;
  const hasKey = !!(tmdbKey && tmdbKey.trim() !== '' && tmdbKey !== 'MY_TMDB_API_KEY');

  if (!hasKey) {
    console.log('TMDB_API_KEY is not configured or placeholder. Serving curated fallback classics.');
    return res.json({
      source: 'fallback',
      movies: fallbackMovies
    });
  }

  try {
    console.log('Fetching live classic masterworks from TMDB API...');
    const BASE_URL = 'https://api.themoviedb.org/3';
    
    // Helper to fetch and resolve JSON
    const fetchTmdb = async (endpoint: string, params: string = '') => {
      const glue = endpoint.includes('?') ? '&' : '?';
      const url = `${BASE_URL}/${endpoint}${glue}api_key=${tmdbKey}&language=en-US${params}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`TMDB error for: ${endpoint}`);
      return response.json();
    };

    // Helper to get video trailers for a movie
    const grabTrailer = async (movieId: number): Promise<string> => {
      try {
        const videoData = await fetchTmdb(`movie/${movieId}/videos`);
        const videos = videoData.results || [];
        // Prioritize official trailer on YouTube
        const trailer = videos.find((v: any) => 
          v.site === 'YouTube' && 
          (v.type === 'Trailer' || v.type === 'Teaser' || v.type === 'Clip')
        );
        return trailer ? trailer.key : '';
      } catch (err) {
        return '';
      }
    };

    // 1. Fetch Arabic Classics (Before 1990, Arabic language)
    // Querying TMDB's discovery endpoint
    const arabicData = await fetchTmdb('discover/movie', '&with_original_language=ar&primary_release_date.lte=1990-12-31&sort_by=vote_average.desc&vote_count.gte=10');
    const arResults = arabicData.results || [];

    // 2. Fetch International Golden Age (Before 1990, non-english, non-arabic, sorted by rating/popularity)
    const intData = await fetchTmdb('discover/movie', '&without_original_languages=en,ar&primary_release_date.lte=1990-12-31&sort_by=popularity.desc&vote_count.gte=30');
    const intResults = intData.results || [];

    // 3. Fetch Classic Hollywood (Before 1980, English language, popular/epic)
    const hwyData = await fetchTmdb('discover/movie', '&with_original_language=en&primary_release_date.lte=1980-12-31&sort_by=popularity.desc&vote_count.gte=100');
    const hwyResults = hwyData.results || [];

    // 4. Fetch Classic Documentaries (Before 1990, genre ID 99)
    const docData = await fetchTmdb('discover/movie', '&with_genres=99&primary_release_date.lte=1990-12-31&sort_by=popularity.desc');
    const docResults = docData.results || [];

    // Combine & Process with Trailer Resolution (Limit to first 8 of each category to protect rate limits/fetch speed) Every card needs a YouTube player!
    const processMovie = async (m: any, category: string): Promise<any> => {
      const youtube_id = await grabTrailer(m.id);
      
      // Since TMDB might not have Arabic summaries for every film, we construct bilingual keys
      // Fallback description to standard or create Arabic if missing
      return {
        id: `live_${m.id}`,
        title_en: m.title || m.original_title,
        title_ar: m.title || m.original_title, // We can also fall back
        overview_en: m.overview || 'No english overview available.',
        overview_ar: m.overview || 'لا يوجد ملخص متاح حالياً باللغة العربية.',
        release_date: m.release_date || 'Unknown',
        poster_path: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : '',
        backdrop_path: m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : '',
        vote_average: m.vote_average || 0.0,
        genres: m.genre_ids ? m.genre_ids.map(String) : [],
        youtube_id: youtube_id || 'O-fKExD_0I0', // Fallback to Saladin trailer if none found
        country: m.origin_country ? m.origin_country.join(', ') : 'International',
        category: category
      };
    };

    const limit = 8;
    const arabicProcessed = await Promise.all(arResults.slice(0, limit).map((m: any) => processMovie(m, 'arabic_classics')));
    const intProcessed = await Promise.all(intResults.slice(0, limit).map((m: any) => processMovie(m, 'international_golden_age')));
    const hwyProcessed = await Promise.all(hwyResults.slice(0, limit).map((m: any) => processMovie(m, 'classic_hollywood')));
    const docProcessed = await Promise.all(docResults.slice(0, limit).map((m: any) => processMovie(m, 'documentaries_silent')));

    // Merge live results with some backup curated Arabic films if TMDB results have low counts for Arabic Classics prior 1990
    let finalArabic = arabicProcessed;
    if (finalArabic.length < 3) {
      // Pre-add curated Egyptian blockbusters which might be missing/unrated on tmdb discover
      const baseCurated = fallbackMovies.filter(m => m.category === 'arabic_classics');
      finalArabic = [...finalArabic, ...baseCurated.map(m => ({...m, id: `hybrid_${m.id}`}))].filter((v, i, self) => 
        self.findIndex(t => t.title_en === v.title_en) === i
      ).slice(0, limit);
    }

    const mergedMovies = [
      ...finalArabic,
      ...intProcessed,
      ...hwyProcessed,
      ...docProcessed
    ];

    res.json({
      source: 'tmdb',
      movies: mergedMovies
    });

  } catch (error: any) {
    console.error('TMDB integration failed. Reverting immediately to local fallback dataset:', error.message);
    res.json({
      source: 'fallback',
      error: error.message,
      movies: fallbackMovies
    });
  }
});

// Setup Vite Dev Server / Static Production Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ClassicCinema fullstack backend starting on http://localhost:${PORT}`);
  });
}

startServer();
