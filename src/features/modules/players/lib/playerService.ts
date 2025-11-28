import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { getFirestoreInstance } from '@/features/infrastructure/api/firebase';
import { getFirestoreAdmin, isServerSide, getAdminTimestamp } from '@/features/infrastructure/api/firebase/admin';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import { timestampToIso } from '@/features/infrastructure/utils/timestampUtils';
import type { PlayerStats, PlayerProfile, CategoryStats, PlayerSearchFilters, PlayerComparison } from '../types';
import { STARTING_ELO } from '../../games/lib/eloCalculator';
import { getGames, getGameById } from '../../games/lib/gameService';
import { upsertPlayerCategoryStats } from '../../standings/lib/playerCategoryStatsService';

const PLAYER_STATS_COLLECTION = 'playerStats';
const logger = createComponentLogger('playerService');

/**
 * Calculate total games from categories
 */
function calculateTotalGames(categories: { [key: string]: CategoryStats }): number {
  return Object.values(categories).reduce((total, stats) => {
    return total + (stats.games || 0);
  }, 0);
}

/**
 * Normalize player name for consistent lookup
 * Converts to lowercase and trims whitespace
 */
export function normalizePlayerName(name: string): string {
  return name.toLowerCase().trim();
}

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
      component: 'playerService',
      operation: 'getPlayerStats',
      name,
    });
    throw err;
  }
}

/**
 * Update player statistics after a game
 */
export async function updatePlayerStats(gameId: string): Promise<void> {
  try {
    logger.info('Updating player stats', { gameId });

    const { getGameById } = await import('../../games/lib/gameService');
    const game = await getGameById(gameId);
    if (!game || !game.players) {
      return;
    }

    // Convert datetime to ISO string once for all players (game.datetime can be Timestamp or string)
    const gameDatetimeString = timestampToIso(game.datetime);
    const gameDatetime = new Date(gameDatetimeString);

    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      const adminTimestamp = getAdminTimestamp();

      for (const player of game.players) {
        const normalizedName = normalizePlayerName(player.name);
        const playerRef = adminDb.collection(PLAYER_STATS_COLLECTION).doc(normalizedName);
        const playerDoc = await playerRef.get();

        const category = player.category || game.category || 'default';
        const eloChange = player.elochange ?? 0;
        const eloBefore = player.eloBefore ?? STARTING_ELO;
        const eloAfter = player.eloAfter ?? (eloBefore + eloChange);

        if (!playerDoc.exists) {
          // Create new player stats
          const categories: { [key: string]: CategoryStats } = {};
          categories[category] = {
            wins: player.flag === 'winner' ? 1 : 0,
            losses: player.flag === 'loser' ? 1 : 0,
            draws: player.flag === 'drawer' ? 1 : 0,
            score: eloAfter,
            games: 1,
          };

          await playerRef.set({
            name: player.name,
            categories,
            totalGames: 1,
            lastPlayed: adminTimestamp.fromDate(gameDatetime),
            firstPlayed: adminTimestamp.fromDate(gameDatetime),
            createdAt: adminTimestamp.now(),
            updatedAt: adminTimestamp.now(),
          });

          // Update denormalized category stats collection
          await upsertPlayerCategoryStats(
            normalizedName,
            player.name,
            category,
            {
              wins: categories[category].wins,
              losses: categories[category].losses,
              draws: categories[category].draws,
              score: eloAfter,
              lastPlayed: gameDatetime,
            }
          );
        } else {
          // Update existing player stats
          const data = playerDoc.data();
          if (!data) return;

          const categories = data.categories || {};
          const categoryStats = categories[category] || {
            wins: 0,
            losses: 0,
            draws: 0,
            score: STARTING_ELO,
            games: 0,
          };

          // Update category stats
          if (player.flag === 'winner') categoryStats.wins += 1;
          else if (player.flag === 'loser') categoryStats.losses += 1;
          else if (player.flag === 'drawer') categoryStats.draws += 1;

          categoryStats.score = eloAfter;
          categoryStats.games = categoryStats.wins + categoryStats.losses + categoryStats.draws;

          // Update peak ELO
          if (eloAfter > (categoryStats.peakElo || STARTING_ELO)) {
            categoryStats.peakElo = eloAfter;
            categoryStats.peakEloDate = adminTimestamp.fromDate(gameDatetime);
          }

          categories[category] = categoryStats;

          await playerRef.update({
            name: player.name,
            categories,
            totalGames: (data.totalGames || 0) + 1,
            lastPlayed: adminTimestamp.fromDate(gameDatetime),
            updatedAt: adminTimestamp.now(),
          });

          // Update denormalized category stats collection
          await upsertPlayerCategoryStats(
            normalizedName,
            player.name,
            category,
            {
              wins: categoryStats.wins,
              losses: categoryStats.losses,
              draws: categoryStats.draws,
              score: eloAfter,
              lastPlayed: gameDatetime,
            }
          );
        }
      }
    } else {
      const db = getFirestoreInstance();

      for (const player of game.players) {
        const normalizedName = normalizePlayerName(player.name);
        const playerRef = doc(db, PLAYER_STATS_COLLECTION, normalizedName);
        const playerDoc = await getDoc(playerRef);

        const category = player.category || game.category || 'default';
        const eloChange = player.elochange ?? 0;
        const eloBefore = player.eloBefore ?? STARTING_ELO;
        const eloAfter = player.eloAfter ?? (eloBefore + eloChange);

        if (!playerDoc.exists()) {
          // Create new player stats
          const categories: { [key: string]: CategoryStats } = {};
          categories[category] = {
            wins: player.flag === 'winner' ? 1 : 0,
            losses: player.flag === 'loser' ? 1 : 0,
            draws: player.flag === 'drawer' ? 1 : 0,
            score: eloAfter,
            games: 1,
          };

          await setDoc(playerRef, {
            name: player.name,
            categories,
            totalGames: 1,
            lastPlayed: Timestamp.fromDate(gameDatetime),
            firstPlayed: Timestamp.fromDate(gameDatetime),
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });

          // Update denormalized category stats collection
          await upsertPlayerCategoryStats(
            normalizedName,
            player.name,
            category,
            {
              wins: categories[category].wins,
              losses: categories[category].losses,
              draws: categories[category].draws,
              score: eloAfter,
              lastPlayed: gameDatetime,
            }
          );
        } else {
          // Update existing player stats
          const data = playerDoc.data();
          if (!data) return;

          const categories = data.categories || {};
          const categoryStats = categories[category] || {
            wins: 0,
            losses: 0,
            draws: 0,
            score: STARTING_ELO,
            games: 0,
          };

          // Update category stats
          if (player.flag === 'winner') categoryStats.wins += 1;
          else if (player.flag === 'loser') categoryStats.losses += 1;
          else if (player.flag === 'drawer') categoryStats.draws += 1;

          categoryStats.score = eloAfter;
          categoryStats.games = categoryStats.wins + categoryStats.losses + categoryStats.draws;

          // Update peak ELO
          if (eloAfter > (categoryStats.peakElo || STARTING_ELO)) {
            categoryStats.peakElo = eloAfter;
            categoryStats.peakEloDate = Timestamp.fromDate(gameDatetime);
          }

          categories[category] = categoryStats;

          await updateDoc(playerRef, {
            name: player.name,
            categories,
            totalGames: (data.totalGames || 0) + 1,
            lastPlayed: Timestamp.fromDate(gameDatetime),
            updatedAt: Timestamp.now(),
          });

          // Update denormalized category stats collection
          await upsertPlayerCategoryStats(
            normalizedName,
            player.name,
            category,
            {
              wins: categoryStats.wins,
              losses: categoryStats.losses,
              draws: categoryStats.draws,
              score: eloAfter,
              lastPlayed: gameDatetime,
            }
          );
        }
      }
    }

    logger.info('Player stats updated', { gameId, playersUpdated: game.players.length });
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to update player stats', {
      component: 'playerService',
      operation: 'updatePlayerStats',
      gameId,
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
      component: 'playerService',
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
      component: 'playerService',
      operation: 'searchPlayers',
      query: searchQuery,
    });
    // Return empty array on error (search is non-critical)
    return [];
  }
}

