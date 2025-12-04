import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ClassSelectionChart } from '../ClassSelectionChart';
import type { ClassSelectionData } from '../../types';

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

jest.mock('@/features/infrastructure/components/containers/Card', () => ({
  Card: ({ children, title }: { children: React.ReactNode; title?: string }) => (
    <div data-testid="card">
      {title && <h3>{title}</h3>}
      {children}
    </div>
  ),
}));

describe('ClassSelectionChart', () => {
  it('should render class selection data', async () => {
    // Arrange
    const data: ClassSelectionData[] = [
      { className: 'warrior', count: 10 },
      { className: 'mage', count: 5 },
    ];

    // Act
    render(<ClassSelectionChart data={data} />);

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('should handle empty data', () => {
    // Arrange
    const data: ClassSelectionData[] = [];

    // Act
    render(<ClassSelectionChart data={data} />);

    // Assert
    expect(screen.getByText('No class selection data available')).toBeInTheDocument();
  });

  it('should handle many classes', async () => {
    // Arrange
    const data: ClassSelectionData[] = Array.from({ length: 20 }, (_, i) => ({
      className: `class${i}`,
      count: i + 1,
    }));

    // Act
    render(<ClassSelectionChart data={data} />);

    // Assert
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('should handle missing classes', () => {
    // Arrange
    const data = null as unknown as ClassSelectionData[];

    // Act
    render(<ClassSelectionChart data={data} />);

    // Assert
    expect(screen.getByText('No class selection data available')).toBeInTheDocument();
  });

  it('should display custom title', () => {
    // Arrange
    const data: ClassSelectionData[] = [{ className: 'warrior', count: 10 }];

    // Act
    render(<ClassSelectionChart data={data} title="Custom Class Selection" />);

    // Assert
    expect(screen.getByText('Custom Class Selection')).toBeInTheDocument();
  });
});


