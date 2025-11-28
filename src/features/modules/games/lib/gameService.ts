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
  QueryConstraint,
} from 'firebase/firestore';
import { getFirestoreInstance } from '@/features/infrastructure/api/firebase';
import { getFirestoreAdmin, isServerSide, getAdminTimestamp } from '@/features/infrastructure/api/firebase/admin';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import { removeUndefined } from '@/features/infrastructure/utils/objectUtils';
import { timestampToIso } from '@/features/infrastructure/utils/timestampUtils';
import type { 
  Game, 
  GamePlayer, 
  GamePlayerFlag, 
  GameWithPlayers, 
  CreateGame, 
  CreateScheduledGame,
  CreateCompletedGame,
  UpdateGame, 
  GameFilters, 
  GameListResponse,
  GameState,
  GameArchiveContent,
  TeamSize,
  GameType,
  ScheduledGameStatus,
} from '../types';
import { normalizePlayerName } from '../../players/lib/playerService';
import { updateEloScores } from './eloCalculator';

const GAMES_COLLECTION = 'games';
const logger = createComponentLogger('gameService');

/**
 * Get the next available game ID
 * Queries all games and finds the highest gameId, then increments by 1
 */
async function getNextGameId(): Promise<number> {
  try {
    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      const querySnapshot = await adminDb.collection(GAMES_COLLECTION)
        .orderBy('gameId', 'desc')
        .limit(1)
        .get();

      if (querySnapshot.empty) {
        return 1;
      }

      const lastGame = querySnapshot.docs[0].data();
      const lastId = lastGame.gameId || 0;
      return lastId + 1;
    } else {
      const db = getFirestoreInstance();
      const q = query(
        collection(db, GAMES_COLLECTION),
        orderBy('gameId', 'desc')
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return 1;
      }

      const lastGame = querySnapshot.docs[0].data();
      const lastId = lastGame.gameId || 0;
      return lastId + 1;
    }
  } catch (error) {
    logger.warn('Error getting next game ID, defaulting to 1', { error });
    return 1;
  }
}

/**
 * Convert game document from Firestore to Game type
 * Handles both scheduled and completed games
 */
function convertGameDoc(docData: Record<string, unknown>, id: string): Game {
  const gameState = (docData.gameState as GameState) || 'completed'; // Default to completed for backward compatibility
  
  const baseGame: Game = {
    id,
    gameId: typeof docData.gameId === 'number' ? docData.gameId : Number(docData.gameId) || 0,
    gameState,
    creatorName: typeof docData.creatorName === 'string' ? docData.creatorName : String(docData.creatorName || ''),
    createdByDiscordId: typeof docData.createdByDiscordId === 'string' ? docData.createdByDiscordId : undefined,
    createdAt: docData.createdAt,
    updatedAt: docData.updatedAt,
    submittedAt: docData.submittedAt,
    isDeleted: typeof docData.isDeleted === 'boolean' ? docData.isDeleted : false,
    deletedAt: docData.deletedAt || null,
  };

  // Add scheduled game fields if gameState is 'scheduled'
  if (gameState === 'scheduled') {
    return {
      ...baseGame,
      scheduledDateTime: docData.scheduledDateTime,
      timezone: typeof docData.timezone === 'string' ? docData.timezone : undefined,
      teamSize: (docData.teamSize as TeamSize | undefined),
      customTeamSize: typeof docData.customTeamSize === 'string' ? docData.customTeamSize : undefined,
      gameType: (docData.gameType as GameType | undefined),
      gameVersion: typeof docData.gameVersion === 'string' ? docData.gameVersion : undefined,
      gameLength: typeof docData.gameLength === 'number' ? docData.gameLength : undefined,
      modes: Array.isArray(docData.modes) ? docData.modes : [],
      participants: Array.isArray(docData.participants) ? docData.participants : [],
      status: (docData.status as ScheduledGameStatus | undefined),
    };
  }

  // Add completed game fields if gameState is 'completed'
  const playerNames = Array.isArray(docData.playerNames) 
    ? docData.playerNames.map(n => String(n))
    : undefined;
  const playerCount = typeof docData.playerCount === 'number' 
    ? docData.playerCount 
    : (playerNames ? playerNames.length : undefined);

  const completedGame: Game = {
    ...baseGame,
    datetime: docData.datetime,
    duration: typeof docData.duration === 'number' ? docData.duration : Number(docData.duration) || 0,
    gamename: typeof docData.gamename === 'string' ? docData.gamename : String(docData.gamename || ''),
    map: typeof docData.map === 'string' ? docData.map : String(docData.map || ''),
    ownername: typeof docData.ownername === 'string' ? docData.ownername : String(docData.ownername || ''),
    category: typeof docData.category === 'string' ? docData.category : undefined,
    replayUrl: typeof docData.replayUrl === 'string' ? docData.replayUrl : undefined,
    replayFileName: typeof docData.replayFileName === 'string' ? docData.replayFileName : undefined,
    playerNames,
    playerCount,
    verified: typeof docData.verified === 'boolean' ? docData.verified : false,
  };

  // Add archive content if present
  if (docData.archiveContent) {
    completedGame.archiveContent = docData.archiveContent as GameArchiveContent;
  }

  return completedGame;
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
    createdAt: timestampToIso(docData.createdAt as Timestamp | { toDate?: () => Date } | string | Date | undefined),
  };
}

