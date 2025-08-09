export interface ArchiveEntry {
  id: string;
  title: string;
  content: string;
  author: string;
  // Deprecated single-media fields kept for backward compatibility
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'replay' | 'none';
  // New multi-media fields
  images?: string[];
  videoUrl?: string;
  replayUrl?: string;
  // Optional ordered section layout
  sectionOrder?: Array<'images' | 'video' | 'replay' | 'text'>;
  dateInfo: DateInfo;
  createdAt: string;
  updatedAt: string;
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
  author: string;
  // Deprecated single-media fields kept for backward compatibility
  mediaType?: 'image' | 'video' | 'replay' | 'none';
  mediaUrl?: string;
  // New multi-media fields
  images?: string[];
  videoUrl?: string;
  replayUrl?: string;
  // Optional ordered section layout
  sectionOrder?: Array<'images' | 'video' | 'replay' | 'text'>;
  dateInfo: DateInfo;
}

export interface ArchiveFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  mediaType?: 'image' | 'video' | 'replay' | 'none' | 'all';
  includeUndated?: boolean;
}
