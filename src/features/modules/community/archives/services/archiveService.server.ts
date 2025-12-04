import { getFirestoreAdmin, isServerSide } from '@/features/infrastructure/api/firebase/admin';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import { timestampToIso } from '@/features/infrastructure/utils';
import { ArchiveEntry } from '@/types/archive';

const logger = createComponentLogger('archiveService.server');
const ARCHIVE_COLLECTION = 'archives';

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
            creatorName: data.creatorName || 'Unknown',
            createdByDiscordId: data.createdByDiscordId ?? null,
            entryType: data.entryType,
            images: data.images,
            videoUrl: data.videoUrl,
            twitchClipUrl: data.twitchClipUrl,
            replayUrl: data.replayUrl,
            linkedGameDocumentId: data.linkedGameDocumentId,
            sectionOrder: data.sectionOrder,
            dateInfo: data.dateInfo,
            createdAt: timestampToIso(data.createdAt),
            updatedAt: timestampToIso(data.updatedAt),
            submittedAt: data.submittedAt ? timestampToIso(data.submittedAt) : undefined,
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
              creatorName: data.creatorName || 'Unknown',
              createdByDiscordId: data.createdByDiscordId ?? null,
              entryType: data.entryType,
              images: data.images,
              videoUrl: data.videoUrl,
              twitchClipUrl: data.twitchClipUrl,
              replayUrl: data.replayUrl,
              linkedGameDocumentId: data.linkedGameDocumentId,
              sectionOrder: data.sectionOrder,
              dateInfo: data.dateInfo,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
              submittedAt: data.submittedAt ? timestampToIso(data.submittedAt) : undefined,
              isDeleted: data.isDeleted ?? false,
              deletedAt: data.deletedAt ? timestampToIso(data.deletedAt) : null,
            });
          });

          // Sort by createdAt descending
          entries.sort((a, b) => {
            const timeA = new Date(timestampToIso(a.createdAt)).getTime();
            const timeB = new Date(timestampToIso(b.createdAt)).getTime();
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




