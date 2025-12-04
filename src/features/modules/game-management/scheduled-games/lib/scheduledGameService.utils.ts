/**
 * Scheduled Game Service Utilities (Client-Safe)
 * 
 * Pure utility functions that are safe to use in both client and server code.
 * Server-only utilities are in scheduledGameService.utils.server.ts
 */

import { ScheduledGame } from '@/types/scheduledGame';

/**
 * Derive game status based on scheduled date/time and current time
 */
export function deriveGameStatus(data: {
  status?: string;
  scheduledDateTime: string;
  gameLength?: number;
}): ScheduledGame['status'] {
  const storedStatus = (data.status as ScheduledGame['status']) || 'scheduled';

  if (storedStatus === 'archived' || storedStatus === 'awaiting_replay' || storedStatus === 'cancelled') {
    return storedStatus;
  }

  const now = Date.now();
  const startTime = new Date(data.scheduledDateTime).getTime();
  const fallbackLengthSeconds = 3600;
  const durationSeconds = (data.gameLength && data.gameLength > 0 ? data.gameLength : fallbackLengthSeconds);
  const endTime = startTime + durationSeconds * 1000;

  if (Number.isNaN(startTime)) {
    return storedStatus;
  }

  if (now < startTime) {
    return 'scheduled';
  }

  if (now <= endTime) {
    return 'ongoing';
  }

  return 'awaiting_replay';
}


