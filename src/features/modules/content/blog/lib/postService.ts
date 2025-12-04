import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { getFirestoreInstance } from '@/features/infrastructure/api/firebase';
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
import { withServiceOperationNullable } from '@/features/infrastructure/utils';

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
 * @throws Error - This function is server-only. Use API routes instead.
 */
export async function getAllPosts(_includeUnpublished: boolean = false): Promise<Post[]> {
  throw new Error('getAllPosts is server-only. Use /api/posts API endpoint instead.');
}

/**
 * Get the latest published post
 * @throws Error - This function is server-only. Use API routes instead.
 */
export async function getLatestPost(): Promise<Post | null> {
  throw new Error('getLatestPost is server-only. Use /api/posts/latest API endpoint instead.');
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


