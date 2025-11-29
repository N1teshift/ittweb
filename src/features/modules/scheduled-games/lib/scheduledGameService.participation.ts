import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { getFirestoreInstance } from '@/features/infrastructure/api/firebase';
import { getFirestoreAdmin, isServerSide, getAdminTimestamp } from '@/features/infrastructure/api/firebase/admin';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';

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

    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      const adminTimestamp = getAdminTimestamp();
      const gameRef = adminDb.collection(GAMES_COLLECTION).doc(gameId);
      
      // Get current game data
      const gameDoc = await gameRef.get();
      if (!gameDoc.exists) {
        throw new Error('Game not found');
      }
      
      const gameData = gameDoc.data();
      const participants = (gameData?.participants || []) as Array<{ discordId: string; name: string; joinedAt: unknown }>;
      
      // Check if user is already a participant
      if (participants.some(p => p.discordId === discordId)) {
        throw new Error('User is already a participant');
      }
      
      // Add user to participants
      participants.push({
        discordId,
        name,
        joinedAt: adminTimestamp.now(),
      });
      
      await gameRef.update({
        participants,
        updatedAt: adminTimestamp.now(),
      });
    } else {
      const db = getFirestoreInstance();
      const gameRef = doc(db, GAMES_COLLECTION, gameId);
      
      // Get current game data
      const gameDoc = await getDoc(gameRef);
      if (!gameDoc.exists()) {
        throw new Error('Game not found');
      }
      
      const gameData = gameDoc.data();
      const participants = (gameData?.participants || []) as Array<{ discordId: string; name: string; joinedAt: unknown }>;
      
      // Check if user is already a participant
      if (participants.some(p => p.discordId === discordId)) {
        throw new Error('User is already a participant');
      }
      
      // Add user to participants
      participants.push({
        discordId,
        name,
        joinedAt: Timestamp.now(),
      });
      
      await updateDoc(gameRef, {
        participants,
        updatedAt: Timestamp.now(),
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

    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      const adminTimestamp = getAdminTimestamp();
      const gameRef = adminDb.collection(GAMES_COLLECTION).doc(gameId);
      
      // Get current game data
      const gameDoc = await gameRef.get();
      if (!gameDoc.exists) {
        throw new Error('Game not found');
      }
      
      const gameData = gameDoc.data();
      const participants = (gameData?.participants || []) as Array<{ discordId: string; name: string; joinedAt: unknown }>;
      
      // Remove user from participants
      const updatedParticipants = participants.filter(p => p.discordId !== discordId);
      
      await gameRef.update({
        participants: updatedParticipants,
        updatedAt: adminTimestamp.now(),
      });
    } else {
      const db = getFirestoreInstance();
      const gameRef = doc(db, GAMES_COLLECTION, gameId);
      
      // Get current game data
      const gameDoc = await getDoc(gameRef);
      if (!gameDoc.exists()) {
        throw new Error('Game not found');
      }
      
      const gameData = gameDoc.data();
      const participants = (gameData?.participants || []) as Array<{ discordId: string; name: string; joinedAt: unknown }>;
      
      // Remove user from participants
      const updatedParticipants = participants.filter(p => p.discordId !== discordId);
      
      await updateDoc(gameRef, {
        participants: updatedParticipants,
        updatedAt: Timestamp.now(),
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

