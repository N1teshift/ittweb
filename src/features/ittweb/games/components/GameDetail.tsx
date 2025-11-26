import React from 'react';
import Link from 'next/link';
import { Card } from '@/features/infrastructure/shared/components/ui/Card';
import { formatDuration, formatEloChange } from '../../shared/utils';
import type { GameWithPlayers } from '../types';

interface GameDetailProps {
  game: GameWithPlayers;
}

export function GameDetail({ game }: GameDetailProps) {
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
          <div>
            <span className="text-gray-500">Duration:</span>
            <p className="text-amber-300">{formatDuration(game.duration)}</p>
          </div>
          <div>
            <span className="text-gray-500">Map:</span>
            <p className="text-amber-300">{game.map.split('\\').pop() || game.map}</p>
          </div>
          <div>
            <span className="text-gray-500">Category:</span>
            <p className="text-amber-300">{game.category || 'N/A'}</p>
          </div>
          <div>
            <span className="text-gray-500">Creator:</span>
            <p className="text-amber-300">{game.creatorname}</p>
          </div>
          <div>
            <span className="text-gray-500">Owner:</span>
            <p className="text-amber-300">{game.ownername}</p>
          </div>
        </div>
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

