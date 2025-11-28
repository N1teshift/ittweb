import React from 'react';
import Link from 'next/link';
import { Timestamp } from 'firebase/firestore';
import { Card } from '@/features/infrastructure/components/ui/Card';
import { usePlayerStats } from '../hooks/usePlayerStats';
import type { PlayerSearchFilters } from '../types';

interface PlayerProfileProps {
  name: string;
  filters?: PlayerSearchFilters;
}

export function PlayerProfile({ name, filters }: PlayerProfileProps) {
  const { player, loading, error } = usePlayerStats(name, filters);

  if (loading) {
    return (
      <Card variant="medieval" className="p-8 animate-pulse">
        <div className="h-8 bg-amber-500/20 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-amber-500/10 rounded w-1/2"></div>
      </Card>
    );
  }

  if (error || !player) {
    return (
      <Card variant="medieval" className="p-8">
        <p className="text-red-400">
          {error ? `Error: ${error.message}` : 'Player not found'}
        </p>
      </Card>
    );
  }

  const categories = Object.keys(player.categories);

  return (
    <div className="space-y-6">
      <Card variant="medieval" className="p-6">
        <h1 className="text-3xl font-bold text-amber-400 mb-4">{player.name}</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Total Games:</span>
            <p className="text-amber-300 text-lg font-semibold">{player.totalGames}</p>
          </div>
          {player.lastPlayed && (
            <div>
              <span className="text-gray-500">Last Played:</span>
              <p className="text-amber-300">
                {(() => {
                  const date = typeof player.lastPlayed === 'string' 
                    ? new Date(player.lastPlayed)
                    : (player.lastPlayed as Timestamp)?.toDate?.() || new Date(String(player.lastPlayed));
                  return date.toLocaleDateString();
                })()}
              </p>
            </div>
          )}
        </div>
      </Card>

      {categories.length > 0 && (
        <Card variant="medieval" className="p-6">
          <h2 className="text-xl font-semibold text-amber-400 mb-4">Statistics by Category</h2>
          <div className="space-y-4">
            {categories.map((category) => {
              const stats = player.categories[category];
              const winRate = stats.games > 0
                ? ((stats.wins / stats.games) * 100).toFixed(1)
                : '0.0';

              return (
                <div key={category} className="border-b border-amber-500/20 pb-4 last:border-0">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-amber-300 uppercase">
                      {category}
                    </h3>
                    {stats.rank && (
                      <span className="text-sm text-gray-400">Rank: #{stats.rank}</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">ELO:</span>
                      <p className="text-amber-400 font-semibold">{Math.round(stats.score)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Wins:</span>
                      <p className="text-green-400">{stats.wins}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Losses:</span>
                      <p className="text-red-400">{stats.losses}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Win Rate:</span>
                      <p className="text-amber-300">{winRate}%</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {player.recentGames && player.recentGames.length > 0 && (
        <Card variant="medieval" className="p-6">
          <h2 className="text-xl font-semibold text-amber-400 mb-4">Recent Games</h2>
          <div className="space-y-2">
            {player.recentGames.map((game) => (
              <Link
                key={game.id}
                href={`/games/${game.id}`}
                className="block p-2 hover:bg-amber-500/10 rounded transition-colors"
              >
                <div className="flex justify-between items-center">
                  <span className="text-amber-300">Game #{game.gameId}</span>
                  <span className="text-gray-400 text-sm">
                    {new Date(game.datetime as string).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}


