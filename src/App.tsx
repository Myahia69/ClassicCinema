/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import MovieRow from './components/MovieRow';
import MovieDetailModal from './components/MovieDetailModal';
import { Movie, ApiStatus } from './types';
import { Film, LogOut, Sparkles, Star, Heart, Volume2, HelpCircle, Loader2 } from 'lucide-react';

export default function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lang, setLang] = useState<'ar' | 'en'>('ar'); // Defaults to beautiful Arabic for روائع السينما الكلاسيكية!
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);

  // Load configuration and movie catalog
  const loadCatalog = async () => {
    try {
      setLoading(true);
      // Retrieve client TMDB API Key if exists in localStorage
      const customKey = localStorage.getItem('CUSTOM_TMDB_API_KEY') || '';
      
      const headers: HeadersInit = {};
      if (customKey) {
        headers['x-tmdb-key'] = customKey;
      }

      // 1. Fetch live or fallback status indicator
      const statusRes = await fetch('/api/status', { headers });
      if (statusRes.ok) {
        const sData = await statusRes.json();
        setApiStatus(sData);
      }

      // 2. Fetch full cinematic catalog
      const moviesRes = await fetch('/api/movies', { headers });
      if (moviesRes.ok) {
        const mData = await moviesRes.json();
        const movieArray = mData.movies || [];
        setMovies(movieArray);

        // Find standard featured movie (default to Saladin or first in Arabic Classics)
        const arabClassics = movieArray.filter((m: Movie) => m.category === 'arabic_classics');
        if (arabClassics.length > 0) {
          setFeaturedMovie(arabClassics[0]); // Ahmed Mazhar's masterpiece
        } else if (movieArray.length > 0) {
          setFeaturedMovie(movieArray[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching film index:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  // Filter movies dynamically based on search query across bilingual details
  const filteredMovies = movies.filter((movie) => {
    if (!searchQuery.trim()) return true;
    const s = searchQuery.toLowerCase();
    return (
      movie.title_en.toLowerCase().includes(s) ||
      movie.title_ar.toLowerCase().includes(s) ||
      movie.overview_en.toLowerCase().includes(s) ||
      movie.overview_ar.toLowerCase().includes(s) ||
      (movie.director_en && movie.director_en.toLowerCase().includes(s)) ||
      (movie.director_ar && movie.director_ar.toLowerCase().includes(s))
    );
  });

  // Categorize filtered lists
  const arabicClassics = filteredMovies.filter((m) => m.category === 'arabic_classics');
  const internationalGolden = filteredMovies.filter((m) => m.category === 'international_golden_age');
  const classicHollywood = filteredMovies.filter((m) => m.category === 'classic_hollywood');
  const documentariesSilent = filteredMovies.filter((m) => m.category === 'documentaries_silent');

  const handlePlayTrailer = (movie: Movie) => {
    // Setting selectedMovie immediately triggers the trailer playback overlay!
    setSelectedMovie(movie);
  };

  const isAr = lang === 'ar';

  return (
    <div className="min-h-screen bg-cinema-black text-gray-100 font-sans overflow-x-hidden select-none">
      {/* Cinematic grid grain overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cinema-charcoal/30 via-cinema-black to-cinema-black pointer-events-none z-0"></div>

      {/* Header component */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        lang={lang}
        setLang={setLang}
        apiStatus={apiStatus}
        onRefreshApi={loadCatalog}
      />

      {loading ? (
        /* Majestic Cinematic Loader */
        <div className="w-full h-screen flex flex-col items-center justify-center gap-4 bg-cinema-black relative z-50">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <Loader2 className="w-16 h-16 text-brand-gold animate-spin" />
            <Film className="w-8 h-8 text-white absolute animate-pulse" />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-xl font-bold font-display text-brand-gold">ClassicCinema</h3>
            <p className="text-xs text-gray-500 animate-pulse font-mono tracking-widest">
              {isAr ? 'جاري تحميل روائع الزمن الجميل...' : 'LOADING GOLDEN SELECTIONS...'}
            </p>
          </div>
        </div>
      ) : (
        <main className="relative z-10 pb-20">
          {/* Main Hero Showcase */}
          {featuredMovie && !searchQuery && (
            <Hero
              movie={featuredMovie}
              lang={lang}
              onPlayTrailer={handlePlayTrailer}
              onOpenDetails={setSelectedMovie}
            />
          )}

          {/* Catalog content rows wrapper */}
          <div className={`max-w-7xl mx-auto ${searchQuery ? 'pt-28' : 'pt-4'} pb-10 px-4 md:px-0`}>
            
            {/* Display search query header helper */}
            {searchQuery && (
              <div className="px-4 md:px-8 mb-6" dir={isAr ? 'rtl' : 'ltr'}>
                <h2 className="text-xl font-sans text-gray-400">
                  {isAr ? 'نتائج البحث عن:' : 'Search results for:'}{' '}
                  <span className="text-brand-gold font-bold">"{searchQuery}"</span>
                </h2>
                <p className="text-xs text-gray-500">
                  {isAr ? `تم العثور على ${filteredMovies.length} فيلم` : `Found ${filteredMovies.length} classic masterpieces`}
                </p>
              </div>
            )}

            {/* Bento Grid layout containing the categories and dynamic stats panel */}
            <div className="grid grid-cols-12 gap-5 px-0 md:px-0 mt-5">
              
              {/* Left Large Bento Block: Arabic Classics (Col span: 12 on mobile, 8 on desktop) */}
              <div className="col-span-12 lg:col-span-8 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-4 md:p-6 flex flex-col gap-4 overflow-hidden relative shadow-2xl">
                <MovieRow
                  title={isAr ? 'روائع السينما العربية القديمة' : 'Classic Arabic Cinema'}
                  movies={arabicClassics}
                  lang={lang}
                  onMovieClick={setSelectedMovie}
                  onPlayTrailer={handlePlayTrailer}
                  className="relative"
                />
              </div>

              {/* Right Column Bento Blocks: Curated spotlight + Interactive Stats (Col span: 12 on mobile, 4 on desktop) */}
              <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">
                {/* Weekly Theme spotlight block */}
                <div className="flex-1 bg-gradient-to-br from-brand-gold/15 via-cinema-gray to-cinema-black rounded-2xl border border-brand-gold/20 p-6 relative overflow-hidden flex flex-col justify-between shadow-2xl min-h-[220px]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full blur-2xl pointer-events-none"></div>
                  <div>
                    <h3 className="text-xs font-bold text-brand-gold tracking-widest uppercase mb-3 flex items-center gap-1.5 font-mono">
                      <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
                      {isAr ? 'مجموعة الأسبوع المختارة' : 'Collection of the Week'}
                    </h3>
                    <p className="text-2xl font-serif font-bold text-white italic mb-1">
                      {isAr ? 'الجيل الذهبي لهوليوود' : 'Golden Age of Hollywood'}
                    </p>
                    <p className="text-xs text-gray-400 leading-relaxed mb-4">
                      {isAr 
                        ? 'بين دراما الحروب ورومانسية الأبيض والأسود. سلسلة حصرية برعاية نقاد ومؤرخي السينما.' 
                        : 'From nostalgic wartime romance to groundbreaking dramas. Curated by leading cinematic historians.'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex -space-x-3">
                      <div className="w-8 h-8 rounded-full border-2 border-cinema-black bg-zinc-800 flex items-center justify-center font-bold text-[9px] text-brand-gold font-mono">1941</div>
                      <div className="w-8 h-8 rounded-full border-2 border-cinema-black bg-zinc-700 flex items-center justify-center font-bold text-[9px] text-brand-gold font-mono">1942</div>
                      <div className="w-8 h-8 rounded-full border-2 border-cinema-black bg-zinc-600 flex items-center justify-center font-bold text-[9px] text-brand-gold font-mono">1962</div>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono tracking-wider font-semibold">
                      {isAr ? '+٢٤ فيلماً عريقاً' : '+24 MASTERWORKS'}
                    </span>
                  </div>
                </div>

                {/* Watch Stats interactive block */}
                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 flex flex-col justify-center relative shadow-2xl">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono font-bold">
                        {isAr ? 'حجم الأرشيف السينمائي' : 'Cinematic Preservation'}
                      </p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-white">
                          {movies.length > 0 ? (movies.reduce((acc, curr) => acc + (curr.runtime || 100), 0) / 60).toFixed(1) : '35.8'}
                        </span>
                        <span className="text-xs text-gray-500 font-bold uppercase">{isAr ? 'ساعات' : 'HOURS'}</span>
                      </div>
                    </div>
                    <div className="w-20 bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-brand-gold h-full w-[80%] rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: International Golden Age Bento block (Col span: 12 on mobile, 6 on desktop) */}
              <div className="col-span-12 lg:col-span-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-4 md:p-6 flex flex-col gap-4 overflow-hidden relative shadow-2xl">
                <MovieRow
                  title={isAr ? 'العصر الذهبي للسينما العالمية' : 'International Golden Age'}
                  movies={internationalGolden}
                  lang={lang}
                  onMovieClick={setSelectedMovie}
                  onPlayTrailer={handlePlayTrailer}
                  className="relative"
                />
              </div>

              {/* Row 2: Classic Hollywood Bento block (Col span: 12 on mobile, 6 on desktop) */}
              <div className="col-span-12 lg:col-span-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-4 md:p-6 flex flex-col gap-4 overflow-hidden relative shadow-2xl">
                <MovieRow
                  title={isAr ? 'كلاسيكيات هوليوود الخالدة' : 'Classic Hollywood'}
                  movies={classicHollywood}
                  lang={lang}
                  onMovieClick={setSelectedMovie}
                  onPlayTrailer={handlePlayTrailer}
                  className="relative"
                />
              </div>

              {/* Row 3: Silent & Documentaries Bento block (Col span: 12) */}
              <div className="col-span-12 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-4 md:p-6 flex flex-col gap-4 overflow-hidden relative shadow-2xl">
                <MovieRow
                  title={isAr ? 'سينما الصمت السينمائي والأفلام الوثائقية' : 'Documentaries & Silent Masterworks'}
                  movies={documentariesSilent}
                  lang={lang}
                  onMovieClick={setSelectedMovie}
                  onPlayTrailer={handlePlayTrailer}
                  className="relative"
                />
              </div>
              
            </div>

            {/* Zero Results Feedback */}
            {filteredMovies.length === 0 && (
              <div className="w-full py-20 flex flex-col items-center justify-center text-center px-4" dir={isAr ? 'rtl' : 'ltr'}>
                <Film className="w-16 h-16 text-gray-600 mb-4 animate-bounce" />
                <h3 className="text-xl font-bold font-display text-gray-300">
                  {isAr ? 'عذراً، لم نعثر على أي نتائج مطابقة' : 'No Classic Masterpieces Found'}
                </h3>
                <p className="text-sm text-gray-500 max-w-md mt-2">
                  {isAr 
                    ? 'جرب البحث بكلمات أخرى مثل اسم الممثل (عمر الشريف، سعاد حسني) أو اسم المخرج (يوسف شاهين).' 
                    : "Try searching with keywords, director name, or lead cast members like 'Omar Sharif' or 'Humphrey Bogart'."}
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-6 px-4 py-2 bg-brand-gold text-cinema-black font-semibold text-xs rounded hover:bg-white transition-all cursor-pointer"
                >
                  {isAr ? 'عرض الكل' : 'Clear Search Query'}
                </button>
              </div>
            )}
          </div>
        </main>
      )}

      {/* Interactive Detail & Video Trailer Modal overlay */}
      {selectedMovie && (
        <MovieDetailModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          lang={lang}
        />
      )}

      {/* Footer Branding section */}
      <footer className="border-t border-gray-905 bg-cinema-gray py-12 px-4 relative z-20 font-sans" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 justify-between items-center text-center md:text-left">
          <div className="flex flex-col gap-2">
            <h4 className="text-lg font-bold font-display text-white">
              Classic<span className="text-brand-gold">Cinema</span>
            </h4>
            <p className="text-xs text-gray-500 max-w-sm leading-normal">
              {isAr 
                ? 'منصة روائع السينما الكلاسيكية - تكريمٌ للفن السابع وعباقرة الشاشة الفضية في الشرق والغرب.' 
                : 'Honoring the Seventh Art and the timeless giants of the silver screen across the Arab world and internationally.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 items-center justify-center text-xs text-gray-500 font-medium">
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>{isAr ? 'صنع بحب للسينما الخالدة' : 'Crafted with love for timeless cinema'}</span>
            </span>
            <span className="hidden sm:inline">|</span>
            <span className="text-brand-gold">© 2026 ClassicCinema</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
