import React, { useState } from 'react';
import { DateRangeFilter } from './DateRangeFilter';
import { PlayerFilter } from './PlayerFilter';
import { TeamFormatFilter } from './TeamFormatFilter';
import { Button } from '@/features/infrastructure/components';
import { Card } from '@/features/infrastructure/components';
import type { GameFilters } from '@/features/modules/game-management/games/types';

interface GameFiltersProps {
  filters: GameFilters;
  onFiltersChange: (filters: GameFilters) => void;
  onReset: () => void;
}

export function GameFiltersComponent({
  filters,
  onFiltersChange,
  onReset,
}: GameFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Parse ally/enemy from comma-separated strings
  const allies = filters.ally ? filters.ally.split(',').filter(Boolean) : [];
  const enemies = filters.enemy ? filters.enemy.split(',').filter(Boolean) : [];

  // Parse dates from ISO strings
  const startDate = filters.startDate ? new Date(filters.startDate) : null;
  const endDate = filters.endDate ? new Date(filters.endDate) : null;

  // Count active filters
  const activeFilterCount = [
    filters.startDate,
    filters.endDate,
    filters.ally,
    filters.enemy,
    filters.teamFormat,
    filters.category,
    filters.player,
  ].filter(Boolean).length;

  const handleDateRangeChange = (start: Date | null, end: Date | null) => {
    onFiltersChange({
      ...filters,
      startDate: start ? start.toISOString().split('T')[0] : undefined,
      endDate: end ? end.toISOString().split('T')[0] : undefined,
    });
  };

  const handlePlayerFilterChange = (newAllies: string[], newEnemies: string[]) => {
    onFiltersChange({
      ...filters,
      ally: newAllies.length > 0 ? newAllies.join(',') : undefined,
      enemy: newEnemies.length > 0 ? newEnemies.join(',') : undefined,
    });
  };

  const handleTeamFormatChange = (format: string | undefined) => {
    onFiltersChange({
      ...filters,
      teamFormat: format,
    });
  };

  return (
    <Card variant="medieval" className="p-4">
      <div className="space-y-4">
        {/* Header with expand/collapse */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-amber-400">Filters</h3>
            {activeFilterCount > 0 && (
              <span className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded text-sm">
                {activeFilterCount} active
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
              >
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? 'Collapse filters' : 'Expand filters'}
            >
              {isExpanded ? '▼' : '▶'}
            </Button>
          </div>
        </div>

        {/* Filter Content */}
        {isExpanded && (
          <div className="space-y-4 pt-2 border-t border-amber-500/20">
            <DateRangeFilter
              startDate={startDate}
              endDate={endDate}
              onChange={handleDateRangeChange}
            />

            <PlayerFilter
              allies={allies}
              enemies={enemies}
              onChange={handlePlayerFilterChange}
            />

            <TeamFormatFilter
              value={filters.teamFormat}
              onChange={handleTeamFormatChange}
            />
          </div>
        )}
      </div>
    </Card>
  );
}


