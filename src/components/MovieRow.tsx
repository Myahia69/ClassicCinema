/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Star, Play, Film } from 'lucide-react';
import { Movie } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface MovieRowProps {
  title: string;
  movies: Movie[];
  lang: 'en' | 'ar';
  onMovieClick: (movie: Movie) => void;
  onPlayTrailer: (movie: Movie) => void;
  className?: string;
}

export default function MovieRow({ title, movies, lang, onMovieClick, onPlayTrailer, className }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  if (movies.length === 0) return null;

  const handleScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setShowLeftArrow(scrollLeft > 10);
      // Let's account for floating point errors in some browsers
      setShowRightArrow(scrollWidth - scrollLeft - clientWidth > 15);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { clientWidth } = rowRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const isAr = lang === 'ar';

  return (
    <div className={className || "relative my-8 px-4 md:px-8 group/row"}>
      {/* Category Header */}
      <h3 className="text-lg md:text-2xl font-bold font-sans text-gray-100 mb-4 tracking-wide flex items-center gap-2">
        <span className="w-1.5 h-6 rounded bg-brand-gold"></span>
        {title}
      </h3>

      {/* Row Wrapper with arrows */}
      <div className="relative">
        {/* Left Arrow Button */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-[-15px] md:left-[-25px] top-1/2 -translate-y-1/2 z-30 bg-cinema-black/85 border border-brand-gold/30 text-brand-gold w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center hover:bg-brand-gold hover:text-black transition-all cursor-pointer opacity-0 group-hover/row:opacity-100 shadow-[0_0_15px_rgba(0,0,0,0.7)]"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>
        )}

        {/* Right Arrow Button */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-[-15px] md:right-[-25px] top-1/2 -translate-y-1/2 z-30 bg-cinema-black/85 border border-brand-gold/30 text-brand-gold w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center hover:bg-brand-gold hover:text-black transition-all cursor-pointer opacity-0 group-hover/row:opacity-100 shadow-[0_0_15px_rgba(0,0,0,0.7)]"
          >
            <ChevronRight className="w-6 h-6 stroke-[2.5]" />
          </button>
        )}

        {/* Horizontal Scrolling Lane */}
        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto overflow-y-hidden py-4 px-1 no-scrollbar select-none snap-x"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          {movies.map((movie) => {
            const movieTitle = isAr ? movie.title_ar : movie.title_en;
            const movieYear = movie.release_date ? movie.release_date.split('-')[0] : '';
            
            return (
              <motion.div
                key={movie.id}
                whileHover={{ scale: 1.05, y: -4 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="relative shrink-0 w-[140px] sm:w-[180px] md:w-[220px] rounded-lg bg-cinema-gray border border-gray-800/60 overflow-hidden cursor-pointer shadow-lg group snap-start"
              >
                {/* Clicking on the cover opens movie details modal */}
                <div onClick={() => onMovieClick(movie)} className="relative aspect-[2/3] w-full overflow-hidden bg-cinema-black/30">
                  {movie.poster_path ? (
                    <img
                      src={movie.poster_path}
                      alt={movie.title_en}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-95 group-hover:scale-105"
                      onError={(e) => {
                        // Safe image fallback
                        (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/400x600/161719/D4AF37?text=Classic+Cinema';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-tr from-cinema-gray to-cinema-black border border-gray-800 text-center">
                      <Film className="w-8 h-8 text-brand-gold opacity-50 mb-2" />
                      <span className="text-[10px] text-gray-400 font-bold tracking-tight">{movieTitle}</span>
                    </div>
                  )}

                  {/* Play Button Overlay on Card Hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-1.5 p-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Avoid opening details
                        onPlayTrailer(movie);
                      }}
                      className="w-10 h-10 rounded-full bg-brand-gold text-cinema-black flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-[0_0_15px_rgba(212,175,55,0.4)] cursor-pointer"
                      title={isAr ? 'تشغيل الإعلان' : 'Play Trailer'}
                    >
                      <Play className="w-4 h-4 fill-cinema-black stroke-[3px]" />
                    </button>
                  </div>

                  {/* Top-Right Mini Rating Badge */}
                  <div className="absolute top-2 right-2 bg-cinema-black/85 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] md:text-xs text-brand-gold font-bold border border-brand-gold/20 flex items-center gap-1 shadow">
                    <Star className="w-3 h-3 text-brand-gold fill-brand-gold" />
                    <span>{movie.vote_average ? movie.vote_average.toFixed(1) : 'G'}</span>
                  </div>
                </div>

                {/* Card footer description */}
                <div onClick={() => onMovieClick(movie)} className="p-2.5 md:p-3 flex flex-col gap-0.5 text-left select-none">
                  <h4 className="text-gray-100 font-bold text-xs md:text-sm line-clamp-1 group-hover:text-brand-gold transition-colors">
                    {movieTitle}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] md:text-xs text-gray-400">
                    <span>{movieYear}</span>
                    <span className="px-1.5 py-0.5 rounded bg-cinema-charcoal text-[8px] md:text-[9px] font-medium tracking-wide uppercase border border-gray-800">
                      {movie.country}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
