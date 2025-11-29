/**
 * Scheduled Game Service - Main Entry Point
 * 
 * This file re-exports all scheduled game service functions from split modules for backward compatibility.
 * The service has been split into smaller modules:
 * - scheduledGameService.utils.ts - Helper functions (deriveGameStatus, getNextScheduledGameId)
 * - scheduledGameService.create.ts - Create operations
 * - scheduledGameService.read.ts - Read operations (getAllScheduledGames, getScheduledGameById)
 * - scheduledGameService.read.helpers.ts - Read helper functions (data conversion, filtering)
 * - scheduledGameService.update.ts - Update operations
 * - scheduledGameService.delete.ts - Delete operations
 * - scheduledGameService.participation.ts - Join/leave operations
 */

// Re-export all create operations
export {
  createScheduledGame,
} from './scheduledGameService.create';

// Re-export all read operations
export {
  getAllScheduledGames,
  getScheduledGameById,
} from './scheduledGameService.read';

// Re-export update operations
export {
  updateScheduledGame,
} from './scheduledGameService.update';

// Re-export delete operations
export {
  deleteScheduledGame,
} from './scheduledGameService.delete';

// Re-export participation operations
export {
  joinScheduledGame,
  leaveScheduledGame,
} from './scheduledGameService.participation';

// Re-export utility functions (if needed externally)
export {
  deriveGameStatus,
  getNextScheduledGameId,
} from './scheduledGameService.utils';
