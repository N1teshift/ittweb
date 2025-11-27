import React from 'react';
import { useRouter } from 'next/router';
import { useGame } from '@/features/modules/games/hooks/useGame';
import { GameDetail } from '@/features/modules/games/components/GameDetail';
import { Card } from '@/features/infrastructure/shared/components/ui/Card';

export default function GameDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { game, loading, error } = useGame(id as string);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card variant="medieval" className="p-8 animate-pulse">
          <div className="h-8 bg-amber-500/20 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-amber-500/10 rounded w-1/2"></div>
        </Card>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card variant="medieval" className="p-8">
          <p className="text-red-400">
            {error ? `Error: ${error.message}` : 'Game not found'}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <GameDetail game={game} />
    </div>
  );
}

