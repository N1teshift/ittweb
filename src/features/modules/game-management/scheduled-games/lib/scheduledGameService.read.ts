/**
 * Scheduled Game Service - Read Operations (Client Stub)
 * 
 * This file is a client-side stub. The actual server-only implementation
 * is in scheduledGameService.read.server.ts
 * 
 * These functions should only be called from API routes (server-side).
 * Client code should use API endpoints instead.
 */

import type { ScheduledGame } from '@/types/scheduledGame';

/**
 * Get all scheduled games, sorted by scheduled date (upcoming first)
 * @throws Error - This function is server-only. Use API routes instead.
 */
export async function getAllScheduledGames(_includePast: boolean = false, _includeArchived: boolean = false): Promise<ScheduledGame[]> {
  throw new Error('getAllScheduledGames is server-only. Use /api/scheduled-games API endpoint instead.');
}

/**
 * Get a scheduled game by ID
 * @throws Error - This function is server-only. Use API routes instead.
 */
export async function getScheduledGameById(_id: string): Promise<ScheduledGame | null> {
  throw new Error('getScheduledGameById is server-only. Use /api/scheduled-games/[id] API endpoint instead.');
}
