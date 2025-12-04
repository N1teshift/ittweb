/**
 * Game Service Utilities (Server-Only)
 * 
 * Server-only utility functions for game services.
 * Client-safe utilities are in gameService.utils.ts
 */

import { getFirestoreAdmin } from '@/features/infrastructure/api/firebase/admin';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import { queryWithIndexFallback } from '@/features/infrastructure/api/firebase/queryWithIndexFallback';

const GAMES_COLLECTION = 'games';
const logger = createComponentLogger('gameService');

/**
 * Get the next available game ID (Server-Only)
 * Queries all games and finds the highest gameId, then increments by 1
 * Uses fallback query if index is missing
 */
export async function getNextGameId(): Promise<number> {
  try {
    const maxGameId = await queryWithIndexFallback({
      collectionName: GAMES_COLLECTION,
      executeQuery: async () => {
        const docs: Array<{ data: () => Record<string, unknown>; id: string }> = [];
        
        const adminDb = getFirestoreAdmin();
        const querySnapshot = await adminDb.collection(GAMES_COLLECTION)
          .orderBy('gameId', 'desc')
          .limit(1)
          .get();
        
        querySnapshot.forEach((doc) => {
          docs.push({ data: () => doc.data(), id: doc.id });
        });
        
        return docs;
      },
      fallbackFilter: (docs) => {
        // In fallback, return all docs (utility fetches all documents)
        // Note: For large collections, this may be inefficient, but ensures we find the true max
        return docs;
      },
      transform: (docs) => {
        // Extract gameIds from documents and find max
        let maxGameId = 0;
        docs.forEach((doc) => {
          const gameData = doc.data();
          const gameId = typeof gameData.gameId === 'number' ? gameData.gameId : Number(gameData.gameId) || 0;
          if (gameId > maxGameId) {
            maxGameId = gameId;
          }
        });
        return maxGameId;
      },
      logger,
    });

    if (maxGameId === 0) {
      logger.info('No games found, starting with gameId 1');
      return 1;
    }

    const nextId = maxGameId + 1;
    logger.info('Next game ID calculated', { nextId, maxGameId });
    return nextId;
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to get next game ID, defaulting to 1', {
      component: 'gameService',
      operation: 'getNextGameId',
      errorCode: (error as { code?: string }).code,
      errorMessage: err.message,
    });
    // Return 1 as fallback - this is safe but may cause duplicate gameIds if there are existing games
    return 1;
  }
}

