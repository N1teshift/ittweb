import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getUserDataByDiscordId } from '@/features/shared/lib/userDataService';
import { isAdmin } from '@/features/shared/utils/userRoleUtils';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import { getFirestoreAdmin, getStorageAdmin, getStorageBucketName } from '@/features/infrastructure/api/firebase/admin';

const logger = createComponentLogger('api/admin/wipe-test-data');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Require authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.discordId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user is admin
    const userData = await getUserDataByDiscordId(session.discordId);
    if (!isAdmin(userData?.role)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const adminDb = getFirestoreAdmin();
    let deletedCounts: Record<string, number> = {};

    logger.info('Starting complete data wipe', { discordId: session.discordId });

    // 1. Delete ALL Firestore collections
    const collections = await adminDb.listCollections();
    logger.info('Found collections to delete', { count: collections.length, collections: collections.map(c => c.id) });

    for (const collection of collections) {
      const collectionName = collection.id;
      let collectionCount = 0;

      try {
        const snapshot = await collection.get();
        
        // Handle collections with subcollections (like games with players)
        const deletionPromises: Promise<void>[] = [];
        
        snapshot.forEach((doc) => {
          const deletion = async () => {
            try {
              // Delete subcollections first
              const subcollections = await doc.ref.listCollections();
              for (const subcollection of subcollections) {
                const subSnapshot = await subcollection.get();
                const subDeletionPromises = subSnapshot.docs.map((subDoc) => 
                  subDoc.ref.delete()
                );
                await Promise.all(subDeletionPromises);
                const subCount = subSnapshot.docs.length;
                deletedCounts[`${collectionName}.${subcollection.id}`] = 
                  (deletedCounts[`${collectionName}.${subcollection.id}`] || 0) + subCount;
              }
              
              // Delete the document
              await doc.ref.delete();
              collectionCount += 1;
            } catch (error) {
              logger.warn('Failed to delete document', {
                collection: collectionName,
                docId: doc.id,
                error: error instanceof Error ? error.message : String(error),
              });
            }
          };
          deletionPromises.push(deletion());
        });

        await Promise.all(deletionPromises);
        deletedCounts[collectionName] = collectionCount;
        logger.info('Deleted collection', { collection: collectionName, count: collectionCount });
      } catch (error) {
        logger.warn('Failed to delete collection', {
          collection: collectionName,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // 2. Delete ALL files from Firebase Storage
    const storage = getStorageAdmin();
    const bucketName = getStorageBucketName();
    const bucket = bucketName ? storage.bucket(bucketName) : storage.bucket();
    
    let storageFileCount = 0;
    try {
      const [files] = await bucket.getFiles();
      logger.info('Found files in storage to delete', { count: files.length });
      
      const fileDeletionPromises = files.map(async (file) => {
        try {
          await file.delete();
          storageFileCount += 1;
        } catch (error) {
          logger.warn('Failed to delete storage file', {
            fileName: file.name,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      });

      await Promise.all(fileDeletionPromises);
      deletedCounts.storageFiles = storageFileCount;
      logger.info('Deleted storage files', { count: storageFileCount });
    } catch (error) {
      logger.warn('Failed to delete storage files', {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    logger.info('Test data wipe completed', {
      discordId: session.discordId,
      deletedCounts,
    });

    return res.status(200).json({
      success: true,
      message: 'Test data wiped successfully',
      deletedCounts,
    });
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to wipe test data', {
      component: 'api/admin/wipe-test-data',
      operation: req.method || 'unknown',
      method: req.method,
    });

    return res.status(500).json({
      error: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message,
    });
  }
}

