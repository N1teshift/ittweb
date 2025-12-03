import type { StandingsResponse, StandingsFilters } from '../types';
import { createDataFetchHook } from '@/features/infrastructure/hooks';

const useStandingsHook = createDataFetchHook<StandingsResponse, StandingsFilters>({
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
  componentName: 'useStandings',
  operationName: 'fetchStandings',
});

interface UseStandingsResult {
  standings: StandingsResponse['standings'];
  loading: boolean;
  error: Error | null;
  total: number;
  page: number;
  hasMore: boolean;
  refetch: () => void | Promise<void>;
}

export function useStandings(filters: StandingsFilters = {}): UseStandingsResult {
  const { data, loading, error, refetch } = useStandingsHook(filters);
  
  return {
    standings: data?.standings ?? [],
    loading,
    error,
    total: data?.total ?? 0,
    page: data?.page ?? (filters.page || 1),
    hasMore: data?.hasMore ?? false,
    refetch,
  };
}



