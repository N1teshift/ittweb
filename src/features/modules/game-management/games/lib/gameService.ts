/**
 * Game Service - Main Entry Point
 * 
 * This file re-exports all game service functions from split modules for backward compatibility.
 * The service has been split into smaller modules:
 * - gameService.utils.ts - Helper functions
 * - gameService.create.ts - Create operations
 * - gameService.read.ts - Read operations
 * - gameService.update.ts - Update operations
 * - gameService.delete.ts - Delete operations
 * - gameService.participation.ts - Participation operations
 */

// Re-export updateEloScores from infrastructure for convenience
export { updateEloScores } from '@/features/modules/game-management/lib/mechanics';

// Re-export all create operations (server-only)
export {
  createScheduledGame,
  createCompletedGame,
  createGame,
} from './gameService.create.server';

// Re-export all read operations (server-only)
export {
  getGameById,
  getGames,
  getGamesWithPlayers,
  batchGetPlayersForGames,
} from './gameService.read.server';

// Re-export update operations (server-only)
export {
  updateGame,
} from './gameService.update.server';

// Re-export delete operations (server-only)
export {
  deleteGame,
} from './gameService.delete.server';

// Re-export participation operations (server-only)
export {
  joinGame,
  leaveGame,
} from './gameService.participation.server';

