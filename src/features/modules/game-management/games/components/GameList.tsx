import React from 'react';
import { useGames } from '../hooks/useGames';
import { GameCard } from './GameCard';
import { Card } from '@/features/infrastructure/components';
import { LoadingScreen } from '@/features/infrastructure/components';
import { EmptyState } from '@/features/infrastructure/components';
import type { GameFilters } from '../types';

interface GameListProps {
  filters?: GameFilters;
}

export function GameList({ filters = {} }: GameListProps) {
  const { games, loading, error } = useGames(filters);

  // Check if any filters are active (excluding pagination filters)
  const hasActiveFilters = Boolean(
    filters.gameState ||
    filters.startDate ||
    filters.endDate ||
    filters.category ||
    filters.player ||
    filters.ally ||
    filters.enemy ||
    filters.teamFormat ||
    filters.gameId
  );

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
        message={hasActiveFilters 
          ? "No games match your filters. Try adjusting your search criteria."
          : "No games found"
        }
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



