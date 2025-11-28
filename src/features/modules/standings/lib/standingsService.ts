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
 */
async function getStandingsOptimized(
  category: string,
  minGames: number,
  page: number,
  pageLimit: number
): Promise<StandingsResponse> {
  if (isServerSide()) {
    const adminDb = getFirestoreAdmin();
    
    // Query denormalized collection with filters
    const standingsQuery = adminDb
      .collection(PLAYER_CATEGORY_STATS_COLLECTION)
      .where('category', '==', category)
      .where('games', '>=', minGames);

    // First, get total count for pagination
    const totalSnapshot = await standingsQuery.get();
    const total = totalSnapshot.size;

    // Fetch all results for sorting (Firestore can't sort by multiple fields efficiently)
    // TODO: Optimize further with composite index for multi-field sorting
    const snapshot = await standingsQuery.get();
    
    const standings: StandingsEntry[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      standings.push({
        rank: 0, // Will be calculated after sorting
        name: data.playerName || data.playerId || doc.id,
        score: data.score || 1000,
        wins: data.wins || 0,
        losses: data.losses || 0,
        winRate: data.winRate || 0,
        games: data.games || 0,
      });
    });
    
    // Sort by score (ELO) descending, then by win rate, then by wins
    standings.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.winRate !== a.winRate) return b.winRate - a.winRate;
      return b.wins - a.wins;
    });
    
    // Assign ranks
    standings.forEach((entry, index) => {
      entry.rank = index + 1;
    });
    
    // Apply pagination
    const startIndex = (page - 1) * pageLimit;
    const endIndex = startIndex + pageLimit;
    const paginatedStandings = standings.slice(startIndex, endIndex);
    
    return {
      standings: paginatedStandings,
      total,
      page,
      hasMore: endIndex < standings.length,
    };
  } else {
    const db = getFirestoreInstance();
    
    // Query denormalized collection with filters
    const standingsQuery = query(
      collection(db, PLAYER_CATEGORY_STATS_COLLECTION),
      where('category', '==', category),
      where('games', '>=', minGames)
    );

    // Get all results for sorting
    const snapshot = await getDocs(standingsQuery);
    
    const standings: StandingsEntry[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      standings.push({
        rank: 0,
        name: data.playerName || data.playerId || doc.id,
        score: data.score || 1000,
        wins: data.wins || 0,
        losses: data.losses || 0,
        winRate: data.winRate || 0,
        games: data.games || 0,
      });
    });
    
    // Sort by score (ELO) descending, then by win rate, then by wins
    standings.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.winRate !== a.winRate) return b.winRate - a.winRate;
      return b.wins - a.wins;
    });
    
    // Assign ranks
    standings.forEach((entry, index) => {
      entry.rank = index + 1;
    });
    
    // Apply pagination
    const startIndex = (page - 1) * pageLimit;
    const endIndex = startIndex + pageLimit;
    const paginatedStandings = standings.slice(startIndex, endIndex);
    
    return {
      standings: paginatedStandings,
      total: standings.length,
      page,
      hasMore: endIndex < standings.length,
    };
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
      const data = doc.data();
      const categoryStats = data.categories?.[category];
      
      if (!categoryStats) return;
      
      const games = categoryStats.wins + categoryStats.losses + categoryStats.draws;
      if (games < minGames) return;
      
      const winRate = games > 0 
        ? (categoryStats.wins / games) * 100 
        : 0;
      
      standings.push({
        rank: 0, // Will be calculated after sorting
        name: data.name || doc.id,
        score: categoryStats.score || 1000,
        wins: categoryStats.wins || 0,
        losses: categoryStats.losses || 0,
        winRate: Math.round(winRate * 100) / 100,
        games,
      });
    });
    
    // Sort by score (ELO) descending, then by win rate, then by wins
    standings.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.winRate !== a.winRate) return b.winRate - a.winRate;
      return b.wins - a.wins;
    });
    
    // Assign ranks
    standings.forEach((entry, index) => {
      entry.rank = index + 1;
    });
    
    // Apply pagination
    const startIndex = (page - 1) * pageLimit;
    const endIndex = startIndex + pageLimit;
    const paginatedStandings = standings.slice(startIndex, endIndex);
    
    return {
      standings: paginatedStandings,
      total: standings.length,
      page,
      hasMore: endIndex < standings.length,
    };
  } else {
    const db = getFirestoreInstance();
    
    // Get all player stats
    const snapshot = await getDocs(collection(db, PLAYER_STATS_COLLECTION));
    
    const standings: StandingsEntry[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const categoryStats = data.categories?.[category];
      
      if (!categoryStats) return;
      
      const games = categoryStats.wins + categoryStats.losses + categoryStats.draws;
      if (games < minGames) return;
      
      const winRate = games > 0 
        ? (categoryStats.wins / games) * 100 
        : 0;
      
      standings.push({
        rank: 0, // Will be calculated after sorting
        name: data.name || doc.id,
        score: categoryStats.score || 1000,
        wins: categoryStats.wins || 0,
        losses: categoryStats.losses || 0,
        winRate: Math.round(winRate * 100) / 100,
        games,
      });
    });
    
    // Sort by score (ELO) descending, then by win rate, then by wins
    standings.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.winRate !== a.winRate) return b.winRate - a.winRate;
      return b.wins - a.wins;
    });
    
    // Assign ranks
    standings.forEach((entry, index) => {
      entry.rank = index + 1;
    });
    
    // Apply pagination
    const startIndex = (page - 1) * pageLimit;
    const endIndex = startIndex + pageLimit;
    const paginatedStandings = standings.slice(startIndex, endIndex);
    
    return {
      standings: paginatedStandings,
      total: standings.length,
      page,
      hasMore: endIndex < standings.length,
    };
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
