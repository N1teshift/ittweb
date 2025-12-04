/**
 * Player Category Stats Service - Server-Only Operations
 * 
 * Server-only functions for managing denormalized player category statistics.
 * These functions use Firebase Admin SDK and should only be used in API routes.
 */

import { getFirestoreAdmin } from '@/features/infrastructure/api/firebase/admin';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import { createTimestampFactoryAsync } from '@/features/infrastructure/utils';
import { normalizePlayerName } from '@/features/modules/community/players/lib/playerService.utils';
import type { PlayerCategoryStats } from '../types';
import type { GameCategory } from '../../../game-management/games/types';

const PLAYER_CATEGORY_STATS_COLLECTION = 'playerCategoryStats';
const logger = createComponentLogger('playerCategoryStatsService');

/**
 * Generate document ID for player category stats
 */
export function getPlayerCategoryStatsId(playerId: string, category: GameCategory): string {
  return `${playerId}_${category}`;
}

/**
 * Calculate win rate percentage
 */
function calculateWinRate(wins: number, games: number): number {
  if (games === 0) return 0;
  return Math.round((wins / games) * 100 * 100) / 100; // Round to 2 decimal places
}

/**
 * Update or create player category stats (Server-Only)
 * This should be called whenever player stats are updated for a category
 */
export async function upsertPlayerCategoryStats(
  playerId: string,
  playerName: string,
  category: GameCategory,
  stats: {
    wins: number;
    losses: number;
    draws: number;
    score: number;
    lastPlayed?: Date;
  }
): Promise<void> {
  try {
    const normalizedPlayerId = normalizePlayerName(playerId);
    const docId = getPlayerCategoryStatsId(normalizedPlayerId, category);
    const games = stats.wins + stats.losses + stats.draws;
    const winRate = calculateWinRate(stats.wins, games);

    const timestampFactory = await createTimestampFactoryAsync();
    const now = timestampFactory.now();
    
    const data: PlayerCategoryStats = {
      id: docId,
      playerId: normalizedPlayerId,
      playerName,
      category,
      wins: stats.wins,
      losses: stats.losses,
      draws: stats.draws,
      score: stats.score,
      games,
      winRate,
      lastPlayed: stats.lastPlayed
        ? timestampFactory.fromDate(stats.lastPlayed)
        : undefined,
      updatedAt: now,
    };

    const adminDb = getFirestoreAdmin();
    const docRef = adminDb.collection(PLAYER_CATEGORY_STATS_COLLECTION).doc(docId);
    await docRef.set(data, { merge: true });

    logger.debug('Updated player category stats', {
      docId,
      playerId: normalizedPlayerId,
      category,
      games,
    });
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to upsert player category stats', {
      component: 'playerCategoryStatsService',
      operation: 'upsertPlayerCategoryStats',
      playerId,
      category,
    });
    // Don't throw - this is a non-critical operation for standings optimization
    logger.warn('Failed to update denormalized stats, continuing...', {
      playerId,
      category,
      error: err.message,
    });
  }
}

/**
 * Delete player category stats document (Server-Only)
 * Use when a player's category stats should be removed
 */
export async function deletePlayerCategoryStats(
  playerId: string,
  category: GameCategory
): Promise<void> {
  try {
    const normalizedPlayerId = normalizePlayerName(playerId);
    const docId = getPlayerCategoryStatsId(normalizedPlayerId, category);

    const adminDb = getFirestoreAdmin();
    const docRef = adminDb.collection(PLAYER_CATEGORY_STATS_COLLECTION).doc(docId);
    await docRef.delete();

    logger.debug('Deleted player category stats', { docId, playerId: normalizedPlayerId, category });
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to delete player category stats', {
      component: 'playerCategoryStatsService',
      operation: 'deletePlayerCategoryStats',
      playerId,
      category,
    });
    // Don't throw - non-critical operation
  }
}

