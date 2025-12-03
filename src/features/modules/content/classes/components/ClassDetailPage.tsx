import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { PageHero } from '@/features/infrastructure/components';
import { Card } from '@/features/infrastructure/components';
import type { ClassStats } from '@/features/modules/analytics-group/analytics/types';

interface ClassDetailPageProps {
  pageNamespaces: string[];
}

export function ClassDetailPage({ pageNamespaces: _pageNamespaces }: ClassDetailPageProps) {
  const router = useRouter();
  const className = router.query.className as string;
  const [classStat, setClassStat] = useState<ClassStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>('');

  const fetchClassDetail = async () => {
    if (!className) return;
    
    try {
      setLoading(true);
      setError(null);
      const url = category 
        ? `/api/classes/${encodeURIComponent(className)}?category=${encodeURIComponent(category)}`
        : `/api/classes/${encodeURIComponent(className)}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to load class statistics');
      }
      const result = await response.json();
      const statsData = result.data || result;
      setClassStat(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load class statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (className) {
      fetchClassDetail();
    }
  }, [className, category]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)]">
        <PageHero title="Class Statistics" description="View detailed statistics for this class" />
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

  if (error || !classStat) {
    return (
      <div className="min-h-[calc(100vh-8rem)]">
        <PageHero title="Class Statistics" description="View detailed statistics for this class" />
        <div className="container mx-auto px-4 py-8">
          <Card variant="medieval" className="p-8">
            <p className="text-red-400">
              {error || 'Class not found'}
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <PageHero 
        title={`${classStat.id.charAt(0).toUpperCase() + classStat.id.slice(1)} Statistics`} 
        description="View detailed statistics for this class" 
      />
      
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Category Filter */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-amber-400 mb-2">
            Filter by Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
          >
            <option value="">All Categories</option>
            <option value="1v1">1v1</option>
            <option value="2v2">2v2</option>
            <option value="3v3">3v3</option>
            <option value="4v4">4v4</option>
            <option value="5v5">5v5</option>
            <option value="6v6">6v6</option>
            <option value="ffa">FFA</option>
          </select>
        </div>

        {/* Class Overview */}
        <Card variant="medieval" className="p-6">
          <h2 className="text-2xl font-semibold text-amber-400 mb-4">Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-gray-500">Total Games:</span>
              <p className="text-amber-300 text-lg font-semibold">{classStat.totalGames}</p>
            </div>
            <div>
              <span className="text-gray-500">Win Rate:</span>
              <p className="text-green-400 text-lg font-semibold">
                {classStat.winRate.toFixed(1)}%
              </p>
            </div>
            <div>
              <span className="text-gray-500">Wins:</span>
              <p className="text-green-400 text-lg font-semibold">{classStat.totalWins}</p>
            </div>
            <div>
              <span className="text-gray-500">Losses:</span>
              <p className="text-red-400 text-lg font-semibold">{classStat.totalLosses}</p>
            </div>
          </div>
        </Card>

        {/* Top Players */}
        {classStat.topPlayers.length > 0 && (
          <Card variant="medieval" className="p-6">
            <h2 className="text-2xl font-semibold text-amber-400 mb-4">Top Players</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-amber-500/20">
                    <th className="text-left py-2 px-4 text-amber-400">Rank</th>
                    <th className="text-left py-2 px-4 text-amber-400">Player</th>
                    <th className="text-right py-2 px-4 text-amber-400">Record</th>
                    <th className="text-right py-2 px-4 text-amber-400">Win Rate</th>
                    <th className="text-right py-2 px-4 text-amber-400">ELO Gain</th>
                  </tr>
                </thead>
                <tbody>
                  {classStat.topPlayers.map((player, index) => (
                    <tr key={player.playerName} className="border-b border-amber-500/10 hover:bg-amber-500/5">
                      <td className="py-2 px-4 text-gray-300">#{index + 1}</td>
                      <td className="py-2 px-4">
                        <Link 
                          href={`/players/${encodeURIComponent(player.playerName)}`}
                          className="text-amber-300 hover:text-amber-400 hover:underline"
                        >
                          {player.playerName}
                        </Link>
                      </td>
                      <td className="py-2 px-4 text-right text-white">
                        {player.wins}W - {player.losses}L
                      </td>
                      <td className="py-2 px-4 text-right text-green-400">
                        {player.winRate.toFixed(1)}%
                      </td>
                      <td className="py-2 px-4 text-right text-amber-400">
                        {player.elo > 0 ? '+' : ''}{player.elo.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {classStat.topPlayers.length === 0 && (
          <Card variant="medieval" className="p-6">
            <p className="text-gray-400">No player statistics available for this class.</p>
          </Card>
        )}
      </div>
    </div>
  );
}


