import React from 'react';
import Link from 'next/link';
import { Card } from '@/features/infrastructure/components';
import { formatDuration, formatEloChange } from '@/features/modules/shared/utils';
import type { GameWithPlayers } from '@/features/modules/game-management/games/types';

interface GameDetailsSectionProps {
  game: GameWithPlayers;
}

export function GameDetailsSection({ game }: GameDetailsSectionProps) {
  const gameDate = new Date(game.datetime as string);
  const winners = game.players.filter(p => p.flag === 'winner');
  const losers = game.players.filter(p => p.flag === 'loser');
  const drawers = game.players.filter(p => p.flag === 'drawer');

  return (
    <div className="space-y-6">
      <Card variant="medieval" className="p-6">
        <h1 className="text-2xl font-bold text-amber-400 mb-4">Game #{game.gameId}</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Date:</span>
            <p className="text-amber-300">{gameDate.toLocaleString()}</p>
          </div>
          {game.duration && (
            <div>
              <span className="text-gray-500">Duration:</span>
              <p className="text-amber-300">{formatDuration(game.duration)}</p>
            </div>
          )}
          {game.map && (
            <div>
              <span className="text-gray-500">Map:</span>
              <p className="text-amber-300">{game.map.split('\\').pop() || game.map}</p>
            </div>
          )}
          <div>
            <span className="text-gray-500">Category:</span>
            <p className="text-amber-300">{game.category || 'N/A'}</p>
          </div>
          <div>
            <span className="text-gray-500">Creator:</span>
            <p className="text-amber-300">{game.creatorName}</p>
          </div>
          <div>
            <span className="text-gray-500">Owner:</span>
            <p className="text-amber-300">{game.ownername}</p>
          </div>
        </div>
        
        {game.replayUrl && (
          <div className="mt-4 pt-4 border-t border-amber-500/20">
            <a
              href={game.replayUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={game.replayFileName || 'replay.w3g'}
              className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 underline transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download replay {game.replayFileName ? `(${game.replayFileName})` : '(.w3g)'}
            </a>
          </div>
        )}
      </Card>

      {winners.length > 0 && (
        <Card variant="medieval" className="p-6">
          <h2 className="text-xl font-semibold text-green-400 mb-4">Winners</h2>
          <div className="space-y-2">
            {winners.map((player) => (
              <div key={player.id} className="flex justify-between items-center p-2 bg-green-500/10 rounded">
                <Link href={`/players/${encodeURIComponent(player.name)}`} className="text-amber-300 hover:text-amber-200">
                  {player.name}
                </Link>
                <div className="text-sm text-gray-400">
                  {player.elochange !== undefined && (
                    <span className="text-green-400">{formatEloChange(player.elochange)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {losers.length > 0 && (
        <Card variant="medieval" className="p-6">
          <h2 className="text-xl font-semibold text-red-400 mb-4">Losers</h2>
          <div className="space-y-2">
            {losers.map((player) => (
              <div key={player.id} className="flex justify-between items-center p-2 bg-red-500/10 rounded">
                <Link href={`/players/${encodeURIComponent(player.name)}`} className="text-amber-300 hover:text-amber-200">
                  {player.name}
                </Link>
                <div className="text-sm text-gray-400">
                  {player.elochange !== undefined && (
                    <span className="text-red-400">{formatEloChange(player.elochange)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {drawers.length > 0 && (
        <Card variant="medieval" className="p-6">
          <h2 className="text-xl font-semibold text-yellow-400 mb-4">Draw</h2>
          <div className="space-y-2">
            {drawers.map((player) => (
              <div key={player.id} className="flex justify-between items-center p-2 bg-yellow-500/10 rounded">
                <Link href={`/players/${encodeURIComponent(player.name)}`} className="text-amber-300 hover:text-amber-200">
                  {player.name}
                </Link>
                <div className="text-sm text-gray-400">
                  {player.elochange !== undefined && (
                    <span className="text-yellow-400">{formatEloChange(player.elochange)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}



