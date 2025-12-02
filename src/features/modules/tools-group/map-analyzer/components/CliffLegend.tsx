import React from 'react';

type Counts = Record<number, number>;

export default function CliffLegend({ visible = false, counts }: { visible?: boolean; counts?: Counts }) {
  if (!visible) return null;
  const palette: Record<number, [number, number, number]> = {
    [-1]: [180, 180, 180],
    0: [200, 200, 200],
    1: [180, 160, 120],
    2: [170, 140, 100],
    3: [160, 120, 80],
    4: [140, 100, 60],
    5: [120, 80, 40],
  } as Record<number, [number, number, number]>;

  const levels = [-1, 0, 1, 2, 3, 4, 5];
  return (
    <div className="bg-black/30 border border-amber-500/30 rounded p-3 text-gray-200 text-sm min-w-[220px]">
      <div className="font-semibold mb-2">Cliffs</div>
      <div className="space-y-1">
        {levels.map((lv) => {
          const c = palette[lv as keyof typeof palette] || [200, 200, 200];
          const style = { backgroundColor: `rgb(${c[0]},${c[1]},${c[2]})` } as React.CSSProperties;
          return (
            <div key={lv} className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 rounded" style={style} />
              <span className="w-8">{lv}</span>
              <span className="text-xs text-gray-400">{counts?.[lv] ?? 0}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}



