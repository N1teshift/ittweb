/**
 * Server-side userData service functions
 * Uses Admin SDK to bypass Firestore security rules (server-side only)
 * 
 * These functions should be used in:
 * - API routes (server-side)
 * - getServerSideProps (server-side)
 * - Server components (Next.js 13+)
 * 
 * For client-side usage, use functions from userDataService.ts
 */

import { getFirestoreAdmin, isServerSide } from '@/features/infrastructure/api/firebase/admin';
import { UserData, CreateUserData } from '@/types/userData';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';

const USER_DATA_COLLECTION = 'userData';
const logger = createComponentLogger('userDataService.server');

/**
 * Remove undefined values from an object (Firestore doesn't allow undefined)
 */
function removeUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined)
  ) as Partial<T>;
}

/**
 * Get user data by Discord ID (server-side only)
 * Uses Admin SDK to bypass security rules
 */
export async function getUserDataByDiscordIdServer(discordId: string): Promise<UserData | null> {
  if (!isServerSide()) {
    throw new Error('getUserDataByDiscordIdServer can only be used server-side');
  }

  try {
    logger.info('Fetching user data (server-side)', { discordId });

    const adminDb = getFirestoreAdmin();
    const docRef = adminDb.collection(USER_DATA_COLLECTION).doc(discordId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      logger.info('User data not found', { discordId });
      return null;
    }

    const data = docSnap.data();
    if (!data) {
      logger.info('User data document exists but has no data', { discordId });
      return null;
    }

    return {
      id: docSnap.id,
      discordId: data.discordId as string,
      email: data.email as string | undefined,
      name: data.name as string | undefined,
      preferredName: data.preferredName as string | undefined,
      avatarUrl: data.avatarUrl as string | undefined,
      username: data.username as string | undefined,
      globalName: data.globalName as string | undefined,
      displayName: data.displayName as string | undefined,
      role: data.role as UserData['role'] | undefined,
      dataCollectionNoticeAccepted: data.dataCollectionNoticeAccepted as boolean | undefined,
      createdAt: data.createdAt as UserData['createdAt'],
      updatedAt: data.updatedAt as UserData['updatedAt'],
      lastLoginAt: data.lastLoginAt as UserData['lastLoginAt'],
    };
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to fetch user data (server-side)', {
      component: 'userDataService.server',
      operation: 'getUserDataByDiscordIdServer',
      discordId,
    });
    throw err;
  }
}

/**
 * Save or update user data (server-side only)
 * Uses Admin SDK to bypass security rules
 */
export async function saveUserDataServer(userData: CreateUserData): Promise<void> {
  if (!isServerSide()) {
    throw new Error('saveUserDataServer can only be used server-side');
  }

  try {
    logger.info('Saving user data (server-side)', { discordId: userData.discordId });

    const adminDb = getFirestoreAdmin();
    const docRef = adminDb.collection(USER_DATA_COLLECTION).doc(userData.discordId);

    // Check if document already exists
    const docSnap = await docRef.get();

    // Remove undefined values before saving (Firestore doesn't allow undefined)
    const cleanedUserData = removeUndefined(userData as unknown as Record<string, unknown>);
    const { createAdminTimestampFactoryAsync } = await import('@/features/infrastructure/utils');
    const timestampFactory = await createAdminTimestampFactoryAsync();
    const now = timestampFactory.now();
    const userDataWithTimestamps = {
      ...cleanedUserData,
      updatedAt: now,
      lastLoginAt: now,
    };

    if (docSnap.exists) {
      // User exists, update the document
      await docRef.update(userDataWithTimestamps);
      logger.info('User data updated (server-side)', {
        discordId: userData.discordId,
        documentId: userData.discordId
      });
    } else {
      // User doesn't exist, create new document
      await docRef.set({
        ...userDataWithTimestamps,
        createdAt: now,
      });
      logger.info('User data created (server-side)', {
        discordId: userData.discordId,
        documentId: userData.discordId
      });
    }
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to save user data (server-side)', {
      component: 'userDataService.server',
      operation: 'saveUserDataServer',
      discordId: userData.discordId,
    });
    throw err;
  }
}

/**
 * Update the data collection notice acceptance status (server-side only)
 * Uses Admin SDK to bypass security rules
 */
export async function updateDataCollectionNoticeAcceptanceServer(
  discordId: string,
  accepted: boolean
): Promise<void> {
  if (!isServerSide()) {
    throw new Error('updateDataCollectionNoticeAcceptanceServer can only be used server-side');
  }

  try {
    logger.info('Updating data collection notice acceptance (server-side)', { discordId, accepted });

    const adminDb = getFirestoreAdmin();
    const docRef = adminDb.collection(USER_DATA_COLLECTION).doc(discordId);

    const { createAdminTimestampFactoryAsync } = await import('@/features/infrastructure/utils');
    const timestampFactory = await createAdminTimestampFactoryAsync();
    await docRef.update({
      dataCollectionNoticeAccepted: accepted,
      updatedAt: timestampFactory.now(),
    });

    logger.info('Data collection notice acceptance updated (server-side)', { discordId, accepted });
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to update data collection notice acceptance (server-side)', {
      component: 'userDataService.server',
      operation: 'updateDataCollectionNoticeAcceptanceServer',
      discordId,
    });
    throw err;
  }
}

/**
 * Delete user data by Discord ID (server-side only)
 * Uses Admin SDK to bypass security rules
 */
export async function deleteUserDataServer(discordId: string): Promise<void> {
  if (!isServerSide()) {
    throw new Error('deleteUserDataServer can only be used server-side');
  }

  try {
    logger.info('Deleting user data (server-side)', { discordId });

    const adminDb = getFirestoreAdmin();
    const docRef = adminDb.collection(USER_DATA_COLLECTION).doc(discordId);

    // Check if document exists
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      logger.info('User data not found for deletion (server-side)', { discordId });
      return;
    }

    await docRef.delete();
    logger.info('User data deleted (server-side)', { discordId });
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to delete user data (server-side)', {
      component: 'userDataService.server',
      operation: 'deleteUserDataServer',
      discordId,
    });
    throw err;
  }
}


