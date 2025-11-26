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
  limit as firestoreLimit,
  startAfter,
  QueryDocumentSnapshot,
  QueryConstraint,
} from 'firebase/firestore';
import { getFirestoreInstance } from '@/features/infrastructure/api/firebase';
import { getFirestoreAdmin, isServerSide, getAdminTimestamp } from '@/features/infrastructure/api/firebase/admin';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import type { Game, GamePlayer, GamePlayerFlag, GameWithPlayers, CreateGame, UpdateGame, GameFilters, GameListResponse } from '../types';
import { normalizePlayerName } from '../../players/lib/playerService';
import { updateEloScores } from './eloCalculator';

const GAMES_COLLECTION = 'games';
const logger = createComponentLogger('gameService');

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
 * Convert game document from Firestore to Game type
 */
function convertGameDoc(docData: Record<string, unknown>, id: string): Game {
  return {
    id,
    gameId: typeof docData.gameId === 'number' ? docData.gameId : Number(docData.gameId) || 0,
    datetime: timestampToIso(docData.datetime as Timestamp | TimestampLike | string | Date | undefined),
    duration: typeof docData.duration === 'number' ? docData.duration : Number(docData.duration) || 0,
    gamename: typeof docData.gamename === 'string' ? docData.gamename : String(docData.gamename || ''),
    map: typeof docData.map === 'string' ? docData.map : String(docData.map || ''),
    creatorname: typeof docData.creatorname === 'string' ? docData.creatorname : String(docData.creatorname || ''),
    ownername: typeof docData.ownername === 'string' ? docData.ownername : String(docData.ownername || ''),
    category: typeof docData.category === 'string' ? docData.category : undefined,
    replayUrl: typeof docData.replayUrl === 'string' ? docData.replayUrl : undefined,
    replayFileName: typeof docData.replayFileName === 'string' ? docData.replayFileName : undefined,
    submittedBy: typeof docData.submittedBy === 'string' ? docData.submittedBy : undefined,
    submittedAt: timestampToIso(docData.submittedAt as Timestamp | TimestampLike | string | Date | undefined),
    scheduledGameId: typeof docData.scheduledGameId === 'number' ? docData.scheduledGameId : (docData.scheduledGameId ? Number(docData.scheduledGameId) : undefined),
    verified: typeof docData.verified === 'boolean' ? docData.verified : false,
    createdAt: timestampToIso(docData.createdAt as Timestamp | TimestampLike | string | Date | undefined),
    updatedAt: timestampToIso(docData.updatedAt as Timestamp | TimestampLike | string | Date | undefined),
  };
}

/**
 * Convert game player document from Firestore to GamePlayer type
 */
function convertGamePlayerDoc(docData: Record<string, unknown>, id: string): GamePlayer {
  return {
    id,
    gameId: typeof docData.gameId === 'string' ? docData.gameId : String(docData.gameId || ''),
    name: typeof docData.name === 'string' ? docData.name : String(docData.name || ''),
    pid: typeof docData.pid === 'number' ? docData.pid : Number(docData.pid) || 0,
    flag: (typeof docData.flag === 'string' && (docData.flag === 'winner' || docData.flag === 'loser' || docData.flag === 'drawer')) 
      ? docData.flag as GamePlayerFlag 
      : 'drawer',
    category: typeof docData.category === 'string' ? docData.category : undefined,
    elochange: typeof docData.elochange === 'number' ? docData.elochange : undefined,
    eloBefore: typeof docData.eloBefore === 'number' ? docData.eloBefore : undefined,
    eloAfter: typeof docData.eloAfter === 'number' ? docData.eloAfter : undefined,
    class: typeof docData.class === 'string' ? docData.class : undefined,
    randomClass: typeof docData.randomClass === 'boolean' ? docData.randomClass : undefined,
    kills: typeof docData.kills === 'number' ? docData.kills : undefined,
    deaths: typeof docData.deaths === 'number' ? docData.deaths : undefined,
    assists: typeof docData.assists === 'number' ? docData.assists : undefined,
    gold: typeof docData.gold === 'number' ? docData.gold : undefined,
    damageDealt: typeof docData.damageDealt === 'number' ? docData.damageDealt : undefined,
    damageTaken: typeof docData.damageTaken === 'number' ? docData.damageTaken : undefined,
    createdAt: timestampToIso(docData.createdAt as Timestamp | TimestampLike | string | Date | undefined),
  };
}

/**
 * Create a new game
 */
