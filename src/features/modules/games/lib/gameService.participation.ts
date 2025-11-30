import {
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { getFirestoreInstance } from '@/features/infrastructure/api/firebase';
import { getFirestoreAdmin, isServerSide } from '@/features/infrastructure/api/firebase/admin';
import { logError } from '@/features/infrastructure/logging';
import { createTimestampFactoryAsync } from '@/features/infrastructure/utils/timestampUtils';
import type { GameParticipant } from '../types';

const GAMES_COLLECTION = 'games';

/**
 * Join a scheduled game (add participant)
 */
export async function joinGame(
  gameId: string,
  discordId: string,
  name: string
): Promise<void> {
  try {
    // Reduced logging verbosity

    const timestampFactory = await createTimestampFactoryAsync();
    
    let gameData: Record<string, unknown> | undefined;
    
    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      const gameRef = adminDb.collection(GAMES_COLLECTION).doc(gameId);
      const gameDoc = await gameRef.get();
      if (!gameDoc.exists) {
        throw new Error('Game not found');
      }
      gameData = gameDoc.data();
    } else {
      const db = getFirestoreInstance();
      const gameRef = doc(db, GAMES_COLLECTION, gameId);
      const gameDoc = await getDoc(gameRef);
      if (!gameDoc.exists()) {
        throw new Error('Game not found');
      }
      gameData = gameDoc.data();
    }
    
    if (gameData?.gameState !== 'scheduled') {
      throw new Error('Can only join scheduled games');
    }
    
    const participants = (gameData?.participants || []) as GameParticipant[];
    
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
    
    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      const gameRef = adminDb.collection(GAMES_COLLECTION).doc(gameId);
      await gameRef.update({
        participants,
        updatedAt: now,
      });
    } else {
      const db = getFirestoreInstance();
      const gameRef = doc(db, GAMES_COLLECTION, gameId);
      await updateDoc(gameRef, {
        participants,
        updatedAt: now,
      });
    }

    // User joined game successfully
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
 * Leave a scheduled game (remove participant)
 */
export async function leaveGame(
  gameId: string,
  discordId: string
): Promise<void> {
  try {
    // Reduced logging verbosity

    const timestampFactory = await createTimestampFactoryAsync();
    
    let gameData: Record<string, unknown> | undefined;
    
    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      const gameRef = adminDb.collection(GAMES_COLLECTION).doc(gameId);
      const gameDoc = await gameRef.get();
      if (!gameDoc.exists) {
        throw new Error('Game not found');
      }
      gameData = gameDoc.data();
    } else {
      const db = getFirestoreInstance();
      const gameRef = doc(db, GAMES_COLLECTION, gameId);
      const gameDoc = await getDoc(gameRef);
      if (!gameDoc.exists()) {
        throw new Error('Game not found');
      }
      gameData = gameDoc.data();
    }
    
    if (gameData?.gameState !== 'scheduled') {
      throw new Error('Can only leave scheduled games');
    }
    
    const participants = (gameData?.participants || []) as GameParticipant[];
    const updatedParticipants = participants.filter(p => p.discordId !== discordId);
    
    const now = timestampFactory.now();
    
    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      const gameRef = adminDb.collection(GAMES_COLLECTION).doc(gameId);
      await gameRef.update({
        participants: updatedParticipants,
        updatedAt: now,
      });
    } else {
      const db = getFirestoreInstance();
      const gameRef = doc(db, GAMES_COLLECTION, gameId);
      await updateDoc(gameRef, {
        participants: updatedParticipants,
        updatedAt: now,
      });
    }

    // User left game successfully
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

