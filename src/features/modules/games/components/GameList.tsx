import React from 'react';
import { useGames } from '../hooks/useGames';
import { GameCard } from './GameCard';
import { Card } from '@/features/infrastructure/components/ui/Card';
import LoadingScreen from '@/features/infrastructure/components/ui/LoadingScreen';
import { EmptyState } from '@/features/infrastructure/components/ui';
import type { GameFilters } from '../types';

interface GameListProps {
  filters?: GameFilters;
}

export function GameList({ filters = {} }: GameListProps) {
  const { games, loading, error } = useGames(filters);

  if (loading) {
    return <LoadingScreen message="Loading games..." />;
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
      <EmptyState 
        message="No games found"
      />
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


