/**
 * Date range
 */
export interface DateRange {
  start: Date | null;
  end: Date | null;
}

/**
 * Date range preset
 */
export interface DateRangePreset {
  label: string;
  start: Date;
  end: Date;
}

/**
 * Filter state (for URL query params)
 */
export interface FilterState {
  startDate?: string;
  endDate?: string;
  category?: string;
  player?: string;
  ally?: string;
  enemy?: string;
  teamFormat?: string;
  page?: number;
  limit?: number;
}



