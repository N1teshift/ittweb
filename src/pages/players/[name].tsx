import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { PlayerProfile } from '@/features/modules/community/players/components/PlayerProfile';
import { ErrorBoundary } from '@/features/infrastructure/components';

export default function PlayerPage() {
  const router = useRouter();
  const { name } = router.query;

  if (!name || typeof name !== 'string') {
    return (
      <ErrorBoundary>
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-400">Invalid player name</p>
      </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Head>
        <title>{name} - Player Profile</title>
      </Head>
      <div className="container mx-auto px-4 py-8">
        <PlayerProfile name={name} />
      </div>
    </ErrorBoundary>
  );
}

