/**
 * SWR-based hook for classes data with client-side caching
 * 
 * This hook uses SWR for automatic caching, revalidation, and deduplication.
 * Class statistics change infrequently, so SWR's caching is perfect.
 */

import useSWR from 'swr';
import type { ClassStats } from '@/features/modules/analytics-group/analytics/types';
import { swrKeys } from '@/features/infrastructure/lib';

/**
 * Custom fetcher for classes API that handles the response format (returns array)
 */
async function fetcherArray(url: string): Promise<ClassStats[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch classes: ${response.statusText}`);
  }
  const apiResponse = await response.json() as { success: boolean; data: ClassStats[] | ClassStats };
  if (!apiResponse.success || !apiResponse.data) {
    throw new Error('Invalid API response format');
  }
  // Ensure we always return an array
  return Array.isArray(apiResponse.data) ? apiResponse.data : [apiResponse.data];
}

/**
 * Custom fetcher for single class API that handles the response format (returns single object)
 */
async function fetcherSingle(url: string): Promise<ClassStats> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch class: ${response.statusText}`);
  }
  const apiResponse = await response.json() as { success: boolean; data: ClassStats[] | ClassStats };
  if (!apiResponse.success || !apiResponse.data) {
    throw new Error('Invalid API response format');
  }
  // Return single object (not array)
  return Array.isArray(apiResponse.data) ? apiResponse.data[0] : apiResponse.data;
}

/**
 * Hook to fetch classes data with SWR caching
 * 
 * @param category - Optional category filter (1v1, 2v2, etc.)
 * @returns Classes data with loading and error states
 */
export function useClassesData(category?: string) {
  const key = swrKeys.classes(undefined, category ? { category } : undefined);
  
  const { data, error, isLoading, mutate } = useSWR<ClassStats[], Error>(
    key,
    fetcherArray,
    {
      // Static data - cache for longer
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      // Cache for 5 minutes (matches API cache)
      dedupingInterval: 300000,
    }
  );

  return {
    classes: Array.isArray(data) ? data : [],
    isLoading,
    error: error as Error | null,
    refetch: mutate,
  };
}

/**
 * Hook to fetch single class data with SWR caching
 * 
 * @param className - Class name to fetch
 * @param category - Optional category filter
 * @returns Class data with loading and error states
 */
export function useClassData(className: string, category?: string) {
  const key = className ? swrKeys.classes(className, category ? { category } : undefined) : null;
  
  const { data, error, isLoading, mutate } = useSWR<ClassStats, Error>(
    key,
    key ? fetcherSingle : null,
    {
      // Static data - cache for longer
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      // Cache for 5 minutes (matches API cache)
      dedupingInterval: 300000,
    }
  );

  return {
    classData: (data && !Array.isArray(data)) ? data : null,
    isLoading,
    error: error as Error | null,
    refetch: mutate,
  };
}