/**
 * Compare multiple players
 */
export async function comparePlayers(
  names: string[],
  filters?: PlayerSearchFilters
): Promise<PlayerComparison> {
  try {
    logger.info('Comparing players', { names, filters });

    const players: PlayerStats[] = [];
    for (const name of names) {
      const stats = await getPlayerStats(name, { ...filters, includeGames: false });
      if (stats) {
        players.push(stats);
      }
    }

    // Calculate head-to-head records
    const headToHead: PlayerComparison['headToHead'] = {};
    const gamesResult = await getGames({
      player: names.join(','),
      startDate: filters?.startDate,
      endDate: filters?.endDate,
      limit: 1000, // Get more games for comparison
    });

    // Initialize head-to-head structure
    for (const name1 of names) {
      headToHead[name1] = {};
      for (const name2 of names) {
        if (name1 !== name2) {
          headToHead[name1][name2] = { wins: 0, losses: 0 };
        }
      }
    }

    // Calculate head-to-head from games
    for (const game of gamesResult.games) {
      const gameWithPlayers = await getGameById(game.id);
      if (!gameWithPlayers?.players) continue;

      const winners = gameWithPlayers.players.filter(p => p.flag === 'winner').map(p => normalizePlayerName(p.name));
      const losers = gameWithPlayers.players.filter(p => p.flag === 'loser').map(p => normalizePlayerName(p.name));

      for (const winner of winners) {
        for (const loser of losers) {
          if (names.includes(winner) && names.includes(loser)) {
            if (!headToHead[winner]) headToHead[winner] = {};
            if (!headToHead[winner][loser]) headToHead[winner][loser] = { wins: 0, losses: 0 };
            headToHead[winner][loser].wins += 1;

            if (!headToHead[loser]) headToHead[loser] = {};
            if (!headToHead[loser][winner]) headToHead[loser][winner] = { wins: 0, losses: 0 };
            headToHead[loser][winner].losses += 1;
          }
        }
      }
    }

    // Get ELO history for comparison chart
    const eloComparison: PlayerComparison['eloComparison'] = [];
    // TODO: Implement ELO history aggregation

    return {
      players,
      headToHead,
      eloComparison,
    };
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to compare players', {
      component: 'playerService',
      operation: 'comparePlayers',
      names,
    });
    throw err;
  }
}
