/**
 * Zod schemas for game API request validation
 * 
 * These schemas define the validation rules for game API request bodies.
 * They can be used with zodValidator() to integrate with routeHandlers.
 */

import { z } from 'zod';

/**
 * Schema for game player data
 */
const GamePlayerSchema = z.object({
  name: z.string().min(1, 'name must be a non-empty string'),
  pid: z.number().int('pid must be an integer'),
  flag: z.enum(['winner', 'loser', 'drawer']),
  class: z.string().optional(),
  randomClass: z.boolean().optional(),
  kills: z.number().int().optional(),
  deaths: z.number().int().optional(),
  assists: z.number().int().optional(),
  gold: z.number().optional(),
  damageDealt: z.number().optional(),
  damageTaken: z.number().optional(),
});

/**
 * Schema for game participant data (scheduled games)
 */
const GameParticipantSchema = z.object({
  discordId: z.string().min(1, 'discordId must be a non-empty string'),
  name: z.string().min(1, 'name must be a non-empty string'),
  joinedAt: z.string().datetime('joinedAt must be a valid ISO 8601 datetime string'),
  result: z.enum(['winner', 'loser', 'draw']).optional(),
});

/**
 * Schema for creating a scheduled game
 */
export const CreateScheduledGameSchema = z.object({
  gameState: z.literal('scheduled').optional(), // Discriminator
  scheduledDateTime: z.string().datetime('scheduledDateTime must be a valid ISO 8601 datetime string'),
  timezone: z.string().min(1, 'timezone must be a non-empty string (IANA timezone identifier)'),
  teamSize: z.enum(['1v1', '2v2', '3v3', '4v4', '5v5', '6v6', 'custom']),
  customTeamSize: z.string().optional(), // Required when teamSize is 'custom'
  gameType: z.enum(['elo', 'normal']),
  gameVersion: z.string().optional(),
  gameLength: z.number().int().positive().optional(), // Game length in seconds
  modes: z.array(z.string()).optional(),
  creatorName: z.string().optional(), // Auto-filled from session if not provided
  createdByDiscordId: z.string().optional(), // Auto-filled from session if not provided
  participants: z.array(GameParticipantSchema).optional(),
  submittedAt: z.string().datetime().optional(),
  addCreatorToParticipants: z.boolean().optional(), // Special field for route logic
});

/**
 * Schema for creating a completed game
 */
export const CreateCompletedGameSchema = z.object({
  gameState: z.literal('completed').optional(), // Discriminator
  gameId: z.number().int().positive('gameId must be a positive integer'),
  datetime: z.string().datetime('datetime must be a valid ISO 8601 datetime string'),
  duration: z.number().int().positive('duration must be a positive integer'),
  gamename: z.string().min(1, 'gamename must be a non-empty string'),
  map: z.string().min(1, 'map must be a non-empty string'),
  creatorName: z.string().optional(), // Auto-filled from session if not provided
  ownername: z.string().optional(), // Legacy field from replay file
  category: z.string().optional(),
  replayUrl: z.string().url().optional(),
  replayFileName: z.string().optional(),
  createdByDiscordId: z.string().nullable().optional(), // Auto-filled from session if not provided
  submittedAt: z.string().datetime().optional(),
  playerNames: z.array(z.string()).optional(),
  playerCount: z.number().int().positive().optional(),
  verified: z.boolean().optional(),
  players: z.array(GamePlayerSchema).min(2, 'At least 2 players are required'),
});

/**
 * Schema for creating a game (either scheduled or completed)
 * Used by POST /api/games
 * 
 * Note: This uses a union rather than discriminated union because gameState is optional
 * and defaults to 'completed' in the route handler.
 */
export const CreateGameSchema = z.union([
  CreateScheduledGameSchema.extend({ gameState: z.literal('scheduled') }),
  CreateCompletedGameSchema.extend({ gameState: z.literal('completed') }),
  CreateCompletedGameSchema, // Without gameState, defaults to completed
]);

