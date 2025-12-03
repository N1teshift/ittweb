/**
 * Generic Data Fetching Hook Factory
 * 
 * Provides a reusable abstraction for data fetching hooks that supports:
 * - Both SWR and non-SWR (useState/useEffect) modes
 * - Standard API response format handling
 * - Consistent error handling and logging
 * - Conditional fetching
 * - Cache-busting
 * - Custom data transformation
 * 
 * @example
 * // SWR mode (recommended for static/cacheable data)
 * const useItems = createDataFetchHook<ItemsResponse>({
 *   fetchFn: async () => {
 *     const response = await fetch('/api/items');
 *     return response.json();
 *   },
 *   useSWR: true,
 *   swrKey: '/api/items',
 *   swrConfig: { dedupingInterval: 600000 }
 * });
 * 
 * @example
 * // Non-SWR mode (for dynamic data that needs cache-busting)
 * const useGame = createDataFetchHook<Game>({
 *   fetchFn: async (id: string) => {
 *     const response = await fetch(`/api/games/${id}?t=${Date.now()}`);
 *     return response.json();
 *   },
 *   useSWR: false,
 *   enabled: (id) => !!id,
 *   dependencies: [id]
 * });
 */

import { useState, useEffect, useCallback } from 'react';
import useSWR, { type SWRConfiguration, type Key } from 'swr';
import { logError } from '@/features/infrastructure/logging';
import type { ApiResponse } from '@/features/infrastructure/api';

/**
 * Configuration for data fetching hook
 */
export interface DataFetchConfig<TData, TParams = void> {
  /**
   * Function to fetch data
   * @param params - Parameters passed to the hook
   * @returns Promise resolving to API response or data
   */
  fetchFn: (params: TParams) => Promise<ApiResponse<TData> | TData>;
  
  /**
   * Whether to use SWR (recommended for cacheable data)
   * @default false
   */
  useSWR?: boolean;
  
  /**
   * SWR cache key (required if useSWR is true)
   * Can be a string, array, or function that returns a key
   */
  swrKey?: Key | ((params: TParams) => Key | null);
  
  /**
   * SWR configuration options
   */
  swrConfig?: SWRConfiguration<TData, Error>;
  
  /**
   * Whether fetching is enabled (for conditional fetching)
   * @default true
   */
  enabled?: boolean | ((params: TParams) => boolean);
  
  /**
   * Dependencies array for non-SWR mode (similar to useEffect deps)
   * Only used when useSWR is false
   */
  dependencies?: unknown[];
  
  /**
   * Transform the response data before returning
   */
  transform?: (data: TData) => TData;
  
  /**
   * Component name for logging
   */
  componentName?: string;
  
  /**
   * Operation name for logging
   */
  operationName?: string;
  
  /**
   * Handle 404 errors gracefully (return null instead of error)
   * @default false
   */
  handle404?: boolean;
  
  /**
   * Cache-busting query parameter name
   * If provided, adds ?t=timestamp to fetch requests
   */
  cacheBust?: boolean | string;
  
  /**
   * Initial data value
   */
  initialData?: TData | null;
}

/**
 * Result returned by data fetching hook
 */
export interface DataFetchResult<TData> {
  data: TData | null;
  loading: boolean;
  isLoading: boolean; // Alias for loading (for SWR compatibility)
  error: Error | null;
  refetch: () => void | Promise<void>;
}

/**
 * Create a data fetching hook
 */
