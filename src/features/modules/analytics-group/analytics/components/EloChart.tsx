import React, { Suspense, lazy } from 'react';
import { Card } from '@/features/infrastructure/components';
import type { EloHistoryDataPoint } from '../../analytics/types';

interface EloChartProps {
  data: EloHistoryDataPoint[];
  title?: string;
}

// Lazy load Recharts to reduce initial bundle size
const ChartContent = lazy(async () => {
  const recharts = await import('recharts');
  return {
    default: ({ data, title }: EloChartProps) => {
      const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = recharts;
      
      return (
        <Card variant="medieval" className="p-6">
          <h3 className="text-xl font-semibold text-amber-400 mb-4">{title}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
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
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(217, 119, 6, 0.3)',
                  borderRadius: '4px',
                  color: '#d97706',
                }}
              />
              <Legend wrapperStyle={{ color: '#d97706' }} />
              <Line
                type="monotone"
                dataKey="elo"
                stroke="#d97706"
                strokeWidth={2}
                dot={{ fill: '#d97706', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
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

function EloChartComponent({ data, title = 'ELO History' }: EloChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card variant="medieval" className="p-8 text-center">
        <p className="text-gray-400">No ELO history available</p>
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
export const EloChart = React.memo(EloChartComponent);

