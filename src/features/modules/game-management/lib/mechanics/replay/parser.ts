import W3GReplay from 'w3gjs';
import { createComponentLogger } from '@/features/infrastructure/logging';
import type { CreateGame } from '@/features/modules/game-management/games/types';
import { buildW3MMDLookup, mapMissionStatsToPlayers } from '../w3mmd';
import { extractITTMetadata } from './metadata';
import { deriveWinningTeamId, deriveFlag } from './winner';
import { getDurationSeconds, deriveCategory } from './utils';
import type { ParsedReplay, ReplayParserOptions, ReplayParserResult, ITTPlayerStats } from './types';

const logger = createComponentLogger('games/replayParser');

export async function parseReplayFile(
  buffer: Buffer,
  options: ReplayParserOptions = {},
): Promise<ReplayParserResult> {
  try {
    logger.info('Starting replay parsing', {
      bufferSize: buffer.length,
      scheduledGameId: options.scheduledGameId,
    });

    const replay = new W3GReplay();
    const parsed = await replay.parse(buffer) as unknown as ParsedReplay;
    const players = parsed.players || [];

    logger.info('Replay parsed - basic info', {
      playerCount: players.length,
      hasWinningTeamId: parsed.winningTeamId !== undefined,
      winningTeamId: parsed.winningTeamId,
    });

    if (players.length < 2) {
      throw new Error('Replay does not contain at least two players.');
    }

    // Get W3MMD data
    let w3mmdActions: unknown[] = [];

    if (Array.isArray(replay.w3mmd)) {
      w3mmdActions = replay.w3mmd;
    } else if (Array.isArray(parsed.w3mmd)) {
      w3mmdActions = parsed.w3mmd;
    } else {
      logger.warn('W3MMD data not found in replay file');
    }

    logger.info('W3MMD data found', { count: w3mmdActions.length });

    const w3mmdData = buildW3MMDLookup(w3mmdActions as Parameters<typeof buildW3MMDLookup>[0] || []);
    const derivedStats = mapMissionStatsToPlayers(players, w3mmdData.lookup);

    // Extract ITT-specific metadata from W3MMD custom messages
    const ittMetadata = extractITTMetadata(w3mmdActions);
    if (ittMetadata) {
      logger.info('ITT metadata extracted', {
        version: ittMetadata.version,
        schema: ittMetadata.schema,
        playerCount: ittMetadata.players.length,
      });
    }

    // Try to derive winning team from multiple sources
    const winningTeamId = deriveWinningTeamId(parsed, players, w3mmdData.lookup);

    logger.info('Parsing replay - derived winner', {
      gameId: parsed.randomseed,
      playerCount: players.length,
      parsedWinningTeamId: parsed.winningTeamId,
      derivedWinningTeamId: winningTeamId,
    });

    const matchedIttPlayers = new Set<ITTPlayerStats>();

    const gameData: CreateGame = {
      gameId: options.scheduledGameId || parsed.randomseed || Date.now(),
      datetime: options.fallbackDatetime || new Date().toISOString(),
      duration: getDurationSeconds(parsed.duration),
      gamename: parsed.gamename || `Replay ${parsed.randomseed || 'unknown'}`,
      map: parsed.map?.path || parsed.map?.file || 'Unknown',
      creatorName: parsed.creator || 'Unknown',
      ownername: parsed.creator || 'Unknown',
      category: options.fallbackCategory || deriveCategory(players),
      players: players.map((player) => {
        const stats = derivedStats.get(player.id) || {};
        const flag = deriveFlag(player.teamid, winningTeamId, player, w3mmdData.lookup);

        // Find ITT stats for this player by matching slot index or name
        // Find ITT stats for this player
        // Priority 1: Match by Slot Index (most reliable)
        let ittPlayer = ittMetadata?.players.find((p) => p.slotIndex === player.id);

        // Priority 2: Match by Exact Name (if no slot match)
        if (!ittPlayer && ittMetadata?.players) {
          ittPlayer = ittMetadata.players.find(
            (p) => p.name === player.name && !matchedIttPlayers.has(p)
          );
        }

        // Priority 3: Match by Normalized Name (fallback)
        if (!ittPlayer && ittMetadata?.players) {
          const normalizedPlayerName = (player.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          ittPlayer = ittMetadata.players.find((p) => {
            if (matchedIttPlayers.has(p)) return false;
            const normalizedIttName = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            return normalizedIttName === normalizedPlayerName;
          });
        }

        if (ittPlayer) {
          matchedIttPlayers.add(ittPlayer);
        } else if (ittMetadata) {
          logger.warn('Could not match player to ITT metadata', {
            name: player.name,
            id: player.id,
          });
        }

        // Merge ITT stats if found
        const ittStats = ittPlayer ? {
          class: ittPlayer.trollClass || stats.class,
          damageDealt: ittPlayer.damageTroll ?? stats.damageDealt,
          selfHealing: ittPlayer.selfHealing ?? 0,
          allyHealing: ittPlayer.allyHealing ?? 0,
          goldAcquired: ittPlayer.goldAcquired ?? 0,
          meatEaten: ittPlayer.meatEaten ?? 0,
          killsElk: ittPlayer.killsElk ?? 0,
          killsHawk: ittPlayer.killsHawk ?? 0,
          killsSnake: ittPlayer.killsSnake ?? 0,
          killsWolf: ittPlayer.killsWolf ?? 0,
          killsBear: ittPlayer.killsBear ?? 0,
          killsPanther: ittPlayer.killsPanther ?? 0,
        } : {};

        logger.debug('Player parsed', {
          name: player.name,
          pid: player.id,
          teamId: player.teamid,
          flag,
          hasITTData: !!ittPlayer,
        });

        return {
          name: player.name || `Player ${player.id}`,
          pid: player.id,
          flag,
          ...stats,
          ...ittStats,
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
      ittMetadata,
    };
  } catch (error) {
    const err = error as Error;
    logger.error('Replay parsing failed', err);
    throw err;
  }
}

