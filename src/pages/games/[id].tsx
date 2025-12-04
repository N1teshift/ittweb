import React from 'react';
import { useRouter } from 'next/router';
import { useGame } from '@/features/modules/game-management/games/hooks/useGame';
import { GameDetail } from '@/features/modules/game-management/games/components/GameDetail';
import { Card, ErrorBoundary } from '@/features/infrastructure/components';
import EditGameForm from '@/features/modules/game-management/scheduled-games/components/EditGameForm';
import GameDeleteDialog from '@/features/modules/game-management/scheduled-games/components/GameDeleteDialog';
import UploadReplayModal from '@/features/modules/game-management/scheduled-games/components/UploadReplayModal';
import { useGameActions } from '@/features/modules/game-management/games/hooks/useGameActions';
import { useGamePermissions } from '@/features/modules/game-management/games/hooks/useGamePermissions';

export default function GameDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { game, loading, error, refetch } = useGame(id as string);
  
  const {
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
  } = useGameActions(refetch);

  const { userIsAdmin, isUserCreator, isUserParticipant } = useGamePermissions();

  // Early returns must come after all hooks
  // Don't show error if router is not ready yet (query params still loading)
  // or if we're still loading the game data
  if (!router.isReady || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card variant="medieval" className="p-8 animate-pulse">
          <div className="h-8 bg-amber-500/20 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-amber-500/10 rounded w-1/2"></div>
        </Card>
      </div>
    );
  }

  // Only show error if router is ready and we have a definitive error or missing game
  if (error || !game) {
    return (
      <ErrorBoundary>
        <div className="container mx-auto px-4 py-8">
          <Card variant="medieval" className="p-8">
            <p className="text-red-400">
              {error ? `Error: ${error.message}` : 'Game not found'}
            </p>
          </Card>
        </div>
      </ErrorBoundary>
    );
  }

  const userIsCreatorFlag = isUserCreator(game);
  const userIsParticipantFlag = isUserParticipant(game);

  return (
    <ErrorBoundary>
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
        onJoin={game.gameState === 'scheduled' ? handleJoin : undefined}
        onLeave={game.gameState === 'scheduled' ? handleLeave : undefined}
        onUploadReplay={game.gameState === 'scheduled' ? handleUploadReplay : undefined}
        isJoining={isJoining}
        isLeaving={isLeaving}
        userIsCreator={userIsCreatorFlag}
        userIsParticipant={userIsParticipantFlag}
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
    </ErrorBoundary>
  );
}

