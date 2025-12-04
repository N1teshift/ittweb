/**
 * Player Category Stats Service (Client Stub)
 * 
 * This file is a client-side stub. The actual server-only implementation
 * is in playerCategoryStatsService.server.ts
 * 
 * These functions should only be called from API routes (server-side).
 * Client code should use API endpoints instead.
 */

import type { GameCategory } from '../../../game-management/games/types';

/**
 * Generate document ID for player category stats
 */
export function getPlayerCategoryStatsId(playerId: string, category: GameCategory): string {
  return `${playerId}_${category}`;
}

/**
 * Update or create player category stats
 * @throws Error - This function is server-only. Use API routes instead.
 */
export async function upsertPlayerCategoryStats(
  _playerId: string,
  _playerName: string,
  _category: GameCategory,
  _stats: {
    wins: number;
    losses: number;
    draws: number;
    score: number;
    lastPlayed?: Date;
  }
): Promise<void> {
  throw new Error('upsertPlayerCategoryStats is server-only. Use API routes instead.');
}

/**
 * Delete player category stats document
 * @throws Error - This function is server-only. Use API routes instead.
 */
export async function deletePlayerCategoryStats(
  _playerId: string,
  _category: GameCategory
): Promise<void> {
  throw new Error('deletePlayerCategoryStats is server-only. Use API routes instead.');
}
