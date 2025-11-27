import { Timestamp } from 'firebase/firestore';

/**
 * Game result flag for players
 */
export type GamePlayerFlag = 'winner' | 'loser' | 'drawer';

/**
 * Game category/mode
 */
export type GameCategory = '1v1' | '2v2' | '3v3' | '4v4' | '5v5' | '6v6' | 'ffa' | string;

/**
 * Game player data
 */
export interface GamePlayer {
  id: string;
  gameId: string;
  name: string;
  pid: number;
  flag: GamePlayerFlag;
  category?: GameCategory;
  elochange?: number;
  eloBefore?: number;
  eloAfter?: number;
  class?: string;
  randomClass?: boolean;
  kills?: number;
  deaths?: number;
  assists?: number;
  gold?: number;
  damageDealt?: number;
  damageTaken?: number;
  createdAt: Timestamp | string;
}

/**
 * Game data
 */
export interface Game {
  id: string;
  gameId: number;
  datetime: Timestamp | string;
  duration: number; // seconds
  gamename: string;
  map: string;
  creatorname: string;
  ownername: string;
  category?: GameCategory;
  replayUrl?: string;
  replayFileName?: string;
  submittedBy?: string;
  submittedAt?: Timestamp | string;
  scheduledGameId?: number; // Link to ScheduledGame if created from scheduled game
  verified: boolean;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

/**
 * Game with players
 */
export interface GameWithPlayers extends Game {
  players: GamePlayer[];
}

/**
 * Create game data (for API)
 */
export interface CreateGame {
  gameId: number;
  datetime: string; // ISO string
  duration: number;
  gamename: string;
  map: string;
  creatorname: string;
  ownername: string;
  category?: GameCategory;
  replayUrl?: string;
  replayFileName?: string;
  scheduledGameId?: number; // Link to ScheduledGame if created from scheduled game
  players: Array<{
    name: string;
    pid: number;
    flag: GamePlayerFlag;
    class?: string;
    randomClass?: boolean;
    kills?: number;
    deaths?: number;
    assists?: number;
    gold?: number;
    damageDealt?: number;
    damageTaken?: number;
  }>;
}

/**
 * Update game data
 */
export interface UpdateGame extends Partial<CreateGame> {
  verified?: boolean;
}

/**
 * Game filters
 */
export interface GameFilters {
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  category?: GameCategory;
  player?: string; // Comma-separated player names
  ally?: string; // Comma-separated ally names
  enemy?: string; // Comma-separated enemy names
  teamFormat?: string; // e.g., "1v1", "2v2"
  page?: number;
  limit?: number;
  cursor?: string;
}

/**
 * Game list response
 */
export interface GameListResponse {
  games: Game[];
  nextCursor?: string;
  hasMore: boolean;
}

