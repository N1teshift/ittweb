import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { getFirestoreInstance } from '@/features/infrastructure/api/firebase';
import { getFirestoreAdmin, isServerSide } from '@/features/infrastructure/api/firebase/admin';
import { Entry, CreateEntry, UpdateEntry } from '@/types/entry';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import { getDocument } from '@/features/infrastructure/api/firebase/firestoreHelpers';
import { removeUndefined } from '@/features/infrastructure/utils/objectUtils';
import { createTimestampFactoryAsync } from '@/features/infrastructure/utils/timestampUtils';
import {
  transformEntryDoc,
  prepareEntryDataForFirestore,
  prepareEntryUpdateData,
  prepareDeleteData,
  transformEntryDocs,
  sortEntriesByDate,
} from './entryService.helpers';

const ENTRIES_COLLECTION = 'entries';
const logger = createComponentLogger('entryService');

/**
 * Create a new entry in Firestore
 * Uses Admin SDK on server-side, Client SDK on client-side
 */
export async function createEntry(entryData: CreateEntry): Promise<string> {
  try {
    logger.info('Creating entry', { contentType: entryData.contentType, title: entryData.title });

    const timestampFactory = await createTimestampFactoryAsync();
    const firestoreData = prepareEntryDataForFirestore(entryData, timestampFactory);

    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      const docRef = await adminDb.collection(ENTRIES_COLLECTION).add(firestoreData);
      logger.info('Entry created', { id: docRef.id, contentType: entryData.contentType });
      return docRef.id;
    } else {
      const db = getFirestoreInstance();
      const docRef = await addDoc(collection(db, ENTRIES_COLLECTION), firestoreData);
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
    logger.debug('Fetching entry by ID', { id });

    const docSnap = await getDocument(ENTRIES_COLLECTION, id);

    if (!docSnap || !docSnap.exists) {
      logger.debug('Entry not found', { id });
      return null;
    }

    const data = docSnap.data();
    if (!data) {
      logger.debug('Entry data is undefined', { id });
      return null;
    }

    return transformEntryDoc(data, docSnap.id);
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
    logger.debug('Fetching all entries', { contentType });

    let entries: Entry[] = [];

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

        // Transform documents (query already filters, but add safety check for deleted entries)
        const docs: Array<{ data: () => Record<string, unknown>; id: string }> = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          // Safety check: filter out deleted entries even if query should have filtered them
          if (data.isDeleted === true) {
            return;
          }
          docs.push({ data: () => data, id: docSnap.id });
        });
        entries = docs.map((docSnap) => transformEntryDoc(docSnap.data()!, docSnap.id));
      } catch (error: unknown) {
        // If index is still building, fall back to fetching all and filtering in memory
        const firestoreError = error as { code?: number; message?: string };
        if (firestoreError?.code === 9 || firestoreError?.message?.includes('index is currently building')) {
          logger.debug('Index still building, falling back to in-memory filtering');
          
          const querySnapshot = await adminDb.collection(ENTRIES_COLLECTION).get();
          const docs: Array<{ data: () => Record<string, unknown>; id: string }> = [];
          querySnapshot.forEach((docSnap) => {
            docs.push({ data: () => docSnap.data(), id: docSnap.id });
          });
          
          // Use helper to filter and transform (handles contentType and deleted filtering)
          entries = transformEntryDocs(docs, contentType);
          
          // Sort by date (newest first) in memory
          entries = sortEntriesByDate(entries);
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
      const docs: Array<{ data: () => Record<string, unknown>; id: string }> = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        // Safety check: filter out deleted entries even if query should have filtered them
        if (data.isDeleted === true) {
          return;
        }
        docs.push({ data: () => data, id: docSnap.id });
      });
      
      // Transform documents
      entries = docs.map((docSnap) => transformEntryDoc(docSnap.data()!, docSnap.id));
    }

    logger.debug('Entries fetched', { count: entries.length });
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

    const cleanedUpdates = removeUndefined(updates as unknown as Record<string, unknown>);

    const timestampFactory = await createTimestampFactoryAsync();
    const updateData = prepareEntryUpdateData(cleanedUpdates, timestampFactory);

    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      await adminDb.collection(ENTRIES_COLLECTION).doc(id).update(updateData);
    } else {
      const db = getFirestoreInstance();
      const docRef = doc(db, ENTRIES_COLLECTION, id);
      await updateDoc(docRef, updateData);
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

    const timestampFactory = await createTimestampFactoryAsync();
    const deleteData = prepareDeleteData(timestampFactory);

    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      await adminDb.collection(ENTRIES_COLLECTION).doc(id).update(deleteData);
    } else {
      const db = getFirestoreInstance();
      const docRef = doc(db, ENTRIES_COLLECTION, id);
      await updateDoc(docRef, deleteData);
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

