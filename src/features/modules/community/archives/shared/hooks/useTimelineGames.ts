import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { Game, GameWithPlayers } from '@/features/modules/game-management/games/types';
import { createComponentLogger } from '@/features/infrastructure/logging';

const logger = createComponentLogger('useTimelineGames');

interface UseTimelineGamesProps {
  games: Game[];
  gamesLoading: boolean;
  gamesError: Error | null;
  refetchGames: () => void | Promise<void>;
}

interface UseTimelineGamesReturn {
  localGames: GameWithPlayers[];
  setLocalGames: React.Dispatch<React.SetStateAction<GameWithPlayers[]>>;
  gamesMap: Map<string, GameWithPlayers>;
  addNewGame: (gameId: string) => Promise<void>;
  markGameRecentlyUpdated: (gameId: string) => void;
}

/**
 * Hook for managing game state in timeline with optimistic updates
 */
export function useTimelineGames({
  games,
  gamesLoading,
  gamesError,
  refetchGames,
}: UseTimelineGamesProps): UseTimelineGamesReturn {
  const [localGames, setLocalGames] = useState<GameWithPlayers[]>([]);
  const recentlyUpdatedGamesRef = useRef<Set<string>>(new Set());

  // Sync localGames with games from hook, but preserve optimistic updates
  useEffect(() => {
    if (games && games.length > 0) {
      setLocalGames((prevLocalGames: GameWithPlayers[]) => {
        if (prevLocalGames.length === 0) {
          logger.debug('Initializing localGames from games', { gamesCount: games.length });
          return games as GameWithPlayers[];
        }

        // Merge: use games as base, but keep optimistic updates from localGames
        const merged = games.map((game) => {
          const localGame = prevLocalGames.find((lg) => lg.id === game.id);

          // If this game was recently updated from server, keep the local version
          if (recentlyUpdatedGamesRef.current.has(game.id)) {
            return localGame || (game as GameWithPlayers);
          }

          // If we have a local game and it's a scheduled game, check if participants differ
          if (localGame && game.gameState === 'scheduled') {
            const localParticipants = localGame.participants || [];
            const serverParticipants = game.participants || [];

            if (localParticipants.length !== serverParticipants.length) {
              return localGame;
            }

            // If participant IDs differ, keep the local version
            const localIds = new Set(localParticipants.map((p) => p.discordId));
            const serverIds = new Set(serverParticipants.map((p) => p.discordId));
            if (
              localIds.size !== serverIds.size ||
              [...localIds].some((id) => !serverIds.has(id)) ||
              [...serverIds].some((id) => !localIds.has(id))
            ) {
              return localGame;
            }
          }
          return game as GameWithPlayers;
        });

        return merged as GameWithPlayers[];
      });
    }
  }, [games]);

  // Debug: Log games to console
  useEffect(() => {
    if (games && games.length > 0) {
      logger.debug('Games fetched for timeline', {
        total: games.length,
        scheduled: games.filter((g) => g.gameState === 'scheduled').length,
        completed: games.filter((g) => g.gameState === 'completed').length,
      });
    } else if (!gamesLoading && gamesError) {
      logger.warn('Failed to fetch games for timeline', { gamesError: gamesError.message });
    }
  }, [games, gamesLoading, gamesError]);

  // Mark a game as recently updated to prevent sync from overwriting
  const markGameRecentlyUpdated = useCallback((gameId: string) => {
    recentlyUpdatedGamesRef.current.add(gameId);
    setTimeout(() => {
      recentlyUpdatedGamesRef.current.delete(gameId);
    }, 5000);
  }, []);

  // Function to add a newly created game to localGames
  const addNewGame = useCallback(
    async (gameId: string) => {
      if (!gameId) {
        const refetchResult = refetchGames();
        if (refetchResult instanceof Promise) {
          await refetchResult;
        }
        return;
      }

      try {
        const gameResponse = await fetch(`/api/games/${gameId}?t=${Date.now()}`, {
          cache: 'no-store',
        });

        if (gameResponse.ok) {
          const gameData = await gameResponse.json();
          if (gameData.success && gameData.data) {
            markGameRecentlyUpdated(gameId);

            setLocalGames((prevGames) => {
              if (prevGames.some((g) => g.id === gameId)) {
                return prevGames.map((game) =>
                  game.id === gameId ? (gameData.data as GameWithPlayers) : game
                );
              }
              return [gameData.data as GameWithPlayers, ...prevGames];
            });
          }
        }
      } catch (error) {
        logger.warn('Failed to fetch new game after creation', { gameId, error });
        const refetchResult = refetchGames();
        if (refetchResult instanceof Promise) {
          await refetchResult;
        }
      }
    },
    [refetchGames, markGameRecentlyUpdated]
  );

  // Create a Map of game ID to game data for direct lookup
  const gamesMap = useMemo(() => {
    const map = new Map<string, GameWithPlayers>();
    localGames.forEach((game) => {
      map.set(game.id, game);
    });
    return map;
  }, [localGames]);

  return {
    localGames,
    setLocalGames,
    gamesMap,
    addNewGame,
    markGameRecentlyUpdated,
  };
}



