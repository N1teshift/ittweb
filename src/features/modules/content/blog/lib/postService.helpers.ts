/**
 * Helper functions for post service operations
 * Extracted to reduce code duplication between server and client paths
 */

import { Timestamp } from 'firebase/firestore';
import type { Post, CreatePost } from '@/types/post';
import { timestampToIso, type TimestampFactory, removeUndefined } from '@/features/infrastructure/utils';

/**
 * Transform Firestore document data to Post type
 */
export function transformPostDoc(data: Record<string, unknown>, docId: string): Post {
  // Use dateString if available (for backward compatibility), otherwise convert timestamp
  const dateValue = (data.dateString as string | undefined) || timestampToIso(data.date as string | Date | Timestamp | undefined);
  
  return {
    id: docId,
    title: data.title as string,
    content: data.content as string,
    date: dateValue,
    slug: data.slug as string,
    excerpt: data.excerpt as string | undefined,
    createdAt: timestampToIso(data.createdAt as string | Date | Timestamp | undefined),
    updatedAt: timestampToIso(data.updatedAt as string | Date | Timestamp | undefined),
    creatorName: (data.createdByName as string) || (data.creatorName as string) || 'Unknown',
    createdByDiscordId: (data.createdByDiscordId as string | undefined) ?? null,
    submittedAt: data.submittedAt ? timestampToIso(data.submittedAt as string | Date | Timestamp | undefined) : undefined,
    published: (data.published as boolean) ?? true,
  };
}

/**
 * Prepare post data for Firestore storage
 */
export function preparePostDataForFirestore(
  postData: CreatePost,
  timestampFactory: TimestampFactory
): Record<string, unknown> {
  const cleanedData = removeUndefined(postData as unknown as Record<string, unknown>);
  
  const dateValue = cleanedData.date;
  const dateTimestamp = dateValue && typeof dateValue === 'string'
    ? timestampFactory.fromDate(new Date(dateValue))
    : timestampFactory.now();
  
  return {
    ...cleanedData,
    creatorName: cleanedData.creatorName,
    date: dateTimestamp, // Store as Timestamp for querying/sorting
    dateString: cleanedData.date, // Keep string version for display
    ...(cleanedData.submittedAt ? { submittedAt: timestampFactory.fromDate(new Date(cleanedData.submittedAt as string)) } : {}),
    published: cleanedData.published ?? true,
    createdAt: timestampFactory.now(),
    updatedAt: timestampFactory.now(),
  };
}

/**
 * Prepare post update data for Firestore storage
 */
export function preparePostUpdateData(
  updates: Partial<CreatePost>,
  timestampFactory: TimestampFactory
): Record<string, unknown> {
  const cleanedUpdates = removeUndefined(updates as unknown as Record<string, unknown>);
  const updateData: Record<string, unknown> = {
    ...cleanedUpdates,
  };

  if (cleanedUpdates.date && typeof cleanedUpdates.date === 'string') {
    updateData.date = timestampFactory.fromDate(new Date(cleanedUpdates.date));
    updateData.dateString = cleanedUpdates.date; // Keep string version
  }
  
  updateData.updatedAt = timestampFactory.now();
  
  return updateData;
}

/**
 * Filter and transform post documents from a snapshot
 */
export function transformPostDocs(
  docs: Array<{ data: () => Record<string, unknown>; id: string }>,
  includeUnpublished: boolean = false
): Post[] {
  const posts: Post[] = [];
  
  docs.forEach((docSnap) => {
    const data = docSnap.data();
    
    // Filter unpublished posts if needed
    if (!includeUnpublished && data.published !== true) {
      return;
    }
    
    posts.push(transformPostDoc(data, docSnap.id));
  });
  
  return posts;
}

/**
 * Sort posts by date (newest first)
 */
export function sortPostsByDate(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA; // Descending order
  });
}


