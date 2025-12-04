/**
 * Game Service - Create Operations (Server-Only)
 * 
 * Server-only functions for creating games.
 * These functions use Firebase Admin SDK and should only be used in API routes.
 */

import { Timestamp } from 'firebase/firestore';
import { getFirestoreAdmin, getAdminTimestamp } from '@/features/infrastructure/api/firebase/admin';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import { removeUndefined } from '@/features/infrastructure/utils';
import { invalidateAnalyticsCache } from '@/features/infrastructure/lib/cache/analyticsCache.server';
import type {
  CreateGame,
  CreateScheduledGame,
  CreateCompletedGame,
  GameState,
} from '../types';
import { updateEloScores } from '@/features/modules/game-management/lib/mechanics';
import { getNextGameId } from './gameService.utils.server';
import { getGames } from './gameService.read.server';

const GAMES_COLLECTION = 'games';
const logger = createComponentLogger('gameService');

/**
 * Create a new scheduled game (Server-Only)
 */
export async function createScheduledGame(gameData: CreateScheduledGame): Promise<string> {
  try {
    // Get the next available game ID if not provided
    let gameId: number;
    try {
      gameId = gameData.gameId || await getNextGameId();
      logger.info('Game ID determined', { gameId, provided: !!gameData.gameId });
    } catch (gameIdError) {
      logError(gameIdError as Error, 'Failed to get next game ID', {
        component: 'gameService',
        operation: 'createScheduledGame',
        step: 'getNextGameId',
      });
      throw new Error('Failed to generate game ID. Please try again.');
    }

    const cleanedData = removeUndefined(gameData as unknown as Record<string, unknown>);
    const adminDb = getFirestoreAdmin();
    const adminTimestamp = getAdminTimestamp();

    const scheduledDateTime = cleanedData.scheduledDateTime && typeof cleanedData.scheduledDateTime === 'string'
      ? adminTimestamp.fromDate(new Date(cleanedData.scheduledDateTime))
      : adminTimestamp.now();

    try {
      const gameDoc = {
        ...cleanedData,
        gameId,
        gameState: 'scheduled',
        creatorName: cleanedData.creatorName || 'Unknown',
        createdByDiscordId: cleanedData.createdByDiscordId || '',
        scheduledDateTime,
        scheduledDateTimeString: cleanedData.scheduledDateTime,
        ...(cleanedData.submittedAt ? {
          submittedAt: cleanedData.submittedAt instanceof Timestamp
            ? adminTimestamp.fromDate(cleanedData.submittedAt.toDate())
            : adminTimestamp.fromDate(new Date(cleanedData.submittedAt as string))
        } : {}),
        participants: cleanedData.participants || [],
        createdAt: adminTimestamp.now(),
        updatedAt: adminTimestamp.now(),
        isDeleted: false,
      };

      logger.info('Creating scheduled game document', { gameId, scheduledDateTime: cleanedData.scheduledDateTime });
      const docRef = await adminDb.collection(GAMES_COLLECTION).add(gameDoc);
      logger.info('Scheduled game created', { id: docRef.id, gameId });
      return docRef.id;
    } catch (writeError) {
      logError(writeError as Error, 'Failed to write scheduled game to Firestore', {
        component: 'gameService',
        operation: 'createScheduledGame',
        step: 'firestoreWrite',
        gameId,
        errorCode: (writeError as { code?: string }).code,
      });
      throw new Error('Failed to create scheduled game. Please check your data and try again.');
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
 * Create a new completed game (Server-Only)
 */
export async function createCompletedGame(gameData: CreateCompletedGame): Promise<string> {
  try {
    // Validate required fields
    if (!gameData.gameId || !gameData.datetime || !gameData.players || gameData.players.length < 2) {
      throw new Error('Invalid game data: gameId, datetime, and at least 2 players are required');
    }

    // Check for duplicate gameId
    const existingGames = await getGames({ gameId: gameData.gameId, limit: 1 });
    if (existingGames.games.length > 0) {
      throw new Error(`Game with gameId ${gameData.gameId} already exists`);
    }

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
      ...(gameData.submittedAt ? {
        submittedAt: gameData.submittedAt instanceof Timestamp
          ? adminTimestamp.fromDate(gameData.submittedAt.toDate())
          : adminTimestamp.fromDate(new Date(gameData.submittedAt))
      } : {}),
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
        // ITT-specific stats (schema v2+)
        selfHealing: player.selfHealing,
        allyHealing: player.allyHealing,
        meatEaten: player.meatEaten,
        goldAcquired: player.goldAcquired,
        // Animal kill counts
        killsElk: player.killsElk,
        killsHawk: player.killsHawk,
        killsSnake: player.killsSnake,
        killsWolf: player.killsWolf,
        killsBear: player.killsBear,
        killsPanther: player.killsPanther,
        createdAt: adminTimestamp.now(),
      } as Record<string, unknown>);
      await playersCollection.add(playerData);
    }

    // Update ELO scores
    try {
      await updateEloScores(gameDocRef.id);
    } catch (eloError) {
      logger.warn('Failed to update ELO scores', { error: eloError });
    }

    // Invalidate analytics cache for this category
    invalidateAnalyticsCache(gameData.category).catch(() => {
      // Ignore cache invalidation errors
    });

    logger.info('Completed game created', { id: gameDocRef.id, gameId: gameData.gameId });
    return gameDocRef.id;
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
 * Create a new game (legacy function - now calls createCompletedGame) (Server-Only)
 * @deprecated Use createCompletedGame instead
 */
export async function createGame(gameData: CreateGame): Promise<string> {
  try {
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
      ...(gameData.submittedAt ? {
        submittedAt: gameData.submittedAt instanceof Timestamp
          ? adminTimestamp.fromDate(gameData.submittedAt.toDate())
          : adminTimestamp.fromDate(new Date(gameData.submittedAt as string))
      } : {}),
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

    // Invalidate analytics cache
    invalidateAnalyticsCache(gameData.category).catch(() => { });

    logger.info('Game created', { id: gameDocRef.id, gameId: gameData.gameId });
    return gameDocRef.id;
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

