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
  category?: string | null;
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

/**
 * ITT-specific analytics types
 */

/**
 * Animal kills data (aggregate or per-player)
 */
export interface AnimalKillsData {
  elk: number;
  hawk: number;
  snake: number;
  wolf: number;
  bear: number;
  panther: number;
  total: number;
}

/**
 * Healing statistics data
 */
export interface HealingStatsData {
  selfHealing: number;
  allyHealing: number;
  totalHealing: number;
}

/**
 * Player ITT stats summary
 */
export interface PlayerITTStats {
  playerName: string;
  gamesPlayed: number;
  totalDamageDealt: number;
  totalSelfHealing: number;
  totalAllyHealing: number;
  totalMeatEaten: number;
  totalGoldAcquired: number;
  animalKills: AnimalKillsData;
  averagePerGame: {
    damageDealt: number;
    selfHealing: number;
    allyHealing: number;
    meatEaten: number;
    goldAcquired: number;
    animalKills: number;
  };
}

/**
 * Aggregate ITT stats across all games
 */
export interface AggregateITTStats {
  totalGames: number;
  totalDamageDealt: number;
  totalHealing: HealingStatsData;
  totalMeatEaten: number;
  totalGoldAcquired: number;
  totalAnimalKills: AnimalKillsData;
  averagesPerGame: {
    damageDealt: number;
    selfHealing: number;
    allyHealing: number;
    meatEaten: number;
    goldAcquired: number;
    animalKills: number;
  };
}

/**
 * Animal kills distribution data (for pie chart)
 */
export interface AnimalKillsDistribution {
  animalType: 'elk' | 'hawk' | 'snake' | 'wolf' | 'bear' | 'panther';
  count: number;
  percentage: number;
}

/**
 * Top hunters leaderboard entry
 */
export interface TopHunterEntry {
  playerName: string;
  totalKills: number;
  favoriteAnimal: string;
  gamesPlayed: number;
}

/**
 * Top healers leaderboard entry
 */
export interface TopHealerEntry {
  playerName: string;
  totalHealing: number;
  selfHealing: number;
  allyHealing: number;
  gamesPlayed: number;
}



