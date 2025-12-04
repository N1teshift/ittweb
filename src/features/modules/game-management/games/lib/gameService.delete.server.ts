/**
 * Game Service - Delete Operations (Server-Only)
 * 
 * Server-only functions for deleting games.
 * These functions use Firebase Admin SDK and should only be used in API routes.
 */

import { getFirestoreAdmin } from '@/features/infrastructure/api/firebase/admin';
import { logError } from '@/features/infrastructure/logging';
import { invalidateAnalyticsCache } from '@/features/infrastructure/lib/cache/analyticsCache.server';

const GAMES_COLLECTION = 'games';

/**
 * Delete a game (Server-Only)
 */
export async function deleteGame(id: string): Promise<void> {
  try {
    const adminDb = getFirestoreAdmin();
    const gameRef = adminDb.collection(GAMES_COLLECTION).doc(id);

    // Delete all players in subcollection
    const playersSnapshot = await gameRef.collection('players').get();
    const deletePromises = playersSnapshot.docs.map((playerDoc) => playerDoc.ref.delete());
    await Promise.all(deletePromises);

    // Delete game document
    await gameRef.delete();

    // TODO: Rollback ELO changes

    // Invalidate analytics cache
    invalidateAnalyticsCache().catch(() => {});
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to delete game', {
      component: 'gameService',
      operation: 'deleteGame',
      id,
    });
    throw err;
  }
}

