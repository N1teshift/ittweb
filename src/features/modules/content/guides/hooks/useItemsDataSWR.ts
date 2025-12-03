/**
 * SWR-based hook for items data with client-side caching
 * 
 * This hook uses SWR for automatic caching, revalidation, and deduplication.
 * Static data like items changes infrequently, so SWR's caching is perfect.
 * 
 * Note: The existing `useItemsData` hook already has basic caching.
 * This SWR version provides better features like automatic revalidation and shared cache.
 */

import useSWR from 'swr';
import type { ItemData } from '@/types/items';
import { createSwrFetcher } from '@/features/infrastructure/hooks';

type ItemsMeta = {
  total: number;
  buildingsTotal: number;
  count: number;
  category?: string;
  query?: string;
};

type ItemsApiResult = {
  items: ItemData[];
  meta: ItemsMeta;
};

/**
 * Hook to fetch items data with SWR caching
 * 
 * Data is cached automatically by SWR and shared across components.
 * Revalidates based on SWR config (default: on reconnect, not on focus).
 * 
 * Benefits over useItemsData:
 * - Automatic cache sharing across components
 * - Background revalidation
 * - Better error handling and retry logic
 * - Deduplication of concurrent requests
 */
export function useItemsDataSWR() {
  const { data, error, isLoading, mutate } = useSWR<ItemsApiResult>(
    '/api/items',
    createSwrFetcher<ItemsApiResult>(),
    {
      // Static data - cache for longer
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      // Cache for 10 minutes (static data doesn't change often)
      dedupingInterval: 600000,
    }
  );

  return {
    items: data?.items ?? [],
    meta: data?.meta ?? { total: 0, buildingsTotal: 0, count: 0 },
    isLoading,
    error: error as Error | null,
    refetch: mutate,
  };
}


