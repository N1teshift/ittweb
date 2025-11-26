import { GameCategory } from '../../games/types';

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


