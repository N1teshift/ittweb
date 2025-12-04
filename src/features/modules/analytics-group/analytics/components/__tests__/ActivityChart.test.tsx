import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ActivityChart } from '../ActivityChart';
import type { ActivityDataPoint } from '../../types';

// Mock recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="area-chart">{children}</div>
  ),
  Area: () => <div data-testid="area" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

jest.mock('@/features/infrastructure/components/containers/Card', () => ({
  Card: ({ children, title }: { children: React.ReactNode; title?: string }) => (
    <div data-testid="card">
      {title && <h3>{title}</h3>}
      {children}
    </div>
  ),
}));

describe('ActivityChart', () => {
  it('should render chart with activity data', async () => {
    // Arrange
    const data: ActivityDataPoint[] = [
      { date: '2024-01-01', games: 5 },
      { date: '2024-01-02', games: 3 },
    ];

    // Act
    render(<ActivityChart data={data} />);

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('should handle empty data', () => {
    // Arrange
    const data: ActivityDataPoint[] = [];

    // Act
    render(<ActivityChart data={data} />);

    // Assert
    expect(screen.getByText('No activity data available')).toBeInTheDocument();
  });

  it('should handle null data', () => {
    // Arrange
    const data = null as unknown as ActivityDataPoint[];

    // Act
    render(<ActivityChart data={data} />);

    // Assert
    expect(screen.getByText('No activity data available')).toBeInTheDocument();
  });

  it('should handle many data points', async () => {
    // Arrange
    const data: ActivityDataPoint[] = Array.from({ length: 100 }, (_, i) => ({
      date: `2024-01-${String(i + 1).padStart(2, '0')}`,
      games: i,
    }));

    // Act
    render(<ActivityChart data={data} />);

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });
  });

  it('should display custom title', () => {
    // Arrange
    const data: ActivityDataPoint[] = [{ date: '2024-01-01', games: 5 }];

    // Act
    render(<ActivityChart data={data} title="Custom Title" />);

    // Assert
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('should handle date range changes', async () => {
    // Arrange
    const data1: ActivityDataPoint[] = [{ date: '2024-01-01', games: 5 }];
    const data2: ActivityDataPoint[] = [{ date: '2024-01-02', games: 10 }];

    // Act
    const { rerender } = render(<ActivityChart data={data1} />);
    await waitFor(() => {
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    rerender(<ActivityChart data={data2} />);

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });
  });
});


