import React from 'react';
import MapControls from './MapControls';
import MapContainer from './MapContainer';
import MapInfoPanel from './MapInfoPanel';
import TileInfoPanel from './TileInfoPanel';
import FlagVisualizer from './FlagVisualizer';
import FlagLegend from './FlagLegend';
import ElevationLegend from './ElevationLegend';
import CliffLegend from './CliffLegend';
import WaterLegend from './WaterLegend';
import TerrainLegendCard from './TerrainLegendCard';
import HeightDistributionChart from './HeightDistributionChart';
import type { SimpleMapData, SimpleTile } from '../types/map';
import { normalizeJsonToSimpleMap } from '../utils/mapUtils';

export default function TerrainVisualizer({
  map,
  initialZoom = 1,
  onZoomChange,
  initialScroll,
  onScrollChange,
  initialAutoFit: _initialAutoFit,
  onAutoFitChange: _onAutoFitChange,
  initialRenderMode,
  onRenderModeChange,
  initialT1,
  onT1Change,
  initialT2,
  onT2Change,
  initialSliceEnabled,
  onSliceEnabledChange,
}: {
  map: unknown | null;
  initialZoom?: number;
  onZoomChange?: (z: number) => void;
  initialScroll?: { left: number; top: number };
  onScrollChange?: (pos: { left: number; top: number }) => void;
  initialAutoFit?: boolean;
  onAutoFitChange?: (v: boolean) => void;
  initialRenderMode?: 'complete' | 'elevation' | 'cliffs';
  onRenderModeChange?: (m: 'complete' | 'elevation' | 'cliffs') => void;
  initialT1?: number;
  onT1Change?: (v: number | undefined) => void;
  initialT2?: number;
  onT2Change?: (v: number | undefined) => void;
  initialSliceEnabled?: boolean;
  onSliceEnabledChange?: (v: boolean) => void;
}) {
  const [zoom, setZoom] = React.useState(initialZoom);
  const [showTerrainLegend, setShowTerrainLegend] = React.useState(false);
  const [showHeightDistribution, setShowHeightDistribution] = React.useState(false);
  const [selectedFlags, setSelectedFlags] = React.useState<number[]>([]);
  const [hoveredTile, setHoveredTile] = React.useState<{ x: number; y: number } | null>(null);
  const [selectedTile, setSelectedTile] = React.useState<{ x: number; y: number } | null>(null);
  const [simpleMap, setSimpleMap] = React.useState<SimpleMapData | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scrollPos, setScrollPos] = React.useState<{ left: number; top: number }>({ left: 0, top: 0 });
  // Auto Fit removed; keep zoom fit button only
  const [renderMode, setRenderMode] = React.useState<'complete' | 'elevation' | 'cliffs'>(initialRenderMode ?? 'elevation');
  const [t1, setT1] = React.useState<number | undefined>(initialT1);
  const [t2, setT2] = React.useState<number | undefined>(initialT2);
  const [sliceEnabled, setSliceEnabled] = React.useState(!!initialSliceEnabled);
  const [debugMode, setDebugMode] = React.useState(false);

  React.useEffect(() => {
    if (!map) {
      setSimpleMap(null);
      return;
    }
    try {
      const normalized = normalizeJsonToSimpleMap(map);
      setSimpleMap(normalized);
    } catch (e) {
      // If map is already normalized SimpleMapData, accept it
      const mapObj = map as Record<string, unknown>;
      if (typeof mapObj?.width === 'number' && typeof mapObj?.height === 'number' && Array.isArray(mapObj?.tiles)) {
        setSimpleMap(map as SimpleMapData);
      } else {
        console.warn('Unsupported JSON format for visualizer', e);
        setSimpleMap(null);
      }
    }
  }, [map]);

  const hoveredDetails = React.useMemo(() => {
    if (!simpleMap || !hoveredTile) return null;
    const { x, y } = hoveredTile;
    if (x < 0 || y < 0 || x >= simpleMap.width || y >= simpleMap.height) return null;
    const t = simpleMap.tiles[y * simpleMap.width + x];
    return { x, y, ...t };
  }, [simpleMap, hoveredTile]);

  const selectedDetails = React.useMemo(() => {
    if (!simpleMap || !selectedTile) return null;
    const { x, y } = selectedTile;
    if (x < 0 || y < 0 || x >= simpleMap.width || y >= simpleMap.height) return null;
    const t = simpleMap.tiles[y * simpleMap.width + x];
    return { x, y, ...t };
  }, [simpleMap, selectedTile]);

  const [hoverUi, setHoverUi] = React.useState<{ x: number; y: number; data: SimpleTile & { x: number; y: number } } | null>(null);

  const cliffCounts = React.useMemo(() => {
    if (!simpleMap) return undefined;
    const counts: Record<number, number> = {};
    for (const tile of simpleMap.tiles) {
      if (!tile.isWater && typeof tile.cliffLevel === 'number') {
        counts[tile.cliffLevel] = (counts[tile.cliffLevel] ?? 0) + 1;
      }
    }
    return counts;
  }, [simpleMap]);

  // Auto Fit removed

  return (
    <div className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-6 text-gray-200">
      <h2 className="font-medieval-brand text-2xl mb-3">Terrain Visualizer</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[180px] mb-4">
        <MapInfoPanel map={simpleMap} />
        <TileInfoPanel title="Hovered Tile" tile={hoveredTile} details={hoveredDetails ?? undefined} />
        <TileInfoPanel title="Selected Tile" tile={selectedTile} details={selectedDetails ?? undefined} />
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
        <MapControls
          zoom={zoom}
          setZoom={(z) => { setZoom(z); onZoomChange?.(z); }}
          onReset={() => { setZoom(1); onZoomChange?.(1); }}
          onFit={() => {
            if (!simpleMap || !containerRef.current) return;
            const pad = 16;
            const cw = containerRef.current.clientWidth - pad * 2;
            const ch = 480; // approx visible height
            const zx = cw / (simpleMap.width * 16);
            const zy = ch / (simpleMap.height * 16);
            const next = Math.max(0.1, Math.min(4, Math.min(zx, zy)));
            const v = +next.toFixed(2);
            setZoom(v);
            onZoomChange?.(v);
          }}
          onFitWidth={() => {
            if (!simpleMap || !containerRef.current) return;
            const pad = 16;
            const cw = containerRef.current.clientWidth - pad * 2;
            const zx = cw / (simpleMap.width * 16);
            const v = +Math.max(0.1, Math.min(4, zx)).toFixed(2);
            setZoom(v);
            onZoomChange?.(v);
          }}
          onFitHeight={() => {
            if (!simpleMap) return;
            const ch = 480; // matches viewportHeightPx
            const zy = ch / (simpleMap.height * 16);
            const v = +Math.max(0.1, Math.min(4, zy)).toFixed(2);
            setZoom(v);
            onZoomChange?.(v);
          }}
          renderMode={renderMode}
          onChangeRenderMode={(m) => { setRenderMode(m); onRenderModeChange?.(m); }}
          onExport={() => {
            if (!simpleMap) return;
            const blob = new Blob([JSON.stringify(simpleMap)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'map.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}
        />
        <div className="flex gap-2">
          <button className={`px-3 py-1 rounded text-white ${showTerrainLegend ? 'bg-green-600' : 'bg-gray-600'}`} onClick={() => setShowTerrainLegend((s) => !s)}>
            Terrain Guide
          </button>
          <button className={`px-3 py-1 rounded text-white ${showHeightDistribution ? 'bg-purple-600' : 'bg-gray-600'}`} onClick={() => setShowHeightDistribution((s) => !s)}>
            Height Histogram
          </button>
          <button className={`px-3 py-1 rounded text-white ${debugMode ? 'bg-red-600' : 'bg-gray-600'}`} onClick={() => {
            const next = !debugMode;
            setDebugMode(next);
            if (next) setSelectedFlags([]);
          }}>
            {debugMode ? 'Debug ON' : 'Debug'}
          </button>
        </div>
        <FlagVisualizer selectedFlags={selectedFlags} onToggleFlag={(id) => setSelectedFlags((arr) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]))} />
      </div>

      {showTerrainLegend && (
        <div className="mb-4">
          <TerrainLegendCard />
        </div>
      )}

      {showHeightDistribution && (
        <div className="mb-4">
          <div className="mb-2 flex items-center gap-3">
            <span className="text-xs text-gray-300">Thresholds:</span>
            <input type="number" className="w-24 bg-black/40 border border-amber-500/30 rounded px-2 py-1 text-gray-100 text-xs" value={t1 ?? ''} onChange={(e) => { const v = e.target.value === '' ? undefined : Number(e.target.value); setT1(v); onT1Change?.(v); }} placeholder="t1" />
            <input type="number" className="w-24 bg-black/40 border border-amber-500/30 rounded px-2 py-1 text-gray-100 text-xs" value={t2 ?? ''} onChange={(e) => { const v = e.target.value === '' ? undefined : Number(e.target.value); setT2(v); onT2Change?.(v); }} placeholder="t2" />
            <button className="px-2 py-1 text-xs bg-gray-700 text-white rounded" onClick={() => { setT1(undefined); setT2(undefined); }}>Clear</button>
            <label className="ml-2 inline-flex items-center gap-1 text-xs">
              <input type="checkbox" checked={sliceEnabled} onChange={(e) => { setSliceEnabled(e.target.checked); onSliceEnabledChange?.(e.target.checked); }} />
              <span>Slice</span>
            </label>
          </div>
          <HeightDistributionChart map={simpleMap} t1={t1} t2={t2} onSelectThreshold={(val) => {
            // assign to the nearest empty or to t2
            if (typeof t1 !== 'number') { setT1(val); onT1Change?.(val); }
            else if (typeof t2 !== 'number') { setT2(val); onT2Change?.(val); }
            else { setT2(val); onT2Change?.(val); }
          }} />
        </div>
      )}

      <div className="relative" ref={containerRef}>
        <MapContainer
          onHover={setHoveredTile}
          onHoverInfo={({ tile, x, y }) => {
            if (!simpleMap || !tile) { setHoverUi(null); return; }
            const { x: tx, y: ty } = tile;
            const t = simpleMap.tiles[ty * simpleMap.width + tx];
            setHoverUi({ x, y, data: { ...t, x: tx, y: ty } });
          }}
          onSelect={setSelectedTile}
          map={simpleMap ?? undefined}
          zoom={zoom}
          viewportHeightPx={480}
          onZoomChange={(z) => { setZoom(z); onZoomChange?.(z); }}
          initialScrollLeft={initialScroll?.left ?? scrollPos.left}
          initialScrollTop={initialScroll?.top ?? scrollPos.top}
          onScrollChange={(pos) => { setScrollPos(pos); onScrollChange?.(pos); }}
          renderMode={renderMode}
          minHeight={(() => {
            if (!simpleMap) return undefined;
            const land = simpleMap.tiles.filter(t => !t.isWater).map(t => t.groundHeight);
            return land.length ? Math.min(...land) : undefined;
          })()}
          maxHeight={(() => {
            if (!simpleMap) return undefined;
            const land = simpleMap.tiles.filter(t => !t.isWater).map(t => t.groundHeight);
            return land.length ? Math.max(...land) : undefined;
          })()}
          selectedFlags={selectedFlags}
          sliceEnabled={sliceEnabled}
          sliceMin={t1}
          sliceMax={t2}
        />
        <div className="absolute bottom-4 left-4 z-20 space-y-2">
          <FlagLegend selectedFlags={selectedFlags} />
          <ElevationLegend visible={true} min={(() => {
            if (!simpleMap) return 0;
            const land = simpleMap.tiles.filter(t => !t.isWater).map(t => t.groundHeight);
            return land.length ? Math.min(...land) : 0;
          })()} max={(() => {
            if (!simpleMap) return 0;
            const land = simpleMap.tiles.filter(t => !t.isWater).map(t => t.groundHeight);
            return land.length ? Math.max(...land) : 0;
          })()} />
          <WaterLegend visible={renderMode !== 'elevation'} min={(() => {
            if (!simpleMap) return 0;
            const depths = simpleMap.tiles.filter(t => t.isWater).map(t => (t.waterHeight ?? 0) - t.groundHeight);
            return depths.length ? Math.min(...depths) : 0;
          })()} max={(() => {
            if (!simpleMap) return 0;
            const depths = simpleMap.tiles.filter(t => t.isWater).map(t => (t.waterHeight ?? 0) - t.groundHeight);
            return depths.length ? Math.max(...depths) : 0;
          })()} />
          <CliffLegend visible={renderMode === 'cliffs'} counts={cliffCounts} />
        </div>
        {debugMode && (
          <div className="absolute top-4 left-4 z-20 bg-red-600 text-white px-3 py-1 rounded">
            Debug Mode: Flag overlays and metrics for diagnostics
          </div>
        )}
        {hoverUi && (
          <div className="absolute z-30 pointer-events-none bg-black/80 text-white text-xs rounded px-2 py-1 border border-amber-500/30" style={{ left: hoverUi.x + 10, top: hoverUi.y + 10 }}>
            <div>({hoverUi.data.x}, {hoverUi.data.y}) {hoverUi.data.isWater ? 'Water' : 'Land'}</div>
            <div>Ground: {Math.round(hoverUi.data.groundHeight)}</div>
            {hoverUi.data.isWater && <div>Water: {Math.round(hoverUi.data.waterHeight ?? 0)}</div>}
            {typeof hoverUi.data.cliffLevel === 'number' && <div>Cliff: {hoverUi.data.cliffLevel}</div>}
            <div className="opacity-70">flags: 0x{(hoverUi.data.flagsMask ?? 0).toString(16)}</div>
          </div>
        )}
      </div>
    </div>
  );
}



