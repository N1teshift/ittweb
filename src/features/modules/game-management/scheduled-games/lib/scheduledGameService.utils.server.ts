/**
 * Scheduled Game Service Utilities (Server-Only)
 * 
 * Server-only utility functions for scheduled game services.
 * Client-safe utilities are in scheduledGameService.utils.ts
 */

import { getFirestoreAdmin } from '@/features/infrastructure/api/firebase/admin';
import { ScheduledGame } from '@/types/scheduledGame';
import { createComponentLogger } from '@/features/infrastructure/logging';

const GAMES_COLLECTION = 'games'; // Unified games collection (scheduled and completed)
const logger = createComponentLogger('scheduledGameService');

/**
 * Derive game status based on scheduled date/time and current time
 * (Client-safe utility - can be used on both client and server)
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

/**
 * Get the next available scheduled game ID (Server-Only)
 * Queries all scheduled games and finds the highest ID, then increments by 1
 */
export async function getNextScheduledGameId(): Promise<number> {
  try {
    const adminDb = getFirestoreAdmin();
    // Query unified games collection for scheduled games
    const querySnapshot = await adminDb.collection(GAMES_COLLECTION)
      .where('gameState', '==', 'scheduled')
      .orderBy('gameId', 'desc')
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      // No scheduled games exist, start at 1
      return 1;
    }

    const lastGame = querySnapshot.docs[0].data();
    const lastId = typeof lastGame.gameId === 'number' ? lastGame.gameId : Number(lastGame.gameId) || 0;
    return lastId + 1;
  } catch (error) {
    // If there's an error (e.g., index not built), try fetching all and finding max
    logger.warn('Error getting next scheduled game ID, falling back to full query', { error });
    
    try {
      const adminDb = getFirestoreAdmin();
      // Query all scheduled games from unified collection
      const querySnapshot = await adminDb.collection(GAMES_COLLECTION)
        .where('gameState', '==', 'scheduled')
        .get();
      
      let maxId = 0;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const id = typeof data.gameId === 'number' ? data.gameId : Number(data.gameId) || 0;
        if (id > maxId) {
          maxId = id;
        }
      });
      
      return maxId + 1;
    } catch (fallbackError) {
      // If even fallback fails, start at 1
      const error = fallbackError instanceof Error ? fallbackError : new Error(String(fallbackError));
      logger.error('Failed to get next scheduled game ID, defaulting to 1', error);
      return 1;
    }
  }
}

