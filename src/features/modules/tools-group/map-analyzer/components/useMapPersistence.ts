/**
 * Custom hook for persisting map data to localStorage
 */

import { useState, useEffect } from 'react';
import type { SimpleMapData } from '../types/map';

const STORAGE_KEY = 'itt_map_analyzer_last_v1';

export function useMapPersistence(): [
  SimpleMapData | null,
  (map: SimpleMapData | null) => void,
  () => void
] {
  const [map, setMap] = useState<SimpleMapData | null>(null);

  // Load persisted map on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setMap(parsed);
      }
    } catch {
      // ignore parsing errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist map whenever it changes
  useEffect(() => {
    try {
      if (map) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
      }
    } catch {
      // ignore storage errors (quota, etc.)
    }
  }, [map]);

  const clearPersisted = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore errors
    }
    setMap(null);
  };

  return [map, setMap, clearPersisted];
}


