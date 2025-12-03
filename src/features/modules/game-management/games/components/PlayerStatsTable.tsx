import React from 'react';
import Link from 'next/link';
import { Card } from '@/features/infrastructure/components';
import { Tooltip } from '@/features/infrastructure/components';
import type { GamePlayer } from '../types';

interface PlayerStatsTableProps {
  players: GamePlayer[];
  title?: string;
}

/**
 * Check if any player has ITT-specific stats
 */
function hasITTStats(players: GamePlayer[]): boolean {
  return players.some(p => 
    p.killsElk !== undefined || 
    p.killsHawk !== undefined ||
    p.meatEaten !== undefined ||
    p.selfHealing !== undefined ||
    p.goldAcquired !== undefined ||
    p.damageDealt !== undefined
  );
}

/**
 * Get total animal kills for a player
 */
function getTotalAnimalKills(player: GamePlayer): number {
  return (player.killsElk || 0) + 
         (player.killsHawk || 0) + 
         (player.killsSnake || 0) + 
         (player.killsWolf || 0) + 
         (player.killsBear || 0) + 
         (player.killsPanther || 0);
}

/**
 * Format a number for display (handles undefined)
 */
function formatStat(value: number | undefined): string {
  if (value === undefined || value === null) return '-';
  return value.toLocaleString();
}

/**
 * Stat cell with icon and tooltip
 */
function StatCell({ 
  value, 
  icon, 
  tooltip, 
  colorClass = 'text-gray-300' 
}: { 
  value: number | undefined; 
  icon: string; 
  tooltip: string;
  colorClass?: string;
}) {
  const displayValue = formatStat(value);
  if (displayValue === '-') {
    return <span className="text-gray-600">-</span>;
  }
  
  return (
    <Tooltip content={tooltip}>
      <span className={`flex items-center gap-1 ${colorClass}`}>
        <span>{icon}</span>
        <span>{displayValue}</span>
      </span>
    </Tooltip>
  );
}

/**
 * Get animal kills breakdown as a string for tooltip
 */
function getAnimalKillsTooltip(player: GamePlayer): string {
  const kills = [
    { name: 'Elk', count: player.killsElk, emoji: '🦌' },
    { name: 'Hawk', count: player.killsHawk, emoji: '🦅' },
    { name: 'Snake', count: player.killsSnake, emoji: '🐍' },
    { name: 'Wolf', count: player.killsWolf, emoji: '🐺' },
    { name: 'Bear', count: player.killsBear, emoji: '🐻' },
    { name: 'Panther', count: player.killsPanther, emoji: '🐆' },
  ].filter(k => k.count !== undefined && k.count > 0);

  if (kills.length === 0) return 'No animal kills';

  return kills.map(k => `${k.emoji} ${k.name}: ${k.count}`).join(', ');
}

