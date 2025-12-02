import React from 'react';
import type { SimpleMapData } from '../types/map';

export default function MapInfoPanel({ map }: { map?: SimpleMapData | null }) {
  const width = map?.width ?? 0;
  const height = map?.height ?? 0;
  const total = width * height;
  const waterTiles = map?.tiles?.filter((t) => t.isWater) ?? [];
  const landTiles = map?.tiles?.filter((t) => !t.isWater) ?? [];
  const water = waterTiles.length;
  const land = landTiles.length;

  const landHeights = landTiles.map((t) => t.groundHeight);
  const minLand = landHeights.length ? Math.min(...landHeights) : 0;
  const maxLand = landHeights.length ? Math.max(...landHeights) : 0;
  const avgLand = landHeights.length ? (landHeights.reduce((a, b) => a + b, 0) / landHeights.length) : 0;

  const waterDepths = waterTiles.map((t) => (t.waterHeight ?? 0) - t.groundHeight);
  const minDepth = waterDepths.length ? Math.min(...waterDepths) : 0;
  const maxDepth = waterDepths.length ? Math.max(...waterDepths) : 0;
  const avgDepth = waterDepths.length ? (waterDepths.reduce((a, b) => a + b, 0) / waterDepths.length) : 0;

  const ramps = map?.tiles?.reduce((acc, t) => acc + (t.isRamp ? 1 : 0), 0) ?? 0;
  const noWater = map?.tiles?.reduce((acc, t) => acc + (t.isNoWater ? 1 : 0), 0) ?? 0;

  return (
    <div className="bg-black/30 border border-amber-500/30 rounded p-3 text-gray-200 text-sm space-y-1">
      <div className="font-semibold">Map</div>
      <div>Size: {width} x {height} — Tiles: {total}</div>
      <div>Land: {land} (min {fmt(minLand)}, avg {fmt(avgLand)}, max {fmt(maxLand)})</div>
      <div>Water: {water} (depth min {fmt(minDepth)}, avg {fmt(avgDepth)}, max {fmt(maxDepth)})</div>
      <div>Ramps: {ramps} | No Water: {noWater}</div>
    </div>
  );
}

function fmt(n: number): string {
  return Number.isFinite(n) ? Math.round(n).toString() : '0';
}



