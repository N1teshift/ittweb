import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { createComponentLogger } from '@/features/infrastructure/logging';
import type { ArchiveEntry } from '@/types/archive';
import type { GameFilters } from '@/features/modules/games/types';
import { 
  ArchivesContent,
} from '@/features/modules/archives/components';
import ImageModal from '@/features/modules/archives/components/sections/ImageModal';
import { useArchivesPage, useArchivesActions } from '@/features/modules/archives/hooks';
import { useGames } from '@/features/modules/games/hooks/useGames';
import { UserRole } from '@/types/userData';
import { isAdmin } from '@/features/infrastructure/utils/userRoleUtils';
import { getArchiveEntries } from '@/features/infrastructure/lib/archiveService';
import { convertEntryToArchiveEntry } from '@/features/modules/archives/utils/entryToArchiveEntry';
import { timestampToIso } from '@/features/infrastructure/utils/timestampUtils';
import type { Entry } from '@/types/entry';
import EntryEditModal from '@/features/modules/entries/components/EntryEditModal';

const logger = createComponentLogger('HomeTimeline');

export default function HomeTimeline() {
  const { data: session, status } = useSession();
  const [userRole, setUserRole] = useState<UserRole | undefined>();
  const [gameFilters] = useState<GameFilters>({});
  
  // Use our custom hooks
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

  // Fetch games with filters (no gameState filter = fetch all games, both scheduled and completed)
  const { games, loading: gamesLoading, error: gamesError } = useGames({ ...gameFilters, limit: 100 });
  
  // Debug: Log games to console
  useEffect(() => {
    if (games && games.length > 0) {
      logger.debug('Games fetched for timeline', { 
        total: games.length, 
        scheduled: games.filter(g => g.gameState === 'scheduled').length,
        completed: games.filter(g => g.gameState === 'completed').length 
      });
    } else if (!gamesLoading) {
      logger.warn('No games fetched for timeline', { gamesError: gamesError?.message });
    }
  }, [games, gamesLoading, gamesError, logger]);

  // Fetch user role
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

  // Load entries on mount
  useEffect(() => {
    let isMounted = true;

    const loadAllEntries = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch archive entries and regular entries (posts/memories) in parallel
        const [archiveEntriesResponse, regularEntriesResponse] = await Promise.all([
          fetch('/api/archives').catch((err) => {
            logger.error('Failed to fetch archive entries', err instanceof Error ? err : new Error(String(err)));
            return null;
          }),
          fetch('/api/entries').catch((err) => {
            logger.error('Failed to fetch regular entries', err instanceof Error ? err : new Error(String(err)));
            return null;
          }),
        ]);

        // Parse responses
        let archiveEntries: ArchiveEntry[] = [];
        if (archiveEntriesResponse && archiveEntriesResponse.ok) {
          const archiveData = await archiveEntriesResponse.json();
          archiveEntries = Array.isArray(archiveData) ? archiveData : (archiveData.data || []);
        }

        let regularEntries: Entry[] = [];
        if (regularEntriesResponse && regularEntriesResponse.ok) {
          const entriesData = await regularEntriesResponse.json();
          regularEntries = Array.isArray(entriesData) ? entriesData : (entriesData.data || []);
        }

        // Convert regular entries to ArchiveEntry format
        const convertedEntries = regularEntries.map(convertEntryToArchiveEntry);

        // Combine all entries
        const allEntries = [...archiveEntries, ...convertedEntries];

        // Sort by createdAt (newest first) and limit to 20 items
        const sortedEntries = allEntries
          .sort((a, b) => {
            const timeA = new Date(timestampToIso(a.createdAt)).getTime();
            const timeB = new Date(timestampToIso(b.createdAt)).getTime();
            return timeB - timeA;
          })
          .slice(0, 20); // Limit to 20 recent items

        if (isMounted) {
          setEntries(sortedEntries);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error loading entries');
        logger.error('Failed to load entries', error);
        if (isMounted) {
          setError('Failed to load timeline. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAllEntries();

    return () => {
      isMounted = false;
    };
  }, [setEntries, setLoading, setError]);

  const isAuthenticated = useMemo(() => status === 'authenticated', [status]);
  const currentDiscordId = session?.discordId;
  const canManageEntries = useMemo(() => isAdmin(userRole), [userRole]);
  const [editingEntry, setEditingEntry] = useState<ArchiveEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Extract entry ID from ArchiveEntry ID (entries have prefix "entry-")
  const extractEntryId = (archiveEntryId: string): string | null => {
    if (archiveEntryId.startsWith('entry-')) {
      return archiveEntryId.replace('entry-', '');
    }
    return null; // Not a converted entry, might be an archive entry
  };

  // Handle edit - open edit modal
  const handleEdit = useCallback((entry: ArchiveEntry) => {
    if (!isAuthenticated) {
      signIn('discord');
      return;
    }
    // Only allow editing entries (posts/memories), not archive entries
    if (entry.id.startsWith('entry-')) {
      setEditingEntry(entry);
    } else {
      setError('Only posts and memories can be edited from the timeline');
    }
  }, [isAuthenticated, setError]);

  // Handle delete - show confirmation and delete
  const handleRequestDelete = useCallback(async (entry: ArchiveEntry) => {
    if (!isAuthenticated) {
      signIn('discord');
      return;
    }

    // Check if user can delete
    const canDelete = canManageEntries || (!!currentDiscordId && entry.createdByDiscordId === currentDiscordId);
    if (!canDelete) {
      setError('You do not have permission to delete this entry');
      return;
    }

    // Extract entry ID (only for entries, not archive entries)
    const entryId = extractEntryId(entry.id);
    if (!entryId) {
      setError('Only posts and memories can be deleted from the timeline');
      return;
    }

    // Confirm deletion
    if (!confirm(`Are you sure you want to delete "${entry.title}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/entries/${entryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete entry');
      }

      // Revalidate and reload
      try {
        await fetch('/api/revalidate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ path: '/' }),
        });
      } catch (revalidateError) {
        logger.warn('Failed to revalidate homepage', { error: revalidateError });
      }

      // Reload the timeline
      window.location.reload();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      logger.error('Failed to delete entry', error);
      setDeleteError(error.message);
      setIsDeleting(false);
    }
  }, [isAuthenticated, canManageEntries, currentDiscordId, setError, logger]);

  // Handle edit success - close modal and reload
  const handleEditSuccess = useCallback(() => {
    setEditingEntry(null);
    // Reload the timeline to show updated entry
    window.location.reload();
  }, []);

  // Handle edit cancel
  const handleEditCancel = useCallback(() => {
    setEditingEntry(null);
  }, []);

  const handleAddClick = useCallback(() => {}, []);

  return (
    <>
      <ArchivesContent
        loading={loading || gamesLoading}
        error={error || (gamesError ? gamesError.message : null)}
        entries={entries}
        datedEntries={datedEntries}
        undatedEntries={undatedEntries}
        games={games || []}
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

      <ImageModal isOpen={showImageModal} image={modalImage} onClose={handleImageModalClose} />

      {/* Edit Entry Modal */}
      {editingEntry && editingEntry.id.startsWith('entry-') && (
        <EntryEditModal
          entry={editingEntry}
          entryId={extractEntryId(editingEntry.id)!}
          onSuccess={handleEditSuccess}
          onCancel={handleEditCancel}
        />
      )}

      {/* Delete Error Display */}
      {deleteError && (
        <div className="fixed top-20 right-4 bg-red-900/90 border border-red-500 rounded-lg p-4 text-red-300 z-50 max-w-md">
          <div className="flex items-center justify-between">
            <p>{deleteError}</p>
            <button
              onClick={() => setDeleteError(null)}
              className="text-red-400 hover:text-red-200 ml-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

