/**
 * Helper functions for useDataFetch hook
 * 
 * Provides common patterns for creating data fetching hooks with URL-based fetching.
 */

import { createDataFetchHook, type DataFetchConfig, type DataFetchResult } from './useDataFetch';
import type { ApiResponse } from '@/features/infrastructure/api';

/**
 * Create a data fetching hook from a URL pattern
 * 
 * @example
 * // Simple URL
 * const useGame = createUrlDataFetchHook<Game>('/api/games/:id', {
 *   useSWR: false,
 *   handle404: true
 * });
 * 
 * // With query params
 * const useStandings = createUrlDataFetchHook<StandingsResponse>('/api/standings', {
 *   useSWR: true,
 *   buildUrl: (params) => {
 *     const query = new URLSearchParams(params);
 *     return `/api/standings?${query.toString()}`;
 *   }
 * });
 */
export function createUrlDataFetchHook<TData, TParams = Record<string, unknown>>(
  urlPattern: string | ((params: TParams) => string),
  config: Omit<DataFetchConfig<TData, TParams>, 'fetchFn'> & {
    /**
     * Build the URL from params (alternative to urlPattern function)
     */
    buildUrl?: (params: TParams) => string;
    
    /**
     * Add cache-busting timestamp to URL
     */
    cacheBust?: boolean;
    
    /**
     * Fetch options
     */
    fetchOptions?: RequestInit;
  } = {}
): (params: TParams) => DataFetchResult<TData> {
  const {
    buildUrl,
    cacheBust = false,
    fetchOptions = {},
    ...restConfig
  } = config;

  const fetchFn = async (params: TParams): Promise<ApiResponse<TData>> => {
    let url: string;
    
    if (typeof urlPattern === 'function') {
      url = urlPattern(params);
    } else if (buildUrl) {
      url = buildUrl(params);
    } else {
      // Simple string replacement for :param patterns
      url = urlPattern.replace(/:(\w+)/g, (_, key) => {
        const value = (params as Record<string, unknown>)[key];
        if (value === undefined || value === null) {
          throw new Error(`Missing required parameter: ${key}`);
        }
        return encodeURIComponent(String(value));
      });
    }
    
    // Add cache-busting if enabled
    if (cacheBust) {
      const separator = url.includes('?') ? '&' : '?';
      const param = typeof cacheBust === 'string' ? cacheBust : 't';
      url = `${url}${separator}${param}=${Date.now()}`;
    }
    
    const response = await fetch(url, {
      ...fetchOptions,
      cache: fetchOptions.cache ?? 'no-store',
    });
    
    if (!response.ok) {
      // Try to parse error from response
      try {
        const errorData = await response.json() as ApiResponse<never>;
        if (errorData.error) {
          throw new Error(errorData.error);
        }
      } catch {
        // If parsing fails, use status text
      }
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    
    return await response.json() as ApiResponse<TData>;
  };

  return createDataFetchHook<TData, TParams>({
    ...restConfig,
    fetchFn,
  });
}


