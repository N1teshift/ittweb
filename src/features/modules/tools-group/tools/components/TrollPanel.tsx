import React from 'react';
import ClassIcon from '@/features/modules/content/guides/components/ClassIcon';
import InventoryGrid from '@/features/modules/tools-group/tools/components/InventoryGrid';
import type { DragPayload, TrollSide, TrollLoadout } from '@/features/modules/tools-group/tools/types';
import { BASE_TROLL_CLASSES, getClassBySlug, TrollClassData } from '@/features/modules/content/guides/data/units/classes';
import { ATTR_START_MULTIPLIER, MOVESPEED_PER_LEVEL, getMoveSpeedOffset, HP_PER_STRENGTH, MANA_PER_INTELLIGENCE, ARMOR_PER_AGILITY, getArmorDamageReductionPercent } from '@/features/modules/content/guides/config/balance';
import type { ItemData } from '@/types/items';
import StatsPanel, { TrollComputedStats } from '@/features/modules/tools-group/tools/components/StatsPanel';

export default function TrollPanel({
  title,
  side,
  loadout,
  onChangeClass,
  onChangeLevel,
  onSelectSlot,
  onClearSlot,
  onDropToSlot,
}: {
  title: string;
  side: TrollSide;
  loadout: TrollLoadout;
  onChangeClass: (slug: string) => void;
  onChangeLevel: (level: number) => void;
  onSelectSlot: (index: number) => void;
  onClearSlot: (index: number) => void;
  onDropToSlot: (side: TrollSide, index: number, payload: DragPayload) => void;
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

  const computed: TrollComputedStats | null = React.useMemo(() => {
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
    const atkSpd = clazz.baseAttackSpeed;

    const armorReductionPct = getArmorDamageReductionPercent(armor);
    return { str, agi, int, moveSpeed, hp, mana, armor, armorReductionPct, atkSpd };
  }, [clazz, loadout.level, itemSums]);

  return (
    <div className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-4 md:p-6 flex flex-col items-center gap-4 w-full">
      <div className="w-full flex items-center justify-between gap-3">
        <h3 className="font-medieval-brand text-xl">{title}</h3>
        <div className="flex items-center gap-3">
          {clazz && <ClassIcon slug={clazz.slug} name={clazz.name} />}
          <div className="flex-none w-40 sm:w-52">
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
          <div className="w-24 sm:w-28">
            <label className="block text-sm text-gray-300 mb-1">Level</label>
            <input
              type="number"
              min={1}
              max={60}
              value={loadout.level}
              onChange={(e) => onChangeLevel(Number(e.target.value))}
              className="w-full bg-black/50 border border-amber-500/30 rounded px-3 py-2 text-gray-100"
            />
          </div>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4 items-start">
        <div className="flex justify-center">
          <InventoryGrid
            side={side}
            inventory={loadout.inventory}
            selectedIndex={loadout.selectedSlotIndex}
            onSelectSlot={onSelectSlot}
            onClearSlot={onClearSlot}
            onDropToSlot={onDropToSlot}
          />
        </div>
        <div>
          {clazz && computed && <StatsPanel stats={computed} />}
        </div>
      </div>
    </div>
  );
}




