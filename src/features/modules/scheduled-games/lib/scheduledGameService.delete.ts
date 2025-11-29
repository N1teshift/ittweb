import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { getFirestoreInstance } from '@/features/infrastructure/api/firebase';
import { getFirestoreAdmin, isServerSide, getAdminTimestamp } from '@/features/infrastructure/api/firebase/admin';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';

const GAMES_COLLECTION = 'games'; // Unified games collection (scheduled and completed)
const logger = createComponentLogger('scheduledGameService');

/**
 * Delete a scheduled game
 */
export async function deleteScheduledGame(id: string): Promise<void> {
  try {
    logger.info('Deleting scheduled game', { id });

    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      // Delete from unified games collection (soft delete)
      await adminDb.collection(GAMES_COLLECTION).doc(id).update({
        isDeleted: true,
        deletedAt: getAdminTimestamp().now(),
        updatedAt: getAdminTimestamp().now(),
      });
    } else {
      const db = getFirestoreInstance();
      const docRef = doc(db, GAMES_COLLECTION, id);
      // Soft delete from unified games collection
      await updateDoc(docRef, {
        isDeleted: true,
        deletedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }

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

