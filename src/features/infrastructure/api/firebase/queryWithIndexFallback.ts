/**
 * Query Builder with Index Fallback Utility
 * 
 * Provides a helper for executing Firestore queries with automatic fallback
 * to in-memory filtering when indexes are still building.
 * 
 * This pattern is commonly needed when Firestore composite indexes are required
 * but may not be ready yet.
 */

import { getFirestoreAdmin, isServerSide } from './admin';
import { getFirestoreInstance } from './firebaseClient';
import { collection, getDocs } from 'firebase/firestore';
import { createComponentLogger } from '@/features/infrastructure/logging';

/**
 * Options for query with index fallback
 */
export interface QueryWithIndexFallbackOptions<T> {
  /** Collection name */
  collectionName: string;
  /** Build and execute the optimized query (may throw index error) */
  executeQuery: () => Promise<Array<{ data: () => Record<string, unknown>; id: string }>>;
  /** Fallback: filter all documents in memory when index is missing */
  fallbackFilter: (docs: Array<{ data: () => Record<string, unknown>; id: string }>) => Array<{ data: () => Record<string, unknown>; id: string }>;
  /** Transform documents to entities */
  transform: (docs: Array<{ data: () => Record<string, unknown>; id: string }>) => T;
  /** Optional: sort entities after transformation (for in-memory sorting) */
  sort?: (entities: T) => T;
  /** Logger instance */
  logger: ReturnType<typeof createComponentLogger>;
}

/**
 * Execute a query with automatic index fallback
 * 
 * If the query fails due to a missing index (error code 9), it falls back to
 * fetching all documents and filtering in memory.
 * 
 * @example
 * ```typescript
 * const posts = await queryWithIndexFallback({
 *   collectionName: 'posts',
 *   executeQuery: async () => {
 *     const snapshot = await adminDb.collection('posts')
 *       .where('published', '==', true)
 *       .orderBy('date', 'desc')
 *       .get();
 *     const docs = [];
 *     snapshot.forEach(doc => docs.push({ data: () => doc.data(), id: doc.id }));
 *     return docs;
 *   },
 *   fallbackFilter: (docs) => docs.filter(d => d.data().published === true),
 *   transform: (docs) => docs.map(d => transformPostDoc(d.data(), d.id)),
 *   sort: (posts) => sortPostsByDate(posts),
 *   logger,
 * });
 * ```
 */
export async function queryWithIndexFallback<T>(
  options: QueryWithIndexFallbackOptions<T>
): Promise<T> {
  const { collectionName, executeQuery, fallbackFilter, transform, sort, logger } = options;

  try {
    const docs = await executeQuery();
    const result = transform(docs);
    return sort ? sort(result) : result;
  } catch (error: unknown) {
    const firestoreError = error as { code?: number | string; message?: string };
    
    // Check if error is due to missing index
    // Admin SDK uses numeric code 9, Client SDK uses string 'failed-precondition'
    const isIndexError = 
      firestoreError?.code === 9 || 
      firestoreError?.code === 'failed-precondition' ||
      firestoreError?.message?.includes('index') ||
      firestoreError?.message?.includes('index is currently building');
    
    if (isIndexError) {
      logger.info('Index still building, falling back to in-memory filtering', { collectionName });
      
      // Fallback: fetch all documents
      const allDocs: Array<{ data: () => Record<string, unknown>; id: string }> = [];
      
      if (isServerSide()) {
        const adminDb = getFirestoreAdmin();
        const snapshot = await adminDb.collection(collectionName).get();
        snapshot.forEach((docSnap) => {
          allDocs.push({ data: () => docSnap.data(), id: docSnap.id });
        });
      } else {
        const db = getFirestoreInstance();
        const snapshot = await getDocs(collection(db, collectionName));
        snapshot.forEach((docSnap) => {
          allDocs.push({ data: () => docSnap.data(), id: docSnap.id });
        });
      }
      
      // Apply fallback filter
      const filteredDocs = fallbackFilter(allDocs);
      
      // Transform and sort
      const result = transform(filteredDocs);
      return sort ? sort(result) : result;
    }
    
    // Re-throw if it's a different error
    throw error;
  }
}


