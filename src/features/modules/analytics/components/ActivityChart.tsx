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
import { Card } from '@/features/infrastructure/components/ui/Card';
import type { ActivityDataPoint } from '../../analytics/types';

interface ActivityChartProps {
  data: ActivityDataPoint[];
  title?: string;
}

function ActivityChartComponent({ data, title = 'Activity' }: ActivityChartProps) {
  if (data.length === 0) {
    return (
      <Card variant="medieval" className="p-8 text-center">
        <p className="text-gray-400">No activity data available</p>
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
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              border: '1px solid rgba(217, 119, 6, 0.3)',
              borderRadius: '4px',
              color: '#d97706',
            }}
          />
          <Area
            type="monotone"
            dataKey="games"
            stroke="#d97706"
            fill="#d97706"
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}

// Memoize component to prevent unnecessary re-renders when props haven't changed
export const ActivityChart = React.memo(ActivityChartComponent);


