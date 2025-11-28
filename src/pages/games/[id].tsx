import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useSession, signIn } from 'next-auth/react';
import { useGame } from '@/features/modules/games/hooks/useGame';
import { GameDetail } from '@/features/modules/games/components/GameDetail';
import { Card } from '@/features/infrastructure/shared/components/ui/Card';
import EditGameForm from '@/features/modules/scheduled-games/components/EditGameForm';
import GameDeleteDialog from '@/features/modules/scheduled-games/components/GameDeleteDialog';
import { Logger } from '@/features/infrastructure/logging';
import { getUserDataByDiscordId } from '@/features/shared/lib/userDataService';
import { isAdmin } from '@/features/shared/utils/userRoleUtils';
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

      // Try scheduledGames API first (for games in scheduledGames collection)
      let response = await fetch(`/api/scheduled-games/${editingGame.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      // If that fails, try games API (for games in games collection with gameState: 'scheduled')
      if (!response.ok) {
        response = await fetch(`/api/games/${editingGame.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...updates,
            gameState: 'scheduled', // Ensure gameState is set
          }),
        });
      }

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

      // Try scheduledGames API first (for games in scheduledGames collection)
      let response = await fetch(`/api/scheduled-games/${pendingDeleteGame.id}/delete`, {
        method: 'DELETE',
      });

      // If that fails, try games API (for games in games collection with gameState: 'scheduled')
      // 404 is expected when the game is in the games collection instead
      if (!response.ok) {
        // If it's a 404, silently try the games API (expected fallback)
        // For other errors, also try games API as fallback
        const secondResponse = await fetch(`/api/games/${pendingDeleteGame.id}`, {
          method: 'DELETE',
        });
        
        if (!secondResponse.ok) {
          // Both attempts failed - parse error from the second response (most recent)
          const errorData = await secondResponse.json().catch(() => ({ 
            error: response.status === 404 ? 'Game not found' : 'Failed to delete game' 
          }));
          throw new Error(errorData.error || 'Failed to delete game');
        }
        
        // Second attempt succeeded
        response = secondResponse;
      }

      setPendingDeleteGame(null);
      router.push('/scheduled-games');
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

      const response = await fetch(`/api/scheduled-games/${gameId}/leave`, {
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
        isLeaving={isLeaving}
        userIsCreator={userIsCreator}
        userIsParticipant={userIsParticipant}
        userIsAdmin={userIsAdmin}
      />
      
      {editingGame && (
        <EditGameForm
          game={{
            id: editingGame.id,
            scheduledGameId: editingGame.gameId,
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
            status: editingGame.status || 'scheduled',
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
    </div>
  );
}

