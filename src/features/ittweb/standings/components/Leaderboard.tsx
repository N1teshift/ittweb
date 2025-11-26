import React from 'react';
import Link from 'next/link';
import { Card } from '@/features/infrastructure/shared/components/ui/Card';
import { useStandings } from '../hooks/useStandings';
import type { StandingsFilters } from '../types';

interface LeaderboardProps {
  filters?: StandingsFilters;
}

export function Leaderboard({ filters = {} }: LeaderboardProps) {
  const { standings, loading, error } = useStandings(filters);

  if (loading) {
    return (
      <Card variant="medieval" className="p-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-amber-500/20 rounded"></div>
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="medieval" className="p-8">
        <p className="text-red-400">Error loading standings: {error.message}</p>
      </Card>
    );
  }

  if (standings.length === 0) {
    return (
      <Card variant="medieval" className="p-8 text-center">
        <p className="text-gray-400">No standings available</p>
      </Card>
    );
  }

  return (
    <Card variant="medieval" className="p-6">
      <table className="w-full">
        <thead>
          <tr className="border-b border-amber-500/30">
            <th className="text-left py-2 px-4 text-amber-400">Rank</th>
            <th className="text-left py-2 px-4 text-amber-400">Player</th>
            <th className="text-right py-2 px-4 text-amber-400">ELO</th>
            <th className="text-right py-2 px-4 text-amber-400">Wins</th>
            <th className="text-right py-2 px-4 text-amber-400">Losses</th>
            <th className="text-right py-2 px-4 text-amber-400">Win Rate</th>
            <th className="text-right py-2 px-4 text-amber-400">Games</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((entry) => (
            <tr key={entry.name} className="border-b border-amber-500/10 hover:bg-amber-500/5">
              <td className="py-3 px-4 text-gray-300 font-semibold">#{entry.rank}</td>
              <td className="py-3 px-4">
                <Link
                  href={`/players/${encodeURIComponent(entry.name)}`}
                  className="text-amber-300 hover:text-amber-200"
                >
                  {entry.name}
                </Link>
              </td>
              <td className="py-3 px-4 text-right text-amber-400 font-semibold">
                {Math.round(entry.score)}
              </td>
              <td className="py-3 px-4 text-right text-green-400">{entry.wins}</td>
              <td className="py-3 px-4 text-right text-red-400">{entry.losses}</td>
              <td className="py-3 px-4 text-right text-gray-300">
                {entry.winRate.toFixed(1)}%
              </td>
              <td className="py-3 px-4 text-right text-gray-400">{entry.games}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

