import W3GReplay from 'w3gjs';
import type Player from 'w3gjs/dist/types/Player';
import { createComponentLogger } from '@/features/infrastructure/logging';
import type { CreateGame, GameCategory, GamePlayerFlag } from '../types';
import { buildW3MMDLookup, mapMissionStatsToPlayers, type ParsedW3MMDEntry } from './w3mmdUtils';

const logger = createComponentLogger('games/replayParser');

export interface ReplayParserOptions {
  scheduledGameId?: number;
  fallbackDatetime?: string;
  fallbackCategory?: GameCategory;
}

export interface ReplayParserResult {
  gameData: CreateGame;
  w3mmd: {
    raw: ParsedW3MMDEntry[];
    lookup: Record<string, Record<string, number>>;
  };
}

export async function parseReplayFile(
  buffer: Buffer,
  options: ReplayParserOptions = {},
): Promise<ReplayParserResult> {
  try {
    const replay = new W3GReplay();
    const parsed = await replay.parse(buffer);
    const players = parsed.players || [];

    if (players.length < 2) {
      throw new Error('Replay does not contain at least two players.');
    }

    const w3mmdData = buildW3MMDLookup(replay.w3mmd || []);
    const derivedStats = mapMissionStatsToPlayers(players, w3mmdData.lookup);

    // Log detailed information about the parsed replay for debugging
    logger.info('Parsing replay - raw data', {
      gameId: parsed.randomseed,
      playerCount: players.length,
      winningTeamId: parsed.winningTeamId,
      parsedKeys: Object.keys(parsed).filter(k => !['players', 'w3mmd'].includes(k)),
      w3mmdCount: replay.w3mmd?.length || 0,
      players: players.map(p => ({
        name: p.name,
        id: p.id,
        teamid: p.teamid,
        keys: Object.keys(p),
      })),
      teams: players.reduce((acc, p) => {
        acc[p.teamid] = (acc[p.teamid] || 0) + 1;
        return acc;
      }, {} as Record<number, number>),
      w3mmdSample: w3mmdData.rawEntries.slice(0, 10).map(e => ({
        missionKey: e.missionKey,
        key: e.key,
        value: e.value,
      })),
    });

    // Try to derive winning team from multiple sources
    const winningTeamId = deriveWinningTeamId(parsed, players, w3mmdData.lookup);

    logger.info('Parsing replay - derived winner', {
      gameId: parsed.randomseed,
      playerCount: players.length,
      parsedWinningTeamId: parsed.winningTeamId,
      derivedWinningTeamId: winningTeamId,
      teams: players.reduce((acc, p) => {
        acc[p.teamid] = (acc[p.teamid] || 0) + 1;
        return acc;
      }, {} as Record<number, number>),
    });

    const gameData: CreateGame = {
      gameId: options.scheduledGameId || parsed.randomseed || Date.now(),
      datetime: options.fallbackDatetime || new Date().toISOString(),
      duration: getDurationSeconds(parsed.duration),
      gamename: parsed.gamename || `Replay ${parsed.randomseed || 'unknown'}`,
      map: parsed.map?.path || parsed.map?.file || 'Unknown',
      creatorName: parsed.creator || 'Unknown',
      ownername: parsed.creator || 'Unknown', // Legacy field: same as creatorName from replay
      category: options.fallbackCategory || deriveCategory(players),
      scheduledGameId: options.scheduledGameId,
      players: players.map((player) => {
        const stats = derivedStats.get(player.id) || {};
        const flag = deriveFlag(player.teamid, winningTeamId, player, w3mmdData.lookup);
        
        logger.debug('Player parsed', {
          name: player.name,
          pid: player.id,
          teamId: player.teamid,
          flag,
          stats: Object.keys(stats),
        });

        return {
          name: player.name || `Player ${player.id}`,
          pid: player.id,
          flag,
          ...stats,
        };
      }),
    };

    // Log summary of win/loss distribution
    const flagCounts = gameData.players.reduce((acc, p) => {
      acc[p.flag] = (acc[p.flag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    logger.info('Game flags distribution', flagCounts);

    return {
      gameData,
      w3mmd: {
        raw: w3mmdData.rawEntries,
        lookup: w3mmdData.lookup,
      },
    };
  } catch (error) {
    const err = error as Error;
    logger.error('Replay parsing failed', err);
    throw err;
  }
}

function getDurationSeconds(durationMs?: number): number {
  if (!durationMs || Number.isNaN(durationMs)) {
    return 1;
  }
  return Math.max(1, Math.round(durationMs / 1000));
}

function deriveCategory(players: Player[]): GameCategory | undefined {
  const teamCounts = players.reduce<Record<number, number>>((acc, player) => {
    acc[player.teamid] = (acc[player.teamid] || 0) + 1;
    return acc;
  }, {});

  const counts = Object.values(teamCounts).sort((a, b) => b - a);
  if (counts.length === 2 && counts[0] === counts[1]) {
    return `${counts[0]}v${counts[1]}` as GameCategory;
  }
  if (counts.length === 1) {
    return counts[0] === 1 ? '1v1' : `${counts[0]}p` as GameCategory;
  }
  return 'ffa';
}

/**
 * Derive the winning team ID from multiple sources
 */
function deriveWinningTeamId(
  parsed: any,
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
      playerTeams: players.map(p => ({ name: p.name, teamid: p.teamid })),
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
  const playersWithResult = players.filter(p => {
    const playerAny = p as any;
    return playerAny.result !== undefined || 
           playerAny.status !== undefined || 
           playerAny.won !== undefined;
  });
  
  if (playersWithResult.length > 0) {
    for (const player of playersWithResult) {
      const playerAny = player as any;
      if (playerAny.result === 'win' || playerAny.status === 'winner' || playerAny.won === true) {
        logger.info('Found winner from player result property', {
          player: player.name,
          teamId: player.teamid,
        });
        return player.teamid;
      }
    }
  }

  // Try to find winner from W3MMD data - check ALL mission keys more thoroughly
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
      matches: winnersFound.map(w => ({ missionKey: w.missionKey, key: w.key })),
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
    w3mmdKeys: Object.keys(w3mmdLookup).slice(0, 20),
    teamDistribution: players.reduce((acc, p) => {
      acc[p.teamid] = (acc[p.teamid] || []).concat(p.name);
      return acc;
    }, {} as Record<number, string[]>),
  });

  return undefined;
}

/**
 * Derive player flag (winner/loser/drawer)
 */
function deriveFlag(
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
  const playerAny = player as any;
  if (playerAny.result === 'win' || playerAny.status === 'winner' || playerAny.won === true) {
    return 'winner';
  }
  if (playerAny.result === 'loss' || playerAny.status === 'loser' || playerAny.won === false) {
    return 'loser';
  }

  // Check W3MMD data for individual player win/loss flags - use more comprehensive search
  const normalizedName = (player.name || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const missionKeys = [
    normalizedName,
    `player${player.id}`,
    `p${player.id}`,
    `slot${player.id}`,
    String(player.id),
  ];

  // Also check all mission keys that might match this player
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
            value,
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
            value,
          });
          return 'loser';
        }
      }
    }
  }

  // If we still can't determine and there are only 2 teams, mark as drawer
  // This is better than guessing, but the upload should allow manual correction
  logger.warn('Could not determine player flag, defaulting to drawer', {
    player: player.name,
    teamId,
    winningTeamId,
    availableMissionKeys: Object.keys(w3mmdLookup).slice(0, 10),
  });
  return 'drawer';
}


