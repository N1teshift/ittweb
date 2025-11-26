import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHero } from '@/features/shared/components';
import { Card } from '@/features/infrastructure/shared/components/ui/Card';
import type { PlayerStats } from '../types';

interface PlayersPageProps {
  pageNamespaces: string[];
}

export function PlayersPage({ pageNamespaces }: PlayersPageProps) {
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/players?limit=500');
        if (!response.ok) {
          throw new Error('Failed to load players');
        }
        const result = await response.json();
        // Handle wrapped API response format
        const playersData = result.data || result;
        setPlayers(Array.isArray(playersData) ? playersData : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load players');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  const filteredPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getBestCategory = (player: PlayerStats) => {
    const categories = Object.entries(player.categories || {});
    if (categories.length === 0) return null;
    
    // Find category with highest ELO
    return categories.reduce((best, [name, stats]) => {
      const bestScore = best ? best[1].score : 0;
      return stats.score > bestScore ? [name, stats] : best;
    }, null as [string, typeof categories[0][1]] | null);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)]">
        <PageHero title="Players" description="Browse all players and their statistics" />
        <div className="container mx-auto px-4 py-8">
          <Card variant="medieval" className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-amber-500/20 rounded w-1/4"></div>
              <div className="h-4 bg-amber-500/10 rounded w-1/2"></div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-8rem)]">
        <PageHero title="Players" description="Browse all players and their statistics" />
        <div className="container mx-auto px-4 py-8">
          <Card variant="medieval" className="p-8">
            <p className="text-red-400">Error: {error}</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <PageHero title="Players" description="Browse all players and their statistics" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
          />
        </div>

        {/* Players List */}
        {filteredPlayers.length === 0 ? (
          <Card variant="medieval" className="p-8">
            <p className="text-gray-400">
              {searchQuery ? 'No players found matching your search.' : 'No players found.'}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlayers.map((player) => {
              const bestCategory = getBestCategory(player);
              const bestStats = bestCategory ? bestCategory[1] : null;
              
              return (
                <Link key={player.id} href={`/players/${encodeURIComponent(player.name)}`}>
                  <Card variant="medieval" className="p-6 hover:border-amber-500/50 transition-colors cursor-pointer h-full">
                    <h3 className="text-xl font-semibold text-amber-400 mb-3">{player.name}</h3>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Games:</span>
                        <span className="text-amber-300 font-semibold">{player.totalGames}</span>
                      </div>
                      
                      {bestStats && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Best Category:</span>
                            <span className="text-amber-300">{bestCategory[0].toUpperCase()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">ELO:</span>
                            <span className="text-amber-400 font-semibold">{Math.round(bestStats.score)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Win Rate:</span>
                            <span className="text-green-400">
                              {bestStats.games > 0
                                ? `${((bestStats.wins / bestStats.games) * 100).toFixed(1)}%`
                                : '0%'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Record:</span>
                            <span className="text-white">
                              {bestStats.wins}W - {bestStats.losses}L
                              {bestStats.draws > 0 ? ` - ${bestStats.draws}D` : ''}
                            </span>
                          </div>
                        </>
                      )}
                      
                      {player.lastPlayed && (
                        <div className="flex justify-between text-xs text-gray-400 mt-3 pt-3 border-t border-amber-500/20">
                          <span>Last Played:</span>
                          <span>{new Date(player.lastPlayed).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

