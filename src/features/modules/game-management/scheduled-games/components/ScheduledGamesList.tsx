import React from 'react';
import type { Game } from '@/features/modules/game-management/games/types';
import { ScheduledGameCard } from './ScheduledGameCard';

interface ScheduledGamesListProps {
  games: Game[];
  onGameClick?: (game: Game) => void;
  onJoin?: (gameId: string) => Promise<void>;
  onLeave?: (gameId: string) => Promise<void>;
  onEdit?: (game: Game) => void;
  onRequestDelete?: (game: Game) => void;
  onUploadReplay?: (game: Game) => void;
  isJoining?: string | null;
  isLeaving?: string | null;
  isDeleting?: string | null;
  isUploadingReplay?: string | null;
  userIsAdmin?: boolean;
}

export default function ScheduledGamesList({ 
  games, 
  onGameClick, 
  onJoin, 
  onLeave,
  onEdit,
  onRequestDelete,
  onUploadReplay,
  isJoining,
  isLeaving,
  isDeleting,
  isUploadingReplay,
  userIsAdmin = false,
}: ScheduledGamesListProps) {
  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No scheduled games yet.</p>
        <p className="text-gray-500 text-sm mt-2">Be the first to schedule a game!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {games.map((game) => (
        <ScheduledGameCard
            key={game.id}
          game={game}
          onGameClick={onGameClick}
          onJoin={onJoin}
          onLeave={onLeave}
          onEdit={onEdit}
          onRequestDelete={onRequestDelete}
          onUploadReplay={onUploadReplay}
          isJoining={isJoining}
          isLeaving={isLeaving}
          isDeleting={isDeleting}
          isUploadingReplay={isUploadingReplay}
          userIsAdmin={userIsAdmin}
        />
                  ))}
    </div>
  );
}


