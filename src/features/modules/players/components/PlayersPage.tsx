import React, { useEffect, useState, useMemo } from 'react';
import { PageHero } from '@/features/infrastructure/components';
import { Card } from '@/features/infrastructure/components/ui/Card';
import LoadingScreen from '@/features/infrastructure/components/ui/LoadingScreen';
import type { PlayerStats } from '../types';
import { PlayerCard } from './PlayerCard';
import { usePlayerComparison } from './usePlayerComparison';
import { ComparisonResults } from './ComparisonResults';
import { PlayersActionBar } from './PlayersActionBar';

interface PlayersPageProps {
  pageNamespaces: string[];
}

export function PlayersPage({ pageNamespaces: _pageNamespaces }: PlayersPageProps) {
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    compareMode,
    setCompareMode,
    selectedPlayers,
    togglePlayerSelection,
    comparison,
    comparisonLoading,
    comparisonError,
    handleCompareSelected,
    exitCompareMode,
  } = usePlayerComparison();

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        setError(null);
        // Reduced from 500 to 100 for better initial load performance
        // TODO: Implement pagination for better scalability
        const response = await fetch('/api/players?limit=100');
        if (!response.ok) {
          throw new Error('Failed to load players');
        }
        const result = await response.json();
        // Handle wrapped API response format
        const playersData = result.data || result;
        setPlayers(Array.isArray(playersData) ? playersData : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load players');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  // Memoize filtered players to avoid unnecessary re-computations
  const filteredPlayers = useMemo(() => {
    if (!searchQuery.trim()) {
      return players;
    }
    const query = searchQuery.toLowerCase();
    return players.filter((player) =>
      player.name.toLowerCase().includes(query)
    );
  }, [players, searchQuery]);

  const handleCardClick = (playerName: string) => {
    if (compareMode) {
      togglePlayerSelection(playerName);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)]">
        <PageHero title="Players" description="Browse all players and their statistics" />
        <div className="container mx-auto px-4 py-8">
          <Card variant="medieval" className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-amber-500/20 rounded w-1/4"></div>
              <div className="h-4 bg-amber-500/10 rounded w-1/2"></div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-8rem)]">
        <PageHero title="Players" description="Browse all players and their statistics" />
        <div className="container mx-auto px-4 py-8">
          <Card variant="medieval" className="p-8">
            <p className="text-red-400">Error: {error}</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <PageHero title="Players" description="Browse all players and their statistics" />
      
      <div className="container mx-auto px-4 py-8">
        <PlayersActionBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          compareMode={compareMode}
          selectedCount={selectedPlayers.size}
          comparison={comparison}
          comparisonLoading={comparisonLoading}
          onCompareModeToggle={() => setCompareMode(true)}
          onCompareSelected={handleCompareSelected}
          onExitCompareMode={exitCompareMode}
          onClearSelection={() => setSelectedPlayers(new Set())}
        />

        {/* Comparison Results */}
        {comparison && (
          <ComparisonResults comparison={comparison} error={comparisonError} />
        )}

        {/* Players List - Hidden when showing comparison */}
        {!comparison && (
          <>
            {filteredPlayers.length === 0 ? (
              <Card variant="medieval" className="p-8">
                <p className="text-gray-400">
                  {searchQuery ? 'No players found matching your search.' : 'No players found.'}
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPlayers.map((player) => {
                  const isSelected = selectedPlayers.has(player.name);
                  
                  return (
                    <div key={player.id} className="relative">
                      {compareMode && (
                        <div className="absolute top-2 right-2 z-10">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => togglePlayerSelection(player.name)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-5 h-5 text-amber-600 bg-gray-800 border-gray-600 rounded focus:ring-amber-500 focus:ring-2"
                          />
                        </div>
                      )}
                      <PlayerCard
                        player={player}
                        isSelected={isSelected}
                        compareMode={compareMode}
                        onClick={compareMode ? () => handleCardClick(player.name) : undefined}
                        showLink={!compareMode}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
