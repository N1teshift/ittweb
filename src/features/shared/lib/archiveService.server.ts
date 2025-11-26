import { getFirestoreAdmin, isServerSide } from '@/features/infrastructure/api/firebase/admin';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import { ArchiveEntry } from '@/types/archive';

const logger = createComponentLogger('archiveService.server');
const ARCHIVE_COLLECTION = 'archives';

/**
 * Convert Firestore timestamp to ISO string
 * Handles both client SDK Timestamp and Admin SDK Timestamp
 */
interface TimestampLike {
  toDate?: () => Date;
}
function timestampToIso(timestamp: TimestampLike | string | Date | undefined): string {
  if (!timestamp) return new Date().toISOString();
  if (typeof timestamp === 'string') return timestamp;
  if ('toDate' in timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toISOString();
  }
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  return new Date().toISOString();
}

/**
 * Get all archive entries (server-side only)
 * Uses Admin SDK on server-side
 */
export async function getAllArchiveEntries(): Promise<ArchiveEntry[]> {
  try {
    logger.info('Fetching all archive entries');

    const entries: ArchiveEntry[] = [];

    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      
      try {
        // Try optimized query first
        const querySnapshot = await adminDb.collection(ARCHIVE_COLLECTION)
          .where('isDeleted', '==', false)
          .orderBy('createdAt', 'desc')
          .get();

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          entries.push({
            id: docSnap.id,
            title: data.title,
            content: data.content,
            author: data.author,
            createdByDiscordId: data.createdByDiscordId ?? null,
            createdByName: data.createdByName,
            mediaUrl: data.mediaUrl,
            mediaType: data.mediaType,
            images: data.images,
            videoUrl: data.videoUrl,
            twitchClipUrl: data.twitchClipUrl,
            replayUrl: data.replayUrl,
            sectionOrder: data.sectionOrder,
            dateInfo: data.dateInfo,
            createdAt: timestampToIso(data.createdAt),
            updatedAt: timestampToIso(data.updatedAt),
            isDeleted: data.isDeleted ?? false,
            deletedAt: data.deletedAt ? timestampToIso(data.deletedAt) : null,
          });
        });
      } catch (queryError: unknown) {
        // If index is still building, fall back to fetching all and filtering in memory
        const firestoreError = queryError as { code?: number; message?: string };
        if (firestoreError?.code === 9 || firestoreError?.message?.includes('index is currently building')) {
          logger.info('Index still building, falling back to in-memory filtering');
          
          const querySnapshot = await adminDb.collection(ARCHIVE_COLLECTION).get();

          querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            
            // Filter deleted entries
            if (data.isDeleted) {
              return;
            }
            
            entries.push({
              id: docSnap.id,
              title: data.title,
              content: data.content,
              author: data.author,
              createdByDiscordId: data.createdByDiscordId ?? null,
              createdByName: data.createdByName,
              mediaUrl: data.mediaUrl,
              mediaType: data.mediaType,
              images: data.images,
              videoUrl: data.videoUrl,
              twitchClipUrl: data.twitchClipUrl,
              replayUrl: data.replayUrl,
              sectionOrder: data.sectionOrder,
              dateInfo: data.dateInfo,
              createdAt: timestampToIso(data.createdAt),
              updatedAt: timestampToIso(data.updatedAt),
              isDeleted: data.isDeleted ?? false,
              deletedAt: data.deletedAt ? timestampToIso(data.deletedAt) : null,
            });
          });

          // Sort by createdAt descending
          entries.sort((a, b) => {
            const timeA = new Date(a.createdAt).getTime();
            const timeB = new Date(b.createdAt).getTime();
            return timeB - timeA;
          });
        } else {
          throw queryError;
        }
      }
    } else {
      throw new Error('getAllArchiveEntries is only available on the server side');
    }

    logger.info('Archive entries fetched', { count: entries.length });
    return entries;
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to fetch archive entries', {
      component: 'archiveService.server',
      operation: 'getAllArchiveEntries',
    });
    
    // Return empty array if there's an error
    return [];
  }
}

