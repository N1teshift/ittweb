import { useState } from 'react';
import type { PlayerComparison } from '../types';

export function usePlayerComparison() {
  const [compareMode, setCompareMode] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [comparison, setComparison] = useState<PlayerComparison | null>(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [comparisonError, setComparisonError] = useState<string | null>(null);

  const togglePlayerSelection = (playerName: string) => {
    const newSelected = new Set(selectedPlayers);
    if (newSelected.has(playerName)) {
      newSelected.delete(playerName);
    } else {
      newSelected.add(playerName);
    }
    setSelectedPlayers(newSelected);
  };

  const handleCompareSelected = async () => {
    if (selectedPlayers.size >= 2) {
      const names = Array.from(selectedPlayers).join(',');
      try {
        setComparisonLoading(true);
        setComparisonError(null);
        const response = await fetch(`/api/players/compare?names=${encodeURIComponent(names)}`);
        if (!response.ok) {
          throw new Error('Failed to load comparison');
        }
        const result = await response.json();
        const comparisonData = result.data || result;
        setComparison(comparisonData);
      } catch (err) {
        setComparisonError(err instanceof Error ? err.message : 'Failed to load comparison');
      } finally {
        setComparisonLoading(false);
      }
    }
  };

  const exitCompareMode = () => {
    setCompareMode(false);
    setSelectedPlayers(new Set());
    setComparison(null);
    setComparisonError(null);
  };

  return {
    compareMode,
    setCompareMode,
    selectedPlayers,
    setSelectedPlayers,
    togglePlayerSelection,
    comparison,
    comparisonLoading,
    comparisonError,
    handleCompareSelected,
    exitCompareMode,
  };
}


