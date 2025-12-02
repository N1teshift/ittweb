import React from 'react';
import MapFileUploader from './MapFileUploader';
import TerrainVisualizer from './TerrainVisualizer';
import { MapPersistenceHeader } from './MapPersistenceHeader';
import { useMapPersistence } from './useMapPersistence';
import { useMapUIState } from './useMapUIState';
import type { SimpleMapData } from '../types/map';

export default function TerrainVisualizerContainer() {
  const [map, setMap, clearPersisted] = useMapPersistence();
  const [uiState, setUiState] = useMapUIState();

  const handleJsonLoaded = (data: unknown) => {
    setMap(data as SimpleMapData | null);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto mb-2">
        <MapFileUploader onJsonLoaded={handleJsonLoaded} />
      </div>
      <MapPersistenceHeader onClear={clearPersisted} />
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

