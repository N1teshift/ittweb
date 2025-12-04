/**
 * Game Service - Read Operations (Client Stub)
 * 
 * This file is a client-side stub. The actual server-only implementation
 * is in gameService.read.server.ts
 * 
 * These functions should only be called from API routes (server-side).
 * Client code should use API endpoints instead.
 */

import type {
  GameWithPlayers,
  GameFilters,
  GameListResponse,
} from '../types';

/**
 * Get a game by ID
 * @throws Error - This function is server-only. Use API routes instead.
 */
export async function getGameById(_id: string): Promise<GameWithPlayers | null> {
  throw new Error('getGameById is server-only. Use /api/games/[id] API endpoint instead.');
}

/**
 * Batch fetch players for multiple games
 * @throws Error - This function is server-only. Use API routes instead.
 */
export async function batchGetPlayersForGames(_gameIds: string[]): Promise<Map<string, unknown[]>> {
  throw new Error('batchGetPlayersForGames is server-only. Use API routes instead.');
}

/**
 * Get games with their players included
 * @throws Error - This function is server-only. Use API routes instead.
 */
export async function getGamesWithPlayers(_filters: GameFilters = {}): Promise<{ games: GameWithPlayers[]; nextCursor?: string; hasMore: boolean }> {
  throw new Error('getGamesWithPlayers is server-only. Use /api/games API endpoint instead.');
}

/**
 * Get games with filters
 * @throws Error - This function is server-only. Use API routes instead.
 */
export async function getGames(_filters: GameFilters = {}): Promise<GameListResponse> {
  throw new Error('getGames is server-only. Use /api/games API endpoint instead.');
}
