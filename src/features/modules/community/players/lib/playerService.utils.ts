/**
 * Player Service Utilities
 * 
 * Helper functions used across player service operations
 */

import type { CategoryStats } from '../types';

/**
 * Calculate total games from categories
 */
export function calculateTotalGames(categories: { [key: string]: CategoryStats }): number {
  return Object.values(categories).reduce((total, stats) => {
    return total + (stats.games || 0);
  }, 0);
}

/**
 * Normalize player name for consistent lookup
 * Converts to lowercase and trims whitespace
 */
export function normalizePlayerName(name: string): string {
  return name.toLowerCase().trim();
}


