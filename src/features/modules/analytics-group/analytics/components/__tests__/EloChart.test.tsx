import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { EloChart } from '../EloChart';
import type { EloHistoryDataPoint } from '../../types';

// Mock recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

jest.mock('@/features/infrastructure/components/containers/Card', () => ({
  Card: ({ children, title }: { children: React.ReactNode; title?: string }) => (
    <div data-testid="card">
      {title && <h3>{title}</h3>}
      {children}
    </div>
  ),
}));

describe('EloChart', () => {
  it('should render ELO history chart', async () => {
    // Arrange
    const data: EloHistoryDataPoint[] = [
      { date: '2024-01-01', elo: 1000 },
      { date: '2024-01-02', elo: 1010 },
    ];

    // Act
    render(<EloChart data={data} />);

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('should handle no history', () => {
    // Arrange
    const data: EloHistoryDataPoint[] = [];

    // Act
    render(<EloChart data={data} />);

    // Assert
    expect(screen.getByText('No ELO history available')).toBeInTheDocument();
  });

  it('should handle many data points', async () => {
    // Arrange
    const data: EloHistoryDataPoint[] = Array.from({ length: 1000 }, (_, i) => ({
      date: `2024-01-${String(i + 1).padStart(2, '0')}`,
      elo: 1000 + i,
    }));

    // Act
    render(<EloChart data={data} />);

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  it('should handle missing data', () => {
    // Arrange
    const data = null as unknown as EloHistoryDataPoint[];

    // Act
    render(<EloChart data={data} />);

    // Assert
    expect(screen.getByText('No ELO history available')).toBeInTheDocument();
  });

  it('should display custom title', () => {
    // Arrange
    const data: EloHistoryDataPoint[] = [{ date: '2024-01-01', elo: 1000 }];

    // Act
    render(<EloChart data={data} title="Custom ELO Title" />);

    // Assert
    expect(screen.getByText('Custom ELO Title')).toBeInTheDocument();
  });
});


