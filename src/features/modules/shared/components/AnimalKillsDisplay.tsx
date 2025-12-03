import React from 'react';
import Image from 'next/image';

export interface AnimalKillsData {
  elk?: number;
  hawk?: number;
  snake?: number;
  wolf?: number;
  bear?: number;
  panther?: number;
  total?: number;
}

interface AnimalKillsDisplayProps {
  kills: AnimalKillsData;
  showTotal?: boolean;
  compact?: boolean;
  showLabels?: boolean;
  className?: string;
}

/**
 * Animal icon configuration
 */
const ANIMAL_CONFIG = {
  elk: {
    name: 'Elk',
    icon: '/icons/itt/btnstag.png',
    color: 'bg-amber-500/20',
  },
  hawk: {
    name: 'Hawk',
    icon: '/icons/itt/PASBTNEagleSight.png',
    color: 'bg-sky-500/20',
  },
  snake: {
    name: 'Snake',
    icon: '/icons/itt/BTNWindSerpentPassive.png',
    color: 'bg-green-500/20',
  },
  wolf: {
    name: 'Wolf',
    icon: '/icons/itt/BTNTimberWolfPassive.png',
    color: 'bg-gray-500/20',
  },
  bear: {
    name: 'Bear',
    icon: '/icons/itt/BTNHungryBear.png',
    color: 'bg-orange-500/20',
  },
  panther: {
    name: 'Panther',
    icon: '/icons/itt/BTNPantherPassive.png',
    color: 'bg-purple-500/20',
  },
} as const;

/**
 * Reusable component for displaying animal kills with image icons
 */
export function AnimalKillsDisplay({
  kills,
  showTotal = false,
  compact = false,
  showLabels = true,
  className = '',
}: AnimalKillsDisplayProps) {
  // Always show all animals, even if count is 0
  const animals = [
    { key: 'elk' as const, count: kills.elk ?? 0 },
    { key: 'hawk' as const, count: kills.hawk ?? 0 },
    { key: 'snake' as const, count: kills.snake ?? 0 },
    { key: 'wolf' as const, count: kills.wolf ?? 0 },
    { key: 'bear' as const, count: kills.bear ?? 0 },
    { key: 'panther' as const, count: kills.panther ?? 0 },
  ];

  const total = kills.total ?? animals.reduce((sum, a) => sum + (a.count || 0), 0);

  if (compact) {
    // Compact inline display (for small spaces like player cards)
    return (
      <div className={`flex flex-wrap gap-1.5 ${className}`}>
        {animals.map(({ key, count }) => {
          const config = ANIMAL_CONFIG[key];
          return (
            <span key={key} className="flex items-center gap-1 text-xs text-gray-400">
              <Image
                src={config.icon}
                alt={config.name}
                width={40}
                height={40}
                className="w-10 h-10"
                unoptimized
              />
              <span>{count ?? 0}</span>
            </span>
          );
        })}
      </div>
    );
  }

  // Full display with cards
  return (
    <div className={className}>
      {showTotal && total > 0 && (
        <div className="mb-3 text-sm text-gray-400">
          Total Kills: <span className="text-amber-300 font-semibold">{total.toLocaleString()}</span>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {animals.map(({ key, count }) => {
          const config = ANIMAL_CONFIG[key];
          const percentage = total > 0 ? ((count || 0) / total * 100).toFixed(1) : '0.0';
          return (
            <div
              key={key}
              className="bg-black/20 rounded-lg p-3 border border-amber-500/10"
            >
              <div className="flex items-center gap-2 mb-1">
                <Image
                  src={config.icon}
                  alt={config.name}
                  width={40}
                  height={40}
                  className="w-10 h-10"
                  unoptimized
                />
                {showLabels && (
                  <span className="text-gray-400 text-xs">{config.name}</span>
                )}
              </div>
              <div className="text-xl font-bold text-amber-300">
                {(count ?? 0).toLocaleString()}
              </div>
              {total > 0 && (
                <div className="text-xs text-gray-500">
                  {percentage}% of total
                </div>
              )}
              {total === 0 && (
                <div className="text-xs text-gray-600">
                  0% of total
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

