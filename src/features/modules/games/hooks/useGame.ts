import { useState, useEffect } from 'react';
import type { GameWithPlayers } from '../types';
import { logError } from '@/features/infrastructure/logging';

interface UseGameResult {
  game: GameWithPlayers | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useGame(id: string): UseGameResult {
  const [game, setGame] = useState<GameWithPlayers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGame = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/games/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch game: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch game');
      }

      setGame(data.data as GameWithPlayers);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      logError(error, 'Failed to fetch game', {
        component: 'useGame',
        operation: 'fetchGame',
        gameId: id,
      });
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return {
    game,
    loading,
    error,
    refetch: fetchGame,
  };
}


