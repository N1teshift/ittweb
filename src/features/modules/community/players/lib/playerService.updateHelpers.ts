/**
 * Helper functions for updating player statistics
 * Extracted to reduce code duplication between server and client paths
 */

import type { CategoryStats } from '../types';
import type { GamePlayer } from '../../../game-management/games/types';
import { STARTING_ELO } from '../../../game-management/lib/mechanics';
import type { TimestampFactory } from '@/features/infrastructure/utils';

/**
 * Calculate initial category stats for a new player
 */
export function calculateInitialCategoryStats(
  player: GamePlayer,
  eloAfter: number
): CategoryStats {
  return {
    wins: player.flag === 'winner' ? 1 : 0,
    losses: player.flag === 'loser' ? 1 : 0,
    draws: player.flag === 'drawer' ? 1 : 0,
    score: eloAfter,
    games: 1,
  };
}

/**
 * Update category stats based on game result
 */
export function updateCategoryStats(
  existingStats: CategoryStats,
  player: GamePlayer,
  eloAfter: number
): CategoryStats {
  const updatedStats = { ...existingStats };

  // Update win/loss/draw counts
  if (player.flag === 'winner') updatedStats.wins += 1;
  else if (player.flag === 'loser') updatedStats.losses += 1;
  else if (player.flag === 'drawer') updatedStats.draws += 1;

  // Update ELO and games count
  updatedStats.score = eloAfter;
  updatedStats.games = updatedStats.wins + updatedStats.losses + updatedStats.draws;

  return updatedStats;
}

/**
 * Update peak ELO if the new ELO is higher
 */
export function updatePeakElo(
  categoryStats: CategoryStats,
  eloAfter: number,
  gameDatetime: Date,
  timestampFactory: TimestampFactory
): void {
  const currentPeakElo = categoryStats.peakElo || STARTING_ELO;
  if (eloAfter > currentPeakElo) {
    categoryStats.peakElo = eloAfter;
    categoryStats.peakEloDate = timestampFactory.fromDate(gameDatetime);
  }
}

/**
 * Calculate player ELO values from game data
 */
export function calculatePlayerElo(player: GamePlayer): {
  eloChange: number;
  eloBefore: number;
  eloAfter: number;
} {
  const eloChange = player.elochange ?? 0;
  const eloBefore = player.eloBefore ?? STARTING_ELO;
  const eloAfter = player.eloAfter ?? (eloBefore + eloChange);

  return { eloChange, eloBefore, eloAfter };
}

/**
 * Prepare new player document data
 */
export function createNewPlayerDocumentData(
  playerName: string,
  category: string,
  categoryStats: CategoryStats,
  gameDatetime: Date,
  timestampFactory: TimestampFactory
): Record<string, unknown> {
  const categories: { [key: string]: CategoryStats } = {};
  categories[category] = categoryStats;

  return {
    name: playerName,
    categories,
    totalGames: 1,
    lastPlayed: timestampFactory.fromDate(gameDatetime),
    firstPlayed: timestampFactory.fromDate(gameDatetime),
    createdAt: timestampFactory.now(),
    updatedAt: timestampFactory.now(),
  };
}

/**
 * Prepare updated player document data
 */
export function createUpdatedPlayerDocumentData(
  playerName: string,
  categories: { [key: string]: CategoryStats },
  totalGames: number,
  gameDatetime: Date,
  timestampFactory: TimestampFactory
): Record<string, unknown> {
  return {
    name: playerName,
    categories,
    totalGames,
    lastPlayed: timestampFactory.fromDate(gameDatetime),
    updatedAt: timestampFactory.now(),
  };
}

/**
 * Prepare category stats data for denormalized collection
 */
export function prepareCategoryStatsForDenormalized(
  categoryStats: CategoryStats,
  eloAfter: number,
  gameDatetime: Date
): {
  wins: number;
  losses: number;
  draws: number;
  score: number;
  lastPlayed: Date;
} {
  return {
    wins: categoryStats.wins,
    losses: categoryStats.losses,
    draws: categoryStats.draws,
    score: eloAfter,
    lastPlayed: gameDatetime,
  };
}

/**
 * Process player stats update - shared logic for both server and client
 */
export async function processPlayerStatsUpdate(
  player: GamePlayer,
  gameCategory: string | undefined,
  gameDatetime: Date,
  normalizedName: string,
  existingData: Record<string, unknown> | null,
  timestampFactory: TimestampFactory,
  firestoreOps: {
    setDoc: (data: Record<string, unknown>) => Promise<void>;
    updateDoc: (data: Record<string, unknown>) => Promise<void>;
  },
  upsertCategoryStats: (
    normalizedName: string,
    playerName: string,
    category: string,
    stats: {
      wins: number;
      losses: number;
      draws: number;
      score: number;
      lastPlayed: Date;
    }
  ) => Promise<void>
): Promise<void> {
  const category = player.category || gameCategory || 'default';
  const { eloAfter } = calculatePlayerElo(player);

  const isNewPlayer = !existingData;
  const categories = existingData?.categories as { [key: string]: CategoryStats } | undefined || {};

  let categoryStats: CategoryStats;

  if (isNewPlayer) {
    // Create new player stats
    categoryStats = calculateInitialCategoryStats(player, eloAfter);
    const playerDocData = createNewPlayerDocumentData(
      player.name,
      category,
      categoryStats,
      gameDatetime,
      timestampFactory
    );
    await firestoreOps.setDoc(playerDocData);
  } else {
    // Update existing player stats
    categoryStats = updateCategoryStats(
      categories[category] || {
        wins: 0,
        losses: 0,
        draws: 0,
        score: STARTING_ELO,
        games: 0,
      },
      player,
      eloAfter
    );

    // Update peak ELO
    updatePeakElo(categoryStats, eloAfter, gameDatetime, timestampFactory);

    categories[category] = categoryStats;

    const playerDocData = createUpdatedPlayerDocumentData(
      player.name,
      categories,
      ((existingData.totalGames as number) || 0) + 1,
      gameDatetime,
      timestampFactory
    );
    await firestoreOps.updateDoc(playerDocData);
  }

  // Update denormalized category stats collection
  const denormalizedStats = prepareCategoryStatsForDenormalized(
    categoryStats,
    eloAfter,
    gameDatetime
  );
  await upsertCategoryStats(normalizedName, player.name, category, denormalizedStats);
}

