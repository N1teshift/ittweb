import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import { getGamesWithPlayers } from '../../../game-management/games/lib/gameService';
import { timestampToIso } from '@/features/infrastructure/utils';
import type { 
  ActivityDataPoint, 
  EloHistoryDataPoint, 
  WinRateData,
  GameLengthDataPoint,
  PlayerActivityDataPoint,
  ClassSelectionData,
  ClassWinRateData,
  AnimalKillsData,
  AnimalKillsDistribution,
  AggregateITTStats,
  TopHunterEntry,
  TopHealerEntry,
} from '../types';
import type { GameWithPlayers } from '../../../game-management/games/types';
import { format, eachDayOfInterval, parseISO, startOfMonth, eachMonthOfInterval } from 'date-fns';
import { 
  getCachedAnalytics, 
  filterGamesByTeamFormat,
  type AnalyticsFilters 
} from './analyticsCache';

const logger = createComponentLogger('analyticsService');

/**
 * Helper to fetch completed games with players
 * Uses the optimized batch fetching
 */
async function fetchCompletedGamesWithPlayers(
  category?: string,
  startDate?: string,
  endDate?: string,
  limit = 10000
): Promise<GameWithPlayers[]> {
  const result = await getGamesWithPlayers({
    category,
    startDate,
    endDate,
    gameState: 'completed',
    limit,
  });
  return result.games;
}

/**
 * Get activity data (games per day)
 * Uses Firestore cache for performance
 */
