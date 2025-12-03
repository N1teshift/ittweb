import React from 'react';
import { Card } from '@/features/infrastructure/components';
import type { PlayerComparison } from '../types';

interface PlayersActionBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  compareMode: boolean;
  selectedCount: number;
  comparison: PlayerComparison | null;
  comparisonLoading: boolean;
  onCompareModeToggle: () => void;
  onCompareSelected: () => void;
  onExitCompareMode: () => void;
  onClearSelection: () => void;
}

export function PlayersActionBar({
  searchQuery,
  onSearchChange,
  compareMode,
  selectedCount,
  comparison,
  comparisonLoading,
  onCompareModeToggle,
  onCompareSelected,
  onExitCompareMode,
  onClearSelection,
}: PlayersActionBarProps) {
  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full max-w-md bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
          />
        </div>
        
        <div className="flex gap-2">
          {!compareMode ? (
            <button
              onClick={onCompareModeToggle}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded transition-colors"
            >
              Select to Compare
            </button>
          ) : (
            <>
              {!comparison && selectedCount >= 2 && (
                <button
                  onClick={onCompareSelected}
                  disabled={comparisonLoading}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {comparisonLoading ? 'Loading...' : `Compare Selected (${selectedCount})`}
                </button>
              )}
              <button
                onClick={onExitCompareMode}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
              >
                {comparison ? 'Back to Players' : 'Cancel'}
              </button>
            </>
          )}
        </div>
      </div>

      {compareMode && !comparison && (
        <Card variant="medieval" className="mb-6 p-4 bg-amber-500/10 border-amber-500/30">
          <div className="flex items-center justify-between">
            <p className="text-amber-300">
              Select at least 2 players to compare. Selected: {selectedCount}
            </p>
            {selectedCount > 0 && (
              <button
                onClick={onClearSelection}
                className="text-sm text-amber-400 hover:text-amber-300 underline"
              >
                Clear Selection
              </button>
            )}
          </div>
        </Card>
      )}
    </>
  );
}


