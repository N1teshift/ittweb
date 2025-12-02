import React from 'react';

export type TrollComputedStats = {
  str: number;
  agi: number;
  int: number;
  armor: number;
  armorReductionPct: number;
  hp: number;
  mana: number;
  moveSpeed: number;
  atkSpd: number;
};

export default function StatsPanel({ stats }: { stats: TrollComputedStats }) {
  return (
    <div className="w-full mt-4 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-sm text-gray-200">
      <div>
        <div className="text-gray-400">Strength</div>
        <div>{stats.str.toFixed(1)}</div>
      </div>
      <div>
        <div className="text-gray-400">Agility</div>
        <div>{stats.agi.toFixed(1)}</div>
      </div>
      <div>
        <div className="text-gray-400">Intelligence</div>
        <div>{stats.int.toFixed(1)}</div>
      </div>
      <div>
        <div className="text-gray-400">Armor</div>
        <div>
          {stats.armor.toFixed(1)}{' '}
          <span className="text-gray-400">({stats.armorReductionPct.toFixed(1)}%)</span>
        </div>
      </div>
      <div>
        <div className="text-gray-400">HP</div>
        <div>{stats.hp}</div>
      </div>
      <div>
        <div className="text-gray-400">Mana</div>
        <div>{stats.mana}</div>
      </div>
      <div>
        <div className="text-gray-400">Move Speed</div>
        <div>{Math.round(stats.moveSpeed)}</div>
      </div>
      <div>
        <div className="text-gray-400">Attack Speed</div>
        <div>{stats.atkSpd}</div>
      </div>
    </div>
  );
}



