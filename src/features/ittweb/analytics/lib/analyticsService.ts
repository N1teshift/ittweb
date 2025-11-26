import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import { getGames } from '../../games/lib/gameService';
import { getPlayerStats } from '../../players/lib/playerService';
import type { ActivityDataPoint, EloHistoryDataPoint, WinRateData } from '../types';
import { format, eachDayOfInterval, parseISO } from 'date-fns';

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

    // TODO: Implement class statistics aggregation
    // This would require aggregating game data by class
    logger.warn('getClassStats not fully implemented', { category });
    return [];
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to get class stats', {
      component: 'analyticsService',
      operation: 'getClassStats',
    });
    return [];
  }
}

async function getPlayerStats(name: string) {
  const { getPlayerStats: getStats } = await import('../../players/lib/playerService');
  return getStats(name);
}
