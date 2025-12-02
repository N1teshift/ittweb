import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { getFirestoreInstance } from '@/features/infrastructure/api/firebase';
import { getFirestoreAdmin, isServerSide } from '@/features/infrastructure/api/firebase/admin';
import { Post, CreatePost } from '@/types/post';
import { createComponentLogger } from '@/features/infrastructure/logging';
import {
  transformPostDoc,
  preparePostDataForFirestore,
  preparePostUpdateData,
  transformPostDocs,
  sortPostsByDate,
} from './postService.helpers';
import { createFirestoreCrudService } from '@/features/infrastructure/api/firebase/firestoreCrudService';
import { queryWithIndexFallback } from '@/features/infrastructure/api/firebase/queryWithIndexFallback';
import { withServiceOperationNullable } from '@/features/infrastructure/utils/serviceOperationWrapper';

const POSTS_COLLECTION = 'posts';
const logger = createComponentLogger('postService');

// Create base CRUD service
const baseService = createFirestoreCrudService<Post, CreatePost, Partial<CreatePost>>({
  collectionName: POSTS_COLLECTION,
  componentName: 'postService',
  transformDoc: transformPostDoc,
  prepareForFirestore: preparePostDataForFirestore,
  prepareUpdate: preparePostUpdateData,
  transformDocs: (docs, filters?: unknown) => {
    const includeUnpublished = filters as boolean | undefined;
    return transformPostDocs(docs, includeUnpublished ?? false);
  },
  sortEntities: sortPostsByDate,
});

/**
 * Create a new post in Firestore
 * Uses Admin SDK on server-side, Client SDK on client-side
 */
export async function createPost(postData: CreatePost): Promise<string> {
  logger.info('Creating post', { slug: postData.slug, title: postData.title });
  return baseService.create(postData);
}

/**
 * Get a post by ID
 */
export async function getPostById(id: string): Promise<Post | null> {
  return baseService.getById(id);
}

/**
 * Get a post by slug
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  return withServiceOperationNullable(
    'getPostBySlug',
    'postService',
    async () => {
      logger.info('Fetching post by slug', { slug });

      const db = getFirestoreInstance();
      const q = query(
        collection(db, POSTS_COLLECTION),
        where('slug', '==', slug),
        where('published', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        logger.info('Post not found', { slug });
        return null;
      }

      const docSnap = querySnapshot.docs[0];
      const data = docSnap.data();
      return transformPostDoc(data, docSnap.id);
    },
    { context: { slug } }
  );
}

/**
 * Get all published posts, sorted by date (newest first)
 * Uses Admin SDK on server-side, Client SDK on client-side
 */
export async function getAllPosts(includeUnpublished: boolean = false): Promise<Post[]> {
  logger.info('Fetching all posts', { includeUnpublished });

  if (isServerSide()) {
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
  } else {
    // Client-side
    const db = getFirestoreInstance();
    let q = query(
      collection(db, POSTS_COLLECTION),
      orderBy('date', 'desc')
    );

    if (!includeUnpublished) {
      q = query(q, where('published', '==', true));
    }

    const querySnapshot = await getDocs(q);
    const docs: Array<{ data: () => Record<string, unknown>; id: string }> = [];
    querySnapshot.forEach((docSnap) => {
      docs.push({ data: () => docSnap.data(), id: docSnap.id });
    });
    
    return docs.map((docSnap) => transformPostDoc(docSnap.data()!, docSnap.id));
  }
}

/**
 * Get the latest published post
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

/**
 * Update a post
 * Uses Admin SDK on server-side, Client SDK on client-side
 */
export async function updatePost(id: string, updates: Partial<CreatePost>): Promise<void> {
  return baseService.update(id, updates);
}

/**
 * Delete a post
 * Uses Admin SDK on server-side, Client SDK on client-side
 */
export async function deletePost(id: string): Promise<void> {
  return baseService.delete(id);
}


