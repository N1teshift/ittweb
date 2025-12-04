import React from 'react';
import Link from 'next/link';
import type { GetServerSideProps } from 'next';
import { PageHero, ErrorBoundary } from '@/features/infrastructure/components';
import { Card } from '@/features/infrastructure/components';
import { ClassSelectionChart, ClassWinRateChart } from '@/features/modules/analytics-group/analytics/components';
import { EmptyState } from '@/features/infrastructure/components';
import type { ClassSelectionData, ClassWinRateData, ClassStats } from '@/features/modules/analytics-group/analytics/types';
import { getClassSelectionData, getClassWinRateData, getClassStats } from '@/features/modules/analytics-group/analytics/lib/analyticsService';
import { logError } from '@/features/infrastructure/logging';

type ClassStatisticsPageProps = {
  classSelection: ClassSelectionData[];
  classWinRates: ClassWinRateData[];
  classStats: ClassStats[];
};

export const getServerSideProps: GetServerSideProps<ClassStatisticsPageProps> = async () => {
  try {
    const [classSelection, classWinRates, classStats] = await Promise.all([
      getClassSelectionData(),
      getClassWinRateData(),
      getClassStats(),
    ]);

    return {
      props: {
        classSelection: classSelection || [],
        classWinRates: classWinRates || [],
        classStats: classStats || [],
      },
    };
  } catch (error) {
    logError(error as Error, 'Failed to load class statistics', {
      component: 'ClassStatisticsPage',
      operation: 'getServerSideProps',
    });
    return {
      props: {
        classSelection: [],
        classWinRates: [],
        classStats: [],
      },
    };
  }
};

export default function ClassStatisticsPage({ classSelection, classWinRates, classStats }: ClassStatisticsPageProps) {

  // Calculate summary statistics
  const totalClasses = classStats.length;
  const mostPopular = classSelection.length > 0 
    ? classSelection.reduce((max, item) => item.count > max.count ? item : max, classSelection[0])
    : null;
  const highestWinRate = classWinRates.length > 0
    ? classWinRates.reduce((max, item) => item.winRate > max.winRate ? item : max, classWinRates[0])
    : null;

  return (
    <ErrorBoundary>
      <div className="min-h-[calc(100vh-8rem)]">
        <PageHero title="Class Statistics" description="View class performance and popularity" />
        
        <div className="container mx-auto px-4 py-8">
          {/* Help Text */}
          <Card variant="medieval" className="p-4 mb-6 bg-amber-500/10 border-amber-500/30">
            <p className="text-sm text-gray-300">
              <span className="text-amber-400 font-semibold">💡 Tip:</span> This page shows statistics for all troll classes across all recorded games. 
              Click on any class card below to view detailed statistics including win rates, top players, and performance trends.
            </p>
          </Card>
        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card variant="medieval" className="p-6">
            <h3 className="text-sm text-gray-400 mb-2">Total Classes</h3>
            <p className="text-3xl font-bold text-amber-400">{totalClasses}</p>
          </Card>
          {mostPopular && (
            <Card variant="medieval" className="p-6">
              <h3 className="text-sm text-gray-400 mb-2">Most Popular</h3>
              <p className="text-2xl font-bold text-amber-400 capitalize">{mostPopular.className}</p>
              <p className="text-sm text-gray-400 mt-1">{mostPopular.count} games</p>
            </Card>
          )}
          {highestWinRate && (
            <Card variant="medieval" className="p-6">
              <h3 className="text-sm text-gray-400 mb-2">Highest Win Rate</h3>
              <p className="text-2xl font-bold text-green-400 capitalize">{highestWinRate.className}</p>
              <p className="text-sm text-gray-400 mt-1">{highestWinRate.winRate.toFixed(1)}%</p>
            </Card>
          )}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ClassSelectionChart data={classSelection} title="Class Selection" />
          <ClassWinRateChart data={classWinRates} title="Class Win Rate" />
        </div>

        {/* Class List with Links to Detail Pages */}
        {classStats.length === 0 ? (
          <EmptyState message="No class statistics available" />
        ) : (
          <Card variant="medieval" className="p-6">
            <h2 className="text-2xl font-semibold text-amber-400 mb-4">All Classes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classStats.map((classStat) => (
                <Link
                  key={classStat.id}
                  href={`/analytics/classes/${encodeURIComponent(classStat.id)}`}
                  className="block"
                >
                  <Card variant="medieval" className="p-4 hover:border-amber-500/50 transition-colors cursor-pointer h-full">
                    <h3 className="text-lg font-semibold text-amber-400 mb-2 capitalize">
                      {classStat.id}
                    </h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Games:</span>
                        <span className="text-amber-300">{classStat.totalGames}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Win Rate:</span>
                        <span className="text-green-400">
                          {classStat.winRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Record:</span>
                        <span className="text-white">
                          {classStat.totalWins}W - {classStat.totalLosses}L
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </Card>
        )}
        </div>
      </div>
    </ErrorBoundary>
  );
}


