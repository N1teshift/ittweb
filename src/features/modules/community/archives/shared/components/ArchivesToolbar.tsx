import React, { memo, useState } from 'react';
import SortToggle from './sections/SortToggle';
import type { GameFilters } from '@/features/modules/game-management/games/types';

interface ArchivesToolbarProps {
  isAuthenticated: boolean;
  entriesCount: number;
  sortOrder: 'newest' | 'oldest';
  filters: GameFilters;
  onAddClick: () => void;
  onSignInClick: () => void;
  onSortOrderChange: (order: 'newest' | 'oldest') => void;
  onFiltersChange: (filters: GameFilters) => void;
}

const ArchivesToolbar: React.FC<ArchivesToolbarProps> = memo(({
  isAuthenticated,
  entriesCount,
  sortOrder,
  filters,
  onAddClick,
  onSignInClick,
  onSortOrderChange,
  onFiltersChange,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState<GameFilters>(filters);

  const handleFilterChange = (key: keyof GameFilters, value: string | undefined) => {
    const newFilters = { ...localFilters, [key]: value || undefined };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: GameFilters = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const hasActiveFilters = !!(localFilters.category || localFilters.player || localFilters.startDate || localFilters.endDate);

  return (
    <div className="sticky top-16 z-40 bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60 border-y border-amber-500/20">
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4 mb-3">
          {isAuthenticated ? (
            <button
              onClick={onAddClick}
              className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2 rounded-lg border border-amber-500 font-medium transition-colors"
            >
              Become an Archivist
            </button>
          ) : (
            <button
              onClick={onSignInClick}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg border border-indigo-500 font-medium transition-colors"
            >
              Sign in with Discord to contribute
            </button>
          )}
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                hasActiveFilters
                  ? 'bg-amber-600/20 border-amber-500/50 text-amber-300 hover:bg-amber-600/30'
                  : 'bg-gray-700/50 border-gray-600/50 text-gray-300 hover:bg-gray-700/70'
              }`}
            >
              Filters {hasActiveFilters && '●'}
            </button>
            {entriesCount > 0 && (
              <SortToggle sortOrder={sortOrder} onChange={onSortOrderChange} />
            )}
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 p-4 bg-black/40 rounded-lg border border-amber-500/20 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Category</label>
                <input
                  type="text"
                  placeholder="e.g., 1v1, 2v2"
                  value={localFilters.category || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-amber-500/30 rounded text-white text-sm placeholder-gray-500 focus:border-amber-500/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Player</label>
                <input
                  type="text"
                  placeholder="Player name"
                  value={localFilters.player || ''}
                  onChange={(e) => handleFilterChange('player', e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-amber-500/30 rounded text-white text-sm placeholder-gray-500 focus:border-amber-500/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Start Date</label>
                <input
                  type="date"
                  value={localFilters.startDate || ''}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-amber-500/30 rounded text-white text-sm focus:border-amber-500/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">End Date</label>
                <input
                  type="date"
                  value={localFilters.endDate || ''}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-amber-500/30 rounded text-white text-sm focus:border-amber-500/50 focus:outline-none"
                />
              </div>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-amber-400 hover:text-amber-300 underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

ArchivesToolbar.displayName = 'ArchivesToolbar';

export default ArchivesToolbar;


