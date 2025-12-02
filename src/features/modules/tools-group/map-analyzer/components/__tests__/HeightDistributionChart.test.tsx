import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import HeightDistributionChart from '../HeightDistributionChart';
import type { SimpleMapData } from '../../types/map';

describe('HeightDistributionChart', () => {
  it('shows an empty state when no map is provided', () => {
    render(<HeightDistributionChart map={null} />);
    expect(screen.getByText('No land height data')).toBeInTheDocument();
  });

  it('renders buckets for land tiles and supports threshold selection', () => {
    const map: SimpleMapData = {
      width: 2,
      height: 2,
      tiles: [
        { isWater: false, groundHeight: 0 },
        { isWater: false, groundHeight: 5 },
        { isWater: false, groundHeight: 10 },
        { isWater: true, groundHeight: 0, waterHeight: 3 },
      ],
    };
    const onSelectThreshold = jest.fn();

    const { container } = render(
      <HeightDistributionChart map={map} onSelectThreshold={onSelectThreshold} />,
    );

    const bars = container.querySelectorAll('div.flex-1.bg-amber-600');
    expect(bars).toHaveLength(20);
    // at least one bucket should have a visible height since there are land tiles
    expect(Array.from(bars).some((bar) => {
      const match = bar.getAttribute('style')?.match(/height:\s*([0-9.]+)/);
      const height = match ? parseFloat(match[1]) : 0;
      return height > 0;
    })).toBe(true);

    const barRow = container.querySelector('.flex.items-end.gap-1.h-28');
    expect(barRow).not.toBeNull();
    if (!barRow) return;

    jest.spyOn(barRow, 'getBoundingClientRect').mockImplementation(() => ({
      width: 200,
      height: 100,
      top: 0,
      left: 0,
      bottom: 100,
      right: 200,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }));

    fireEvent.click(barRow, { clientX: 100, clientY: 0 });

    expect(onSelectThreshold).toHaveBeenCalledTimes(1);
    expect(onSelectThreshold).toHaveBeenCalledWith(expect.closeTo(5, 0.001));
  });
});

