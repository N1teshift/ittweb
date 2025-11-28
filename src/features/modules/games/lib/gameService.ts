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

// Re-export updateEloScores from eloCalculator for convenience
export { updateEloScores } from './eloCalculator';

// Re-export all create operations
export {
  createScheduledGame,
  createCompletedGame,
  createGame,
} from './gameService.create';

// Re-export all read operations
export {
  getGameById,
  getGames,
} from './gameService.read';

// Re-export update operations
export {
  updateGame,
} from './gameService.update';

// Re-export delete operations
export {
  deleteGame,
} from './gameService.delete';

// Re-export participation operations
export {
  joinGame,
  leaveGame,
} from './gameService.participation';
