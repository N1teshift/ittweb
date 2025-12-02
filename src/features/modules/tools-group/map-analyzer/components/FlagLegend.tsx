import React from 'react';

const KNOWN_FLAGS: Array<{ id: number; name: string }> = [
  { id: 0x20000000, name: 'Water' },
  { id: 0x00000002, name: 'Ramp' },
  { id: 0x00000004, name: 'No Water' },
  // add more if needed
];

export default function FlagLegend({ selectedFlags = [] as number[] }: { selectedFlags?: number[] }) {
  return (
    <div className="bg-black/30 border border-amber-500/30 rounded p-3 text-gray-200 text-sm">
      <div className="font-semibold mb-1">Flags</div>
      <div className="space-y-1">
        {KNOWN_FLAGS.map((f) => (
          <div key={f.id} className="flex items-center gap-2">
            <span className="inline-block w-24 text-gray-300">{f.name}</span>
            <code className="text-xs">0x{f.id.toString(16)}</code>
            <span className={`ml-2 text-[10px] px-2 py-0.5 rounded ${selectedFlags.includes(f.id) ? 'bg-amber-600 text-black' : 'bg-gray-700 text-gray-200'}`}>
              {selectedFlags.includes(f.id) ? 'ON' : 'OFF'}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 text-xs text-gray-400">
        Selected: {selectedFlags.length ? selectedFlags.map((x) => '0x' + x.toString(16)).join(', ') : 'none'}
      </div>
    </div>
  );
}



