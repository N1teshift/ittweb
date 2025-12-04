import { useState, useCallback, useMemo } from 'react';
import { ArchiveEntry } from '@/types/archive';
import { sortArchiveEntries } from '@/features/modules/community/archives/services';

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
    entries.filter((entry: ArchiveEntry) => entry.dateInfo.type !== 'undated'),
    [entries]
  );

  const undatedEntries = useMemo(() =>
    entries.filter((entry: ArchiveEntry) => entry.dateInfo.type === 'undated'),
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
    setError(null);
  }, []);

  const resetFormStates = useCallback(() => {
    setShowForm(false);
    setShowEditForm(false);
    setEditingEntry(null);
    setShowImageModal(false);
    setModalImage(null);
  }, []);

  return {
    // State
    state,

    // Computed values
    datedEntries,
    undatedEntries,

    // State setters
    setEntries: setUnsortedEntries,
    setLoading,
    setError,
    setShowForm,
    setShowEditForm,
    setEditingEntry,
    setShowImageModal,
    setModalImage,
    setSortOrder,

    // Utility functions
    resetError,
    resetFormStates,
  };
}


