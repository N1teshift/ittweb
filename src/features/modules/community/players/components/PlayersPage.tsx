import React, { useEffect, useState, useMemo } from 'react';
import { PageHero } from '@/features/infrastructure/components';
import { Card } from '@/features/infrastructure/components';
import { LoadingScreen } from '@/features/infrastructure/components';
import { EmptyState } from '@/features/infrastructure/components';
import type { PlayerStats } from '../types';
import { PlayerCard } from './PlayerCard';
import { usePlayerComparison } from '../hooks/usePlayerComparison';
import { ComparisonResults } from './ComparisonResults';
import { PlayersActionBar } from './PlayersActionBar';

interface PlayersPageProps {
  pageNamespaces: string[];
}

export function PlayersPage({ pageNamespaces: _pageNamespaces }: PlayersPageProps) {
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [lastPlayerName, setLastPlayerName] = useState<string | null>(null);

  const {
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
  } = usePlayerComparison();

  const fetchPlayers = async (isInitialLoad: boolean = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
        setPlayers([]);
        setLastPlayerName(null);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const params = new URLSearchParams();
      params.append('limit', '50');
      if (lastPlayerName && !isInitialLoad) {
        params.append('lastPlayerName', lastPlayerName);
      }

      const response = await fetch(`/api/players?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to load players');
      }
      const result = await response.json();
      // Handle wrapped API response format
      const responseData = result.data || result;
      
      if (isInitialLoad) {
        setPlayers(responseData.players || []);
      } else {
        setPlayers(prev => [...prev, ...(responseData.players || [])]);
      }
      
      setHasMore(responseData.hasMore ?? false);
      setLastPlayerName(responseData.lastPlayerName ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load players');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPlayers(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !searchQuery.trim()) {
      fetchPlayers(false);
    }
  };

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
          <LoadingScreen message="Loading players..." />
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
        {comparisonLoading && (
          <Card variant="medieval" className="p-6 mb-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-amber-500/20 rounded w-1/4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-amber-500/10 rounded"></div>
                ))}
              </div>
            </div>
          </Card>
        )}
        {comparison && !comparisonLoading && (
          <ComparisonResults comparison={comparison} error={comparisonError} />
        )}
        {comparisonError && !comparisonLoading && (
          <Card variant="medieval" className="p-6 mb-6">
            <p className="text-red-400">Error loading comparison: {comparisonError}</p>
          </Card>
        )}

        {/* Players List - Hidden when showing comparison */}
        {!comparison && (
          <>
            {filteredPlayers.length === 0 ? (
              <EmptyState
                message={searchQuery 
                  ? `No players found matching "${searchQuery}". Try a different search term.`
                  : 'No players found.'
                }
              />
            ) : (
              <>
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
                
                {/* Load More Button - Only show when not searching and there are more players */}
                {!searchQuery.trim() && hasMore && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="px-6 py-3 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-lg hover:bg-amber-500/30 hover:border-amber-400/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Load more players"
                    >
                      {loadingMore ? 'Loading...' : 'Load More Players'}
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

