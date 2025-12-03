import React, { Suspense, lazy } from 'react';
import { Card } from '@/features/infrastructure/components';
import type { PlayerStats } from '../types';

interface ELOComparisonChartProps {
  eloComparison: Array<Record<string, string | number>>;
  players: PlayerStats[];
}

// Lazy load Recharts to reduce initial bundle size
const ChartContent = lazy(async () => {
  const recharts = await import('recharts');
  return {
    default: ({ eloComparison, players }: ELOComparisonChartProps) => {
      const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = recharts;
      
      return (
        <Card variant="medieval" className="p-6">
          <h2 className="text-2xl font-semibold text-amber-400 mb-4">ELO Comparison</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={eloComparison}>
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
              {players.map((player, index) => {
                const colors = ['#d97706', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
                return (
                  <Line
                    key={player.name}
                    type="monotone"
                    dataKey={player.name}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                );
              })}
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
      <div className="h-6 bg-amber-500/20 rounded w-1/3"></div>
      <div className="h-96 bg-amber-500/10 rounded"></div>
    </div>
  </Card>
);

function ELOComparisonChartComponent({ eloComparison, players }: ELOComparisonChartProps) {
  if (!eloComparison || eloComparison.length === 0) {
    return (
      <Card variant="medieval" className="p-6">
        <p className="text-gray-400 text-center">No ELO history data available for comparison.</p>
      </Card>
    );
  }

  return (
    <Suspense fallback={<ChartLoadingPlaceholder />}>
      <ChartContent eloComparison={eloComparison} players={players} />
    </Suspense>
  );
}

// Memoize component to prevent unnecessary re-renders when props haven't changed
const ELOComparisonChart = React.memo(ELOComparisonChartComponent);

export default ELOComparisonChart;