export async function getActivityData(
  playerName?: string,
  startDate?: string,
  endDate?: string,
  category?: string
): Promise<ActivityDataPoint[]> {
  const filters: AnalyticsFilters = { category, startDate, endDate, playerName };
  
  return getCachedAnalytics('activity', filters, async () => {
    try {
      logger.info('Computing activity data', { playerName, startDate, endDate, category });

      const games = await fetchCompletedGamesWithPlayers(category, startDate, endDate);

      // For chart generation, use provided dates or find the actual date range from games
      let start: Date;
      let end: Date;
      
      if (startDate && endDate) {
        start = parseISO(startDate);
        end = parseISO(endDate);
      } else if (games.length > 0) {
        // Find the actual date range from the games
        const gameDates = games
          .map(g => {
            if (!g.datetime) return null;
            try {
              const datetimeIso = timestampToIso(g.datetime);
              return new Date(datetimeIso);
            } catch {
              return null;
            }
          })
          .filter((d): d is Date => d !== null);
        
        if (gameDates.length > 0) {
          const minDate = new Date(Math.min(...gameDates.map(d => d.getTime())));
          const maxDate = new Date(Math.max(...gameDates.map(d => d.getTime())));
          // Extend range by 7 days on each side for better visualization
          start = new Date(minDate.getTime() - 7 * 24 * 60 * 60 * 1000);
          end = new Date(maxDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        } else {
          start = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
          end = new Date();
        }
      } else {
        start = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        end = new Date();
      }
      
      const days = eachDayOfInterval({ start, end });

      const gamesByDate = new Map<string, number>();
      games.forEach((game) => {
        if (!game.datetime) return;
        try {
          const datetimeIso = timestampToIso(game.datetime);
          const date = format(new Date(datetimeIso), 'yyyy-MM-dd');
          gamesByDate.set(date, (gamesByDate.get(date) || 0) + 1);
        } catch {
          // Skip games with invalid datetime
        }
      });

      return days.map((day) => ({
        date: format(day, 'yyyy-MM-dd'),
        games: gamesByDate.get(format(day, 'yyyy-MM-dd')) || 0,
      }));
    } catch (error) {
      const err = error as Error;
      logError(err, 'Failed to get activity data', {
        component: 'analyticsService',
        operation: 'getActivityData',
      });
      return [];
    }
  });
}

/**
 * Get ELO history for a player
 * Uses batch fetching for efficiency
 */
export async function getEloHistory(
  playerName: string,
  category: string,
  startDate?: string,
  endDate?: string
): Promise<EloHistoryDataPoint[]> {
  const filters: AnalyticsFilters = { category, startDate, endDate, playerName };
  
  return getCachedAnalytics('eloHistory', filters, async () => {
    try {
      logger.info('Computing ELO history', { playerName, category, startDate, endDate });

      // Use batch fetching - games already include players
      const games = await fetchCompletedGamesWithPlayers(category, startDate, endDate);
      
      // Filter games that include the player
      const playerGames = games.filter(game => 
        game.players?.some(p => p.name.toLowerCase() === playerName.toLowerCase())
      );

      // Get starting ELO
      const playerStats = await getPlayerStats(playerName);
      const categoryStats = playerStats?.categories[category];
      let currentElo = categoryStats?.score || 1000;

      // Build ELO history by processing games in chronological order
      const sortedGames = [...playerGames].sort(
        (a, b) => new Date(a.datetime as string).getTime() - new Date(b.datetime as string).getTime()
      );

      const eloHistory: EloHistoryDataPoint[] = [];
      const start = startDate ? parseISO(startDate) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      eloHistory.push({
        date: format(start, 'yyyy-MM-dd'),
        elo: currentElo,
      });

      for (const game of sortedGames) {
        const playerInGame = game.players?.find(
          p => p.name.toLowerCase() === playerName.toLowerCase()
        );
        if (playerInGame?.elochange !== undefined) {
          currentElo += playerInGame.elochange;
          const datetimeIso = timestampToIso(game.datetime);
          eloHistory.push({
            date: format(new Date(datetimeIso), 'yyyy-MM-dd'),
            elo: currentElo,
          });
        }
      }

      return eloHistory;
    } catch (error) {
      const err = error as Error;
      logError(err, 'Failed to get ELO history', {
        component: 'analyticsService',
        operation: 'getEloHistory',
      });
      return [];
    }
  });
}

async function getPlayerStats(name: string) {
  const { getPlayerStats: getStats } = await import('../../../community/players/lib/playerService');
  return getStats(name);
}

/**
 * Get win rate data
 * Uses batch fetching for efficiency
 */
export async function getWinRateData(
  playerName?: string,
  category?: string,
  startDate?: string,
  endDate?: string
): Promise<WinRateData> {
  const filters: AnalyticsFilters = { category, startDate, endDate, playerName };
  
  return getCachedAnalytics('winRate', filters, async () => {
    try {
      logger.info('Computing win rate data', { playerName, category, startDate, endDate });

      if (playerName) {
        const playerStats = await getPlayerStats(playerName);
        if (!playerStats) {
          return { wins: 0, losses: 0, draws: 0 };
        }

        const cat = category || 'default';
        const stats = playerStats.categories[cat];
        if (!stats) {
          return { wins: 0, losses: 0, draws: 0 };
        }

        return {
          wins: stats.wins,
          losses: stats.losses,
          draws: stats.draws,
        };
      }

      // Aggregate across all players - use batch fetching
      const games = await fetchCompletedGamesWithPlayers(category, startDate, endDate);

      let wins = 0;
      let losses = 0;
      let draws = 0;

      for (const game of games) {
        if (!game.players) continue;

        game.players.forEach((player) => {
          if (player.flag === 'winner') wins++;
          else if (player.flag === 'loser') losses++;
          else if (player.flag === 'drawer') draws++;
        });
      }

      return { wins, losses, draws };
    } catch (error) {
      const err = error as Error;
      logError(err, 'Failed to get win rate data', {
        component: 'analyticsService',
        operation: 'getWinRateData',
      });
      return { wins: 0, losses: 0, draws: 0 };
    }
  });
}

/**
 * Get class statistics
 * Uses batch fetching and caching for efficiency
 */
export async function getClassStats(category?: string): Promise<import('../types').ClassStats[]> {
  const filters: AnalyticsFilters = { category };
  
  return getCachedAnalytics('classStats', filters, async () => {
    try {
      logger.info('Computing class stats', { category });

      // Use batch fetching - games already include players
      const games = await fetchCompletedGamesWithPlayers(category);

      // Aggregate class statistics
      const classStatsMap: { [className: string]: {
        totalGames: number;
        totalWins: number;
        totalLosses: number;
        playerStats: { [playerName: string]: {
          wins: number;
          losses: number;
          elo: number;
        } };
      } } = {};

      // Process each game - players already included
      for (const game of games) {
        if (!game.players) continue;

        for (const player of game.players) {
          if (!player.class || player.flag === 'drawer') continue;

          const className = player.class.toLowerCase().trim();
          if (!className) continue;

          // Initialize class stats if needed
          if (!classStatsMap[className]) {
            classStatsMap[className] = {
              totalGames: 0,
              totalWins: 0,
              totalLosses: 0,
              playerStats: {},
            };
          }

          const classStats = classStatsMap[className];
          classStats.totalGames += 1;

          if (player.flag === 'winner') {
            classStats.totalWins += 1;
          } else if (player.flag === 'loser') {
            classStats.totalLosses += 1;
          }

          // Track player stats for this class
          const playerName = player.name;
          if (!classStats.playerStats[playerName]) {
            classStats.playerStats[playerName] = {
              wins: 0,
              losses: 0,
              elo: 0,
            };
          }

          const playerClassStats = classStats.playerStats[playerName];
          if (player.flag === 'winner') {
            playerClassStats.wins += 1;
          } else if (player.flag === 'loser') {
            playerClassStats.losses += 1;
          }

          if (player.elochange) {
            playerClassStats.elo += player.elochange;
          }
        }
      }

      // Convert to ClassStats array
      const classStatsArray: import('../types').ClassStats[] = [];

      for (const [className, stats] of Object.entries(classStatsMap)) {
        const totalGames = stats.totalGames;
        const totalWins = stats.totalWins;
        const totalLosses = stats.totalLosses;
        const winRate = totalGames > 0 ? (totalWins / (totalWins + totalLosses)) * 100 : 0;

        // Get top players for this class
        const topPlayers = Object.entries(stats.playerStats)
          .map(([playerName, playerStats]) => {
            const playerGames = playerStats.wins + playerStats.losses;
            const playerWinRate = playerGames > 0 
              ? (playerStats.wins / playerGames) * 100 
              : 0;
            return {
              playerName,
              wins: playerStats.wins,
              losses: playerStats.losses,
              winRate: playerWinRate,
              elo: playerStats.elo,
            };
          })
          .filter(p => p.wins + p.losses > 0)
          .sort((a, b) => {
            if (b.winRate !== a.winRate) return b.winRate - a.winRate;
            const aGames = a.wins + a.losses;
            const bGames = b.wins + b.losses;
            if (bGames !== aGames) return bGames - aGames;
            return b.elo - a.elo;
          })
          .slice(0, 10);

        classStatsArray.push({
          id: className,
          category: category ?? null,
          totalGames,
          totalWins,
          totalLosses,
          winRate,
          topPlayers,
          updatedAt: new Date().toISOString(),
        });
      }

      classStatsArray.sort((a, b) => b.totalGames - a.totalGames);

      return classStatsArray;
    } catch (error) {
      const err = error as Error;
      logError(err, 'Failed to get class stats', {
        component: 'analyticsService',
        operation: 'getClassStats',
      });
      return [];
    }
  });
}

/**
 * Get game length data (average duration per day)
 * Uses batch fetching and caching for efficiency
 */
export async function getGameLengthData(
  category?: string,
  startDate?: string,
  endDate?: string,
  teamFormat?: string
): Promise<GameLengthDataPoint[]> {
  const filters: AnalyticsFilters = { category, startDate, endDate, teamFormat };
  
  return getCachedAnalytics('gameLength', filters, async () => {
    try {
      logger.info('Computing game length data', { category, startDate, endDate, teamFormat });

      let games = await fetchCompletedGamesWithPlayers(category, startDate, endDate);

      // Filter by team format if specified
      if (teamFormat) {
        games = filterGamesByTeamFormat(games, teamFormat);
      }

      const start = startDate ? parseISO(startDate) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      const end = endDate ? parseISO(endDate) : new Date();
      const days = eachDayOfInterval({ start, end });

      // Group games by date and calculate average duration
      const gamesByDate = new Map<string, { total: number; count: number }>();
      
      for (const game of games) {
        if (!game.datetime) continue;
        const datetimeIso = timestampToIso(game.datetime);
        const date = format(new Date(datetimeIso), 'yyyy-MM-dd');
        const durationMinutes = (game.duration || 0) / 60;
        const existing = gamesByDate.get(date) || { total: 0, count: 0 };
        gamesByDate.set(date, {
          total: existing.total + durationMinutes,
          count: existing.count + 1,
        });
      }

      return days.map((day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const data = gamesByDate.get(dateStr);
        return {
          date: dateStr,
          averageDuration: data && data.count > 0 ? data.total / data.count : 0,
        };
      });
    } catch (error) {
      const err = error as Error;
      logError(err, 'Failed to get game length data', {
        component: 'analyticsService',
        operation: 'getGameLengthData',
      });
      return [];
    }
  });
}

/**
 * Get player activity data (active players per month)
 * Uses batch fetching and caching for efficiency
 */
export async function getPlayerActivityData(
  category?: string,
  startDate?: string,
  endDate?: string,
  teamFormat?: string
): Promise<PlayerActivityDataPoint[]> {
  const filters: AnalyticsFilters = { category, startDate, endDate, teamFormat };
  
  return getCachedAnalytics('playerActivity', filters, async () => {
    try {
      logger.info('Computing player activity data', { category, startDate, endDate, teamFormat });

      let games = await fetchCompletedGamesWithPlayers(category, startDate, endDate);

      // Filter by team format if specified
      if (teamFormat) {
        games = filterGamesByTeamFormat(games, teamFormat);
      }

      const start = startDate ? parseISO(startDate) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      const end = endDate ? parseISO(endDate) : new Date();
      const months = eachMonthOfInterval({ start, end });

      // Group unique players by month
      const playersByMonth = new Map<string, Set<string>>();

      for (const game of games) {
        if (!game.players || !game.datetime) continue;

        const datetimeIso = timestampToIso(game.datetime);
        const month = format(startOfMonth(new Date(datetimeIso)), 'yyyy-MM-dd');
        if (!playersByMonth.has(month)) {
          playersByMonth.set(month, new Set());
        }

        game.players.forEach((player) => {
          playersByMonth.get(month)?.add(player.name.toLowerCase());
        });
      }

      return months.map((month) => {
        const monthStr = format(startOfMonth(month), 'yyyy-MM-dd');
        const players = playersByMonth.get(monthStr);
        return {
          date: monthStr,
          players: players ? players.size : 0,
        };
      });
    } catch (error) {
      const err = error as Error;
      logError(err, 'Failed to get player activity data', {
        component: 'analyticsService',
        operation: 'getPlayerActivityData',
      });
      return [];
    }
  });
}

/**
 * Get class selection data (for pie chart)
 * Uses batch fetching and caching for efficiency
 */
export async function getClassSelectionData(
  category?: string,
  startDate?: string,
  endDate?: string,
  teamFormat?: string
): Promise<ClassSelectionData[]> {
  const filters: AnalyticsFilters = { category, startDate, endDate, teamFormat };
  
  return getCachedAnalytics('classSelection', filters, async () => {
    try {
      logger.info('Computing class selection data', { category, startDate, endDate, teamFormat });

      let games = await fetchCompletedGamesWithPlayers(category, startDate, endDate);

      // Filter by team format if specified
      if (teamFormat) {
        games = filterGamesByTeamFormat(games, teamFormat);
      }

      const classCounts = new Map<string, number>();

      for (const game of games) {
        if (!game.players) continue;

        game.players.forEach((player) => {
          if (player.class && player.flag !== 'drawer') {
            const className = player.class.toLowerCase().trim();
            if (className) {
              classCounts.set(className, (classCounts.get(className) || 0) + 1);
            }
          }
        });
      }

      return Array.from(classCounts.entries())
        .map(([className, count]) => ({ className, count }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      const err = error as Error;
      logError(err, 'Failed to get class selection data', {
        component: 'analyticsService',
        operation: 'getClassSelectionData',
      });
      return [];
    }
  });
}

/**
 * Get class win rate data (for bar chart)
 * Uses batch fetching and caching for efficiency
 */
export async function getClassWinRateData(
  category?: string,
  startDate?: string,
  endDate?: string,
  teamFormat?: string
): Promise<ClassWinRateData[]> {
  const filters: AnalyticsFilters = { category, startDate, endDate, teamFormat };
  
  return getCachedAnalytics('classWinRate', filters, async () => {
    try {
      logger.info('Computing class win rate data', { category, startDate, endDate, teamFormat });

      let games = await fetchCompletedGamesWithPlayers(category, startDate, endDate);

      // Filter by team format if specified
      if (teamFormat) {
        games = filterGamesByTeamFormat(games, teamFormat);
      }

      const classStats = new Map<string, { wins: number; losses: number }>();

      for (const game of games) {
        if (!game.players) continue;

        game.players.forEach((player) => {
          if (player.class && player.flag !== 'drawer') {
            const className = player.class.toLowerCase().trim();
            if (className) {
              if (!classStats.has(className)) {
                classStats.set(className, { wins: 0, losses: 0 });
              }
              const stats = classStats.get(className)!;
              if (player.flag === 'winner') {
                stats.wins += 1;
              } else if (player.flag === 'loser') {
                stats.losses += 1;
              }
            }
          }
        });
      }

      return Array.from(classStats.entries())
        .map(([className, stats]) => {
          const total = stats.wins + stats.losses;
          const winRate = total > 0 ? (stats.wins / total) * 100 : 0;
          return { className, winRate };
        })
        .sort((a, b) => b.winRate - a.winRate);
    } catch (error) {
      const err = error as Error;
      logError(err, 'Failed to get class win rate data', {
        component: 'analyticsService',
        operation: 'getClassWinRateData',
      });
      return [];
    }
  });
}

/**
 * Get aggregate ITT stats across all games
 * Uses batch fetching and caching for efficiency
 */
export async function getAggregateITTStats(
  category?: string,
  startDate?: string,
  endDate?: string,
): Promise<AggregateITTStats> {
  const filters: AnalyticsFilters = { category, startDate, endDate };
  
  return getCachedAnalytics('ittStats', filters, async () => {
    try {
      logger.info('Computing aggregate ITT stats', { category, startDate, endDate });

      const games = await fetchCompletedGamesWithPlayers(category, startDate, endDate);

      const totals = {
        games: 0,
        damageDealt: 0,
        selfHealing: 0,
        allyHealing: 0,
        meatEaten: 0,
        goldAcquired: 0,
        elk: 0,
        hawk: 0,
        snake: 0,
        wolf: 0,
        bear: 0,
        panther: 0,
      };

      for (const game of games) {
        if (!game.players) continue;

        totals.games++;

        for (const player of game.players) {
          totals.damageDealt += player.damageDealt || 0;
          totals.selfHealing += player.selfHealing || 0;
          totals.allyHealing += player.allyHealing || 0;
          totals.meatEaten += player.meatEaten || 0;
          totals.goldAcquired += player.goldAcquired || player.gold || 0;
          totals.elk += player.killsElk || 0;
          totals.hawk += player.killsHawk || 0;
          totals.snake += player.killsSnake || 0;
          totals.wolf += player.killsWolf || 0;
          totals.bear += player.killsBear || 0;
          totals.panther += player.killsPanther || 0;
        }
      }

      const totalAnimalKills = totals.elk + totals.hawk + totals.snake + totals.wolf + totals.bear + totals.panther;
      const gameCount = totals.games || 1;

      return {
        totalGames: totals.games,
        totalDamageDealt: totals.damageDealt,
        totalHealing: {
          selfHealing: totals.selfHealing,
          allyHealing: totals.allyHealing,
          totalHealing: totals.selfHealing + totals.allyHealing,
        },
        totalMeatEaten: totals.meatEaten,
        totalGoldAcquired: totals.goldAcquired,
        totalAnimalKills: {
          elk: totals.elk,
          hawk: totals.hawk,
          snake: totals.snake,
          wolf: totals.wolf,
          bear: totals.bear,
          panther: totals.panther,
          total: totalAnimalKills,
        },
        averagesPerGame: {
          damageDealt: totals.damageDealt / gameCount,
          selfHealing: totals.selfHealing / gameCount,
          allyHealing: totals.allyHealing / gameCount,
          meatEaten: totals.meatEaten / gameCount,
          goldAcquired: totals.goldAcquired / gameCount,
          animalKills: totalAnimalKills / gameCount,
        },
      };
    } catch (error) {
      const err = error as Error;
      logError(err, 'Failed to get aggregate ITT stats', {
        component: 'analyticsService',
        operation: 'getAggregateITTStats',
      });
      return {
        totalGames: 0,
        totalDamageDealt: 0,
        totalHealing: { selfHealing: 0, allyHealing: 0, totalHealing: 0 },
        totalMeatEaten: 0,
        totalGoldAcquired: 0,
        totalAnimalKills: { elk: 0, hawk: 0, snake: 0, wolf: 0, bear: 0, panther: 0, total: 0 },
        averagesPerGame: { damageDealt: 0, selfHealing: 0, allyHealing: 0, meatEaten: 0, goldAcquired: 0, animalKills: 0 },
      };
    }
  });
}

/**
 * Get animal kills distribution (for pie chart)
 */
export async function getAnimalKillsDistribution(
  category?: string,
  startDate?: string,
  endDate?: string,
): Promise<AnimalKillsDistribution[]> {
  try {
    logger.info('Getting animal kills distribution', { category, startDate, endDate });

    const stats = await getAggregateITTStats(category, startDate, endDate);
    const total = stats.totalAnimalKills.total || 1; // Avoid division by zero

    const animalTypes: Array<'elk' | 'hawk' | 'snake' | 'wolf' | 'bear' | 'panther'> = 
      ['elk', 'hawk', 'snake', 'wolf', 'bear', 'panther'];

    return animalTypes
      .map((animalType) => ({
        animalType,
        count: stats.totalAnimalKills[animalType],
        percentage: (stats.totalAnimalKills[animalType] / total) * 100,
      }))
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to get animal kills distribution', {
      component: 'analyticsService',
      operation: 'getAnimalKillsDistribution',
    });
    return [];
  }
}

/**
 * Get top hunters leaderboard
 * Uses batch fetching and caching for efficiency
 */
export async function getTopHunters(
  category?: string,
  startDate?: string,
  endDate?: string,
  limit = 10,
): Promise<TopHunterEntry[]> {
  const filters: AnalyticsFilters = { category, startDate, endDate };
  
  return getCachedAnalytics('topHunters', filters, async () => {
    try {
      logger.info('Computing top hunters', { category, startDate, endDate, limit });

      const games = await fetchCompletedGamesWithPlayers(category, startDate, endDate);

      const playerStats = new Map<string, {
        totalKills: number;
        gamesPlayed: number;
        animalKills: AnimalKillsData;
      }>();

      for (const game of games) {
        if (!game.players) continue;

        for (const player of game.players) {
          const name = player.name.toLowerCase();
          const existing = playerStats.get(name) || {
            totalKills: 0,
            gamesPlayed: 0,
            animalKills: { elk: 0, hawk: 0, snake: 0, wolf: 0, bear: 0, panther: 0, total: 0 },
          };

          existing.gamesPlayed++;
          existing.animalKills.elk += player.killsElk || 0;
          existing.animalKills.hawk += player.killsHawk || 0;
          existing.animalKills.snake += player.killsSnake || 0;
          existing.animalKills.wolf += player.killsWolf || 0;
          existing.animalKills.bear += player.killsBear || 0;
          existing.animalKills.panther += player.killsPanther || 0;
          existing.animalKills.total = 
            existing.animalKills.elk + existing.animalKills.hawk + 
            existing.animalKills.snake + existing.animalKills.wolf + 
            existing.animalKills.bear + existing.animalKills.panther;
          existing.totalKills = existing.animalKills.total;

          playerStats.set(name, existing);
        }
      }

      return Array.from(playerStats.entries())
        .map(([name, stats]) => {
          const animalCounts = [
            { animal: 'Elk', count: stats.animalKills.elk },
            { animal: 'Hawk', count: stats.animalKills.hawk },
            { animal: 'Snake', count: stats.animalKills.snake },
            { animal: 'Wolf', count: stats.animalKills.wolf },
            { animal: 'Bear', count: stats.animalKills.bear },
            { animal: 'Panther', count: stats.animalKills.panther },
          ];
          const favorite = animalCounts.sort((a, b) => b.count - a.count)[0];

          return {
            playerName: name,
            totalKills: stats.totalKills,
            favoriteAnimal: favorite.count > 0 ? favorite.animal : 'None',
            gamesPlayed: stats.gamesPlayed,
          };
        })
        .filter((p) => p.totalKills > 0)
        .sort((a, b) => b.totalKills - a.totalKills)
        .slice(0, limit);
    } catch (error) {
      const err = error as Error;
      logError(err, 'Failed to get top hunters', {
        component: 'analyticsService',
        operation: 'getTopHunters',
      });
      return [];
    }
  });
}

/**
 * Get top healers leaderboard
 * Uses batch fetching and caching for efficiency
 */
export async function getTopHealers(
  category?: string,
  startDate?: string,
  endDate?: string,
  limit = 10,
): Promise<TopHealerEntry[]> {
  const filters: AnalyticsFilters = { category, startDate, endDate };
  
  return getCachedAnalytics('topHealers', filters, async () => {
    try {
      logger.info('Computing top healers', { category, startDate, endDate, limit });

      const games = await fetchCompletedGamesWithPlayers(category, startDate, endDate);

      const playerStats = new Map<string, {
        totalHealing: number;
        selfHealing: number;
        allyHealing: number;
        gamesPlayed: number;
      }>();

      for (const game of games) {
        if (!game.players) continue;

        for (const player of game.players) {
          const name = player.name.toLowerCase();
          const existing = playerStats.get(name) || {
            totalHealing: 0,
            selfHealing: 0,
            allyHealing: 0,
            gamesPlayed: 0,
          };

          existing.gamesPlayed++;
          existing.selfHealing += player.selfHealing || 0;
          existing.allyHealing += player.allyHealing || 0;
          existing.totalHealing = existing.selfHealing + existing.allyHealing;

          playerStats.set(name, existing);
        }
      }

      return Array.from(playerStats.entries())
        .map(([name, stats]) => ({
          playerName: name,
          totalHealing: stats.totalHealing,
          selfHealing: stats.selfHealing,
          allyHealing: stats.allyHealing,
          gamesPlayed: stats.gamesPlayed,
        }))
        .filter((p) => p.totalHealing > 0)
        .sort((a, b) => b.totalHealing - a.totalHealing)
        .slice(0, limit);
    } catch (error) {
      const err = error as Error;
      logError(err, 'Failed to get top healers', {
        component: 'analyticsService',
        operation: 'getTopHealers',
      });
      return [];
    }
  });
}

