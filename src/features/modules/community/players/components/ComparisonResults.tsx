import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Card } from '@/features/infrastructure/components';
import type { PlayerComparison, PlayerStats, CategoryStats } from '../types';

const ELOComparisonChart = dynamic(
  () => import('./ELOComparisonChart'),
  {
    loading: () => (
      <Card variant="medieval" className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-amber-500/20 rounded w-1/4"></div>
          <div className="h-64 bg-amber-500/10 rounded"></div>
        </div>
      </Card>
    ),
    ssr: false,
  }
);

interface ComparisonResultsProps {
  comparison: PlayerComparison;
  error: string | null;
}

function getBestCategory(player: PlayerStats): [string, CategoryStats] | null {
  const categories = Object.entries(player.categories || {});
  if (categories.length === 0) return null;
  
  return categories.reduce<[string, CategoryStats] | null>((best, [name, stats]) => {
    const bestScore = best ? best[1].score : 0;
    return stats.score > bestScore ? [name, stats] : best;
  }, null);
}

export function ComparisonResults({ comparison, error }: ComparisonResultsProps) {
  return (
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
      {comparison.eloComparison && (
        <Suspense
          fallback={
            <Card variant="medieval" className="p-8">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-amber-500/20 rounded w-1/4"></div>
                <div className="h-64 bg-amber-500/10 rounded"></div>
              </div>
            </Card>
          }
        >
          <ELOComparisonChart
            eloComparison={comparison.eloComparison}
            players={comparison.players}
          />
        </Suspense>
      )}

      {error && (
        <Card variant="medieval" className="p-6">
          <p className="text-red-400">Error: {error}</p>
        </Card>
      )}
    </div>
  );
}


