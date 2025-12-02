import { GameCategory } from '../../../game-management/games/types';

/**
 * Standings entry
 */
export interface StandingsEntry {
  rank: number;
  name: string;
  score: number; // ELO
  wins: number;
  losses: number;
  winRate: number;
  games: number;
}

/**
 * Standings response
 */
export interface StandingsResponse {
  standings: StandingsEntry[];
  total: number;
  page: number;
  hasMore: boolean;
}

/**
 * Standings filters
 */
export interface StandingsFilters {
  category?: GameCategory;
  minGames?: number; // Minimum games threshold (default: 10)
  page?: number;
  limit?: number;
}

/**
 * Player category statistics in denormalized collection
 * This is stored in playerCategoryStats collection for efficient querying
 */
export interface PlayerCategoryStats {
  id: string; // playerId_category (e.g., "playername_1v1")
  playerId: string; // Reference to playerStats.id (normalized name)
  playerName: string; // Display name (original casing)
  category: GameCategory;
  wins: number;
  losses: number;
  draws: number;
  score: number; // Current ELO
  games: number; // wins + losses + draws
  winRate: number; // Computed: (wins / games) * 100
  lastPlayed?: string | import('firebase/firestore').Timestamp | import('firebase-admin/firestore').Timestamp;
  updatedAt: string | import('firebase/firestore').Timestamp | import('firebase-admin/firestore').Timestamp;
}


