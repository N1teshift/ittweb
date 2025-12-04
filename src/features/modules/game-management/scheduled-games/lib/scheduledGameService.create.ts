/**
 * Scheduled Game Service - Create Operations (Client Stub)
 * 
 * This file is a client-side stub. The actual server-only implementation
 * is in scheduledGameService.create.server.ts
 * 
 * These functions should only be called from API routes (server-side).
 * Client code should use API endpoints instead.
 */

import type { CreateScheduledGame } from '@/types/scheduledGame';

/**
 * Create a new scheduled game
 * @throws Error - This function is server-only. Use API routes instead.
 */
export async function createScheduledGame(_gameData: CreateScheduledGame): Promise<string> {
  throw new Error('createScheduledGame is server-only. Use /api/scheduled-games API endpoint instead.');
}
