/**
 * Scheduled Game Service - Participation Operations (Server-Only)
 * 
 * Server-only functions for scheduled game participation (join/leave).
 * These functions use Firebase Admin SDK and should only be used in API routes.
 */

import { getFirestoreAdmin } from '@/features/infrastructure/api/firebase/admin';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import { createTimestampFactoryAsync } from '@/features/infrastructure/utils';

const GAMES_COLLECTION = 'games'; // Unified games collection (scheduled and completed)
const logger = createComponentLogger('scheduledGameService');

/**
 * Join a scheduled game (Server-Only)
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
    const adminDb = getFirestoreAdmin();
    const gameRef = adminDb.collection(GAMES_COLLECTION).doc(gameId);
    const gameDoc = await gameRef.get();
    
    if (!gameDoc.exists) {
      throw new Error('Game not found');
    }
    
    const gameData = gameDoc.data();
    if (!gameData) {
      throw new Error('Game not found');
    }
    
    const participants = (gameData.participants || []) as Array<{ discordId: string; name: string; joinedAt: unknown }>;
    
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
    
    await gameRef.update({
      participants,
      updatedAt: now,
    });

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
 * Leave a scheduled game (Server-Only)
 */
export async function leaveScheduledGame(
  gameId: string,
  discordId: string
): Promise<void> {
  try {
    logger.info('Leaving scheduled game', { gameId, discordId });

    const timestampFactory = await createTimestampFactoryAsync();
    const now = timestampFactory.now();
    const adminDb = getFirestoreAdmin();
    const gameRef = adminDb.collection(GAMES_COLLECTION).doc(gameId);
    const gameDoc = await gameRef.get();
    
    if (!gameDoc.exists) {
      throw new Error('Game not found');
    }
    
    const gameData = gameDoc.data();
    if (!gameData) {
      throw new Error('Game not found');
    }
    
    const participants = (gameData.participants || []) as Array<{ discordId: string; name: string; joinedAt: unknown }>;
    const updatedParticipants = participants.filter(p => p.discordId !== discordId);
    
    await gameRef.update({
      participants: updatedParticipants,
      updatedAt: now,
    });

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

