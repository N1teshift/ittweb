import { useRouter } from 'next/router';
import { useSession, signIn } from 'next-auth/react';
import { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
import type { ScheduledGame } from '@/types/scheduledGame';
import { timestampToIso } from '@/features/infrastructure/utils/timestampUtils';

interface ApiResponse {
  success?: boolean;
  error?: string;
  message?: string;
  gameId?: string;
  archiveId?: string;
}

export default function UploadReplayPage() {
  const router = useRouter();
  const { id } = router.query;
  const scheduledGameId = Array.isArray(id) ? id[0] : id;
  const { status } = useSession();

  const [game, setGame] = useState<ScheduledGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch scheduled game details
  useEffect(() => {
    const fetchGame = async () => {
      if (!scheduledGameId) return;
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/scheduled-games/${scheduledGameId}`);
        const data = (await response.json()) as ScheduledGame & { error?: string };
        if (!response.ok) {
          throw new Error(data?.error || 'Failed to load scheduled game');
        }
        setGame(data as ScheduledGame);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load scheduled game');
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [scheduledGameId]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a replay file');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      const formData = new FormData();
      formData.append('replay', file);

      if (!scheduledGameId) {
        setError('Missing scheduled game ID');
        return;
      }

      const response = await fetch(`/api/scheduled-games/${scheduledGameId}/upload-replay`, {
        method: 'POST',
        body: formData,
      });

      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload replay');
      }

      setSuccessMessage(data.message || 'Replay uploaded successfully!');
      setFile(null);

      // Redirect back to scheduled games after a short delay
      setTimeout(() => {
        router.push('/scheduled-games');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload replay');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <p className="text-gray-400 text-lg">Loading...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="bg-black/30 border border-amber-500/30 rounded-lg p-8 text-center">
          <p className="text-gray-300 mb-4">You need to sign in to upload a replay.</p>
          <button
            onClick={() => signIn('discord')}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium"
          >
            Sign in with Discord
          </button>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="bg-black/30 border border-red-500/30 rounded-lg p-8 text-center">
          <p className="text-red-400 mb-4">{error || 'Scheduled game not found.'}</p>
          <Link href="/scheduled-games" className="text-amber-400 hover:text-amber-300">
            ← Back to Scheduled Games
          </Link>
        </div>
      </div>
    );
  }

  const scheduledTime = new Date(typeof game.scheduledDateTime === 'string' ? game.scheduledDateTime : timestampToIso(game.scheduledDateTime)).toLocaleString();

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
      <div className="max-w-3xl w-full mx-auto px-6 py-12 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="font-medieval-brand text-4xl md:text-5xl text-amber-400">Upload Replay</h1>
          <Link href="/scheduled-games" className="text-amber-400 hover:text-amber-300">
            ← Back
          </Link>
        </div>

        <div className="bg-black/30 border border-amber-500/30 rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-medieval-brand text-amber-300">Game Summary</h2>
          <p className="text-gray-300">
            <span className="text-amber-500">Game ID:</span> #{game.scheduledGameId}
          </p>
          <p className="text-gray-300">
            <span className="text-amber-500">Scheduled Time:</span> {scheduledTime}
          </p>
          <p className="text-gray-300">
            <span className="text-amber-500">Team Size:</span>{' '}
            {game.teamSize === 'custom' ? game.customTeamSize : game.teamSize}
          </p>
          <p className="text-gray-300">
            <span className="text-amber-500">Game Type:</span> {game.gameType === 'elo' ? 'ELO' : 'Normal'}
          </p>
          <p className="text-gray-300">
            <span className="text-amber-500">Status:</span> {game.status}
          </p>
        </div>

        <div className="bg-black/30 border border-amber-500/30 rounded-lg p-6 space-y-6">
          <h2 className="text-2xl font-medieval-brand text-amber-300">Replay Upload</h2>
          <p className="text-gray-400">
            Upload your replay file (.w3g). Game data will be automatically extracted from the replay file.
          </p>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-amber-500 mb-2">Replay File (.w3g) *</label>
              <input
                type="file"
                accept=".w3g"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                required
              />
              <p className="text-sm text-gray-400 mt-2">
                The replay file will be parsed automatically to extract game data including players, stats, and match results.
              </p>
            </div>

            {error && (
              <div className="bg-red-900/50 border border-red-500 rounded px-4 py-2 text-red-200">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-900/40 border border-green-500 rounded px-4 py-2 text-green-200">
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium disabled:opacity-60"
            >
              {submitting ? 'Uploading...' : 'Upload Replay'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

