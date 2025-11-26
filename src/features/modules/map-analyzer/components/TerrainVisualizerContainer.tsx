import React from 'react';
import MapFileUploader from './MapFileUploader';
import TerrainVisualizer from './TerrainVisualizer';
import type { SimpleMapData } from '../types/map';

export default function TerrainVisualizerContainer() {
  const [map, setMap] = React.useState<SimpleMapData | null>(null);
  const STORAGE_KEY = 'itt_map_analyzer_last_v1';
  const UI_STORAGE_KEY = 'itt_map_analyzer_ui_v1';
  const [uiState, setUiState] = React.useState<{
    zoom: number;
    scroll: { left: number; top: number };
    renderMode?: 'complete' | 'elevation' | 'cliffs';
    t1?: number;
    t2?: number;
    sliceEnabled?: boolean;
  }>({ zoom: 1, scroll: { left: 0, top: 0 }, renderMode: 'elevation', t1: undefined, t2: undefined, sliceEnabled: false });

  // Load persisted map on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setMap(parsed);
      }
      const uiStored = localStorage.getItem(UI_STORAGE_KEY);
      if (uiStored) {
        const parsedUi = JSON.parse(uiStored);
        if (typeof parsedUi.zoom === 'number' && parsedUi.scroll) setUiState(parsedUi);
      }
    } catch (e) {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist map whenever it changes
  React.useEffect(() => {
    try {
      if (map) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
      }
    } catch (e) {
      // ignore storage errors (quota, etc.)
    }
  }, [map]);

  React.useEffect(() => {
    try {
      localStorage.setItem(UI_STORAGE_KEY, JSON.stringify(uiState));
    } catch {}
  }, [uiState]);

  const clearPersisted = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setMap(null);
  };

  const handleJsonLoaded = (data: unknown) => {
    setMap(data as SimpleMapData | null);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto mb-2">
        <MapFileUploader onJsonLoaded={handleJsonLoaded} />
      </div>
      <div className="max-w-2xl mx-auto mb-6 flex items-center justify-between text-sm text-gray-300">
        <span>Uploaded map is saved locally and will persist after refresh.</span>
        <button type="button" onClick={clearPersisted} className="px-2 py-1 rounded border border-amber-500/30 hover:border-amber-400">Clear saved</button>
      </div>
      <div>
        <TerrainVisualizer
          map={map}
          initialZoom={uiState.zoom}
          onZoomChange={(z) => setUiState((s) => ({ ...s, zoom: z }))}
          initialScroll={uiState.scroll}
          onScrollChange={(scroll) => setUiState((s) => ({ ...s, scroll }))}
          initialRenderMode={uiState.renderMode}
          onRenderModeChange={(renderMode) => setUiState((s) => ({ ...s, renderMode }))}
          initialT1={uiState.t1}
          initialT2={uiState.t2}
          initialSliceEnabled={uiState.sliceEnabled}
          onT1Change={(t1) => setUiState((s) => ({ ...s, t1 }))}
          onT2Change={(t2) => setUiState((s) => ({ ...s, t2 }))}
          onSliceEnabledChange={(sliceEnabled) => setUiState((s) => ({ ...s, sliceEnabled }))}
        />
      </div>
    </div>
  );
}


