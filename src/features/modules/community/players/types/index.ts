import { Timestamp } from 'firebase/firestore';
import { GameCategory } from '../../../game-management/games/types';

/**
 * Category-specific player statistics
 */
export interface CategoryStats {
  wins: number;
  losses: number;
  draws: number;
  score: number; // Current ELO
  games: number; // Total games
  rank?: number; // Current rank
  peakElo?: number;
  peakEloDate?: Timestamp | string;
}

/**
 * Player statistics
 */
export interface PlayerStats {
  id: string; // Normalized player name (lowercase)
  name: string; // Display name (original casing)
  categories: {
    [category: string]: CategoryStats;
  };
  totalGames: number;
  lastPlayed?: Timestamp | string;
  firstPlayed?: Timestamp | string;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

/**
 * Player profile data (includes additional computed data)
 */
export interface PlayerProfile extends PlayerStats {
  recentGames?: import('../../../game-management/games/types').Game[];
  activity?: { [date: string]: number }; // Games per day
  eloHistory?: Array<{ date: string; elo: number }>;
  classStats?: {
    [className: string]: {
      wins: number;
      losses: number;
      winRate: number;
      games: number;
    };
  };
}

/**
 * Player comparison data
 */
export interface PlayerComparison {
  players: PlayerStats[];
  headToHead: {
    [player1: string]: {
      [player2: string]: {
        wins: number;
        losses: number;
      };
    };
  };
  eloComparison: Array<{
    date: string;
    [playerName: string]: number | string;
  }>;
}

/**
 * Player search filters
 */
export interface PlayerSearchFilters {
  category?: GameCategory;
  startDate?: string;
  endDate?: string;
  includeGames?: boolean;
}



