import {
  doc,
  getDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { getFirestoreInstance } from '@/features/infrastructure/api/firebase';
import { getFirestoreAdmin, isServerSide, getAdminTimestamp } from '@/features/infrastructure/api/firebase/admin';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import type { GameParticipant } from '../types';

const GAMES_COLLECTION = 'games';
const logger = createComponentLogger('gameService');

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

    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      const adminTimestamp = getAdminTimestamp();
      const gameRef = adminDb.collection(GAMES_COLLECTION).doc(gameId);
      
      // Get current game data
      const gameDoc = await gameRef.get();
      if (!gameDoc.exists) {
        throw new Error('Game not found');
      }
      
      const gameData = gameDoc.data();
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
      
      await gameRef.update({
        participants,
        updatedAt: adminTimestamp.now(),
      });
    } else {
      const db = getFirestoreInstance();
      const gameRef = doc(db, GAMES_COLLECTION, gameId);
      
      // Get current game data
      const gameDoc = await getDoc(gameRef);
      if (!gameDoc.exists()) {
        throw new Error('Game not found');
      }
      
      const gameData = gameDoc.data();
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
      
      await updateDoc(gameRef, {
        participants,
        updatedAt: Timestamp.now(),
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

    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      const adminTimestamp = getAdminTimestamp();
      const gameRef = adminDb.collection(GAMES_COLLECTION).doc(gameId);
      
      // Get current game data
      const gameDoc = await gameRef.get();
      if (!gameDoc.exists) {
        throw new Error('Game not found');
      }
      
      const gameData = gameDoc.data();
      if (gameData?.gameState !== 'scheduled') {
        throw new Error('Can only leave scheduled games');
      }
      
      const participants = (gameData?.participants || []) as GameParticipant[];
      
      // Remove user from participants
      const updatedParticipants = participants.filter(p => p.discordId !== discordId);
      
      await gameRef.update({
        participants: updatedParticipants,
        updatedAt: adminTimestamp.now(),
      });
    } else {
      const db = getFirestoreInstance();
      const gameRef = doc(db, GAMES_COLLECTION, gameId);
      
      // Get current game data
      const gameDoc = await getDoc(gameRef);
      if (!gameDoc.exists()) {
        throw new Error('Game not found');
      }
      
      const gameData = gameDoc.data();
      if (gameData?.gameState !== 'scheduled') {
        throw new Error('Can only leave scheduled games');
      }
      
      const participants = (gameData?.participants || []) as GameParticipant[];
      
      // Remove user from participants
      const updatedParticipants = participants.filter(p => p.discordId !== discordId);
      
      await updateDoc(gameRef, {
        participants: updatedParticipants,
        updatedAt: Timestamp.now(),
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

