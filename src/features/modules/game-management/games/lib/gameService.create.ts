/**
 * Game Service - Create Operations (Client Stub)
 * 
 * This file is a client-side stub. The actual server-only implementation
 * is in gameService.create.server.ts
 * 
 * These functions should only be called from API routes (server-side).
 * Client code should use API endpoints instead.
 */

import type {
  CreateGame,
  CreateScheduledGame,
  CreateCompletedGame,
} from '../types';

/**
 * Create a new scheduled game
 * @throws Error - This function is server-only. Use API routes instead.
 */
export async function createScheduledGame(_gameData: CreateScheduledGame): Promise<string> {
  throw new Error('createScheduledGame is server-only. Use /api/games API endpoint instead.');
}

/**
 * Create a new completed game
 * @throws Error - This function is server-only. Use API routes instead.
 */
export async function createCompletedGame(_gameData: CreateCompletedGame): Promise<string> {
  throw new Error('createCompletedGame is server-only. Use /api/games API endpoint instead.');
}

/**
 * Create a new game (legacy function)
 * @deprecated Use createCompletedGame instead
 * @throws Error - This function is server-only. Use API routes instead.
 */
export async function createGame(_gameData: CreateGame): Promise<string> {
  throw new Error('createGame is server-only. Use /api/games API endpoint instead.');
}
