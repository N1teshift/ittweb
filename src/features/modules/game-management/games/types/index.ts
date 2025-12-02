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
 * Game type - scheduled or completed
 */
export type GameState = 'scheduled' | 'completed';

/**
 * Team size for scheduled games
 */
export type TeamSize = '1v1' | '2v2' | '3v3' | '4v4' | '5v5' | '6v6' | 'custom';

/**
 * Game type (ELO or normal)
 */
export type GameType = 'elo' | 'normal';

/**
 * Game mode
 */
export type GameMode = string;

/**
 * Participant result
 */
export type ParticipantResult = 'winner' | 'loser' | 'draw';

/**
 * Game participant (for scheduled games)
 */
export interface GameParticipant {
  discordId: string;
  name: string;
  joinedAt: string; // ISO 8601 string
  result?: ParticipantResult;
}

/**
 * Archive content embedded in completed games
 */
export interface GameArchiveContent {
  title: string;
  content: string;
  images?: string[];
  videoUrl?: string;
  twitchClipUrl?: string;
  replayUrl?: string;
  sectionOrder?: Array<'images' | 'video' | 'twitch' | 'replay' | 'game' | 'text'>;
}

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
  // Combat stats
  kills?: number;
  deaths?: number;
  assists?: number;
  gold?: number;
  damageDealt?: number;
  damageTaken?: number;
  // ITT-specific stats (schema v2+)
  selfHealing?: number;
  allyHealing?: number;
  meatEaten?: number;
  goldAcquired?: number;
  // Animal kill counts
  killsElk?: number;
  killsHawk?: number;
  killsSnake?: number;
  killsWolf?: number;
  killsBear?: number;
  killsPanther?: number;
  createdAt: Timestamp | string;
}

/**
 * Game data - unified scheduled and completed games
 */
export interface Game {
  id: string; // Firestore document ID
  gameId: number; // Single numeric identifier (same for scheduled and completed)
  gameState: GameState; // 'scheduled' | 'completed'
  
  // Common fields
  creatorName: string;
  createdByDiscordId?: string | null;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
  submittedAt?: Timestamp | string;
  
  // Scheduled game fields (only when gameState === 'scheduled')
  scheduledDateTime?: Timestamp | string; // ISO 8601 string in UTC or Timestamp
  scheduledDateTimeString?: string; // ISO 8601 string (for querying)
  timezone?: string; // IANA timezone identifier (e.g., 'America/New_York')
  teamSize?: TeamSize;
  customTeamSize?: string; // Only used when teamSize is 'custom'
  gameType?: GameType; // 'elo' | 'normal'
  gameVersion?: string; // Game version (e.g., 'v3.28')
  gameLength?: number; // Game length in seconds
  modes?: GameMode[];
  participants?: GameParticipant[]; // Discord/website users who joined
  status?: 'scheduled' | 'ongoing' | 'awaiting_replay' | 'archived' | 'cancelled'; // Status for scheduled games
  scheduledGameId?: number; // Unique numeric ID for scheduled games (when gameState === 'scheduled')
  
  // Completed game fields (only when gameState === 'completed')
  datetime?: Timestamp | string; // When the game was played
  duration?: number; // seconds
  gamename?: string;
  map?: string;
  ownername?: string; // Legacy field from replay file: typically same as creatorName
  category?: GameCategory;
  replayUrl?: string;
  replayFileName?: string;
  playerNames?: string[]; // Array of player names for quick access
  playerCount?: number; // Number of players in the game
  verified?: boolean;
  
  // Archive content (only when gameState === 'completed' and game has been archived)
  archiveContent?: GameArchiveContent;
  
  // Soft delete
  isDeleted?: boolean;
  deletedAt?: Timestamp | string | null;
}

/**
 * Game with players
 */
export interface GameWithPlayers extends Game {
  players: GamePlayer[];
}

/**
 * Create scheduled game data
 */
export interface CreateScheduledGame {
  gameId?: number; // Single numeric identifier (auto-generated if not provided)
  scheduledDateTime: string; // ISO 8601 string in UTC
  timezone: string; // IANA timezone identifier
  teamSize: TeamSize;
  customTeamSize?: string;
  gameType: GameType;
  gameVersion?: string;
  gameLength?: number; // Game length in seconds
  modes: GameMode[];
  creatorName?: string;
  createdByDiscordId?: string;
  submittedAt?: Timestamp | string;
  participants?: GameParticipant[];
}

/**
 * Create completed game data
 */
export interface CreateCompletedGame {
  gameId: number; // Single numeric identifier (same as scheduled game if converting)
  datetime: string; // ISO string
  duration: number;
  gamename: string;
  map: string;
  creatorName: string;
  ownername: string; // Legacy field from replay file
  category?: GameCategory;
  replayUrl?: string;
  replayFileName?: string;
  createdByDiscordId?: string | null;
  submittedAt?: Timestamp | string;
  playerNames?: string[];
  playerCount?: number;
  verified?: boolean;
  players: Array<{
    name: string;
    pid: number;
    flag: GamePlayerFlag;
    class?: string;
    randomClass?: boolean;
    // Combat stats
    kills?: number;
    deaths?: number;
    assists?: number;
    gold?: number;
    damageDealt?: number;
    damageTaken?: number;
    // ITT-specific stats (schema v2+)
    selfHealing?: number;
    allyHealing?: number;
    meatEaten?: number;
    goldAcquired?: number;
    // Animal kill counts
    killsElk?: number;
    killsHawk?: number;
    killsSnake?: number;
    killsWolf?: number;
    killsBear?: number;
    killsPanther?: number;
  }>;
  // Optional archive content when archiving
  archiveContent?: GameArchiveContent;
}

/**
 * Update game data (works for both scheduled and completed)
 */
export interface UpdateGame {
  // Common fields
  creatorName?: string;
  createdByDiscordId?: string | null;
  updatedAt?: Timestamp | string;
  
  // Scheduled game updates
  scheduledDateTime?: Timestamp | string;
  scheduledDateTimeString?: string;
  timezone?: string;
  teamSize?: TeamSize;
  customTeamSize?: string;
  gameType?: GameType;
  gameVersion?: string;
  gameLength?: number;
  modes?: GameMode[];
  participants?: GameParticipant[];
  
  // Completed game updates
  datetime?: Timestamp | string;
  duration?: number;
  gamename?: string;
  map?: string;
  ownername?: string;
  category?: GameCategory;
  replayUrl?: string;
  replayFileName?: string;
  playerNames?: string[];
  playerCount?: number;
  verified?: boolean;
  
  // Archive content updates
  archiveContent?: GameArchiveContent;
}

/**
 * Game filters
 */
export interface GameFilters {
  gameState?: GameState; // Filter by 'scheduled' or 'completed'
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  category?: GameCategory;
  player?: string; // Comma-separated player names
  ally?: string; // Comma-separated ally names
  enemy?: string; // Comma-separated enemy names
  teamFormat?: string; // e.g., "1v1", "2v2"
  gameId?: number; // Numeric gameId field
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

/**
 * Legacy type alias for CreateCompletedGame
 * @deprecated Use CreateCompletedGame instead
 */
export type CreateGame = CreateCompletedGame;


