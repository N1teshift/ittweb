/**
 * Helper functions for entry service operations
 * Extracted to reduce code duplication between server and client paths
 */

import { Timestamp } from 'firebase/firestore';
import type { Entry, CreateEntry } from '@/types/entry';
import { timestampToIso, type TimestampFactory, removeUndefined } from '@/features/infrastructure/utils';

/**
 * Transform Firestore document data to Entry type
 */
export function transformEntryDoc(data: Record<string, unknown>, docId: string): Entry {
  const dateValue = (data.dateString as string | undefined) || timestampToIso(data.date as string | Date | Timestamp | undefined);
  
  return {
    id: docId,
    title: data.title as string,
    content: data.content as string,
    contentType: data.contentType as Entry['contentType'],
    date: dateValue,
    creatorName: (data.creatorName as string) || 'Unknown',
    createdByDiscordId: (data.createdByDiscordId as string | undefined) ?? null,
    createdAt: timestampToIso(data.createdAt as string | Date | Timestamp | undefined),
    updatedAt: timestampToIso(data.updatedAt as string | Date | Timestamp | undefined),
    submittedAt: data.submittedAt ? timestampToIso(data.submittedAt as string | Date | Timestamp | undefined) : undefined,
    images: data.images as Entry['images'],
    videoUrl: data.videoUrl as string | undefined,
    twitchClipUrl: data.twitchClipUrl as string | undefined,
    sectionOrder: data.sectionOrder as Entry['sectionOrder'],
    isDeleted: (data.isDeleted as boolean) ?? false,
    deletedAt: data.deletedAt ? timestampToIso(data.deletedAt as string | Date | Timestamp | undefined) : null,
  };
}

/**
 * Prepare entry data for Firestore storage
 */
export function prepareEntryDataForFirestore(
  entryData: CreateEntry,
  timestampFactory: TimestampFactory
): Record<string, unknown> {
  const cleanedData = removeUndefined(entryData as unknown as Record<string, unknown>);
  
  const dateValue = cleanedData.date;
  const dateTimestamp = dateValue && typeof dateValue === 'string'
    ? timestampFactory.fromDate(new Date(dateValue))
    : timestampFactory.now();
  
  return {
    ...cleanedData,
    creatorName: cleanedData.creatorName,
    contentType: cleanedData.contentType,
    date: dateTimestamp,
    dateString: cleanedData.date,
    ...(cleanedData.submittedAt ? { submittedAt: timestampFactory.fromDate(new Date(cleanedData.submittedAt as string)) } : {}),
    createdAt: timestampFactory.now(),
    updatedAt: timestampFactory.now(),
    isDeleted: false,
  };
}

/**
 * Prepare entry update data for Firestore storage
 */
export function prepareEntryUpdateData(
  updates: Record<string, unknown>,
  timestampFactory: TimestampFactory
): Record<string, unknown> {
  const updateData: Record<string, unknown> = {
    ...updates,
  };

  if (updates.date && typeof updates.date === 'string') {
    updateData.date = timestampFactory.fromDate(new Date(updates.date));
    updateData.dateString = updates.date;
  }
  
  updateData.updatedAt = timestampFactory.now();
  
  return updateData;
}

/**
 * Prepare soft delete data for Firestore storage
 */
export function prepareDeleteData(
  timestampFactory: TimestampFactory
): Record<string, unknown> {
  const now = timestampFactory.now();
  return {
    isDeleted: true,
    deletedAt: now,
    updatedAt: now,
  };
}

/**
 * Filter and transform entry documents from a snapshot
 */
export function transformEntryDocs(
  docs: Array<{ data: () => Record<string, unknown>; id: string }>,
  contentType?: 'post' | 'memory'
): Entry[] {
  const entries: Entry[] = [];
  
  docs.forEach((docSnap) => {
    const data = docSnap.data();
    
    // Filter deleted entries
    if (data.isDeleted === true) {
      return;
    }
    
    // Filter by contentType if provided
    if (contentType && data.contentType !== contentType) {
      return;
    }
    
    entries.push(transformEntryDoc(data, docSnap.id));
  });
  
  return entries;
}

/**
 * Sort entries by date (newest first)
 */
export function sortEntriesByDate(entries: Entry[]): Entry[] {
  return [...entries].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA; // Descending order
  });
}


