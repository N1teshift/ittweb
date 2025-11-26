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
import { createComponentLogger, logError } from '@/features/infrastructure/logging';

const SCHEDULED_GAMES_COLLECTION = 'scheduledGames';
const logger = createComponentLogger('scheduledGameService');

/**
 * Remove undefined values from an object (Firestore doesn't allow undefined)
 */
function removeUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined)
  ) as Partial<T>;
}

/**
 * Convert Firestore timestamp to ISO string
 */
interface TimestampLike {
  toDate?: () => Date;
}
function timestampToIso(timestamp: Timestamp | TimestampLike | string | Date | undefined): string {
  if (!timestamp) return new Date().toISOString();
  if (typeof timestamp === 'string') return timestamp;
  if ('toDate' in timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toISOString();
  }
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  return new Date().toISOString();
}

/**
 * Create a new scheduled game
 */
export async function createScheduledGame(gameData: CreateScheduledGame): Promise<string> {
  try {
    logger.info('Creating scheduled game', { 
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
      
      const docRef = await adminDb.collection(SCHEDULED_GAMES_COLLECTION).add({
        ...cleanedData,
        scheduledDateTime,
        scheduledDateTimeString: cleanedData.scheduledDateTime,
        status: 'scheduled',
        participants: cleanedData.participants || [],
        createdAt: adminTimestamp.now(),
        updatedAt: adminTimestamp.now(),
      });
      logger.info('Scheduled game created', { id: docRef.id });
      return docRef.id;
    } else {
      const db = getFirestoreInstance();
      
      const scheduledDateTime = cleanedData.scheduledDateTime && typeof cleanedData.scheduledDateTime === 'string'
        ? Timestamp.fromDate(new Date(cleanedData.scheduledDateTime))
        : Timestamp.now();
      
      const docRef = await addDoc(collection(db, SCHEDULED_GAMES_COLLECTION), {
        ...cleanedData,
        scheduledDateTime,
        scheduledDateTimeString: cleanedData.scheduledDateTime,
        status: 'scheduled',
        participants: cleanedData.participants || [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      logger.info('Scheduled game created', { id: docRef.id });
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
 */
export async function getAllScheduledGames(includePast: boolean = false): Promise<ScheduledGame[]> {
  try {
    logger.info('Fetching scheduled games', { includePast });

    const games: ScheduledGame[] = [];

    if (isServerSide()) {
      let adminDb: ReturnType<typeof getFirestoreAdmin>;
      try {
        adminDb = getFirestoreAdmin();
      } catch (initError) {
        logger.error(initError instanceof Error ? initError : new Error(String(initError)), 'Failed to initialize Firestore Admin', {
          component: 'scheduledGameService',
          operation: 'getAllScheduledGames',
        });
        // Return empty array if initialization fails
        return [];
      }
      
      // Try to use the optimized query first, but fall back to in-memory filtering
      // if the index is still building or doesn't exist
      try {
        let adminQuery = adminDb.collection(SCHEDULED_GAMES_COLLECTION)
          .where('status', '==', 'scheduled')
          .orderBy('scheduledDateTime', 'asc');

        const querySnapshot = await adminQuery.get();

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const scheduledDateTime = data.scheduledDateTimeString || timestampToIso(data.scheduledDateTime);
          
          // Filter past games if includePast is false
          if (!includePast) {
            const gameDate = new Date(scheduledDateTime);
            if (gameDate < new Date()) {
              return;
            }
          }
          
          games.push({
          id: docSnap.id,
          scheduledByDiscordId: data.scheduledByDiscordId,
          scheduledByName: data.scheduledByName || 'Unknown',
          scheduledDateTime,
          timezone: data.timezone || 'UTC',
          teamSize: data.teamSize,
          customTeamSize: data.customTeamSize,
          gameType: data.gameType,
          modes: data.modes || [],
          participants: (data.participants || []).map((p: any) => ({
            discordId: p.discordId,
            name: p.name,
            joinedAt: timestampToIso(p.joinedAt),
          })),
          createdAt: timestampToIso(data.createdAt),
          updatedAt: timestampToIso(data.updatedAt),
          status: data.status || 'scheduled',
        });
        });
      } catch (error: unknown) {
        // If index is still building, fall back to fetching all and filtering in memory
        const firestoreError = error as { code?: number; message?: string };
        if (firestoreError?.code === 9 || firestoreError?.message?.includes('index is currently building')) {
          logger.info('Index still building, falling back to in-memory filtering');
          
          const querySnapshot = await adminDb.collection(SCHEDULED_GAMES_COLLECTION).get();

          querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            
            // Filter by status
            if (data.status !== 'scheduled') {
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
            
          games.push({
          id: docSnap.id,
          scheduledByDiscordId: data.scheduledByDiscordId,
          scheduledByName: data.scheduledByName || 'Unknown',
          scheduledDateTime,
          timezone: data.timezone || 'UTC',
          teamSize: data.teamSize,
          customTeamSize: data.customTeamSize,
          gameType: data.gameType,
          modes: data.modes || [],
          participants: (data.participants || []).map((p: any) => ({
            discordId: p.discordId,
            name: p.name,
            joinedAt: timestampToIso(p.joinedAt),
          })),
          createdAt: timestampToIso(data.createdAt),
          updatedAt: timestampToIso(data.updatedAt),
          status: data.status || 'scheduled',
        });
          });
          
          // Sort by scheduled date (ascending - upcoming first) in memory
          games.sort((a, b) => {
            const dateA = new Date(a.scheduledDateTime).getTime();
            const dateB = new Date(b.scheduledDateTime).getTime();
            return dateA - dateB; // Ascending order
          });
        } else {
          // Re-throw if it's a different error
          throw error;
        }
      }
    } else {
      const db = getFirestoreInstance();
      
      // Try the optimized query first
      try {
        let q = query(
          collection(db, SCHEDULED_GAMES_COLLECTION),
          where('status', '==', 'scheduled'),
          orderBy('scheduledDateTime', 'asc')
        );

        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const scheduledDateTime = data.scheduledDateTimeString || timestampToIso(data.scheduledDateTime as Timestamp);
          
          // Filter past games if includePast is false
          if (!includePast) {
            const gameDate = new Date(scheduledDateTime);
            if (gameDate < new Date()) {
              return;
            }
          }
          
          games.push({
          id: docSnap.id,
          scheduledByDiscordId: data.scheduledByDiscordId,
          scheduledByName: data.scheduledByName || 'Unknown',
          scheduledDateTime,
          timezone: data.timezone || 'UTC',
          teamSize: data.teamSize,
          customTeamSize: data.customTeamSize,
          gameType: data.gameType,
          modes: data.modes || [],
          participants: (data.participants || []).map((p: any) => ({
            discordId: p.discordId,
            name: p.name,
            joinedAt: timestampToIso(p.joinedAt),
          })),
          createdAt: timestampToIso(data.createdAt),
          updatedAt: timestampToIso(data.updatedAt),
          status: data.status || 'scheduled',
        });
        });
      } catch (error: unknown) {
        // If index is still building, fall back to fetching all and filtering in memory
        const firestoreError = error as { code?: string; message?: string };
        if (firestoreError?.code === 'failed-precondition' || firestoreError?.message?.includes('index')) {
          logger.info('Index still building, falling back to in-memory filtering');
          
          const querySnapshot = await getDocs(collection(db, SCHEDULED_GAMES_COLLECTION));

          querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            
            // Filter by status
            if (data.status !== 'scheduled') {
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
            
          games.push({
          id: docSnap.id,
          scheduledByDiscordId: data.scheduledByDiscordId,
          scheduledByName: data.scheduledByName || 'Unknown',
          scheduledDateTime,
          timezone: data.timezone || 'UTC',
          teamSize: data.teamSize,
          customTeamSize: data.customTeamSize,
          gameType: data.gameType,
          modes: data.modes || [],
          participants: (data.participants || []).map((p: any) => ({
            discordId: p.discordId,
            name: p.name,
            joinedAt: timestampToIso(p.joinedAt),
          })),
          createdAt: timestampToIso(data.createdAt),
          updatedAt: timestampToIso(data.updatedAt),
          status: data.status || 'scheduled',
        });
          });
          
          // Sort by scheduled date (ascending - upcoming first) in memory
          games.sort((a, b) => {
            const dateA = new Date(a.scheduledDateTime).getTime();
            const dateB = new Date(b.scheduledDateTime).getTime();
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
      const docRef = adminDb.collection(SCHEDULED_GAMES_COLLECTION).doc(id);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        logger.info('Scheduled game not found', { id });
        return null;
      }

      const data = docSnap.data();
      if (!data) {
        return null;
      }

      const scheduledDateTime = data.scheduledDateTimeString || timestampToIso(data.scheduledDateTime);
      
      return {
        id: docSnap.id,
        scheduledByDiscordId: data.scheduledByDiscordId,
        scheduledByName: data.scheduledByName || 'Unknown',
        scheduledDateTime,
        timezone: data.timezone || 'UTC',
        teamSize: data.teamSize,
        customTeamSize: data.customTeamSize,
        gameType: data.gameType,
        modes: data.modes || [],
        participants: (data.participants || []).map((p: any) => ({
          discordId: p.discordId,
          name: p.name,
          joinedAt: timestampToIso(p.joinedAt),
        })),
        createdAt: timestampToIso(data.createdAt),
        updatedAt: timestampToIso(data.updatedAt),
        status: data.status || 'scheduled',
      };
    } else {
      const db = getFirestoreInstance();
      const docRef = doc(db, SCHEDULED_GAMES_COLLECTION, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        logger.info('Scheduled game not found', { id });
        return null;
      }

      const data = docSnap.data();
      const scheduledDateTime = data.scheduledDateTimeString || timestampToIso(data.scheduledDateTime as Timestamp);
      
      return {
        id: docSnap.id,
        scheduledByDiscordId: data.scheduledByDiscordId,
        scheduledByName: data.scheduledByName || 'Unknown',
        scheduledDateTime,
        timezone: data.timezone || 'UTC',
        teamSize: data.teamSize,
        customTeamSize: data.customTeamSize,
        gameType: data.gameType,
        modes: data.modes || [],
        participants: (data.participants || []).map((p: any) => ({
          discordId: p.discordId,
          name: p.name,
          joinedAt: timestampToIso(p.joinedAt),
        })),
        createdAt: timestampToIso(data.createdAt),
        updatedAt: timestampToIso(data.updatedAt),
        status: data.status || 'scheduled',
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
export async function updateScheduledGame(id: string, updates: Partial<CreateScheduledGame>): Promise<void> {
  try {
    logger.info('Updating scheduled game', { id });

    const cleanedUpdates = removeUndefined(updates);
    const updateData: Record<string, unknown> = { ...cleanedUpdates };

    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      const adminTimestamp = getAdminTimestamp();
      
      if (cleanedUpdates.scheduledDateTime) {
        updateData.scheduledDateTime = adminTimestamp.fromDate(new Date(cleanedUpdates.scheduledDateTime));
        updateData.scheduledDateTimeString = cleanedUpdates.scheduledDateTime;
      }
      
      await adminDb.collection(SCHEDULED_GAMES_COLLECTION).doc(id).update({
        ...updateData,
        updatedAt: adminTimestamp.now(),
      });
    } else {
      const db = getFirestoreInstance();
      const docRef = doc(db, SCHEDULED_GAMES_COLLECTION, id);
      
      if (cleanedUpdates.scheduledDateTime) {
        updateData.scheduledDateTime = Timestamp.fromDate(new Date(cleanedUpdates.scheduledDateTime));
        updateData.scheduledDateTimeString = cleanedUpdates.scheduledDateTime;
      }
      
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
      await adminDb.collection(SCHEDULED_GAMES_COLLECTION).doc(id).delete();
    } else {
      const db = getFirestoreInstance();
      const docRef = doc(db, SCHEDULED_GAMES_COLLECTION, id);
      await deleteDoc(docRef);
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
      const gameRef = adminDb.collection(SCHEDULED_GAMES_COLLECTION).doc(gameId);
      
      // Get current game data
      const gameDoc = await gameRef.get();
      if (!gameDoc.exists) {
        throw new Error('Game not found');
      }
      
      const gameData = gameDoc.data();
      const participants = (gameData?.participants || []) as Array<{ discordId: string; name: string; joinedAt: any }>;
      
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
      const gameRef = doc(db, SCHEDULED_GAMES_COLLECTION, gameId);
      
      // Get current game data
      const gameDoc = await getDoc(gameRef);
      if (!gameDoc.exists()) {
        throw new Error('Game not found');
      }
      
      const gameData = gameDoc.data();
      const participants = (gameData?.participants || []) as Array<{ discordId: string; name: string; joinedAt: any }>;
      
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
      const gameRef = adminDb.collection(SCHEDULED_GAMES_COLLECTION).doc(gameId);
      
      // Get current game data
      const gameDoc = await gameRef.get();
      if (!gameDoc.exists) {
        throw new Error('Game not found');
      }
      
      const gameData = gameDoc.data();
      const participants = (gameData?.participants || []) as Array<{ discordId: string; name: string; joinedAt: any }>;
      
      // Remove user from participants
      const updatedParticipants = participants.filter(p => p.discordId !== discordId);
      
      await gameRef.update({
        participants: updatedParticipants,
        updatedAt: adminTimestamp.now(),
      });
    } else {
      const db = getFirestoreInstance();
      const gameRef = doc(db, SCHEDULED_GAMES_COLLECTION, gameId);
      
      // Get current game data
      const gameDoc = await getDoc(gameRef);
      if (!gameDoc.exists()) {
        throw new Error('Game not found');
      }
      
      const gameData = gameDoc.data();
      const participants = (gameData?.participants || []) as Array<{ discordId: string; name: string; joinedAt: any }>;
      
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

