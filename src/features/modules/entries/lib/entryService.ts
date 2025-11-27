import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
  Timestamp,
} from 'firebase/firestore';
import { getFirestoreInstance } from '@/features/infrastructure/api/firebase';
import { getFirestoreAdmin, isServerSide, getAdminTimestamp } from '@/features/infrastructure/api/firebase/admin';
import { Entry, CreateEntry, UpdateEntry } from '@/types/entry';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import { removeUndefined } from '@/features/infrastructure/utils/objectUtils';
import { timestampToIso } from '@/features/infrastructure/utils/timestampUtils';

const ENTRIES_COLLECTION = 'entries';
const logger = createComponentLogger('entryService');

/**
 * Create a new entry in Firestore
 * Uses Admin SDK on server-side, Client SDK on client-side
 */
export async function createEntry(entryData: CreateEntry): Promise<string> {
  try {
    logger.info('Creating entry', { contentType: entryData.contentType, title: entryData.title });

    const cleanedData = removeUndefined(entryData as unknown as Record<string, unknown>);
    
    // Use Admin SDK on server-side, Client SDK on client-side
    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      const adminTimestamp = getAdminTimestamp();
      
      // Convert date string to Timestamp for proper sorting (Admin SDK)
      const dateValue = cleanedData.date;
      const dateTimestamp = dateValue && typeof dateValue === 'string'
        ? adminTimestamp.fromDate(new Date(dateValue))
        : adminTimestamp.now();
      
      const docRef = await adminDb.collection(ENTRIES_COLLECTION).add({
        ...cleanedData,
        creatorName: cleanedData.creatorName,
        contentType: cleanedData.contentType,
        date: dateTimestamp, // Store as Timestamp for querying/sorting
        dateString: cleanedData.date, // Keep string version for display
        ...(cleanedData.submittedAt ? { submittedAt: adminTimestamp.fromDate(new Date(cleanedData.submittedAt as string)) } : {}),
        createdAt: adminTimestamp.now(),
        updatedAt: adminTimestamp.now(),
        isDeleted: false,
      });
      logger.info('Entry created', { id: docRef.id, contentType: entryData.contentType });
      return docRef.id;
    } else {
      const db = getFirestoreInstance();
      
      // Convert date string to Timestamp for proper sorting (Client SDK)
      const dateValue = cleanedData.date;
      const dateTimestamp = dateValue && typeof dateValue === 'string'
        ? Timestamp.fromDate(new Date(dateValue))
        : Timestamp.now();
      
      const docRef = await addDoc(collection(db, ENTRIES_COLLECTION), {
        ...cleanedData,
        creatorName: cleanedData.creatorName,
        contentType: cleanedData.contentType,
        date: dateTimestamp, // Store as Timestamp for querying/sorting
        dateString: cleanedData.date, // Keep string version for display
        ...(cleanedData.submittedAt ? { submittedAt: Timestamp.fromDate(new Date(cleanedData.submittedAt as string)) } : {}),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isDeleted: false,
      });
      logger.info('Entry created', { id: docRef.id, contentType: entryData.contentType });
      return docRef.id;
    }
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to create entry', {
      component: 'entryService',
      operation: 'createEntry',
      contentType: entryData.contentType,
    });
    throw err;
  }
}

/**
 * Get an entry by ID
 */
export async function getEntryById(id: string): Promise<Entry | null> {
  try {
    logger.info('Fetching entry by ID', { id });

    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      const docSnap = await adminDb.collection(ENTRIES_COLLECTION).doc(id).get();

      if (!docSnap.exists) {
        logger.info('Entry not found', { id });
        return null;
      }

      const data = docSnap.data();
      const dateValue = data.dateString || timestampToIso(data.date);
      
      return {
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
      };
    } else {
      const db = getFirestoreInstance();
      const docRef = doc(db, ENTRIES_COLLECTION, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        logger.info('Entry not found', { id });
        return null;
      }

      const data = docSnap.data();
      const dateValue = data.dateString || timestampToIso(data.date as Timestamp | string);
      
      return {
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
      };
    }
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to fetch entry by ID', {
      component: 'entryService',
      operation: 'getEntryById',
      id,
    });
    throw err;
  }
}

/**
 * Get all entries, sorted by date (newest first)
 * Uses Admin SDK on server-side, Client SDK on client-side
 */
