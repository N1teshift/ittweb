import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { getFirestoreInstance } from '@/features/infrastructure/api/firebase';
import { getFirestoreAdmin, isServerSide } from '@/features/infrastructure/api/firebase/admin';
import { Post, CreatePost } from '@/types/post';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import { createTimestampFactoryAsync } from '@/features/infrastructure/utils/timestampUtils';
import {
  transformPostDoc,
  preparePostDataForFirestore,
  preparePostUpdateData,
  transformPostDocs,
  sortPostsByDate,
} from './postService.helpers';
import { getDocument } from '@/features/infrastructure/api/firebase/firestoreHelpers';

const POSTS_COLLECTION = 'posts';
const logger = createComponentLogger('postService');

/**
 * Create a new post in Firestore
 * Uses Admin SDK on server-side, Client SDK on client-side
 */
export async function createPost(postData: CreatePost): Promise<string> {
  try {
    logger.info('Creating post', { slug: postData.slug, title: postData.title });

    const timestampFactory = await createTimestampFactoryAsync();
    const firestoreData = preparePostDataForFirestore(postData, timestampFactory);

    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      const docRef = await adminDb.collection(POSTS_COLLECTION).add(firestoreData);
      logger.info('Post created', { id: docRef.id, slug: postData.slug });
      return docRef.id;
    } else {
      const db = getFirestoreInstance();
      const docRef = await addDoc(collection(db, POSTS_COLLECTION), firestoreData);
      logger.info('Post created', { id: docRef.id, slug: postData.slug });
      return docRef.id;
    }
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to create post', {
      component: 'postService',
      operation: 'createPost',
      slug: postData.slug,
    });
    throw err;
  }
}

/**
 * Get a post by ID
 */
export async function getPostById(id: string): Promise<Post | null> {
  try {
    logger.info('Fetching post by ID', { id });

    const docSnap = await getDocument(POSTS_COLLECTION, id);

    if (!docSnap || !docSnap.exists) {
      logger.info('Post not found', { id });
      return null;
    }

    const data = docSnap.data();
    if (!data) {
      logger.info('Post data is undefined', { id });
      return null;
    }

    return transformPostDoc(data, docSnap.id);
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to fetch post by ID', {
      component: 'postService',
      operation: 'getPostById',
      id,
    });
    throw err;
  }
}

/**
 * Get a post by slug
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
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
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to fetch post by slug', {
      component: 'postService',
      operation: 'getPostBySlug',
      slug,
    });
    throw err;
  }
}

/**
 * Get all published posts, sorted by date (newest first)
 * Uses Admin SDK on server-side, Client SDK on client-side
 */
export async function getAllPosts(includeUnpublished: boolean = false): Promise<Post[]> {
  try {
    logger.info('Fetching all posts', { includeUnpublished });

    let posts: Post[] = [];

    // Use Admin SDK on server-side, Client SDK on client-side
    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      
      // Try to use the optimized query first, but fall back to in-memory filtering
      // if the index is still building
      try {
        let adminQuery: ReturnType<typeof adminDb.collection> | ReturnType<ReturnType<typeof adminDb.collection>['where']> = adminDb.collection(POSTS_COLLECTION);

        if (!includeUnpublished) {
          adminQuery = adminQuery.where('published', '==', true) as ReturnType<ReturnType<typeof adminDb.collection>['where']>;
        }
        
        adminQuery = adminQuery.orderBy('date', 'desc') as ReturnType<ReturnType<ReturnType<typeof adminDb.collection>['where']>['orderBy']>;
        const querySnapshot = await adminQuery.get();

        // Transform documents (query already filters, so no need for additional filtering)
        const docs: Array<{ data: () => Record<string, unknown>; id: string }> = [];
        querySnapshot.forEach((docSnap) => {
          docs.push({ data: () => docSnap.data(), id: docSnap.id });
        });
        posts = docs.map((docSnap) => transformPostDoc(docSnap.data()!, docSnap.id));
      } catch (error: unknown) {
        // If index is still building, fall back to fetching all and filtering in memory
        const firestoreError = error as { code?: number; message?: string };
        if (firestoreError?.code === 9 || firestoreError?.message?.includes('index is currently building')) {
          logger.info('Index still building, falling back to in-memory filtering');
          
          const querySnapshot = await adminDb.collection(POSTS_COLLECTION).get();
          const docs: Array<{ data: () => Record<string, unknown>; id: string }> = [];
          querySnapshot.forEach((docSnap) => {
            docs.push({ data: () => docSnap.data(), id: docSnap.id });
          });
          
          // Use helper to filter and transform (handles published filtering)
          posts = transformPostDocs(docs, includeUnpublished);
          
          // Sort by date (newest first) in memory
          posts = sortPostsByDate(posts);
        } else {
          // Re-throw if it's a different error
          throw error;
        }
      }
    } else {
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
      
      // Transform documents (query already filters, so no need for additional filtering)
      posts = docs.map((docSnap) => transformPostDoc(docSnap.data()!, docSnap.id));
    }

    logger.info('Posts fetched', { count: posts.length });
    return posts;
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to fetch posts', {
      component: 'postService',
      operation: 'getAllPosts',
    });
    throw err;
  }
}

/**
 * Get the latest published post
 */
export async function getLatestPost(): Promise<Post | null> {
  try {
    const posts = await getAllPosts(false);
    return posts.length > 0 ? posts[0] : null;
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to fetch latest post', {
      component: 'postService',
      operation: 'getLatestPost',
    });
    throw err;
  }
}

/**
 * Update a post
 * Uses Admin SDK on server-side, Client SDK on client-side
 */
export async function updatePost(id: string, updates: Partial<CreatePost>): Promise<void> {
  try {
    logger.info('Updating post', { id });

    const timestampFactory = await createTimestampFactoryAsync();
    const updateData = preparePostUpdateData(updates, timestampFactory);

    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      await adminDb.collection(POSTS_COLLECTION).doc(id).update(updateData);
    } else {
      const db = getFirestoreInstance();
      const docRef = doc(db, POSTS_COLLECTION, id);
      await updateDoc(docRef, updateData);
    }

    logger.info('Post updated', { id });
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to update post', {
      component: 'postService',
      operation: 'updatePost',
      id,
    });
    throw err;
  }
}

/**
 * Delete a post
 * Uses Admin SDK on server-side, Client SDK on client-side
 */
export async function deletePost(id: string): Promise<void> {
  try {
    logger.info('Deleting post', { id });

    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      await adminDb.collection(POSTS_COLLECTION).doc(id).delete();
    } else {
      const db = getFirestoreInstance();
      const docRef = doc(db, POSTS_COLLECTION, id);
      await deleteDoc(docRef);
    }

    logger.info('Post deleted', { id });
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to delete post', {
      component: 'postService',
      operation: 'deletePost',
      id,
    });
    throw err;
  }
}

