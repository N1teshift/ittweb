/**
 * Player Service - Compare Operations
 * 
 * Handles player comparison functionality
 */

import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import type { PlayerStats, PlayerSearchFilters, PlayerComparison } from '../types';
import { getGames, getGameById } from '../../../game-management/games/lib/gameService';
import { getPlayerStats } from './playerService.read';
import { normalizePlayerName } from './playerService.utils';

const logger = createComponentLogger('playerService.compare');

/**
 * Compare multiple players
 */
export async function comparePlayers(
  names: string[],
  filters?: PlayerSearchFilters
): Promise<PlayerComparison> {
  try {
    logger.info('Comparing players', { names, filters });

    const players: PlayerStats[] = [];
    for (const name of names) {
      const stats = await getPlayerStats(name, { ...filters, includeGames: false });
      if (stats) {
        players.push(stats);
      }
    }

    // Calculate head-to-head records
    const headToHead: PlayerComparison['headToHead'] = {};
    const gamesResult = await getGames({
      player: names.join(','),
      startDate: filters?.startDate,
      endDate: filters?.endDate,
      limit: 1000, // Get more games for comparison
    });

    // Initialize head-to-head structure
    for (const name1 of names) {
      headToHead[name1] = {};
      for (const name2 of names) {
        if (name1 !== name2) {
          headToHead[name1][name2] = { wins: 0, losses: 0 };
        }
      }
    }

    // Calculate head-to-head from games
    for (const game of gamesResult.games) {
      const gameWithPlayers = await getGameById(game.id);
      if (!gameWithPlayers?.players) continue;

      const winners = gameWithPlayers.players.filter(p => p.flag === 'winner').map(p => normalizePlayerName(p.name));
      const losers = gameWithPlayers.players.filter(p => p.flag === 'loser').map(p => normalizePlayerName(p.name));

      for (const winner of winners) {
        for (const loser of losers) {
          if (names.includes(winner) && names.includes(loser)) {
            if (!headToHead[winner]) headToHead[winner] = {};
            if (!headToHead[winner][loser]) headToHead[winner][loser] = { wins: 0, losses: 0 };
            headToHead[winner][loser].wins += 1;

            if (!headToHead[loser]) headToHead[loser] = {};
            if (!headToHead[loser][winner]) headToHead[loser][winner] = { wins: 0, losses: 0 };
            headToHead[loser][winner].losses += 1;
          }
        }
      }
    }

    // Get ELO history for comparison chart
    const eloComparison: PlayerComparison['eloComparison'] = [];
    // TODO: Implement ELO history aggregation

    return {
      players,
      headToHead,
      eloComparison,
    };
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to compare players', {
      component: 'playerService.compare',
      operation: 'comparePlayers',
      names,
    });
    throw err;
  }
}


