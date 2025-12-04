/**
 * Example refactored hooks using createDataFetchHook
 * 
 * These examples show how to refactor existing hooks to use the generic factory.
 * These are reference implementations - actual hooks should be in their respective modules.
 */

import { createDataFetchHook, createSwrFetcher } from './useDataFetch';
import useSWR from 'swr';
import type { GameWithPlayers } from '@/features/modules/game-management/games/types';
import type { StandingsResponse, StandingsFilters } from '@/features/modules/community/standings/types';
import type { ItemData } from '@/types/items';
import { swrKeys } from '@/features/infrastructure/lib';

// ============================================================================
// Example 1: useGame (non-SWR, with cache-busting, handle404)
// ============================================================================

/**
 * Refactored useGame hook
 * 
 * Before: 75 lines of useState/useEffect boilerplate
 * After: ~15 lines using the factory
 */
export const useGameExample = createDataFetchHook<GameWithPlayers, string>({
  fetchFn: async (id: string) => {
    const url = `/api/games/${id}?t=${Date.now()}`;
    const response = await fetch(url);
    return response.json();
  },
  useSWR: false,
  enabled: (id) => !!id,
  dependencies: [], // Will be set by the hook based on params
  handle404: true,
  componentName: 'useGame',
  operationName: 'fetchGame',
});

// Usage:
// const { data: game, loading, error, refetch } = useGameExample(id);

// ============================================================================
// Example 2: useStandings (non-SWR, with query params)
// ============================================================================

/**
 * Refactored useStandings hook
 * 
 * Before: 79 lines
 * After: ~20 lines
 */
export const useStandingsExample = createDataFetchHook<
  StandingsResponse,
  StandingsFilters
>({
  fetchFn: async (filters) => {
    const queryParams = new URLSearchParams();
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.minGames) queryParams.append('minGames', filters.minGames.toString());
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());

    const response = await fetch(`/api/standings?${queryParams.toString()}`);
    return response.json();
  },
  useSWR: false,
  dependencies: [], // Will track filters automatically
  componentName: 'useStandings',
  operationName: 'fetchStandings',
});

// Usage:
// const { data, loading, error, refetch } = useStandingsExample(filters);
// const standings = data?.standings ?? [];
// const total = data?.total ?? 0;

// ============================================================================
// Example 3: useItemsDataSWR (SWR mode)
// ============================================================================

/**
 * Refactored useItemsDataSWR hook
 * 
 * Before: 75 lines
 * After: ~15 lines
 */
type ItemsApiResult = {
  items: ItemData[];
  meta: {
    total: number;
    buildingsTotal: number;
    count: number;
  };
};

export function useItemsDataSWRExample() {
  const { data, error, isLoading, mutate } = useSWR<ItemsApiResult, Error>(
    '/api/items',
    createSwrFetcher<ItemsApiResult>(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 600000, // 10 minutes
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

// ============================================================================
// Example 4: usePlayerStats (non-SWR, with complex params)
// ============================================================================

import type { PlayerProfile, PlayerSearchFilters } from '@/features/modules/community/players/types';

export const usePlayerStatsExample = createDataFetchHook<
  PlayerProfile,
  { name: string; filters?: PlayerSearchFilters }
>({
  fetchFn: async ({ name, filters }) => {
    const queryParams = new URLSearchParams();
    if (filters?.category) queryParams.append('category', filters.category);
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    if (filters?.includeGames) queryParams.append('includeGames', 'true');

    const response = await fetch(
      `/api/players/${encodeURIComponent(name)}?${queryParams.toString()}`
    );
    return response.json();
  },
  useSWR: false,
  enabled: ({ name }) => !!name,
  dependencies: [], // Will track name and filters
  componentName: 'usePlayerStats',
  operationName: 'fetchPlayer',
});

// Usage:
// const { data: player, loading, error, refetch } = usePlayerStatsExample({ name, filters });

// ============================================================================
// Example 5: useClassesData (SWR mode with dynamic key)
// ============================================================================

import type { ClassStats } from '@/features/modules/analytics-group/analytics/types';

export function useClassesDataExample(category?: string) {
  const key = swrKeys.classes(undefined, category ? { category } : undefined);
  
  const { data, error, isLoading, mutate } = useSWR<ClassStats[], Error>(
    key,
    createSwrFetcher<ClassStats[]>(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    classes: Array.isArray(data) ? data : [],
    isLoading,
    error: error as Error | null,
    refetch: mutate,
  };
}


