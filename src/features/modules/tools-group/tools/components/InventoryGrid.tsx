import React from 'react';
import GuideIcon from '@/features/modules/content/guides/components/GuideIcon';
import type { DragPayload, TrollSide } from '@/features/modules/tools-group/tools/types';
import type { ItemData } from '@/types/items';

export default function InventoryGrid({
  side,
  inventory,
  selectedIndex,
  onSelectSlot,
  onClearSlot,
  onDropToSlot,
}: {
  side: TrollSide;
  inventory: (ItemData | null)[];
  selectedIndex: number | null;
  onSelectSlot: (index: number) => void;
  onClearSlot: (index: number) => void;
  onDropToSlot: (side: TrollSide, index: number, payload: DragPayload) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-3 w-[300px]">
      {inventory.map((item, idx) => {
        const isSelected = selectedIndex === idx;
        return (
          <div
            key={idx}
            className={`group relative aspect-square rounded-md border ${
              isSelected ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-amber-500/30'
            } bg-black/40 flex items-center justify-center text-center text-sm text-gray-200 hover:border-amber-400 transition cursor-pointer`}
            onClick={() => onSelectSlot(idx)}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectSlot(idx);
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              let dropEffect: DataTransfer['dropEffect'] = 'move';
              try {
                const raw = e.dataTransfer.getData('text/plain');
                if (raw) {
                  const payload = JSON.parse(raw) as DragPayload;
                  dropEffect = payload.kind === 'paletteItem' ? 'copy' : 'move';
                }
              } catch {
                // ignore
              }
              e.dataTransfer.dropEffect = dropEffect;
            }}
            onDrop={(e) => {
              e.preventDefault();
              try {
                const raw = e.dataTransfer.getData('text/plain');
                if (!raw) return;
                const payload = JSON.parse(raw) as DragPayload;
                onDropToSlot(side, idx, payload);
              } catch {
                // ignore invalid payloads
              }
            }}
          >
            {item ? (
              <>
                <div
                  className="absolute inset-0 w-full h-full rounded-md overflow-hidden flex items-center justify-center"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData(
                      'text/plain',
                      JSON.stringify({ kind: 'inventoryItem', side, index: idx })
                    );
                  }}
                  title={item.name}
                >
                  <GuideIcon
                    category={item.category === 'buildings' ? 'buildings' : 'items'}
                    name={item.name}
                    size={64}
                    className="object-cover rounded-md"
                  />
                </div>
                <span className="absolute -top-2 -right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    type="button"
                    aria-label="Clear slot"
                    className="h-6 w-6 rounded-full bg-black/80 backdrop-blur-sm text-red-400 text-xs font-semibold border border-red-500/50 hover:bg-red-500/20 hover:border-red-400 hover:text-red-300 shadow-lg transition-all duration-200 flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClearSlot(idx);
                    }}
                  >
                    ×
                  </button>
                </span>
              </>
            ) : (
              <span className="text-amber-300/60 text-xs">Empty</span>
            )}
          </div>
        );
      })}
    </div>
  );
}



