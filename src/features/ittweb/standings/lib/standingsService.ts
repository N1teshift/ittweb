import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
} from 'firebase/firestore';
import { getFirestoreInstance } from '@/features/infrastructure/api/firebase';
import { getFirestoreAdmin, isServerSide } from '@/features/infrastructure/api/firebase/admin';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import type { StandingsEntry, StandingsResponse, StandingsFilters } from '../types';

const PLAYER_STATS_COLLECTION = 'playerStats';
const logger = createComponentLogger('standingsService');

/**
 * Minimum games required to be ranked
 */
export const MIN_GAMES_FOR_RANKING = 10;

/**
 * Get standings/leaderboard
 */
export async function getStandings(filters: StandingsFilters = {}): Promise<StandingsResponse> {
  try {
    logger.info('Fetching standings', { filters });

    const {
      category = 'default',
      minGames = MIN_GAMES_FOR_RANKING,
      page = 1,
      limit = 50,
    } = filters;

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
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
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
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedStandings = standings.slice(startIndex, endIndex);
      
      return {
        standings: paginatedStandings,
        total: standings.length,
        page,
        hasMore: endIndex < standings.length,
      };
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
