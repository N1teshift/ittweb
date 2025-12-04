/**
 * Standings Service - Server-Only Operations
 * 
 * Server-only functions for standings/leaderboard services.
 * These functions use Firebase Admin SDK and should only be used in API routes.
 */

import { getFirestoreAdmin } from '@/features/infrastructure/api/firebase/admin';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import { queryWithIndexFallback } from '@/features/infrastructure/api/firebase/queryWithIndexFallback';
import type { StandingsEntry, StandingsResponse, StandingsFilters } from '../types';
import {
  createStandingsEntryFromOptimized,
  createStandingsEntryFromLegacy,
  processStandingsEntries,
} from './standingsService.utils';

const PLAYER_STATS_COLLECTION = 'playerStats';
const PLAYER_CATEGORY_STATS_COLLECTION = 'playerCategoryStats';
const logger = createComponentLogger('standingsService');

/**
 * Minimum games required to be ranked
 */
export const MIN_GAMES_FOR_RANKING = 10;

/**
 * Get standings/leaderboard using optimized denormalized collection (Server-Only)
 * Falls back to legacy method if new collection is empty
 */
export async function getStandings(filters: StandingsFilters = {}): Promise<StandingsResponse> {
  try {
    logger.info('Fetching standings', { filters });

    const {
      category = 'default',
      minGames = MIN_GAMES_FOR_RANKING,
      page = 1,
      limit: pageLimit = 50,
    } = filters;

    // Try optimized query first (denormalized collection)
    try {
      return await getStandingsOptimized(category, minGames, page, pageLimit);
    } catch (error) {
      // If optimized query fails (e.g., no data in new collection yet), fall back to legacy
      logger.warn('Optimized standings query failed, falling back to legacy method', {
        error: error instanceof Error ? error.message : String(error),
        category,
      });
      return await getStandingsLegacy(category, minGames, page, pageLimit);
    }
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to fetch standings', {
      component: 'standingsService',
      operation: 'getStandings',
      filters,
    });
    throw err;
  }
}

/**
 * Optimized standings query using denormalized playerCategoryStats collection (Server-Only)
 */
async function getStandingsOptimized(
  category: string,
  minGames: number,
  page: number,
  pageLimit: number
): Promise<StandingsResponse> {
  const fetchLimit = Math.max(pageLimit * 3, 100);
  
  // Get total count for pagination
  let total: number | undefined;
  try {
    const adminDb = getFirestoreAdmin();
    const totalQuery = adminDb
      .collection(PLAYER_CATEGORY_STATS_COLLECTION)
      .where('category', '==', category)
      .where('games', '>=', minGames);
    const totalSnapshot = await totalQuery.get();
    total = totalSnapshot.size;
  } catch (error) {
    logger.warn('Failed to get total count for standings', { category, error });
  }

  const standings = await queryWithIndexFallback({
    collectionName: PLAYER_CATEGORY_STATS_COLLECTION,
    executeQuery: async () => {
      const docs: Array<{ data: () => Record<string, unknown>; id: string }> = [];
      
      const adminDb = getFirestoreAdmin();
      const standingsQuery = adminDb
        .collection(PLAYER_CATEGORY_STATS_COLLECTION)
        .where('category', '==', category)
        .where('games', '>=', minGames)
        .orderBy('score', 'desc')
        .limit(fetchLimit);

      const snapshot = await standingsQuery.get();
      snapshot.forEach((doc) => {
        docs.push({ data: () => doc.data(), id: doc.id });
      });
      
      return docs;
    },
    fallbackFilter: (docs) => {
      return docs.filter((doc) => {
        const data = doc.data();
        return data.category === category && (data.games as number) >= minGames;
      });
    },
    transform: (docs) => {
      const standings: StandingsEntry[] = [];
      docs.forEach((doc) => {
        const entry = createStandingsEntryFromOptimized(doc.data(), doc.id);
        standings.push(entry);
      });
      return standings;
    },
    logger,
  });

  const totalCount = total ?? standings.length;
  return processStandingsEntries(standings, page, pageLimit, totalCount);
}

/**
 * Legacy standings query (fallback method) (Server-Only)
 */
async function getStandingsLegacy(
  category: string,
  minGames: number,
  page: number,
  pageLimit: number
): Promise<StandingsResponse> {
  const adminDb = getFirestoreAdmin();
  
  // Get all player stats
  const snapshot = await adminDb.collection(PLAYER_STATS_COLLECTION).get();
  
  const standings: StandingsEntry[] = [];
  snapshot.forEach((doc) => {
    const entry = createStandingsEntryFromLegacy(doc.data(), doc.id, category, minGames);
    if (entry) {
      standings.push(entry);
    }
  });
  
  return processStandingsEntries(standings, page, pageLimit, standings.length);
}

/**
 * Calculate player's rank in a category (Server-Only)
 */
export async function calculateRank(
  playerName: string,
  category: string
): Promise<number | null> {
  try {
    logger.info('Calculating rank', { playerName, category });

    const standings = await getStandings({ category, minGames: MIN_GAMES_FOR_RANKING });
    const playerEntry = standings.standings.find(
      entry => entry.name.toLowerCase() === playerName.toLowerCase()
    );

    return playerEntry?.rank ?? null;
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to calculate rank', {
      component: 'standingsService',
      operation: 'calculateRank',
      playerName,
      category,
    });
    return null;
  }
}

