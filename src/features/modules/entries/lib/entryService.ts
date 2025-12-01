import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { getFirestoreInstance } from '@/features/infrastructure/api/firebase';
import { getFirestoreAdmin, isServerSide } from '@/features/infrastructure/api/firebase/admin';
import { Entry, CreateEntry, UpdateEntry } from '@/types/entry';
import { createComponentLogger } from '@/features/infrastructure/logging';
import { withServiceOperationNullable } from '@/features/infrastructure/utils/serviceOperationWrapper';
import { removeUndefined } from '@/features/infrastructure/utils/objectUtils';
import {
  transformEntryDoc,
  prepareEntryDataForFirestore,
  prepareEntryUpdateData,
  prepareDeleteData,
  transformEntryDocs,
  sortEntriesByDate,
} from './entryService.helpers';
import { createFirestoreCrudService } from '@/features/infrastructure/api/firebase/firestoreCrudService';
import { queryWithIndexFallback } from '@/features/infrastructure/api/firebase/queryWithIndexFallback';

const ENTRIES_COLLECTION = 'entries';
const logger = createComponentLogger('entryService');

// Create base CRUD service with soft delete support
const baseService = createFirestoreCrudService<Entry, CreateEntry, UpdateEntry>({
  collectionName: ENTRIES_COLLECTION,
  componentName: 'entryService',
  transformDoc: transformEntryDoc,
  prepareForFirestore: prepareEntryDataForFirestore,
  prepareUpdate: prepareEntryUpdateData,
  prepareDelete: prepareDeleteData,
  transformDocs: transformEntryDocs,
  sortEntities: sortEntriesByDate,
});

/**
 * Create a new entry in Firestore
 * Uses Admin SDK on server-side, Client SDK on client-side
 */
export async function createEntry(entryData: CreateEntry): Promise<string> {
  logger.info('Creating entry', { contentType: entryData.contentType, title: entryData.title });
  return baseService.create(entryData);
}

/**
 * Get an entry by ID
 */
export async function getEntryById(id: string): Promise<Entry | null> {
  return baseService.getById(id);
}

/**
 * Get all entries, sorted by date (newest first)
 * Uses Admin SDK on server-side, Client SDK on client-side
 */
export async function getAllEntries(contentType?: 'post' | 'memory'): Promise<Entry[]> {
  logger.debug('Fetching all entries', { contentType });

  if (isServerSide()) {
    const adminDb = getFirestoreAdmin();
    
    return queryWithIndexFallback({
      collectionName: ENTRIES_COLLECTION,
      executeQuery: async () => {
        let adminQuery: ReturnType<typeof adminDb.collection> | ReturnType<ReturnType<typeof adminDb.collection>['where']> = adminDb.collection(ENTRIES_COLLECTION);

        // Filter by contentType if provided
        if (contentType) {
          adminQuery = adminQuery.where('contentType', '==', contentType) as ReturnType<ReturnType<typeof adminDb.collection>['where']>;
        }
        
        // Filter out deleted entries
        adminQuery = adminQuery.where('isDeleted', '==', false) as ReturnType<ReturnType<ReturnType<typeof adminDb.collection>['where']>['where']>;
        
        adminQuery = adminQuery.orderBy('date', 'desc') as ReturnType<ReturnType<ReturnType<ReturnType<typeof adminDb.collection>['where']>['where']>['orderBy']>;
        const querySnapshot = await adminQuery.get();

        const docs: Array<{ data: () => Record<string, unknown>; id: string }> = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          // Safety check: filter out deleted entries even if query should have filtered them
          if (data.isDeleted === true) {
            return;
          }
          docs.push({ data: () => data, id: docSnap.id });
        });
        return docs;
      },
      fallbackFilter: (docs) => {
        // Filter in memory when index is missing
        return docs.filter((doc) => {
          const data = doc.data();
          // Always filter out deleted entries
          if (data.isDeleted === true) {
            return false;
          }
          // Filter by contentType if provided
          if (contentType && data.contentType !== contentType) {
            return false;
          }
          return true;
        });
      },
      transform: (docs) => transformEntryDocs(docs, contentType),
      sort: sortEntriesByDate,
      logger,
    });
  } else {
    // Client-side
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
    
    return docs.map((docSnap) => transformEntryDoc(docSnap.data()!, docSnap.id));
  }
}

/**
 * Get the latest entry
 */
export async function getLatestEntry(contentType?: 'post' | 'memory'): Promise<Entry | null> {
  return withServiceOperationNullable(
    'getLatestEntry',
    'entryService',
    async () => {
      const entries = await getAllEntries(contentType);
      return entries.length > 0 ? entries[0] : null;
    },
    { context: { contentType } }
  );
}

/**
 * Update an entry
 * Uses Admin SDK on server-side, Client SDK on client-side
 */
export async function updateEntry(id: string, updates: UpdateEntry): Promise<void> {
  logger.info('Updating entry', { id });
  
  // Remove undefined values before updating
  const cleanedUpdates = removeUndefined(updates as unknown as Record<string, unknown>) as UpdateEntry;
  
  return baseService.update(id, cleanedUpdates);
}

/**
 * Delete an entry (soft delete)
 * Uses Admin SDK on server-side, Client SDK on client-side
 */
export async function deleteEntry(id: string): Promise<void> {
  if (!baseService.softDelete) {
    throw new Error('Soft delete not configured for entryService');
  }
  return baseService.softDelete(id);
}

