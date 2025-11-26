import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/features/infrastructure/shared/components/ui/Card';
import type { GameLengthDataPoint } from '../types';

interface GameLengthChartProps {
  data: GameLengthDataPoint[];
  title?: string;
}

export function GameLengthChart({ data, title = 'Average Game Length' }: GameLengthChartProps) {
  if (data.length === 0 || data.every(d => d.averageDuration === 0)) {
    return (
      <Card variant="medieval" className="p-8 text-center">
        <p className="text-gray-400">No game length data available</p>
      </Card>
    );
  }

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
            label={{ value: 'Minutes', angle: -90, position: 'insideLeft', style: { fill: '#d97706' } }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              border: '1px solid rgba(217, 119, 6, 0.3)',
              borderRadius: '4px',
              color: '#d97706',
            }}
            formatter={(value: number) => [`${value.toFixed(1)} min`, 'Average Duration']}
          />
          <Area
            type="monotone"
            dataKey="averageDuration"
            stroke="#d97706"
            fill="#d97706"
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}

