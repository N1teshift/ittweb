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

    const gameData: CreateGame = {
      gameId: parsed.randomseed || options.scheduledGameId || Date.now(),
      datetime: options.fallbackDatetime || new Date().toISOString(),
      duration: getDurationSeconds(parsed.duration),
      gamename: parsed.gamename || `Replay ${parsed.randomseed || 'unknown'}`,
      map: parsed.map?.path || parsed.map?.file || 'Unknown',
      creatorname: parsed.creator || 'Unknown',
      ownername: parsed.creator || 'Unknown',
      category: options.fallbackCategory || deriveCategory(players),
      scheduledGameId: options.scheduledGameId,
      players: players.map((player) => ({
        name: player.name || `Player ${player.id}`,
        pid: player.id,
        flag: deriveFlag(player.teamid, parsed.winningTeamId),
        ...derivedStats.get(player.id),
      })),
    };

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

function deriveFlag(teamId: number, winningTeamId?: number): GamePlayerFlag {
  if (typeof winningTeamId !== 'number') {
    return 'drawer';
  }
  if (teamId === winningTeamId) {
    return 'winner';
  }
  return 'loser';
}


