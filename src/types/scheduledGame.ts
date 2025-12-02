import { Timestamp } from 'firebase/firestore';
import type { TeamSize, GameType, GameMode, GameParticipant } from '@/features/modules/game-management/games/types';

/**
 * Scheduled game status
 */
export type ScheduledGameStatus = 'scheduled' | 'ongoing' | 'awaiting_replay' | 'archived' | 'cancelled';

/**
 * Scheduled game data
 */
export interface ScheduledGame {
  // Document Identity
  id: string; // Firestore document ID
  
  // Core Fields
  scheduledGameId: number; // Unique numeric ID for scheduled games
  scheduledDateTime: Timestamp | string; // ISO 8601 string in UTC or Timestamp
  scheduledDateTimeString: string; // ISO 8601 string (for querying)
  timezone: string; // IANA timezone identifier (e.g., 'America/New_York')
  teamSize: TeamSize; // '1v1' | '2v2' | '3v3' | '4v4' | '5v5' | '6v6' | 'custom'
  customTeamSize?: string; // Only used when teamSize is 'custom'
  gameType: GameType; // 'elo' | 'normal'
  gameVersion?: string; // Game version (e.g., 'v3.28')
  gameLength?: number; // Game length in seconds
  modes: GameMode[]; // Array of game modes
  participants: GameParticipant[]; // Array of users who joined
  status: ScheduledGameStatus;
  
  // Standardized Creator Fields (REQUIRED)
  creatorName: string;
  createdByDiscordId: string;
  
  // Standardized Timestamp Fields (REQUIRED)
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
  submittedAt?: Timestamp | string;
  
  // Standardized Link Fields (OPTIONAL)
  linkedGameDocumentId?: string; // Link to Game document when replay is uploaded
  linkedArchiveDocumentId?: string; // Link to ArchiveEntry document when archived
  
  // Soft Delete (OPTIONAL)
  isDeleted?: boolean;
  deletedAt?: Timestamp | string | null;
}

/**
 * Create scheduled game data
 */
export interface CreateScheduledGame {
  scheduledGameId?: number; // Auto-generated if not provided
  scheduledDateTime: string; // ISO 8601 string in UTC
  scheduledDateTimeString: string; // ISO 8601 string (for querying)
  timezone: string; // IANA timezone identifier
  teamSize: TeamSize;
  customTeamSize?: string;
  gameType: GameType;
  gameVersion?: string;
  gameLength?: number; // Game length in seconds
  modes: GameMode[];
  creatorName: string;
  createdByDiscordId: string;
  participants?: GameParticipant[];
  submittedAt?: Timestamp | string;
}




