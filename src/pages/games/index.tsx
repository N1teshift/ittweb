import React from 'react';
import { Layout } from '@/features/shared/components';
import { GameList } from '@/features/ittweb/games/components/GameList';

export default function GamesPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-amber-400 mb-8">Games</h1>
        <GameList />
      </div>
    </Layout>
  );
}

