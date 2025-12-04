/**
 * Generic Firestore CRUD Service Factory
 * 
 * Provides a reusable abstraction for creating Firestore CRUD services that work
 * seamlessly with both Admin SDK (server-side) and Client SDK (client-side).
 * 
 * This eliminates the boilerplate code duplicated across service files like
 * postService.ts and entryService.ts.
 */

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { getFirestoreInstance } from './firebaseClient';
import { getFirestoreAdmin, isServerSide } from './admin';
import { getDocument } from './firestoreHelpers';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import { createTimestampFactoryAsync, type TimestampFactory } from '@/features/infrastructure/utils';

/**
 * Configuration for creating a Firestore CRUD service
 */
export interface FirestoreCrudServiceConfig<TEntity, TCreate, TUpdate> {
  /** Collection name in Firestore */
  collectionName: string;
  /** Component name for logging */
  componentName: string;
  /** Transform Firestore document to entity type */
  transformDoc: (data: Record<string, unknown>, docId: string) => TEntity;
  /** Prepare create data for Firestore */
  prepareForFirestore: (data: TCreate, timestampFactory: TimestampFactory) => Record<string, unknown>;
  /** Prepare update data for Firestore */
  prepareUpdate: (updates: TUpdate, timestampFactory: TimestampFactory) => Record<string, unknown>;
  /** Optional: Prepare soft delete data (for soft deletes) */
  prepareDelete?: (timestampFactory: TimestampFactory) => Record<string, unknown>;
  /** Optional: Transform and filter documents for list operations */
  transformDocs?: (
    docs: Array<{ data: () => Record<string, unknown>; id: string }>,
    filters?: unknown
  ) => TEntity[];
  /** Optional: Sort entities (for in-memory sorting when index fallback is used) */
  sortEntities?: (entities: TEntity[]) => TEntity[];
}

/**
 * Query options for getAll operations
 */
export interface GetAllOptions {
  /** Optional filter function for in-memory filtering (used in index fallback) */
  fallbackFilter?: (docs: Array<{ data: () => Record<string, unknown>; id: string }>) => Array<{ data: () => Record<string, unknown>; id: string }>;
}

/**
 * Firestore CRUD service interface
 */
export interface FirestoreCrudService<TEntity, TCreate, TUpdate> {
  /** Create a new document */
  create: (data: TCreate) => Promise<string>;
  /** Get a document by ID */
  getById: (id: string) => Promise<TEntity | null>;
  /** Get all documents (simple - no filtering) */
  getAll: (options?: GetAllOptions) => Promise<TEntity[]>;
  /** Update a document */
  update: (id: string, updates: TUpdate) => Promise<void>;
  /** Delete a document (hard delete) */
  delete: (id: string) => Promise<void>;
  /** Soft delete a document (if prepareDelete is provided) */
  softDelete?: (id: string) => Promise<void>;
}


/**
 * Create a Firestore CRUD service
 * 
 * @example
 * ```typescript
 * const postService = createFirestoreCrudService({
 *   collectionName: 'posts',
 *   componentName: 'postService',
 *   transformDoc: transformPostDoc,
 *   prepareForFirestore: preparePostDataForFirestore,
 *   prepareUpdate: preparePostUpdateData,
 * });
 * ```
 */
