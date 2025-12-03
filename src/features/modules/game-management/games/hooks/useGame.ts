import type { GameWithPlayers } from '../types';
import { createUrlDataFetchHook } from '@/features/infrastructure/hooks';

const useGameHook = createUrlDataFetchHook<GameWithPlayers, string>(
  (id: string) => `/api/games/${id}`,
  {
    useSWR: false,
    enabled: (id) => !!id,
    handle404: true,
    cacheBust: true,
    componentName: 'useGame',
    operationName: 'fetchGame',
  }
);

interface UseGameResult {
  game: GameWithPlayers | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void | Promise<void>;
}

export function useGame(id: string): UseGameResult {
  const { data, loading, error, refetch } = useGameHook(id);
  
  return {
    game: data,
    loading,
    error,
    refetch,
  };
}



