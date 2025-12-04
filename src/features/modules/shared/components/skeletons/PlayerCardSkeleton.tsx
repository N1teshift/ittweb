import React from 'react';
import { Card } from '@/features/infrastructure/components';

/**
 * Skeleton loader for PlayerCard component
 */
export function PlayerCardSkeleton() {
  return (
    <Card variant="medieval" className="p-6 animate-pulse">
      <div className="h-6 bg-amber-500/20 rounded w-1/3 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-amber-500/10 rounded w-1/2"></div>
        <div className="h-4 bg-amber-500/10 rounded w-2/3"></div>
        <div className="h-4 bg-amber-500/10 rounded w-1/3"></div>
      </div>
    </Card>
  );
}

