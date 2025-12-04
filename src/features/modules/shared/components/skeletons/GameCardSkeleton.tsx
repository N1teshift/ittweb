import React from 'react';
import { Card } from '@/features/infrastructure/components';

/**
 * Skeleton loader for GameCard component
 */
export function GameCardSkeleton() {
  return (
    <Card variant="medieval" className="p-4 animate-pulse">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="h-5 bg-amber-500/20 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-amber-500/10 rounded w-1/3"></div>
        </div>
        <div className="h-6 bg-amber-500/20 rounded w-16"></div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="h-4 bg-amber-500/10 rounded w-3/4"></div>
        <div className="h-4 bg-amber-500/10 rounded w-3/4"></div>
      </div>
    </Card>
  );
}

