import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import { getGames } from '../../games/lib/gameService';
import type { 
  ActivityDataPoint, 
  EloHistoryDataPoint, 
  WinRateData,
  GameLengthDataPoint,
  PlayerActivityDataPoint,
  ClassSelectionData,
  ClassWinRateData,
} from '../types';
import { format, eachDayOfInterval, parseISO, startOfMonth, eachMonthOfInterval } from 'date-fns';

const logger = createComponentLogger('analyticsService');

/**
 * Get activity data (games per day)
 */
export async function getActivityData(
  playerName?: string,
  startDate?: string,
  endDate?: string,
  category?: string
): Promise<ActivityDataPoint[]> {
  try {
    logger.info('Getting activity data', { playerName, startDate, endDate, category });

    const gamesResult = await getGames({
      player: playerName,
      startDate,
      endDate,
      category,
      limit: 10000, // Get all games for activity
    });

    const start = startDate ? parseISO(startDate) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const end = endDate ? parseISO(endDate) : new Date();
    const days = eachDayOfInterval({ start, end });

    const gamesByDate = new Map<string, number>();
    gamesResult.games.forEach((game) => {
      const date = format(new Date(game.datetime as string), 'yyyy-MM-dd');
      gamesByDate.set(date, (gamesByDate.get(date) || 0) + 1);
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
}

/**
 * Get ELO history for a player
 */
export async function getEloHistory(
  playerName: string,
  category: string,
  startDate?: string,
  endDate?: string
): Promise<EloHistoryDataPoint[]> {
  try {
    logger.info('Getting ELO history', { playerName, category, startDate, endDate });

    const gamesResult = await getGames({
      player: playerName,
      category,
      startDate,
      endDate,
      limit: 10000,
    });

    // Get starting ELO
    const playerStats = await getPlayerStats(playerName);
    const categoryStats = playerStats?.categories[category];
    let currentElo = categoryStats?.score || 1000;

    // Build ELO history by processing games in chronological order
    const sortedGames = [...gamesResult.games].sort(
      (a, b) => new Date(a.datetime as string).getTime() - new Date(b.datetime as string).getTime()
    );

    const eloHistory: EloHistoryDataPoint[] = [];
    const start = startDate ? parseISO(startDate) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    eloHistory.push({
      date: format(start, 'yyyy-MM-dd'),
      elo: currentElo,
    });

    for (const game of sortedGames) {
      const gameWithPlayers = await getGameById(game.id);
      if (!gameWithPlayers?.players) continue;

      const playerInGame = gameWithPlayers.players.find(
        p => p.name.toLowerCase() === playerName.toLowerCase()
      );
      if (playerInGame?.elochange !== undefined) {
        currentElo += playerInGame.elochange;
        eloHistory.push({
          date: format(new Date(game.datetime as string), 'yyyy-MM-dd'),
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
}

async function getGameById(id: string) {
  const { getGameById: getGame } = await import('../../games/lib/gameService');
  return getGame(id);
}

async function getPlayerStats(name: string) {
  const { getPlayerStats: getStats } = await import('../../players/lib/playerService');
  return getStats(name);
}

/**
 * Get win rate data
 */
export async function getWinRateData(
  playerName?: string,
  category?: string,
  startDate?: string,
  endDate?: string
): Promise<WinRateData> {
  try {
    logger.info('Getting win rate data', { playerName, category, startDate, endDate });

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

    // Aggregate across all players
    const gamesResult = await getGames({
      category,
      startDate,
      endDate,
      limit: 10000,
    });

    let wins = 0;
    let losses = 0;
    let draws = 0;

    for (const game of gamesResult.games) {
      const gameWithPlayers = await getGameById(game.id);
      if (!gameWithPlayers?.players) continue;

      gameWithPlayers.players.forEach((player) => {
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
}

/**
 * Get class statistics
 */
export async function getClassStats(category?: string): Promise<import('../types').ClassStats[]> {
  try {
    logger.info('Getting class stats', { category });

    const { getGames } = await import('../../games/lib/gameService');
    
    // Get all games with players
    const gamesResult = await getGames({
      category,
      limit: 10000, // Get a large number of games for aggregation
    });

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

    // Process each game
    for (const game of gamesResult.games) {
      const gameWithPlayers = await getGameById(game.id);
      if (!gameWithPlayers?.players) continue;

      for (const player of gameWithPlayers.players) {
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

        // Accumulate ELO (we'll use average later)
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
        .filter(p => p.wins + p.losses > 0) // Only players with games
        .sort((a, b) => {
          // Sort by win rate, then by total games, then by ELO
          if (b.winRate !== a.winRate) return b.winRate - a.winRate;
          const aGames = a.wins + a.losses;
          const bGames = b.wins + b.losses;
          if (bGames !== aGames) return bGames - aGames;
          return b.elo - a.elo;
        })
        .slice(0, 10); // Top 10 players

      classStatsArray.push({
        id: className,
        category,
        totalGames,
        totalWins,
        totalLosses,
        winRate,
        topPlayers,
        updatedAt: new Date().toISOString(),
      });
    }

    // Sort by total games (most popular first)
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
}

/**
 * Get game length data (average duration per day)
 */
export async function getGameLengthData(
  category?: string,
  startDate?: string,
  endDate?: string,
  teamFormat?: string
): Promise<GameLengthDataPoint[]> {
  try {
    logger.info('Getting game length data', { category, startDate, endDate, teamFormat });

    const gamesResult = await getGames({
      category,
      startDate,
      endDate,
      limit: 10000,
    });

    const start = startDate ? parseISO(startDate) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const end = endDate ? parseISO(endDate) : new Date();
    const days = eachDayOfInterval({ start, end });

    // Group games by date and calculate average duration
    const gamesByDate = new Map<string, { total: number; count: number }>();
    
    for (const game of gamesResult.games) {
      // Filter by team format if specified
      if (teamFormat) {
        const gameWithPlayers = await getGameById(game.id);
        if (gameWithPlayers?.players) {
          const winners = gameWithPlayers.players.filter(p => p.flag === 'winner').length;
          const losers = gameWithPlayers.players.filter(p => p.flag === 'loser').length;
          const formatStr = `${winners}v${losers}`;
          if (formatStr !== teamFormat) continue;
        }
      }

      const date = format(new Date(game.datetime as string), 'yyyy-MM-dd');
      const durationMinutes = (game.duration || 0) / 60; // Convert seconds to minutes
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
}

/**
 * Get player activity data (active players per month)
 */
export async function getPlayerActivityData(
  category?: string,
  startDate?: string,
  endDate?: string,
  teamFormat?: string
): Promise<PlayerActivityDataPoint[]> {
  try {
    logger.info('Getting player activity data', { category, startDate, endDate, teamFormat });

    const gamesResult = await getGames({
      category,
      startDate,
      endDate,
      limit: 10000,
    });

    const start = startDate ? parseISO(startDate) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const end = endDate ? parseISO(endDate) : new Date();
    const months = eachMonthOfInterval({ start, end });

    // Group unique players by month
    const playersByMonth = new Map<string, Set<string>>();

    for (const game of gamesResult.games) {
      // Filter by team format if specified
      if (teamFormat) {
        const gameWithPlayers = await getGameById(game.id);
        if (gameWithPlayers?.players) {
          const winners = gameWithPlayers.players.filter(p => p.flag === 'winner').length;
          const losers = gameWithPlayers.players.filter(p => p.flag === 'loser').length;
          const formatStr = `${winners}v${losers}`;
          if (formatStr !== teamFormat) continue;
        }
      }

      const gameWithPlayers = await getGameById(game.id);
      if (!gameWithPlayers?.players) continue;

      const month = format(startOfMonth(new Date(game.datetime as string)), 'yyyy-MM-dd');
      if (!playersByMonth.has(month)) {
        playersByMonth.set(month, new Set());
      }

      gameWithPlayers.players.forEach((player) => {
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
}

/**
 * Get class selection data (for pie chart)
 */
export async function getClassSelectionData(
  category?: string,
  startDate?: string,
  endDate?: string,
  teamFormat?: string
): Promise<ClassSelectionData[]> {
  try {
    logger.info('Getting class selection data', { category, startDate, endDate, teamFormat });

    const gamesResult = await getGames({
      category,
      startDate,
      endDate,
      limit: 10000,
    });

    const classCounts = new Map<string, number>();

    for (const game of gamesResult.games) {
      // Filter by team format if specified
      if (teamFormat) {
        const gameWithPlayers = await getGameById(game.id);
        if (gameWithPlayers?.players) {
          const winners = gameWithPlayers.players.filter(p => p.flag === 'winner').length;
          const losers = gameWithPlayers.players.filter(p => p.flag === 'loser').length;
          const formatStr = `${winners}v${losers}`;
          if (formatStr !== teamFormat) continue;
        }
      }

      const gameWithPlayers = await getGameById(game.id);
      if (!gameWithPlayers?.players) continue;

      gameWithPlayers.players.forEach((player) => {
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
}

/**
 * Get class win rate data (for bar chart)
 */
export async function getClassWinRateData(
  category?: string,
  startDate?: string,
  endDate?: string,
  teamFormat?: string
): Promise<ClassWinRateData[]> {
  try {
    logger.info('Getting class win rate data', { category, startDate, endDate, teamFormat });

    const gamesResult = await getGames({
      category,
      startDate,
      endDate,
      limit: 10000,
    });

    const classStats = new Map<string, { wins: number; losses: number }>();

    for (const game of gamesResult.games) {
      // Filter by team format if specified
      if (teamFormat) {
        const gameWithPlayers = await getGameById(game.id);
        if (gameWithPlayers?.players) {
          const winners = gameWithPlayers.players.filter(p => p.flag === 'winner').length;
          const losers = gameWithPlayers.players.filter(p => p.flag === 'loser').length;
          const formatStr = `${winners}v${losers}`;
          if (formatStr !== teamFormat) continue;
        }
      }

      const gameWithPlayers = await getGameById(game.id);
      if (!gameWithPlayers?.players) continue;

      gameWithPlayers.players.forEach((player) => {
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
}
