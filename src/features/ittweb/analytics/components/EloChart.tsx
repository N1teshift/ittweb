import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/features/infrastructure/shared/components/ui/Card';
import type { EloHistoryDataPoint } from '../../analytics/types';

interface EloChartProps {
  data: EloHistoryDataPoint[];
  title?: string;
}

export function EloChart({ data, title = 'ELO History' }: EloChartProps) {
  if (data.length === 0) {
    return (
      <Card variant="medieval" className="p-8 text-center">
        <p className="text-gray-400">No ELO history available</p>
      </Card>
    );
  }

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
}

