/**
 * Player Service - Read Operations (Client Stub)
 * 
 * This file is a client-side stub. The actual server-only implementation
 * is in playerService.read.server.ts
 * 
 * These functions should only be called from API routes (server-side).
 * Client code should use API endpoints instead.
 */

import type { PlayerStats, PlayerProfile, PlayerSearchFilters } from '../types';

/**
 * Get player statistics
 * @throws Error - This function is server-only. Use API routes instead.
 */
export async function getPlayerStats(_name: string, _filters?: PlayerSearchFilters): Promise<PlayerProfile | null> {
  throw new Error('getPlayerStats is server-only. Use /api/players/[name] API endpoint instead.');
}

/**
 * Get all players with basic stats (with pagination support)
 * @throws Error - This function is server-only. Use API routes instead.
 */
export async function getAllPlayers(_limit: number = 50, _lastPlayerName?: string): Promise<{ players: PlayerStats[]; hasMore: boolean; lastPlayerName: string | null }> {
  throw new Error('getAllPlayers is server-only. Use /api/players API endpoint instead.');
}

/**
 * Search players by name
 * @throws Error - This function is server-only. Use API routes instead.
 */
export async function searchPlayers(_searchQuery: string): Promise<string[]> {
  throw new Error('searchPlayers is server-only. Use /api/players/search API endpoint instead.');
}
