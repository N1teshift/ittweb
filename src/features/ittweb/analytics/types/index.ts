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


