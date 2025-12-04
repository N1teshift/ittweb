/**
 * Scheduled Game Service - Participation Operations (Client Stub)
 * 
 * This file is a client-side stub. The actual server-only implementation
 * is in scheduledGameService.participation.server.ts
 * 
 * These functions should only be called from API routes (server-side).
 * Client code should use API endpoints instead.
 */

/**
 * Join a scheduled game
 * @throws Error - This function is server-only. Use API routes instead.
 */
export async function joinScheduledGame(_gameId: string, _discordId: string, _name: string): Promise<void> {
  throw new Error('joinScheduledGame is server-only. Use /api/scheduled-games/[id]/join API endpoint instead.');
}

/**
 * Leave a scheduled game
 * @throws Error - This function is server-only. Use API routes instead.
 */
export async function leaveScheduledGame(_gameId: string, _discordId: string): Promise<void> {
  throw new Error('leaveScheduledGame is server-only. Use /api/scheduled-games/[id]/leave API endpoint instead.');
}
