import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { GameLengthChart } from '../GameLengthChart';
import type { GameLengthDataPoint } from '../../types';

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

describe('GameLengthChart', () => {
  it('should render game length distribution', async () => {
    // Arrange
    const data: GameLengthDataPoint[] = [
      { date: '2024-01-01', averageDuration: 30 },
      { date: '2024-01-02', averageDuration: 45 },
    ];

    // Act
    render(<GameLengthChart data={data} />);

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('should handle no data', () => {
    // Arrange
    const data: GameLengthDataPoint[] = [];

    // Act
    render(<GameLengthChart data={data} />);

    // Assert
    expect(screen.getByText('No game length data available')).toBeInTheDocument();
  });

  it('should handle very short games', async () => {
    // Arrange
    const data: GameLengthDataPoint[] = [
      { date: '2024-01-01', averageDuration: 0.5 },
    ];

    // Act
    render(<GameLengthChart data={data} />);

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });
  });

  it('should handle very long games', async () => {
    // Arrange
    const data: GameLengthDataPoint[] = [
      { date: '2024-01-01', averageDuration: 300 },
    ];

    // Act
    render(<GameLengthChart data={data} />);

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });
  });

  it('should handle missing durations', () => {
    // Arrange
    const data: GameLengthDataPoint[] = [
      { date: '2024-01-01', averageDuration: 0 },
    ];

    // Act
    render(<GameLengthChart data={data} />);

    // Assert
    expect(screen.getByText('No game length data available')).toBeInTheDocument();
  });

  it('should handle very varied lengths', async () => {
    // Arrange
    const data: GameLengthDataPoint[] = Array.from({ length: 100 }, (_, i) => ({
      date: `2024-01-${String(i + 1).padStart(2, '0')}`,
      averageDuration: i * 10,
    }));

    // Act
    render(<GameLengthChart data={data} />);

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });
  });

  it('should display custom title', async () => {
    // Arrange
    const data: GameLengthDataPoint[] = [{ date: '2024-01-01', averageDuration: 30 }];

    // Act
    render(<GameLengthChart data={data} title="Custom Game Length" />);

    // Assert
    expect(screen.getByText('Custom Game Length')).toBeInTheDocument();
  });
});


