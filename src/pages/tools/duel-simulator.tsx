import React from 'react';
import { getStaticPropsWithTranslations } from '@/features/shared/lib/getStaticProps';
import logger from '@/features/shared/utils/loggerUtils';
import Layout from '@/features/shared/components/Layout';
import { useFallbackTranslation } from '@/features/shared/hooks/useFallbackTranslation';
import TrollPanel from '@/features/tools/components/TrollPanel';
import ItemsPalette from '@/features/tools/components/ItemsPalette';
import type { TrollLoadout, TrollSide, DragPayload } from '@/features/tools/types';
import { BASE_TROLL_CLASS_SLUGS } from '@/features/guides/data/classes';
import { ITEMS_DATA } from '@/features/guides/data/items';
import type { ItemData } from '@/types/items';

const pageNamespaces = ["common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

const DEFAULT_LEVEL = 1;
const MAX_LEVEL = 60;

export default function DuelSimulator() {
  const { t } = useFallbackTranslation(pageNamespaces);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      logger.info('Duel Simulator page visited', {
        path: window.location.pathname,
        timestamp: new Date().toISOString(),
      });
    }
  }, []);

  const initialLeft = React.useMemo<TrollLoadout>(() => ({
    classSlug: BASE_TROLL_CLASS_SLUGS[0] ?? 'hunter',
    level: DEFAULT_LEVEL,
    inventory: Array.from({ length: 8 }, () => null),
    selectedSlotIndex: 0,
  }), []);
  const initialRight = React.useMemo<TrollLoadout>(() => ({
    classSlug: BASE_TROLL_CLASS_SLUGS[1] ?? BASE_TROLL_CLASS_SLUGS[0] ?? 'mage',
    level: DEFAULT_LEVEL,
    inventory: Array.from({ length: 8 }, () => null),
    selectedSlotIndex: 0,
  }), []);

  const [left, setLeft] = React.useState<TrollLoadout>(initialLeft);
  const [right, setRight] = React.useState<TrollLoadout>(initialRight);

  const placeItem = (
    side: TrollSide,
    index: number,
    item: ItemData | null,
  ) => {
    if (side === 'left') {
      setLeft((prev) => {
        const inv = [...prev.inventory];
        inv[index] = item;
        return { ...prev, inventory: inv, selectedSlotIndex: index };
      });
    } else {
      setRight((prev) => {
        const inv = [...prev.inventory];
        inv[index] = item;
        return { ...prev, inventory: inv, selectedSlotIndex: index };
      });
    }
  };

  const swapItems = (
    aSide: TrollSide,
    aIndex: number,
    bSide: TrollSide,
    bIndex: number,
  ) => {
    const getState = (side: TrollSide) => (side === 'left' ? left : right);
    const aItem = getState(aSide).inventory[aIndex];
    const bItem = getState(bSide).inventory[bIndex];
    placeItem(aSide, aIndex, bItem);
    placeItem(bSide, bIndex, aItem);
  };

  const handleDropToSlot = (targetSide: TrollSide, targetIndex: number, payload: DragPayload) => {
    if (payload.kind === 'paletteItem') {
      const item = ITEMS_DATA.find((it) => it.id === payload.itemId) || null;
      placeItem(targetSide, targetIndex, item);
      return;
    }
    if (payload.kind === 'inventoryItem') {
      const { side: sourceSide, index: sourceIndex } = payload;
      if (sourceSide === targetSide && sourceIndex === targetIndex) return;
      swapItems(sourceSide, sourceIndex, targetSide, targetIndex);
      return;
    }
  };

  return (
    <Layout pageTranslationNamespaces={pageNamespaces}>
      <div className="min-h-[calc(100vh-8rem)] px-4 md:px-8 py-8 md:py-10">
        <h1 className="font-medieval-brand text-4xl md:text-5xl mb-6 text-center">Duel Simulator</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_minmax(320px,420px)_1fr] gap-6 items-start">
          {/* Troll 1 */}
          <div className="order-1">
            <TrollPanel
              title="Troll 1"
              side="left"
              loadout={left}
              onChangeClass={(slug) => setLeft((prev) => ({ ...prev, classSlug: slug }))}
              onChangeLevel={(lvl) =>
                setLeft((prev) => ({ ...prev, level: Math.max(1, Math.min(MAX_LEVEL, lvl)) }))
              }
              onSelectSlot={(i) => setLeft((prev) => ({ ...prev, selectedSlotIndex: i }))}
              onClearSlot={(i) =>
                setLeft((prev) => {
                  const inv = [...prev.inventory];
                  inv[i] = null;
                  return { ...prev, inventory: inv, selectedSlotIndex: i };
                })
              }
              onDropToSlot={handleDropToSlot}
            />
          </div>

          {/* Items Palette */}
          <div className="order-3 xl:order-2">
            <ItemsPalette />
          </div>

          {/* Troll 2 */}
          <div className="order-2 xl:order-3">
            <TrollPanel
              title="Troll 2"
              side="right"
              loadout={right}
              onChangeClass={(slug) => setRight((prev) => ({ ...prev, classSlug: slug }))}
              onChangeLevel={(lvl) =>
                setRight((prev) => ({ ...prev, level: Math.max(1, Math.min(MAX_LEVEL, lvl)) }))
              }
              onSelectSlot={(i) => setRight((prev) => ({ ...prev, selectedSlotIndex: i }))}
              onClearSlot={(i) =>
                setRight((prev) => {
                  const inv = [...prev.inventory];
                  inv[i] = null;
                  return { ...prev, inventory: inv, selectedSlotIndex: i };
                })
              }
              onDropToSlot={handleDropToSlot}
            />
          </div>
        </div>

        <div className="mt-6 text-center text-gray-400 text-sm">
          This is the first version of the two-troll setup with WC3-style 8-slot inventories. Damage math to follow.
        </div>
      </div>
    </Layout>
  );
}


