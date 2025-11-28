import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/features/infrastructure/components/ui/Card';
import type { ClassWinRateData } from '../types';

interface ClassWinRateChartProps {
  data: ClassWinRateData[];
  title?: string;
}

function ClassWinRateChartComponent({ data, title = 'Class Win Rate' }: ClassWinRateChartProps) {
  if (data.length === 0) {
    return (
      <Card variant="medieval" className="p-8 text-center">
        <p className="text-gray-400">No class win rate data available</p>
      </Card>
    );
  }

  // Format data for chart
  const chartData = data.map(item => ({
    className: item.className.charAt(0).toUpperCase() + item.className.slice(1),
    winRate: Number(item.winRate.toFixed(1)),
  }));

  return (
    <Card variant="medieval" className="p-6">
      <h3 className="text-xl font-semibold text-amber-400 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#d97706" opacity={0.2} />
          <XAxis
            type="number"
            domain={[0, 100]}
            stroke="#d97706"
            tick={{ fill: '#d97706' }}
            style={{ fontSize: '12px' }}
            label={{ value: 'Win Rate (%)', position: 'insideBottom', offset: -5, style: { fill: '#d97706' } }}
          />
          <YAxis
            type="category"
            dataKey="className"
            stroke="#d97706"
            tick={{ fill: '#d97706' }}
            style={{ fontSize: '12px' }}
            width={100}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              border: '1px solid rgba(217, 119, 6, 0.3)',
              borderRadius: '4px',
              color: '#d97706',
            }}
            formatter={(value: number) => [`${value}%`, 'Win Rate']}
          />
          <Bar dataKey="winRate" fill="#d97706" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

// Memoize component to prevent unnecessary re-renders when props haven't changed
export const ClassWinRateChart = React.memo(ClassWinRateChartComponent);

