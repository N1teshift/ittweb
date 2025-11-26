import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function LegacyCreateGamePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/scheduled-games');
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-gray-200 px-6 text-center">
      <h1 className="text-3xl font-medieval-brand text-amber-400 mb-4">Page Moved</h1>
      <p className="max-w-lg text-gray-400">
        The manual Create Game tool now lives inside the <strong>Scheduled Games</strong> page.
        Please use the <em>Create Game</em> button there to add new entries.
      </p>
      <button
        onClick={() => router.push('/scheduled-games')}
        className="mt-6 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors"
      >
        Go to Scheduled Games
      </button>
    </div>
  );
}

