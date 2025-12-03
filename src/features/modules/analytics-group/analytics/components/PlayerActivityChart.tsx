import React, { Suspense, lazy } from 'react';
import { Card } from '@/features/infrastructure/components';
import type { PlayerActivityDataPoint } from '../types';

interface PlayerActivityChartProps {
  data: PlayerActivityDataPoint[];
  title?: string;
}

// Lazy load Recharts to reduce initial bundle size
const ChartContent = lazy(async () => {
  const recharts = await import('recharts');
  return {
    default: ({ data, title }: PlayerActivityChartProps) => {
      const { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = recharts;
      
      return (
        <Card variant="medieval" className="p-6">
          <h3 className="text-xl font-semibold text-amber-400 mb-4">{title}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d97706" opacity={0.2} />
              <XAxis
                dataKey="date"
                stroke="#d97706"
                tick={{ fill: '#d97706' }}
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#d97706"
                tick={{ fill: '#d97706' }}
                style={{ fontSize: '12px' }}
                label={{ value: 'Players', angle: -90, position: 'insideLeft', style: { fill: '#d97706' } }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(217, 119, 6, 0.3)',
                  borderRadius: '4px',
                  color: '#d97706',
                }}
                formatter={(value: number) => [`${value} players`, 'Active Players']}
              />
              <Area
                type="monotone"
                dataKey="players"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      );
    },
  };
});

const ChartLoadingPlaceholder = () => (
  <Card variant="medieval" className="p-6">
    <div className="animate-pulse space-y-4">
      <div className="h-6 bg-amber-500/20 rounded w-1/4"></div>
      <div className="h-64 bg-amber-500/10 rounded"></div>
    </div>
  </Card>
);

function PlayerActivityChartComponent({ data, title = 'Active Players' }: PlayerActivityChartProps) {
  if (!data || data.length === 0 || data.every(d => d.players === 0)) {
    return (
      <Card variant="medieval" className="p-8 text-center">
        <p className="text-gray-400">No player activity data available</p>
      </Card>
    );
  }

  return (
    <Suspense fallback={<ChartLoadingPlaceholder />}>
      <ChartContent data={data} title={title} />
    </Suspense>
  );
}

// Memoize component to prevent unnecessary re-renders when props haven't changed
export const PlayerActivityChart = React.memo(PlayerActivityChartComponent);


