/**
 * Custom hook for fetching meta analytics data
 */

import { useState, useEffect, useCallback } from 'react';
import type {
  ActivityDataPoint,
  GameLengthDataPoint,
  PlayerActivityDataPoint,
  ClassSelectionData,
  ClassWinRateData,
} from '../../analytics/types';

interface MetaData {
  activity: ActivityDataPoint[];
  gameLength: GameLengthDataPoint[];
  playerActivity: PlayerActivityDataPoint[];
  classSelection: ClassSelectionData[];
  classWinRates: ClassWinRateData[];
}

interface UseMetaDataParams {
  category?: string;
  teamFormat?: string;
  startDate?: string;
  endDate?: string;
}

export function useMetaData({
  category,
  teamFormat,
  startDate,
  endDate,
}: UseMetaDataParams) {
  const [metaData, setMetaData] = useState<MetaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetaData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (teamFormat) params.append('teamFormat', teamFormat);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/analytics/meta?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to load meta statistics');
      }
      const result = await response.json();
      const data = result.data || result;
      setMetaData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load meta statistics');
    } finally {
      setLoading(false);
    }
  }, [category, teamFormat, startDate, endDate]);

  useEffect(() => {
    fetchMetaData();
  }, [fetchMetaData]);

  return {
    metaData,
    loading,
    error,
    refetch: fetchMetaData,
  };
}


