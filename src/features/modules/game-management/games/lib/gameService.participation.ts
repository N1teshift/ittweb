/**
 * Game Service - Participation Operations (Client Stub)
 * 
 * This file is a client-side stub. The actual server-only implementation
 * is in gameService.participation.server.ts
 * 
 * These functions should only be called from API routes (server-side).
 * Client code should use API endpoints instead.
 */

/**
 * Join a scheduled game (add participant)
 * @throws Error - This function is server-only. Use API routes instead.
 */
export async function joinGame(_gameId: string, _discordId: string, _name: string): Promise<void> {
  throw new Error('joinGame is server-only. Use /api/games/[id]/join API endpoint instead.');
}

/**
 * Leave a scheduled game (remove participant)
 * @throws Error - This function is server-only. Use API routes instead.
 */
export async function leaveGame(_gameId: string, _discordId: string): Promise<void> {
  throw new Error('leaveGame is server-only. Use /api/games/[id]/leave API endpoint instead.');
}
