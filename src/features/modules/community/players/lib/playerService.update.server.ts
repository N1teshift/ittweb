/**
 * Player Service - Update Operations (Server-Only)
 * 
 * Server-only functions for updating player statistics.
 * These functions use Firebase Admin SDK and should only be used in API routes.
 */

import { getFirestoreAdmin } from '@/features/infrastructure/api/firebase/admin';
import { createTimestampFactoryAsync, timestampToIso } from '@/features/infrastructure/utils';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import { upsertPlayerCategoryStats } from '../../standings/lib/playerCategoryStatsService.server';
import { normalizePlayerName } from './playerService.utils';
import {
  processPlayerStatsUpdate,
} from './playerService.updateHelpers';

const PLAYER_STATS_COLLECTION = 'playerStats';
const logger = createComponentLogger('playerService.update');

/**
 * Update player statistics after a game (Server-Only)
 */
export async function updatePlayerStats(gameId: string): Promise<void> {
  try {
    logger.info('Updating player stats', { gameId });

    const { getGameById } = await import('../../../game-management/games/lib/gameService.read.server');
    const game = await getGameById(gameId);
    if (!game || !game.players) {
      return;
    }

    // Convert datetime to ISO string once for all players (game.datetime can be Timestamp or string)
    const gameDatetimeString = timestampToIso(game.datetime);
    const gameDatetime = new Date(gameDatetimeString);

    const timestampFactory = await createTimestampFactoryAsync();
    const adminDb = getFirestoreAdmin();

    for (const player of game.players) {
      const normalizedName = normalizePlayerName(player.name);
      const playerRef = adminDb.collection(PLAYER_STATS_COLLECTION).doc(normalizedName);
      const playerDoc = await playerRef.get();

      await processPlayerStatsUpdate(
        player,
        game.category,
        gameDatetime,
        normalizedName,
        playerDoc.exists ? (playerDoc.data() as Record<string, unknown>) : null,
        timestampFactory,
        {
          setDoc: async (data: Record<string, unknown>) => {
            await playerRef.set(data);
          },
          updateDoc: async (data: Record<string, unknown>) => {
            await playerRef.update(data);
          },
        },
        upsertPlayerCategoryStats
      );
    }

    logger.info('Player stats updated', { gameId, playersUpdated: game.players.length });
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to update player stats', {
      component: 'playerService.update',
      operation: 'updatePlayerStats',
      gameId,
    });
    throw err;
  }
}

