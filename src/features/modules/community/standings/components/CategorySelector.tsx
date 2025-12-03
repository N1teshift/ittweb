import React from 'react';
import { Button } from '@/features/infrastructure/components';

interface CategorySelectorProps {
  value?: string;
  onChange: (category: string | undefined) => void;
  categories?: string[];
}

const DEFAULT_CATEGORIES = ['default', '1v1', '2v2', '3v3', '4v4', '5v5', '6v6', 'ffa'];

export function CategorySelector({
  value,
  onChange,
  categories = DEFAULT_CATEGORIES,
}: CategorySelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={value === undefined ? 'amber' : 'ghost'}
        size="sm"
        onClick={() => onChange(undefined)}
      >
        All
      </Button>
      {categories.map((category) => (
        <Button
          key={category}
          variant={value === category ? 'amber' : 'ghost'}
          size="sm"
          onClick={() => onChange(category)}
        >
          {category.toUpperCase()}
        </Button>
      ))}
    </div>
  );
}



