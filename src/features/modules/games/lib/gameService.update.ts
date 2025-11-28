import {
  doc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { getFirestoreInstance } from '@/features/infrastructure/api/firebase';
import { getFirestoreAdmin, isServerSide, getAdminTimestamp } from '@/features/infrastructure/api/firebase/admin';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import { removeUndefined } from '@/features/infrastructure/utils/objectUtils';
import type { UpdateGame } from '../types';
import { updateEloScores } from './eloCalculator';

const GAMES_COLLECTION = 'games';
const logger = createComponentLogger('gameService');

/**
 * Update a game
 */
export async function updateGame(id: string, updates: UpdateGame): Promise<void> {
  try {
    // Reduced logging verbosity

    const cleanedUpdates = removeUndefined(updates as unknown as Record<string, unknown>);
    const updateData: Record<string, unknown> = { ...cleanedUpdates };

    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      const adminTimestamp = getAdminTimestamp();

      if (cleanedUpdates.datetime) {
        updateData.datetime = adminTimestamp.fromDate(new Date(cleanedUpdates.datetime as string));
      }

      await adminDb.collection(GAMES_COLLECTION).doc(id).update({
        ...updateData,
        updatedAt: adminTimestamp.now(),
      });

      // Recalculate ELO if game result changed
      if (cleanedUpdates.players) {
        await updateEloScores(id);
      }
    } else {
      const db = getFirestoreInstance();
      const docRef = doc(db, GAMES_COLLECTION, id);

      if (cleanedUpdates.datetime) {
        updateData.datetime = Timestamp.fromDate(new Date(cleanedUpdates.datetime as string));
      }

      await updateDoc(docRef, {
        ...updateData,
        updatedAt: Timestamp.now(),
      });

      // Recalculate ELO if game result changed
      if (cleanedUpdates.players) {
        await updateEloScores(id);
      }
    }

    // Game updated successfully
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

