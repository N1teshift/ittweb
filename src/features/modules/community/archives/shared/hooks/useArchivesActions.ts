import { useCallback } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { ArchiveEntry } from '@/types/archive';
import { getArchiveEntries, deleteArchiveEntry } from '@/features/modules/community/archives/services';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';

interface UseArchivesActionsProps {
  // State setters from useArchivesPage
  setEntries: (entries: ArchiveEntry[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setShowForm: (show: boolean) => void;
  setShowEditForm: (show: boolean) => void;
  setEditingEntry: (entry: ArchiveEntry | null) => void;
  setShowImageModal: (show: boolean) => void;
  setModalImage: (image: { url: string; title: string } | null) => void;
  setSortOrder: (order: 'newest' | 'oldest') => void;

  // Current state
  entries: ArchiveEntry[];
  sortOrder: 'newest' | 'oldest';
}

interface UseArchivesActionsReturn {
  // Data loading
  loadEntries: () => Promise<void>;
  reloadEntries: () => Promise<void>;

  // Form actions
  handleAddSuccess: () => void;
  handleAddCancel: () => void;
  handleEdit: (entry: ArchiveEntry) => void;
  handleEditSuccess: () => void;
  handleEditCancel: () => void;

  // Image modal actions
  handleImageClick: (url: string, title: string) => void;
  handleImageModalClose: () => void;

  // Sorting actions
  handleSortOrderChange: (newOrder: 'newest' | 'oldest') => void;

  // Authentication actions
  handleSignIn: () => void;

  // Entry management
  handleDelete: (entry: ArchiveEntry) => Promise<void>;
}

export function useArchivesActions({
  setEntries,
  setLoading,
  setError,
  setShowForm,
  setShowEditForm,
  setEditingEntry,
  setShowImageModal,
  setModalImage,
  setSortOrder,
  entries: _entries,
  sortOrder,
}: UseArchivesActionsProps): UseArchivesActionsReturn {
  const { status } = useSession();
  const logger = createComponentLogger('useArchivesActions');

  // Data loading - load entries without sorting (for initial load)
  const loadEntries = useCallback(async () => {
    try {
      logger.info('Loading archive entries - initial load');
      setLoading(true);
      setError(null);

      const fetchedEntries = await getArchiveEntries();

      setEntries(fetchedEntries);
      logger.info('Successfully loaded archive entries', {
        count: fetchedEntries.length
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error loading entries');
      logError(error, 'Failed to load archive entries', {
        component: 'useArchivesActions',
        operation: 'loadEntries'
      });
      setError('Failed to load archives. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [setEntries, setLoading, setError, logger]);

  // Reload entries without sorting (sorting handled by useArchivesPage)
  const reloadEntries = useCallback(async () => {
    try {
      const fetchedEntries = await getArchiveEntries();
      setEntries(fetchedEntries);
      logger.info('Reloaded archive entries', {
        count: fetchedEntries.length
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error reloading entries');
      logError(error, 'Failed to reload archive entries', {
        component: 'useArchivesActions',
        operation: 'reloadEntries'
      });
    }
  }, [setEntries, logger]);

  // Form actions
  const handleAddSuccess = useCallback(() => {
    logger.info('Archive entry added successfully');
    setShowForm(false);
    reloadEntries(); // Reload entries after adding new one
  }, [setShowForm, reloadEntries, logger]);

  const handleAddCancel = useCallback(() => {
    logger.debug('Add form cancelled');
    setShowForm(false);
  }, [setShowForm, logger]);

  const handleEdit = useCallback((entry: ArchiveEntry) => {
    if (status !== 'authenticated') {
      logger.info('User not authenticated, redirecting to sign in');
      signIn('discord');
      return;
    }

    logger.info('Starting edit mode', { entryId: entry.id, title: entry.title });
    setEditingEntry(entry);
    setShowEditForm(true);
  }, [status, setEditingEntry, setShowEditForm, logger]);

  const handleEditSuccess = useCallback(() => {
    logger.info('Archive entry edited successfully');
    setShowEditForm(false);
    setEditingEntry(null);
    reloadEntries(); // Reload entries after editing
  }, [setShowEditForm, setEditingEntry, reloadEntries, logger]);

  const handleEditCancel = useCallback(() => {
    logger.debug('Edit form cancelled');
    setShowEditForm(false);
    setEditingEntry(null);
  }, [setShowEditForm, setEditingEntry, logger]);

  // Image modal actions
  const handleImageClick = useCallback((url: string, title: string) => {
    logger.debug('Opening image modal', { url, title });
    setModalImage({ url, title });
    setShowImageModal(true);
  }, [setModalImage, setShowImageModal, logger]);

  const handleImageModalClose = useCallback(() => {
    logger.debug('Closing image modal');
    setShowImageModal(false);
    setModalImage(null);
  }, [setShowImageModal, setModalImage, logger]);

  // Sorting actions
  const handleSortOrderChange = useCallback((newOrder: 'newest' | 'oldest') => {
    logger.info('Changing sort order', { from: sortOrder, to: newOrder });
    setSortOrder(newOrder);
    // No need to re-sort here - it will be handled by the computed entries in useArchivesPage
  }, [sortOrder, setSortOrder, logger]);

  const handleDelete = useCallback(async (entry: ArchiveEntry) => {
    if (status !== 'authenticated') {
      logger.info('User not authenticated, redirecting to sign in');
      signIn('discord');
      return;
    }

    try {
      logger.info('Deleting archive entry', { entryId: entry.id, title: entry.title });
      setLoading(true);
      setError(null);
      await deleteArchiveEntry(entry.id);
      await reloadEntries();
      logger.info('Archive entry deleted successfully', { entryId: entry.id });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error deleting entry');
      logError(error, 'Failed to delete archive entry', {
        component: 'useArchivesActions',
        operation: 'handleDelete',
        entryId: entry.id,
      });
      setError('Failed to delete archive entry. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [status, reloadEntries, setLoading, setError, logger]);

  // Authentication actions
  const handleSignIn = useCallback(() => {
    logger.info('Initiating Discord sign in');
    signIn('discord');
  }, [logger]);

  return {
    // Data loading
    loadEntries,
    reloadEntries,

    // Form actions
    handleAddSuccess,
    handleAddCancel,
    handleEdit,
    handleEditSuccess,
    handleEditCancel,

    // Image modal actions
    handleImageClick,
    handleImageModalClose,

    // Sorting actions
    handleSortOrderChange,

    // Authentication actions
    handleSignIn,

    // Entry management
    handleDelete,
  };
}


