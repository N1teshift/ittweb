import React from 'react';
import { GameList } from '@/features/modules/games/components/GameList';
import { GameFiltersComponent } from '@/features/modules/shared/components';
import { useGameFilters } from '@/features/modules/games/hooks/useGameFilters';

export default function GamesPage() {
  const { filters, setFilters, resetFilters } = useGameFilters();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-amber-400 mb-8">Games</h1>
      
      <div className="mb-6">
        <GameFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
          onReset={resetFilters}
        />
      </div>

      <GameList filters={filters} />
    </div>
  );
}

