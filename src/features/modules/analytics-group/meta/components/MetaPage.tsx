import React from 'react';
import { PageHero } from '@/features/infrastructure/components';
import { Card } from '@/features/infrastructure/components';
import { useMetaFilters } from './useMetaFilters';
import { useMetaData } from './useMetaData';
import { MetaFilters } from './MetaFilters';
import { MetaCharts } from './MetaCharts';
import { ITTStatsOverview } from './ITTStatsOverview';

interface MetaPageProps {
  pageNamespaces: string[];
}

export function MetaPage({ pageNamespaces: _pageNamespaces }: MetaPageProps) {
  const {
    category,
    teamFormat,
    startDate,
    endDate,
    debouncedCategory,
    debouncedTeamFormat,
    debouncedStartDate,
    debouncedEndDate,
    setCategory,
    setTeamFormat,
    setStartDate,
    setEndDate,
    resetFilters,
  } = useMetaFilters();

  const { metaData, loading, error } = useMetaData({
    category: debouncedCategory,
    teamFormat: debouncedTeamFormat,
    startDate: debouncedStartDate,
    endDate: debouncedEndDate,
  });

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)]">
        <PageHero title="Meta Statistics" description="View game meta statistics and trends" />
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
        <PageHero title="Meta Statistics" description="View game meta statistics and trends" />
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
      <PageHero title="Meta Statistics" description="View game meta statistics and trends" />
      
      <div className="container mx-auto px-4 py-8 space-y-6">
        <MetaFilters
          category={category}
          teamFormat={teamFormat}
          startDate={startDate}
          endDate={endDate}
          onCategoryChange={setCategory}
          onTeamFormatChange={setTeamFormat}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onReset={resetFilters}
        />

        {/* ITT Community Statistics */}
        <ITTStatsOverview
          category={debouncedCategory}
          startDate={debouncedStartDate}
          endDate={debouncedEndDate}
        />

        {metaData ? (
          <>
            {/* Check if we have any data to show */}
            {metaData.activity.length === 0 && 
             metaData.gameLength.length === 0 && 
             metaData.playerActivity.length === 0 && 
             metaData.classSelection.length === 0 && 
             metaData.classWinRates.length === 0 ? (
              <Card variant="medieval" className="p-8">
                <div className="text-center">
                  <p className="text-gray-400 text-lg mb-2">No game data available</p>
                  <p className="text-gray-500 text-sm mb-4">
                    Meta statistics require completed games with uploaded and parsed replay data.
                    <br />
                    Make sure you have at least one completed game with replay data uploaded.
                  </p>
                  <div className="text-left text-xs text-gray-600 bg-gray-900/50 p-4 rounded border border-gray-700">
                    <p className="font-semibold mb-2">Troubleshooting:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Check that your game has <code className="bg-gray-800 px-1 rounded">gameState: &quot;completed&quot;</code></li>
                      <li>Verify the game has a <code className="bg-gray-800 px-1 rounded">datetime</code> field</li>
                      <li>Ensure the game&apos;s date is within the selected date range (default: last 365 days)</li>
                      <li>Check browser console for any errors</li>
                      <li>Try adjusting the date filters to include your game&apos;s date</li>
                    </ul>
                  </div>
                </div>
              </Card>
            ) : (
              <MetaCharts
                activity={metaData.activity}
                gameLength={metaData.gameLength}
                playerActivity={metaData.playerActivity}
                classSelection={metaData.classSelection}
                classWinRates={metaData.classWinRates}
              />
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

