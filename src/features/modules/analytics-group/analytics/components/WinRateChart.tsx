import React, { Suspense, lazy } from 'react';
import { Card } from '@/features/infrastructure/components';
import type { WinRateData } from '../../analytics/types';

interface WinRateChartProps {
  data: WinRateData;
  title?: string;
}

const COLORS = ['#10b981', '#ef4444', '#f59e0b']; // green, red, yellow

// Lazy load Recharts to reduce initial bundle size
const ChartContent = lazy(async () => {
  const recharts = await import('recharts');
  return {
    default: ({ data, title }: WinRateChartProps) => {
      const { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } = recharts;
      
      const chartData = [
        { name: 'Wins', value: data.wins, color: COLORS[0] },
        { name: 'Losses', value: data.losses, color: COLORS[1] },
        { name: 'Draws', value: data.draws, color: COLORS[2] },
      ].filter(item => item.value > 0);

      return (
        <Card variant="medieval" className="p-6">
          <h3 className="text-xl font-semibold text-amber-400 mb-4">{title}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(217, 119, 6, 0.3)',
                  borderRadius: '4px',
                  color: '#d97706',
                }}
              />
              <Legend wrapperStyle={{ color: '#d97706' }} />
            </PieChart>
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

export function WinRateChart({ data, title = 'Win Rate' }: WinRateChartProps) {
  const chartData = [
    { name: 'Wins', value: data.wins, color: COLORS[0] },
    { name: 'Losses', value: data.losses, color: COLORS[1] },
    { name: 'Draws', value: data.draws, color: COLORS[2] },
  ].filter(item => item.value > 0);

  if (chartData.length === 0) {
    return (
      <Card variant="medieval" className="p-8 text-center">
        <p className="text-gray-400">No win rate data available</p>
      </Card>
    );
  }

  return (
    <Suspense fallback={<ChartLoadingPlaceholder />}>
      <ChartContent data={data} title={title} />
    </Suspense>
  );
}



