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

// Re-export all create operations (server-only)
export {
  createScheduledGame,
} from './scheduledGameService.create.server';

// Re-export all read operations (server-only)
export {
  getAllScheduledGames,
  getScheduledGameById,
} from './scheduledGameService.read.server';

// Re-export update operations (server-only)
export {
  updateScheduledGame,
} from './scheduledGameService.update.server';

// Re-export delete operations (server-only)
export {
  deleteScheduledGame,
} from './scheduledGameService.delete.server';

// Re-export participation operations (server-only)
export {
  joinScheduledGame,
  leaveScheduledGame,
} from './scheduledGameService.participation.server';

// Re-export utility functions (client-safe)
export {
  deriveGameStatus,
} from './scheduledGameService.utils';

// Re-export server-only utility functions
export {
  getNextScheduledGameId,
} from './scheduledGameService.utils.server';

