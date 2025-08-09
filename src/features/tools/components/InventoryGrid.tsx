import React from 'react';
import type { DragPayload, TrollSide } from '@/features/tools/types';
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
          <button
            key={idx}
            type="button"
            className={`relative aspect-square rounded-md border ${
              isSelected ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-amber-500/30'
            } bg-black/40 flex items-center justify-center text-center text-sm text-gray-200 hover:border-amber-400 transition`}
            onClick={() => onSelectSlot(idx)}
            aria-pressed={isSelected}
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
                <span
                  className="px-1 leading-tight"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData(
                      'text/plain',
                      JSON.stringify({ kind: 'inventoryItem', side, index: idx })
                    );
                  }}
                >
                  {item.name}
                </span>
                <span className="absolute -top-2 -right-2">
                  <button
                    type="button"
                    aria-label="Clear slot"
                    className="h-5 w-5 rounded-full bg-red-600 text-white text-[10px] font-bold border border-red-300 hover:bg-red-500"
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
              <span className="text-amber-300/60">Empty</span>
            )}
          </button>
        );
      })}
    </div>
  );
}


