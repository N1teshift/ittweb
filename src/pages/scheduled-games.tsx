import { getStaticPropsWithTranslations } from '@/features/shared/lib/getStaticProps';
import { Logger } from '@/features/infrastructure/logging';
import { useSession, signIn } from 'next-auth/react';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import type { GetStaticProps } from 'next';
import ScheduledGamesList from '@/features/ittweb/scheduled-games/components/ScheduledGamesList';
import ScheduleGameForm from '@/features/ittweb/scheduled-games/components/ScheduleGameForm';
import EditGameForm from '@/features/ittweb/scheduled-games/components/EditGameForm';
import GameDeleteDialog from '@/features/ittweb/scheduled-games/components/GameDeleteDialog';
import CreateGameInlineForm from '@/features/ittweb/scheduled-games/components/CreateGameInlineForm';
import { ScheduledGame, CreateScheduledGame } from '@/types/scheduledGame';
import { getUserDataByDiscordId } from '@/features/shared/lib/userDataService';
import { isAdmin } from '@/features/shared/utils/userRoleUtils';

const pageNamespaces = ["common"];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const withI18n = getStaticPropsWithTranslations(pageNamespaces);
  const i18nResult = await withI18n({ locale: locale as string });
  return {
    props: {
      ...(i18nResult.props || {}),
      translationNamespaces: pageNamespaces,
    },
  };
};

