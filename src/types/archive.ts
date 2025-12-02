export type ArchiveEntryType = 'story' | 'changelog';

import { Timestamp } from 'firebase/firestore';

export interface ArchiveEntry {
  id: string;
  title: string;
  content: string;
  creatorName: string;
  createdByDiscordId?: string | null;
  entryType?: ArchiveEntryType;
  // Multi-media fields
  images?: string[];
  videoUrl?: string;
  twitchClipUrl?: string;
  replayUrl?: string;
  linkedGameDocumentId?: string; // Link to Game document when archive entry is for a game
  // Optional ordered section layout
  sectionOrder?: Array<'images' | 'video' | 'twitch' | 'replay' | 'game' | 'text'>;
  dateInfo: DateInfo;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
  submittedAt?: Timestamp | string;
  isDeleted?: boolean;
  deletedAt?: Timestamp | string | null;
}

export interface DateInfo {
  type: 'single' | 'interval' | 'undated';
  singleDate?: string; // ISO date string
  startDate?: string;  // For intervals
  endDate?: string;    // For intervals
  approximateText?: string; // "Early 2016", "Circa 2015"
}

export interface CreateArchiveEntry {
  title: string;
  content: string;
  creatorName: string;
  createdByDiscordId?: string | null;
  entryType?: ArchiveEntryType;
  // Multi-media fields
  images?: string[];
  videoUrl?: string;
  twitchClipUrl?: string;
  replayUrl?: string;
  linkedGameDocumentId?: string; // Link to Game document when archive entry is for a game
  // Optional ordered section layout
  sectionOrder?: Array<'images' | 'video' | 'twitch' | 'replay' | 'game' | 'text'>;
  dateInfo: DateInfo;
  submittedAt?: Timestamp | string;
  isDeleted?: boolean;
  deletedAt?: Timestamp | string | null;
}

export interface ArchiveFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  mediaType?: 'image' | 'video' | 'replay' | 'none' | 'all';
  includeUndated?: boolean;
}

