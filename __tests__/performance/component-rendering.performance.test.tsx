/// <reference types="@testing-library/jest-dom" />
import React from 'react';
import { render } from '@testing-library/react';
import { ActivityChart } from '@/features/modules/analytics-group/analytics/components/ActivityChart';
import { EloChart } from '@/features/modules/analytics-group/analytics/components/EloChart';
import type {
  ActivityDataPoint,
  EloHistoryDataPoint,
} from '@/features/modules/analytics-group/analytics/types';

// Mock recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="area-chart">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Area: () => <div data-testid="area" />,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

jest.mock('@/features/infrastructure/components/ui/Card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
}));

// Performance thresholds (in milliseconds)
const PERFORMANCE_THRESHOLDS = {
  LARGE_LIST_RENDER: 500, // 500ms
  CHART_RENDER: 300, // 300ms
  IMAGE_LOAD: 1000, // 1 second
};

/**
 * Helper to measure render time
 */
function measureRenderTime(component: React.ReactElement): number {
  const start = performance.now();
  render(component);
  const end = performance.now();
  return end - start;
}

describe('Component Rendering Performance', () => {
  describe('Large List Rendering', () => {
    it('should render large lists efficiently', () => {
      // Arrange
      const largeData: ActivityDataPoint[] = Array.from({ length: 1000 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        games: i,
      }));

      // Act
      const renderTime = measureRenderTime(<ActivityChart data={largeData} />);

      // Assert
      expect(renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.LARGE_LIST_RENDER);
    });

    it('should handle very large lists without lag', () => {
      // Arrange
      const veryLargeData: ActivityDataPoint[] = Array.from({ length: 5000 }, (_, i) => ({
        date: `2024-01-${String((i % 31) + 1).padStart(2, '0')}`,
        games: i % 100,
      }));

      // Act
      const renderTime = measureRenderTime(<ActivityChart data={veryLargeData} />);

      // Assert
      // Should still be reasonable even for very large lists
      expect(renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.LARGE_LIST_RENDER * 3);
    });

    it('should handle rapid updates efficiently', () => {
      // Arrange
      const data1: ActivityDataPoint[] = Array.from({ length: 100 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        games: i,
      }));

      const data2: ActivityDataPoint[] = Array.from({ length: 100 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        games: i + 10,
      }));

      // Act
      const { rerender } = render(<ActivityChart data={data1} />);
      const start = performance.now();
      rerender(<ActivityChart data={data2} />);
      const end = performance.now();
      const updateTime = end - start;

      // Assert
      expect(updateTime).toBeLessThan(PERFORMANCE_THRESHOLDS.LARGE_LIST_RENDER);
    });
  });

  describe('Chart Rendering Performance', () => {
    it('should render charts quickly', () => {
      // Arrange
      const data: ActivityDataPoint[] = Array.from({ length: 100 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        games: i,
      }));

      // Act
      const renderTime = measureRenderTime(<ActivityChart data={data} />);

      // Assert
      expect(renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.CHART_RENDER);
    });

    it('should handle many data points efficiently', () => {
      // Arrange
      const manyDataPoints: EloHistoryDataPoint[] = Array.from({ length: 1000 }, (_, i) => ({
        date: `2024-01-${String((i % 31) + 1).padStart(2, '0')}`,
        elo: 1000 + i,
      }));

      // Act
      const renderTime = measureRenderTime(<EloChart data={manyDataPoints} />);

      // Assert
      expect(renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.CHART_RENDER * 2);
    });

    it('should handle complex charts efficiently', () => {
      // Arrange
      const complexData: ActivityDataPoint[] = Array.from({ length: 500 }, (_, i) => ({
        date: `2024-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
        games: Math.sin(i) * 50 + 50,
      }));

      // Act
      const renderTime = measureRenderTime(<ActivityChart data={complexData} />);

      // Assert
      expect(renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.CHART_RENDER * 1.5);
    });

    it('should handle rapid chart updates smoothly', () => {
      // Arrange
      const baseData: EloHistoryDataPoint[] = Array.from({ length: 100 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        elo: 1000 + i,
      }));

      // Act
      const { rerender } = render(<EloChart data={baseData} />);
      const updates: number[] = [];

      for (let i = 0; i < 10; i++) {
        const updatedData = baseData.map((point, idx) => ({
          ...point,
          elo: point.elo + i * 10,
        }));
        const start = performance.now();
        rerender(<EloChart data={updatedData} />);
        const end = performance.now();
        updates.push(end - start);
      }

      // Assert
      const avgUpdateTime = updates.reduce((a, b) => a + b, 0) / updates.length;
      expect(avgUpdateTime).toBeLessThan(PERFORMANCE_THRESHOLDS.CHART_RENDER);
    });
  });

  describe('Image Loading Performance', () => {
    it('should handle image loading efficiently', () => {
      // Arrange
      const ImageComponent = () => {
        const [loaded, setLoaded] = React.useState(false);
        React.useEffect(() => {
          // Simulate image load
          const timer = setTimeout(() => setLoaded(true), 50);
          return () => clearTimeout(timer);
        }, []);

        return (
          <div>
            {loaded ? (
              <img src="test.jpg" alt="test" data-testid="loaded-image" />
            ) : (
              <div data-testid="loading">Loading...</div>
            )}
          </div>
        );
      };

      // Act
      const start = performance.now();
      const { getByTestId } = render(<ImageComponent />);
      const renderTime = performance.now() - start;

      // Assert
      expect(renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.IMAGE_LOAD);
      expect(getByTestId('loading')).toBeInTheDocument();
    });

    it('should handle many images efficiently', () => {
      // Arrange
      const ImageList = () => {
        return (
          <div>
            {Array.from({ length: 100 }, (_, i) => (
              <img
                key={i}
                src={`test-${i}.jpg`}
                alt={`Image ${i}`}
                loading="lazy"
                data-testid={`image-${i}`}
              />
            ))}
          </div>
        );
      };

      // Act
      const renderTime = measureRenderTime(<ImageList />);

      // Assert
      // Should render quickly even with many images (lazy loading)
      expect(renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.IMAGE_LOAD);
    });
  });
});


