/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { X, Calendar, Clock, Star, Film, Award, MapPin, Sparkles, User, Globe } from 'lucide-react';
import { Movie } from '../types';

interface MovieDetailModalProps {
  movie: Movie | null;
  onClose: () => void;
  lang: 'en' | 'ar';
}

export default function MovieDetailModal({ movie, onClose, lang }: MovieDetailModalProps) {
  if (!movie) return null;

  // Listen to keyboard ESC to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const isAr = lang === 'ar';
  const title = isAr ? movie.title_ar : movie.title_en;
  const overview = isAr ? movie.overview_ar : movie.overview_en;
  const director = isAr ? movie.director_ar : movie.director_en;
  const cast = isAr ? movie.cast_ar : movie.cast_en;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      {/* Modal Wrapper Frame */}
      <div
        className="relative bg-cinema-gray border border-brand-gold/30 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto leading-relaxed text-gray-200 flex flex-col grain"
        onClick={(e) => e.stopPropagation()} // Stop propagation from closing
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Absolute Close Hammer Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 ${isAr ? 'left-4' : 'right-4'} z-50 bg-black/70 hover:bg-brand-gold text-white hover:text-cinema-black w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer border border-white/10 hover:border-brand-gold/80`}
          title={isAr ? 'إغلاق' : 'Close Modal'}
        >
          <X className="w-5 h-5 shrink-0" />
        </button>

        {/* Dynamic High-Quality Trailer Section (YouTube embed aspect ratios) */}
        <div className="relative aspect-video w-full bg-black/80">
          {movie.youtube_id ? (
            <iframe
              src={`https://www.youtube.com/embed/${movie.youtube_id}?autoplay=1&modestbranding=1&rel=0`}
              title={`${movie.title_en} - Official Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="no-referrer"
              allowFullScreen
              className="w-full h-full border-none shadow-inner"
            ></iframe>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-t from-cinema-gray to-cinema-black text-center p-8">
              <Film className="w-16 h-16 text-brand-gold/40 mb-3 animate-pulse" />
              <p className="text-sm text-gray-400 font-bold max-w-sm">
                {isAr 
                  ? 'لم يتم العثور على مقطع رسمي مباشر على يوتيوب لهذا الفيلم الكلاسيكي.' 
                  : 'Official trailer link pending. Showing movie metadata description.'}
              </p>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-cinema-gray to-transparent pointer-events-none"></div>
        </div>

        {/* Detailed Description Grid */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Main Titles */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {movie.vote_average && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-brand-gold/15 border border-brand-gold/30 text-xs text-brand-gold font-bold">
                  <Star className="w-3.5 h-3.5 fill-brand-gold" />
                  <span>{movie.vote_average.toFixed(1)} TMDB Rating</span>
                </div>
              )}
              <span className="px-2.5 py-1 text-xs font-semibold rounded bg-cinema-charcoal text-gray-300 border border-gray-800">
                {movie.release_date ? movie.release_date.split('-')[0] : 'Classic'}
              </span>
              <span className="px-2.5 py-1 text-xs font-semibold rounded bg-cinema-charcoal text-gray-300 border border-gray-800 flex items-center gap-1">
                <Glob className="w-3.5 h-3.5 text-brand-gold/80" />
                <span>{movie.country}</span>
              </span>
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-white font-display mt-2 leading-tight">
              {title}
            </h3>
            {/* Show alternative secondary language title for academic richness */}
            <p className="text-xs md:text-sm text-brand-gold/80 italic font-medium">
              {isAr ? movie.title_en : movie.title_ar}
            </p>
          </div>

          {/* Synopsis */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-gold" />
              <span>{isAr ? 'عن التحفة السينمائية' : 'About the Masterpiece'}</span>
            </h4>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed font-sans pt-1">
              {overview}
            </p>
          </div>

          <hr className="border-gray-800/60" />

          {/* Technical Info & Cast list columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            {/* Left side: Credentials */}
            <div className="space-y-4">
              {director && (
                <div className="flex items-start gap-3">
                  <Film className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      {isAr ? 'المخرج المبدع' : 'Director / Artist'}
                    </h5>
                    <p className="text-gray-200 font-semibold text-sm pt-0.5">{director}</p>
                  </div>
                </div>
              )}

              {movie.runtime && (
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      {isAr ? 'مدة العرض' : 'Duration'}
                    </h5>
                    <p className="text-gray-200 font-semibold text-sm pt-0.5">
                      {movie.runtime} {isAr ? 'دقيقة' : 'minutes'}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    {isAr ? 'تاريخ الإصدار الأولي' : 'Initial Release Date'}
                  </h5>
                  <p className="text-gray-200 font-semibold text-sm pt-0.5">{movie.release_date}</p>
                </div>
              </div>
            </div>

            {/* Right side: Lead Cast */}
            {cast && cast.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-brand-gold shrink-0" />
                  <span>{isAr ? 'طاقم العمل والتمثيل الرئيسي' : 'Lead Cast & Protagonists'}</span>
                </h5>
                <div className="flex flex-wrap gap-2 pt-1">
                  {cast.map((actor, idx) => (
                    <span 
                      key={idx}
                      className="px-2.5 py-1 bg-cinema-charcoal rounded text-xs text-gray-300 border border-gray-800"
                    >
                      {actor}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple typo correction helper for Globe component rendering
function Glob({ className }: { className?: string }) {
  return <Globe className={className} />;
}
