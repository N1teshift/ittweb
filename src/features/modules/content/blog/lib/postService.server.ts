/**
 * Post Service - Server-Only Operations
 * 
 * Server-only functions for post services.
 * These functions use Firebase Admin SDK and should only be used in API routes.
 */

import { getFirestoreAdmin } from '@/features/infrastructure/api/firebase/admin';
import { Post } from '@/types/post';
import { createComponentLogger } from '@/features/infrastructure/logging';
import {
  transformPostDoc,
  sortPostsByDate,
} from './postService.helpers';
import { queryWithIndexFallback } from '@/features/infrastructure/api/firebase/queryWithIndexFallback';
import { withServiceOperationNullable } from '@/features/infrastructure/utils';

const POSTS_COLLECTION = 'posts';
const logger = createComponentLogger('postService');

/**
 * Get all published posts, sorted by date (newest first) (Server-Only)
 */
export async function getAllPosts(includeUnpublished: boolean = false): Promise<Post[]> {
  logger.info('Fetching all posts', { includeUnpublished });

  const adminDb = getFirestoreAdmin();
  
  return queryWithIndexFallback({
    collectionName: POSTS_COLLECTION,
    executeQuery: async () => {
      let adminQuery: ReturnType<typeof adminDb.collection> | ReturnType<ReturnType<typeof adminDb.collection>['where']> = adminDb.collection(POSTS_COLLECTION);

      if (!includeUnpublished) {
        adminQuery = adminQuery.where('published', '==', true) as ReturnType<ReturnType<typeof adminDb.collection>['where']>;
      }
      
      adminQuery = adminQuery.orderBy('date', 'desc') as ReturnType<ReturnType<ReturnType<typeof adminDb.collection>['where']>['orderBy']>;
      const querySnapshot = await adminQuery.get();

      const docs: Array<{ data: () => Record<string, unknown>; id: string }> = [];
      querySnapshot.forEach((docSnap) => {
        docs.push({ data: () => docSnap.data(), id: docSnap.id });
      });
      return docs;
    },
    fallbackFilter: (docs) => {
      // Filter in memory when index is missing
      return docs.filter((doc) => {
        const data = doc.data();
        return includeUnpublished || data.published === true;
      });
    },
    transform: (docs) => docs.map((docSnap) => transformPostDoc(docSnap.data()!, docSnap.id)),
    sort: sortPostsByDate,
    logger,
  });
}

/**
 * Get the latest published post (Server-Only)
 */
export async function getLatestPost(): Promise<Post | null> {
  return withServiceOperationNullable(
    'getLatestPost',
    'postService',
    async () => {
      const posts = await getAllPosts(false);
      return posts.length > 0 ? posts[0] : null;
    }
  );
}
