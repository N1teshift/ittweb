/**
 * Standings Service (Client Stub)
 * 
 * This file is a client-side stub. The actual server-only implementation
 * is in standingsService.server.ts
 * 
 * These functions should only be called from API routes (server-side).
 * Client code should use API endpoints instead.
 */

import type { StandingsResponse, StandingsFilters } from '../types';

/**
 * Minimum games required to be ranked
 */
export const MIN_GAMES_FOR_RANKING = 10;

/**
 * Get standings/leaderboard using optimized denormalized collection
 * @throws Error - This function is server-only. Use API routes instead.
 */
export async function getStandings(_filters: StandingsFilters = {}): Promise<StandingsResponse> {
  throw new Error('getStandings is server-only. Use /api/standings API endpoint instead.');
}

/**
 * Calculate player's rank in a category
 * @throws Error - This function is server-only. Use API routes instead.
 */
export async function calculateRank(_playerName: string, _category: string): Promise<number | null> {
  throw new Error('calculateRank is server-only. Use /api/standings/rank API endpoint instead.');
}
