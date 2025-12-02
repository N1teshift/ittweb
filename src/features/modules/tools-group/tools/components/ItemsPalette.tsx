import React from 'react';
import GuideIcon from '@/features/modules/content/guides/components/GuideIcon';
import type { ItemCategory } from '@/types/items';
import { useItemsDataSWR } from '@/features/modules/content/guides/hooks/useItemsDataSWR';

// Note: We use GuideIcon without src override to leverage the ICON_MAP system,
// which provides consistent icon resolution across all pages (same as guides pages).

export default function ItemsPalette() {
  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState<ItemCategory | 'all'>('all');
  const [collapsed, setCollapsed] = React.useState(false);
  const contentId = React.useId();
  const { items, isLoading, error } = useItemsDataSWR();

  const categories: { key: ItemCategory | 'all'; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'weapons', label: 'Weapons' },
    { key: 'armor', label: 'Armor' },
    { key: 'raw-materials', label: 'Raw Materials' },
    { key: 'potions', label: 'Potions' },
    { key: 'scrolls', label: 'Scrolls' },
    { key: 'buildings', label: 'Buildings' },
  ];

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      const inCategory = category === 'all' ? true : it.category === category;
      if (!inCategory) return false;
      if (!q) return true;
      const hay = `${it.name} ${it.description} ${(it.recipe || []).join(' ')}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, category, items]);

  return (
    <div className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-3 md:p-4 w-full">
      <div className="flex items-center justify-between gap-4 mb-3">
        <h3 className="font-medieval-brand text-xl">Items</h3>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-sm text-gray-300">
            {collapsed ? 'Collapsed' : "Drag an item into a Troll's inventory"}
          </span>
          <button
            type="button"
            aria-controls={contentId}
            aria-expanded={!collapsed}
            className="px-2 py-1 text-sm rounded border border-amber-500/30 bg-black/40 text-gray-200 hover:border-amber-400"
            onClick={() => setCollapsed((v) => !v)}
          >
            {collapsed ? 'Expand' : 'Collapse'}
          </button>
        </div>
      </div>
      {!collapsed && (
        <div id={contentId}>
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
          <div className="min-h-[120px]">
            {error && (
              <div className="text-red-300 text-sm border border-red-500/40 rounded-md p-3 bg-red-500/10">
                Failed to load items. {error.message}
              </div>
            )}
            {!error && isLoading && (
              <div className="text-gray-400 text-sm">Loading items...</div>
            )}
            {!error && !isLoading && filtered.length === 0 && (
              <div className="text-gray-400 text-sm">No items match your filters.</div>
            )}
            {!error && filtered.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-0.5 max-h-[500px] overflow-y-auto pr-1">
                {filtered.map((it) => (
                  <div
                    key={it.id}
                    className="cursor-move text-center border border-transparent hover:border-amber-400/50 rounded p-0.5 text-gray-200 inline-flex flex-col items-center transition-colors"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = 'copyMove';
                      e.dataTransfer.setData(
                        'text/plain',
                        JSON.stringify({ kind: 'paletteItem', itemId: it.id })
                      );
                    }}
                    title={it.name}
                  >
                    <GuideIcon category={it.category === 'buildings' ? 'buildings' : 'items'} name={it.name} size={64} />
                    <div className="text-xs font-semibold text-amber-200 break-words text-center mt-0.5 leading-tight">{it.name}</div>
                    {(it.stats?.damage || it.stats?.armor) && (
                      <div className="text-[8px] text-amber-300/80 leading-tight">
                        {it.stats?.damage && <span>+{it.stats.damage}</span>}
                        {it.stats?.damage && it.stats?.armor && <span> </span>}
                        {it.stats?.armor && <span>+{it.stats.armor}</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}



