/**
 * Activity data point (games per day)
 */
export interface ActivityDataPoint {
  date: string;
  games: number;
}

/**
 * ELO history data point
 */
export interface EloHistoryDataPoint {
  date: string;
  elo: number;
}

/**
 * Win rate data
 */
export interface WinRateData {
  wins: number;
  losses: number;
  draws: number;
}

/**
 * Class statistics
 */
export interface ClassStats {
  id: string; // Class name
  category?: string;
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  winRate: number;
  topPlayers: Array<{
    playerName: string;
    wins: number;
    losses: number;
    winRate: number;
    elo: number;
  }>;
  updatedAt: string;
}

/**
 * Game length data point (average duration per day)
 */
export interface GameLengthDataPoint {
  date: string;
  averageDuration: number; // in minutes
}

/**
 * Player activity data point (active players per month)
 */
export interface PlayerActivityDataPoint {
  date: string; // Month (YYYY-MM-01)
  players: number;
}

/**
 * Class selection data (for pie chart)
 */
export interface ClassSelectionData {
  className: string;
  count: number;
}

/**
 * Class win rate data (for bar chart)
 */
export interface ClassWinRateData {
  className: string;
  winRate: number; // percentage
}



