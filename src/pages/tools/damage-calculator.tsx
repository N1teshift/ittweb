import React from 'react';
import { getStaticPropsWithTranslations } from '@/features/shared/lib/getStaticProps';
import logger from '@/features/shared/utils/loggerUtils';
import Layout from '@/features/shared/components/Layout';
import { useFallbackTranslation } from '@/features/shared/hooks/useFallbackTranslation';
import ClassIcon from '@/features/guides/components/ClassIcon';
import { BASE_TROLL_CLASSES, BASE_TROLL_CLASS_SLUGS, getClassBySlug, TrollClassData } from '@/features/guides/data/classes';
import { ITEMS_DATA } from '@/features/guides/data/items';
import { ATTR_START_MULTIPLIER, MOVESPEED_PER_LEVEL, getMoveSpeedOffset, HP_PER_STRENGTH, MANA_PER_INTELLIGENCE, ARMOR_PER_AGILITY, getArmorDamageReductionPercent } from '@/features/guides/config/balance';
import type { ItemCategory, ItemData } from '@/types/items';

const pageNamespaces = ["common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

type TrollLoadout = {
  classSlug: string;
  level: number;
  inventory: (ItemData | null)[]; // 6 slots
  selectedSlotIndex: number | null;
};

const DEFAULT_LEVEL = 1;
const MAX_LEVEL = 60;

function InventoryGrid({
  inventory,
  selectedIndex,
  onSelectSlot,
  onClearSlot,
}: {
  inventory: (ItemData | null)[];
  selectedIndex: number | null;
  onSelectSlot: (index: number) => void;
  onClearSlot: (index: number) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-3 w-[220px]">
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
          >
            {item ? (
              <>
                <span className="px-1 leading-tight">{item.name}</span>
                <span className="absolute -top-2 -right-2">
                  <button
                    type="button"
                    aria-label="Clear slot"
                    className="h-6 w-6 rounded-full bg-amber-600 text-black text-xs font-bold border border-amber-300 hover:bg-amber-500"
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

function TrollPanel({
  title,
  loadout,
  onChangeClass,
  onChangeLevel,
  onSelectSlot,
  onClearSlot,
}: {
  title: string;
  loadout: TrollLoadout;
  onChangeClass: (slug: string) => void;
  onChangeLevel: (level: number) => void;
  onSelectSlot: (index: number) => void;
  onClearSlot: (index: number) => void;
}) {
  const clazz: TrollClassData | undefined = getClassBySlug(loadout.classSlug);

  const itemSums = React.useMemo(() => {
    return (loadout.inventory.filter(Boolean) as ItemData[]).reduce(
      (acc, it) => {
        acc.damage += it.stats?.damage ?? 0;
        acc.armor += it.stats?.armor ?? 0;
        acc.health += it.stats?.health ?? 0;
        acc.mana += it.stats?.mana ?? 0;
        return acc;
      },
      { damage: 0, armor: 0, health: 0, mana: 0 }
    );
  }, [loadout.inventory]);

  const computed = React.useMemo(() => {
    if (!clazz) {
      return null;
    }

    const baseStr = Math.ceil(clazz.growth.strength * ATTR_START_MULTIPLIER.base);
    const baseAgi = Math.ceil(clazz.growth.agility * ATTR_START_MULTIPLIER.base);
    const baseInt = Math.ceil(clazz.growth.intelligence * ATTR_START_MULTIPLIER.base);

    const levelGainStr = (loadout.level - 1) * clazz.growth.strength;
    const levelGainAgi = (loadout.level - 1) * clazz.growth.agility;
    const levelGainInt = (loadout.level - 1) * clazz.growth.intelligence;

    const str = baseStr + levelGainStr;
    const agi = baseAgi + levelGainAgi;
    const int = baseInt + levelGainInt;

    const msOffset = getMoveSpeedOffset('base');
    const moveSpeed = clazz.baseMoveSpeed + MOVESPEED_PER_LEVEL * (loadout.level + msOffset);
    const hp = clazz.baseHp + itemSums.health + str * HP_PER_STRENGTH;
    const mana = clazz.baseMana + itemSums.mana + int * MANA_PER_INTELLIGENCE;
    const armor = itemSums.armor + agi * ARMOR_PER_AGILITY;
    const atkSpd = clazz.baseAttackSpeed; // Item attack speed bonuses are descriptive in data, no numeric values

    const armorReductionPct = getArmorDamageReductionPercent(armor);
    return { str, agi, int, moveSpeed, hp, mana, armor, armorReductionPct, atkSpd };
  }, [clazz, loadout.level, itemSums]);

  return (
    <div className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-4 md:p-6 flex flex-col items-center gap-4 w-full">
      <h2 className="font-medieval-brand text-2xl text-center">{title}</h2>

      <div className="flex items-center gap-3 w-full">
        {clazz && (
          <ClassIcon slug={clazz.slug} name={clazz.name} />
        )}
        <div className="flex-1">
          <label className="block text-sm text-gray-300 mb-1">Class</label>
          <select
            className="w-full bg-black/50 border border-amber-500/30 rounded px-3 py-2 text-gray-100"
            value={loadout.classSlug}
            onChange={(e) => onChangeClass(e.target.value)}
          >
            {BASE_TROLL_CLASSES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="w-28">
          <label className="block text-sm text-gray-300 mb-1">Level</label>
          <input
            type="number"
            min={1}
            max={MAX_LEVEL}
            value={loadout.level}
            onChange={(e) => onChangeLevel(Number(e.target.value))}
            className="w-full bg-black/50 border border-amber-500/30 rounded px-3 py-2 text-gray-100"
          />
        </div>
      </div>

      <div className="w-full flex items-center justify-center">
        <InventoryGrid
          inventory={loadout.inventory}
          selectedIndex={loadout.selectedSlotIndex}
          onSelectSlot={onSelectSlot}
          onClearSlot={onClearSlot}
        />
      </div>

      {clazz && computed && (
        <div className="w-full mt-4 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-sm text-gray-200">
          <div>
            <div className="text-gray-400">Strength</div>
            <div>{computed.str.toFixed(1)}</div>
          </div>
          <div>
            <div className="text-gray-400">Agility</div>
            <div>{computed.agi.toFixed(1)}</div>
          </div>
          <div>
            <div className="text-gray-400">Intelligence</div>
            <div>{computed.int.toFixed(1)}</div>
          </div>
          <div>
            <div className="text-gray-400">Armor</div>
            <div>{computed.armor.toFixed(1)} <span className="text-gray-400">({computed.armorReductionPct.toFixed(1)}%)</span></div>
          </div>
          <div>
            <div className="text-gray-400">HP</div>
            <div>{computed.hp}</div>
          </div>
          <div>
            <div className="text-gray-400">Mana</div>
            <div>{computed.mana}</div>
          </div>
          <div>
            <div className="text-gray-400">Move Speed</div>
            <div>{Math.round(computed.moveSpeed)}</div>
          </div>
          <div>
            <div className="text-gray-400">Attack Speed</div>
            <div>{computed.atkSpd}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function ItemsPalette({
  activeTarget,
  onAddItem,
}: {
  activeTarget: 'left' | 'right';
  onAddItem: (item: ItemData) => void;
}) {
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
        <div className="text-sm text-gray-300">Target: <span className="text-amber-300 font-semibold capitalize">{activeTarget}</span></div>
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
          <button
            key={it.id}
            type="button"
            className="text-left bg-black/40 border border-amber-500/30 hover:border-amber-400 rounded p-3 text-gray-200"
            onClick={() => onAddItem(it)}
          >
            <div className="text-sm font-semibold text-amber-200 truncate">{it.name}</div>
            <div className="text-[10px] uppercase tracking-wide text-gray-400">{it.category}</div>
            {it.stats?.damage && (
              <div className="text-xs mt-1 text-amber-300">+{it.stats.damage} damage</div>
            )}
            {it.stats?.armor && (
              <div className="text-xs text-amber-300">+{it.stats.armor} armor</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DamageCalculator() {
  const { t } = useFallbackTranslation(pageNamespaces);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      logger.info('Damage Calculator page visited', {
        path: window.location.pathname,
        timestamp: new Date().toISOString(),
      });
    }
  }, []);

  const initialLeft = React.useMemo<TrollLoadout>(() => ({
    classSlug: BASE_TROLL_CLASS_SLUGS[0] ?? 'hunter',
    level: DEFAULT_LEVEL,
    inventory: Array.from({ length: 6 }, () => null),
    selectedSlotIndex: 0,
  }), []);
  const initialRight = React.useMemo<TrollLoadout>(() => ({
    classSlug: BASE_TROLL_CLASS_SLUGS[1] ?? BASE_TROLL_CLASS_SLUGS[0] ?? 'mage',
    level: DEFAULT_LEVEL,
    inventory: Array.from({ length: 6 }, () => null),
    selectedSlotIndex: 0,
  }), []);

  const [left, setLeft] = React.useState<TrollLoadout>(initialLeft);
  const [right, setRight] = React.useState<TrollLoadout>(initialRight);
  const [activeTarget, setActiveTarget] = React.useState<'left' | 'right'>('left');

  const applyToActive = React.useCallback(
    (fn: (l: TrollLoadout) => TrollLoadout) => {
      if (activeTarget === 'left') setLeft((prev) => fn(prev));
      else setRight((prev) => fn(prev));
    },
    [activeTarget]
  );

  const handleAddItem = (item: ItemData) => {
    applyToActive((state) => {
      const next = { ...state } as TrollLoadout;
      const inv = [...next.inventory];
      const targetIndex =
        next.selectedSlotIndex != null ? next.selectedSlotIndex : inv.findIndex((x) => x === null);
      const indexToUse = targetIndex === -1 ? 0 : targetIndex; // replace first if full
      inv[indexToUse] = item;
      next.inventory = inv;
      next.selectedSlotIndex = indexToUse;
      return next;
    });
  };

  return (
    <Layout pageTranslationNamespaces={pageNamespaces}>
      <div className="min-h-[calc(100vh-8rem)] px-4 md:px-8 py-8 md:py-10">
        <h1 className="font-medieval-brand text-4xl md:text-5xl mb-6 text-center">Damage Calculator</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_minmax(320px,420px)_1fr] gap-6 items-start">
          {/* Left Troll */}
          <div className="order-1">
            <TrollPanel
              title="Left Troll"
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
            />
          </div>

          {/* Items Palette and Target Switcher */}
          <div className="order-3 xl:order-2">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-sm text-gray-300">Assign items to:</span>
              <div className="inline-flex rounded overflow-hidden border border-amber-500/30">
                <button
                  type="button"
                  className={`px-3 py-1.5 text-sm ${
                    activeTarget === 'left' ? 'bg-amber-600 text-black' : 'bg-black/40 text-gray-200'
                  }`}
                  onClick={() => setActiveTarget('left')}
                >
                  Left
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 text-sm ${
                    activeTarget === 'right' ? 'bg-amber-600 text-black' : 'bg-black/40 text-gray-200'
                  }`}
                  onClick={() => setActiveTarget('right')}
                >
                  Right
                </button>
              </div>
            </div>

            <ItemsPalette activeTarget={activeTarget} onAddItem={handleAddItem} />
          </div>

          {/* Right Troll */}
          <div className="order-2 xl:order-3">
            <TrollPanel
              title="Right Troll"
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
            />
          </div>
        </div>

        <div className="mt-6 text-center text-gray-400 text-sm">
          This is the first version of the two-troll setup with WC3-style 6-slot inventories. Damage math to follow.
        </div>
      </div>
    </Layout>
  );
}
