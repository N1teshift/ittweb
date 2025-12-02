import React from 'react';

export default function MapControls({
  zoom,
  setZoom,
  onReset,
  onFit,
  onFitWidth,
  onFitHeight,
  renderMode,
  onChangeRenderMode,
  onExport,
}: {
  zoom: number;
  setZoom: (z: number) => void;
  onReset: () => void;
  onFit?: () => void;
  onFitWidth?: () => void;
  onFitHeight?: () => void;
  renderMode?: 'complete' | 'elevation' | 'cliffs';
  onChangeRenderMode?: (m: 'complete' | 'elevation' | 'cliffs') => void;
  onExport?: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <button className="px-3 py-1 bg-gray-700 text-white rounded" onClick={() => setZoom(Math.max(0.1, +(zoom - 0.1).toFixed(2)))}>-</button>
      <div className="px-2 text-gray-200 w-14 text-center">{Math.round(zoom * 100)}%</div>
      <button className="px-3 py-1 bg-gray-700 text-white rounded" onClick={() => setZoom(Math.min(4, +(zoom + 0.1).toFixed(2)))}>+</button>
      <input
        type="range"
        min={0.1}
        max={4}
        step={0.01}
        value={zoom}
        onChange={(e) => setZoom(Math.max(0.1, Math.min(4, Number(e.target.value))))}
        className="w-40"
      />
      <button className="px-3 py-1 bg-gray-700 text-white rounded" onClick={onReset}>1:1</button>
      {onFit && (
        <button className="px-3 py-1 bg-gray-700 text-white rounded" onClick={onFit}>Fit</button>
      )}
      {onFitWidth && (
        <button className="px-2 py-1 bg-gray-700 text-white rounded" onClick={onFitWidth} title="Fit width">Fit W</button>
      )}
      {onFitHeight && (
        <button className="px-2 py-1 bg-gray-700 text-white rounded" onClick={onFitHeight} title="Fit height">Fit H</button>
      )}
      {onChangeRenderMode && (
        <select
          className="px-2 py-1 bg-gray-800 text-gray-100 rounded border border-amber-500/30"
          value={renderMode}
          onChange={(e) => onChangeRenderMode(e.target.value as 'complete' | 'elevation' | 'cliffs')}
          title="Render mode"
        >
          <option value="complete">Complete Terrain</option>
          <option value="elevation">Ground Elevation Only</option>
          <option value="cliffs">Cliff Levels</option>
        </select>
      )}
      {onExport && (
        <button className="ml-2 px-3 py-1 bg-amber-600 text-black rounded" onClick={onExport} title="Export current map as JSON">Export</button>
      )}
    </div>
  );
}