export async function createGame(gameData: CreateGame): Promise<string> {
  try {
    logger.info('Creating game', { gameId: gameData.gameId });

    // Validate required fields
    if (!gameData.gameId || !gameData.datetime || !gameData.players || gameData.players.length < 2) {
      throw new Error('Invalid game data: gameId, datetime, and at least 2 players are required');
    }

    // Check for duplicate gameId
    const existingGames = await getGames({ player: gameData.players[0]?.name, limit: 1000 });
    const duplicate = existingGames.games.find(g => g.gameId === gameData.gameId);
    if (duplicate) {
      throw new Error(`Game with gameId ${gameData.gameId} already exists`);
    }

    const cleanedData = removeUndefined(gameData as unknown as Record<string, unknown>);
    
    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      const adminTimestamp = getAdminTimestamp();
      
      const gameDatetime = adminTimestamp.fromDate(new Date(gameData.datetime));
      
      // Create game document
      const gameDocRef = await adminDb.collection(GAMES_COLLECTION).add({
        gameId: gameData.gameId,
        datetime: gameDatetime,
        duration: gameData.duration,
        gamename: gameData.gamename,
        map: gameData.map,
        creatorname: gameData.creatorname,
        ownername: gameData.ownername,
        category: gameData.category,
        verified: false,
        createdAt: adminTimestamp.now(),
        updatedAt: adminTimestamp.now(),
      });

      // Create player documents in subcollection
      const playersCollection = gameDocRef.collection('players');
      for (const player of gameData.players) {
        const playerData = removeUndefined({
          gameId: gameDocRef.id,
          name: player.name,
          pid: player.pid,
          flag: player.flag,
          category: gameData.category,
          class: player.class,
          kills: player.kills,
          deaths: player.deaths,
          assists: player.assists,
          gold: player.gold,
          damageDealt: player.damageDealt,
          damageTaken: player.damageTaken,
          createdAt: adminTimestamp.now(),
        } as Record<string, unknown>);
        await playersCollection.add(playerData);
      }

      // Update ELO scores for all players
      await updateEloScores(gameDocRef.id);

      logger.info('Game created', { id: gameDocRef.id, gameId: gameData.gameId });
      return gameDocRef.id;
    } else {
      const db = getFirestoreInstance();
      
      const gameDatetime = Timestamp.fromDate(new Date(gameData.datetime));
      
      // Create game document
      const gameDocRef = await addDoc(collection(db, GAMES_COLLECTION), {
        gameId: gameData.gameId,
        datetime: gameDatetime,
        duration: gameData.duration,
        gamename: gameData.gamename,
        map: gameData.map,
        creatorname: gameData.creatorname,
        ownername: gameData.ownername,
        category: gameData.category,
        verified: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Create player documents in subcollection
      const playersCollection = collection(db, GAMES_COLLECTION, gameDocRef.id, 'players');
      for (const player of gameData.players) {
        const playerData = removeUndefined({
          gameId: gameDocRef.id,
          name: player.name,
          pid: player.pid,
          flag: player.flag,
          category: gameData.category,
          class: player.class,
          kills: player.kills,
          deaths: player.deaths,
          assists: player.assists,
          gold: player.gold,
          damageDealt: player.damageDealt,
          damageTaken: player.damageTaken,
          createdAt: Timestamp.now(),
        } as Record<string, unknown>);
        await addDoc(playersCollection, playerData);
      }

      // Update ELO scores for all players
      await updateEloScores(gameDocRef.id);

      logger.info('Game created', { id: gameDocRef.id, gameId: gameData.gameId });
      return gameDocRef.id;
    }
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to create game', {
      component: 'gameService',
      operation: 'createGame',
      gameId: gameData.gameId,
    });
    throw err;
  }
}

/**
 * Get a game by ID
 */
export async function getGameById(id: string): Promise<GameWithPlayers | null> {
  try {
    logger.info('Fetching game by ID', { id });

    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      const gameDoc = await adminDb.collection(GAMES_COLLECTION).doc(id).get();

      if (!gameDoc.exists) {
        logger.info('Game not found', { id });
        return null;
      }

      const gameData = gameDoc.data();
      if (!gameData) {
        return null;
      }

      // Get players
      const playersSnapshot = await gameDoc.ref.collection('players').get();
      const players: GamePlayer[] = [];
      playersSnapshot.forEach((playerDoc) => {
        players.push(convertGamePlayerDoc(playerDoc.data(), playerDoc.id));
      });

      // Sort players by pid
      players.sort((a, b) => a.pid - b.pid);

      return {
        ...convertGameDoc(gameData, gameDoc.id),
        players,
      };
    } else {
      const db = getFirestoreInstance();
      const gameDocRef = doc(db, GAMES_COLLECTION, id);
      const gameDoc = await getDoc(gameDocRef);

      if (!gameDoc.exists()) {
        logger.info('Game not found', { id });
        return null;
      }

      const gameData = gameDoc.data();
      if (!gameData) {
        return null;
      }

      // Get players
      const playersCollection = collection(db, GAMES_COLLECTION, id, 'players');
      const playersSnapshot = await getDocs(playersCollection);
      const players: GamePlayer[] = [];
      playersSnapshot.forEach((playerDoc) => {
        players.push(convertGamePlayerDoc(playerDoc.data(), playerDoc.id));
      });

      // Sort players by pid
      players.sort((a, b) => a.pid - b.pid);

      return {
        ...convertGameDoc(gameData, gameDoc.id),
        players,
      };
    }
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to fetch game by ID', {
      component: 'gameService',
      operation: 'getGameById',
      id,
    });
    throw err;
  }
}

