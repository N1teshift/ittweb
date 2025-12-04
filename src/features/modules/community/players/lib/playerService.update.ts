/**
 * Player Service - Update Operations (Client Stub)
 * 
 * This file is a client-side stub. The actual server-only implementation
 * is in playerService.update.server.ts
 * 
 * These functions should only be called from API routes (server-side).
 * Client code should use API endpoints instead.
 */

/**
 * Update player statistics after a game
 * @throws Error - This function is server-only. Use API routes instead.
 */
export async function updatePlayerStats(_gameId: string): Promise<void> {
  throw new Error('updatePlayerStats is server-only. Use /api/players/update API endpoint instead.');
}