/**
 * Create a new scheduled game
 */
export async function createScheduledGame(gameData: CreateScheduledGame): Promise<string> {
  try {
    // Get the next available game ID if not provided
    const gameId = gameData.gameId || await getNextGameId();
    
    logger.info('Creating scheduled game', { 
      gameId,
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
      
      const docRef = await adminDb.collection(GAMES_COLLECTION).add({
        ...cleanedData,
        gameId,
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
      logger.info('Scheduled game created', { id: docRef.id, gameId });
      return docRef.id;
    } else {
      const db = getFirestoreInstance();
      
      const scheduledDateTime = cleanedData.scheduledDateTime && typeof cleanedData.scheduledDateTime === 'string'
        ? Timestamp.fromDate(new Date(cleanedData.scheduledDateTime))
        : Timestamp.now();
      
      const docRef = await addDoc(collection(db, GAMES_COLLECTION), {
        ...cleanedData,
        gameId,
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
      logger.info('Scheduled game created', { id: docRef.id, gameId });
      return docRef.id;
    }
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to create scheduled game', {
      component: 'gameService',
      operation: 'createScheduledGame',
    });
    throw err;
  }
}

/**
 * Create a new completed game
 */
export async function createCompletedGame(gameData: CreateCompletedGame): Promise<string> {
  try {
    logger.info('Creating completed game', { gameId: gameData.gameId });

    // Validate required fields
    if (!gameData.gameId || !gameData.datetime || !gameData.players || gameData.players.length < 2) {
      throw new Error('Invalid game data: gameId, datetime, and at least 2 players are required');
    }

    // Check for duplicate gameId
    const existingGames = await getGames({ gameId: gameData.gameId, limit: 1 });
    if (existingGames.games.length > 0) {
      throw new Error(`Game with gameId ${gameData.gameId} already exists`);
    }

    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      const adminTimestamp = getAdminTimestamp();
      
      const gameDatetime = adminTimestamp.fromDate(new Date(gameData.datetime));
      
      // Extract player names for quick access
      const playerNames = gameData.players.map(p => p.name);
      const playerCount = gameData.players.length;
      
      // Create game document
      const baseGameDoc = {
        gameId: gameData.gameId,
        gameState: 'completed' as GameState,
        datetime: gameDatetime,
        duration: gameData.duration,
        gamename: gameData.gamename,
        map: gameData.map,
        creatorName: gameData.creatorName,
        ownername: gameData.ownername,
        category: gameData.category,
        playerNames,
        playerCount,
        ...(gameData.replayUrl ? { replayUrl: gameData.replayUrl } : {}),
        ...(gameData.replayFileName ? { replayFileName: gameData.replayFileName } : {}),
        ...(gameData.createdByDiscordId ? { createdByDiscordId: gameData.createdByDiscordId } : {}),
        ...(gameData.submittedAt ? { submittedAt: adminTimestamp.fromDate(new Date(gameData.submittedAt)) } : {}),
        verified: gameData.verified ?? false,
        ...(gameData.archiveContent ? { archiveContent: gameData.archiveContent } : {}),
        createdAt: adminTimestamp.now(),
        updatedAt: adminTimestamp.now(),
        isDeleted: false,
      };
      const gameDocRef = await adminDb.collection(GAMES_COLLECTION).add(baseGameDoc);

      // Create player documents in subcollection
      const playersCollection = gameDocRef.collection('players');
      for (const player of gameData.players) {
        await playersCollection.add({
          gameId: gameDocRef.id,
          name: player.name,
          pid: player.pid,
          flag: player.flag,
          category: gameData.category,
          class: player.class,
          randomClass: player.randomClass,
          kills: player.kills,
          deaths: player.deaths,
          assists: player.assists,
          gold: player.gold,
          damageDealt: player.damageDealt,
          damageTaken: player.damageTaken,
          createdAt: adminTimestamp.now(),
        });
      }

      // Update ELO scores
      try {
        await updateEloScores(gameData.players, gameData.category);
      } catch (eloError) {
        logger.warn('Failed to update ELO scores', { error: eloError });
      }

      logger.info('Completed game created', { id: gameDocRef.id, gameId: gameData.gameId });
      return gameDocRef.id;
    } else {
      const db = getFirestoreInstance();
      
      const gameDatetime = Timestamp.fromDate(new Date(gameData.datetime));
      
      // Extract player names for quick access
      const playerNames = gameData.players.map(p => p.name);
      const playerCount = gameData.players.length;
      
      // Create game document
      const baseGameDoc = {
        gameId: gameData.gameId,
        gameState: 'completed' as GameState,
        datetime: gameDatetime,
        duration: gameData.duration,
        gamename: gameData.gamename,
        map: gameData.map,
        creatorName: gameData.creatorName,
        ownername: gameData.ownername,
        category: gameData.category,
        playerNames,
        playerCount,
        ...(gameData.replayUrl ? { replayUrl: gameData.replayUrl } : {}),
        ...(gameData.replayFileName ? { replayFileName: gameData.replayFileName } : {}),
        ...(gameData.createdByDiscordId ? { createdByDiscordId: gameData.createdByDiscordId } : {}),
        ...(gameData.submittedAt ? { submittedAt: Timestamp.fromDate(new Date(gameData.submittedAt)) } : {}),
        verified: gameData.verified ?? false,
        ...(gameData.archiveContent ? { archiveContent: gameData.archiveContent } : {}),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isDeleted: false,
      };
      const gameDocRef = await addDoc(collection(db, GAMES_COLLECTION), baseGameDoc);

      // Create player documents in subcollection
      const playersCollection = collection(db, GAMES_COLLECTION, gameDocRef.id, 'players');
      for (const player of gameData.players) {
        await addDoc(playersCollection, {
          gameId: gameDocRef.id,
          name: player.name,
          pid: player.pid,
          flag: player.flag,
          category: gameData.category,
          class: player.class,
          randomClass: player.randomClass,
          kills: player.kills,
          deaths: player.deaths,
          assists: player.assists,
          gold: player.gold,
          damageDealt: player.damageDealt,
          damageTaken: player.damageTaken,
          createdAt: Timestamp.now(),
        });
      }

      // Update ELO scores
      try {
        await updateEloScores(gameData.players, gameData.category);
      } catch (eloError) {
        logger.warn('Failed to update ELO scores', { error: eloError });
      }

      logger.info('Completed game created', { id: gameDocRef.id, gameId: gameData.gameId });
      return gameDocRef.id;
    }
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to create completed game', {
      component: 'gameService',
      operation: 'createCompletedGame',
      gameId: gameData.gameId,
    });
    throw err;
  }
}

