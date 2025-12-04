/**
 * Scheduled Game Service - Delete Operations (Server-Only)
 * 
 * Server-only functions for deleting scheduled games.
 * These functions use Firebase Admin SDK and should only be used in API routes.
 */

import { getFirestoreAdmin } from '@/features/infrastructure/api/firebase/admin';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import { createTimestampFactoryAsync } from '@/features/infrastructure/utils';

const GAMES_COLLECTION = 'games'; // Unified games collection (scheduled and completed)
const logger = createComponentLogger('scheduledGameService');

/**
 * Delete a scheduled game (Server-Only)
 */
export async function deleteScheduledGame(id: string): Promise<void> {
  try {
    logger.info('Deleting scheduled game', { id });

    const timestampFactory = await createTimestampFactoryAsync();
    const now = timestampFactory.now();
    
    const deleteData = {
      isDeleted: true,
      deletedAt: now,
      updatedAt: now,
    };

    const adminDb = getFirestoreAdmin();
    await adminDb.collection(GAMES_COLLECTION).doc(id).update(deleteData);

    logger.info('Scheduled game deleted', { id });
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to delete scheduled game', {
      component: 'scheduledGameService',
      operation: 'deleteScheduledGame',
      id,
    });
    throw err;
  }
}

