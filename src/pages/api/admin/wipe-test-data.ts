import type { NextApiRequest } from 'next';
import { createPostHandler } from '@/features/infrastructure/api';
import { createComponentLogger } from '@/features/infrastructure/logging';
import { getFirestoreAdmin, getStorageAdmin, getStorageBucketName } from '@/features/infrastructure/api/firebase/admin';

const logger = createComponentLogger('api/admin/wipe-test-data');

/**
 * POST /api/admin/wipe-test-data - Wipe all test data (requires admin authentication)
 */
export default createPostHandler<{ success: boolean; message: string; deletedCounts: Record<string, number> }>(
  async (req: NextApiRequest, res, context) => {
    // Session is guaranteed to be available and user is admin due to requireAdmin option
    if (!context?.session) {
      throw new Error('Session required');
    }
    const session = context.session;

    const adminDb = getFirestoreAdmin();
    const deletedCounts: Record<string, number> = {};

    logger.info('Starting test data wipe', { discordId: session.discordId });

    // Explicitly define which collections to delete
    const COLLECTIONS_TO_DELETE = ['games', 'playerStats', 'playerCategoryStats'] as const;
    
    logger.info('Collections to delete', { 
      collections: COLLECTIONS_TO_DELETE
    });

    // 1. Delete specified Firestore collections
    for (const collectionName of COLLECTIONS_TO_DELETE) {
      let collectionCount = 0;

      try {
        const collection = adminDb.collection(collectionName);
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

    // 2. Delete files from Firebase Storage - only the games folder
    const storage = getStorageAdmin();
    const bucketName = getStorageBucketName();
    const bucket = bucketName ? storage.bucket(bucketName) : storage.bucket();
    
    let storageFileCount = 0;
    try {
      // Only get files in the games/ folder
      const [files] = await bucket.getFiles({ prefix: 'games/' });
      logger.info('Found files in games/ folder to delete', { count: files.length });
      
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
      logger.info('Deleted storage files from games/ folder', { count: storageFileCount });
    } catch (error) {
      logger.warn('Failed to delete storage files', {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    logger.info('Test data wipe completed', {
      discordId: session.discordId,
      deletedCounts,
      collectionsDeleted: COLLECTIONS_TO_DELETE,
      storageFolderDeleted: 'games/'
    });

    return {
      success: true,
      message: 'Test data wiped successfully',
      deletedCounts,
    };
  },
  {
    requireAdmin: true, // Automatically requires auth and admin role
    logRequests: true,
  }
);


