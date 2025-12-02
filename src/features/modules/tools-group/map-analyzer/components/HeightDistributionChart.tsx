import React from 'react';
import type { SimpleMapData } from '../types/map';

export default function HeightDistributionChart({
  map,
  t1,
  t2,
  onSelectThreshold,
}: {
  map?: SimpleMapData | null;
  t1?: number;
  t2?: number;
  onSelectThreshold?: (value: number) => void;
}) {
  const buckets = React.useMemo(() => {
    if (!map) return [] as { h: number; count: number }[];
    const heights = map.tiles.filter(t => !t.isWater).map(t => t.groundHeight);
    if (!heights.length) return [];
    const min = Math.min(...heights);
    const max = Math.max(...heights);
    const bins = 20;
    const size = (max - min) / bins || 1;
    const counts = new Array(bins).fill(0);
    for (const h of heights) {
      const idx = Math.min(bins - 1, Math.max(0, Math.floor((h - min) / size)));
      counts[idx]++;
    }
    return counts.map((c, i) => ({ h: min + i * size, count: c }));
  }, [map]);

  if (!buckets.length) {
    return (
      <div className="bg-black/30 border border-amber-500/30 rounded p-3 text-gray-200 text-sm">No land height data</div>
    );
  }

  const maxCount = Math.max(...buckets.map(b => b.count)) || 1;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSelectThreshold || !buckets.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    const idx = Math.max(0, Math.min(buckets.length - 1, Math.round(ratio * (buckets.length - 1))));
    const snapped = buckets[idx].h; // snap to bucket edge
    onSelectThreshold(snapped);
  };

  return (
    <div className="bg-black/30 border border-amber-500/30 rounded p-3 text-gray-200 text-sm">
      <div className="font-semibold mb-2">Height Distribution</div>
      <div className="relative">
        <div className="flex items-end gap-1 h-28" onClick={handleClick}>
          {buckets.map((b, i) => (
            <div key={i} className="flex-1 bg-amber-600" style={{ height: `${(b.count / maxCount) * 100}%` }} title={`${Math.round(b.h)}: ${b.count}`} />
          ))}
        </div>
        {(typeof t1 === 'number') && (
          <div className="absolute inset-y-0" style={{ left: `${(() => {
            if (!buckets.length) return 0;
            const min = buckets[0].h; const max = buckets[buckets.length - 1].h;
            return ((t1 - min) / (max - min)) * 100;
          })()}%` }}>
            <div className="w-0.5 h-full bg-amber-400" />
          </div>
        )}
        {(typeof t2 === 'number') && (
          <div className="absolute inset-y-0" style={{ left: `${(() => {
            if (!buckets.length) return 0;
            const min = buckets[0].h; const max = buckets[buckets.length - 1].h;
            return ((t2 - min) / (max - min)) * 100;
          })()}%` }}>
            <div className="w-0.5 h-full bg-amber-400" />
          </div>
        )}
      </div>
    </div>
  );
}



