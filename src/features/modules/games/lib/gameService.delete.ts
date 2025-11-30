import {
  collection,
  getDocs,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { getFirestoreInstance } from '@/features/infrastructure/api/firebase';
import { getFirestoreAdmin, isServerSide } from '@/features/infrastructure/api/firebase/admin';
import { logError } from '@/features/infrastructure/logging';

const GAMES_COLLECTION = 'games';

/**
 * Delete a game
 */
export async function deleteGame(id: string): Promise<void> {
  try {
    // Reduced logging verbosity

    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      const gameRef = adminDb.collection(GAMES_COLLECTION).doc(id);

      // Delete all players in subcollection
      const playersSnapshot = await gameRef.collection('players').get();
      const deletePromises = playersSnapshot.docs.map((playerDoc) => playerDoc.ref.delete());
      await Promise.all(deletePromises);

      // Delete game document
      await gameRef.delete();

      // TODO: Rollback ELO changes
    } else {
      const db = getFirestoreInstance();
      const gameRef = doc(db, GAMES_COLLECTION, id);

      // Delete all players in subcollection
      const playersCollection = collection(db, GAMES_COLLECTION, id, 'players');
      const playersSnapshot = await getDocs(playersCollection);
      const deletePromises = playersSnapshot.docs.map((playerDoc) => deleteDoc(doc(db, GAMES_COLLECTION, id, 'players', playerDoc.id)));
      await Promise.all(deletePromises);

      // Delete game document
      await deleteDoc(gameRef);

      // TODO: Rollback ELO changes
    }

    // Game deleted successfully
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

