/**
 * Game Service - Read Operations (Server-Only)
 * 
 * Server-only functions for reading games.
 * These functions use Firebase Admin SDK and should only be used in API routes.
 */

import { getFirestoreAdmin } from '@/features/infrastructure/api/firebase/admin';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import type {
  Game,
  GamePlayer,
  GameWithPlayers,
  GameFilters,
  GameListResponse,
} from '../types';
import { convertGameDoc, convertGamePlayerDoc } from './gameService.utils';

const GAMES_COLLECTION = 'games';
const logger = createComponentLogger('gameService');

/**
 * Get a game by ID (Server-Only)
 */
export async function getGameById(id: string): Promise<GameWithPlayers | null> {
  try {
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

    // Filter out deleted games
    if (gameData.isDeleted === true) {
      logger.info('Game is deleted', { id });
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
 * Batch fetch players for multiple games (Server-Only)
 * Much more efficient than calling getGameById for each game
 */
export async function batchGetPlayersForGames(
  gameIds: string[]
): Promise<Map<string, GamePlayer[]>> {
  if (gameIds.length === 0) {
    return new Map();
  }

  const result = new Map<string, GamePlayer[]>();

  try {
    const adminDb = getFirestoreAdmin();

    // Fetch players for all games in parallel
    const playerPromises = gameIds.map(async (gameId) => {
      const playersSnapshot = await adminDb
        .collection(GAMES_COLLECTION)
        .doc(gameId)
        .collection('players')
        .get();

      const players: GamePlayer[] = [];
      playersSnapshot.forEach((playerDoc) => {
        players.push(convertGamePlayerDoc(playerDoc.data(), playerDoc.id));
      });

      // Sort by pid
      players.sort((a, b) => a.pid - b.pid);

      return { gameId, players };
    });

    const results = await Promise.all(playerPromises);
    results.forEach(({ gameId, players }) => {
      result.set(gameId, players);
    });

    logger.debug('Batch fetched players', {
      gameCount: gameIds.length,
      totalPlayers: Array.from(result.values()).reduce((sum, p) => sum + p.length, 0)
    });

    return result;
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to batch fetch players', {
      component: 'gameService',
      operation: 'batchGetPlayersForGames',
      gameCount: gameIds.length,
    });
    throw err;
  }
}

/**
 * Get games with their players included (Server-Only)
 * More efficient than calling getGameById for each game
 */
export async function getGamesWithPlayers(
  filters: GameFilters = {}
): Promise<{ games: GameWithPlayers[]; nextCursor?: string; hasMore: boolean }> {
  // Get games first
  const gamesResult = await getGames(filters);

  if (gamesResult.games.length === 0) {
    return { games: [], nextCursor: gamesResult.nextCursor, hasMore: gamesResult.hasMore };
  }

  // Batch fetch all players
  const gameIds = gamesResult.games.map(g => g.id);
  const playersMap = await batchGetPlayersForGames(gameIds);

  // Combine games with their players
  const gamesWithPlayers: GameWithPlayers[] = gamesResult.games.map(game => ({
    ...game,
    players: playersMap.get(game.id) || [],
  }));

  return {
    games: gamesWithPlayers,
    nextCursor: gamesResult.nextCursor,
    hasMore: gamesResult.hasMore,
  };
}

/**
 * Get games with filters (Server-Only)
 */
export async function getGames(filters: GameFilters = {}): Promise<GameListResponse> {
  try {
    logger.info('Fetching games', { filters });

    const {
      gameState,
      startDate,
      endDate,
      category,
      player,
      gameId,
      limit = 20,
      cursor,
    } = filters;

    const adminDb = getFirestoreAdmin();
    const { createTimestampFactoryAsync } = await import('@/features/infrastructure/utils');
    const timestampFactory = await createTimestampFactoryAsync();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let gamesQuery: any = adminDb.collection(GAMES_COLLECTION);

    // Apply filters
    // Always filter out deleted games
    gamesQuery = gamesQuery.where('isDeleted', '==', false);

    if (gameState) {
      gamesQuery = gamesQuery.where('gameState', '==', gameState);

      if (gameState === 'scheduled') {
        // For scheduled games, filter by scheduledDateTime
        if (startDate) {
          gamesQuery = gamesQuery.where('scheduledDateTime', '>=', timestampFactory.fromDate(new Date(startDate)));
        }
        if (endDate) {
          gamesQuery = gamesQuery.where('scheduledDateTime', '<=', timestampFactory.fromDate(new Date(endDate)));
        }
        if (gameId !== undefined) {
          gamesQuery = gamesQuery.where('gameId', '==', gameId);
        } else {
          // Note: This requires a composite index on (gameState, isDeleted, scheduledDateTime)
          // If index doesn't exist or is building, the outer try-catch will use fallback
          gamesQuery = gamesQuery.orderBy('scheduledDateTime', 'asc');
        }
      } else if (gameState === 'completed') {
        // For completed games, filter by datetime
        if (startDate) {
          gamesQuery = gamesQuery.where('datetime', '>=', timestampFactory.fromDate(new Date(startDate)));
        }
        if (endDate) {
          gamesQuery = gamesQuery.where('datetime', '<=', timestampFactory.fromDate(new Date(endDate)));
        }
        if (category) {
          gamesQuery = gamesQuery.where('category', '==', category);
        }
        if (gameId !== undefined) {
          gamesQuery = gamesQuery.where('gameId', '==', gameId);
        } else {
          // Note: This requires a composite index on (gameState, isDeleted, datetime)
          // If index doesn't exist or is building, the outer try-catch will use fallback
          gamesQuery = gamesQuery.orderBy('datetime', 'desc');
        }
      }
    } else {
      // When gameState is not specified, we can't use datetime or scheduledDateTime filters
      // because they're on different fields. Filter by gameId if provided, otherwise
      // we'll need to fetch all and filter in memory (or require gameState to be specified)
      if (gameId !== undefined) {
        gamesQuery = gamesQuery.where('gameId', '==', gameId);
      } else {
        // Without gameState, we can't order by datetime or scheduledDateTime
        // Default to ordering by createdAt descending (requires index on isDeleted, createdAt)
        // If index doesn't exist, the outer try-catch will use fallback
        gamesQuery = gamesQuery.orderBy('createdAt', 'desc');
      }
      // Note: startDate/endDate and category filters are ignored when gameState is not specified
      // because they apply to different fields for scheduled vs completed games
    }

    // Apply pagination
    if (cursor) {
      // TODO: Implement cursor-based pagination
    }
    gamesQuery = gamesQuery.limit(limit);

    let snapshot;
    let needsInMemorySort = false;
    try {
      snapshot = await gamesQuery.get();
    } catch (queryError) {
      // If query fails (likely due to missing index), try a simpler query without orderBy
      const error = queryError as { code?: number; message?: string };
      if (error?.code === 9 || error?.message?.includes('index')) {
        // Index missing/building - using fallback query (this is expected during development)
        // Fallback: query without orderBy (will sort in memory)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let fallbackQuery: any = adminDb.collection(GAMES_COLLECTION)
          .where('isDeleted', '==', false);
        if (gameState) {
          fallbackQuery = fallbackQuery.where('gameState', '==', gameState);
        }
        if (gameId !== undefined) {
          fallbackQuery = fallbackQuery.where('gameId', '==', gameId);
        }
        // Don't use orderBy in fallback - will sort in memory instead
        fallbackQuery = fallbackQuery.limit(limit * 2); // Get more to account for no ordering
        snapshot = await fallbackQuery.get();
        needsInMemorySort = true;
      } else {
        throw queryError;
      }
    }

    const games: Game[] = [];
    snapshot.forEach((doc: { data: () => Record<string, unknown>; id: string }) => {
      const game = convertGameDoc(doc.data(), doc.id);
      // Double-check isDeleted in case query didn't filter it
      if (!game.isDeleted) {
        games.push(game);
      }
    });

    // Sort in memory if fallback was used
    if (needsInMemorySort) {
      games.sort((a, b) => {
        if (a.gameState === 'scheduled' && b.gameState === 'scheduled') {
          const dateA = a.scheduledDateTime
            ? (typeof a.scheduledDateTime === 'string'
              ? new Date(a.scheduledDateTime).getTime()
              : a.scheduledDateTime.toMillis())
            : 0;
          const dateB = b.scheduledDateTime
            ? (typeof b.scheduledDateTime === 'string'
              ? new Date(b.scheduledDateTime).getTime()
              : b.scheduledDateTime.toMillis())
            : 0;
          return dateA - dateB; // Ascending for scheduled games
        }
        if (a.gameState === 'completed' && b.gameState === 'completed') {
          const dateA = a.datetime
            ? (typeof a.datetime === 'string'
              ? new Date(a.datetime).getTime()
              : a.datetime.toMillis())
            : 0;
          const dateB = b.datetime
            ? (typeof b.datetime === 'string'
              ? new Date(b.datetime).getTime()
              : b.datetime.toMillis())
            : 0;
          return dateB - dateA; // Descending for completed games
        }
        // Fallback to createdAt
        const dateA = typeof a.createdAt === 'string'
          ? new Date(a.createdAt).getTime()
          : // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (a.createdAt as any)?.toMillis?.() || 0;
        const dateB = typeof b.createdAt === 'string'
          ? new Date(b.createdAt).getTime()
          : // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (b.createdAt as any)?.toMillis?.() || 0;
        return dateB - dateA;
      });
      // Limit after sorting
      games.splice(limit);
    }

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

