import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirestoreInstance } from '@/features/infrastructure/api/firebase';
import { UserData, CreateUserData } from '@/types/userData';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';

const USER_DATA_COLLECTION = 'userData';
const logger = createComponentLogger('userDataService');

/**
 * Remove undefined values from an object (Firestore doesn't allow undefined)
 */
function removeUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined)
  ) as Partial<T>;
}

/**
 * Save or update user data in Firestore
 * Uses discordId as the document ID for faster lookups
 * This function will create a new document if the user doesn't exist,
 * or update the existing document if they do.
 */
export async function saveUserData(userData: CreateUserData): Promise<void> {
  try {
    logger.info('Saving user data', { discordId: userData.discordId });

    const db = getFirestoreInstance();
    // Use discordId as the document ID for easier lookups
    const docRef = doc(db, USER_DATA_COLLECTION, userData.discordId);
    
    // Check if document already exists
    const docSnap = await getDoc(docRef);
    
    // Remove undefined values before saving (Firestore doesn't allow undefined)
    const cleanedUserData = removeUndefined(userData as unknown as Record<string, unknown>);
    const userDataWithTimestamps = {
      ...cleanedUserData,
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

    const db = getFirestoreInstance();
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
      role: data.role,
      dataCollectionNoticeAccepted: data.dataCollectionNoticeAccepted,
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

    const db = getFirestoreInstance();
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
      role: data.role,
      dataCollectionNoticeAccepted: data.dataCollectionNoticeAccepted,
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

/**
 * Delete user data by Discord ID
 * Permanently removes the user's data from Firestore
 */
export async function deleteUserData(discordId: string): Promise<void> {
  try {
    logger.info('Deleting user data', { discordId });

    const db = getFirestoreInstance();
    const docRef = doc(db, USER_DATA_COLLECTION, discordId);
    
    // Check if document exists
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      logger.info('User data not found for deletion', { discordId });
      return;
    }

    await deleteDoc(docRef);
    logger.info('User data deleted', { discordId });
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to delete user data', {
      component: 'userDataService',
      operation: 'deleteUserData',
      discordId,
    });
    throw err;
  }
}

/**
 * Update the data collection notice acceptance status for a user
 */
export async function updateDataCollectionNoticeAcceptance(
  discordId: string,
  accepted: boolean
): Promise<void> {
  try {
    logger.info('Updating data collection notice acceptance', { discordId, accepted });

    const db = getFirestoreInstance();
    const docRef = doc(db, USER_DATA_COLLECTION, discordId);
    
    await updateDoc(docRef, {
      dataCollectionNoticeAccepted: accepted,
      updatedAt: serverTimestamp(),
    });

    logger.info('Data collection notice acceptance updated', { discordId, accepted });
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to update data collection notice acceptance', {
      component: 'userDataService',
      operation: 'updateDataCollectionNoticeAcceptance',
      discordId,
    });
    throw err;
  }
}


