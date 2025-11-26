import { useState, useEffect } from 'react';
import type { Game, GameFilters, GameListResponse } from '../types';

interface UseGamesResult {
  games: Game[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  nextCursor?: string;
  refetch: () => void;
}

export function useGames(filters: GameFilters = {}): UseGamesResult {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();

  const fetchGames = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.player) queryParams.append('player', filters.player);
      if (filters.ally) queryParams.append('ally', filters.ally);
      if (filters.enemy) queryParams.append('enemy', filters.enemy);
      if (filters.teamFormat) queryParams.append('teamFormat', filters.teamFormat);
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.cursor) queryParams.append('cursor', filters.cursor);

      const response = await fetch(`/api/games?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch games: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch games');
      }

      const result = data.data as GameListResponse;
      setGames(result.games);
      setHasMore(result.hasMore);
      setNextCursor(result.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, [
    filters.startDate,
    filters.endDate,
    filters.category,
    filters.player,
    filters.ally,
    filters.enemy,
    filters.teamFormat,
    filters.page,
    filters.limit,
  ]);

  return {
    games,
    loading,
    error,
    hasMore,
    nextCursor,
    refetch: fetchGames,
  };
}


