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
import { Post, CreatePost } from '@/types/post';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import type { Firestore as AdminFirestore } from 'firebase-admin/firestore';
import type { Firestore as ClientFirestore } from 'firebase/firestore';

const POSTS_COLLECTION = 'posts';
const logger = createComponentLogger('postService');

/**
 * Remove undefined values from an object (Firestore doesn't allow undefined)
 */
function removeUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined)
  ) as Partial<T>;
}

/**
 * Convert Firestore timestamp to ISO string
 * Handles both client SDK Timestamp and Admin SDK Timestamp
 */
interface TimestampLike {
  toDate?: () => Date;
}
function timestampToIso(timestamp: Timestamp | TimestampLike | string | Date | undefined): string {
  if (!timestamp) return new Date().toISOString();
  if (typeof timestamp === 'string') return timestamp;
  // Handle both client SDK (has toDate method) and Admin SDK (has toDate method or is already a Date)
  if ('toDate' in timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toISOString();
  }
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  return new Date().toISOString();
}

/**
 * Create a new post in Firestore
 * Uses Admin SDK on server-side, Client SDK on client-side
 */
export async function createPost(postData: CreatePost): Promise<string> {
  try {
    logger.info('Creating post', { slug: postData.slug, title: postData.title });

    const cleanedData = removeUndefined(postData as unknown as Record<string, unknown>);
    
    // Use Admin SDK on server-side, Client SDK on client-side
    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      const adminTimestamp = getAdminTimestamp();
      
      // Convert date string to Timestamp for proper sorting (Admin SDK)
      const dateValue = cleanedData.date;
      const dateTimestamp = dateValue && typeof dateValue === 'string'
        ? adminTimestamp.fromDate(new Date(dateValue))
        : adminTimestamp.now();
      
      const docRef = await adminDb.collection(POSTS_COLLECTION).add({
        ...cleanedData,
        date: dateTimestamp, // Store as Timestamp for querying/sorting
        dateString: cleanedData.date, // Keep string version for display
        published: cleanedData.published ?? true,
        createdAt: adminTimestamp.now(),
        updatedAt: adminTimestamp.now(),
      });
      logger.info('Post created', { id: docRef.id, slug: postData.slug });
      return docRef.id;
    } else {
      const db = getFirestoreInstance();
      
      // Convert date string to Timestamp for proper sorting (Client SDK)
      const dateValue = cleanedData.date;
      const dateTimestamp = dateValue && typeof dateValue === 'string'
        ? Timestamp.fromDate(new Date(dateValue))
        : Timestamp.now();
      
      const docRef = await addDoc(collection(db, POSTS_COLLECTION), {
        ...cleanedData,
        date: dateTimestamp, // Store as Timestamp for querying/sorting
        dateString: cleanedData.date, // Keep string version for display
        published: cleanedData.published ?? true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
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

    const db = getFirestoreInstance();
    const docRef = doc(db, POSTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      logger.info('Post not found', { id });
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      title: data.title,
      content: data.content,
      date: timestampToIso(data.date as Timestamp | string),
      slug: data.slug,
      excerpt: data.excerpt,
      createdAt: timestampToIso(data.createdAt),
      updatedAt: timestampToIso(data.updatedAt),
      createdByDiscordId: data.createdByDiscordId ?? null,
      createdByName: data.createdByName,
      published: data.published ?? true,
    };
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
    // Use dateString if available (for backward compatibility), otherwise convert timestamp
    const dateValue = data.dateString || timestampToIso(data.date as Timestamp | string);
    
    return {
      id: docSnap.id,
      title: data.title,
      content: data.content,
      date: dateValue,
      slug: data.slug,
      excerpt: data.excerpt,
      createdAt: timestampToIso(data.createdAt),
      updatedAt: timestampToIso(data.updatedAt),
      createdByDiscordId: data.createdByDiscordId ?? null,
      createdByName: data.createdByName,
      published: data.published ?? true,
    };
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

    const posts: Post[] = [];

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

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          // Use dateString if available (for backward compatibility), otherwise convert timestamp
          const dateValue = data.dateString || timestampToIso(data.date);
          
          posts.push({
            id: docSnap.id,
            title: data.title,
            content: data.content,
            date: dateValue,
            slug: data.slug,
            excerpt: data.excerpt,
            createdAt: timestampToIso(data.createdAt),
            updatedAt: timestampToIso(data.updatedAt),
            createdByDiscordId: data.createdByDiscordId ?? null,
            createdByName: data.createdByName,
            published: data.published ?? true,
          });
        });
      } catch (error: unknown) {
        // If index is still building, fall back to fetching all and filtering in memory
        const firestoreError = error as { code?: number; message?: string };
        if (firestoreError?.code === 9 || firestoreError?.message?.includes('index is currently building')) {
          logger.info('Index still building, falling back to in-memory filtering');
          
          const querySnapshot = await adminDb.collection(POSTS_COLLECTION).get();

          querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            
            // Filter unpublished posts if needed
            if (!includeUnpublished && data.published !== true) {
              return;
            }
            
            // Use dateString if available (for backward compatibility), otherwise convert timestamp
            const dateValue = data.dateString || timestampToIso(data.date);
            
            posts.push({
              id: docSnap.id,
              title: data.title,
              content: data.content,
              date: dateValue,
              slug: data.slug,
              excerpt: data.excerpt,
              createdAt: timestampToIso(data.createdAt),
              updatedAt: timestampToIso(data.updatedAt),
              createdByDiscordId: data.createdByDiscordId ?? null,
              createdByName: data.createdByName,
              published: data.published ?? true,
            });
          });
          
          // Sort by date (newest first) in memory
          posts.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return dateB - dateA; // Descending order
          });
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

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        // Use dateString if available (for backward compatibility), otherwise convert timestamp
        const dateValue = data.dateString || timestampToIso(data.date as Timestamp | string);
        
        posts.push({
          id: docSnap.id,
          title: data.title,
          content: data.content,
          date: dateValue,
          slug: data.slug,
          excerpt: data.excerpt,
          createdAt: timestampToIso(data.createdAt),
          updatedAt: timestampToIso(data.updatedAt),
          createdByDiscordId: data.createdByDiscordId ?? null,
          createdByName: data.createdByName,
          published: data.published ?? true,
        });
      });
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
      
      await adminDb.collection(POSTS_COLLECTION).doc(id).update({
        ...updateData,
        updatedAt: adminTimestamp.now(),
      });
    } else {
      const db = getFirestoreInstance();
      const docRef = doc(db, POSTS_COLLECTION, id);
      
      if (cleanedUpdates.date) {
        updateData.date = Timestamp.fromDate(new Date(cleanedUpdates.date));
        updateData.dateString = cleanedUpdates.date; // Keep string version
      }
      
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: Timestamp.now(),
      });
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

    // Use Admin SDK on server-side, Client SDK on client-side
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

