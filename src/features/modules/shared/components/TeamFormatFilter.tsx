import React from 'react';
import { Button } from '@/features/infrastructure/components';
import { Card } from '@/features/infrastructure/components';

interface TeamFormatFilterProps {
  value?: string;
  onChange: (format: string | undefined) => void;
  formats?: string[];
}

const DEFAULT_FORMATS = ['1v1', '2v2', '3v3', '4v4', '5v5', '6v6', 'FFA'];

export function TeamFormatFilter({
  value,
  onChange,
  formats = DEFAULT_FORMATS,
}: TeamFormatFilterProps) {
  return (
    <Card variant="medieval" className="p-4">
      <div className="space-y-3">
        <label className="block text-sm text-gray-400">Team Format</label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={value === undefined ? 'amber' : 'ghost'}
            size="sm"
            onClick={() => onChange(undefined)}
            className="min-h-[44px] md:min-h-0"
          >
            All Formats
          </Button>
          {formats.map((format) => (
            <Button
              key={format}
              variant={value === format ? 'amber' : 'ghost'}
              size="sm"
              onClick={() => onChange(value === format ? undefined : format)}
              className="min-h-[44px] md:min-h-0"
            >
              {format}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
}


