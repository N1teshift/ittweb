import React, { useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import type { GameFilters } from '@/features/modules/game-management/games/types';
import ImageModal from '@/features/modules/community/archives/shared/components/sections/ImageModal';
import { HomeTimelineModals } from './HomeTimelineModals';
import { DeleteErrorDisplay } from '../../display/components';
import { HomeTimelineContent } from './HomeTimelineContent';
import {
  useArchivesPage,
  useArchivesActions,
  useTimelineGames,
  useTimelineEntries,
  useTimelinePermissions,
  useGameJoinLeave,
  useGameEditDelete,
  useEntryOperations,
} from '@/features/modules/community/archives/shared/hooks';
import { useGames } from '@/features/modules/game-management/games/hooks/useGames';
import { extractEntryId } from '@/features/modules/community/archives/shared/utils/entryUtils';

export interface HomeTimelineHandle {
  addNewGame: (gameId: string) => Promise<void>;
  addNewEntry: (entryId: string) => Promise<void>;
}

const HomeTimeline = forwardRef<HomeTimelineHandle>((_props, ref) => {
  const [gameFilters] = React.useState<GameFilters>({});

  // Archive page state and actions
  const {
    state: { entries, loading, error, showImageModal, modalImage },
    datedEntries,
    undatedEntries,
    setEntries,
    setLoading,
    setError,
    setShowImageModal,
    setModalImage,
  } = useArchivesPage();

  const {
    handleImageClick,
    handleImageModalClose,
    handleSignIn,
  } = useArchivesActions({
    setEntries,
    setLoading,
    setError,
    setShowForm: () => {},
    setShowEditForm: () => {},
    setEditingEntry: () => {},
    setShowImageModal,
    setModalImage,
    setSortOrder: () => {},
    entries,
    sortOrder: 'newest',
  });

  // Fetch games
  const { games, loading: gamesLoading, error: gamesError, refetch: refetchGames } = useGames({
    ...gameFilters,
    limit: 100,
  });

  // Game state management
  const {
    localGames,
    setLocalGames,
    gamesMap,
    addNewGame,
    markGameRecentlyUpdated,
  } = useTimelineGames({
    games,
    gamesLoading,
    gamesError,
    refetchGames,
  });

  // Entry loading
  const { loadAllEntries, addNewEntry } = useTimelineEntries({
    setEntries,
    setLoading,
    setError,
  });

  // Load entries on mount
  useEffect(() => {
    loadAllEntries();
  }, [loadAllEntries]);

  // User permissions
  const { isAuthenticated, currentDiscordId, canManageEntries } = useTimelinePermissions();

  // Game join/leave operations
  const {
    isJoining,
    isLeaving,
    handleGameJoin,
    handleGameLeave,
    deleteError: joinLeaveError,
    setDeleteError: setJoinLeaveError,
  } = useGameJoinLeave({
    localGames,
    setLocalGames,
    isAuthenticated,
    setError,
    markGameRecentlyUpdated,
  });

  // Game edit/delete operations
  const {
    editingGame,
    pendingDeleteGame,
    isDeletingGame,
    handleGameEdit,
    handleGameEditSubmit,
    handleGameEditCancel,
    handleGameDelete,
    handleGameDeleteConfirm,
    handleGameDeleteCancel,
    deleteError: editDeleteError,
    setDeleteError: setEditDeleteError,
  } = useGameEditDelete({
    localGames,
    setLocalGames,
    isAuthenticated,
    canManageEntries,
    currentDiscordId,
    setError,
    markGameRecentlyUpdated,
    refetchGames,
  });

  // Combine errors from both hooks
  const gameDeleteError = joinLeaveError || editDeleteError;
  const setGameDeleteError = (error: string | null) => {
    setJoinLeaveError(error);
    setEditDeleteError(error);
  };

  // Entry operations
  const {
    editingEntry,
    pendingDeleteEntry,
    isDeleting,
    handleEdit,
    handleRequestDelete,
    handleEditSuccess,
    handleEditCancel,
    handleEntryDeleteConfirm,
    handleEntryDeleteCancel,
  } = useEntryOperations({
    entries,
    setEntries,
    isAuthenticated,
    canManageEntries,
    currentDiscordId,
    setError,
    loadAllEntries,
  });

  // Expose methods via ref
  useImperativeHandle(
    ref,
    () => ({
      addNewGame,
      addNewEntry: async (entryId: string) => {
        await addNewEntry(entryId, entries);
      },
    }),
    [addNewGame, addNewEntry, entries]
  );

  const handleAddClick = useCallback(() => {}, []);

  return (
    <>
      <HomeTimelineContent
        loading={loading}
        gamesLoading={gamesLoading}
        error={error}
        gamesError={gamesError}
        entries={entries}
        datedEntries={datedEntries}
        undatedEntries={undatedEntries}
        localGames={localGames}
        gamesMap={gamesMap}
        isAuthenticated={isAuthenticated}
        canManageEntries={canManageEntries}
        currentDiscordId={currentDiscordId}
        isJoining={isJoining}
        isLeaving={isLeaving}
        onEdit={handleEdit}
        onRequestDelete={handleRequestDelete}
        onImageClick={handleImageClick}
        onAddClick={handleAddClick}
        onSignInClick={handleSignIn}
        onGameEdit={handleGameEdit}
        onGameDelete={handleGameDelete}
        onGameJoin={handleGameJoin}
        onGameLeave={handleGameLeave}
      />

      <ImageModal isOpen={showImageModal} image={modalImage} onClose={handleImageModalClose} />

      <HomeTimelineModals
        editingEntry={editingEntry}
        editingGame={editingGame}
        pendingDeleteEntry={pendingDeleteEntry}
        pendingDeleteGame={pendingDeleteGame}
        isDeleting={isDeleting}
        isDeletingGame={isDeletingGame}
        extractEntryId={extractEntryId}
        onEditSuccess={handleEditSuccess}
        onEditCancel={handleEditCancel}
        onGameEditSubmit={handleGameEditSubmit}
        onGameEditCancel={handleGameEditCancel}
        onEntryDeleteConfirm={handleEntryDeleteConfirm}
        onEntryDeleteCancel={handleEntryDeleteCancel}
        onGameDeleteConfirm={handleGameDeleteConfirm}
        onGameDeleteCancel={handleGameDeleteCancel}
      />

      <DeleteErrorDisplay error={gameDeleteError} onDismiss={() => setGameDeleteError(null)} />
    </>
  );
});

HomeTimeline.displayName = 'HomeTimeline';

export default HomeTimeline;


