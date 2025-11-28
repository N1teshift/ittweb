import { useState, useEffect } from 'react';
import type { PlayerProfile, PlayerSearchFilters } from '../types';

interface UsePlayerStatsResult {
  player: PlayerProfile | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function usePlayerStats(
  name: string,
  filters?: PlayerSearchFilters
): UsePlayerStatsResult {
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPlayer = async () => {
    if (!name) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (filters?.category) queryParams.append('category', filters.category);
      if (filters?.startDate) queryParams.append('startDate', filters.startDate);
      if (filters?.endDate) queryParams.append('endDate', filters.endDate);
      if (filters?.includeGames) queryParams.append('includeGames', 'true');

      const response = await fetch(`/api/players/${encodeURIComponent(name)}?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch player: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch player');
      }

      setPlayer(data.data as PlayerProfile);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, filters?.category, filters?.startDate, filters?.endDate, filters?.includeGames]);

  return {
    player,
    loading,
    error,
    refetch: fetchPlayer,
  };
}


