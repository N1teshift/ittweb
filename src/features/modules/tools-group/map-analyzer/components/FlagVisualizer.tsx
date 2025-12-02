import React from 'react';

const FLAGS: Array<{ id: number; label: string; color: string }> = [
  { id: 0x20000000, label: 'Water', color: 'rgb(0,120,220)' },
  { id: 0x00000002, label: 'Ramp', color: 'rgb(180,80,200)' },
  { id: 0x00000004, label: 'No Water', color: 'rgb(220,150,40)' },
];

export default function FlagVisualizer({ selectedFlags = [], onToggleFlag }: { selectedFlags?: number[]; onToggleFlag?: (id: number) => void }) {
  return (
    <div className="flex gap-3 items-center text-sm text-gray-200">
      <span>Flags:</span>
      {FLAGS.map((f) => (
        <label key={f.id} className="inline-flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: f.color }} />
          <input type="checkbox" checked={selectedFlags.includes(f.id)} onChange={() => onToggleFlag?.(f.id)} />
          <span>{f.label}</span>
        </label>
      ))}
    </div>
  );
}



