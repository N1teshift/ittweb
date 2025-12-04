import type Player from 'w3gjs/dist/types/Player';
import type { CreateGame, GameCategory } from '@/features/modules/game-management/games/types';

export interface ParsedReplay {
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

export interface PlayerWithResult extends Player {
  result?: string;
  status?: string;
  won?: boolean;
}

/**
 * ITT-specific player stats from metadata payload
 */
export interface ITTPlayerStats {
  slotIndex: number;
  name: string;
  trollClass?: string;
  damageTroll: number;
  selfHealing: number;
  allyHealing: number;
  goldAcquired: number;
  meatEaten: number;
  killsElk: number;
  killsHawk: number;
  killsSnake: number;
  killsWolf: number;
  killsBear: number;
  killsPanther: number;
}

/**
 * Parsed ITT metadata from W3MMD custom messages
 */
export interface ITTMetadata {
  version?: string;
  schema?: number;
  payload?: string;
  players: ITTPlayerStats[];
}

export interface ReplayParserOptions {
  scheduledGameId?: number;
  fallbackDatetime?: string;
  fallbackCategory?: GameCategory;
}

export interface ReplayParserResult {
  gameData: CreateGame;
  w3mmd: {
    raw: Array<{
      missionKey: string;
      key: string;
      value: number;
      filename: string;
    }>;
    lookup: Record<string, Record<string, number>>;
  };
  ittMetadata?: ITTMetadata;
}

