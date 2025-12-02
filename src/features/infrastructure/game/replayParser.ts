import W3GReplay from 'w3gjs';
import type Player from 'w3gjs/dist/types/Player';
import { createComponentLogger } from '@/features/infrastructure/logging';
import type { CreateGame, GameCategory, GamePlayerFlag } from '../../modules/game-management/games/types';
import { buildW3MMDLookup, mapMissionStatsToPlayers, type ParsedW3MMDEntry } from './w3mmdUtils';

const logger = createComponentLogger('games/replayParser');

interface ParsedReplay {
  randomseed?: number;
  winningTeamId?: number;
  winnerTeamId?: number;
  duration?: number;
  gamename?: string;
  map?: {
    path?: string;
    file?: string;
  };
  creator?: string;
  players?: Player[];
  w3mmd?: unknown[];
}

interface PlayerWithResult extends Player {
  result?: string;
  status?: string;
  won?: boolean;
}

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
    const investigationStart = {
      bufferSize: buffer.length,
      scheduledGameId: options.scheduledGameId,
    };
    logger.info('🔍 STARTING REPLAY PARSING - W3MMD INVESTIGATION', investigationStart);

    const replay = new W3GReplay();
    const parsed = await replay.parse(buffer) as unknown as ParsedReplay;
    const players = parsed.players || [];
    
    logger.info('📊 Replay parsed - basic info', {
      playerCount: players.length,
      hasWinningTeamId: parsed.winningTeamId !== undefined,
      winningTeamId: parsed.winningTeamId,
    });

    if (players.length < 2) {
      throw new Error('Replay does not contain at least two players.');
    }

    // INVESTIGATION: Check ALL possible ways to access W3MMD data
    const replayObj = replay as unknown as Record<string, unknown>;
    const parsedObj = parsed as Record<string, unknown>;
    
    // Critical investigation - log to both logger and console
    const investigationData = {
      replayObjectKeys: Object.keys(replayObj).slice(0, 30),
      replayHasW3mmd: 'w3mmd' in replayObj,
      replayW3mmdType: typeof replayObj.w3mmd,
      replayW3mmdValue: Array.isArray(replayObj.w3mmd) 
        ? `[Array(${replayObj.w3mmd.length})]` 
        : replayObj.w3mmd,
      replayW3mmdLength: Array.isArray(replay.w3mmd) ? replay.w3mmd.length : 'not array',
      parsedObjectKeys: Object.keys(parsedObj).slice(0, 30),
      parsedHasW3mmd: 'w3mmd' in parsedObj,
      parsedW3mmdType: typeof parsedObj.w3mmd,
      parsedW3mmdValue: Array.isArray(parsedObj.w3mmd) 
        ? `[Array(${parsedObj.w3mmd.length})]` 
        : parsedObj.w3mmd,
      // Check for alternative property names
      replayHasActions: 'actions' in replayObj,
      replayHasW3mmdActions: 'w3mmdActions' in replayObj,
      replayHasGetW3mmd: typeof replayObj.getW3mmd === 'function',
      replayW3mmdDirect: replay.w3mmd,
    };
    logger.info('W3MMD investigation - checking all possible sources', investigationData);

    // Try multiple ways to get W3MMD data
    let w3mmdActions: unknown[] = [];
    
    // Method 1: Direct property access (current method)
    if (Array.isArray(replay.w3mmd)) {
      w3mmdActions = replay.w3mmd;
      logger.debug('W3MMD found via replay.w3mmd', { count: w3mmdActions.length });
    }
    // Method 2: Check parsed object
    else if (Array.isArray(parsed.w3mmd)) {
      w3mmdActions = parsed.w3mmd;
      logger.debug('W3MMD found via parsed.w3mmd', { count: w3mmdActions.length });
    }
    // Method 3: Check if it's a method
    else if (typeof (replayObj as { getW3mmd?: () => unknown[] }).getW3mmd === 'function') {
      w3mmdActions = (replayObj as { getW3mmd: () => unknown[] }).getW3mmd();
      logger.debug('W3MMD found via replay.getW3mmd()', { count: w3mmdActions.length });
    }
    // Method 4: Check alternative property names
    else if (Array.isArray(replayObj.actions)) {
      w3mmdActions = replayObj.actions as unknown[];
      logger.debug('W3MMD found via replay.actions', { count: w3mmdActions.length });
    }
    else if (Array.isArray(replayObj.w3mmdActions)) {
      w3mmdActions = replayObj.w3mmdActions as unknown[];
      logger.debug('W3MMD found via replay.w3mmdActions', { count: w3mmdActions.length });
    }
    else {
      logger.warn('⚠️⚠️⚠️ W3MMD DATA NOT FOUND - INVESTIGATION RESULT ⚠️⚠️⚠️', {
        conclusion: 'W3MMD data appears to be completely missing from this replay file',
        replayKeys: Object.keys(replayObj).slice(0, 20),
        parsedKeys: Object.keys(parsedObj).slice(0, 20),
        replayW3mmd: replay.w3mmd,
        replayW3mmdType: typeof replay.w3mmd,
        replayW3mmdIsArray: Array.isArray(replay.w3mmd),
        replayW3mmdLength: Array.isArray(replay.w3mmd) ? (replay.w3mmd as unknown[]).length : 'N/A',
        parsedW3mmd: parsed.w3mmd,
        parsedW3mmdType: typeof parsed.w3mmd,
        verdict: 'The replay file does NOT contain W3MMD data. This means either: (1) The game is not saving W3MMD data, or (2) W3MMD is disabled in the game settings.',
      });
    }
    
    // SUMMARY LOG
    const summary = {
      w3mmdActionsFound: w3mmdActions.length,
      w3mmdActionsSource: Array.isArray(replay.w3mmd) 
        ? 'replay.w3mmd' 
        : Array.isArray(parsed.w3mmd)
        ? 'parsed.w3mmd'
        : 'not found',
      verdict: w3mmdActions.length === 0 
        ? '❌ NO W3MMD DATA - Game is likely not saving W3MMD data to replay files'
        : `✅ W3MMD DATA FOUND - ${w3mmdActions.length} actions`,
    };
    logger.info('📋 W3MMD INVESTIGATION SUMMARY', summary);

    // Log raw W3MMD structure if found
    if (w3mmdActions.length > 0) {
      logger.info('✅ W3MMD data found! Raw W3MMD actions structure', {
        count: w3mmdActions.length,
        firstAction: w3mmdActions[0],
        firstActionKeys: typeof w3mmdActions[0] === 'object' && w3mmdActions[0] !== null
          ? Object.keys(w3mmdActions[0] as Record<string, unknown>)
          : 'not an object',
        firstActionType: typeof w3mmdActions[0],
        sampleActions: w3mmdActions.slice(0, 3).map((action, idx) => ({
          index: idx,
          type: typeof action,
          isObject: typeof action === 'object' && action !== null,
          keys: typeof action === 'object' && action !== null
            ? Object.keys(action as Record<string, unknown>)
            : [],
          value: action,
        })),
      });
    }

    const w3mmdData = buildW3MMDLookup(w3mmdActions as Parameters<typeof buildW3MMDLookup>[0] || []);
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

    // Log ALL parsed object properties (excluding large arrays)
    logger.debug('Parsed replay object properties', {
      allKeys: Object.keys(parsed),
      parsedProperties: Object.entries(parsed)
        .filter(([key]) => !['players', 'w3mmd'].includes(key))
        .reduce((acc, [key, value]) => {
          // Only include simple values, not complex objects
          if (value === null || value === undefined) {
            acc[key] = value;
          } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            acc[key] = value;
          } else if (Array.isArray(value)) {
            acc[key] = `[Array(${value.length})]`;
          } else if (typeof value === 'object') {
            acc[key] = `[Object with keys: ${Object.keys(value).join(', ')}]`;
          }
          return acc;
        }, {} as Record<string, unknown>),
    });

    // Log ALL player properties in detail
    logger.debug('Player properties detail', {
      players: players.map(p => {
        const playerObj = p as unknown as Record<string, unknown>;
        return {
          name: p.name,
          id: p.id,
          teamid: p.teamid,
          allKeys: Object.keys(p),
          allProperties: Object.entries(playerObj)
            .filter(([key]) => !['name', 'id', 'teamid'].includes(key))
            .reduce((acc, [key, value]) => {
              // Include all properties but limit complex objects
              if (value === null || value === undefined) {
                acc[key] = value;
              } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                acc[key] = value;
              } else if (Array.isArray(value)) {
                acc[key] = `[Array(${value.length})]`;
              } else if (typeof value === 'object') {
                acc[key] = `[Object: ${JSON.stringify(value).substring(0, 100)}]`;
              }
              return acc;
            }, {} as Record<string, unknown>),
        };
      }),
    });

    // Log COMPLETE W3MMD data structure - INVESTIGATION MODE
    logger.info('W3MMD data structure - COMPLETE INVESTIGATION', {
      // Raw replay.w3mmd array
      rawW3MMDArray: {
        exists: replay.w3mmd !== undefined,
        isArray: Array.isArray(replay.w3mmd),
        length: Array.isArray(replay.w3mmd) ? replay.w3mmd.length : 'not array',
        type: typeof replay.w3mmd,
        value: replay.w3mmd,
      },
      // Detailed inspection of first few entries if they exist
      rawW3MMDEntries: Array.isArray(replay.w3mmd) && replay.w3mmd.length > 0
        ? replay.w3mmd.slice(0, 10).map((entry, idx) => {
            const entryObj = entry as Record<string, unknown>;
            return {
              index: idx,
              type: typeof entry,
              isObject: typeof entry === 'object' && entry !== null,
              hasId: 'id' in entryObj,
              hasCache: 'cache' in entryObj,
              hasValue: 'value' in entryObj,
              id: entryObj.id,
              value: entryObj.value,
              cache: entryObj.cache,
              cacheType: typeof entryObj.cache,
              cacheKeys: typeof entryObj.cache === 'object' && entryObj.cache !== null
                ? Object.keys(entryObj.cache as Record<string, unknown>)
                : [],
              cacheDetails: typeof entryObj.cache === 'object' && entryObj.cache !== null
                ? Object.entries(entryObj.cache as Record<string, unknown>).reduce((acc, [key, val]) => {
                    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
                      acc[key] = val;
                    } else {
                      acc[key] = `[${typeof val}]`;
                    }
                    return acc;
                  }, {} as Record<string, unknown>)
                : null,
              fullEntry: entryObj,
            };
          })
        : 'No W3MMD entries found',
      // Check if buildW3MMDLookup is filtering out entries
      buildW3MMDLookupInput: {
        inputLength: w3mmdActions.length,
        inputType: typeof w3mmdActions,
        inputSample: w3mmdActions.slice(0, 3),
      },
      // Parsed entries after buildW3MMDLookup
      parsedEntriesCount: w3mmdData.rawEntries.length,
      allParsedEntries: w3mmdData.rawEntries.map(e => ({
        missionKey: e.missionKey,
        key: e.key,
        value: e.value,
        filename: e.filename,
      })),
      // Why entries might be filtered out
      buildW3MMDLookupFiltering: {
        totalInput: w3mmdActions.length,
        totalOutput: w3mmdData.rawEntries.length,
        filteredOut: w3mmdActions.length - w3mmdData.rawEntries.length,
        sampleFiltered: w3mmdActions.slice(0, 5).map((action, idx) => {
          const actionObj = action as { cache?: { missionKey?: string; key?: string }; value?: number };
          return {
            index: idx,
            hasCache: 'cache' in actionObj,
            hasMissionKey: actionObj.cache?.missionKey !== undefined,
            hasKey: actionObj.cache?.key !== undefined,
            missionKey: actionObj.cache?.missionKey,
            key: actionObj.cache?.key,
            value: actionObj.value,
            wouldBeIncluded: actionObj.cache?.missionKey !== undefined && actionObj.cache?.key !== undefined,
          };
        }),
      },
      // Final lookup structure
      lookupStructure: {
        missionKeyCount: Object.keys(w3mmdData.lookup).length,
        allMissionKeys: Object.keys(w3mmdData.lookup),
        missionKeysWithData: Object.entries(w3mmdData.lookup).map(([missionKey, data]) => ({
          missionKey,
          keys: Object.keys(data),
          keyValuePairs: Object.entries(data).map(([key, value]) => ({ key, value })),
        })),
      },
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

  // Log detailed information about why winner detection failed
  logger.warn('Could not determine winning team from any source', {
    parsedWinningTeamId,
    parsedWinnerTeamId: parsed.winnerTeamId,
    checkedSources: {
      parsedWinningTeamId: {
        value: parsedWinningTeamId,
        valid: typeof parsedWinningTeamId === 'number' && parsedWinningTeamId >= 0,
        reason: typeof parsedWinningTeamId === 'number' && parsedWinningTeamId >= 0
          ? 'Invalid or negative value'
          : 'Not a valid number',
      },
      parsedWinnerTeamId: {
        value: parsed.winnerTeamId,
        valid: parsed.winnerTeamId !== undefined && typeof parsed.winnerTeamId === 'number',
        reason: parsed.winnerTeamId === undefined ? 'Not present' : 'Checked',
      },
      playerResultProperties: {
        checked: players.length,
        found: playersWithResult.length,
        reason: playersWithResult.length === 0 ? 'No players have result/status/won properties' : 'Checked but no winners found',
      },
      w3mmdWinnerLookup: {
        checked: Object.keys(w3mmdLookup).length,
        found: winnersFound.length,
        reason: winnersFound.length === 0 ? 'No winner indicators found in W3MMD data' : 'Found but not matched to players',
        allMissionKeys: Object.keys(w3mmdLookup),
        sampleKeys: Object.entries(w3mmdLookup).slice(0, 5).map(([mk, data]) => ({
          missionKey: mk,
          keys: Object.keys(data),
        })),
      },
      w3mmdLoserLookup: {
        checked: Object.keys(w3mmdLookup).length,
        found: losersFound.length,
        reason: losersFound.length === 0 ? 'No loser indicators found in W3MMD data' : 'Found but elimination failed',
      },
    },
    w3mmdKeys: Object.keys(w3mmdLookup).slice(0, 20),
    w3mmdFullStructure: Object.entries(w3mmdLookup).map(([missionKey, data]) => ({
      missionKey,
      allKeys: Object.keys(data),
      allKeyValuePairs: Object.entries(data).map(([key, value]) => ({ key, value })),
    })),
    teamDistribution: players.reduce((acc, p) => {
      acc[p.teamid] = (acc[p.teamid] || []).concat(p.name);
      return acc;
    }, {} as Record<number, string[]>),
    playerDetails: players.map(p => ({
      name: p.name,
      id: p.id,
      teamid: p.teamid,
      allProperties: Object.keys(p),
    })),
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
  const playerWithResult = player as PlayerWithResult;
  if (playerWithResult.result === 'win' || playerWithResult.status === 'winner' || playerWithResult.won === true) {
    return 'winner';
  }
  if (playerWithResult.result === 'loss' || playerWithResult.status === 'loser' || playerWithResult.won === false) {
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
    playerId: player.id,
    teamId,
    winningTeamId,
    checkedSources: {
      winningTeamId: {
        value: winningTeamId,
        valid: typeof winningTeamId === 'number' && winningTeamId >= 0,
        reason: winningTeamId === undefined ? 'Not determined' : 'Checked',
      },
      playerResultProperties: {
        hasResult: (player as PlayerWithResult).result !== undefined,
        hasStatus: (player as PlayerWithResult).status !== undefined,
        hasWon: (player as PlayerWithResult).won !== undefined,
        result: (player as PlayerWithResult).result,
        status: (player as PlayerWithResult).status,
        won: (player as PlayerWithResult).won,
      },
      w3mmdLookup: {
        checkedMissionKeys: Object.keys(w3mmdLookup).length,
        playerMissionKeys: missionKeys,
        matchedMissionKeys: Object.keys(w3mmdLookup).filter(mk => {
          const normalizedMissionKey = mk.toLowerCase().replace(/[^a-z0-9]/g, '');
          return missionKeys.some(mk2 => 
            normalizedMissionKey === mk2.toLowerCase().replace(/[^a-z0-9]/g, '') ||
            normalizedMissionKey.includes(mk2.toLowerCase().replace(/[^a-z0-9]/g, '')) ||
            mk2.toLowerCase().replace(/[^a-z0-9]/g, '').includes(normalizedMissionKey)
          );
        }),
        allAvailableKeys: Object.entries(w3mmdLookup).map(([mk, data]) => ({
          missionKey: mk,
          keys: Object.keys(data),
        })),
      },
    },
    availableMissionKeys: Object.keys(w3mmdLookup).slice(0, 20),
  });
  return 'drawer';
}



