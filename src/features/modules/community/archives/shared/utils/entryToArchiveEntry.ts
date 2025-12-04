import type { Entry } from '@/types/entry';
import type { ArchiveEntry } from '@/types/archive';
import { timestampToIso } from '@/features/infrastructure/utils';

/**
 * Convert an Entry (post/memory) to ArchiveEntry format for display in timeline
 */
export function convertEntryToArchiveEntry(entry: Entry): ArchiveEntry {
  return {
    id: `entry-${entry.id}`, // Prefix to avoid conflicts
    title: entry.title,
    content: entry.content,
    creatorName: entry.creatorName,
    createdByDiscordId: entry.createdByDiscordId ?? null,
    entryType: entry.contentType === 'post' ? 'story' : undefined, // Map post to story, memory has no entryType
    images: entry.images,
    videoUrl: entry.videoUrl,
    twitchClipUrl: entry.twitchClipUrl,
    replayUrl: undefined, // Entries don't have replayUrl
    linkedGameDocumentId: undefined, // Entries don't link to games
    sectionOrder: entry.sectionOrder,
    dateInfo: {
      type: 'single',
      singleDate: entry.date, // Use the entry's date field
    },
    createdAt: timestampToIso(entry.createdAt),
    updatedAt: timestampToIso(entry.updatedAt),
    submittedAt: entry.submittedAt ? timestampToIso(entry.submittedAt) : undefined,
    isDeleted: entry.isDeleted ?? false,
    deletedAt: entry.deletedAt ? timestampToIso(entry.deletedAt) : null,
  };
}