/**
 * Create a new game (legacy function - now calls createCompletedGame)
 * @deprecated Use createCompletedGame instead
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

    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      const adminTimestamp = getAdminTimestamp();
      
      const gameDatetime = adminTimestamp.fromDate(new Date(gameData.datetime));
      
      // Extract player names for quick access
      const playerNames = gameData.players.map(p => p.name);
      const playerCount = gameData.players.length;
      
      // Create game document
      const baseGameDoc = {
        gameId: gameData.gameId,
        datetime: gameDatetime,
        duration: gameData.duration,
        gamename: gameData.gamename,
        map: gameData.map,
        creatorName: gameData.creatorName,
        ownername: gameData.ownername,
        category: gameData.category,
        playerNames,
        playerCount,
        ...(gameData.replayUrl ? { replayUrl: gameData.replayUrl } : {}),
        ...(gameData.replayFileName ? { replayFileName: gameData.replayFileName } : {}),
        ...(gameData.createdByDiscordId ? { createdByDiscordId: gameData.createdByDiscordId } : {}),
        ...(gameData.submittedAt ? { submittedAt: adminTimestamp.fromDate(new Date(gameData.submittedAt)) } : {}),
        ...(gameData.scheduledGameId ? { scheduledGameId: gameData.scheduledGameId } : {}),
        verified: false,
        createdAt: adminTimestamp.now(),
        updatedAt: adminTimestamp.now(),
      };
      const gameDocRef = await adminDb.collection(GAMES_COLLECTION).add(baseGameDoc);

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
          randomClass: player.randomClass,
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
      
      // Extract player names for quick access
      const playerNames = gameData.players.map(p => p.name);
      const playerCount = gameData.players.length;
      
      // Create game document
      const baseGameDoc = {
        gameId: gameData.gameId,
        datetime: gameDatetime,
        duration: gameData.duration,
        gamename: gameData.gamename,
        map: gameData.map,
        creatorName: gameData.creatorName,
        ownername: gameData.ownername,
        category: gameData.category,
        playerNames,
        playerCount,
        ...(gameData.replayUrl ? { replayUrl: gameData.replayUrl } : {}),
        ...(gameData.replayFileName ? { replayFileName: gameData.replayFileName } : {}),
        ...(gameData.createdByDiscordId ? { createdByDiscordId: gameData.createdByDiscordId } : {}),
        ...(gameData.submittedAt ? { submittedAt: Timestamp.fromDate(new Date(gameData.submittedAt)) } : {}),
        ...(gameData.scheduledGameId ? { scheduledGameId: gameData.scheduledGameId } : {}),
        verified: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      const gameDocRef = await addDoc(collection(db, GAMES_COLLECTION), baseGameDoc);

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
          randomClass: player.randomClass,
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
      gameId,
      limit = 20,
      cursor,
    } = filters;

    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      let gamesQuery = adminDb.collection(GAMES_COLLECTION);

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
      if (gameId !== undefined) {
        gamesQuery = gamesQuery.where('gameId', '==', gameId);
        // When filtering by gameId (which should be unique), we don't need to order
        // This avoids requiring a composite index
      } else {
        // Order by datetime descending only when not filtering by gameId
        gamesQuery = gamesQuery.orderBy('datetime', 'desc');
      }

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
      if (player) {
        // This requires fetching players for each game - not optimal
        // For now, we'll do basic filtering
        // const playerNames = player.split(',').map(n => normalizePlayerName(n.trim()));
      }

      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      const hasMore = snapshot.docs.length === limit;

      return {
        games,
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
      if (gameId !== undefined) {
        constraints.push(where('gameId', '==', gameId));
        // When filtering by gameId (which should be unique), we don't need to order
        // This avoids requiring a composite index
      } else {
        // Order by datetime descending only when not filtering by gameId
        constraints.push(orderBy('datetime', 'desc'));
      }

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
