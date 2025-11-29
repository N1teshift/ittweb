import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { getFirestoreInstance } from '@/features/infrastructure/api/firebase';
import { getFirestoreAdmin, isServerSide, getAdminTimestamp } from '@/features/infrastructure/api/firebase/admin';
import { CreateScheduledGame } from '@/types/scheduledGame';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import { removeUndefined } from '@/features/infrastructure/utils/objectUtils';
import { getNextScheduledGameId } from './scheduledGameService.utils';

const GAMES_COLLECTION = 'games'; // Unified games collection (scheduled and completed)
const logger = createComponentLogger('scheduledGameService');

/**
 * Create a new scheduled game
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
    
    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      const adminTimestamp = getAdminTimestamp();
      
      const scheduledDateTime = cleanedData.scheduledDateTime && typeof cleanedData.scheduledDateTime === 'string'
        ? adminTimestamp.fromDate(new Date(cleanedData.scheduledDateTime))
        : adminTimestamp.now();
      
      // Create in unified games collection
      const docRef = await adminDb.collection(GAMES_COLLECTION).add({
        ...cleanedData,
        gameId: scheduledGameId,
        gameState: 'scheduled',
        creatorName: cleanedData.creatorName || 'Unknown',
        createdByDiscordId: cleanedData.createdByDiscordId || '',
        scheduledDateTime,
        scheduledDateTimeString: cleanedData.scheduledDateTime,
        ...(cleanedData.submittedAt ? { submittedAt: adminTimestamp.fromDate(new Date(cleanedData.submittedAt as string)) } : {}),
        status: cleanedData.status ?? 'scheduled',
        participants: cleanedData.participants || [],
        createdAt: adminTimestamp.now(),
        updatedAt: adminTimestamp.now(),
        isDeleted: false,
      });
      logger.info('Scheduled game created', { id: docRef.id, scheduledGameId });
      return docRef.id;
    } else {
      const db = getFirestoreInstance();
      
      const scheduledDateTime = cleanedData.scheduledDateTime && typeof cleanedData.scheduledDateTime === 'string'
        ? Timestamp.fromDate(new Date(cleanedData.scheduledDateTime))
        : Timestamp.now();
      
      // Create in unified games collection
      const docRef = await addDoc(collection(db, GAMES_COLLECTION), {
        ...cleanedData,
        gameId: scheduledGameId,
        gameState: 'scheduled',
        creatorName: cleanedData.creatorName || 'Unknown',
        createdByDiscordId: cleanedData.createdByDiscordId || '',
        scheduledDateTime,
        scheduledDateTimeString: cleanedData.scheduledDateTime,
        ...(cleanedData.submittedAt ? { submittedAt: Timestamp.fromDate(new Date(cleanedData.submittedAt as string)) } : {}),
        status: cleanedData.status ?? 'scheduled',
        participants: cleanedData.participants || [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isDeleted: false,
      });
      logger.info('Scheduled game created', { id: docRef.id, scheduledGameId });
      return docRef.id;
    }
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to create scheduled game', {
      component: 'scheduledGameService',
      operation: 'createScheduledGame',
    });
    throw err;
  }
}

