import { Timestamp } from 'firebase-admin/firestore';
import { getAdminFirestore } from '@/features/infrastructure/api/firebase/firebaseAdmin';
import { Post, CreatePost } from '@/types/post';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';

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
 */
function timestampToIso(timestamp: Timestamp | string | undefined): string {
  if (!timestamp) return new Date().toISOString();
  if (typeof timestamp === 'string') return timestamp;
  return timestamp.toDate().toISOString();
}

/**
 * Create a new post in Firestore
 */
export async function createPost(postData: CreatePost): Promise<string> {
  try {
    logger.info('Creating post', { slug: postData.slug, title: postData.title });

    const db = getAdminFirestore();
    const cleanedData = removeUndefined(postData);
    
    // Convert date string to Timestamp for proper sorting
    const dateTimestamp = cleanedData.date 
      ? Timestamp.fromDate(new Date(cleanedData.date))
      : Timestamp.now();
    
    const docRef = await db.collection(POSTS_COLLECTION).add({
      ...cleanedData,
      date: dateTimestamp, // Store as Timestamp for querying/sorting
      dateString: cleanedData.date, // Keep string version for display
      published: cleanedData.published ?? true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    logger.info('Post created', { id: docRef.id, slug: postData.slug });
    return docRef.id;
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

    const db = getAdminFirestore();
    const docRef = db.collection(POSTS_COLLECTION).doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      logger.info('Post not found', { id });
      return null;
    }

    const data = docSnap.data() as Record<string, any>;
    return {
      id: docRef.id,
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

    const db = getAdminFirestore();
    const querySnapshot = await db
      .collection(POSTS_COLLECTION)
      .where('slug', '==', slug)
      .where('published', '==', true)
      .limit(1)
      .get();
    
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
 */
export async function getAllPosts(includeUnpublished: boolean = false): Promise<Post[]> {
  try {
    logger.info('Fetching all posts', { includeUnpublished });

    const db = getAdminFirestore();
    let queryBuilder = db.collection(POSTS_COLLECTION).orderBy('date', 'desc');

    if (!includeUnpublished) {
      queryBuilder = queryBuilder.where('published', '==', true);
    }

    const querySnapshot = await queryBuilder.get();
    const posts: Post[] = [];

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
 */
export async function updatePost(id: string, updates: Partial<CreatePost>): Promise<void> {
  try {
    logger.info('Updating post', { id });

    const db = getAdminFirestore();
    const docRef = db.collection(POSTS_COLLECTION).doc(id);
    const cleanedUpdates = removeUndefined(updates);

    // Convert date string to Timestamp if date is being updated
    const updateData: Record<string, unknown> = {
      ...cleanedUpdates,
      updatedAt: Timestamp.now(),
    };

    if (cleanedUpdates.date) {
      updateData.date = Timestamp.fromDate(new Date(cleanedUpdates.date));
      updateData.dateString = cleanedUpdates.date; // Keep string version
    }

    await docRef.update(updateData);

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
 */
export async function deletePost(id: string): Promise<void> {
  try {
    logger.info('Deleting post', { id });

    const db = getAdminFirestore();
    const docRef = db.collection(POSTS_COLLECTION).doc(id);
    await docRef.delete();

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

