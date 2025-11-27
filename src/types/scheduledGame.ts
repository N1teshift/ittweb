/**
 * Types for scheduled games feature
 */

import { Timestamp } from 'firebase/firestore';

export type TeamSize = '1v1' | '2v2' | '3v3' | '4v4' | '5v5' | '6v6' | 'custom';
export type GameType = 'elo' | 'normal';
export type GameMode = string; // Will be defined when user provides the list

export type ParticipantResult = 'winner' | 'loser' | 'draw';

export interface GameParticipant {
  discordId: string;
  name: string;
  joinedAt: string; // ISO 8601 string
  result?: ParticipantResult;
}

export interface ScheduledGame {
  id: string;
  scheduledGameId: number; // Unique numeric ID for scheduled games
  creatorName: string;
  createdByDiscordId: string;
  scheduledDateTime: Timestamp | string; // ISO 8601 string in UTC or Timestamp
  timezone: string; // IANA timezone identifier (e.g., 'America/New_York')
  teamSize: TeamSize;
  customTeamSize?: string; // Only used when teamSize is 'custom'
  gameType: GameType;
  gameVersion?: string; // Game version (e.g., 'v3.28')
  gameLength?: number; // Game length in seconds
  modes: GameMode[];
  participants: GameParticipant[]; // Array of users who joined
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
  submittedAt?: Timestamp | string;
  status: 'scheduled' | 'ongoing' | 'awaiting_replay' | 'archived' | 'cancelled';
  linkedGameDocumentId?: string; // Link to Game document when replay is uploaded
  linkedArchiveDocumentId?: string; // Link to ArchiveEntry document when archived
  isDeleted?: boolean;
  deletedAt?: Timestamp | string | null;
}

export interface CreateScheduledGame {
  scheduledDateTime: string; // ISO 8601 string in UTC
  timezone: string; // IANA timezone identifier
  teamSize: TeamSize;
  customTeamSize?: string;
  gameType: GameType;
  gameVersion?: string; // Game version (e.g., 'v3.28')
  gameLength?: number; // Game length in seconds
  modes: GameMode[];
  creatorName?: string;
  createdByDiscordId?: string;
  submittedAt?: Timestamp | string;
  participants?: GameParticipant[]; // Optional, defaults to empty array
  status?: 'scheduled' | 'ongoing' | 'awaiting_replay' | 'archived' | 'cancelled';
}

