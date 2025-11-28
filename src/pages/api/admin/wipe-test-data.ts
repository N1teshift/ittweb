import type { NextApiRequest } from 'next';
import { createPostHandler } from '@/features/infrastructure/api/routeHandlers';
import { createComponentLogger } from '@/features/infrastructure/logging';
import { getFirestoreAdmin, getStorageAdmin, getStorageBucketName } from '@/features/infrastructure/api/firebase/admin';

const logger = createComponentLogger('api/admin/wipe-test-data');

/**
 * POST /api/admin/wipe-test-data - Wipe all test data (requires admin authentication)
 */
export default createPostHandler<{ success: boolean; message: string; deletedCounts: Record<string, number> }>(
  async (req: NextApiRequest, res, context) => {
    // Session is guaranteed to be available and user is admin due to requireAdmin option
    const session = context?.session!;

    const adminDb = getFirestoreAdmin();
    const deletedCounts: Record<string, number> = {};

    logger.info('Starting complete data wipe', { discordId: session.discordId });

    // 1. Delete ALL Firestore collections (except userData)
    const collections = await adminDb.listCollections();
    const collectionsToDelete = collections.filter(c => c.id !== 'userData');
    logger.info('Found collections to delete', { 
      total: collections.length, 
      toDelete: collectionsToDelete.length,
      skipped: ['userData'],
      collections: collectionsToDelete.map(c => c.id) 
    });

    for (const collection of collectionsToDelete) {
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

