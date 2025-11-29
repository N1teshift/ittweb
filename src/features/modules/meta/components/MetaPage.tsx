import React from 'react';
import { PageHero } from '@/features/infrastructure/components';
import { Card } from '@/features/infrastructure/components/ui/Card';
import { useMetaFilters } from './useMetaFilters';
import { useMetaData } from './useMetaData';
import { MetaFilters } from './MetaFilters';
import { MetaCharts } from './MetaCharts';

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

        {metaData && (
          <MetaCharts
            activity={metaData.activity}
            gameLength={metaData.gameLength}
            playerActivity={metaData.playerActivity}
            classSelection={metaData.classSelection}
            classWinRates={metaData.classWinRates}
          />
        )}
      </div>
    </div>
  );
}
