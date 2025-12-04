/**
 * Scheduled Game Service - Create Operations (Server-Only)
 * 
 * Server-only functions for creating scheduled games.
 * These functions use Firebase Admin SDK and should only be used in API routes.
 */

import { getFirestoreAdmin } from '@/features/infrastructure/api/firebase/admin';
import { CreateScheduledGame } from '@/types/scheduledGame';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import { removeUndefined, createTimestampFactoryAsync } from '@/features/infrastructure/utils';
import { getNextScheduledGameId } from './scheduledGameService.utils.server';

const GAMES_COLLECTION = 'games'; // Unified games collection (scheduled and completed)
const logger = createComponentLogger('scheduledGameService');

/**
 * Create a new scheduled game (Server-Only)
 */
export async function createScheduledGame(gameData: CreateScheduledGame): Promise<string> {
  try {
    // Get the next available scheduled game ID
    const scheduledGameId = await getNextScheduledGameId();
    
    logger.info('Creating scheduled game', { 
      scheduledGameId,
      scheduledDateTime: gameData.scheduledDateTime,
      teamSize: gameData.teamSize 
    });

    const cleanedData = removeUndefined(gameData as unknown as Record<string, unknown>);
    const timestampFactory = await createTimestampFactoryAsync();
    
    const scheduledDateTime = cleanedData.scheduledDateTime && typeof cleanedData.scheduledDateTime === 'string'
      ? timestampFactory.fromDate(new Date(cleanedData.scheduledDateTime as string))
      : timestampFactory.now();
    
    const now = timestampFactory.now();
    
    const gameDoc = {
      ...cleanedData,
      gameId: scheduledGameId,
      gameState: 'scheduled',
      creatorName: cleanedData.creatorName || 'Unknown',
      createdByDiscordId: cleanedData.createdByDiscordId || '',
      scheduledDateTime,
      scheduledDateTimeString: cleanedData.scheduledDateTime,
      ...(cleanedData.submittedAt ? { submittedAt: timestampFactory.fromDate(new Date(cleanedData.submittedAt as string)) } : {}),
      status: cleanedData.status ?? 'scheduled',
      participants: cleanedData.participants || [],
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
    };
    
    const adminDb = getFirestoreAdmin();
    const docRef = await adminDb.collection(GAMES_COLLECTION).add(gameDoc);
    logger.info('Scheduled game created', { id: docRef.id, scheduledGameId });
    return docRef.id;
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to create scheduled game', {
      component: 'scheduledGameService',
      operation: 'createScheduledGame',
    });
    throw err;
  }
}

