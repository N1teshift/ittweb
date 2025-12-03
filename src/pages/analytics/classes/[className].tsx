import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { GetServerSideProps } from 'next';
import { PageHero, ErrorBoundary } from '@/features/infrastructure/components';
import { Card } from '@/features/infrastructure/components';
import { ClassWinRateChart } from '@/features/modules/analytics-group/analytics/components';
import { LoadingScreen, EmptyState } from '@/features/infrastructure/components';
import type { ClassStats, ClassWinRateData } from '@/features/modules/analytics-group/analytics/types';

// Mark page as SSR to prevent ISR manifest warnings
export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};

export default function ClassDetailPage() {
  const router = useRouter();
  const className = router.query.className as string;
  const [classStat, setClassStat] = useState<ClassStats | null>(null);
  const [classWinRate, setClassWinRate] = useState<ClassWinRateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>('');

  useEffect(() => {
    const fetchClassDetail = async () => {
      if (!className) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch class statistics
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

        // Fetch win rate data for this specific class
        const analyticsResponse = await fetch('/api/analytics/meta');
        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json();
          const analytics = analyticsData.data || analyticsData;
          const winRates = analytics.classWinRates || [];
          const thisClassWinRate = winRates.find(
            (wr: ClassWinRateData) => wr.className.toLowerCase() === className.toLowerCase()
          );
          if (thisClassWinRate) {
            setClassWinRate(thisClassWinRate);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load class statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchClassDetail();
  }, [className, category]);

  if (loading) {
    return <LoadingScreen message="Loading class statistics..." />;
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
            <Link href="/analytics/classes" className="text-amber-400 hover:text-amber-300 mt-4 inline-block">
              ← Back to Class Statistics
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  const displayName = classStat.id.charAt(0).toUpperCase() + classStat.id.slice(1);

  return (
    <ErrorBoundary>
      <div className="min-h-[calc(100vh-8rem)]">
        <PageHero 
          title={`${displayName} Statistics`} 
          description="View detailed statistics for this class" 
        />
        
        <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Back Link */}
        <Link href="/analytics/classes" className="text-amber-400 hover:text-amber-300 inline-block">
          ← Back to Class Statistics
        </Link>

        {/* Category Filter */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-amber-400 mb-2">
            Filter by Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-black/40 border border-amber-500/30 rounded px-4 py-2 text-amber-300 focus:border-amber-400 focus:outline-none"
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
              <span className="text-gray-500 text-sm">Total Games</span>
              <p className="text-amber-300 text-2xl font-semibold">{classStat.totalGames}</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">Win Rate</span>
              <p className="text-green-400 text-2xl font-semibold">
                {classStat.winRate.toFixed(1)}%
              </p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">Wins</span>
              <p className="text-green-400 text-2xl font-semibold">{classStat.totalWins}</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">Losses</span>
              <p className="text-red-400 text-2xl font-semibold">{classStat.totalLosses}</p>
            </div>
          </div>
        </Card>

        {/* Class Win Rate Chart */}
        {classWinRate && (
          <ClassWinRateChart 
            data={[classWinRate]} 
            title={`${displayName} Win Rate`} 
          />
        )}

        {/* Top Players */}
        {classStat.topPlayers.length > 0 ? (
          <Card variant="medieval" className="p-6">
            <h2 className="text-2xl font-semibold text-amber-400 mb-4">Top Players</h2>
            <div className="overflow-x-auto">
              <table className="w-full" role="table" aria-label="Top players for this class">
                <thead>
                  <tr className="border-b border-amber-500/20">
                    <th scope="col" className="text-left py-2 px-4 text-amber-400">Rank</th>
                    <th scope="col" className="text-left py-2 px-4 text-amber-400">Player</th>
                    <th scope="col" className="text-right py-2 px-4 text-amber-400">Record</th>
                    <th scope="col" className="text-right py-2 px-4 text-amber-400">Win Rate</th>
                    <th scope="col" className="text-right py-2 px-4 text-amber-400">ELO</th>
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
                          aria-label={`View ${player.playerName}'s profile`}
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
        ) : (
          <Card variant="medieval" className="p-6">
            <EmptyState message="No player statistics available for this class" />
          </Card>
        )}

        {/* Note about game history and trends */}
        <Card variant="medieval" className="p-4">
          <p className="text-sm text-gray-400">
            <strong className="text-amber-400">Note:</strong> Game history and trends over time features are planned for future implementation.
          </p>
        </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
}

