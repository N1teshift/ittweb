/**
 * Helper utilities for standings service
 * Extracted to reduce code duplication between optimized/legacy and server/client paths
 */

import type { StandingsEntry } from '../types';

/**
 * Sort standings entries by score (ELO) descending, then by win rate, then by wins
 */
export function sortStandingsEntries(standings: StandingsEntry[]): StandingsEntry[] {
  return standings.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.winRate !== a.winRate) return b.winRate - a.winRate;
    return b.wins - a.wins;
  });
}

/**
 * Assign ranks to standings entries (must be called after sorting)
 */
export function assignRanks(standings: StandingsEntry[]): void {
  standings.forEach((entry, index) => {
    entry.rank = index + 1;
  });
}

/**
 * Paginate standings entries
 */
export function paginateStandings(
  standings: StandingsEntry[],
  page: number,
  pageLimit: number
): StandingsEntry[] {
  const startIndex = (page - 1) * pageLimit;
  const endIndex = startIndex + pageLimit;
  return standings.slice(startIndex, endIndex);
}

/**
 * Create a standings entry from optimized collection data
 */
export function createStandingsEntryFromOptimized(data: Record<string, unknown>, docId: string): StandingsEntry {
  return {
    rank: 0, // Will be calculated after sorting
    name: (data.playerName || data.playerId || docId) as string,
    score: (data.score as number) || 1000,
    wins: (data.wins as number) || 0,
    losses: (data.losses as number) || 0,
    winRate: (data.winRate as number) || 0,
    games: (data.games as number) || 0,
  };
}

/**
 * Create a standings entry from legacy player stats data
 */
export function createStandingsEntryFromLegacy(
  data: Record<string, unknown>,
  docId: string,
  category: string,
  minGames: number
): StandingsEntry | null {
  const categoryStats = (data.categories as Record<string, unknown>)?.[category] as {
    wins?: number;
    losses?: number;
    draws?: number;
    score?: number;
  } | undefined;

  if (!categoryStats) return null;

  const wins = categoryStats.wins || 0;
  const losses = categoryStats.losses || 0;
  const draws = categoryStats.draws || 0;
  const games = wins + losses + draws;

  if (games < minGames) return null;

  const winRate = games > 0 ? (wins / games) * 100 : 0;

  return {
    rank: 0, // Will be calculated after sorting
    name: (data.name || docId) as string,
    score: categoryStats.score || 1000,
    wins,
    losses,
    winRate: Math.round(winRate * 100) / 100,
    games,
  };
}

/**
 * Process standings entries: sort, assign ranks, and paginate
 */
export function processStandingsEntries(
  standings: StandingsEntry[],
  page: number,
  pageLimit: number,
  total: number
): {
  standings: StandingsEntry[];
  total: number;
  page: number;
  hasMore: boolean;
} {
  // Sort by score (ELO) descending, then by win rate, then by wins
  const sorted = sortStandingsEntries(standings);

  // Assign ranks
  assignRanks(sorted);

  // Apply pagination
  const paginatedStandings = paginateStandings(sorted, page, pageLimit);

  const startIndex = (page - 1) * pageLimit;
  const endIndex = startIndex + pageLimit;

  return {
    standings: paginatedStandings,
    total,
    page,
    hasMore: endIndex < sorted.length,
  };
}


