import type { GameWithPlayers } from '@/features/modules/game-management/games/types';

/**
 * Sync a game after server update
 */
export async function syncGameAfterUpdate(
  gameId: string,
  setLocalGames: React.Dispatch<React.SetStateAction<GameWithPlayers[]>>,
  markGameRecentlyUpdated: (gameId: string) => void
): Promise<void> {
  try {
    const gameResponse = await fetch(`/api/games/${gameId}?t=${Date.now()}`, {
      cache: 'no-store',
    });

    if (gameResponse.ok) {
      const gameData = await gameResponse.json();
      if (gameData.success && gameData.data) {
        markGameRecentlyUpdated(gameId);
        setLocalGames((prevGames) =>
          prevGames.map((game) =>
            game.id === gameId ? (gameData.data as GameWithPlayers) : game
          )
        );
      }
    }
  } catch (error) {
    // Error is logged by the caller
    throw error;
  }
}

/**
 * Create optimistic participant for join
 */
export function createOptimisticParticipant(
  discordId: string,
  name: string
): { discordId: string; name: string; joinedAt: string } {
  return {
    discordId,
    name,
    joinedAt: new Date().toISOString(),
  };
}



