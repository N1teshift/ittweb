import React from 'react';
import { useGames } from '../hooks/useGames';
import { GameCard } from './GameCard';
import { Card } from '@/features/infrastructure/components/ui/Card';
import type { GameFilters } from '../types';

interface GameListProps {
  filters?: GameFilters;
}

export function GameList({ filters = {} }: GameListProps) {
  const { games, loading, error } = useGames(filters);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} variant="medieval" className="p-4 animate-pulse">
            <div className="h-6 bg-amber-500/20 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-amber-500/10 rounded w-1/2"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card variant="medieval" className="p-4">
        <p className="text-red-400">Error loading games: {error.message}</p>
      </Card>
    );
  }

  if (games.length === 0) {
    return (
      <Card variant="medieval" className="p-8 text-center">
        <p className="text-gray-400">No games found</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}


