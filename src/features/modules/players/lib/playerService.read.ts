/**
 * Player Service - Read Operations
 * 
 * Handles all player data retrieval operations
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { getFirestoreInstance } from '@/features/infrastructure/api/firebase';
import { getFirestoreAdmin, isServerSide } from '@/features/infrastructure/api/firebase/admin';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import { timestampToIso } from '@/features/infrastructure/utils/timestampUtils';
import type { PlayerStats, PlayerProfile, PlayerSearchFilters } from '../types';
import { getGames } from '../../games/lib/gameService';
import { calculateTotalGames, normalizePlayerName } from './playerService.utils';

const PLAYER_STATS_COLLECTION = 'playerStats';
const logger = createComponentLogger('playerService.read');

/**
 * Get player statistics
 */
export async function getPlayerStats(
  name: string,
  filters?: PlayerSearchFilters
): Promise<PlayerProfile | null> {
  try {
    logger.info('Fetching player stats', { name, filters });

    const normalizedName = normalizePlayerName(name);

    if (isServerSide()) {
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
    } else {
      const db = getFirestoreInstance();
      const playerDocRef = doc(db, PLAYER_STATS_COLLECTION, normalizedName);
      const playerDoc = await getDoc(playerDocRef);

      if (!playerDoc.exists()) {
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
    }
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
 * Get all players with basic stats
 */
export async function getAllPlayers(limit: number = 100): Promise<PlayerStats[]> {
  try {
    logger.info('Fetching all players', { limit });

    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      const snapshot = await adminDb.collection(PLAYER_STATS_COLLECTION)
        .orderBy('name')
        .limit(limit)
        .get();

      const players: PlayerStats[] = [];
      snapshot.forEach((doc) => {
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

      return players;
    } else {
      const db = getFirestoreInstance();
      const playersQuery = query(
        collection(db, PLAYER_STATS_COLLECTION),
        orderBy('name'),
        // limit(limit) // Firestore requires orderBy before limit
      );

      const snapshot = await getDocs(playersQuery);
      const players: PlayerStats[] = [];
      snapshot.forEach((doc) => {
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

      return players.slice(0, limit);
    }
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to get all players', {
      component: 'playerService.read',
      operation: 'getAllPlayers',
    });
    throw err;
  }
}

/**
 * Search players by name
 */
export async function searchPlayers(searchQuery: string): Promise<string[]> {
  try {
    logger.info('Searching players', { query: searchQuery });

    if (!searchQuery || searchQuery.trim().length < 2) {
      return [];
    }

    const searchTerm = normalizePlayerName(searchQuery);

    if (isServerSide()) {
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
    } else {
      const db = getFirestoreInstance();
      const playersQuery = query(
        collection(db, PLAYER_STATS_COLLECTION),
        where('name', '>=', searchTerm),
        where('name', '<=', searchTerm + '\uf8ff'),
        orderBy('name'),
        // limit(20) // Firestore requires orderBy before limit
      );

      const snapshot = await getDocs(playersQuery);
      const players: string[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.name) {
          players.push(data.name);
        }
      });

      return players.slice(0, 20);
    }
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

