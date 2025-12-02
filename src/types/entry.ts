import { Timestamp } from 'firebase/firestore';

/**
 * Unified content type for posts and memories (non-game content)
 */
export type EntryContentType = 'post' | 'memory';

/**
 * Entry - unified Post + Archive (non-game)
 */
export interface Entry {
  id: string; // Firestore document ID
  title: string;
  content: string; // Markdown/MDX content
  contentType: EntryContentType;
  date: string; // ISO date string
  creatorName: string;
  createdByDiscordId?: string | null;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
  submittedAt?: Timestamp | string;
  
  // Memory-specific fields (optional, only for contentType === 'memory')
  images?: string[];
  videoUrl?: string;
  twitchClipUrl?: string;
  sectionOrder?: Array<'images' | 'video' | 'twitch' | 'text'>;
  
  // Soft delete
  isDeleted?: boolean;
  deletedAt?: Timestamp | string | null;
}

/**
 * Create entry data
 */
export interface CreateEntry {
  title: string;
  content: string;
  contentType: EntryContentType;
  date: string; // ISO date string
  creatorName: string;
  createdByDiscordId?: string | null;
  submittedAt?: Timestamp | string;
  
  // Memory-specific fields (optional)
  images?: string[];
  videoUrl?: string;
  twitchClipUrl?: string;
  sectionOrder?: Array<'images' | 'video' | 'twitch' | 'text'>;
}

/**
 * Update entry data
 */
export interface UpdateEntry extends Partial<CreateEntry> {
  updatedAt?: Timestamp | string;
}




