import React from 'react';
import Link from 'next/link';
import { formatEloChange } from '@/features/modules/shared/utils';
import type { GameWithPlayers } from '@/features/modules/game-management/games/types';

interface GamePlayersSectionProps {
  game: GameWithPlayers;
}

export function GamePlayersSection({ game }: GamePlayersSectionProps) {
  if (!game.players || game.players.length === 0) {
    return null;
  }

  const winners = game.players.filter(p => p.flag === 'winner');
  const losers = game.players.filter(p => p.flag === 'loser');
  const drawers = game.players.filter(p => p.flag === 'drawer');

  return (
    <div className="mt-4 space-y-2">
      {winners.length > 0 && (
        <div className="p-2 bg-green-500/10 rounded border border-green-500/20">
          <div className="text-xs font-semibold text-green-400 mb-1.5">Winners</div>
          <div className="flex flex-wrap gap-2">
            {winners.map((player) => (
              <Link
                key={player.id}
                href={`/players/${encodeURIComponent(player.name)}`}
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-amber-300 hover:text-amber-200 underline"
              >
                {player.name}
                {player.elochange !== undefined && (
                  <span className="ml-1 text-green-400">{formatEloChange(player.elochange)}</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
      {losers.length > 0 && (
        <div className="p-2 bg-red-500/10 rounded border border-red-500/20">
          <div className="text-xs font-semibold text-red-400 mb-1.5">Losers</div>
          <div className="flex flex-wrap gap-2">
            {losers.map((player) => (
              <Link
                key={player.id}
                href={`/players/${encodeURIComponent(player.name)}`}
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-amber-300 hover:text-amber-200 underline"
              >
                {player.name}
                {player.elochange !== undefined && (
                  <span className="ml-1 text-red-400">{formatEloChange(player.elochange)}</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
      {drawers.length > 0 && (
        <div className="p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
          <div className="text-xs font-semibold text-yellow-400 mb-1.5">Draw</div>
          <div className="flex flex-wrap gap-2">
            {drawers.map((player) => (
              <Link
                key={player.id}
                href={`/players/${encodeURIComponent(player.name)}`}
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-amber-300 hover:text-amber-200 underline"
              >
                {player.name}
                {player.elochange !== undefined && (
                  <span className="ml-1 text-yellow-400">{formatEloChange(player.elochange)}</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}



