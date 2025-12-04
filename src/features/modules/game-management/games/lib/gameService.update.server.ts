/**
 * Game Service - Update Operations (Server-Only)
 * 
 * Server-only functions for updating games.
 * These functions use Firebase Admin SDK and should only be used in API routes.
 */

import { getFirestoreAdmin } from '@/features/infrastructure/api/firebase/admin';
import { logError } from '@/features/infrastructure/logging';
import { removeUndefined, createTimestampFactoryAsync } from '@/features/infrastructure/utils';
import { invalidateAnalyticsCache } from '@/features/infrastructure/lib/cache/analyticsCache.server';
import type { UpdateGame } from '../types';
import { updateEloScores } from '@/features/modules/game-management/lib/mechanics';

const GAMES_COLLECTION = 'games';

/**
 * Update a game (Server-Only)
 */
export async function updateGame(id: string, updates: UpdateGame): Promise<void> {
  try {
    const cleanedUpdates = removeUndefined(updates as unknown as Record<string, unknown>);
    const updateData: Record<string, unknown> = { ...cleanedUpdates };
    const timestampFactory = await createTimestampFactoryAsync();

    if (cleanedUpdates.datetime) {
      updateData.datetime = timestampFactory.fromDate(new Date(cleanedUpdates.datetime as string));
    }

    const adminDb = getFirestoreAdmin();
    await adminDb.collection(GAMES_COLLECTION).doc(id).update({
      ...updateData,
      updatedAt: timestampFactory.now(),
    });

    // Recalculate ELO if game result changed
    if (cleanedUpdates.players) {
      await updateEloScores(id);
    }

    // Invalidate analytics cache
    invalidateAnalyticsCache().catch(() => { });
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to update game', {
      component: 'gameService',
      operation: 'updateGame',
      id,
    });
    throw err;
  }
}

