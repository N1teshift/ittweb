import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getFirestoreInstance } from '@/features/infrastructure/api/firebase';
import { getFirestoreAdmin, isServerSide } from '@/features/infrastructure/api/firebase/admin';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import { createTimestampFactoryAsync } from '@/features/infrastructure/utils';

const GAMES_COLLECTION = 'games'; // Unified games collection (scheduled and completed)
const logger = createComponentLogger('scheduledGameService');

/**
 * Join a scheduled game
 */
export async function joinScheduledGame(
  gameId: string,
  discordId: string,
  name: string
): Promise<void> {
  try {
    logger.info('Joining scheduled game', { gameId, discordId });

    const timestampFactory = await createTimestampFactoryAsync();
    const now = timestampFactory.now();
    
    let gameData: Record<string, unknown> | undefined;
    
    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      const gameRef = adminDb.collection(GAMES_COLLECTION).doc(gameId);
      const gameDoc = await gameRef.get();
      if (!gameDoc.exists) {
        throw new Error('Game not found');
      }
      gameData = gameDoc.data();
    } else {
      const db = getFirestoreInstance();
      const gameRef = doc(db, GAMES_COLLECTION, gameId);
      const gameDoc = await getDoc(gameRef);
      if (!gameDoc.exists()) {
        throw new Error('Game not found');
      }
      gameData = gameDoc.data();
    }
    
    const participants = (gameData?.participants || []) as Array<{ discordId: string; name: string; joinedAt: unknown }>;
    
    // Check if user is already a participant
    if (participants.some(p => p.discordId === discordId)) {
      throw new Error('User is already a participant');
    }
    
    // Add user to participants
    participants.push({
      discordId,
      name,
      joinedAt: now.toDate().toISOString(),
    });
    
    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      const gameRef = adminDb.collection(GAMES_COLLECTION).doc(gameId);
      await gameRef.update({
        participants,
        updatedAt: now,
      });
    } else {
      const db = getFirestoreInstance();
      const gameRef = doc(db, GAMES_COLLECTION, gameId);
      await updateDoc(gameRef, {
        participants,
        updatedAt: now,
      });
    }

    logger.info('Successfully joined scheduled game', { gameId, discordId });
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to join scheduled game', {
      component: 'scheduledGameService',
      operation: 'joinScheduledGame',
      gameId,
      discordId,
    });
    throw err;
  }
}

/**
 * Leave a scheduled game
 */
export async function leaveScheduledGame(
  gameId: string,
  discordId: string
): Promise<void> {
  try {
    logger.info('Leaving scheduled game', { gameId, discordId });

    const timestampFactory = await createTimestampFactoryAsync();
    const now = timestampFactory.now();
    
    let gameData: Record<string, unknown> | undefined;
    
    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      const gameRef = adminDb.collection(GAMES_COLLECTION).doc(gameId);
      const gameDoc = await gameRef.get();
      if (!gameDoc.exists) {
        throw new Error('Game not found');
      }
      gameData = gameDoc.data();
    } else {
      const db = getFirestoreInstance();
      const gameRef = doc(db, GAMES_COLLECTION, gameId);
      const gameDoc = await getDoc(gameRef);
      if (!gameDoc.exists()) {
        throw new Error('Game not found');
      }
      gameData = gameDoc.data();
    }
    
    const participants = (gameData?.participants || []) as Array<{ discordId: string; name: string; joinedAt: unknown }>;
    const updatedParticipants = participants.filter(p => p.discordId !== discordId);
    
    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      const gameRef = adminDb.collection(GAMES_COLLECTION).doc(gameId);
      await gameRef.update({
        participants: updatedParticipants,
        updatedAt: now,
      });
    } else {
      const db = getFirestoreInstance();
      const gameRef = doc(db, GAMES_COLLECTION, gameId);
      await updateDoc(gameRef, {
        participants: updatedParticipants,
        updatedAt: now,
      });
    }

    logger.info('Successfully left scheduled game', { gameId, discordId });
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to leave scheduled game', {
      component: 'scheduledGameService',
      operation: 'leaveScheduledGame',
      gameId,
      discordId,
    });
    throw err;
  }
}


