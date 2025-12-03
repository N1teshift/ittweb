import type { PlayerProfile, PlayerSearchFilters } from '../types';
import { createDataFetchHook } from '@/features/infrastructure/hooks';

interface UsePlayerStatsParams {
  name: string;
  filters?: PlayerSearchFilters;
}

const usePlayerStatsHook = createDataFetchHook<PlayerProfile, UsePlayerStatsParams>({
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
  componentName: 'usePlayerStats',
  operationName: 'fetchPlayer',
});

interface UsePlayerStatsResult {
  player: PlayerProfile | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void | Promise<void>;
}

export function usePlayerStats(
  name: string,
  filters?: PlayerSearchFilters
): UsePlayerStatsResult {
  const { data, loading, error, refetch } = usePlayerStatsHook({ name, filters });
  
  return {
    player: data,
    loading,
    error,
    refetch,
  };
}



