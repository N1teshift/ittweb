import type { NextApiRequest } from 'next';
import { createPostHandler } from '@/features/infrastructure/api';
import { createComponentLogger } from '@/features/infrastructure/logging';
import { getFirestoreAdmin, getStorageAdmin, getStorageBucketName } from '@/features/infrastructure/api/firebase/admin';

const logger = createComponentLogger('api/admin/wipe-all-entries');

/**
 * Extract file path from Firebase Storage URL
 * Handles both full URLs and paths
 */
function extractStoragePath(url: string): string | null {
  try {
    // If it's already a path (starts with archives/), return as is
    if (url.startsWith('archives/')) {
      return url;
    }

    // If it's a full URL, extract the path
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(/\/o\/(.+)/);
    if (pathMatch) {
      // Decode the path (Firebase Storage URLs are encoded)
      return decodeURIComponent(pathMatch[1].replace(/%2F/g, '/'));
    }

    // Try to extract from query parameter
    const altParam = urlObj.searchParams.get('alt');
    if (altParam === 'media') {
      const tokenMatch = urlObj.pathname.match(/\/o\/(.+)\?/);
      if (tokenMatch) {
        return decodeURIComponent(tokenMatch[1].replace(/%2F/g, '/'));
      }
    }

    return null;
  } catch (error) {
    logger.warn('Failed to extract storage path from URL', { url, error });
    return null;
  }
}

/**
 * POST /api/admin/wipe-all-entries - Delete all entries and their associated images (requires admin authentication)
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

    logger.info('Starting entries wipe', { discordId: session.discordId });

    // Collections to delete
    const COLLECTIONS_TO_DELETE = ['entries', 'archives'] as const;

    // 1. Delete entries from Firestore and collect image URLs
    const imageUrls: string[] = [];

    for (const collectionName of COLLECTIONS_TO_DELETE) {
      let collectionCount = 0;

      try {
        const collection = adminDb.collection(collectionName);
        const snapshot = await collection.get();
        
        logger.info('Found documents in collection', { 
          collection: collectionName, 
          count: snapshot.size 
        });

        const deletionPromises: Promise<void>[] = [];
        
        snapshot.forEach((doc) => {
          const deletion = async () => {
            try {
              const data = doc.data();
              
              // Collect image URLs from the entry
              if (data.images && Array.isArray(data.images)) {
                data.images.forEach((url: string) => {
                  if (url && typeof url === 'string') {
                    imageUrls.push(url);
                  }
                });
              }

              // Delete subcollections first (if any)
              const subcollections = await doc.ref.listCollections();
              for (const subcollection of subcollections) {
                const subSnapshot = await subcollection.get();
                const subDeletionPromises = subSnapshot.docs.map((subDoc) => 
                  subDoc.ref.delete()
                );
                await Promise.all(subDeletionPromises);
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

    // 2. Delete files from Firebase Storage
    const storage = getStorageAdmin();
    const bucketName = getStorageBucketName();
    const bucket = bucketName ? storage.bucket(bucketName) : storage.bucket();
    
    let storageFileCount = 0;
    let imageFileCount = 0;

    try {
      // Delete all files in the archives/ folder
      const [files] = await bucket.getFiles({ prefix: 'archives/' });
      logger.info('Found files in archives/ folder to delete', { count: files.length });
      
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
      logger.info('Deleted storage files from archives/ folder', { count: storageFileCount });

      // Also try to delete specific image files from collected URLs
      const imagePaths = imageUrls
        .map(extractStoragePath)
        .filter((path): path is string => path !== null && path.startsWith('archives/'));

      if (imagePaths.length > 0) {
        logger.info('Attempting to delete specific image files', { count: imagePaths.length });
        
        const imageDeletionPromises = imagePaths.map(async (path) => {
          try {
            const file = bucket.file(path);
            const [exists] = await file.exists();
            if (exists) {
              await file.delete();
              imageFileCount += 1;
            }
          } catch (error) {
            // Ignore errors for individual files (might already be deleted)
            logger.debug('Could not delete image file', { path, error });
          }
        });

        await Promise.all(imageDeletionPromises);
        if (imageFileCount > 0) {
          deletedCounts.imageFiles = imageFileCount;
          logger.info('Deleted specific image files', { count: imageFileCount });
        }
      }
    } catch (error) {
      logger.warn('Failed to delete storage files', {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    logger.info('Entries wipe completed', {
      discordId: session.discordId,
      deletedCounts,
      collectionsDeleted: COLLECTIONS_TO_DELETE,
      storageFolderDeleted: 'archives/',
      totalImagesFound: imageUrls.length,
    });

    return {
      success: true,
      message: 'All entries and images deleted successfully',
      deletedCounts,
    };
  },
  {
    requireAdmin: true, // Automatically requires auth and admin role
    logRequests: true,
  }
);


