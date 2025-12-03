import React from 'react';
import { Card } from '@/features/infrastructure/components';
import { LoadingScreen } from '@/features/infrastructure/components';
import { EmptyState } from '@/features/infrastructure/components';
import { useStandings } from '../hooks/useStandings';
import { LeaderboardRow } from './LeaderboardRow';
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
    <Card variant="medieval" className="p-4 md:p-6">
      {/* Mobile: Horizontal scroll wrapper */}
      <div className="overflow-x-auto -mx-4 md:mx-0">
        <div className="inline-block min-w-full align-middle px-4 md:px-0">
          <table 
            className="w-full min-w-[640px] md:min-w-0" 
            role="table" 
            aria-label="Player standings leaderboard"
          >
            <thead>
              <tr className="border-b border-amber-500/30">
                <th scope="col" className="text-left py-2 px-2 md:px-4 text-amber-400 text-sm md:text-base">Rank</th>
                <th scope="col" className="text-left py-2 px-2 md:px-4 text-amber-400 text-sm md:text-base">Player</th>
                <th scope="col" className="text-right py-2 px-2 md:px-4 text-amber-400 text-sm md:text-base">ELO</th>
                <th scope="col" className="text-right py-2 px-2 md:px-4 text-amber-400 text-sm md:text-base hidden sm:table-cell">Wins</th>
                <th scope="col" className="text-right py-2 px-2 md:px-4 text-amber-400 text-sm md:text-base hidden sm:table-cell">Losses</th>
                <th scope="col" className="text-right py-2 px-2 md:px-4 text-amber-400 text-sm md:text-base">Win Rate</th>
                <th scope="col" className="text-right py-2 px-2 md:px-4 text-amber-400 text-sm md:text-base hidden md:table-cell">Games</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((entry) => (
                <LeaderboardRow key={entry.name} entry={entry} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}



