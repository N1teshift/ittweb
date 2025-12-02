import { useState, useCallback } from 'react';
import { useSession, signIn } from 'next-auth/react';
import type { GameWithPlayers } from '@/features/modules/game-management/games/types';
import { createComponentLogger } from '@/features/infrastructure/logging';
import {
  syncGameAfterUpdate,
  createOptimisticParticipant,
} from '@/features/modules/community/archives/shared/utils/gameOptimisticUpdates';

const logger = createComponentLogger('useGameJoinLeave');

interface UseGameJoinLeaveProps {
  localGames: GameWithPlayers[];
  setLocalGames: React.Dispatch<React.SetStateAction<GameWithPlayers[]>>;
  isAuthenticated: boolean;
  setError: (error: string) => void;
  markGameRecentlyUpdated: (gameId: string) => void;
}

interface UseGameJoinLeaveReturn {
  isJoining: string | false;
  isLeaving: string | false;
  handleGameJoin: (gameId: string) => Promise<void>;
  handleGameLeave: (gameId: string) => Promise<void>;
  deleteError: string | null;
  setDeleteError: (error: string | null) => void;
}

/**
 * Hook for managing game join/leave operations
 */
export function useGameJoinLeave({
  localGames,
  setLocalGames,
  isAuthenticated,
  setError,
  markGameRecentlyUpdated,
}: UseGameJoinLeaveProps): UseGameJoinLeaveReturn {
  const { data: session } = useSession();
  const [isJoining, setIsJoining] = useState<string | false>(false);
  const [isLeaving, setIsLeaving] = useState<string | false>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleGameJoin = useCallback(
    async (gameId: string) => {
      if (!isAuthenticated) {
        signIn('discord');
        return;
      }

      if (!session?.discordId || !session?.user?.name) {
        setError('Discord ID or name is missing');
        return;
      }

      // Prevent concurrent operations on the same game
      if (isLeaving === gameId) {
        logger.warn('Cannot join game while leaving operation is in progress', { gameId });
        return;
      }

      // Prevent duplicate join operations
      if (isJoining === gameId) {
        logger.warn('Join operation already in progress', { gameId });
        return;
      }

      setIsJoining(gameId);
      setDeleteError(null);

      const gameToUpdate = localGames.find((g) => g.id === gameId);
      if (!gameToUpdate) {
        setDeleteError('Game not found');
        setIsJoining(false);
        return;
      }

      // Check if user is already a participant in local state
      const isAlreadyParticipant = (gameToUpdate.participants || []).some(
        (p) => p.discordId === session.discordId
      );

      // If already a participant locally, just sync with server to ensure consistency
      if (isAlreadyParticipant) {
        logger.debug('User already a participant locally, syncing with server', { gameId });
        try {
          await syncGameAfterUpdate(gameId, setLocalGames, markGameRecentlyUpdated);
        } catch (fetchError) {
          logger.warn('Error syncing game when already participant', { gameId, error: fetchError });
        } finally {
          setIsJoining(false);
        }
        return;
      }

      // Optimistic update
      const optimisticParticipant = createOptimisticParticipant(
        session.discordId,
        session.user.name
      );
      const optimisticParticipants = [...(gameToUpdate.participants || []), optimisticParticipant];

      setLocalGames((prevGames) =>
        prevGames.map((game) =>
          game.id === gameId ? { ...game, participants: optimisticParticipants } : game
        )
      );

      try {
        const response = await fetch(`/api/games/${gameId}/join`, {
          method: 'POST',
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error || 'Failed to join game';

          // Handle "already a participant" error gracefully - just sync with server
          if (errorMessage.includes('already a participant')) {
            logger.info('User already a participant on server, syncing state', { gameId });
            try {
              await syncGameAfterUpdate(gameId, setLocalGames, markGameRecentlyUpdated);
              // Don't show error - desired state is achieved
              setIsJoining(false);
              return;
            } catch (fetchError) {
              logger.warn('Error syncing game after already participant error', {
                gameId,
                error: fetchError,
              });
              // Fall through to show error if sync fails
            }
          }

          throw new Error(errorMessage);
        }

        // Sync with server
        try {
          await syncGameAfterUpdate(gameId, setLocalGames, markGameRecentlyUpdated);
        } catch (fetchError) {
          logger.warn('Error syncing game after join', { gameId, error: fetchError });
        }
      } catch (err) {
        // Revert optimistic update
        setLocalGames((prevGames) =>
          prevGames.map((game) =>
            game.id === gameId ? { ...game, participants: gameToUpdate.participants || [] } : game
          )
        );
        const error = err instanceof Error ? err : new Error('Unknown error');
        logger.error('Failed to join game', error);
        setDeleteError(error.message);
      } finally {
        setIsJoining(false);
      }
    },
    [
      isAuthenticated,
      session?.discordId,
      session?.user?.name,
      localGames,
      setLocalGames,
      setError,
      markGameRecentlyUpdated,
      isLeaving,
      isJoining,
    ]
  );

  const handleGameLeave = useCallback(
    async (gameId: string) => {
      if (!isAuthenticated) {
        signIn('discord');
        return;
      }

      if (!session?.discordId) {
        setError('Discord ID is missing');
        return;
      }

      // Prevent concurrent operations on the same game
      if (isJoining === gameId) {
        logger.warn('Cannot leave game while join operation is in progress', { gameId });
        return;
      }

      // Prevent duplicate leave operations
      if (isLeaving === gameId) {
        logger.warn('Leave operation already in progress', { gameId });
        return;
      }

      setIsLeaving(gameId);
      setDeleteError(null);

      const gameToUpdate = localGames.find((g) => g.id === gameId);
      if (!gameToUpdate) {
        setDeleteError('Game not found');
        setIsLeaving(false);
        return;
      }

      // Check if user is not a participant in local state
      const isParticipant = (gameToUpdate.participants || []).some(
        (p) => p.discordId === session.discordId
      );

      // If not a participant locally, just sync with server to ensure consistency
      if (!isParticipant) {
        logger.debug('User not a participant locally, syncing with server', { gameId });
        try {
          await syncGameAfterUpdate(gameId, setLocalGames, markGameRecentlyUpdated);
        } catch (fetchError) {
          logger.warn('Error syncing game when not participant', { gameId, error: fetchError });
        } finally {
          setIsLeaving(false);
        }
        return;
      }

      // Optimistic update
      const optimisticParticipants = (gameToUpdate.participants || []).filter(
        (p) => p.discordId !== session.discordId
      );

      setLocalGames((prevGames) =>
        prevGames.map((game) =>
          game.id === gameId ? { ...game, participants: optimisticParticipants } : game
        )
      );

      try {
        const response = await fetch(`/api/games/${gameId}/leave`, {
          method: 'POST',
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error || 'Failed to leave game';

          // Handle "not a participant" error gracefully - just sync with server
          if (errorMessage.includes('not a participant') || errorMessage.includes('not found')) {
            logger.info('User not a participant on server, syncing state', { gameId });
            try {
              await syncGameAfterUpdate(gameId, setLocalGames, markGameRecentlyUpdated);
              // Don't show error - desired state is achieved
              setIsLeaving(false);
              return;
            } catch (fetchError) {
              logger.warn('Error syncing game after not participant error', {
                gameId,
                error: fetchError,
              });
              // Fall through to show error if sync fails
            }
          }

          throw new Error(errorMessage);
        }

        // Sync with server
        try {
          await syncGameAfterUpdate(gameId, setLocalGames, markGameRecentlyUpdated);
        } catch (fetchError) {
          logger.warn('Error syncing game after leave', { gameId, error: fetchError });
        }
      } catch (err) {
        // Revert optimistic update
        setLocalGames((prevGames) =>
          prevGames.map((game) =>
            game.id === gameId ? { ...game, participants: gameToUpdate.participants || [] } : game
          )
        );
        const error = err instanceof Error ? err : new Error('Unknown error');
        logger.error('Failed to leave game', error);
        setDeleteError(error.message);
      } finally {
        setIsLeaving(false);
      }
    },
    [
      isAuthenticated,
      session?.discordId,
      localGames,
      setLocalGames,
      setError,
      markGameRecentlyUpdated,
      isJoining,
      isLeaving,
    ]
  );

  return {
    isJoining,
    isLeaving,
    handleGameJoin,
    handleGameLeave,
    deleteError,
    setDeleteError,
  };
}



