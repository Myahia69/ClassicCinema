/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, Globe, Film, Sparkles } from 'lucide-react';
import ApiKeyStatus from './ApiKeyStatus';
import { ApiStatus } from '../types';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  lang: 'en' | 'ar';
  setLang: (lang: 'en' | 'ar') => void;
  apiStatus: ApiStatus | null;
  onRefreshApi: () => void;
}

export default function Header({
  searchQuery,
  setSearchQuery,
  lang,
  setLang,
  apiStatus,
  onRefreshApi
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled 
          ? 'bg-cinema-black/95 backdrop-blur-md border-b border-gray-800/40 shadow-xl py-3' 
          : 'bg-gradient-to-b from-black/80 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col sm:flex-row gap-4 sm:gap-2 items-center justify-between">
        {/* Brand Logo Group */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded bg-brand-gold text-cinema-black shadow-[0_0_15px_rgba(212,175,55,0.3)] shrink-0">
            <Film className="w-5 h-5 animate-spin-slow text-cinema-black" />
            <div className="absolute inset-0.5 border border-cinema-black rounded opacity-40"></div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-1.5 font-display">
              Classic<span className="text-brand-gold">Cinema</span>
            </h1>
            <span className="text-[10px] md:text-xs text-brand-gold/85 font-sans leading-none font-medium text-right sm:text-left">
              روائع السينما الكلاسيكية
            </span>
          </div>
        </div>

        {/* Search & Dynamic Status Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
          {/* Search bar */}
          <div className="relative w-full max-w-xs focus-within:scale-[1.02] transition-transform duration-200">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'en' ? 'Search classic films...' : 'ابحث عن فيلم كلاسيكي عريق...'}
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
              className="w-full bg-cinema-gray/90 hover:bg-cinema-gray border border-gray-700/60 focus:border-brand-gold/80 rounded-full py-2 pl-4 pr-10 focus:outline-none focus:ring-1 focus:ring-brand-gold/30 text-xs md:text-sm text-gray-200 placeholder-gray-500 transition-all shadow-inner"
            />
            <Search className={`absolute w-4 h-4 text-gray-400 pointer-events-none top-1/2 -translate-y-1/2 ${lang === 'ar' ? 'left-3' : 'right-3'}`} />
          </div>

          {/* TMDB Connection Indicator */}
          <ApiKeyStatus status={apiStatus} onRefresh={onRefreshApi} lang={lang} />

          {/* Language Switcher Button */}
          <button
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cinema-charcoal/80 border border-gray-700/60 hover:bg-brand-gold hover:text-cinema-black text-gray-300 hover:border-brand-gold transition-all text-xs font-medium cursor-pointer"
            title={lang === 'en' ? 'تغيير اللغة إلى العربية' : 'Switch connection to English'}
          >
            <Globe className="w-3.5 h-3.5 shrink-0" />
            <span>{lang === 'en' ? 'العربية' : 'English'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
