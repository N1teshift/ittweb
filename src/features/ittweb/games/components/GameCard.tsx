import React from 'react';
import Link from 'next/link';
import { Card } from '@/features/infrastructure/shared/components/ui/Card';
import { formatDuration } from '../../shared/utils';
import type { Game } from '../types';

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  const gameDate = new Date(game.datetime as string);
  const formattedDate = gameDate.toLocaleDateString();
  const formattedTime = gameDate.toLocaleTimeString();

  return (
    <Card variant="medieval" className="p-4 hover:border-amber-400/70 transition-colors">
      <Link href={`/games/${game.id}`} className="block">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-semibold text-amber-400 mb-1">
              Game #{game.gameId}
            </h3>
            <p className="text-sm text-gray-400">
              {formattedDate} {formattedTime}
            </p>
          </div>
          {game.category && (
            <span className="px-2 py-1 text-xs bg-amber-500/20 border border-amber-500/30 rounded text-amber-400">
              {game.category}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm text-gray-300 mt-3">
          <div>
            <span className="text-gray-500">Duration:</span>{' '}
            <span className="text-amber-300">{formatDuration(game.duration)}</span>
          </div>
          <div>
            <span className="text-gray-500">Map:</span>{' '}
            <span className="text-amber-300">{game.map.split('\\').pop() || game.map}</span>
          </div>
        </div>

        {game.verified && (
          <div className="mt-2 text-xs text-green-400">✓ Verified</div>
        )}
      </Link>
    </Card>
  );
}

