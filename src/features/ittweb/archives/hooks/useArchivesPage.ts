import { useState, useCallback, useMemo } from 'react';
import { ArchiveEntry } from '@/types/archive';
import { createComponentLogger } from '@/features/shared/utils/loggerUtils';
import { sortArchiveEntries } from '@/lib/archiveService';

interface ArchivesPageState {
  entries: ArchiveEntry[];
  unsortedEntries: ArchiveEntry[];
  loading: boolean;
  error: string | null;
  showForm: boolean;
  showEditForm: boolean;
  editingEntry: ArchiveEntry | null;
  showImageModal: boolean;
  modalImage: { url: string; title: string } | null;
  sortOrder: 'newest' | 'oldest';
}

interface UseArchivesPageReturn {
  // State
  state: ArchivesPageState;
  
  // Computed values
  datedEntries: ArchiveEntry[];
  undatedEntries: ArchiveEntry[];
  
  // State setters
  setEntries: (entries: ArchiveEntry[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setShowForm: (show: boolean) => void;
  setShowEditForm: (show: boolean) => void;
  setEditingEntry: (entry: ArchiveEntry | null) => void;
  setShowImageModal: (show: boolean) => void;
  setModalImage: (image: { url: string; title: string } | null) => void;
  setSortOrder: (order: 'newest' | 'oldest') => void;
  
  // Utility functions
  resetError: () => void;
  resetFormStates: () => void;
}

export function useArchivesPage(): UseArchivesPageReturn {
  const logger = createComponentLogger('useArchivesPage');
  
  // State management
  const [unsortedEntries, setUnsortedEntries] = useState<ArchiveEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ArchiveEntry | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState<{ url: string; title: string } | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Computed sorted entries
  const entries = useMemo(() => 
    sortArchiveEntries(unsortedEntries, sortOrder),
    [unsortedEntries, sortOrder]
  );

  // Computed values
  const datedEntries = useMemo(() => 
    entries.filter(entry => entry.dateInfo.type !== 'undated'),
    [entries]
  );

  const undatedEntries = useMemo(() => 
    entries.filter(entry => entry.dateInfo.type === 'undated'),
    [entries]
  );



  // Memoized state object to prevent unnecessary re-renders
  const state = useMemo(() => ({
    entries,
    unsortedEntries,
    loading,
    error,
    showForm,
    showEditForm,
    editingEntry,
    showImageModal,
    modalImage,
    sortOrder,
  }), [
    entries,
    unsortedEntries,
    loading,
    error,
    showForm,
    showEditForm,
    editingEntry,
    showImageModal,
    modalImage,
    sortOrder,
  ]);

  // Utility functions
  const resetError = useCallback(() => {
    logger.debug('Resetting error state');
    setError(null);
  }, [logger]);

  const resetFormStates = useCallback(() => {
    logger.debug('Resetting form states');
    setShowForm(false);
    setShowEditForm(false);
    setEditingEntry(null);
    setShowImageModal(false);
    setModalImage(null);
  }, [logger]);

  // Log state changes for debugging
  const setEntriesWithLogging = useCallback((newEntries: ArchiveEntry[]) => {
    logger.debug('Setting entries', { count: newEntries.length });
    setUnsortedEntries(newEntries);
  }, [logger]);

  const setLoadingWithLogging = useCallback((newLoading: boolean) => {
    logger.debug('Setting loading state', { loading: newLoading });
    setLoading(newLoading);
  }, [logger]);

  const setErrorWithLogging = useCallback((newError: string | null) => {
    if (newError) {
      logger.warn('Setting error state', { error: newError });
    } else {
      logger.debug('Clearing error state');
    }
    setError(newError);
  }, [logger]);

  const setSortOrderWithLogging = useCallback((newOrder: 'newest' | 'oldest') => {
    logger.debug('Setting sort order', { sortOrder: newOrder });
    setSortOrder(newOrder);
  }, [logger]);



  return {
    // State
    state,
    
    // Computed values
    datedEntries,
    undatedEntries,
    
    // State setters
    setEntries: setEntriesWithLogging,
    setLoading: setLoadingWithLogging,
    setError: setErrorWithLogging,
    setShowForm,
    setShowEditForm,
    setEditingEntry,
    setShowImageModal,
    setModalImage,
    setSortOrder: setSortOrderWithLogging,
    
    // Utility functions
    resetError,
    resetFormStates,
  };
}
