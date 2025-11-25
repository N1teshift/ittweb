import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { UserData, CreateUserData } from '@/types/userData';
import { createComponentLogger } from '@/features/shared/utils/loggerUtils';
import { logError } from '@/features/shared/utils/loggerUtils';

const USER_DATA_COLLECTION = 'userData';
const logger = createComponentLogger('userDataService');

/**
 * Save or update user data in Firestore
 * Uses discordId as the document ID for faster lookups
 * This function will create a new document if the user doesn't exist,
 * or update the existing document if they do.
 */
export async function saveUserData(userData: CreateUserData): Promise<void> {
  try {
    logger.info('Saving user data', { discordId: userData.discordId });

    // Use discordId as the document ID for easier lookups
    const docRef = doc(db, USER_DATA_COLLECTION, userData.discordId);
    
    // Check if document already exists
    const docSnap = await getDoc(docRef);
    
    const userDataWithTimestamps = {
      ...userData,
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    };

    if (docSnap.exists()) {
      // User exists, update the document
      await updateDoc(docRef, userDataWithTimestamps);
      logger.info('User data updated', { 
        discordId: userData.discordId,
        documentId: userData.discordId 
      });
    } else {
      // User doesn't exist, create new document
      await setDoc(docRef, {
        ...userDataWithTimestamps,
        createdAt: serverTimestamp(),
      });
      logger.info('User data created', { 
        discordId: userData.discordId,
        documentId: userData.discordId 
      });
    }
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to save user data', {
      component: 'userDataService',
      operation: 'saveUserData',
      discordId: userData.discordId,
    });
    throw err;
  }
}

/**
 * Get user data by Discord ID
 * Uses discordId as the document ID for direct lookup
 */
export async function getUserDataByDiscordId(discordId: string): Promise<UserData | null> {
  try {
    logger.info('Fetching user data', { discordId });

    const docRef = doc(db, USER_DATA_COLLECTION, discordId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      logger.info('User data not found', { discordId });
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      discordId: data.discordId,
      email: data.email,
      name: data.name,
      preferredName: data.preferredName,
      avatarUrl: data.avatarUrl,
      username: data.username,
      globalName: data.globalName,
      displayName: data.displayName,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      lastLoginAt: data.lastLoginAt,
    };
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to fetch user data', {
      component: 'userDataService',
      operation: 'getUserDataByDiscordId',
      discordId,
    });
    throw err;
  }
}

/**
 * Get user data by document ID
 */
export async function getUserDataById(id: string): Promise<UserData | null> {
  try {
    logger.info('Fetching user data by ID', { id });

    const docRef = doc(db, USER_DATA_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      logger.info('User data not found', { id });
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      discordId: data.discordId,
      email: data.email,
      name: data.name,
      preferredName: data.preferredName,
      avatarUrl: data.avatarUrl,
      username: data.username,
      globalName: data.globalName,
      displayName: data.displayName,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      lastLoginAt: data.lastLoginAt,
    };
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to fetch user data by ID', {
      component: 'userDataService',
      operation: 'getUserDataById',
      id,
    });
    throw err;
  }
}
