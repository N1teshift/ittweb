export interface ArchiveEntry {
  id: string;
  title: string;
  content: string;
  author: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'none';
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
  mediaType?: 'image' | 'video' | 'none';
  dateInfo: DateInfo;
  mediaUrl?: string;
}

export interface ArchiveFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  mediaType?: 'image' | 'video' | 'none' | 'all';
  includeUndated?: boolean;
}