export function PlayerStatsTable({ players, title = 'Player Statistics' }: PlayerStatsTableProps) {
  if (!players || players.length === 0) return null;
  if (!hasITTStats(players)) return null;

  // Sort players: winners first, then by damage dealt
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.flag === 'winner' && b.flag !== 'winner') return -1;
    if (a.flag !== 'winner' && b.flag === 'winner') return 1;
    return (b.damageDealt || 0) - (a.damageDealt || 0);
  });

  return (
    <Card variant="medieval" className="p-6">
      <h2 className="text-xl font-semibold text-amber-400 mb-4">{title}</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-amber-500/20 text-gray-400">
              <th className="text-left py-2 px-2">Player</th>
              <th className="text-center py-2 px-2">
                <Tooltip content="Damage dealt to enemy trolls">
                  <span>🗡️ Dmg</span>
                </Tooltip>
              </th>
              <th className="text-center py-2 px-2">
                <Tooltip content="Self healing">
                  <span>💚 Self</span>
                </Tooltip>
              </th>
              <th className="text-center py-2 px-2">
                <Tooltip content="Ally healing">
                  <span>💙 Ally</span>
                </Tooltip>
              </th>
              <th className="text-center py-2 px-2">
                <Tooltip content="Meat eaten">
                  <span>🥩 Meat</span>
                </Tooltip>
              </th>
              <th className="text-center py-2 px-2">
                <Tooltip content="Gold acquired from selling">
                  <span>💰 Gold</span>
                </Tooltip>
              </th>
              <th className="text-center py-2 px-2">
                <Tooltip content="Total animal kills (hover for breakdown)">
                  <span>🦌 Kills</span>
                </Tooltip>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player) => {
              const totalKills = getTotalAnimalKills(player);
              const flagColor = player.flag === 'winner' 
                ? 'bg-green-500/5' 
                : player.flag === 'loser' 
                ? 'bg-red-500/5' 
                : 'bg-yellow-500/5';
              
              return (
                <tr key={player.id} className={`border-b border-amber-500/10 ${flagColor}`}>
                  <td className="py-2 px-2">
                    <Link 
                      href={`/players/${encodeURIComponent(player.name)}`} 
                      className="text-amber-300 hover:text-amber-200"
                    >
                      {player.name}
                    </Link>
                    {player.flag === 'winner' && (
                      <span className="ml-2 text-xs text-green-400">👑</span>
                    )}
                  </td>
                  <td className="text-center py-2 px-2">
                    <StatCell 
                      value={player.damageDealt} 
                      icon="" 
                      tooltip="Damage dealt"
                      colorClass="text-red-400"
                    />
                  </td>
                  <td className="text-center py-2 px-2">
                    <StatCell 
                      value={player.selfHealing} 
                      icon="" 
                      tooltip="Self healing"
                      colorClass="text-green-400"
                    />
                  </td>
                  <td className="text-center py-2 px-2">
                    <StatCell 
                      value={player.allyHealing} 
                      icon="" 
                      tooltip="Ally healing"
                      colorClass="text-blue-400"
                    />
                  </td>
                  <td className="text-center py-2 px-2">
                    <StatCell 
                      value={player.meatEaten} 
                      icon="" 
                      tooltip="Meat eaten"
                      colorClass="text-orange-400"
                    />
                  </td>
                  <td className="text-center py-2 px-2">
                    <StatCell 
                      value={player.goldAcquired} 
                      icon="" 
                      tooltip="Gold acquired"
                      colorClass="text-yellow-400"
                    />
                  </td>
                  <td className="text-center py-2 px-2">
                    {totalKills > 0 ? (
                      <Tooltip content={getAnimalKillsTooltip(player)}>
                        <span className="text-amber-300 cursor-help">{totalKills}</span>
                      </Tooltip>
                    ) : (
                      <span className="text-gray-600">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Mobile-friendly card view for small screens */}
      <div className="md:hidden mt-4 space-y-3">
        {sortedPlayers.map((player) => {
          const totalKills = getTotalAnimalKills(player);
          const flagBorder = player.flag === 'winner' 
            ? 'border-green-500/30' 
            : player.flag === 'loser' 
            ? 'border-red-500/30' 
            : 'border-yellow-500/30';
          
          return (
            <div key={`mobile-${player.id}`} className={`p-3 rounded border ${flagBorder} bg-black/20`}>
              <div className="flex justify-between items-center mb-2">
                <Link 
                  href={`/players/${encodeURIComponent(player.name)}`} 
                  className="text-amber-300 hover:text-amber-200 font-medium"
                >
                  {player.name}
                </Link>
                {player.flag === 'winner' && <span className="text-green-400">👑 Winner</span>}
                {player.flag === 'loser' && <span className="text-red-400">Loser</span>}
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>🗡️ {formatStat(player.damageDealt)}</div>
                <div>💚 {formatStat(player.selfHealing)}</div>
                <div>💙 {formatStat(player.allyHealing)}</div>
                <div>🥩 {formatStat(player.meatEaten)}</div>
                <div>💰 {formatStat(player.goldAcquired)}</div>
                <div>🦌 {totalKills || '-'}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

