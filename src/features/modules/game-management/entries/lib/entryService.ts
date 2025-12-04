import { Entry, CreateEntry, UpdateEntry } from '@/types/entry';
import { createComponentLogger } from '@/features/infrastructure/logging';
import { removeUndefined } from '@/features/infrastructure/utils';
import {
  transformEntryDoc,
  prepareEntryDataForFirestore,
  prepareEntryUpdateData,
  prepareDeleteData,
  transformEntryDocs,
  sortEntriesByDate,
} from './entryService.helpers';
import { createFirestoreCrudService } from '@/features/infrastructure/api/firebase/firestoreCrudService';

const ENTRIES_COLLECTION = 'entries';
const logger = createComponentLogger('entryService');

// Create base CRUD service with soft delete support
const baseService = createFirestoreCrudService<Entry, CreateEntry, UpdateEntry>({
  collectionName: ENTRIES_COLLECTION,
  componentName: 'entryService',
  transformDoc: transformEntryDoc,
  prepareForFirestore: prepareEntryDataForFirestore,
  prepareUpdate: (updates: UpdateEntry, timestampFactory) => {
    return prepareEntryUpdateData(updates as Record<string, unknown>, timestampFactory);
  },
  prepareDelete: prepareDeleteData,
  transformDocs: (docs, filters?: unknown) => {
    const contentType = filters as 'post' | 'memory' | undefined;
    return transformEntryDocs(docs, contentType);
  },
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
 * @throws Error - This function is server-only. Use API routes instead.
 */
export async function getAllEntries(_contentType?: 'post' | 'memory'): Promise<Entry[]> {
  throw new Error('getAllEntries is server-only. Use /api/entries API endpoint instead.');
}

/**
 * Get the latest entry
 * @throws Error - This function is server-only. Use API routes instead.
 */
export async function getLatestEntry(_contentType?: 'post' | 'memory'): Promise<Entry | null> {
  throw new Error('getLatestEntry is server-only. Use /api/entries/latest API endpoint instead.');
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


