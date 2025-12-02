import React from 'react';

export default function ElevationLegend({ visible = false, min, max }: { visible?: boolean; min?: number; max?: number }) {
  if (!visible) return null;
  const minVal = Math.round((min ?? 0) * 100) / 100;
  const maxVal = Math.round((max ?? 0) * 100) / 100;
  return (
    <div className="bg-black/30 border border-amber-500/30 rounded p-3 text-gray-200 text-sm min-w-[220px]">
      <div className="font-semibold mb-2">Elevation</div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400">{minVal}</span>
        <div
          className="flex-1 h-3 rounded"
          style={{
            background: 'linear-gradient(90deg, rgb(60,40,20) 0%, rgb(90,70,30) 20%, rgb(120,90,40) 40%, rgb(160,120,60) 60%, rgb(190,160,90) 80%, rgb(220,200,120) 100%)',
          }}
        />
        <span className="text-xs text-gray-400">{maxVal}</span>
      </div>
    </div>
  );
}