/**
 * Get games with filters
 */
export async function getGames(filters: GameFilters = {}): Promise<GameListResponse> {
  try {
    logger.info('Fetching games', { filters });

    const {
      startDate,
      endDate,
      category,
      player,
      ally,
      enemy,
      teamFormat,
      page = 1,
      limit = 20,
      cursor,
    } = filters;

    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let gamesQuery: any = adminDb.collection(GAMES_COLLECTION);

      // Apply filters
      if (startDate) {
        gamesQuery = gamesQuery.where('datetime', '>=', getAdminTimestamp().fromDate(new Date(startDate)));
      }
      if (endDate) {
        gamesQuery = gamesQuery.where('datetime', '<=', getAdminTimestamp().fromDate(new Date(endDate)));
      }
      if (category) {
        gamesQuery = gamesQuery.where('category', '==', category);
      }

      // Order by datetime descending
      gamesQuery = gamesQuery.orderBy('datetime', 'desc');

      // Apply pagination
      if (cursor) {
        // TODO: Implement cursor-based pagination
      }
      gamesQuery = gamesQuery.limit(limit);

      const snapshot = await gamesQuery.get();
      const games: Game[] = [];
      snapshot.forEach((doc: { data: () => Record<string, unknown>; id: string }) => {
        games.push(convertGameDoc(doc.data(), doc.id));
      });

      // Filter by player names if specified (client-side filtering for now)
      // TODO: Optimize with proper Firestore queries
      const filteredGames = games;
      if (player) {
        const playerNames = player.split(',').map(n => normalizePlayerName(n.trim()));
        // This requires fetching players for each game - not optimal
        // For now, we'll do basic filtering
      }

      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      const hasMore = snapshot.docs.length === limit;

      return {
        games: filteredGames,
        nextCursor: hasMore && lastDoc ? lastDoc.id : undefined,
        hasMore,
      };
    } else {
      const db = getFirestoreInstance();
      const constraints: QueryConstraint[] = [];

      // Apply filters
      if (startDate) {
        constraints.push(where('datetime', '>=', Timestamp.fromDate(new Date(startDate))));
      }
      if (endDate) {
        constraints.push(where('datetime', '<=', Timestamp.fromDate(new Date(endDate))));
      }
      if (category) {
        constraints.push(where('category', '==', category));
      }

      // Order by datetime descending
      constraints.push(orderBy('datetime', 'desc'));

      // Apply pagination
      constraints.push(firestoreLimit(limit));

      const gamesQuery = query(collection(db, GAMES_COLLECTION), ...constraints);
      const snapshot = await getDocs(gamesQuery);

      const games: Game[] = [];
      snapshot.forEach((doc) => {
        games.push(convertGameDoc(doc.data(), doc.id));
      });

      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      const hasMore = snapshot.docs.length === limit;

      return {
        games,
        nextCursor: hasMore && lastDoc ? lastDoc.id : undefined,
        hasMore,
      };
    }
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to fetch games', {
      component: 'gameService',
      operation: 'getGames',
      filters,
    });
    throw err;
  }
}

/**
 * Update a game
 */
export async function updateGame(id: string, updates: UpdateGame): Promise<void> {
  try {
    logger.info('Updating game', { id, updates });

    const cleanedUpdates = removeUndefined(updates as unknown as Record<string, unknown>);
    const updateData: Record<string, unknown> = { ...cleanedUpdates };

    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      const adminTimestamp = getAdminTimestamp();

      if (cleanedUpdates.datetime) {
        updateData.datetime = adminTimestamp.fromDate(new Date(cleanedUpdates.datetime as string));
      }

      await adminDb.collection(GAMES_COLLECTION).doc(id).update({
        ...updateData,
        updatedAt: adminTimestamp.now(),
      });

      // Recalculate ELO if game result changed
      if (cleanedUpdates.players) {
        await updateEloScores(id);
      }
    } else {
      const db = getFirestoreInstance();
      const docRef = doc(db, GAMES_COLLECTION, id);

      if (cleanedUpdates.datetime) {
        updateData.datetime = Timestamp.fromDate(new Date(cleanedUpdates.datetime as string));
      }

      await updateDoc(docRef, {
        ...updateData,
        updatedAt: Timestamp.now(),
      });

      // Recalculate ELO if game result changed
      if (cleanedUpdates.players) {
        await updateEloScores(id);
      }
    }

    logger.info('Game updated', { id });
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to update game', {
      component: 'gameService',
      operation: 'updateGame',
      id,
    });
    throw err;
  }
}

/**
 * Delete a game
 */
export async function deleteGame(id: string): Promise<void> {
  try {
    logger.info('Deleting game', { id });

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

    logger.info('Game deleted', { id });
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
