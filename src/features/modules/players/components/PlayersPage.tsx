import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Timestamp } from 'firebase/firestore';
import { PageHero } from '@/features/shared/components';
import { Card } from '@/features/infrastructure/shared/components/ui/Card';
import type { PlayerStats, PlayerComparison, CategoryStats } from '../types';

interface PlayersPageProps {
  pageNamespaces: string[];
}

export function PlayersPage({ pageNamespaces: _pageNamespaces }: PlayersPageProps) {
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [comparison, setComparison] = useState<PlayerComparison | null>(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [comparisonError, setComparisonError] = useState<string | null>(null);

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

  const togglePlayerSelection = (playerName: string) => {
    const newSelected = new Set(selectedPlayers);
    if (newSelected.has(playerName)) {
      newSelected.delete(playerName);
    } else {
      newSelected.add(playerName);
    }
    setSelectedPlayers(newSelected);
  };

  const handleCompareSelected = async () => {
    if (selectedPlayers.size >= 2) {
      const names = Array.from(selectedPlayers).join(',');
      try {
        setComparisonLoading(true);
        setComparisonError(null);
        const response = await fetch(`/api/players/compare?names=${encodeURIComponent(names)}`);
        if (!response.ok) {
          throw new Error('Failed to load comparison');
        }
        const result = await response.json();
        const comparisonData = result.data || result;
        setComparison(comparisonData);
      } catch (err) {
        setComparisonError(err instanceof Error ? err.message : 'Failed to load comparison');
      } finally {
        setComparisonLoading(false);
      }
    }
  };

  const exitCompareMode = () => {
    setCompareMode(false);
    setSelectedPlayers(new Set());
    setComparison(null);
    setComparisonError(null);
  };

  const getBestCategory = (player: PlayerStats) => {
    const categories = Object.entries(player.categories || {});
    if (categories.length === 0) return null;
    
    // Find category with highest ELO
    return categories.reduce<[string, CategoryStats] | null>((best, [name, stats]) => {
      const bestScore = best ? best[1].score : 0;
      return stats.score > bestScore ? [name, stats] : best;
    }, null);
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
        {/* Action Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
            />
          </div>
          
          <div className="flex gap-2">
            {!compareMode ? (
              <button
                onClick={() => setCompareMode(true)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded transition-colors"
              >
                Select to Compare
              </button>
            ) : (
              <>
                {!comparison && selectedPlayers.size >= 2 && (
                  <button
                    onClick={handleCompareSelected}
                    disabled={comparisonLoading}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {comparisonLoading ? 'Loading...' : `Compare Selected (${selectedPlayers.size})`}
                  </button>
                )}
                <button
                  onClick={exitCompareMode}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                >
                  {comparison ? 'Back to Players' : 'Cancel'}
                </button>
              </>
            )}
          </div>
        </div>

        {compareMode && !comparison && (
          <Card variant="medieval" className="mb-6 p-4 bg-amber-500/10 border-amber-500/30">
            <div className="flex items-center justify-between">
              <p className="text-amber-300">
                Select at least 2 players to compare. Selected: {selectedPlayers.size}
              </p>
              {selectedPlayers.size > 0 && (
                <button
                  onClick={() => setSelectedPlayers(new Set())}
                  className="text-sm text-amber-400 hover:text-amber-300 underline"
                >
                  Clear Selection
                </button>
              )}
            </div>
          </Card>
        )}

        {/* Comparison Results */}
        {comparison && (
          <div className="space-y-6 mb-6">
            {/* Player Stats Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {comparison.players.map((player) => {
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
                        
                        {bestStats && bestCategory && (
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
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>

            {/* Head-to-Head Records */}
            {Object.keys(comparison.headToHead).length > 0 && (
              <Card variant="medieval" className="p-6">
                <h2 className="text-2xl font-semibold text-amber-400 mb-4">Head-to-Head Records</h2>
                <div className="space-y-4">
                  {Object.entries(comparison.headToHead).map(([player1, opponents]) => (
                    <div key={player1} className="border-b border-amber-500/20 pb-4 last:border-0">
                      <h3 className="text-lg font-semibold text-amber-300 mb-2">{player1}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(opponents).map(([player2, record]) => (
                          <div key={player2} className="bg-gray-800/50 p-3 rounded">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-white font-medium">{player2}</span>
                              <span className="text-amber-300">
                                {record.wins}W - {record.losses}L
                              </span>
                            </div>
                            {record.wins + record.losses > 0 && (
                              <div className="text-xs text-gray-400">
                                Win Rate: {((record.wins / (record.wins + record.losses)) * 100).toFixed(1)}%
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* ELO Comparison Chart */}
            {comparison.eloComparison && comparison.eloComparison.length > 0 && (
              <Card variant="medieval" className="p-6">
                <h2 className="text-2xl font-semibold text-amber-400 mb-4">ELO Comparison</h2>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={comparison.eloComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d97706" opacity={0.2} />
                    <XAxis
                      dataKey="date"
                      stroke="#d97706"
                      tick={{ fill: '#d97706' }}
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis
                      stroke="#d97706"
                      tick={{ fill: '#d97706' }}
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        border: '1px solid rgba(217, 119, 6, 0.3)',
                        borderRadius: '4px',
                        color: '#d97706',
                      }}
                    />
                    <Legend wrapperStyle={{ color: '#d97706' }} />
                    {comparison.players.map((player, index) => {
                      const colors = ['#d97706', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
                      return (
                        <Line
                          key={player.name}
                          type="monotone"
                          dataKey={player.name}
                          stroke={colors[index % colors.length]}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}

            {comparison.eloComparison && comparison.eloComparison.length === 0 && (
              <Card variant="medieval" className="p-6">
                <p className="text-gray-400 text-center">No ELO history data available for comparison.</p>
              </Card>
            )}

            {comparisonError && (
              <Card variant="medieval" className="p-6">
                <p className="text-red-400">Error: {comparisonError}</p>
              </Card>
            )}
          </div>
        )}

        {/* Players List - Hidden when showing comparison */}
        {!comparison && (
          <>
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
              
              const isSelected = selectedPlayers.has(player.name);
              
              const CardContent = (
                <Card 
                  variant="medieval" 
                  className={`p-6 transition-colors h-full ${
                    compareMode 
                      ? isSelected 
                        ? 'border-amber-500 bg-amber-500/10 cursor-pointer' 
                        : 'hover:border-amber-500/50 cursor-pointer'
                      : 'hover:border-amber-500/50 cursor-pointer'
                  }`}
                  onClick={(e) => {
                    if (compareMode) {
                      e.preventDefault();
                      e.stopPropagation();
                      togglePlayerSelection(player.name);
                    }
                  }}
                >
                      <h3 className="text-xl font-semibold text-amber-400 mb-3">{player.name}</h3>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Games:</span>
                        <span className="text-amber-300 font-semibold">{player.totalGames}</span>
                      </div>
                      
                      {bestStats && bestCategory && (
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
                          <span>
                            {(() => {
                              const date = typeof player.lastPlayed === 'string' 
                                ? new Date(player.lastPlayed)
                                : (player.lastPlayed as Timestamp)?.toDate?.() || new Date(String(player.lastPlayed));
                              return date.toLocaleDateString();
                            })()}
                          </span>
                        </div>
                      )}
                    </div>
                  </Card>
              );

              return (
                <div key={player.id} className="relative">
                  {compareMode && (
                    <div className="absolute top-2 right-2 z-10">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => togglePlayerSelection(player.name)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-5 h-5 text-amber-600 bg-gray-800 border-gray-600 rounded focus:ring-amber-500 focus:ring-2"
                      />
                    </div>
                  )}
                  {compareMode ? (
                    CardContent
                  ) : (
                    <Link href={`/players/${encodeURIComponent(player.name)}`}>
                      {CardContent}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}

