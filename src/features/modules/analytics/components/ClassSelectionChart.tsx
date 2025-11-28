import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card } from '@/features/infrastructure/components/ui/Card';
import type { ClassSelectionData } from '../types';

interface ClassSelectionChartProps {
  data: ClassSelectionData[];
  title?: string;
}

const COLORS = [
  '#d97706', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#06b6d4', '#6366f1',
];

function ClassSelectionChartComponent({ data, title = 'Class Selection' }: ClassSelectionChartProps) {
  if (data.length === 0) {
    return (
      <Card variant="medieval" className="p-8 text-center">
        <p className="text-gray-400">No class selection data available</p>
      </Card>
    );
  }

  // Limit to top 12 classes for readability
  const chartData = data.slice(0, 12).map((item, index) => ({
    name: item.className.charAt(0).toUpperCase() + item.className.slice(1),
    value: item.count,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <Card variant="medieval" className="p-6">
      <h3 className="text-xl font-semibold text-amber-400 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
            outerRadius={100}
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
            formatter={(value: number) => [`${value} games`, 'Count']}
          />
          <Legend wrapperStyle={{ color: '#d97706' }} />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}

// Memoize component to prevent unnecessary re-renders when props haven't changed
export const ClassSelectionChart = React.memo(ClassSelectionChartComponent);

