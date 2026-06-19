/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Info, Calendar, Clock, Star, Film, Award } from 'lucide-react';
import { Movie } from '../types';

interface HeroProps {
  movie: Movie | null;
  lang: 'en' | 'ar';
  onPlayTrailer: (movie: Movie) => void;
  onOpenDetails: (movie: Movie) => void;
}

export default function Hero({ movie, lang, onPlayTrailer, onOpenDetails }: HeroProps) {
  if (!movie) return null;

  const isAr = lang === 'ar';
  const title = isAr ? movie.title_ar : movie.title_en;
  const overview = isAr ? movie.overview_ar : movie.overview_en;
  const director = isAr ? movie.director_ar : movie.director_en;

  // Render list of genres as inline tags
  const renderGenres = () => {
    return movie.genres.map((g, idx) => (
      <span 
        key={idx} 
        className="px-2.5 py-1 text-[10px] md:text-xs font-semibold rounded-full bg-brand-gold/10 text-brand-gold border border-brand-gold/20 backdrop-blur-sm"
      >
        {g}
      </span>
    ));
  };

  // Convert runtime (e.g. 180 to "3 hrs 0 mins" or Arabic "٣ ساعات")
  const formatRuntime = (mins?: number) => {
    if (!mins) return '';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (lang === 'ar') {
      return `${h} س و ${m} د`;
    }
    return `${h}h ${m}m`;
  };

  return (
    <div className="relative w-full h-[85vh] sm:h-[90vh] md:h-[95vh] flex items-end justify-center overflow-hidden grain">
      {/* Immersive backdrop background image with smooth multi-stops overlay gradients */}
      <div className="absolute inset-0 z-0">
        <img
          src={movie.backdrop_path || movie.poster_path}
          alt={movie.title_en}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-[1.03] transition-transform duration-1000 saturate-[0.85] contrast-105"
        />
        {/* Cinema spotlight vignette overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-black via-cinema-black/45 to-black/50"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-cinema-black/90 via-cinema-black/10 to-cinema-black/80"></div>
        
        {/* Subtle classic overlay lights */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-gold/5 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      </div>

      {/* Content wrapper */}
      <div 
        className="relative z-10 max-w-7xl w-full mx-auto px-4 md:px-8 pb-10 md:pb-20 text-white flex flex-col items-start gap-4 md:gap-6"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Vintage / Oscar Award Accent Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-gold text-cinema-black font-semibold text-[10px] md:text-xs rounded-full shadow-lg border border-brand-gold uppercase tracking-wider animate-bounce">
          <Award className="w-3.5 h-3.5" />
          <span>{isAr ? 'روائع كلاسيكية مختارة' : 'Cinema Masterpiece Selection'}</span>
        </div>

        {/* Hero Title with Display font */}
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight font-display text-white max-w-3xl leading-tight text-shadow-md">
          {title}
        </h2>

        {/* Movie Meta-Attributes Lane */}
        <div className="flex flex-wrap items-center gap-3 md:gap-5 text-gray-300 text-xs md:text-sm font-medium">
          <span className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-brand-gold fill-brand-gold" />
            <span className="text-brand-gold font-bold">{movie.vote_average.toFixed(1)}/10</span>
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-gray-600 block"></span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 opacity-75" />
            <span>{movie.release_date.split('-')[0]}</span>
          </span>
          {movie.runtime && (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-600 block"></span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 opacity-75" />
                <span>{formatRuntime(movie.runtime)}</span>
              </span>
            </>
          )}
          <span className="w-1.5 h-1.5 rounded-full bg-gray-600 block"></span>
          <span className="px-2 py-0.5 rounded bg-white/10 text-gray-200 text-[10px] font-bold uppercase tracking-widest border border-white/15">
            {movie.country}
          </span>
        </div>

        {/* Highlight director tag */}
        {director && (
          <p className="text-sm md:text-base text-brand-gold font-semibold flex items-center gap-1.5">
            <Film className="w-4 h-4" />
            <span>{isAr ? `إخراج: ${director}` : `Directed by: ${director}`}</span>
          </p>
        )}

        {/* Hero Movie Synopsis */}
        <p className="text-sm md:text-base text-gray-300/90 max-w-2xl leading-relaxed text-shadow">
          {overview}
        </p>

        {/* Interactive Genre Tags */}
        <div className="flex flex-wrap gap-2 pt-1">
          {renderGenres()}
        </div>

        {/* Actions Button Panel */}
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <button
            onClick={() => onPlayTrailer(movie)}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded bg-brand-gold text-cinema-black font-bold hover:bg-white transition-all transform hover:scale-105 active:scale-95 text-xs md:text-sm cursor-pointer shadow-[0_4px_20px_rgba(212,175,55,0.4)]"
          >
            <Play className="w-4 h-4 stroke-[3px] fill-cinema-black" />
            <span>{isAr ? 'عرض الإعلان الرسمي' : 'Play Official Trailer'}</span>
          </button>
          <button
            onClick={() => onOpenDetails(movie)}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded bg-cinema-charcoal/80 text-white hover:bg-cinema-charcoal hover:text-brand-gold border border-gray-700 hover:border-brand-gold transition-all transform hover:scale-105 active:scale-95 text-xs md:text-sm cursor-pointer"
          >
            <Info className="w-4 h-4" />
            <span>{isAr ? 'المزيد من التفاصيل' : 'More Information'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
