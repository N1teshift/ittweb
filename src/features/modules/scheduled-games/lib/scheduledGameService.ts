import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
  Timestamp,
} from 'firebase/firestore';
import { getFirestoreInstance } from '@/features/infrastructure/api/firebase';
import { getFirestoreAdmin, isServerSide, getAdminTimestamp } from '@/features/infrastructure/api/firebase/admin';
import { ScheduledGame, CreateScheduledGame } from '@/types/scheduledGame';
import type { ParticipantResult } from '@/features/modules/games/types';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import { removeUndefined } from '@/features/infrastructure/utils/objectUtils';
import { timestampToIso, type TimestampLike } from '@/features/infrastructure/utils/timestampUtils';

const GAMES_COLLECTION = 'games'; // Unified games collection (scheduled and completed)
const logger = createComponentLogger('scheduledGameService');

function deriveGameStatus(data: {
  status?: string;
  scheduledDateTime: string;
  gameLength?: number;
}): ScheduledGame['status'] {
  const storedStatus = (data.status as ScheduledGame['status']) || 'scheduled';

  if (storedStatus === 'archived' || storedStatus === 'awaiting_replay' || storedStatus === 'cancelled') {
    return storedStatus;
  }

  const now = Date.now();
  const startTime = new Date(data.scheduledDateTime).getTime();
  const fallbackLengthSeconds = 3600;
  const durationSeconds = (data.gameLength && data.gameLength > 0 ? data.gameLength : fallbackLengthSeconds);
  const endTime = startTime + durationSeconds * 1000;

  if (Number.isNaN(startTime)) {
    return storedStatus;
  }

  if (now < startTime) {
    return 'scheduled';
  }

  if (now <= endTime) {
    return 'ongoing';
  }

  return 'awaiting_replay';
}

/**
 * Get the next available scheduled game ID
 * Queries all scheduled games and finds the highest ID, then increments by 1
 */
