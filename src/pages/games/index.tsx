import React from 'react';
import { GameList } from '@/features/modules/games/components/GameList';

export default function GamesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-amber-400 mb-8">Games</h1>
      <GameList />
    </div>
  );
}

