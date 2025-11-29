import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useSession, signIn } from 'next-auth/react';
import { useGame } from '@/features/modules/games/hooks/useGame';
import { GameDetail } from '@/features/modules/games/components/GameDetail';
import { Card } from '@/features/infrastructure/components/ui/Card';
import EditGameForm from '@/features/modules/scheduled-games/components/EditGameForm';
import GameDeleteDialog from '@/features/modules/scheduled-games/components/GameDeleteDialog';
import UploadReplayModal from '@/features/modules/scheduled-games/components/UploadReplayModal';
import { Logger } from '@/features/infrastructure/logging';
import { isAdmin } from '@/features/infrastructure/utils/userRoleUtils';
import type { GameWithPlayers } from '@/features/modules/games/types';

export default function GameDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { game, loading, error, refetch } = useGame(id as string);
  const { data: session, status } = useSession();
  const [editingGame, setEditingGame] = useState<GameWithPlayers | null>(null);
  const [pendingDeleteGame, setPendingDeleteGame] = useState<GameWithPlayers | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [uploadingReplayGame, setUploadingReplayGame] = useState<GameWithPlayers | null>(null);

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
        const response = await fetch('/api/user/me');
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const result = await response.json();
        const userData = result.data;
        if (isMounted) {
          setUserIsAdmin(isAdmin(userData?.role));
        }
      } catch (error) {
        Logger.warn('Failed to fetch user role for game detail page', {
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

  const isUserCreator = (game: GameWithPlayers): boolean => {
    if (!session?.discordId) return false;
    return game.createdByDiscordId === session.discordId;
  };

  const isUserParticipant = (game: GameWithPlayers): boolean => {
    if (!session?.discordId || !game.participants) return false;
    return game.participants.some(p => p.discordId === session.discordId);
  };

  const handleEdit = (game: GameWithPlayers) => {
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
      setErrorMessage(null);

      // Use unified games API
      const response = await fetch(`/api/games/${editingGame.id}`, {
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
      await refetch?.();
      router.push(`/games/${editingGame.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update game';
      setErrorMessage(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCancel = () => {
    setEditingGame(null);
    setErrorMessage(null);
  };

  const handleDelete = (game: GameWithPlayers) => {
    if (status !== 'authenticated') {
      signIn('discord');
      return;
    }
    setPendingDeleteGame(game);
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDeleteGame) return;

    try {
      setIsDeleting(true);
      setErrorMessage(null);

      // Use unified games API
      const response = await fetch(`/api/games/${pendingDeleteGame.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          error: 'Failed to delete game' 
        }));
        throw new Error(errorData.error || 'Failed to delete game');
      }

      setPendingDeleteGame(null);
      router.push('/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete game';
      setErrorMessage(errorMessage);
      Logger.error('Failed to delete game', {
        component: 'games/[id]',
        gameId: pendingDeleteGame.id,
        error: errorMessage,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setPendingDeleteGame(null);
  };

  const handleLeave = useCallback(async (gameId: string) => {
    if (status !== 'authenticated') {
      signIn('discord');
      return;
    }

    try {
      setIsLeaving(true);
      setErrorMessage(null);

      const response = await fetch(`/api/games/${gameId}/leave`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to leave game');
      }

      await refetch?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to leave game';
      setErrorMessage(errorMessage);
      Logger.error('Failed to leave game', {
        component: 'games/[id]',
        gameId,
        error: errorMessage,
      });
    } finally {
      setIsLeaving(false);
    }
  }, [status, refetch]);

  const handleUploadReplay = (game: GameWithPlayers) => {
    if (status !== 'authenticated') {
      signIn('discord');
      return;
    }
    setUploadingReplayGame(game);
  };

  const handleUploadReplaySuccess = async () => {
    setUploadingReplayGame(null);
    await refetch?.();
    // Navigate to the updated game page (it will now be completed)
    if (game) {
      router.push(`/games/${game.id}`);
    }
  };

  const handleUploadReplayClose = () => {
    setUploadingReplayGame(null);
  };

  // Early returns must come after all hooks
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card variant="medieval" className="p-8 animate-pulse">
          <div className="h-8 bg-amber-500/20 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-amber-500/10 rounded w-1/2"></div>
        </Card>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card variant="medieval" className="p-8">
          <p className="text-red-400">
            {error ? `Error: ${error.message}` : 'Game not found'}
          </p>
        </Card>
      </div>
    );
  }

  const userIsCreator = isUserCreator(game);
  const userIsParticipant = isUserParticipant(game);

  return (
    <div className="container mx-auto px-4 py-8">
      {errorMessage && (
        <div className="mb-4 bg-red-900/50 border border-red-500 rounded px-4 py-2 text-red-200">
          {errorMessage}
        </div>
      )}
      <GameDetail 
        game={game} 
        onEdit={game.gameState === 'scheduled' ? handleEdit : undefined}
        onDelete={game.gameState === 'scheduled' ? handleDelete : undefined}
        onLeave={game.gameState === 'scheduled' ? handleLeave : undefined}
        onUploadReplay={game.gameState === 'scheduled' ? handleUploadReplay : undefined}
        isLeaving={isLeaving}
        userIsCreator={userIsCreator}
        userIsParticipant={userIsParticipant}
        userIsAdmin={userIsAdmin}
      />
      
      {editingGame && (
        <EditGameForm
          game={{
            id: editingGame.id,
            gameId: editingGame.gameId,
            gameState: editingGame.gameState,
            creatorName: editingGame.creatorName,
            createdByDiscordId: editingGame.createdByDiscordId || '',
            scheduledDateTime: editingGame.scheduledDateTime || '',
            timezone: editingGame.timezone || 'UTC',
            teamSize: editingGame.teamSize || '1v1',
            customTeamSize: editingGame.customTeamSize,
            gameType: editingGame.gameType || 'normal',
            gameVersion: editingGame.gameVersion,
            gameLength: editingGame.gameLength,
            modes: editingGame.modes || [],
            participants: editingGame.participants || [],
            createdAt: typeof editingGame.createdAt === 'string' ? editingGame.createdAt : '',
            updatedAt: typeof editingGame.updatedAt === 'string' ? editingGame.updatedAt : '',
          }}
          onSubmit={handleEditSubmit}
          onCancel={handleEditCancel}
          isSubmitting={isSubmitting}
        />
      )}
      
      {pendingDeleteGame && (
        <GameDeleteDialog
          isOpen={!!pendingDeleteGame}
          gameTitle={`Game #${pendingDeleteGame.gameId}`}
          isLoading={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
      
      {uploadingReplayGame && (
        <UploadReplayModal
          game={uploadingReplayGame}
          onClose={handleUploadReplayClose}
          onSuccess={handleUploadReplaySuccess}
        />
      )}
    </div>
  );
}

