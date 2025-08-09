import React from 'react';
import { ITEMS_DATA } from '@/features/guides/data/items';
import type { ItemCategory } from '@/types/items';

export default function ItemsPalette() {
  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState<ItemCategory | 'all'>('all');

  const categories: { key: ItemCategory | 'all'; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'weapons', label: 'Weapons' },
    { key: 'armor', label: 'Armor' },
    { key: 'tools', label: 'Tools' },
    { key: 'potions', label: 'Potions' },
    { key: 'scrolls', label: 'Scrolls' },
  ];

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return ITEMS_DATA.filter((it) => {
      const inCategory = category === 'all' ? true : it.category === category;
      if (!inCategory) return false;
      if (!q) return true;
      const hay = `${it.name} ${it.description} ${(it.recipe || []).join(' ')}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, category]);

  return (
    <div className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-4 md:p-6 w-full">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h3 className="font-medieval-brand text-xl">Items</h3>
        <div className="text-sm text-gray-300">Drag an item into a Troll&apos;s inventory</div>
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {categories.map((c) => (
          <button
            key={c.key}
            type="button"
            className={`px-3 py-1 rounded border text-sm ${
              c.key === category ? 'bg-amber-600 text-black border-amber-400' : 'bg-black/40 text-gray-200 border-amber-500/30 hover:border-amber-400'
            }`}
            onClick={() => setCategory(c.key)}
          >
            {c.label}
          </button>
        ))}
        <div className="ml-auto">
          <input
            type="text"
            placeholder="Search items..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-black/50 border border-amber-500/30 rounded px-3 py-2 text-gray-100 w-56"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[380px] overflow-y-auto pr-1">
        {filtered.map((it) => (
          <div
            key={it.id}
            className="cursor-move text-left bg-black/40 border border-amber-500/30 hover:border-amber-400 rounded p-3 text-gray-200"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = 'copyMove';
              e.dataTransfer.setData(
                'text/plain',
                JSON.stringify({ kind: 'paletteItem', itemId: it.id })
              );
            }}
          >
            <div className="text-sm font-semibold text-amber-200 truncate">{it.name}</div>
            <div className="text-[10px] uppercase tracking-wide text-gray-400">{it.category}</div>
            {it.stats?.damage && (
              <div className="text-xs mt-1 text-amber-300">+{it.stats.damage} damage</div>
            )}
            {it.stats?.armor && (
              <div className="text-xs text-amber-300">+{it.stats.armor} armor</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


