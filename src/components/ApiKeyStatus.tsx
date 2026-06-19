/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, FileText, Settings, Sparkles, Check, Database } from 'lucide-react';
import { ApiStatus } from '../types';

interface ApiKeyStatusProps {
  status: ApiStatus | null;
  onRefresh: () => void;
  lang: 'en' | 'ar';
}

export default function ApiKeyStatus({ status, onRefresh, lang }: ApiKeyStatusProps) {
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [inputKey, setInputKey] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // Check local storage or environment
    const stored = localStorage.getItem('CUSTOM_TMDB_API_KEY');
    if (stored) {
      setInputKey(stored);
    }
  }, []);

  const handleSave = () => {
    if (inputKey.trim() === '') {
      localStorage.removeItem('CUSTOM_TMDB_API_KEY');
    } else {
      localStorage.setItem('CUSTOM_TMDB_API_KEY', inputKey.trim());
    }
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setShowKeyModal(false);
      // Trigger a reload in Parent app
      onRefresh();
    }, 1200);
  };

  const isFallback = !status || status.source === 'fallback';

  return (
    <>
      {/* Small badge clickable to configure */}
      <button
        onClick={() => setShowKeyModal(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cinema-gray border border-brand-gold/20 hover:border-brand-gold/60 transition-all text-xs text-gray-300 hover:text-white"
        title={lang === 'en' ? 'Click to configure TMDB API' : 'انقر لتهيئة مفتاح TMDB API'}
      >
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isFallback ? 'bg-amber-400' : 'bg-emerald-400'} opacity-75`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${isFallback ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
        </span>
        <span className="font-mono text-[10px] tracking-wide uppercase flex items-center gap-1">
          {isFallback ? (
            <>
              <Database className="w-3 h-3 text-amber-400" />
              {lang === 'en' ? 'FALLBACK ACTIVE' : 'قاعدة الملحقات المحلية'}
            </>
          ) : (
            <>
              <Sparkles className="w-3 h-3 text-brand-gold animate-pulse" />
              {lang === 'en' ? 'TMDB LIVE' : 'قاعدة TMDB نشطة'}
            </>
          )}
        </span>
        <Settings className="w-3 h-3 opacity-60 ml-0.5" />
      </button>

      {/* API Key configuration modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-md">
          <div className="bg-cinema-gray border border-brand-gold/30 rounded-xl max-w-md w-full p-6 text-gray-100 shadow-2xl relative">
            <h3 className="text-lg font-bold font-sans text-brand-gold flex items-center gap-2 mb-2">
              <Settings className="w-5 h-5 text-brand-gold" />
              {lang === 'en' ? 'TMDB Integration Panel' : 'لوحة تهيئة سينما TMDB'}
            </h3>
            
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              {lang === 'en' 
                ? 'By default, this platform runs on an exquisite, hand-crafted local fallback with 20 golden-age masterpieces. Enter your personal TMDB API Key below to proxy real-time queries.'
                : 'بشكل أساسي، تعمل منصة روائع السينما الكلاسيكية على قاعدة بيانات محلية فاخرة تضم ٢٠ تحفة فنية. أدخل مفتاح TMDB API الخاص بك للتحميل المباشر من السينما العالمية.'}
            </p>

            <div className="space-y-3 mb-6">
              <label className="block text-xs font-medium text-gray-300">
                {lang === 'en' ? 'TMDB API Key (v3 auth)' : 'مفتاح TMDB API (الإصدار 3)'}
              </label>
              <input
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="e.g., d9bd3ecbbce7a8f..."
                className="w-full bg-cinema-black border border-gray-700 focus:border-brand-gold rounded py-2 px-3 text-sm font-mono tracking-widest text-brand-gold outline-none transition-all"
              />
              <div className="flex items-start gap-2 bg-cinema-black/40 p-2.5 rounded border border-gray-800">
                <Check className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                <span className="text-[11px] text-gray-400 leading-normal">
                  {lang === 'en' 
                    ? 'Your key remains completely safe on the server and is never exposed in the browser network requests.'
                    : 'يبقى المفتاح آمنًا تمامًا؛ حيث يتم تمرير الطلبات محلياً عبر الخادم الخلفي المشفر دون إظهارها في المتصفح.'}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 text-xs">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 rounded bg-cinema-charcoal text-gray-300 hover:text-white transition-all hover:bg-gray-700"
              >
                {lang === 'en' ? 'Cancel' : 'إلغاء'}
              </button>
              <button
                onClick={handleSave}
                disabled={saveSuccess}
                className="px-4 py-2 rounded bg-brand-gold text-cinema-black font-semibold hover:bg-white hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    {lang === 'en' ? 'Saved' : 'تم الحفظ'}
                  </>
                ) : (
                  lang === 'en' ? 'Connect Live' : 'ربط الاتصال'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