export function createFirestoreCrudService<TEntity, TCreate, TUpdate>(
  config: FirestoreCrudServiceConfig<TEntity, TCreate, TUpdate>
): FirestoreCrudService<TEntity, TCreate, TUpdate> {
  const logger = createComponentLogger(config.componentName);
  const { collectionName, transformDoc, prepareForFirestore, prepareUpdate, prepareDelete, transformDocs, sortEntities } = config;

  return {
    async create(data: TCreate): Promise<string> {
      try {
        logger.info('Creating document', { collectionName });

        const timestampFactory = await createTimestampFactoryAsync();
        const firestoreData = prepareForFirestore(data, timestampFactory);

        if (isServerSide()) {
          const adminDb = getFirestoreAdmin();
          const docRef = await adminDb.collection(collectionName).add(firestoreData);
          logger.info('Document created', { id: docRef.id, collectionName });
          return docRef.id;
        } else {
          const db = getFirestoreInstance();
          const docRef = await addDoc(collection(db, collectionName), firestoreData);
          logger.info('Document created', { id: docRef.id, collectionName });
          return docRef.id;
        }
      } catch (error) {
        const err = error as Error;
        logError(err, 'Failed to create document', {
          component: config.componentName,
          operation: 'create',
          collectionName,
        });
        throw err;
      }
    },

    async getById(id: string): Promise<TEntity | null> {
      try {
        logger.debug('Fetching document by ID', { id, collectionName });

        const docSnap = await getDocument(collectionName, id);

        if (!docSnap || !docSnap.exists) {
          logger.debug('Document not found', { id, collectionName });
          return null;
        }

        const data = docSnap.data();
        if (!data) {
          logger.debug('Document data is undefined', { id, collectionName });
          return null;
        }

        return transformDoc(data, docSnap.id);
      } catch (error) {
        const err = error as Error;
        logError(err, 'Failed to fetch document by ID', {
          component: config.componentName,
          operation: 'getById',
          id,
          collectionName,
        });
        throw err;
      }
    },

    async getAll(options?: GetAllOptions): Promise<TEntity[]> {
      try {
        logger.debug('Fetching all documents', { collectionName });

        let entities: TEntity[] = [];

        if (isServerSide()) {
          const adminDb = getFirestoreAdmin();
          const snapshot = await adminDb.collection(collectionName).get();
          const docs: Array<{ data: () => Record<string, unknown>; id: string }> = [];
          snapshot.forEach((docSnap) => {
            docs.push({ data: () => docSnap.data(), id: docSnap.id });
          });
          
          // Apply fallback filter if provided
          const filteredDocs = options?.fallbackFilter ? options.fallbackFilter(docs) : docs;
          
          if (transformDocs) {
            entities = transformDocs(filteredDocs);
          } else {
            entities = filteredDocs.map((docSnap) => transformDoc(docSnap.data()!, docSnap.id));
          }
          
          if (sortEntities) {
            entities = sortEntities(entities);
          }
        } else {
          const db = getFirestoreInstance();
          const snapshot = await getDocs(collection(db, collectionName));
          const docs: Array<{ data: () => Record<string, unknown>; id: string }> = [];
          snapshot.forEach((docSnap) => {
            docs.push({ data: () => docSnap.data(), id: docSnap.id });
          });
          
          // Apply fallback filter if provided
          const filteredDocs = options?.fallbackFilter ? options.fallbackFilter(docs) : docs;
          
          if (transformDocs) {
            entities = transformDocs(filteredDocs);
          } else {
            entities = filteredDocs.map((docSnap) => transformDoc(docSnap.data()!, docSnap.id));
          }
          
          if (sortEntities) {
            entities = sortEntities(entities);
          }
        }

        logger.debug('Documents fetched', { count: entities.length, collectionName });
        return entities;
      } catch (error) {
        const err = error as Error;
        logError(err, 'Failed to fetch documents', {
          component: config.componentName,
          operation: 'getAll',
          collectionName,
        });
        throw err;
      }
    },

    async update(id: string, updates: TUpdate): Promise<void> {
      try {
        logger.info('Updating document', { id, collectionName });

        const timestampFactory = await createTimestampFactoryAsync();
        const updateData = prepareUpdate(updates, timestampFactory);

        if (isServerSide()) {
          const adminDb = getFirestoreAdmin();
          await adminDb.collection(collectionName).doc(id).update(updateData);
        } else {
          const db = getFirestoreInstance();
          const docRef = doc(db, collectionName, id);
          await updateDoc(docRef, updateData);
        }

        logger.info('Document updated', { id, collectionName });
      } catch (error) {
        const err = error as Error;
        logError(err, 'Failed to update document', {
          component: config.componentName,
          operation: 'update',
          id,
          collectionName,
        });
        throw err;
      }
    },

    async delete(id: string): Promise<void> {
      try {
        logger.info('Deleting document', { id, collectionName });

        if (isServerSide()) {
          const adminDb = getFirestoreAdmin();
          await adminDb.collection(collectionName).doc(id).delete();
        } else {
          const db = getFirestoreInstance();
          const docRef = doc(db, collectionName, id);
          await deleteDoc(docRef);
        }

        logger.info('Document deleted', { id, collectionName });
      } catch (error) {
        const err = error as Error;
        logError(err, 'Failed to delete document', {
          component: config.componentName,
          operation: 'delete',
          id,
          collectionName,
        });
        throw err;
      }
    },

    ...(prepareDelete && {
      async softDelete(id: string): Promise<void> {
        try {
          logger.info('Soft deleting document', { id, collectionName });

          const timestampFactory = await createTimestampFactoryAsync();
          const deleteData = prepareDelete(timestampFactory);

          if (isServerSide()) {
            const adminDb = getFirestoreAdmin();
            await adminDb.collection(collectionName).doc(id).update(deleteData);
          } else {
            const db = getFirestoreInstance();
            const docRef = doc(db, collectionName, id);
            await updateDoc(docRef, deleteData);
          }

          logger.info('Document soft deleted', { id, collectionName });
        } catch (error) {
          const err = error as Error;
          logError(err, 'Failed to soft delete document', {
            component: config.componentName,
            operation: 'softDelete',
            id,
            collectionName,
          });
          throw err;
        }
      },
    }),
  };
}


