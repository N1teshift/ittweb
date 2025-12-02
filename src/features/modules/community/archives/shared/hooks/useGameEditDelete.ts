import { useState, useCallback } from 'react';
import { signIn } from 'next-auth/react';
import type { GameWithPlayers } from '@/features/modules/game-management/games/types';
import { createComponentLogger } from '@/features/infrastructure/logging';
import { submitGameEdit } from '@/features/modules/community/archives/shared/utils/gameEditUtils';

const logger = createComponentLogger('useGameEditDelete');

interface UseGameEditDeleteProps {
  localGames: GameWithPlayers[];
  setLocalGames: React.Dispatch<React.SetStateAction<GameWithPlayers[]>>;
  isAuthenticated: boolean;
  canManageEntries: boolean;
  currentDiscordId: string | undefined;
  setError: (error: string) => void;
  markGameRecentlyUpdated: (gameId: string) => void;
  refetchGames: () => void | Promise<void>;
}

interface UseGameEditDeleteReturn {
  editingGame: GameWithPlayers | null;
  pendingDeleteGame: GameWithPlayers | null;
  isDeletingGame: boolean;
  setEditingGame: (game: GameWithPlayers | null) => void;
  setPendingDeleteGame: (game: GameWithPlayers | null) => void;
  handleGameEdit: (game: GameWithPlayers) => void;
  handleGameEditSubmit: (updates: {
    teamSize: string;
    customTeamSize?: string;
    gameType: string;
    gameVersion?: string;
    gameLength?: number;
    modes: string[];
  }) => Promise<void>;
  handleGameEditCancel: () => void;
  handleGameDelete: (game: GameWithPlayers) => void;
  handleGameDeleteConfirm: () => Promise<void>;
  handleGameDeleteCancel: () => void;
  deleteError: string | null;
  setDeleteError: (error: string | null) => void;
}

/**
 * Hook for managing game edit/delete operations
 */
export function useGameEditDelete({
  localGames,
  setLocalGames,
  isAuthenticated,
  canManageEntries,
  currentDiscordId,
  setError,
  markGameRecentlyUpdated,
  refetchGames,
}: UseGameEditDeleteProps): UseGameEditDeleteReturn {
  const [editingGame, setEditingGame] = useState<GameWithPlayers | null>(null);
  const [pendingDeleteGame, setPendingDeleteGame] = useState<GameWithPlayers | null>(null);
  const [isDeletingGame, setIsDeletingGame] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleGameEdit = useCallback(
    (game: GameWithPlayers) => {
      if (!isAuthenticated) {
        signIn('discord');
        return;
      }
      if (game.gameState !== 'scheduled') {
        setError('Only scheduled games can be edited');
        return;
      }
      setEditingGame(game);
    },
    [isAuthenticated, setError]
  );

  const handleGameEditSubmit = useCallback(
    async (updates: {
      teamSize: string;
      customTeamSize?: string;
      gameType: string;
      gameVersion?: string;
      gameLength?: number;
      modes: string[];
    }) => {
      if (!editingGame) return;

      try {
        await submitGameEdit(
          editingGame.id,
          updates,
          localGames,
          setLocalGames,
          markGameRecentlyUpdated
        );
        setEditingGame(null);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        logger.error('Failed to update game', error);
        setError(error.message);
      }
    },
    [editingGame, localGames, setLocalGames, setError, markGameRecentlyUpdated]
  );

  const handleGameEditCancel = useCallback(() => {
    setEditingGame(null);
  }, []);

  const handleGameDelete = useCallback(
    (game: GameWithPlayers) => {
      if (!isAuthenticated) {
        signIn('discord');
        return;
      }
      if (game.gameState !== 'scheduled') {
        setError('Only scheduled games can be deleted');
        return;
      }

      const canDelete =
        canManageEntries || (!!currentDiscordId && game.createdByDiscordId === currentDiscordId);
      if (!canDelete) {
        setError('You do not have permission to delete this game');
        return;
      }

      setPendingDeleteGame(game);
    },
    [isAuthenticated, canManageEntries, currentDiscordId, setError]
  );

  const handleGameDeleteConfirm = useCallback(async () => {
    if (!pendingDeleteGame) return;

    const gameIdToDelete = pendingDeleteGame.id;

    // Optimistic update
    setLocalGames((prevGames) => prevGames.filter((game) => game.id !== gameIdToDelete));

    setIsDeletingGame(true);
    setDeleteError(null);
    setPendingDeleteGame(null);

    try {
      const response = await fetch(`/api/games/${gameIdToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete game');
      }
    } catch (err) {
      const refetchResult = refetchGames();
      if (refetchResult instanceof Promise) {
        await refetchResult;
      }
      const error = err instanceof Error ? err : new Error('Unknown error');
      logger.error('Failed to delete game', error);
      setDeleteError(error.message);
    } finally {
      setIsDeletingGame(false);
    }
  }, [pendingDeleteGame, setLocalGames, refetchGames]);

  const handleGameDeleteCancel = useCallback(() => {
    setPendingDeleteGame(null);
  }, []);

  return {
    editingGame,
    pendingDeleteGame,
    isDeletingGame,
    setEditingGame,
    setPendingDeleteGame,
    handleGameEdit,
    handleGameEditSubmit,
    handleGameEditCancel,
    handleGameDelete,
    handleGameDeleteConfirm,
    handleGameDeleteCancel,
    deleteError,
    setDeleteError,
  };
}