async function getNextScheduledGameId(): Promise<number> {
  try {
    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      // Query unified games collection for scheduled games
      const querySnapshot = await adminDb.collection(GAMES_COLLECTION)
        .where('gameState', '==', 'scheduled')
        .orderBy('gameId', 'desc')
        .limit(1)
        .get();

      if (querySnapshot.empty) {
        // No scheduled games exist, start at 1
        return 1;
      }

      const lastGame = querySnapshot.docs[0].data();
      const lastId = typeof lastGame.gameId === 'number' ? lastGame.gameId : Number(lastGame.gameId) || 0;
      return lastId + 1;
    } else {
      const db = getFirestoreInstance();
      const q = query(
        collection(db, GAMES_COLLECTION),
        where('gameState', '==', 'scheduled'),
        orderBy('gameId', 'desc')
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // No scheduled games exist, start at 1
        return 1;
      }

      const lastGame = querySnapshot.docs[0].data();
      const lastId = typeof lastGame.gameId === 'number' ? lastGame.gameId : Number(lastGame.gameId) || 0;
      return lastId + 1;
    }
  } catch (error) {
    // If there's an error (e.g., index not built), try fetching all and finding max
    logger.warn('Error getting next scheduled game ID, falling back to full query', { error });
    
    try {
      if (isServerSide()) {
        const adminDb = getFirestoreAdmin();
        // Query all scheduled games from unified collection
        const querySnapshot = await adminDb.collection(GAMES_COLLECTION)
          .where('gameState', '==', 'scheduled')
          .get();
        
        let maxId = 0;
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const id = typeof data.gameId === 'number' ? data.gameId : Number(data.gameId) || 0;
          if (id > maxId) {
            maxId = id;
          }
        });
        
        return maxId + 1;
      } else {
        const db = getFirestoreInstance();
        const querySnapshot = await getDocs(
          query(collection(db, GAMES_COLLECTION), where('gameState', '==', 'scheduled'))
        );
        
        let maxId = 0;
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const id = typeof data.gameId === 'number' ? data.gameId : Number(data.gameId) || 0;
          if (id > maxId) {
            maxId = id;
          }
        });
        
        return maxId + 1;
      }
    } catch (fallbackError) {
      // If even fallback fails, start at 1
      const error = fallbackError instanceof Error ? fallbackError : new Error(String(fallbackError));
      logger.error('Failed to get next scheduled game ID, defaulting to 1', error);
      return 1;
    }
  }
}

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
        // Return empty array if initialization fails
        return [];
      }
      
      // Query the unified games collection for scheduled games
      try {
        logger.debug('Querying unified games collection for scheduled games');
        const gamesQuerySnapshot = await adminDb.collection(GAMES_COLLECTION)
          .where('gameState', '==', 'scheduled')
          .where('isDeleted', '==', false)
          .get();
        
        logger.debug('Found scheduled games in games collection', { count: gamesQuerySnapshot.size });
        
        gamesQuerySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          
          // Filter out cancelled games
          if (data.status === 'cancelled') {
            return;
          }
          
          // Filter by status (exclude archived unless requested)
          if (!includeArchived && data.status === 'archived') {
            return;
          }
          
          const scheduledDateTime = data.scheduledDateTimeString || timestampToIso(data.scheduledDateTime);
          
          // Filter past games if includePast is false
          if (!includePast) {
            const gameDate = new Date(scheduledDateTime);
            if (gameDate < new Date()) {
              return;
            }
          }
          
          const derivedStatus = deriveGameStatus({
            status: data.status,
            scheduledDateTime: scheduledDateTime,
            gameLength: data.gameLength,
          });
          
          // Convert from games collection format to ScheduledGame format
          games.push({
            id: docSnap.id,
            scheduledGameId: typeof data.gameId === 'number' ? data.gameId : Number(data.gameId) || 0, // Use gameId as scheduledGameId
            creatorName: data.creatorName || 'Unknown',
            createdByDiscordId: data.createdByDiscordId || '',
            scheduledDateTime: scheduledDateTime,
            scheduledDateTimeString: scheduledDateTime,
            timezone: data.timezone || 'UTC',
            teamSize: data.teamSize,
            customTeamSize: data.customTeamSize,
            gameType: data.gameType,
            gameVersion: data.gameVersion,
            gameLength: data.gameLength,
            modes: Array.isArray(data.modes) ? data.modes : [],
            participants: (Array.isArray(data.participants) ? data.participants : []).map((p: Record<string, unknown>) => ({
              discordId: typeof p.discordId === 'string' ? p.discordId : String(p.discordId || ''),
              name: typeof p.name === 'string' ? p.name : String(p.name || ''),
              joinedAt: typeof p.joinedAt === 'string' ? p.joinedAt : timestampToIso(p.joinedAt as Timestamp | TimestampLike | Date | undefined),
              result: (p.result === 'winner' || p.result === 'loser' || p.result === 'draw') ? p.result as ParticipantResult : undefined,
            })),
            createdAt: timestampToIso(data.createdAt),
            updatedAt: timestampToIso(data.updatedAt),
            submittedAt: data.submittedAt ? timestampToIso(data.submittedAt) : undefined,
            status: derivedStatus,
            linkedGameDocumentId: data.linkedGameDocumentId,
            linkedArchiveDocumentId: data.linkedArchiveDocumentId,
            isDeleted: data.isDeleted ?? false,
            deletedAt: data.deletedAt ? timestampToIso(data.deletedAt) : null,
          });
        });
        
        logger.debug('Added scheduled games from unified games collection', { count: gamesQuerySnapshot.size });
      } catch (gamesCollectionError) {
        // Log but don't fail if we can't query games collection
        logger.warn('Failed to query games collection for scheduled games', { 
          error: gamesCollectionError instanceof Error ? gamesCollectionError.message : String(gamesCollectionError) 
        });
      }
      
      // Final sort by scheduled date (ascending - upcoming first)
      games.sort((a, b) => {
        const dateA = new Date(timestampToIso(a.scheduledDateTime)).getTime();
        const dateB = new Date(timestampToIso(b.scheduledDateTime)).getTime();
        return dateA - dateB; // Ascending order
      });
    } else {
      const db = getFirestoreInstance();
      
      // Query unified games collection for scheduled games
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
          
          // Filter out cancelled games
          if (data.status === 'cancelled') {
            return;
          }
          
          // Filter by status (exclude archived unless requested)
          if (!includeArchived && data.status === 'archived') {
            return;
          }
          
          const scheduledDateTime = data.scheduledDateTimeString || timestampToIso(data.scheduledDateTime as Timestamp);
          
          // Filter past games if includePast is false
          if (!includePast) {
            const gameDate = new Date(scheduledDateTime);
            if (gameDate < new Date()) {
              return;
            }
          }
          
          const derivedStatus = deriveGameStatus({
            status: data.status,
            scheduledDateTime: scheduledDateTime,
            gameLength: data.gameLength,
          });
          
          // Convert from games collection format to ScheduledGame format
          games.push({
            id: docSnap.id,
            scheduledGameId: typeof data.gameId === 'number' ? data.gameId : Number(data.gameId) || 0,
            creatorName: data.creatorName || 'Unknown',
            createdByDiscordId: data.createdByDiscordId || '',
            scheduledDateTime: scheduledDateTime,
            scheduledDateTimeString: scheduledDateTime,
            timezone: data.timezone || 'UTC',
            teamSize: data.teamSize,
            customTeamSize: data.customTeamSize,
            gameType: data.gameType,
            gameVersion: data.gameVersion,
            gameLength: data.gameLength,
            modes: Array.isArray(data.modes) ? data.modes : [],
            participants: (Array.isArray(data.participants) ? data.participants : []).map((p: Record<string, unknown>) => ({
              discordId: typeof p.discordId === 'string' ? p.discordId : String(p.discordId || ''),
              name: typeof p.name === 'string' ? p.name : String(p.name || ''),
              joinedAt: typeof p.joinedAt === 'string' ? p.joinedAt : timestampToIso(p.joinedAt as Timestamp | TimestampLike | Date | undefined),
              result: (p.result === 'winner' || p.result === 'loser' || p.result === 'draw') ? p.result as ParticipantResult : undefined,
            })),
            createdAt: timestampToIso(data.createdAt),
            updatedAt: timestampToIso(data.updatedAt),
            submittedAt: data.submittedAt ? timestampToIso(data.submittedAt) : undefined,
            status: derivedStatus,
            linkedGameDocumentId: data.linkedGameDocumentId,
            linkedArchiveDocumentId: data.linkedArchiveDocumentId,
            isDeleted: data.isDeleted ?? false,
            deletedAt: data.deletedAt ? timestampToIso(data.deletedAt) : null,
          });
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
            
            // Filter out deleted games
            if (data.isDeleted === true) {
              return;
            }
            
            // Filter out cancelled games
            if (data.status === 'cancelled') {
              return;
            }
            
            // Filter by status (exclude archived unless requested)
            if (!includeArchived && data.status === 'archived') {
              return;
            }
            
            const scheduledDateTime = data.scheduledDateTimeString || timestampToIso(data.scheduledDateTime as Timestamp);
            
            // Filter past games if includePast is false
            if (!includePast) {
              const gameDate = new Date(scheduledDateTime);
              if (gameDate < new Date()) {
                return;
              }
            }
            
            const derivedStatus = deriveGameStatus({
              status: data.status,
              scheduledDateTime: scheduledDateTime,
              gameLength: data.gameLength,
            });
            
            // Convert from games collection format to ScheduledGame format
            games.push({
              id: docSnap.id,
              scheduledGameId: typeof data.gameId === 'number' ? data.gameId : Number(data.gameId) || 0,
              creatorName: data.creatorName || 'Unknown',
              createdByDiscordId: data.createdByDiscordId || '',
              scheduledDateTime: scheduledDateTime,
              scheduledDateTimeString: scheduledDateTime,
              timezone: data.timezone || 'UTC',
              teamSize: data.teamSize,
              customTeamSize: data.customTeamSize,
              gameType: data.gameType,
              gameVersion: data.gameVersion,
              gameLength: data.gameLength,
              modes: Array.isArray(data.modes) ? data.modes : [],
              participants: (Array.isArray(data.participants) ? data.participants : []).map((p: Record<string, unknown>) => ({
                discordId: typeof p.discordId === 'string' ? p.discordId : String(p.discordId || ''),
                name: typeof p.name === 'string' ? p.name : String(p.name || ''),
                joinedAt: typeof p.joinedAt === 'string' ? p.joinedAt : timestampToIso(p.joinedAt as Timestamp | TimestampLike | Date | undefined),
                result: (p.result === 'winner' || p.result === 'loser' || p.result === 'draw') ? p.result as ParticipantResult : undefined,
              })),
              createdAt: timestampToIso(data.createdAt),
              updatedAt: timestampToIso(data.updatedAt),
              submittedAt: data.submittedAt ? timestampToIso(data.submittedAt) : undefined,
              status: derivedStatus,
              linkedGameDocumentId: data.linkedGameDocumentId,
              linkedArchiveDocumentId: data.linkedArchiveDocumentId,
              isDeleted: data.isDeleted ?? false,
              deletedAt: data.deletedAt ? timestampToIso(data.deletedAt) : null,
            });
          });
          
          // Sort by scheduled date (ascending - upcoming first) in memory
          games.sort((a, b) => {
            const dateA = new Date(timestampToIso(a.scheduledDateTime)).getTime();
            const dateB = new Date(timestampToIso(b.scheduledDateTime)).getTime();
            return dateA - dateB; // Ascending order
          });
        } else {
          // Re-throw if it's a different error
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
    
    // If it's a Firestore index error or collection doesn't exist, return empty array
    // This allows the page to load even if the collection/index isn't set up yet
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
    
    // For other errors, still throw so we can see them in development
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
      // Query unified games collection
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

      const scheduledDateTime = data.scheduledDateTimeString || timestampToIso(data.scheduledDateTime);
      
      const derivedStatus = deriveGameStatus({
        status: data.status,
            scheduledDateTime: scheduledDateTime,
        gameLength: data.gameLength,
      });

      return {
        id: docSnap.id,
        scheduledGameId: typeof data.gameId === 'number' ? data.gameId : Number(data.gameId) || 0,
        creatorName: data.creatorName || 'Unknown',
        createdByDiscordId: data.createdByDiscordId || '',
            scheduledDateTime: scheduledDateTime,
        scheduledDateTimeString: scheduledDateTime,
        timezone: data.timezone || 'UTC',
        teamSize: data.teamSize,
        customTeamSize: data.customTeamSize,
        gameType: data.gameType,
        gameVersion: data.gameVersion,
        gameLength: data.gameLength,
        modes: Array.isArray(data.modes) ? data.modes : [],
        participants: (Array.isArray(data.participants) ? data.participants : []).map((p: Record<string, unknown>) => ({
          discordId: typeof p.discordId === 'string' ? p.discordId : String(p.discordId || ''),
          name: typeof p.name === 'string' ? p.name : String(p.name || ''),
          joinedAt: typeof p.joinedAt === 'string' ? p.joinedAt : timestampToIso(p.joinedAt as Timestamp | TimestampLike | Date | undefined),
          result: (p.result === 'winner' || p.result === 'loser' || p.result === 'draw') ? p.result as ParticipantResult : undefined,
        })),
        createdAt: timestampToIso(data.createdAt),
        updatedAt: timestampToIso(data.updatedAt),
        submittedAt: data.submittedAt ? timestampToIso(data.submittedAt) : undefined,
        status: derivedStatus,
        linkedGameDocumentId: data.linkedGameDocumentId,
        linkedArchiveDocumentId: data.linkedArchiveDocumentId,
        isDeleted: data.isDeleted ?? false,
        deletedAt: data.deletedAt ? timestampToIso(data.deletedAt) : null,
      };
    } else {
      const db = getFirestoreInstance();
      // Query unified games collection
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
      
      const scheduledDateTime = data.scheduledDateTimeString || timestampToIso(data.scheduledDateTime as Timestamp);
      const derivedStatus = deriveGameStatus({
        status: data.status,
            scheduledDateTime: scheduledDateTime,
        gameLength: data.gameLength,
      });
      
      return {
        id: docSnap.id,
        scheduledGameId: typeof data.gameId === 'number' ? data.gameId : Number(data.gameId) || 0,
        creatorName: data.creatorName || 'Unknown',
        createdByDiscordId: data.createdByDiscordId || '',
            scheduledDateTime: scheduledDateTime,
        scheduledDateTimeString: scheduledDateTime,
        timezone: data.timezone || 'UTC',
        teamSize: data.teamSize,
        customTeamSize: data.customTeamSize,
        gameType: data.gameType,
        gameVersion: data.gameVersion,
        gameLength: data.gameLength,
        modes: Array.isArray(data.modes) ? data.modes : [],
        participants: (Array.isArray(data.participants) ? data.participants : []).map((p: Record<string, unknown>) => ({
          discordId: typeof p.discordId === 'string' ? p.discordId : String(p.discordId || ''),
          name: typeof p.name === 'string' ? p.name : String(p.name || ''),
          joinedAt: typeof p.joinedAt === 'string' ? p.joinedAt : timestampToIso(p.joinedAt as Timestamp | TimestampLike | Date | undefined),
          result: (p.result === 'winner' || p.result === 'loser' || p.result === 'draw') ? p.result as ParticipantResult : undefined,
        })),
        createdAt: timestampToIso(data.createdAt),
        updatedAt: timestampToIso(data.updatedAt),
        submittedAt: data.submittedAt ? timestampToIso(data.submittedAt) : undefined,
        status: derivedStatus,
        linkedGameDocumentId: data.linkedGameDocumentId,
        linkedArchiveDocumentId: data.linkedArchiveDocumentId,
        isDeleted: data.isDeleted ?? false,
        deletedAt: data.deletedAt ? timestampToIso(data.deletedAt) : null,
      };
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

/**
 * Update a scheduled game
 */
export async function updateScheduledGame(
  id: string, 
  updates: Partial<CreateScheduledGame> & { 
    status?: 'scheduled' | 'ongoing' | 'awaiting_replay' | 'archived' | 'cancelled';
    linkedGameDocumentId?: string;
    linkedArchiveDocumentId?: string;
  }
): Promise<void> {
  try {
    logger.info('Updating scheduled game', { id });

    // Only extract fields that are safe to update
    const updateData: Record<string, unknown> = {};
    
    // Handle status
    if (updates.status !== undefined) {
      updateData.status = updates.status;
    }
    
    // Handle link fields
    if (updates.linkedGameDocumentId !== undefined) {
      updateData.linkedGameDocumentId = updates.linkedGameDocumentId;
    }
    if (updates.linkedArchiveDocumentId !== undefined) {
      updateData.linkedArchiveDocumentId = updates.linkedArchiveDocumentId;
    }
    
    // Handle scheduledDateTime (convert to Timestamp if provided)
    if (updates.scheduledDateTime !== undefined && typeof updates.scheduledDateTime === 'string') {
      const date = new Date(updates.scheduledDateTime);
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid scheduledDateTime: ${updates.scheduledDateTime}`);
      }
      if (isServerSide()) {
        const adminTimestamp = getAdminTimestamp();
        updateData.scheduledDateTime = adminTimestamp.fromDate(date);
        updateData.scheduledDateTimeString = updates.scheduledDateTime;
      } else {
        updateData.scheduledDateTime = Timestamp.fromDate(date);
        updateData.scheduledDateTimeString = updates.scheduledDateTime;
      }
    }
    
    // Handle other optional fields from CreateScheduledGame (only if they're strings/numbers, not Timestamps)
    if (updates.timezone !== undefined) updateData.timezone = updates.timezone;
    if (updates.teamSize !== undefined) updateData.teamSize = updates.teamSize;
    if (updates.customTeamSize !== undefined) updateData.customTeamSize = updates.customTeamSize;
    if (updates.gameType !== undefined) updateData.gameType = updates.gameType;
    if (updates.gameVersion !== undefined) updateData.gameVersion = updates.gameVersion;
    if (updates.gameLength !== undefined) updateData.gameLength = updates.gameLength;
    if (updates.modes !== undefined) updateData.modes = updates.modes;
    if (updates.participants !== undefined) updateData.participants = updates.participants;
    if (updates.creatorName !== undefined) updateData.creatorName = updates.creatorName;
    if (updates.createdByDiscordId !== undefined) updateData.createdByDiscordId = updates.createdByDiscordId;
    
    // Handle submittedAt (convert to Timestamp if provided as string)
    if (updates.submittedAt !== undefined) {
      if (typeof updates.submittedAt === 'string') {
        const date = new Date(updates.submittedAt);
        if (isNaN(date.getTime())) {
          throw new Error(`Invalid submittedAt: ${updates.submittedAt}`);
        }
        if (isServerSide()) {
          const adminTimestamp = getAdminTimestamp();
          updateData.submittedAt = adminTimestamp.fromDate(date);
        } else {
          updateData.submittedAt = Timestamp.fromDate(date);
        }
      } else {
        // If it's already a Timestamp, use it directly
        updateData.submittedAt = updates.submittedAt;
      }
    }

    // Only update if we have data to update
    if (Object.keys(updateData).length === 0) {
      logger.warn('No valid fields to update', { id });
      return;
    }

    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      const adminTimestamp = getAdminTimestamp();
      
      // Update in unified games collection
      await adminDb.collection(GAMES_COLLECTION).doc(id).update({
        ...updateData,
        updatedAt: adminTimestamp.now(),
      });
    } else {
      const db = getFirestoreInstance();
      const docRef = doc(db, GAMES_COLLECTION, id);
      
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: Timestamp.now(),
      });
    }

    logger.info('Scheduled game updated', { id });
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to update scheduled game', {
      component: 'scheduledGameService',
      operation: 'updateScheduledGame',
      id,
    });
    throw err;
  }
}

/**
 * Delete a scheduled game
 */
export async function deleteScheduledGame(id: string): Promise<void> {
  try {
    logger.info('Deleting scheduled game', { id });

    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      // Delete from unified games collection (soft delete)
      await adminDb.collection(GAMES_COLLECTION).doc(id).update({
        isDeleted: true,
        deletedAt: getAdminTimestamp().now(),
        updatedAt: getAdminTimestamp().now(),
      });
    } else {
      const db = getFirestoreInstance();
      const docRef = doc(db, GAMES_COLLECTION, id);
      // Soft delete from unified games collection
      await updateDoc(docRef, {
        isDeleted: true,
        deletedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }

    logger.info('Scheduled game deleted', { id });
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to delete scheduled game', {
      component: 'scheduledGameService',
      operation: 'deleteScheduledGame',
      id,
    });
    throw err;
  }
}

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

