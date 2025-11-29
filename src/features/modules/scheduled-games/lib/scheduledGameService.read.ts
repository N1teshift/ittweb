import { collection, getDocs, getDoc, doc, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { getFirestoreInstance } from '@/features/infrastructure/api/firebase';
import { getFirestoreAdmin, isServerSide } from '@/features/infrastructure/api/firebase/admin';
import { ScheduledGame } from '@/types/scheduledGame';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import { timestampToIso } from '@/features/infrastructure/utils/timestampUtils';
import { convertGameDataToScheduledGame, shouldIncludeGame } from './scheduledGameService.read.helpers';

const GAMES_COLLECTION = 'games'; // Unified games collection (scheduled and completed)
const logger = createComponentLogger('scheduledGameService');

/**
 * Get all scheduled games, sorted by scheduled date (upcoming first)
 * Excludes archived games by default
 */
export async function getAllScheduledGames(includePast: boolean = false, includeArchived: boolean = false): Promise<ScheduledGame[]> {
  try {
    logger.info('Fetching scheduled games from unified games collection', { includePast, includeArchived });

    const games: ScheduledGame[] = [];

    if (isServerSide()) {
      let adminDb: ReturnType<typeof getFirestoreAdmin>;
      try {
        adminDb = getFirestoreAdmin();
      } catch (initError) {
        const error = initError instanceof Error ? initError : new Error(String(initError));
        logger.error('Failed to initialize Firestore Admin', error, {
          component: 'scheduledGameService',
          operation: 'getAllScheduledGames',
        });
        return [];
      }
      
      try {
        logger.debug('Querying unified games collection for scheduled games');
        const gamesQuerySnapshot = await adminDb.collection(GAMES_COLLECTION)
          .where('gameState', '==', 'scheduled')
          .where('isDeleted', '==', false)
          .get();
        
        logger.debug('Found scheduled games in games collection', { count: gamesQuerySnapshot.size });
        
        gamesQuerySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const scheduledDateTime = (data.scheduledDateTimeString as string) || timestampToIso(data.scheduledDateTime);
          
          if (shouldIncludeGame(data, scheduledDateTime, includePast, includeArchived)) {
            games.push(convertGameDataToScheduledGame(docSnap.id, data));
          }
        });
        
        logger.debug('Added scheduled games from unified games collection', { count: gamesQuerySnapshot.size });
      } catch (gamesCollectionError) {
        logger.warn('Failed to query games collection for scheduled games', { 
          error: gamesCollectionError instanceof Error ? gamesCollectionError.message : String(gamesCollectionError) 
        });
      }
      
      // Final sort by scheduled date (ascending - upcoming first)
      games.sort((a, b) => {
        const dateA = new Date(timestampToIso(a.scheduledDateTime)).getTime();
        const dateB = new Date(timestampToIso(b.scheduledDateTime)).getTime();
        return dateA - dateB;
      });
    } else {
      const db = getFirestoreInstance();
      
      try {
        const q = query(
          collection(db, GAMES_COLLECTION),
          where('gameState', '==', 'scheduled'),
          where('isDeleted', '==', false),
          orderBy('scheduledDateTime', 'asc')
        );

        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const scheduledDateTime = (data.scheduledDateTimeString as string) || timestampToIso(data.scheduledDateTime as Timestamp);
          
          if (shouldIncludeGame(data, scheduledDateTime, includePast, includeArchived)) {
            games.push(convertGameDataToScheduledGame(docSnap.id, data));
          }
        });
      } catch (error: unknown) {
        // If index is still building, fall back to fetching all and filtering in memory
        const firestoreError = error as { code?: string; message?: string };
        if (firestoreError?.code === 'failed-precondition' || firestoreError?.message?.includes('index')) {
          logger.info('Index still building, falling back to in-memory filtering');
          
          const querySnapshot = await getDocs(
            query(collection(db, GAMES_COLLECTION), where('gameState', '==', 'scheduled'))
          );

          querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            
            if (data.isDeleted === true) {
              return;
            }
            
            const scheduledDateTime = (data.scheduledDateTimeString as string) || timestampToIso(data.scheduledDateTime as Timestamp);
            
            if (shouldIncludeGame(data, scheduledDateTime, includePast, includeArchived)) {
              games.push(convertGameDataToScheduledGame(docSnap.id, data));
            }
          });
          
          // Sort by scheduled date (ascending - upcoming first) in memory
          games.sort((a, b) => {
            const dateA = new Date(timestampToIso(a.scheduledDateTime)).getTime();
            const dateB = new Date(timestampToIso(b.scheduledDateTime)).getTime();
            return dateA - dateB;
          });
        } else {
          throw error;
        }
      }
    }

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
 * Get a scheduled game by ID
 * Uses Admin SDK on server-side, Client SDK on client-side
 */
export async function getScheduledGameById(id: string): Promise<ScheduledGame | null> {
  try {
    logger.info('Fetching scheduled game by ID', { id });

    if (isServerSide()) {
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
    } else {
      const db = getFirestoreInstance();
      const docRef = doc(db, GAMES_COLLECTION, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        logger.info('Scheduled game not found', { id });
        return null;
      }

      const data = docSnap.data();
      
      // Verify it's a scheduled game
      if (data.gameState !== 'scheduled') {
        logger.info('Game is not a scheduled game', { id, gameState: data.gameState });
        return null;
      }
      
      return convertGameDataToScheduledGame(docSnap.id, data);
    }
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

