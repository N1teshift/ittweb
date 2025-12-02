import React from 'react';

export default function WaterLegend({ visible = true, min = 0, max = 255 }: { visible?: boolean; min?: number; max?: number }) {
  if (!visible) return null;
  const minVal = Math.round(min);
  const maxVal = Math.round(max);
  return (
    <div className="bg-black/30 border border-amber-500/30 rounded p-3 text-gray-200 text-sm min-w-[220px]">
      <div className="font-semibold mb-2">Water Depth</div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400">{minVal}</span>
        <div
          className="flex-1 h-3 rounded"
          style={{ background: 'linear-gradient(90deg, rgb(160,200,255) 0%, rgb(100,150,220) 50%, rgb(30,80,160) 100%)' }}
        />
        <span className="text-xs text-gray-400">{maxVal}</span>
      </div>
    </div>
  );
}



