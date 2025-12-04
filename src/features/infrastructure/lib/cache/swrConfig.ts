/**
 * SWR Configuration
 * 
 * Global configuration for SWR (stale-while-revalidate) data fetching.
 * Provides client-side caching, automatic revalidation, and error handling.
 */

import type { SWRConfiguration } from 'swr';

/**
 * Default SWR configuration
 * 
 * - revalidateOnFocus: false - Don't revalidate when window regains focus (reduce API calls)
 * - revalidateOnReconnect: true - Revalidate when network reconnects
 * - dedupingInterval: 2000 - Dedupe requests within 2 seconds
 * - errorRetryCount: 3 - Retry failed requests up to 3 times
 * - errorRetryInterval: 5000 - Wait 5 seconds between retries
 */
export const swrConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 2000,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  // Use fetch as the fetcher
  fetcher: async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    const data = await response.json();
    // Handle wrapped API response format
    return data.data || data;
  },
};

/**
 * SWR key factory for consistent cache keys
 */
export const swrKeys = {
  games: (filters?: Record<string, string>) => {
    const params = new URLSearchParams(filters);
    return `/api/games?${params.toString()}`;
  },
  game: (id: string) => `/api/games/${id}`,
  players: (limit?: number, lastPlayerName?: string) => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (lastPlayerName) params.append('lastPlayerName', lastPlayerName);
    return `/api/players?${params.toString()}`;
  },
  player: (name: string, filters?: Record<string, string>) => {
    const params = new URLSearchParams(filters);
    return `/api/players/${encodeURIComponent(name)}?${params.toString()}`;
  },
  standings: (filters?: Record<string, string>) => {
    const params = new URLSearchParams(filters);
    return `/api/standings?${params.toString()}`;
  },
  meta: (filters?: Record<string, string>) => {
    const params = new URLSearchParams(filters);
    return `/api/analytics/meta?${params.toString()}`;
  },
  classes: (className?: string, filters?: Record<string, string>) => {
    if (className) {
      const params = new URLSearchParams(filters);
      return `/api/classes/${encodeURIComponent(className)}?${params.toString()}`;
    }
    const params = new URLSearchParams(filters);
    return `/api/classes?${params.toString()}`;
  },
};


