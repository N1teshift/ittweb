import {
  doc,
  updateDoc,
} from 'firebase/firestore';
import { getFirestoreInstance } from '@/features/infrastructure/api/firebase';
import { getFirestoreAdmin, isServerSide } from '@/features/infrastructure/api/firebase/admin';
import { logError } from '@/features/infrastructure/logging';
import { removeUndefined } from '@/features/infrastructure/utils/objectUtils';
import { createTimestampFactoryAsync } from '@/features/infrastructure/utils/timestampUtils';
import type { UpdateGame } from '../types';
import { updateEloScores } from '@/features/infrastructure/game';

const GAMES_COLLECTION = 'games';

/**
 * Update a game
 */
export async function updateGame(id: string, updates: UpdateGame): Promise<void> {
  try {
    // Reduced logging verbosity

    const cleanedUpdates = removeUndefined(updates as unknown as Record<string, unknown>);
    const updateData: Record<string, unknown> = { ...cleanedUpdates };
    const timestampFactory = await createTimestampFactoryAsync();

    if (cleanedUpdates.datetime) {
      updateData.datetime = timestampFactory.fromDate(new Date(cleanedUpdates.datetime as string));
    }

    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      await adminDb.collection(GAMES_COLLECTION).doc(id).update({
        ...updateData,
        updatedAt: timestampFactory.now(),
      });

      // Recalculate ELO if game result changed
      if (cleanedUpdates.players) {
        await updateEloScores(id);
      }
    } else {
      const db = getFirestoreInstance();
      const docRef = doc(db, GAMES_COLLECTION, id);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: timestampFactory.now(),
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


