import React, { useState } from 'react';
import { Leaderboard } from '@/features/modules/community/standings/components/Leaderboard';
import { CategorySelector } from '@/features/modules/community/standings/components/CategorySelector';
import { ErrorBoundary } from '@/features/infrastructure/components';
import type { StandingsFilters } from '@/features/modules/community/standings/types';

export default function StandingsPage() {
  const [category, setCategory] = useState<string | undefined>();

  const filters: StandingsFilters = {
    category,
    limit: 50,
  };

  return (
    <ErrorBoundary>
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-4xl font-bold text-amber-400 mb-4 md:mb-6">Leaderboard</h1>
      
      <div className="mb-6">
        <CategorySelector value={category} onChange={setCategory} />
      </div>

      <Leaderboard filters={filters} />
    </div>
    </ErrorBoundary>
  );
}


