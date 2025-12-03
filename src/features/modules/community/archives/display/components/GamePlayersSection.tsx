import React from 'react';
import Link from 'next/link';
import { formatEloChange } from '@/features/modules/shared/utils';
import { AnimalKillsDisplay } from '@/features/modules/shared/components';
import type { GameWithPlayers, GamePlayer } from '@/features/modules/game-management/games/types';

interface GamePlayersSectionProps {
  game: GameWithPlayers;
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
 * Check if player has any ITT stats
 */
function hasITTStats(player: GamePlayer): boolean {
  return player.damageDealt !== undefined ||
         player.selfHealing !== undefined ||
         player.allyHealing !== undefined ||
         player.meatEaten !== undefined ||
         player.goldAcquired !== undefined ||
         player.killsElk !== undefined ||
         player.killsHawk !== undefined ||
         player.killsSnake !== undefined ||
         player.killsWolf !== undefined ||
         player.killsBear !== undefined ||
         player.killsPanther !== undefined;
}

/**
 * Format a number for display
 */
function formatStat(value: number | undefined): string {
  if (value === undefined || value === null) return '-';
  return value.toLocaleString();
}

/**
 * Player stat badge component
 */
function PlayerStatBadge({ icon, value, label }: { icon: string; value: number | undefined; label: string }) {
  if (value === undefined || value === null || value === 0) return null;
  return (
    <div className="flex items-center gap-1 text-xs">
      <span>{icon}</span>
      <span className="text-amber-300">{formatStat(value)}</span>
      <span className="text-gray-500">{label}</span>
    </div>
  );
}

/**
 * Player card with detailed stats
 */
function PlayerCard({ player, isWinner }: { player: GamePlayer; isWinner: boolean }) {
  const hasStats = hasITTStats(player);
  const totalKills = getTotalAnimalKills(player);
  
  return (
    <div className={`p-2 rounded border ${isWinner ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
      <div className="flex items-center justify-between mb-1">
        <Link
          href={`/players/${encodeURIComponent(player.name)}`}
          onClick={(e) => e.stopPropagation()}
          className={`text-sm font-medium hover:underline ${isWinner ? 'text-green-300' : 'text-red-300'}`}
        >
          {player.name}
        </Link>
        {player.elochange !== undefined && (
          <span className={`text-xs font-semibold ${isWinner ? 'text-green-400' : 'text-red-400'}`}>
            {formatEloChange(player.elochange)}
          </span>
        )}
      </div>
      
      {hasStats && (
        <div className="mt-2 pt-2 border-t border-amber-500/10 space-y-1">
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            <PlayerStatBadge icon="🗡️" value={player.damageDealt} label="DMG" />
            <PlayerStatBadge icon="💚" value={player.selfHealing} label="Heal" />
            <PlayerStatBadge icon="💙" value={player.allyHealing} label="Ally" />
            <PlayerStatBadge icon="🥩" value={player.meatEaten} label="Meat" />
            <PlayerStatBadge icon="💰" value={player.goldAcquired} label="Gold" />
          </div>
          
          {/* Animal kills breakdown */}
          {totalKills > 0 && (
            <div className="mt-1.5">
              <AnimalKillsDisplay
                kills={{
                  elk: player.killsElk,
                  hawk: player.killsHawk,
                  snake: player.killsSnake,
                  wolf: player.killsWolf,
                  bear: player.killsBear,
                  panther: player.killsPanther,
                }}
                compact={true}
                showLabels={false}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function GamePlayersSection({ game }: GamePlayersSectionProps) {
  if (!game.players || game.players.length === 0) {
    return null;
  }

  const winners = game.players.filter(p => p.flag === 'winner');
  const losers = game.players.filter(p => p.flag === 'loser');
  const drawers = game.players.filter(p => p.flag === 'drawer');

  return (
    <div className="mt-4 space-y-2">
      {/* Winners and Losers side by side for compact display */}
      {(winners.length > 0 || losers.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {winners.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-green-400 mb-1.5">Winners</div>
              <div className="space-y-1.5">
                {winners.map((player) => (
                  <PlayerCard key={player.id} player={player} isWinner={true} />
                ))}
              </div>
            </div>
          )}
          {losers.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-red-400 mb-1.5">Losers</div>
              <div className="space-y-1.5">
                {losers.map((player) => (
                  <PlayerCard key={player.id} player={player} isWinner={false} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {drawers.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-yellow-400 mb-1.5">Draw</div>
          <div className="space-y-1.5">
            {drawers.map((player) => (
              <PlayerCard key={player.id} player={player} isWinner={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}