export function createDataFetchHook<TData, TParams = void>(
  config: DataFetchConfig<TData, TParams>
) {
  const {
    fetchFn,
    useSWR: useSwrMode = false,
    swrKey,
    swrConfig = {},
    enabled = true,
    dependencies = [],
    transform,
    componentName = 'useDataFetch',
    operationName = 'fetchData',
    handle404 = false,
    initialData = null,
  } = config;

  return function useDataFetch(params: TParams): DataFetchResult<TData> {
    const isEnabled = typeof enabled === 'function' ? enabled(params) : enabled;

    // Always call all hooks unconditionally to satisfy React Hooks rules
    // SWR key - null when not in SWR mode or not enabled
    const swrKeyValue = useSwrMode
      ? (typeof swrKey === 'function' 
          ? (isEnabled ? swrKey(params) : null)
          : (isEnabled ? swrKey : null))
      : null;

    // SWR hook - always called, but disabled when not in SWR mode
    const swrResult = useSWR<TData, Error>(
      swrKeyValue,
      useSwrMode
        ? async () => {
            try {
              const response = await fetchFn(params);
              
              // Handle standard API response format
              if (response && typeof response === 'object' && 'success' in response) {
                const apiResponse = response as ApiResponse<TData>;
                if (!apiResponse.success) {
                  throw new Error(apiResponse.error || 'API request failed');
                }
                if (apiResponse.data === undefined) {
                  throw new Error('API response missing data');
                }
                return transform ? transform(apiResponse.data) : apiResponse.data;
              }
              
              // Assume response is already the data
              return transform ? transform(response as TData) : (response as TData);
            } catch (err) {
              const error = err instanceof Error ? err : new Error(String(err));
              logError(error, `Failed to fetch data`, {
                component: componentName,
                operation: operationName,
                params: JSON.stringify(params),
              });
              throw error;
            }
          }
        : null, // Disable SWR fetcher when not in SWR mode
      useSwrMode
        ? {
            ...swrConfig,
            fallbackData: initialData ?? undefined,
          }
        : { fallbackData: initialData ?? undefined }
    );

    // Non-SWR state hooks - always called, but only used when not in SWR mode
    const [nonSwrData, setNonSwrData] = useState<TData | null>(initialData ?? null);
    const [nonSwrLoading, setNonSwrLoading] = useState<boolean>(isEnabled && !useSwrMode);
    const [nonSwrError, setNonSwrError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
      if (!isEnabled || useSwrMode) {
        if (!useSwrMode) {
          setNonSwrLoading(false);
        }
        return;
      }

      try {
        setNonSwrLoading(true);
        setNonSwrError(null);

        const response = await fetchFn(params);
        
        // Handle standard API response format
        if (response && typeof response === 'object' && 'success' in response) {
          const apiResponse = response as ApiResponse<TData>;
          if (!apiResponse.success) {
            // Handle 404 gracefully if enabled
            if (handle404 && apiResponse.error?.includes('404')) {
              setNonSwrData(null);
              setNonSwrLoading(false);
              return;
            }
            throw new Error(apiResponse.error || 'API request failed');
          }
          if (apiResponse.data === undefined) {
            throw new Error('API response missing data');
          }
          const finalData = transform ? transform(apiResponse.data) : apiResponse.data;
          setNonSwrData(finalData);
        } else {
          // Assume response is already the data
          const finalData = transform ? transform(response as TData) : (response as TData);
          setNonSwrData(finalData);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        
        // Handle 404 gracefully if enabled
        if (handle404 && (error.message.includes('404') || error.message.includes('Not Found'))) {
          setNonSwrData(null);
          setNonSwrLoading(false);
          return;
        }
        
        logError(error, `Failed to fetch data`, {
          component: componentName,
          operation: operationName,
          params: JSON.stringify(params),
        });
        setNonSwrError(error);
      } finally {
        setNonSwrLoading(false);
      }
    }, [isEnabled, params]);

    useEffect(() => {
      if (!useSwrMode && isEnabled) {
        fetchData();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [useSwrMode, isEnabled, ...dependencies]);

    // Return appropriate result based on mode
    if (useSwrMode) {
      return {
        data: swrResult.data ?? initialData ?? null,
        loading: swrResult.isLoading ?? false,
        isLoading: swrResult.isLoading ?? false,
        error: swrResult.error as Error | null,
        refetch: () => {
          void swrResult.mutate();
        },
      };
    }

    return {
      data: nonSwrData,
      loading: nonSwrLoading,
      isLoading: nonSwrLoading,
      error: nonSwrError,
      refetch: fetchData,
    };
  };
}

/**
 * Create a standard API fetcher that handles the response format
 * 
 * @example
 * const fetcher = createApiFetcher<Game>('/api/games/123');
 * const game = await fetcher();
 */
export function createApiFetcher<TData>(
  url: string,
  options?: RequestInit
): () => Promise<ApiResponse<TData>> {
  return async () => {
    const response = await fetch(url, {
      ...options,
      cache: options?.cache ?? 'no-store',
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
    
    const data = await response.json() as ApiResponse<TData>;
    return data;
  };
}

/**
 * Create an SWR fetcher that handles the standard API response format
 * 
 * @example
 * const { data } = useSWR('/api/games/123', createSwrFetcher<Game>());
 */
export function createSwrFetcher<TData>(
  transform?: (data: TData) => TData
): (url: string) => Promise<TData> {
  return async (url: string) => {
    const response = await fetch(url, { cache: 'no-store' });
    
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
    
    const apiResponse = await response.json() as ApiResponse<TData>;
    
    if (!apiResponse.success) {
      throw new Error(apiResponse.error || 'API request failed');
    }
    
    if (apiResponse.data === undefined) {
      throw new Error('API response missing data');
    }
    
    return transform ? transform(apiResponse.data) : apiResponse.data;
  };
}

