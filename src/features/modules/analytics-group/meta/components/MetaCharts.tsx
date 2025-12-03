/**
 * Meta Charts Component - Wrapper for lazy-loaded chart components
 */

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Card } from '@/features/infrastructure/components';
import type {
  ActivityDataPoint,
  GameLengthDataPoint,
  PlayerActivityDataPoint,
  ClassSelectionData,
  ClassWinRateData,
} from '../../analytics/types';

interface MetaChartsProps {
  activity: ActivityDataPoint[];
  gameLength: GameLengthDataPoint[];
  playerActivity: PlayerActivityDataPoint[];
  classSelection: ClassSelectionData[];
  classWinRates: ClassWinRateData[];
}

// Loading placeholder component
const ChartLoadingPlaceholder = () => (
  <Card variant="medieval" className="p-8">
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-amber-500/20 rounded w-1/4"></div>
      <div className="h-64 bg-amber-500/10 rounded"></div>
    </div>
  </Card>
);

// Lazy load chart components to reduce initial bundle size (~300KB)
const ActivityChart = dynamic(
  () => import('../../analytics/components/ActivityChart').then(mod => ({ default: mod.ActivityChart })),
  {
    loading: ChartLoadingPlaceholder,
    ssr: false,
  }
);

const GameLengthChart = dynamic(
  () => import('../../analytics/components/GameLengthChart').then(mod => ({ default: mod.GameLengthChart })),
  {
    loading: ChartLoadingPlaceholder,
    ssr: false,
  }
);

const PlayerActivityChart = dynamic(
  () => import('../../analytics/components/PlayerActivityChart').then(mod => ({ default: mod.PlayerActivityChart })),
  {
    loading: ChartLoadingPlaceholder,
    ssr: false,
  }
);

const ClassSelectionChart = dynamic(
  () => import('../../analytics/components/ClassSelectionChart').then(mod => ({ default: mod.ClassSelectionChart })),
  {
    loading: ChartLoadingPlaceholder,
    ssr: false,
  }
);

const ClassWinRateChart = dynamic(
  () => import('../../analytics/components/ClassWinRateChart').then(mod => ({ default: mod.ClassWinRateChart })),
  {
    loading: ChartLoadingPlaceholder,
    ssr: false,
  }
);

export function MetaCharts({
  activity,
  gameLength,
  playerActivity,
  classSelection,
  classWinRates,
}: MetaChartsProps) {
  return (
    <>
      <Suspense fallback={<ChartLoadingPlaceholder />}>
        <ActivityChart data={activity} title="Activity (Games per Day)" />
      </Suspense>
      <Suspense fallback={<ChartLoadingPlaceholder />}>
        <GameLengthChart data={gameLength} title="Average Game Length" />
      </Suspense>
      <Suspense fallback={<ChartLoadingPlaceholder />}>
        <PlayerActivityChart data={playerActivity} title="Active Players per Month" />
      </Suspense>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<ChartLoadingPlaceholder />}>
          <ClassSelectionChart data={classSelection} title="Class Selection" />
        </Suspense>
        <Suspense fallback={<ChartLoadingPlaceholder />}>
          <ClassWinRateChart data={classWinRates} title="Class Win Rate" />
        </Suspense>
      </div>
    </>
  );
}


