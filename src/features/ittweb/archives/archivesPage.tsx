import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Logger } from '@/features/infrastructure/logging';
import { PageHero } from '@/features/shared/components';
import type { ArchiveEntry } from '@/types/archive';
import { 
  ArchiveForm, 
  ArchiveEditForm,
  ArchivesToolbar,
  ArchivesContent,
} from '@/features/ittweb/archives/components';
import ImageModal from '@/features/ittweb/archives/components/sections/ImageModal';
import { useArchivesPage, useArchivesActions } from '@/features/ittweb/archives/hooks';
import { getUserDataByDiscordId } from '@/features/shared/lib/userDataService';
import { UserRole } from '@/types/userData';
import { isAdmin } from '@/features/shared/utils/userRoleUtils';
import ArchiveDeleteDialog from '@/features/ittweb/archives/components/ArchiveDeleteDialog';

interface ArchivesPageProps {
  pageNamespaces: string[];
}

const ArchivesPage: React.FC<ArchivesPageProps> = ({ pageNamespaces }) => {
  const { data: session, status } = useSession();
  const [userRole, setUserRole] = useState<UserRole | undefined>();
  const [entryPendingDelete, setEntryPendingDelete] = useState<ArchiveEntry | null>(null);
  const [isDeletingEntry, setIsDeletingEntry] = useState(false);
  
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
        const userData = await getUserDataByDiscordId(session.discordId);
        if (isMounted) {
          setUserRole(userData?.role);
        }
      } catch (error) {
        Logger.warn('Failed to fetch user role for archives page', {
          error: error instanceof Error ? error.message : String(error),
        });
        if (isMounted) {
          setUserRole(undefined);
        }
      }
    };

    fetchUserRole();

    return () => {
      isMounted = false;
    };
  }, [status, session?.discordId]);

  // Load entries on mount (only once)
  useEffect(() => {
    const loadEntriesOnce = async () => {
      try {
        Logger.info('Loading archive entries - initial load');
        setLoading(true);
        setError(null);
        
        const fetchedEntries = await import('@/features/shared/lib/archiveService').then(module => module.getArchiveEntries());
        
        setEntries(fetchedEntries);
        Logger.info('Successfully loaded archive entries', { 
          count: fetchedEntries.length
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error loading entries');
        Logger.error('Failed to load archive entries', { error: error.message });
        setError('Failed to load archives. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadEntriesOnce();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount - setters are stable

  // Log page visit
  useEffect(() => {
    if (typeof window !== 'undefined') {
      Logger.info('Archives page visited', {
        path: window.location.pathname,
        timestamp: new Date().toISOString()
      });
    }
  }, []);

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
        title="Archives"
        description="Welcome to the Island Troll Tribes Archives! Explore the history and legacy of our game development, and contribute your own memories to this living timeline."
      />

      <ArchivesToolbar
        isAuthenticated={isAuthenticated}
        entriesCount={entries.length}
        sortOrder={sortOrder}
        onAddClick={handleAddClick}
        onSignInClick={handleSignIn}
        onSortOrderChange={handleSortOrderChange}
      />

      <ArchivesContent
        loading={loading}
        error={error}
        entries={entries}
        datedEntries={datedEntries}
        undatedEntries={undatedEntries}
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
