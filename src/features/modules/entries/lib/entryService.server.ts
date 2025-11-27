import { getFirestoreAdmin, isServerSide } from '@/features/infrastructure/api/firebase/admin';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import { timestampToIso } from '@/features/infrastructure/utils/timestampUtils';
import { Entry } from '@/types/entry';

const logger = createComponentLogger('entryService.server');
const ENTRIES_COLLECTION = 'entries';

/**
 * Get all entries (server-side only)
 * Uses Admin SDK on server-side
 */
export async function getAllEntriesServer(contentType?: 'post' | 'memory'): Promise<Entry[]> {
  try {
    logger.info('Fetching all entries', { contentType });

    const entries: Entry[] = [];

    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      
      try {
        let adminQuery: ReturnType<typeof adminDb.collection> | ReturnType<ReturnType<typeof adminDb.collection>['where']> = adminDb.collection(ENTRIES_COLLECTION);

        // Filter by contentType if provided
        if (contentType) {
          adminQuery = adminQuery.where('contentType', '==', contentType) as ReturnType<ReturnType<typeof adminDb.collection>['where']>;
        }
        
        // Filter out deleted entries
        adminQuery = adminQuery.where('isDeleted', '==', false) as ReturnType<ReturnType<ReturnType<typeof adminDb.collection>['where']>['where']>;
        
        adminQuery = adminQuery.orderBy('date', 'desc') as ReturnType<ReturnType<ReturnType<ReturnType<typeof adminDb.collection>['where']>['where']>['orderBy']>;
        const querySnapshot = await adminQuery.get();

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          
          // Skip if deleted
          if (data.isDeleted === true) {
            return;
          }
          
          // Get date value - prefer dateString, fallback to converting timestamp
          let dateValue: string;
          if (data.dateString) {
            dateValue = data.dateString;
          } else if (data.date) {
            dateValue = timestampToIso(data.date);
          } else {
            // Fallback to createdAt if date is missing
            dateValue = timestampToIso(data.createdAt);
          }
          
          entries.push({
            id: docSnap.id,
            title: data.title,
            content: data.content,
            contentType: data.contentType,
            date: dateValue,
            creatorName: data.creatorName || 'Unknown',
            createdByDiscordId: data.createdByDiscordId ?? null,
            createdAt: timestampToIso(data.createdAt),
            updatedAt: timestampToIso(data.updatedAt),
            submittedAt: data.submittedAt ? timestampToIso(data.submittedAt) : undefined,
            images: data.images,
            videoUrl: data.videoUrl,
            twitchClipUrl: data.twitchClipUrl,
            sectionOrder: data.sectionOrder,
            isDeleted: data.isDeleted ?? false,
            deletedAt: data.deletedAt ? timestampToIso(data.deletedAt) : null,
          });
        });
        
        logger.info('Entries fetched from query', { count: entries.length });
      } catch (error: unknown) {
        // If index is still building or query fails, fall back to fetching all and filtering in memory
        const firestoreError = error as { code?: number; message?: string };
        logger.warn('Query failed, falling back to in-memory filtering', {
          code: firestoreError?.code,
          message: firestoreError?.message,
        });
        
        // Log error safely (avoid logging the full error object which can cause issues)
        console.log('Firestore query error - code:', firestoreError?.code, 'message:', firestoreError?.message);
        
        // Always fall back to fetching all entries if the query fails
        const querySnapshot = await adminDb.collection(ENTRIES_COLLECTION).get();
        console.log('Fallback: Total documents in collection:', querySnapshot.size);

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          
          console.log('Fallback: Processing document:', {
            id: docSnap.id,
            title: data.title,
            contentType: data.contentType,
            isDeleted: data.isDeleted,
            hasDate: !!data.date,
            hasDateString: !!data.dateString
          });
          
          // Filter deleted entries
          if (data.isDeleted === true) {
            console.log('Fallback: Skipping deleted entry:', docSnap.id);
            return;
          }
          
          // Filter by contentType if provided
          if (contentType && data.contentType !== contentType) {
            console.log('Fallback: Skipping entry (contentType mismatch):', docSnap.id, data.contentType);
            return;
          }
          
          // Get date value - prefer dateString, fallback to converting timestamp
          let dateValue: string;
          if (data.dateString) {
            dateValue = data.dateString;
          } else if (data.date) {
            dateValue = timestampToIso(data.date);
          } else {
            // Fallback to createdAt if date is missing
            dateValue = timestampToIso(data.createdAt);
          }
          
          entries.push({
            id: docSnap.id,
            title: data.title,
            content: data.content,
            contentType: data.contentType,
            date: dateValue,
            creatorName: data.creatorName || 'Unknown',
            createdByDiscordId: data.createdByDiscordId ?? null,
            createdAt: timestampToIso(data.createdAt),
            updatedAt: timestampToIso(data.updatedAt),
            submittedAt: data.submittedAt ? timestampToIso(data.submittedAt) : undefined,
            images: data.images,
            videoUrl: data.videoUrl,
            twitchClipUrl: data.twitchClipUrl,
            sectionOrder: data.sectionOrder,
            isDeleted: data.isDeleted ?? false,
            deletedAt: data.deletedAt ? timestampToIso(data.deletedAt) : null,
          });
        });
        
        // Sort by date (newest first) in memory
        entries.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA; // Descending order
        });
        
        logger.info('Entries fetched from fallback', { count: entries.length });
        console.log('Fallback: Final entries count:', entries.length);
      }
    }

    logger.info('Entries fetched', { count: entries.length });
    return entries;
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to fetch entries', {
      component: 'entryService.server',
      operation: 'getAllEntriesServer',
    });
    throw err;
  }
}

