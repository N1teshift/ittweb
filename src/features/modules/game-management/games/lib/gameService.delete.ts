/**
 * Game Service - Delete Operations (Client Stub)
 * 
 * This file is a client-side stub. The actual server-only implementation
 * is in gameService.delete.server.ts
 * 
 * These functions should only be called from API routes (server-side).
 * Client code should use API endpoints instead.
 */

/**
 * Delete a game
 * @throws Error - This function is server-only. Use API routes instead.
 */
export async function deleteGame(_id: string): Promise<void> {
  throw new Error('deleteGame is server-only. Use /api/games/[id] API endpoint instead.');
}
