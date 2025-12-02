import type { GameWithPlayers } from '@/features/modules/game-management/games/types';
import { syncGameAfterUpdate } from './gameOptimisticUpdates';
import { createComponentLogger } from '@/features/infrastructure/logging';

const logger = createComponentLogger('gameEditUtils');

interface GameEditUpdates {
  teamSize: string;
  customTeamSize?: string;
  gameType: string;
  gameVersion?: string;
  gameLength?: number;
  modes: string[];
}

/**
 * Submit game edit with optimistic updates
 */
export async function submitGameEdit(
  gameId: string,
  updates: GameEditUpdates,
  localGames: GameWithPlayers[],
  setLocalGames: React.Dispatch<React.SetStateAction<GameWithPlayers[]>>,
  markGameRecentlyUpdated: (gameId: string) => void
): Promise<void> {
  const gameToUpdate = localGames.find((g) => g.id === gameId);
  if (!gameToUpdate) {
    throw new Error('Game not found');
  }

  // Optimistic update
  const optimisticGame = {
    ...gameToUpdate,
    ...updates,
    customTeamSize: updates.teamSize === 'custom' ? updates.customTeamSize : undefined,
  };

  setLocalGames((prevGames) =>
    prevGames.map((game) =>
      game.id === gameId ? (optimisticGame as GameWithPlayers) : game
    )
  );

  try {
    const response = await fetch(`/api/games/${gameId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update game');
    }

    markGameRecentlyUpdated(gameId);

    // Sync with server
    try {
      await syncGameAfterUpdate(gameId, setLocalGames, markGameRecentlyUpdated);
    } catch (fetchError) {
      logger.warn('Error syncing game after edit', { gameId, error: fetchError });
    }
  } catch (err) {
    // Revert optimistic update
    setLocalGames((prevGames) =>
      prevGames.map((game) => (game.id === gameId ? gameToUpdate : game))
    );
    throw err;
  }
}



