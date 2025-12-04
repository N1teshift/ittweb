/**
 * Scheduled Game Service - Read Operations (Server-Only)
 * 
 * Server-only functions for reading scheduled games.
 * These functions use Firebase Admin SDK and should only be used in API routes.
 */

import { getFirestoreAdmin } from '@/features/infrastructure/api/firebase/admin';
import { ScheduledGame } from '@/types/scheduledGame';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import { timestampToIso } from '@/features/infrastructure/utils';
import { convertGameDataToScheduledGame, shouldIncludeGame } from './scheduledGameService.read.helpers';
import { queryWithIndexFallback } from '@/features/infrastructure/api/firebase/queryWithIndexFallback';
import { Timestamp } from 'firebase/firestore';

const GAMES_COLLECTION = 'games'; // Unified games collection (scheduled and completed)
const logger = createComponentLogger('scheduledGameService');

/**
 * Get all scheduled games, sorted by scheduled date (upcoming first) (Server-Only)
 * Excludes archived games by default
 */
export async function getAllScheduledGames(includePast: boolean = false, includeArchived: boolean = false): Promise<ScheduledGame[]> {
  try {
    logger.info('Fetching scheduled games from unified games collection', { includePast, includeArchived });

    const games = await queryWithIndexFallback({
      collectionName: GAMES_COLLECTION,
      executeQuery: async () => {
        const docs: Array<{ data: () => Record<string, unknown>; id: string }> = [];
        
        const adminDb = getFirestoreAdmin();
        logger.debug('Querying unified games collection for scheduled games');
        const gamesQuerySnapshot = await adminDb.collection(GAMES_COLLECTION)
          .where('gameState', '==', 'scheduled')
          .where('isDeleted', '==', false)
          .orderBy('scheduledDateTime', 'asc')
          .get();
        
        logger.debug('Found scheduled games in games collection', { count: gamesQuerySnapshot.size });
        
        gamesQuerySnapshot.forEach((docSnap) => {
          docs.push({ data: () => docSnap.data(), id: docSnap.id });
        });
        
        return docs;
      },
      fallbackFilter: (docs) => {
        // Filter by gameState and isDeleted in memory
        return docs.filter((doc) => {
          const data = doc.data();
          return data.gameState === 'scheduled' && data.isDeleted !== true;
        });
      },
      transform: (docs) => {
        const games: ScheduledGame[] = [];
        docs.forEach((doc) => {
          const data = doc.data();
          const scheduledDateTime = (data.scheduledDateTimeString as string) || timestampToIso(data.scheduledDateTime as Timestamp | undefined);
          
          if (shouldIncludeGame(data, scheduledDateTime, includePast, includeArchived)) {
            games.push(convertGameDataToScheduledGame(doc.id, data));
          }
        });
        return games;
      },
      sort: (games) => {
        // Sort by scheduled date (ascending - upcoming first)
        return games.sort((a, b) => {
          const dateA = new Date(timestampToIso(a.scheduledDateTime)).getTime();
          const dateB = new Date(timestampToIso(b.scheduledDateTime)).getTime();
          return dateA - dateB;
        });
      },
      logger,
    });

    logger.info('Scheduled games fetched', { count: games.length });
    return games;
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to fetch scheduled games', {
      component: 'scheduledGameService',
      operation: 'getAllScheduledGames',
      includePast,
    });
    
    const errorMessage = err.message.toLowerCase();
    if (
      errorMessage.includes('index') ||
      errorMessage.includes('collection') ||
      errorMessage.includes('permission') ||
      errorMessage.includes('not found')
    ) {
      logger.info('Returning empty array due to Firestore setup issue', {
        error: err.message,
      });
      return [];
    }
    
    throw err;
  }
}

/**
 * Get a scheduled game by ID (Server-Only)
 */
export async function getScheduledGameById(id: string): Promise<ScheduledGame | null> {
  try {
    logger.info('Fetching scheduled game by ID', { id });

    const adminDb = getFirestoreAdmin();
    const docRef = adminDb.collection(GAMES_COLLECTION).doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      logger.info('Scheduled game not found', { id });
      return null;
    }

    const data = docSnap.data();
    if (!data) {
      return null;
    }

    // Verify it's a scheduled game
    if (data.gameState !== 'scheduled') {
      logger.info('Game is not a scheduled game', { id, gameState: data.gameState });
      return null;
    }

    return convertGameDataToScheduledGame(docSnap.id, data);
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to fetch scheduled game by ID', {
      component: 'scheduledGameService',
      operation: 'getScheduledGameById',
      id,
    });
    throw err;
  }
}

