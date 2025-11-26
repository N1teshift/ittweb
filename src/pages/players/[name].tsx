import React from 'react';
import { useRouter } from 'next/router';
import { Layout } from '@/features/shared/components';
import { PlayerProfile } from '@/features/ittweb/players/components/PlayerProfile';

export default function PlayerPage() {
  const router = useRouter();
  const { name } = router.query;

  if (!name || typeof name !== 'string') {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <p className="text-red-400">Invalid player name</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <PlayerProfile name={name} />
      </div>
    </Layout>
  );
}

