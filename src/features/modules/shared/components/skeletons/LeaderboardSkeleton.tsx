import React from 'react';
import { Card } from '@/features/infrastructure/components';

/**
 * Skeleton loader for Leaderboard component
 */
export function LeaderboardSkeleton() {
  return (
    <Card variant="medieval" className="p-6 animate-pulse">
      <div className="space-y-3">
        {/* Header row */}
        <div className="grid grid-cols-7 gap-4 pb-2 border-b border-amber-500/30">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-4 bg-amber-500/20 rounded"></div>
          ))}
        </div>
        {/* Data rows */}
        {[...Array(5)].map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-7 gap-4 py-2 border-b border-amber-500/10">
            {[...Array(7)].map((_, colIndex) => (
              <div key={colIndex} className="h-4 bg-amber-500/10 rounded"></div>
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}

