import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ClassWinRateChart } from '../ClassWinRateChart';
import type { ClassWinRateData } from '../../types';

// Mock recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
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

describe('ClassWinRateChart', () => {
  it('should render class win rates', async () => {
    // Arrange
    const data: ClassWinRateData[] = [
      { className: 'warrior', winRate: 60 },
      { className: 'mage', winRate: 45 },
    ];

    // Act
    render(<ClassWinRateChart data={data} />);

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('should handle no data', () => {
    // Arrange
    const data: ClassWinRateData[] = [];

    // Act
    render(<ClassWinRateChart data={data} />);

    // Assert
    expect(screen.getByText('No class win rate data available')).toBeInTheDocument();
  });

  it('should handle many classes', async () => {
    // Arrange
    const data: ClassWinRateData[] = Array.from({ length: 20 }, (_, i) => ({
      className: `class${i}`,
      winRate: 50 + i,
    }));

    // Act
    render(<ClassWinRateChart data={data} />);

    // Assert
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('should handle missing classes', () => {
    // Arrange
    const data = null as unknown as ClassWinRateData[];

    // Act
    render(<ClassWinRateChart data={data} />);

    // Assert
    expect(screen.getByText('No class win rate data available')).toBeInTheDocument();
  });

  it('should compare classes side-by-side', () => {
    // Arrange
    const data: ClassWinRateData[] = [
      { className: 'warrior', winRate: 60 },
      { className: 'mage', winRate: 60 },
      { className: 'rogue', winRate: 50 },
    ];

    // Act
    render(<ClassWinRateChart data={data} />);

    // Assert
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('should display custom title', () => {
    // Arrange
    const data: ClassWinRateData[] = [{ className: 'warrior', winRate: 60 }];

    // Act
    render(<ClassWinRateChart data={data} title="Custom Class Win Rate" />);

    // Assert
    expect(screen.getByText('Custom Class Win Rate')).toBeInTheDocument();
  });
});


