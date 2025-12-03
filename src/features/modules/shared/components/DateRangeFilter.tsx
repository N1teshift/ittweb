import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Button } from '@/features/infrastructure/components';
import { Card } from '@/features/infrastructure/components';
import type { DateRangePreset } from '../types';

interface DateRangeFilterProps {
  startDate?: Date | null;
  endDate?: Date | null;
  onChange: (start: Date | null, end: Date | null) => void;
  presets?: DateRangePreset[];
}

const DEFAULT_PRESETS: DateRangePreset[] = [
  {
    label: 'Last Week',
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date(),
  },
  {
    label: 'Last Month',
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
  },
  {
    label: 'Last Year',
    start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    end: new Date(),
  },
  {
    label: 'All Time',
    start: new Date(0),
    end: new Date(),
  },
];

export function DateRangeFilter({
  startDate,
  endDate,
  onChange,
  presets = DEFAULT_PRESETS,
}: DateRangeFilterProps) {
  const handlePreset = (preset: DateRangePreset) => {
    onChange(preset.start, preset.end);
  };

  return (
    <Card variant="medieval" className="p-4">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <Button
              key={preset.label}
              variant="ghost"
              size="sm"
              onClick={() => handlePreset(preset)}
              className="min-h-[44px] md:min-h-0"
            >
              {preset.label}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">From</label>
            <DatePicker
              selected={startDate}
              onChange={(date: Date | null) => onChange(date, endDate ?? null)}
              selectsStart
              startDate={startDate || undefined}
              endDate={endDate || undefined}
              className="w-full px-3 py-3 md:py-2 bg-black/40 border border-amber-500/30 rounded text-amber-300 focus:outline-none focus:border-amber-400 min-h-[44px] md:min-h-0"
              dateFormat="yyyy-MM-dd"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">To</label>
            <DatePicker
              selected={endDate}
              onChange={(date: Date | null) => onChange(startDate ?? null, date)}
              selectsEnd
              startDate={startDate || undefined}
              endDate={endDate || undefined}
              minDate={startDate || undefined}
              className="w-full px-3 py-3 md:py-2 bg-black/40 border border-amber-500/30 rounded text-amber-300 focus:outline-none focus:border-amber-400 min-h-[44px] md:min-h-0"
              dateFormat="yyyy-MM-dd"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}



