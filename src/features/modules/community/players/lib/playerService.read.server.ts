/**
 * Player Service - Read Operations (Server-Only)
 * 
 * Server-only functions for reading player data.
 * These functions use Firebase Admin SDK and should only be used in API routes.
 */

import { getFirestoreAdmin } from '@/features/infrastructure/api/firebase/admin';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import { timestampToIso } from '@/features/infrastructure/utils';
import type { PlayerStats, PlayerProfile, PlayerSearchFilters } from '../types';
import { getGames } from '../../../game-management/games/lib/gameService.read.server';
import { calculateTotalGames, normalizePlayerName } from './playerService.utils';

const PLAYER_STATS_COLLECTION = 'playerStats';
const logger = createComponentLogger('playerService.read');

/**
 * Get player statistics (Server-Only)
 */
export async function getPlayerStats(
  name: string,
  filters?: PlayerSearchFilters
): Promise<PlayerProfile | null> {
  try {
    logger.info('Fetching player stats', { name, filters });

    const normalizedName = normalizePlayerName(name);
    const adminDb = getFirestoreAdmin();
    const playerDoc = await adminDb.collection(PLAYER_STATS_COLLECTION).doc(normalizedName).get();

    if (!playerDoc.exists) {
      logger.info('Player not found', { name: normalizedName });
      return null;
    }

    const data = playerDoc.data();
    if (!data) {
      return null;
    }

    const categories = data.categories || {};
    const profile: PlayerProfile = {
      id: playerDoc.id,
      name: data.name || name,
      categories,
      totalGames: calculateTotalGames(categories),
      lastPlayed: timestampToIso(data.lastPlayed),
      firstPlayed: timestampToIso(data.firstPlayed),
      createdAt: timestampToIso(data.createdAt),
      updatedAt: timestampToIso(data.updatedAt),
    };

    // Get recent games if requested
    if (filters?.includeGames) {
      const gamesResult = await getGames({
        player: name,
        limit: 10,
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
      profile.recentGames = gamesResult.games;
    }

    return profile;
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to fetch player stats', {
      component: 'playerService.read',
      operation: 'getPlayerStats',
      name,
    });
    throw err;
  }
}

/**
 * Get all players with basic stats (with pagination support) (Server-Only)
 */
export async function getAllPlayers(
  limit: number = 50,
  lastPlayerName?: string
): Promise<{ players: PlayerStats[]; hasMore: boolean; lastPlayerName: string | null }> {
  try {
    logger.info('Fetching all players', { limit, lastPlayerName });

    const adminDb = getFirestoreAdmin();
    let adminQuery = adminDb.collection(PLAYER_STATS_COLLECTION)
      .orderBy('name')
      .limit(limit + 1); // Fetch one extra to check if there are more

    // Apply cursor if provided
    if (lastPlayerName) {
      const lastDocSnapshot = await adminDb.collection(PLAYER_STATS_COLLECTION)
        .where('name', '==', lastPlayerName)
        .limit(1)
        .get();
      
      if (!lastDocSnapshot.empty) {
        adminQuery = adminQuery.startAfter(lastDocSnapshot.docs[0]);
      }
    }

    const snapshot = await adminQuery.get();
    const hasMore = snapshot.docs.length > limit;
    const docsToProcess = hasMore ? snapshot.docs.slice(0, limit) : snapshot.docs;

    const players: PlayerStats[] = [];
    docsToProcess.forEach((doc) => {
      const data = doc.data();
      const categories = data.categories || {};
      players.push({
        id: doc.id,
        name: data.name || doc.id,
        categories,
        totalGames: calculateTotalGames(categories),
        lastPlayed: timestampToIso(data.lastPlayed),
        firstPlayed: timestampToIso(data.firstPlayed),
        createdAt: timestampToIso(data.createdAt),
        updatedAt: timestampToIso(data.updatedAt),
      });
    });

    const newLastPlayerName = players.length > 0 ? players[players.length - 1].name : null;

    return {
      players,
      hasMore,
      lastPlayerName: newLastPlayerName,
    };
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to get all players', {
      component: 'playerService.read',
      operation: 'getAllPlayers',
      limit,
      lastPlayerName,
    });
    throw err;
  }
}

/**
 * Search players by name (Server-Only)
 */
export async function searchPlayers(searchQuery: string): Promise<string[]> {
  try {
    logger.info('Searching players', { query: searchQuery });

    if (!searchQuery || searchQuery.trim().length < 2) {
      return [];
    }

    const searchTerm = normalizePlayerName(searchQuery);
    const adminDb = getFirestoreAdmin();
    const snapshot = await adminDb.collection(PLAYER_STATS_COLLECTION)
      .where('name', '>=', searchTerm)
      .where('name', '<=', searchTerm + '\uf8ff')
      .limit(20)
      .get();

    const players: string[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.name) {
        players.push(data.name);
      }
    });

    return players;
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to search players', {
      component: 'playerService.read',
      operation: 'searchPlayers',
      query: searchQuery,
    });
    // Return empty array on error (search is non-critical)
    return [];
  }
}

