import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  orderBy,
  where,
  Timestamp,
  limit as firestoreLimit,
  QueryConstraint,
} from 'firebase/firestore';
import { getFirestoreInstance } from '@/features/infrastructure/api/firebase';
import { getFirestoreAdmin, isServerSide } from '@/features/infrastructure/api/firebase/admin';
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
 * Get a game by ID
 */
export async function getGameById(id: string): Promise<GameWithPlayers | null> {
  try {
    // Reduced logging verbosity

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

      // Filter out deleted games
      if (gameData.isDeleted === true) {
        logger.info('Game is deleted', { id });
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
      gameState,
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
      const { createTimestampFactoryAsync } = await import('@/features/infrastructure/utils/timestampUtils');
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
      
      // Debug logging removed - too verbose for production
      
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
    } else {
      const db = getFirestoreInstance();
      const constraints: QueryConstraint[] = [];

      // Apply filters
      // Always filter out deleted games
      constraints.push(where('isDeleted', '==', false));
      
      if (gameState) {
        constraints.push(where('gameState', '==', gameState));
        
        if (gameState === 'scheduled') {
          // For scheduled games, filter by scheduledDateTime
          if (startDate) {
            constraints.push(where('scheduledDateTime', '>=', Timestamp.fromDate(new Date(startDate))));
          }
          if (endDate) {
            constraints.push(where('scheduledDateTime', '<=', Timestamp.fromDate(new Date(endDate))));
          }
          if (gameId !== undefined) {
            constraints.push(where('gameId', '==', gameId));
          } else {
            // Note: This requires a composite index on (gameState, isDeleted, scheduledDateTime)
            // If index doesn't exist or is building, the outer try-catch will use fallback
            constraints.push(orderBy('scheduledDateTime', 'asc'));
          }
        } else if (gameState === 'completed') {
          // For completed games, filter by datetime
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
          } else {
            // Note: This requires a composite index on (gameState, isDeleted, datetime)
            // If index doesn't exist or is building, the outer try-catch will use fallback
            constraints.push(orderBy('datetime', 'desc'));
          }
        }
      } else {
        // When gameState is not specified, we can't use datetime or scheduledDateTime filters
        // because they're on different fields. Filter by gameId if provided, otherwise
        // we'll need to fetch all and filter in memory (or require gameState to be specified)
        if (gameId !== undefined) {
          constraints.push(where('gameId', '==', gameId));
        } else {
          // Without gameState, we can't order by datetime or scheduledDateTime
          // Default to ordering by createdAt descending (requires index on isDeleted, createdAt)
          // If index doesn't exist, the outer try-catch will use fallback
          constraints.push(orderBy('createdAt', 'desc'));
        }
        // Note: startDate/endDate and category filters are ignored when gameState is not specified
        // because they apply to different fields for scheduled vs completed games
      }

      // Apply pagination
      constraints.push(firestoreLimit(limit));

      const gamesQuery = query(collection(db, GAMES_COLLECTION), ...constraints);
      
      let snapshot;
      let needsInMemorySort = false;
      try {
        snapshot = await getDocs(gamesQuery);
      } catch (queryError) {
        // If query fails (likely due to missing index), try a simpler query without orderBy
        const error = queryError as { code?: string; message?: string };
        if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
          // Index missing/building - using fallback query (this is expected during development)
          // Fallback: query without orderBy (will sort in memory)
          const fallbackConstraints: QueryConstraint[] = [
            where('isDeleted', '==', false),
          ];
          if (gameState) {
            fallbackConstraints.push(where('gameState', '==', gameState));
          }
          if (gameId !== undefined) {
            fallbackConstraints.push(where('gameId', '==', gameId));
          }
          // Don't use orderBy in fallback - will sort in memory instead
          fallbackConstraints.push(firestoreLimit(limit * 2)); // Get more to account for no ordering
          const fallbackQuery = query(collection(db, GAMES_COLLECTION), ...fallbackConstraints);
          snapshot = await getDocs(fallbackQuery);
          needsInMemorySort = true;
        } else {
          throw queryError;
        }
      }

      const games: Game[] = [];
      snapshot.forEach((doc) => {
        const game = convertGameDoc(doc.data(), doc.id);
        // Double-check isDeleted in case query didn't filter it
        if (!game.isDeleted) {
          games.push(game);
        }
      });
      
      // Debug logging removed - too verbose for production
      
      // Sort in memory if fallback was used
      if (needsInMemorySort) {
        games.sort((a, b) => {
          if (a.gameState === 'scheduled' && b.gameState === 'scheduled') {
            const dateA = a.scheduledDateTime 
              ? (typeof a.scheduledDateTime === 'string' 
                  ? new Date(a.scheduledDateTime).getTime() 
                  : (a.scheduledDateTime as Timestamp).toMillis())
              : 0;
            const dateB = b.scheduledDateTime 
              ? (typeof b.scheduledDateTime === 'string' 
                  ? new Date(b.scheduledDateTime).getTime() 
                  : (b.scheduledDateTime as Timestamp).toMillis())
              : 0;
            return dateA - dateB; // Ascending for scheduled games
          }
          if (a.gameState === 'completed' && b.gameState === 'completed') {
            const dateA = a.datetime 
              ? (typeof a.datetime === 'string' 
                  ? new Date(a.datetime).getTime() 
                  : (a.datetime as Timestamp).toMillis())
              : 0;
            const dateB = b.datetime 
              ? (typeof b.datetime === 'string' 
                  ? new Date(b.datetime).getTime() 
                  : (b.datetime as Timestamp).toMillis())
              : 0;
            return dateB - dateA; // Descending for completed games
          }
          // Fallback to createdAt
          const dateA = typeof a.createdAt === 'string' 
            ? new Date(a.createdAt).getTime() 
            : (a.createdAt as Timestamp).toMillis();
          const dateB = typeof b.createdAt === 'string' 
            ? new Date(b.createdAt).getTime() 
            : (b.createdAt as Timestamp).toMillis();
          return dateB - dateA;
        });
        // Limit after sorting
        games.splice(limit);
      }

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

