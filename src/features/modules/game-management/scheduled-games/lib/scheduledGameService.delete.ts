/**
 * Scheduled Game Service - Delete Operations (Client Stub)
 * 
 * This file is a client-side stub. The actual server-only implementation
 * is in scheduledGameService.delete.server.ts
 * 
 * These functions should only be called from API routes (server-side).
 * Client code should use API endpoints instead.
 */

/**
 * Delete a scheduled game
 * @throws Error - This function is server-only. Use API routes instead.
 */
export async function deleteScheduledGame(_id: string): Promise<void> {
  throw new Error('deleteScheduledGame is server-only. Use /api/scheduled-games/[id] API endpoint instead.');
}
