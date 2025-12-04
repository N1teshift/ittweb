import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { PlayerActivityChart } from '../PlayerActivityChart';
import type { PlayerActivityDataPoint } from '../../types';

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

describe('PlayerActivityChart', () => {
  it('should render player activity over time', async () => {
    // Arrange
    const data: PlayerActivityDataPoint[] = [
      { date: '2024-01-01', players: 10 },
      { date: '2024-02-01', players: 15 },
    ];

    // Act
    render(<PlayerActivityChart data={data} />);

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('should handle no activity', () => {
    // Arrange
    const data: PlayerActivityDataPoint[] = [];

    // Act
    render(<PlayerActivityChart data={data} />);

    // Assert
    expect(screen.getByText('No player activity data available')).toBeInTheDocument();
  });

  it('should handle many players', async () => {
    // Arrange
    const data: PlayerActivityDataPoint[] = Array.from({ length: 12 }, (_, i) => ({
      date: `2024-${String(i + 1).padStart(2, '0')}-01`,
      players: (i + 1) * 10,
    }));

    // Act
    render(<PlayerActivityChart data={data} />);

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });
  });

  it('should handle missing data', () => {
    // Arrange
    const data = null as unknown as PlayerActivityDataPoint[];

    // Act
    render(<PlayerActivityChart data={data} />);

    // Assert
    expect(screen.getByText('No player activity data available')).toBeInTheDocument();
  });

  it('should handle zero players', () => {
    // Arrange
    const data: PlayerActivityDataPoint[] = [
      { date: '2024-01-01', players: 0 },
    ];

    // Act
    render(<PlayerActivityChart data={data} />);

    // Assert
    expect(screen.getByText('No player activity data available')).toBeInTheDocument();
  });

  it('should display custom title', () => {
    // Arrange
    const data: PlayerActivityDataPoint[] = [{ date: '2024-01-01', players: 10 }];

    // Act
    render(<PlayerActivityChart data={data} title="Custom Player Activity" />);

    // Assert
    expect(screen.getByText('Custom Player Activity')).toBeInTheDocument();
  });
});


