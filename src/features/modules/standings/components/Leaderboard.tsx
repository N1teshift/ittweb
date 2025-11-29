import React from 'react';
import Link from 'next/link';
import { Card } from '@/features/infrastructure/components/ui/Card';
import LoadingScreen from '@/features/infrastructure/components/ui/LoadingScreen';
import { EmptyState } from '@/features/infrastructure/components/ui';
import { useStandings } from '../hooks/useStandings';
import type { StandingsFilters } from '../types';

interface LeaderboardProps {
  filters?: StandingsFilters;
}

export function Leaderboard({ filters = {} }: LeaderboardProps) {
  const { standings, loading, error } = useStandings(filters);

  if (loading) {
    return <LoadingScreen message="Loading standings..." />;
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
      <EmptyState 
        message="No standings available"
      />
    );
  }

  return (
    <Card variant="medieval" className="p-6">
      <table 
        className="w-full" 
        role="table" 
        aria-label="Player standings leaderboard"
      >
        <thead>
          <tr className="border-b border-amber-500/30">
            <th scope="col" className="text-left py-2 px-4 text-amber-400">Rank</th>
            <th scope="col" className="text-left py-2 px-4 text-amber-400">Player</th>
            <th scope="col" className="text-right py-2 px-4 text-amber-400">ELO</th>
            <th scope="col" className="text-right py-2 px-4 text-amber-400">Wins</th>
            <th scope="col" className="text-right py-2 px-4 text-amber-400">Losses</th>
            <th scope="col" className="text-right py-2 px-4 text-amber-400">Win Rate</th>
            <th scope="col" className="text-right py-2 px-4 text-amber-400">Games</th>
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
                  aria-label={`View ${entry.name}'s profile`}
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


