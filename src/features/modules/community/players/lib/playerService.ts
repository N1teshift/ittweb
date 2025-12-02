/**
 * Player Service - Main Entry Point
 * 
 * This file re-exports all player service functions from split modules for backward compatibility.
 * The service has been split into smaller modules:
 * - playerService.utils.ts - Helper functions
 * - playerService.read.ts - Read operations
 * - playerService.update.ts - Update operations
 * - playerService.compare.ts - Compare operations
 */

// Re-export utilities
export {
  normalizePlayerName,
  calculateTotalGames,
} from './playerService.utils';

// Re-export all read operations
export {
  getPlayerStats,
  getAllPlayers,
  searchPlayers,
} from './playerService.read';

// Re-export update operations
export {
  updatePlayerStats,
} from './playerService.update';

// Re-export compare operations
export {
  comparePlayers,
} from './playerService.compare';

