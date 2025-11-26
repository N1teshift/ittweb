/**
 * Types for scheduled games feature
 */

export type TeamSize = '1v1' | '2v2' | '3v3' | '4v4' | '5v5' | '6v6' | 'custom';
export type GameType = 'elo' | 'normal';
export type GameMode = string; // Will be defined when user provides the list

export interface GameParticipant {
  discordId: string;
  name: string;
  joinedAt: string; // ISO 8601 string
}

export interface ScheduledGame {
  id: string;
  scheduledGameId: number; // Unique numeric ID for scheduled games
  scheduledByDiscordId: string;
  scheduledByName: string;
  scheduledDateTime: string; // ISO 8601 string in UTC
  timezone: string; // IANA timezone identifier (e.g., 'America/New_York')
  teamSize: TeamSize;
  customTeamSize?: string; // Only used when teamSize is 'custom'
  gameType: GameType;
  gameVersion?: string; // Game version (e.g., 'v3.28')
  gameLength?: number; // Game length in seconds
  modes: GameMode[];
  participants: GameParticipant[]; // Array of users who joined
  createdAt: string;
  updatedAt: string;
  status: 'scheduled' | 'awaiting_replay' | 'archived' | 'cancelled';
  gameId?: string; // Link to Game record when replay is uploaded
  archiveId?: string; // Link to ArchiveEntry when archived
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
  scheduledByDiscordId?: string;
  scheduledByName?: string;
  participants?: GameParticipant[]; // Optional, defaults to empty array
}

