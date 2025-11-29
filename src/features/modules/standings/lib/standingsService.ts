import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { getFirestoreInstance } from '@/features/infrastructure/api/firebase';
import { getFirestoreAdmin, isServerSide } from '@/features/infrastructure/api/firebase/admin';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
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
 * Get standings/leaderboard using optimized denormalized collection
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
 * Optimized standings query using denormalized playerCategoryStats collection
 * Uses Firestore index for primary sorting (score), then sorts by winRate/wins in memory
 */
async function getStandingsOptimized(
  category: string,
  minGames: number,
  page: number,
  pageLimit: number
): Promise<StandingsResponse> {
  // Calculate fetch limit: fetch more than needed to account for secondary sorting
  // We fetch 3x the page limit to ensure we have enough data after secondary sorting
  const fetchLimit = Math.max(pageLimit * 3, 100); // Minimum 100 to ensure good coverage
  
  if (isServerSide()) {
    const adminDb = getFirestoreAdmin();
    
    try {
      // Query with Firestore sorting by score (uses Index 10)
      // This significantly reduces the dataset we need to process
      const standingsQuery = adminDb
        .collection(PLAYER_CATEGORY_STATS_COLLECTION)
        .where('category', '==', category)
        .where('games', '>=', minGames)
        .orderBy('score', 'desc')
        .limit(fetchLimit);

      // Get total count for pagination (separate query without limit)
      const totalQuery = adminDb
        .collection(PLAYER_CATEGORY_STATS_COLLECTION)
        .where('category', '==', category)
        .where('games', '>=', minGames);
      const totalSnapshot = await totalQuery.get();
      const total = totalSnapshot.size;

      // Fetch limited results sorted by score
      const snapshot = await standingsQuery.get();
      
      const standings: StandingsEntry[] = [];
      snapshot.forEach((doc) => {
        const entry = createStandingsEntryFromOptimized(doc.data(), doc.id);
        standings.push(entry);
      });
      
      // Process with multi-field sorting (score, winRate, wins) in memory
      return processStandingsEntries(standings, page, pageLimit, total);
    } catch (error) {
      // If index is missing or query fails, fall back to fetching all
      const firestoreError = error as { code?: string; message?: string };
      if (firestoreError?.code === 'failed-precondition' || firestoreError?.message?.includes('index')) {
        logger.warn('Index missing for standings query, using fallback', { category });
        
        // Fallback: fetch all without orderBy
        const fallbackQuery = adminDb
          .collection(PLAYER_CATEGORY_STATS_COLLECTION)
          .where('category', '==', category)
          .where('games', '>=', minGames);
        
        const totalSnapshot = await fallbackQuery.get();
        const total = totalSnapshot.size;
        const snapshot = await fallbackQuery.get();
        
        const standings: StandingsEntry[] = [];
        snapshot.forEach((doc) => {
          const entry = createStandingsEntryFromOptimized(doc.data(), doc.id);
          standings.push(entry);
        });
        
        return processStandingsEntries(standings, page, pageLimit, total);
      }
      throw error;
    }
  } else {
    const db = getFirestoreInstance();
    
    try {
      // Query with Firestore sorting by score (uses Index 10)
      const standingsQuery = query(
        collection(db, PLAYER_CATEGORY_STATS_COLLECTION),
        where('category', '==', category),
        where('games', '>=', minGames),
        orderBy('score', 'desc'),
        limit(fetchLimit)
      );

      // Fetch limited results sorted by score
      const snapshot = await getDocs(standingsQuery);
      
      const standings: StandingsEntry[] = [];
      snapshot.forEach((doc) => {
        const entry = createStandingsEntryFromOptimized(doc.data(), doc.id);
        standings.push(entry);
      });
      
      // Process with multi-field sorting (score, winRate, wins) in memory
      // Note: Total count is approximate (based on fetched results)
      return processStandingsEntries(standings, page, pageLimit, standings.length);
    } catch (error) {
      // If index is missing or query fails, fall back to fetching all
      const firestoreError = error as { code?: string; message?: string };
      if (firestoreError?.code === 'failed-precondition' || firestoreError?.message?.includes('index')) {
        logger.warn('Index missing for standings query, using fallback', { category });
        
        // Fallback: fetch all without orderBy
        const fallbackQuery = query(
          collection(db, PLAYER_CATEGORY_STATS_COLLECTION),
          where('category', '==', category),
          where('games', '>=', minGames)
        );
        
        const snapshot = await getDocs(fallbackQuery);
        
        const standings: StandingsEntry[] = [];
        snapshot.forEach((doc) => {
          const entry = createStandingsEntryFromOptimized(doc.data(), doc.id);
          standings.push(entry);
        });
        
        return processStandingsEntries(standings, page, pageLimit, standings.length);
      }
      throw error;
    }
  }
}

/**
 * Legacy standings query (fallback method)
 * Fetches all players and filters in memory
 */
async function getStandingsLegacy(
  category: string,
  minGames: number,
  page: number,
  pageLimit: number
): Promise<StandingsResponse> {
  if (isServerSide()) {
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
  } else {
    const db = getFirestoreInstance();
    
    // Get all player stats
    const snapshot = await getDocs(collection(db, PLAYER_STATS_COLLECTION));
    
    const standings: StandingsEntry[] = [];
    snapshot.forEach((doc) => {
      const entry = createStandingsEntryFromLegacy(doc.data(), doc.id, category, minGames);
      if (entry) {
        standings.push(entry);
      }
    });
    
    return processStandingsEntries(standings, page, pageLimit, standings.length);
  }
}

/**
 * Calculate player's rank in a category
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
