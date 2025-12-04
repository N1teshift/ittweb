import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useSession, signIn } from 'next-auth/react';
import { Logger } from '@/features/infrastructure/logging';
import type { GameWithPlayers } from '@/features/modules/game-management/games/types';

interface UseGameActionsResult {
  // State
  editingGame: GameWithPlayers | null;
  pendingDeleteGame: GameWithPlayers | null;
  uploadingReplayGame: GameWithPlayers | null;
  isSubmitting: boolean;
  isJoining: boolean;
  isLeaving: boolean;
  isDeleting: boolean;
  errorMessage: string | null;
  
  // Handlers
  handleEdit: (game: GameWithPlayers) => void;
  handleEditSubmit: (updates: {
    teamSize: string;
    customTeamSize?: string;
    gameType: string;
    gameVersion?: string;
    gameLength?: number;
    modes: string[];
  }) => Promise<void>;
  handleEditCancel: () => void;
  handleDelete: (game: GameWithPlayers) => void;
  handleDeleteConfirm: () => Promise<void>;
  handleDeleteCancel: () => void;
  handleJoin: (gameId: string) => Promise<void>;
  handleLeave: (gameId: string) => Promise<void>;
  handleUploadReplay: (game: GameWithPlayers) => void;
  handleUploadReplaySuccess: () => Promise<void>;
  handleUploadReplayClose: () => void;
}

export function useGameActions(
  refetch?: () => void | Promise<void>
): UseGameActionsResult {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [editingGame, setEditingGame] = useState<GameWithPlayers | null>(null);
  const [pendingDeleteGame, setPendingDeleteGame] = useState<GameWithPlayers | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadingReplayGame, setUploadingReplayGame] = useState<GameWithPlayers | null>(null);

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
        component: 'useGameActions',
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

  const handleJoin = useCallback(async (gameId: string) => {
    if (status !== 'authenticated') {
      signIn('discord');
      return;
    }

    if (!session?.discordId || !session?.user?.name) {
      setErrorMessage('Discord ID or name is missing');
      return;
    }

    try {
      setIsJoining(true);
      setErrorMessage(null);

      const response = await fetch(`/api/games/${gameId}/join`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join game');
      }

      await refetch?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join game';
      setErrorMessage(errorMessage);
      Logger.error('Failed to join game', {
        component: 'useGameActions',
        gameId,
        error: errorMessage,
      });
    } finally {
      setIsJoining(false);
    }
  }, [status, session?.discordId, session?.user?.name, refetch]);

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
        component: 'useGameActions',
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
    // Force a full page refresh to get the updated game data
    // This ensures we get fresh data from the server, bypassing any cache
    router.reload();
  };

  const handleUploadReplayClose = () => {
    setUploadingReplayGame(null);
  };

  return {
    editingGame,
    pendingDeleteGame,
    uploadingReplayGame,
    isSubmitting,
    isJoining,
    isLeaving,
    isDeleting,
    errorMessage,
    handleEdit,
    handleEditSubmit,
    handleEditCancel,
    handleDelete,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleJoin,
    handleLeave,
    handleUploadReplay,
    handleUploadReplaySuccess,
    handleUploadReplayClose,
  };
}

