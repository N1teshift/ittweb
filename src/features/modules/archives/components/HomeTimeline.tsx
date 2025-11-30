import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { useSession } from 'next-auth/react';
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

  // Dummy handlers for edit/delete (not needed on homepage)
  const handleEdit = useCallback(() => {}, []);
  const handleRequestDelete = useCallback(() => {}, []);
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
    </>
  );
}

