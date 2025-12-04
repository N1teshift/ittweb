import { useState, useCallback } from 'react';
import { signIn } from 'next-auth/react';
import type { ArchiveEntry } from '@/types/archive';
import { convertEntryToArchiveEntry } from '@/features/modules/community/archives/shared/utils/entryToArchiveEntry';
import { timestampToIso } from '@/features/infrastructure/utils';
import { createComponentLogger } from '@/features/infrastructure/logging';

const logger = createComponentLogger('useEntryOperations');

interface UseEntryOperationsProps {
  entries: ArchiveEntry[];
  setEntries: (entries: ArchiveEntry[]) => void;
  isAuthenticated: boolean;
  canManageEntries: boolean;
  currentDiscordId: string | undefined;
  setError: (error: string) => void;
  loadAllEntries: () => Promise<void>;
}

interface UseEntryOperationsReturn {
  editingEntry: ArchiveEntry | null;
  pendingDeleteEntry: ArchiveEntry | null;
  isDeleting: boolean;
  setEditingEntry: (entry: ArchiveEntry | null) => void;
  setPendingDeleteEntry: (entry: ArchiveEntry | null) => void;
  handleEdit: (entry: ArchiveEntry) => void;
  handleRequestDelete: (entry: ArchiveEntry) => void;
  handleEditSuccess: (entryId?: string) => Promise<void>;
  handleEditCancel: () => void;
  handleEntryDeleteConfirm: () => Promise<void>;
  handleEntryDeleteCancel: () => void;
}

/**
 * Extract entry ID from ArchiveEntry ID (entries have prefix "entry-")
 */
function extractEntryId(archiveEntryId: string): string | null {
  if (archiveEntryId.startsWith('entry-')) {
    return archiveEntryId.replace('entry-', '');
  }
  return null;
}

/**
 * Hook for managing entry operations (edit, delete)
 */
export function useEntryOperations({
  entries,
  setEntries,
  isAuthenticated,
  canManageEntries,
  currentDiscordId,
  setError,
  loadAllEntries,
}: UseEntryOperationsProps): UseEntryOperationsReturn {
  const [editingEntry, setEditingEntry] = useState<ArchiveEntry | null>(null);
  const [pendingDeleteEntry, setPendingDeleteEntry] = useState<ArchiveEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = useCallback(
    (entry: ArchiveEntry) => {
      if (!isAuthenticated) {
        signIn('discord');
        return;
      }
      if (entry.id.startsWith('entry-')) {
        setEditingEntry(entry);
      } else {
        setError('Only posts and memories can be edited from the timeline');
      }
    },
    [isAuthenticated, setError]
  );

  const handleRequestDelete = useCallback(
    (entry: ArchiveEntry) => {
      if (!isAuthenticated) {
        signIn('discord');
        return;
      }

      const canDelete =
        canManageEntries || (!!currentDiscordId && entry.createdByDiscordId === currentDiscordId);
      if (!canDelete) {
        setError('You do not have permission to delete this entry');
        return;
      }

      const entryId = extractEntryId(entry.id);
      if (!entryId) {
        setError('Only posts and memories can be deleted from the timeline');
        return;
      }

      setPendingDeleteEntry(entry);
    },
    [isAuthenticated, canManageEntries, currentDiscordId, setError]
  );

  const handleEditSuccess = useCallback(
    async (entryId?: string) => {
      if (!entryId || !editingEntry) {
        setEditingEntry(null);
        await loadAllEntries();
        return;
      }

      const archiveEntryId = editingEntry.id;

      try {
        const entryResponse = await fetch(`/api/entries/${entryId}?t=${Date.now()}`, {
          cache: 'no-store',
        });

        if (entryResponse.ok) {
          const responseData = await entryResponse.json();
          const entryData = responseData.data || responseData;
          if (entryData) {
            const updatedArchiveEntry = convertEntryToArchiveEntry(entryData);

            const updated = entries.map((entry) =>
              entry.id === archiveEntryId ? updatedArchiveEntry : entry
            );
            const sorted = updated.sort((a, b) => {
              const timeA = new Date(timestampToIso(a.createdAt)).getTime();
              const timeB = new Date(timestampToIso(b.createdAt)).getTime();
              return timeB - timeA;
            });
            setEntries(sorted);
          }
        }
      } catch (error) {
        logger.warn('Failed to fetch updated entry after edit', { entryId, error });
        await loadAllEntries();
      }

      setEditingEntry(null);
    },
    [editingEntry, entries, setEntries, loadAllEntries]
  );

  const handleEditCancel = useCallback(() => {
    setEditingEntry(null);
  }, []);

  const handleEntryDeleteConfirm = useCallback(async () => {
    if (!pendingDeleteEntry) return;

    const entryId = extractEntryId(pendingDeleteEntry.id);
    if (!entryId) {
      setPendingDeleteEntry(null);
      return;
    }

    // Optimistic update
    setEntries(entries.filter((entry) => entry.id !== pendingDeleteEntry.id));

    setIsDeleting(true);
    setPendingDeleteEntry(null);

    try {
      const response = await fetch(`/api/entries/${entryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete entry');
      }
    } catch (err) {
      await loadAllEntries();
      const error = err instanceof Error ? err : new Error('Unknown error');
      logger.error('Failed to delete entry', error);
    } finally {
      setIsDeleting(false);
    }
  }, [pendingDeleteEntry, entries, setEntries, loadAllEntries]);

  const handleEntryDeleteCancel = useCallback(() => {
    setPendingDeleteEntry(null);
  }, []);

  return {
    editingEntry,
    pendingDeleteEntry,
    isDeleting,
    setEditingEntry,
    setPendingDeleteEntry,
    handleEdit,
    handleRequestDelete,
    handleEditSuccess,
    handleEditCancel,
    handleEntryDeleteConfirm,
    handleEntryDeleteCancel,
  };
}



