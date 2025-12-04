/**
 * Game Service - Participation Operations (Server-Only)
 * 
 * Server-only functions for game participation (join/leave).
 * These functions use Firebase Admin SDK and should only be used in API routes.
 */

import { getFirestoreAdmin } from '@/features/infrastructure/api/firebase/admin';
import { logError } from '@/features/infrastructure/logging';
import { createTimestampFactoryAsync } from '@/features/infrastructure/utils';
import type { GameParticipant } from '../types';

const GAMES_COLLECTION = 'games';

/**
 * Join a scheduled game (add participant) (Server-Only)
 */
export async function joinGame(
  gameId: string,
  discordId: string,
  name: string
): Promise<void> {
  try {
    const timestampFactory = await createTimestampFactoryAsync();
    const adminDb = getFirestoreAdmin();
    const gameRef = adminDb.collection(GAMES_COLLECTION).doc(gameId);
    const gameDoc = await gameRef.get();
    
    if (!gameDoc.exists) {
      throw new Error('Game not found');
    }
    
    const gameData = gameDoc.data();
    if (!gameData) {
      throw new Error('Game not found');
    }
    
    if (gameData.gameState !== 'scheduled') {
      throw new Error('Can only join scheduled games');
    }
    
    const participants = (gameData.participants || []) as GameParticipant[];
    
    // Check if user is already a participant
    if (participants.some(p => p.discordId === discordId)) {
      throw new Error('User is already a participant');
    }
    
    // Add user to participants
    participants.push({
      discordId,
      name,
      joinedAt: new Date().toISOString(),
    });
    
    const now = timestampFactory.now();
    await gameRef.update({
      participants,
      updatedAt: now,
    });
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to join game', {
      component: 'gameService',
      operation: 'joinGame',
      gameId,
      discordId,
    });
    throw err;
  }
}

/**
 * Leave a scheduled game (remove participant) (Server-Only)
 */
export async function leaveGame(
  gameId: string,
  discordId: string
): Promise<void> {
  try {
    const timestampFactory = await createTimestampFactoryAsync();
    const adminDb = getFirestoreAdmin();
    const gameRef = adminDb.collection(GAMES_COLLECTION).doc(gameId);
    const gameDoc = await gameRef.get();
    
    if (!gameDoc.exists) {
      throw new Error('Game not found');
    }
    
    const gameData = gameDoc.data();
    if (!gameData) {
      throw new Error('Game not found');
    }
    
    if (gameData.gameState !== 'scheduled') {
      throw new Error('Can only leave scheduled games');
    }
    
    const participants = (gameData.participants || []) as GameParticipant[];
    const updatedParticipants = participants.filter(p => p.discordId !== discordId);
    
    const now = timestampFactory.now();
    await gameRef.update({
      participants: updatedParticipants,
      updatedAt: now,
    });
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to leave game', {
      component: 'gameService',
      operation: 'leaveGame',
      gameId,
      discordId,
    });
    throw err;
  }
}

