import type Player from 'w3gjs/dist/types/Player';
import { createComponentLogger } from '@/features/infrastructure/logging';
import type { GamePlayerFlag } from '@/features/modules/game-management/games/types';
import type { ParsedReplay, PlayerWithResult } from './types';

const logger = createComponentLogger('games/replay/winner');

/**
 * Derive the winning team ID from multiple sources
 */
export function deriveWinningTeamId(
  parsed: ParsedReplay,
  players: Player[],
  w3mmdLookup: Record<string, Record<string, number>>,
): number | undefined {
  const parsedWinningTeamId = parsed.winningTeamId;

  // First, try to use the parsed winningTeamId if it's valid
  if (typeof parsedWinningTeamId === 'number' && parsedWinningTeamId >= 0) {
    // Verify that at least one player is on this team
    const hasTeam = players.some(p => p.teamid === parsedWinningTeamId);
    if (hasTeam) {
      logger.info('Using parsed winningTeamId', { winningTeamId: parsedWinningTeamId });
      return parsedWinningTeamId;
    }
    logger.warn('Parsed winningTeamId does not match any player team', {
      winningTeamId: parsedWinningTeamId,
      teams: Array.from(new Set(players.map(p => p.teamid))),
    });
  }

  // Check parsed object for other winner indicators
  if (parsed.winnerTeamId !== undefined) {
    const winnerTeamId = parsed.winnerTeamId;
    if (typeof winnerTeamId === 'number' && players.some(p => p.teamid === winnerTeamId)) {
      logger.info('Using parsed winnerTeamId', { winnerTeamId });
      return winnerTeamId;
    }
  }

  // Check players for result/status properties
  const playersWithResult = players.filter((p): p is PlayerWithResult => {
    const playerWithResult = p as PlayerWithResult;
    return playerWithResult.result !== undefined ||
      playerWithResult.status !== undefined ||
      playerWithResult.won !== undefined;
  });

  if (playersWithResult.length > 0) {
    for (const player of playersWithResult) {
      if (player.result === 'win' || player.status === 'winner' || player.won === true) {
        logger.info('Found winner from player result property', {
          player: player.name,
          teamId: player.teamid,
        });
        return player.teamid;
      }
    }
  }

  // Try to find winner from W3MMD data
  const winnersFound: Array<{ player: Player; missionKey: string; key: string }> = [];

  for (const [missionKey, missionData] of Object.entries(w3mmdLookup)) {
    for (const [key, value] of Object.entries(missionData)) {
      const normalizedKey = key.toLowerCase();
      const normalizedValue = String(value).toLowerCase();

      // Check for various winner indicators
      if (
        (normalizedKey.includes('winner') ||
          normalizedKey.includes('win') ||
          normalizedKey === 'result' && (normalizedValue.includes('win') || normalizedValue === '1')) &&
        (value > 0 || normalizedValue.includes('win'))
      ) {
        // Try multiple ways to match this to a player
        const matchedPlayer = players.find(p => {
          const normalizedName = (p.name || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
          const normalizedMissionKey = missionKey.toLowerCase().replace(/[^a-z0-9]/g, '');

          return normalizedName === normalizedMissionKey ||
            normalizedMissionKey.includes(normalizedName) ||
            normalizedName.includes(normalizedMissionKey) ||
            normalizedMissionKey === `player${p.id}` ||
            normalizedMissionKey === `p${p.id}` ||
            normalizedMissionKey === `slot${p.id}` ||
            normalizedMissionKey.includes(String(p.id));
        });

        if (matchedPlayer) {
          winnersFound.push({ player: matchedPlayer, missionKey, key });
        }
      }
    }
  }

  if (winnersFound.length > 0) {
    // Take the first winner found (they should all be on the same team)
    const winner = winnersFound[0].player;
    logger.info('Found winner from W3MMD', {
      player: winner.name,
      teamId: winner.teamid,
    });
    return winner.teamid;
  }

  // Try to find losers - if we find losers, the other team won
  const losersFound: Player[] = [];
  for (const [missionKey, missionData] of Object.entries(w3mmdLookup)) {
    for (const [key, value] of Object.entries(missionData)) {
      const normalizedKey = key.toLowerCase();
      if ((normalizedKey.includes('loser') || normalizedKey.includes('loss')) && value > 0) {
        const matchedPlayer = players.find(p => {
          const normalizedName = (p.name || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
          const normalizedMissionKey = missionKey.toLowerCase().replace(/[^a-z0-9]/g, '');
          return normalizedName === normalizedMissionKey ||
            normalizedMissionKey.includes(normalizedName) ||
            normalizedMissionKey === `player${p.id}` ||
            normalizedMissionKey === `p${p.id}`;
        });
        if (matchedPlayer && !losersFound.includes(matchedPlayer)) {
          losersFound.push(matchedPlayer);
        }
      }
    }
  }

  if (losersFound.length > 0) {
    // If we found losers, find which team they're NOT on - that team won
    const loserTeamIds = new Set(losersFound.map(p => p.teamid));
    const winningTeam = players.find(p => !loserTeamIds.has(p.teamid));
    if (winningTeam) {
      logger.info('Found winner by process of elimination (found losers)', {
        losers: losersFound.map(p => ({ name: p.name, teamId: p.teamid })),
        winningTeam: { name: winningTeam.name, teamId: winningTeam.teamid },
      });
      return winningTeam.teamid;
    }
  }

  logger.warn('Could not determine winning team from any source', {
    parsedWinningTeamId,
    parsedWinnerTeamId: parsed.winnerTeamId,
  });

  return undefined;
}

/**
 * Derive player flag (winner/loser/drawer)
 */
export function deriveFlag(
  teamId: number,
  winningTeamId: number | undefined,
  player: Player,
  w3mmdLookup: Record<string, Record<string, number>>,
): GamePlayerFlag {
  // If we have a valid winning team ID, use it
  if (typeof winningTeamId === 'number' && winningTeamId >= 0) {
    if (teamId === winningTeamId) {
      return 'winner';
    }
    return 'loser';
  }

  // Check player object itself for result/status
  const playerWithResult = player as PlayerWithResult;
  if (playerWithResult.result === 'win' || playerWithResult.status === 'winner' || playerWithResult.won === true) {
    return 'winner';
  }
  if (playerWithResult.result === 'loss' || playerWithResult.status === 'loser' || playerWithResult.won === false) {
    return 'loser';
  }

  // Check W3MMD data for individual player win/loss flags
  const normalizedName = (player.name || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const missionKeys = [
    normalizedName,
    `player${player.id}`,
    `p${player.id}`,
    `slot${player.id}`,
    String(player.id),
  ];

  // Check all mission keys that might match this player
  for (const [missionKey, missionData] of Object.entries(w3mmdLookup)) {
    const normalizedMissionKey = missionKey.toLowerCase().replace(/[^a-z0-9]/g, '');
    const matchesPlayer = missionKeys.some(mk =>
      normalizedMissionKey === mk.toLowerCase().replace(/[^a-z0-9]/g, '') ||
      normalizedMissionKey.includes(mk.toLowerCase().replace(/[^a-z0-9]/g, '')) ||
      mk.toLowerCase().replace(/[^a-z0-9]/g, '').includes(normalizedMissionKey)
    );

    if (!matchesPlayer) continue;

    for (const [key, value] of Object.entries(missionData)) {
      const normalizedKey = key.toLowerCase();
      const normalizedValue = String(value).toLowerCase();

      if (normalizedKey.includes('winner') ||
        normalizedKey.includes('win') ||
        (normalizedKey === 'result' && (normalizedValue.includes('win') || normalizedValue === '1'))) {
        if (value > 0 || normalizedValue.includes('win')) {
          logger.debug('Found winner flag in W3MMD for player', {
            player: player.name,
            missionKey,
            key,
          });
          return 'winner';
        }
      }
      if (normalizedKey.includes('loser') ||
        normalizedKey.includes('loss') ||
        (normalizedKey === 'result' && normalizedValue.includes('loss'))) {
        if (value > 0 || normalizedValue.includes('loss')) {
          logger.debug('Found loser flag in W3MMD for player', {
            player: player.name,
            missionKey,
            key,
          });
          return 'loser';
        }
      }
    }
  }

  // If we still can't determine, mark as drawer
  logger.warn('Could not determine player flag, defaulting to drawer', {
    player: player.name,
    playerId: player.id,
    teamId,
    winningTeamId,
  });
  return 'drawer';
}