export async function getAllEntries(contentType?: 'post' | 'memory'): Promise<Entry[]> {
  try {
    logger.info('Fetching all entries', { contentType });

    const entries: Entry[] = [];

    // Use Admin SDK on server-side, Client SDK on client-side
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
          const dateValue = data.dateString || timestampToIso(data.date);
          
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
      } catch (error: unknown) {
        // If index is still building, fall back to fetching all and filtering in memory
        const firestoreError = error as { code?: number; message?: string };
        if (firestoreError?.code === 9 || firestoreError?.message?.includes('index is currently building')) {
          logger.info('Index still building, falling back to in-memory filtering');
          
          const querySnapshot = await adminDb.collection(ENTRIES_COLLECTION).get();

          querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            
            // Filter deleted entries
            if (data.isDeleted === true) {
              return;
            }
            
            // Filter by contentType if provided
            if (contentType && data.contentType !== contentType) {
              return;
            }
            
            const dateValue = data.dateString || timestampToIso(data.date);
            
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
        } else {
          throw error;
        }
      }
    } else {
      const db = getFirestoreInstance();
      let q = query(
        collection(db, ENTRIES_COLLECTION),
        where('isDeleted', '==', false),
        orderBy('date', 'desc')
      );

      if (contentType) {
        q = query(q, where('contentType', '==', contentType));
      }

      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const dateValue = data.dateString || timestampToIso(data.date as Timestamp | string);
        
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
    }

    logger.info('Entries fetched', { count: entries.length });
    return entries;
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to fetch entries', {
      component: 'entryService',
      operation: 'getAllEntries',
    });
    throw err;
  }
}

/**
 * Get the latest entry
 */
export async function getLatestEntry(contentType?: 'post' | 'memory'): Promise<Entry | null> {
  try {
    const entries = await getAllEntries(contentType);
    return entries.length > 0 ? entries[0] : null;
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to fetch latest entry', {
      component: 'entryService',
      operation: 'getLatestEntry',
    });
    throw err;
  }
}

/**
 * Update an entry
 * Uses Admin SDK on server-side, Client SDK on client-side
 */
export async function updateEntry(id: string, updates: UpdateEntry): Promise<void> {
  try {
    logger.info('Updating entry', { id });

    const cleanedUpdates = removeUndefined(updates);

    // Convert date string to Timestamp if date is being updated
    const updateData: Record<string, unknown> = {
      ...cleanedUpdates,
    };

    // Use Admin SDK on server-side, Client SDK on client-side
    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      const adminTimestamp = getAdminTimestamp();
      
      if (cleanedUpdates.date) {
        updateData.date = adminTimestamp.fromDate(new Date(cleanedUpdates.date));
        updateData.dateString = cleanedUpdates.date; // Keep string version
      }
      
      await adminDb.collection(ENTRIES_COLLECTION).doc(id).update({
        ...updateData,
        updatedAt: adminTimestamp.now(),
      });
    } else {
      const db = getFirestoreInstance();
      const docRef = doc(db, ENTRIES_COLLECTION, id);
      
      if (cleanedUpdates.date) {
        updateData.date = Timestamp.fromDate(new Date(cleanedUpdates.date));
        updateData.dateString = cleanedUpdates.date; // Keep string version
      }
      
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: Timestamp.now(),
      });
    }

    logger.info('Entry updated', { id });
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to update entry', {
      component: 'entryService',
      operation: 'updateEntry',
      id,
    });
    throw err;
  }
}

/**
 * Delete an entry (soft delete)
 * Uses Admin SDK on server-side, Client SDK on client-side
 */
export async function deleteEntry(id: string): Promise<void> {
  try {
    logger.info('Deleting entry', { id });

    // Use Admin SDK on server-side, Client SDK on client-side
    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      const adminTimestamp = getAdminTimestamp();
      await adminDb.collection(ENTRIES_COLLECTION).doc(id).update({
        isDeleted: true,
        deletedAt: adminTimestamp.now(),
        updatedAt: adminTimestamp.now(),
      });
    } else {
      const db = getFirestoreInstance();
      const docRef = doc(db, ENTRIES_COLLECTION, id);
      await updateDoc(docRef, {
        isDeleted: true,
        deletedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }

    logger.info('Entry deleted', { id });
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to delete entry', {
      component: 'entryService',
      operation: 'deleteEntry',
      id,
    });
    throw err;
  }
}

