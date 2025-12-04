/**
 * Scheduled Game Service - Update Operations (Client Stub)
 * 
 * This file is a client-side stub. The actual server-only implementation
 * is in scheduledGameService.update.server.ts
 * 
 * These functions should only be called from API routes (server-side).
 * Client code should use API endpoints instead.
 */

import type { CreateScheduledGame } from '@/types/scheduledGame';

/**
 * Update a scheduled game
 * @throws Error - This function is server-only. Use API routes instead.
 */
export async function updateScheduledGame(
  _id: string, 
  _updates: Partial<CreateScheduledGame> & { 
    status?: 'scheduled' | 'ongoing' | 'awaiting_replay' | 'archived' | 'cancelled';
    linkedGameDocumentId?: string;
    linkedArchiveDocumentId?: string;
  }
): Promise<void> {
  throw new Error('updateScheduledGame is server-only. Use /api/scheduled-games/[id] API endpoint instead.');
}
