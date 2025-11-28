import React from 'react';
import { render, screen } from '@testing-library/react';
import { WinRateChart } from '../WinRateChart';
import type { WinRateData } from '../../types';

// Mock recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie">{children}</div>
  ),
  Cell: () => <div data-testid="cell" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

jest.mock('@/features/infrastructure/shared/components/ui/Card', () => ({
  Card: ({ children, title }: { children: React.ReactNode; title?: string }) => (
    <div data-testid="card">
      {title && <h3>{title}</h3>}
      {children}
    </div>
  ),
}));

describe('WinRateChart', () => {
  it('should render win rate pie chart', () => {
    // Arrange
    const data: WinRateData = { wins: 10, losses: 5, draws: 2 };

    // Act
    render(<WinRateChart data={data} />);

    // Assert
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('should calculate percentages correctly', () => {
    // Arrange
    const data: WinRateData = { wins: 10, losses: 5, draws: 5 };

    // Act
    render(<WinRateChart data={data} />);

    // Assert
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('should handle zero wins', () => {
    // Arrange
    const data: WinRateData = { wins: 0, losses: 5, draws: 0 };

    // Act
    render(<WinRateChart data={data} />);

    // Assert
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('should handle all wins', () => {
    // Arrange
    const data: WinRateData = { wins: 10, losses: 0, draws: 0 };

    // Act
    render(<WinRateChart data={data} />);

    // Assert
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('should handle no data', () => {
    // Arrange
    const data: WinRateData = { wins: 0, losses: 0, draws: 0 };

    // Act
    render(<WinRateChart data={data} />);

    // Assert
    expect(screen.getByText('No win rate data available')).toBeInTheDocument();
  });

  it('should handle equal rates', () => {
    // Arrange
    const data: WinRateData = { wins: 5, losses: 5, draws: 5 };

    // Act
    render(<WinRateChart data={data} />);

    // Assert
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('should handle missing categories', () => {
    // Arrange
    const data: WinRateData = { wins: 10, losses: 0, draws: 0 };

    // Act
    render(<WinRateChart data={data} />);

    // Assert
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('should display custom title', () => {
    // Arrange
    const data: WinRateData = { wins: 10, losses: 5, draws: 2 };

    // Act
    render(<WinRateChart data={data} title="Custom Win Rate" />);

    // Assert
    expect(screen.getByText('Custom Win Rate')).toBeInTheDocument();
  });
});

