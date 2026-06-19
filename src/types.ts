/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Movie {
  id: string | number;
  title_en: string;
  title_ar: string;
  overview_en: string;
  overview_ar: string;
  release_date: string;
  poster_path: string; // Dynamic path or complete URL
  backdrop_path: string; // Dynamic path or complete URL
  vote_average: number;
  runtime?: number; // movie duration in minutes
  genres: string[];
  youtube_id: string; // Official trailer ID
  country: string;
  category: 'arabic_classics' | 'international_golden_age' | 'classic_hollywood' | 'documentaries_silent';
  director_en?: string;
  director_ar?: string;
  cast_en?: string[];
  cast_ar?: string[];
}

export interface ApiStatus {
  connected: boolean;
  source: 'tmdb' | 'fallback';
  message: string;
}
