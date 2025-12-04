import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { useSession } from 'next-auth/react';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import { PageHero } from '@/features/infrastructure/components';
import type { ArchiveEntry } from '@/types/archive';
import type { GameFilters } from '@/features/modules/game-management/games/types';
import {
  ArchiveForm,
  ArchiveEditForm
} from '@/features/modules/community/archives/forms/components';
import {
  ArchivesToolbar
} from '@/features/modules/community/archives/shared/components';
import {
  ArchivesContent
} from '@/features/modules/community/archives/timeline/components';
import ImageModal from '@/features/modules/community/archives/shared/components/sections/ImageModal';
import { useArchivesPage, useArchivesActions } from '@/features/modules/community/archives/shared/hooks';
import { useGames } from '@/features/modules/game-management/games/hooks/useGames';
import { UserRole } from '@/types/userData';
import { isAdmin } from '@/features/modules/community/users';
import ArchiveDeleteDialog from '@/features/modules/community/archives/forms/components/ArchiveDeleteDialog';

interface ArchivesPageProps {
  pageNamespaces: string[];
}

const ArchivesPage: React.FC<ArchivesPageProps> = ({ pageNamespaces: _pageNamespaces }) => {
  const logger = createComponentLogger('ArchivesPage');
  const { data: session, status } = useSession();
  const [userRole, setUserRole] = useState<UserRole | undefined>();
  const [entryPendingDelete, setEntryPendingDelete] = useState<ArchiveEntry | null>(null);
  const [isDeletingEntry, setIsDeletingEntry] = useState(false);
  const [gameFilters, setGameFilters] = useState<GameFilters>({});
  
  // Use our custom hooks
  const {
    state: { entries, loading, error, showForm, showEditForm, editingEntry, showImageModal, modalImage, sortOrder },
    datedEntries,
    undatedEntries,
    setEntries,
    setLoading,
    setError,
    setShowForm,
    setShowEditForm,
    setEditingEntry,
    setShowImageModal,
    setModalImage,
    setSortOrder,
  } = useArchivesPage();

  const {
    loadEntries,
    handleAddSuccess,
    handleAddCancel,
    handleEdit,
    handleEditSuccess,
    handleEditCancel,
    handleImageClick,
    handleImageModalClose,
    handleSortOrderChange,
    handleSignIn,
    handleDelete,
  } = useArchivesActions({
    setEntries,
    setLoading,
    setError,
    setShowForm,
    setShowEditForm,
    setEditingEntry,
    setShowImageModal,
    setModalImage,
    setSortOrder,
    entries,
    sortOrder,
  });

  // Fetch games with filters
  const { games, loading: gamesLoading } = useGames({ ...gameFilters, limit: 100 });

  useEffect(() => {
    let isMounted = true;

    const fetchUserRole = async () => {
      if (status !== 'authenticated' || !session?.discordId) {
        if (isMounted) {
          setUserRole(undefined);
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
          setUserRole(userData?.role);
        }
      } catch (error) {
        logError(
          error instanceof Error ? error : new Error(String(error)),
          'Failed to fetch user role for archives page',
          { component: 'ArchivesPage', operation: 'fetchUserRole' }
        );
        if (isMounted) {
          setUserRole(undefined);
        }
      }
    };

    fetchUserRole();

    return () => {
      isMounted = false;
    };
  }, [status, session?.discordId, logger]);

  // Load entries on mount (only once)
  useEffect(() => {
    loadEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount - loadEntries is stable from hook

  // Log page visit
  useEffect(() => {
    if (typeof window !== 'undefined') {
      logger.info('Archives page visited', {
        path: window.location.pathname,
        timestamp: new Date().toISOString()
      });
    }
  }, [logger]);

  // Memoized handlers to prevent unnecessary re-renders
  const handleAddClick = useCallback(() => {
    setShowForm(true);
  }, [setShowForm]);

  const isAuthenticated = useMemo(() => status === 'authenticated', [status]);
  const currentDiscordId = session?.discordId;
  const canManageEntries = useMemo(() => isAdmin(userRole), [userRole]);
  const handleRequestDelete = useCallback((entry: ArchiveEntry) => {
    setEntryPendingDelete(entry);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!entryPendingDelete) return;
    try {
      setIsDeletingEntry(true);
      await handleDelete(entryPendingDelete);
      setEntryPendingDelete(null);
    } finally {
      setIsDeletingEntry(false);
    }
  }, [entryPendingDelete, handleDelete]);

  const handleDeleteCancel = useCallback(() => {
    setEntryPendingDelete(null);
  }, []);

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <PageHero
        title="Archives & Games"
        description="Explore all games and archive entries in one unified timeline. Filter by category, player, or date range to find exactly what you're looking for."
      />

      <ArchivesToolbar
        isAuthenticated={isAuthenticated}
        entriesCount={entries.length}
        sortOrder={sortOrder}
        filters={gameFilters}
        onAddClick={handleAddClick}
        onSignInClick={handleSignIn}
        onSortOrderChange={handleSortOrderChange}
        onFiltersChange={setGameFilters}
      />

      <ArchivesContent
        loading={loading || gamesLoading}
        error={error}
        entries={entries}
        datedEntries={datedEntries}
        undatedEntries={undatedEntries}
        games={games}
        isAuthenticated={isAuthenticated}
        canManageEntries={canManageEntries}
        canDeleteEntry={(entry) =>
          canManageEntries ||
          (!!currentDiscordId && entry.createdByDiscordId === currentDiscordId)
        }
        onEdit={handleEdit}
        onRequestDelete={handleRequestDelete}
        onImageClick={handleImageClick}
        onAddClick={handleAddClick}
        onSignInClick={handleSignIn}
      />

      {isAuthenticated && showForm && (
        <ArchiveForm
          onSuccess={handleAddSuccess}
          onCancel={handleAddCancel}
        />
      )}

      {isAuthenticated && showEditForm && editingEntry && (
        <ArchiveEditForm
          entry={editingEntry}
          onSuccess={handleEditSuccess}
          onCancel={handleEditCancel}
        />
      )}

      <ImageModal isOpen={showImageModal} image={modalImage} onClose={handleImageModalClose} />

      <ArchiveDeleteDialog
        isOpen={!!entryPendingDelete}
        entryTitle={entryPendingDelete?.title}
        isLoading={isDeletingEntry}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
};

export default ArchivesPage;


