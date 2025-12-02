/**
 * Custom hook for managing map visualizer UI state (zoom, scroll, render mode, etc.)
 */

import { useState, useEffect } from 'react';

const UI_STORAGE_KEY = 'itt_map_analyzer_ui_v1';

export interface MapUIState {
  zoom: number;
  scroll: { left: number; top: number };
  renderMode?: 'complete' | 'elevation' | 'cliffs';
  t1?: number;
  t2?: number;
  sliceEnabled?: boolean;
}

const DEFAULT_UI_STATE: MapUIState = {
  zoom: 1,
  scroll: { left: 0, top: 0 },
  renderMode: 'elevation',
  t1: undefined,
  t2: undefined,
  sliceEnabled: false,
};

export function useMapUIState(): [
  MapUIState,
  React.Dispatch<React.SetStateAction<MapUIState>>
] {
  const [uiState, setUiState] = useState<MapUIState>(() => {
    try {
      const uiStored = localStorage.getItem(UI_STORAGE_KEY);
      if (uiStored) {
        const parsedUi = JSON.parse(uiStored);
        if (typeof parsedUi.zoom === 'number' && parsedUi.scroll) {
          return { ...DEFAULT_UI_STATE, ...parsedUi };
        }
      }
    } catch {
      // ignore parsing errors
    }
    return DEFAULT_UI_STATE;
  });

  // Persist UI state whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(UI_STORAGE_KEY, JSON.stringify(uiState));
    } catch {
      // ignore storage errors
    }
  }, [uiState]);

  return [uiState, setUiState];
}