export default function ScheduledGames() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [games, setGames] = useState<ScheduledGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showCreateGameForm, setShowCreateGameForm] = useState(false);
  const [editingGame, setEditingGame] = useState<ScheduledGame | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isJoining, setIsJoining] = useState<string | null>(null);
  const [isLeaving, setIsLeaving] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUploadingReplay, setIsUploadingReplay] = useState<string | null>(null);
  const [pendingDeleteGame, setPendingDeleteGame] = useState<ScheduledGame | null>(null);
  const [userIsAdmin, setUserIsAdmin] = useState(false);

  const loadGames = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Include past games to show awaiting_replay games
      const response = await fetch('/api/scheduled-games?includePast=true');
      if (!response.ok) {
        throw new Error('Failed to load scheduled games');
      }
      const data = await response.json();
      setGames(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load games';
      setError(errorMessage);
      Logger.error('Failed to load scheduled games', {
        component: 'scheduled-games',
        error: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  // Fetch user role to check if admin
  useEffect(() => {
    let isMounted = true;

    const fetchUserRole = async () => {
      if (status !== 'authenticated' || !session?.discordId) {
        if (isMounted) {
          setUserIsAdmin(false);
        }
        return;
      }

      try {
        const userData = await getUserDataByDiscordId(session.discordId);
        if (isMounted) {
          setUserIsAdmin(isAdmin(userData?.role));
        }
      } catch (error) {
        Logger.warn('Failed to fetch user role for scheduled games page', {
          error: error instanceof Error ? error.message : String(error),
        });
        if (isMounted) {
          setUserIsAdmin(false);
        }
      }
    };

    fetchUserRole();

    return () => {
      isMounted = false;
    };
  }, [status, session?.discordId]);

  const handleScheduleClick = () => {
    if (status !== 'authenticated') {
      signIn('discord');
      return;
    }
    setShowForm(true);
  };

  const handleCreateGameClick = () => {
    if (status !== 'authenticated') {
      signIn('discord');
      return;
    }
    setShowCreateGameForm(true);
  };

  const handleFormSubmit = async (gameData: CreateScheduledGame, addCreatorToParticipants: boolean) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch('/api/scheduled-games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...gameData,
          addCreatorToParticipants,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to schedule game');
      }

      setShowForm(false);
      await loadGames();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to schedule game';
      setError(errorMessage);
      throw err; // Re-throw so form can handle it
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setError(null);
  };

  const handleJoin = async (gameId: string) => {
    if (status !== 'authenticated') {
      signIn('discord');
      return;
    }

    try {
      setIsJoining(gameId);
      setError(null);

      const response = await fetch(`/api/scheduled-games/${gameId}/join`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join game');
      }

      // Reload games to get updated participant list
      await loadGames();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join game';
      setError(errorMessage);
      Logger.error('Failed to join game', {
        component: 'scheduled-games',
        gameId,
        error: errorMessage,
      });
    } finally {
      setIsJoining(null);
    }
  };

  const handleLeave = async (gameId: string) => {
    if (status !== 'authenticated') {
      signIn('discord');
      return;
    }

    try {
      setIsLeaving(gameId);
      setError(null);

      const response = await fetch(`/api/scheduled-games/${gameId}/leave`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to leave game');
      }

      // Reload games to get updated participant list
      await loadGames();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to leave game';
      setError(errorMessage);
      Logger.error('Failed to leave game', {
        component: 'scheduled-games',
        gameId,
        error: errorMessage,
      });
    } finally {
      setIsLeaving(null);
    }
  };

  const handleEdit = (game: ScheduledGame) => {
    if (status !== 'authenticated') {
      signIn('discord');
      return;
    }
    setEditingGame(game);
  };

  const handleEditSubmit = async (updates: {
    teamSize: string;
    customTeamSize?: string;
    gameType: string;
    gameVersion?: string;
    gameLength?: number;
    modes: string[];
  }) => {
    if (!editingGame) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(`/api/scheduled-games/${editingGame.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update game');
      }

      setEditingGame(null);
      await loadGames();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update game';
      setError(errorMessage);
      throw err; // Re-throw so form can handle it
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCancel = () => {
    setEditingGame(null);
    setError(null);
  };

  const handleRequestDelete = (game: ScheduledGame) => {
    if (status !== 'authenticated') {
      signIn('discord');
      return;
    }
    setPendingDeleteGame(game);
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDeleteGame) return;

    try {
      setIsDeleting(pendingDeleteGame.id);
      setError(null);

      const response = await fetch(`/api/scheduled-games/${pendingDeleteGame.id}/delete`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete game');
      }

      setPendingDeleteGame(null);
      // Reload games to reflect deletion
      await loadGames();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete game';
      setError(errorMessage);
      Logger.error('Failed to delete game', {
        component: 'scheduled-games',
        gameId: pendingDeleteGame.id,
        error: errorMessage,
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDeleteCancel = () => {
    setPendingDeleteGame(null);
  };

  const handleUploadReplay = (game: ScheduledGame) => {
    if (status !== 'authenticated') {
      signIn('discord');
      return;
    }
    setIsUploadingReplay(game.id);
    router.push(`/scheduled-games/${game.id}/upload-replay`);
  };

  if (typeof window !== 'undefined') {
    Logger.info('Scheduled Games page visited', {
      path: window.location.pathname,
      timestamp: new Date().toISOString()
    });
  }

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-4xl w-full mx-auto px-6 py-12">
        {/* Main Heading */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <div>
            <h1 className="font-medieval-brand text-5xl md:text-6xl">
              Scheduled Games
            </h1>
            <p className="text-gray-400 mt-2">Organize games and record results.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleScheduleClick}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors"
            >
              Schedule Game
            </button>
            <button
              onClick={handleCreateGameClick}
              className="px-6 py-3 bg-black/40 border border-amber-500/40 hover:bg-black/60 text-amber-300 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <span>Create Game</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && !showForm && (
          <div className="bg-red-900/50 border border-red-500 rounded px-4 py-2 text-red-200 mb-6">
            {error}
          </div>
        )}

        {/* Content Section */}
        <div className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-8">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-400">Loading scheduled games...</p>
            </div>
          ) : (
            <ScheduledGamesList 
              games={games}
              onJoin={handleJoin}
              onLeave={handleLeave}
              onEdit={handleEdit}
              onRequestDelete={handleRequestDelete}
              onUploadReplay={handleUploadReplay}
              isJoining={isJoining}
              isLeaving={isLeaving}
              isDeleting={isDeleting}
              isUploadingReplay={isUploadingReplay}
              userIsAdmin={userIsAdmin}
            />
          )}
        </div>

        {/* Schedule Game Form Modal */}
        {showForm && (
          <ScheduleGameForm
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Edit Game Form Modal */}
        {editingGame && (
          <EditGameForm
            game={editingGame}
            onSubmit={handleEditSubmit}
            onCancel={handleEditCancel}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Create Game Form Modal */}
        {showCreateGameForm && (
          <CreateGameInlineForm
            onClose={() => setShowCreateGameForm(false)}
          />
        )}

        {/* Delete Game Dialog */}
        <GameDeleteDialog
          isOpen={!!pendingDeleteGame}
          gameTitle={pendingDeleteGame ? `${pendingDeleteGame.teamSize === 'custom' ? pendingDeleteGame.customTeamSize : pendingDeleteGame.teamSize} - ${pendingDeleteGame.gameType === 'elo' ? 'ELO' : 'Normal'}` : undefined}
          isLoading={isDeleting === pendingDeleteGame?.id}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      </div>
    </div>
  );
}

