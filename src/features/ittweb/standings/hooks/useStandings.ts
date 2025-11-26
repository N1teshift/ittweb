import { useState, useEffect } from 'react';
import type { StandingsResponse, StandingsFilters } from '../types';

interface UseStandingsResult {
  standings: StandingsResponse['standings'];
  loading: boolean;
  error: Error | null;
  total: number;
  page: number;
  hasMore: boolean;
  refetch: () => void;
}

export function useStandings(filters: StandingsFilters = {}): UseStandingsResult {
  const [standings, setStandings] = useState<StandingsResponse['standings']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(filters.page || 1);
  const [hasMore, setHasMore] = useState(false);

  const fetchStandings = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.minGames) queryParams.append('minGames', filters.minGames.toString());
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());

      const response = await fetch(`/api/standings?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch standings: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch standings');
      }

      const result = data.data as StandingsResponse;
      setStandings(result.standings);
      setTotal(result.total);
      setPage(result.page);
      setHasMore(result.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStandings();
  }, [filters.category, filters.minGames, filters.page, filters.limit]);

  return {
    standings,
    loading,
    error,
    total,
    page,
    hasMore,
    refetch: fetchStandings,
  };
}

