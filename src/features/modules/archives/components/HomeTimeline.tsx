import React, { useEffect, useMemo, useCallback, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { createComponentLogger } from '@/features/infrastructure/logging';
import type { ArchiveEntry } from '@/types/archive';
import type { GameFilters, GameWithPlayers } from '@/features/modules/games/types';
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
import EditGameForm from '@/features/modules/scheduled-games/components/EditGameForm';
import GameDeleteDialog from '@/features/modules/scheduled-games/components/GameDeleteDialog';
import ArchiveDeleteDialog from '@/features/modules/archives/components/ArchiveDeleteDialog';

const logger = createComponentLogger('HomeTimeline');

export interface HomeTimelineHandle {
  addNewGame: (gameId: string) => Promise<void>;
  addNewEntry: (entryId: string) => Promise<void>;
}

const HomeTimeline = forwardRef<HomeTimelineHandle>((props, ref) => {
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
  const { games, loading: gamesLoading, error: gamesError, refetch: refetchGames } = useGames({ ...gameFilters, limit: 100 });
  
  // Local games state for optimistic updates
  const [localGames, setLocalGames] = useState<GameWithPlayers[]>([]);
  
  // Track which games were recently updated from server to prevent sync from overwriting
  const recentlyUpdatedGamesRef = useRef<Set<string>>(new Set());
  
  // Sync localGames with games from hook, but preserve optimistic updates
  useEffect(() => {
    if (games && games.length > 0) {
      setLocalGames(prevLocalGames => {
        // If localGames is empty, just use games
        if (prevLocalGames.length === 0) {
          console.log('[HomeTimeline] Initializing localGames from games', { gamesCount: games.length });
          return games;
        }
        
        // Otherwise, merge: use games as base, but keep optimistic updates from localGames
        // This means if a game in localGames has been optimistically updated (different participants),
        // we keep that version instead of overwriting with games
        const merged = games.map(game => {
          const localGame = prevLocalGames.find(lg => lg.id === game.id);
          
          // If this game was recently updated from server, keep the local version
          if (recentlyUpdatedGamesRef.current.has(game.id)) {
            console.log('[HomeTimeline] Preserving recently updated game', { gameId: game.id });
            return localGame || game;
          }
          
          // If we have a local game and it's a scheduled game, check if participants differ
          // (indicating an optimistic update or recent server sync)
          if (localGame && game.gameState === 'scheduled') {
            const localParticipants = localGame.participants || [];
            const serverParticipants = game.participants || [];
            // If participant counts differ, keep the local version (optimistic update or recent server sync)
            if (localParticipants.length !== serverParticipants.length) {
              console.log('[HomeTimeline] Preserving local game (participant count differs)', { 
                gameId: game.id, 
                localCount: localParticipants.length, 
                serverCount: serverParticipants.length 
              });
              return localGame;
            }
            // If participant IDs differ, keep the local version
            const localIds = new Set(localParticipants.map(p => p.discordId));
            const serverIds = new Set(serverParticipants.map(p => p.discordId));
            if (localIds.size !== serverIds.size || 
                [...localIds].some(id => !serverIds.has(id)) ||
                [...serverIds].some(id => !localIds.has(id))) {
              console.log('[HomeTimeline] Preserving local game (participant IDs differ)', { 
                gameId: game.id, 
                localIds: [...localIds], 
                serverIds: [...serverIds] 
              });
              return localGame;
            }
          }
          return game;
        });
        
        console.log('[HomeTimeline] Synced localGames with games', { 
          gamesCount: games.length, 
          localGamesCount: prevLocalGames.length,
          mergedCount: merged.length 
        });
        
        return merged;
      });
    }
  }, [games]);
  
  // Debug: Log games to console
  useEffect(() => {
    if (games && games.length > 0) {
      logger.debug('Games fetched for timeline', { 
        total: games.length, 
        scheduled: games.filter(g => g.gameState === 'scheduled').length,
        completed: games.filter(g => g.gameState === 'completed').length 
      });
    } else if (!gamesLoading && gamesError) {
      // Only log as warning if there's an actual error, not just when there are no games
      logger.warn('Failed to fetch games for timeline', { gamesError: gamesError.message });
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

  // Function to load all entries (extracted for reuse after join/leave)
  const loadAllEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch archive entries and regular entries (posts/memories) in parallel
      // Add cache-busting query parameter to ensure fresh data
      const cacheBuster = `?t=${Date.now()}`;
      const [archiveEntriesResponse, regularEntriesResponse] = await Promise.all([
        fetch(`/api/archives${cacheBuster}`).catch((err) => {
          logger.error('Failed to fetch archive entries', err instanceof Error ? err : new Error(String(err)));
          return null;
        }),
        fetch(`/api/entries${cacheBuster}`).catch((err) => {
          logger.error('Failed to fetch regular entries', err instanceof Error ? err : new Error(String(err)));
          return null;
        }),
      ]);

      // Parse responses
      let archiveEntries: ArchiveEntry[] = [];
      if (archiveEntriesResponse && archiveEntriesResponse.ok) {
        const archiveData = await archiveEntriesResponse.json();
        const rawArchiveEntries = Array.isArray(archiveData) ? archiveData : (archiveData.data || []);
        // Filter out deleted archive entries on client side as a safety measure
        archiveEntries = rawArchiveEntries.filter((entry: ArchiveEntry) => !entry.isDeleted);
      }

      let regularEntries: Entry[] = [];
      if (regularEntriesResponse && regularEntriesResponse.ok) {
        const entriesData = await regularEntriesResponse.json();
        regularEntries = Array.isArray(entriesData) ? entriesData : (entriesData.data || []);
      }

      // Filter out deleted entries on client side as a safety measure
      const nonDeletedEntries = regularEntries.filter(entry => !entry.isDeleted);

      // Convert regular entries to ArchiveEntry format
      const convertedEntries = nonDeletedEntries.map(convertEntryToArchiveEntry);

      // Combine all entries (don't limit here - let ArchivesContent merge with games first)
      const allEntries = [...archiveEntries, ...convertedEntries];

      // Sort by createdAt (newest first) - sorting down to the second (millisecond precision)
      const sortedEntries = allEntries.sort((a, b) => {
        const timeA = new Date(timestampToIso(a.createdAt)).getTime();
        const timeB = new Date(timestampToIso(b.createdAt)).getTime();
        return timeB - timeA; // Newest first
      });

      setEntries(sortedEntries);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error loading entries');
      logger.error('Failed to load entries', error);
      setError('Failed to load timeline. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [setEntries, setLoading, setError, logger]);

  // Load entries on mount
  useEffect(() => {
    loadAllEntries();
  }, [loadAllEntries]);

  const isAuthenticated = useMemo(() => status === 'authenticated', [status]);
  const currentDiscordId = session?.discordId;
  const canManageEntries = useMemo(() => isAdmin(userRole), [userRole]);
  const [editingEntry, setEditingEntry] = useState<ArchiveEntry | null>(null);
  const [pendingDeleteEntry, setPendingDeleteEntry] = useState<ArchiveEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [editingGame, setEditingGame] = useState<GameWithPlayers | null>(null);
  const [pendingDeleteGame, setPendingDeleteGame] = useState<GameWithPlayers | null>(null);
  const [isJoining, setIsJoining] = useState<string | false>(false);
  const [isLeaving, setIsLeaving] = useState<string | false>(false);
  const [isDeletingGame, setIsDeletingGame] = useState(false);

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

  // Handle delete request (opens dialog)
  const handleRequestDelete = useCallback((entry: ArchiveEntry) => {
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

    setPendingDeleteEntry(entry);
  }, [isAuthenticated, canManageEntries, currentDiscordId, setError]);

  // Handle entry delete confirmation
  const handleEntryDeleteConfirm = useCallback(async () => {
    if (!pendingDeleteEntry) return;

    const entryId = extractEntryId(pendingDeleteEntry.id);
    if (!entryId) {
      setDeleteError('Invalid entry ID');
      setPendingDeleteEntry(null);
      return;
    }

    // Optimistic update: immediately remove the entry from entries
    setEntries(prevEntries => prevEntries.filter(entry => entry.id !== pendingDeleteEntry.id));

    setIsDeleting(true);
    setDeleteError(null);
    setPendingDeleteEntry(null);

    try {
      const response = await fetch(`/api/entries/${entryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete entry');
      }

      // Entry deleted successfully - the optimistic update already removed it
      // No need to reload or refetch
    } catch (err) {
      // Revert optimistic update on error by refetching entries
      await loadAllEntries();
      const error = err instanceof Error ? err : new Error('Unknown error');
      logger.error('Failed to delete entry', error);
      setDeleteError(error.message);
    } finally {
      setIsDeleting(false);
    }
  }, [pendingDeleteEntry, loadAllEntries, logger]);

  // Handle entry delete cancel
  const handleEntryDeleteCancel = useCallback(() => {
    setPendingDeleteEntry(null);
  }, []);

  // Handle edit success - fetch updated entry and update in list
  const handleEditSuccess = useCallback(async (entryId?: string) => {
    if (!entryId || !editingEntry) {
      setEditingEntry(null);
      // If no entryId, refetch all entries as fallback
      await loadAllEntries();
      return;
    }

    const archiveEntryId = editingEntry.id; // Keep the "entry-" prefix

    try {
      // Fetch the updated entry
      const entryResponse = await fetch(`/api/entries/${entryId}?t=${Date.now()}`, {
        cache: 'no-store',
      });

      if (entryResponse.ok) {
        const responseData = await entryResponse.json();
        // API returns { success: true, data: Entry } or Entry directly
        const entryData = responseData.data || responseData;
        if (entryData) {
          // Convert to ArchiveEntry format
          const updatedArchiveEntry = convertEntryToArchiveEntry(entryData);
          
          // Update the entry in the entries list
          setEntries(prevEntries => {
            const updated = prevEntries.map(entry =>
              entry.id === archiveEntryId
                ? updatedArchiveEntry
                : entry
            );
            // Re-sort by createdAt to maintain order
            return updated.sort((a, b) => {
              const timeA = new Date(timestampToIso(a.createdAt)).getTime();
              const timeB = new Date(timestampToIso(b.createdAt)).getTime();
              return timeB - timeA; // Newest first
            });
          });
        }
      }
    } catch (error) {
      logger.warn('Failed to fetch updated entry after edit', { entryId, error });
      // Fallback: refetch all entries
      await loadAllEntries();
    }

    setEditingEntry(null);
  }, [editingEntry, loadAllEntries, logger]);

  // Handle edit cancel
  const handleEditCancel = useCallback(() => {
    setEditingEntry(null);
  }, []);

  // Handle game edit
  const handleGameEdit = useCallback((game: GameWithPlayers) => {
    if (!isAuthenticated) {
      signIn('discord');
      return;
    }
    if (game.gameState !== 'scheduled') {
      setError('Only scheduled games can be edited');
      return;
    }
    setEditingGame(game);
  }, [isAuthenticated, setError]);

  // Handle game edit submit
  const handleGameEditSubmit = useCallback(async (updates: {
    teamSize: any;
    customTeamSize?: string;
    gameType: any;
    gameVersion?: string;
    gameLength?: number;
    modes: string[];
  }) => {
    if (!editingGame) return;

    // Find the game to update
    const gameToUpdate = localGames.find(g => g.id === editingGame.id);
    if (!gameToUpdate) {
      setError('Game not found');
      setEditingGame(null);
      return;
    }

    // Optimistic update: immediately update the game in localGames
    const optimisticGame = {
      ...gameToUpdate,
      ...updates,
      customTeamSize: updates.teamSize === 'custom' ? updates.customTeamSize : undefined,
    };

    setLocalGames(prevGames =>
      prevGames.map(game =>
        game.id === editingGame.id
          ? optimisticGame as GameWithPlayers
          : game
      )
    );

    try {
      // Convert modes from string[] to the format expected by the API
      const updateData = {
        ...updates,
        modes: updates.modes as any, // GameMode[] should accept string[]
      };

      const response = await fetch(`/api/games/${editingGame.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update game');
      }

      // Mark this game as recently updated to prevent sync from overwriting
      recentlyUpdatedGamesRef.current.add(editingGame.id);
      // Clear the flag after 5 seconds to allow normal syncing again
      setTimeout(() => {
        recentlyUpdatedGamesRef.current.delete(editingGame.id);
      }, 5000);

      // Fetch only the updated game to sync with server
      try {
        const gameResponse = await fetch(`/api/games/${editingGame.id}?t=${Date.now()}`, {
          cache: 'no-store',
        });
        
        if (gameResponse.ok) {
          const gameData = await gameResponse.json();
          if (gameData.success && gameData.data) {
            // Update only this specific game in localGames
            setLocalGames(prevGames =>
              prevGames.map(game =>
                game.id === editingGame.id
                  ? gameData.data as GameWithPlayers
                  : game
              )
            );
          }
        }
      } catch (fetchError) {
        // If fetch fails, log but don't revert (server operation succeeded)
        logger.warn('Error fetching updated game after edit', { gameId: editingGame.id, error: fetchError });
      }

      setEditingGame(null);
    } catch (err) {
      // Revert optimistic update on error
      setLocalGames(prevGames =>
        prevGames.map(game =>
          game.id === editingGame.id
            ? gameToUpdate
            : game
        )
      );
      const error = err instanceof Error ? err : new Error('Unknown error');
      logger.error('Failed to update game', error);
      setError(error.message);
    }
  }, [editingGame, localGames, setError, logger]);

  // Handle game edit cancel
  const handleGameEditCancel = useCallback(() => {
    setEditingGame(null);
  }, []);

  // Handle game delete request (opens dialog)
  const handleGameDelete = useCallback((game: GameWithPlayers) => {
    if (!isAuthenticated) {
      signIn('discord');
      return;
    }
    if (game.gameState !== 'scheduled') {
      setError('Only scheduled games can be deleted');
      return;
    }

    // Check permissions
    const canDelete = canManageEntries || (!!currentDiscordId && game.createdByDiscordId === currentDiscordId);
    if (!canDelete) {
      setError('You do not have permission to delete this game');
      return;
    }

    setPendingDeleteGame(game);
  }, [isAuthenticated, canManageEntries, currentDiscordId, setError]);

  // Handle game delete confirmation
  const handleGameDeleteConfirm = useCallback(async () => {
    if (!pendingDeleteGame) return;

    const gameIdToDelete = pendingDeleteGame.id;

    // Optimistic update: immediately remove the game from localGames
    setLocalGames(prevGames => prevGames.filter(game => game.id !== gameIdToDelete));

    setIsDeletingGame(true);
    setDeleteError(null);
    setPendingDeleteGame(null);

    try {
      const response = await fetch(`/api/games/${gameIdToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete game');
      }

      // Game deleted successfully - the optimistic update already removed it
      // No need to reload or refetch
    } catch (err) {
      // Revert optimistic update on error by refetching games
      await refetchGames();
      const error = err instanceof Error ? err : new Error('Unknown error');
      logger.error('Failed to delete game', error);
      setDeleteError(error.message);
    } finally {
      setIsDeletingGame(false);
    }
  }, [pendingDeleteGame, refetchGames, logger]);

  // Handle game delete cancel
  const handleGameDeleteCancel = useCallback(() => {
    setPendingDeleteGame(null);
  }, []);

  // Handle game join
  const handleGameJoin = useCallback(async (gameId: string) => {
    if (!isAuthenticated) {
      signIn('discord');
      return;
    }

    if (!session?.discordId || !session?.user?.name) {
      setError('Discord ID or name is missing');
      return;
    }

    setIsJoining(gameId);
    setDeleteError(null);

    // Find the game to update
    const gameToUpdate = localGames.find(g => g.id === gameId);
    if (!gameToUpdate) {
      setDeleteError('Game not found');
      setIsJoining(false);
      return;
    }

    // Optimistic update: immediately add user to participants
    const optimisticParticipant = {
      discordId: session.discordId,
      name: session.user.name,
      joinedAt: new Date().toISOString(),
    };
    
    const optimisticParticipants = [...(gameToUpdate.participants || []), optimisticParticipant];
    
    setLocalGames(prevGames =>
      prevGames.map(game =>
        game.id === gameId
          ? { ...game, participants: optimisticParticipants }
          : game
      )
    );

    try {
      const response = await fetch(`/api/games/${gameId}/join`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to join game');
      }

      // Fetch only the updated game to sync with server
      try {
        const gameResponse = await fetch(`/api/games/${gameId}?t=${Date.now()}`, {
          cache: 'no-store',
        });
        
        if (gameResponse.ok) {
          const gameData = await gameResponse.json();
          logger.info('Game response after join', { gameId, gameData, hasSuccess: !!gameData.success, hasData: !!gameData.data });
          if (gameData.success && gameData.data) {
            // Mark this game as recently updated to prevent sync from overwriting
            recentlyUpdatedGamesRef.current.add(gameId);
            // Clear the flag after 5 seconds to allow normal syncing again
            setTimeout(() => {
              recentlyUpdatedGamesRef.current.delete(gameId);
            }, 5000);
            
            // Update only this specific game in localGames
            setLocalGames(prevGames =>
              prevGames.map(game =>
                game.id === gameId
                  ? gameData.data as GameWithPlayers
                  : game
              )
            );
            logger.info('Updated localGames after join', { gameId });
          } else {
            // If response format is unexpected, log but don't revert (server operation succeeded)
            logger.warn('Unexpected game response format after join', { gameId, gameData });
          }
        } else {
          // If fetch fails, log but don't revert (server operation succeeded)
          logger.warn('Failed to fetch updated game after join', { gameId, status: gameResponse.status });
        }
      } catch (fetchError) {
        // If fetch throws, log but don't revert (server operation succeeded)
        logger.warn('Error fetching updated game after join', { gameId, error: fetchError });
      }
    } catch (err) {
      // Revert optimistic update on error
      setLocalGames(prevGames =>
        prevGames.map(game =>
          game.id === gameId
            ? { ...game, participants: gameToUpdate.participants || [] }
            : game
        )
      );
      const error = err instanceof Error ? err : new Error('Unknown error');
      logger.error('Failed to join game', error);
      setDeleteError(error.message);
    } finally {
      setIsJoining(false);
    }
  }, [isAuthenticated, session?.discordId, session?.user?.name, localGames, setError, logger]);

  // Handle game leave
  const handleGameLeave = useCallback(async (gameId: string) => {
    console.log('[HomeTimeline] handleGameLeave called', { gameId, isAuthenticated, hasDiscordId: !!session?.discordId });
    
    if (!isAuthenticated) {
      signIn('discord');
      return;
    }

    if (!session?.discordId) {
      console.error('[HomeTimeline] Discord ID is missing');
      setError('Discord ID is missing');
      return;
    }

    setIsLeaving(gameId);
    setDeleteError(null);

    // Find the game to update
    const gameToUpdate = localGames.find(g => g.id === gameId);
    console.log('[HomeTimeline] Game to update found', { gameId, found: !!gameToUpdate, currentParticipants: gameToUpdate?.participants?.length || 0 });
    
    if (!gameToUpdate) {
      console.error('[HomeTimeline] Game not found in localGames', { gameId, localGamesCount: localGames.length });
      setDeleteError('Game not found');
      setIsLeaving(false);
      return;
    }

    // Optimistic update: immediately remove user from participants
    const optimisticParticipants = (gameToUpdate.participants || []).filter(
      p => p.discordId !== session.discordId
    );
    
    console.log('[HomeTimeline] Optimistic leave update', { 
      gameId, 
      participantCount: optimisticParticipants.length, 
      originalCount: gameToUpdate.participants?.length || 0,
      userDiscordId: session.discordId,
      participantsBefore: gameToUpdate.participants,
      participantsAfter: optimisticParticipants
    });
    
    setLocalGames(prevGames => {
      const updated = prevGames.map(game =>
        game.id === gameId
          ? { ...game, participants: optimisticParticipants }
          : game
      );
      console.log('[HomeTimeline] Updated localGames', { 
        gameId, 
        updatedGame: updated.find(g => g.id === gameId),
        totalGames: updated.length 
      });
      return updated;
    });

    try {
      console.log('[HomeTimeline] Sending leave request to server', { gameId });
      const response = await fetch(`/api/games/${gameId}/leave`, {
        method: 'POST',
      });

      console.log('[HomeTimeline] Leave response received', { gameId, ok: response.ok, status: response.status });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[HomeTimeline] Leave request failed', { gameId, error: errorData });
        throw new Error(errorData.error || 'Failed to leave game');
      }

      // Fetch only the updated game to sync with server
      try {
        console.log('[HomeTimeline] Fetching updated game from server', { gameId });
        const gameResponse = await fetch(`/api/games/${gameId}?t=${Date.now()}`, {
          cache: 'no-store',
        });
        
        console.log('[HomeTimeline] Game fetch response', { gameId, ok: gameResponse.ok, status: gameResponse.status });
        
        if (gameResponse.ok) {
          const gameData = await gameResponse.json();
          console.log('[HomeTimeline] Game response after leave', { 
            gameId, 
            hasSuccess: !!gameData.success, 
            hasData: !!gameData.data,
            participants: gameData.data?.participants?.length || 0
          });
          
          if (gameData.success && gameData.data) {
            // Mark this game as recently updated to prevent sync from overwriting
            recentlyUpdatedGamesRef.current.add(gameId);
            // Clear the flag after 5 seconds to allow normal syncing again
            setTimeout(() => {
              recentlyUpdatedGamesRef.current.delete(gameId);
            }, 5000);
            
            // Update only this specific game in localGames
            setLocalGames(prevGames => {
              const updated = prevGames.map(game =>
                game.id === gameId
                  ? gameData.data as GameWithPlayers
                  : game
              );
              const updatedGame = updated.find(g => g.id === gameId);
              console.log('[HomeTimeline] Updated localGames with server data', { 
                gameId, 
                updatedGame: updatedGame,
                participants: updatedGame?.participants?.length || 0,
                participantsList: updatedGame?.participants,
                allGameIds: prevGames.map(g => g.id),
                updatedGameIds: updated.map(g => g.id)
              });
              return updated;
            });
          } else {
            // If response format is unexpected, log but don't revert (server operation succeeded)
            console.warn('[HomeTimeline] Unexpected game response format after leave', { gameId, gameData });
          }
        } else {
          // If fetch fails, log but don't revert (server operation succeeded)
          console.warn('[HomeTimeline] Failed to fetch updated game after leave', { gameId, status: gameResponse.status });
        }
      } catch (fetchError) {
        // If fetch throws, log but don't revert (server operation succeeded)
        console.warn('[HomeTimeline] Error fetching updated game after leave', { gameId, error: fetchError });
      }
    } catch (err) {
      // Revert optimistic update on error
      console.error('[HomeTimeline] Error in leave handler, reverting optimistic update', { gameId, error: err });
      setLocalGames(prevGames =>
        prevGames.map(game =>
          game.id === gameId
            ? { ...game, participants: gameToUpdate.participants || [] }
            : game
        )
      );
      const error = err instanceof Error ? err : new Error('Unknown error');
      logger.error('Failed to leave game', error);
      setDeleteError(error.message);
    } finally {
      console.log('[HomeTimeline] Leave handler finished', { gameId });
      setIsLeaving(false);
    }
  }, [isAuthenticated, session?.discordId, localGames, setError, logger]);

  const handleAddClick = useCallback(() => {}, []);

  // Function to add a newly created game to localGames
  const addNewGame = useCallback(async (gameId: string) => {
    if (!gameId) {
      // If no gameId provided, just refetch all games
      await refetchGames();
      return;
    }

    try {
      // Fetch the newly created game
      const gameResponse = await fetch(`/api/games/${gameId}?t=${Date.now()}`, {
        cache: 'no-store',
      });

      if (gameResponse.ok) {
        const gameData = await gameResponse.json();
        if (gameData.success && gameData.data) {
          // Mark this game as recently updated to prevent sync from overwriting
          recentlyUpdatedGamesRef.current.add(gameId);
          // Clear the flag after 5 seconds to allow normal syncing again
          setTimeout(() => {
            recentlyUpdatedGamesRef.current.delete(gameId);
          }, 5000);

          // Add the new game to localGames
          setLocalGames(prevGames => {
            // Check if game already exists (shouldn't, but just in case)
            if (prevGames.some(g => g.id === gameId)) {
              return prevGames.map(game =>
                game.id === gameId
                  ? gameData.data as GameWithPlayers
                  : game
              );
            }
            // Add new game to the beginning (newest first)
            return [gameData.data as GameWithPlayers, ...prevGames];
          });
        }
      }
    } catch (error) {
      logger.warn('Failed to fetch new game after creation', { gameId, error });
      // Fallback: refetch all games
      await refetchGames();
    }
  }, [refetchGames, logger]);

  // Function to add a newly created entry to entries
  const addNewEntry = useCallback(async (entryId: string) => {
    if (!entryId) {
      // If no entryId provided, just refetch all entries
      await loadAllEntries();
      return;
    }

    try {
      // Fetch the newly created entry
      const entryResponse = await fetch(`/api/entries/${entryId}?t=${Date.now()}`, {
        cache: 'no-store',
      });

      if (entryResponse.ok) {
        const responseData = await entryResponse.json();
        // API returns { success: true, data: Entry } or Entry directly
        const entryData = responseData.data || responseData;
        if (entryData) {
          // Convert to ArchiveEntry format
          const archiveEntry = convertEntryToArchiveEntry(entryData);
          
          // Add the new entry to entries (at the beginning, newest first)
          setEntries(prevEntries => {
            // Check if entry already exists (shouldn't, but just in case)
            if (prevEntries.some(e => e.id === `entry-${entryId}`)) {
              return prevEntries.map(entry =>
                entry.id === `entry-${entryId}`
                  ? archiveEntry
                  : entry
              );
            }
            // Add new entry to the beginning and sort by createdAt
            const updated = [archiveEntry, ...prevEntries];
            return updated.sort((a, b) => {
              const timeA = new Date(timestampToIso(a.createdAt)).getTime();
              const timeB = new Date(timestampToIso(b.createdAt)).getTime();
              return timeB - timeA; // Newest first
            });
          });
        }
      }
    } catch (error) {
      logger.warn('Failed to fetch new entry after creation', { entryId, error });
      // Fallback: refetch all entries
      await loadAllEntries();
    }
  }, [loadAllEntries, logger]);

  // Expose addNewGame and addNewEntry via ref
  useImperativeHandle(ref, () => ({
    addNewGame,
    addNewEntry,
  }));

  // Create a Map of game ID to game data for direct lookup in ArchiveEntry
  const gamesMap = useMemo(() => {
    const map = new Map<string, GameWithPlayers>();
    localGames.forEach(game => {
      map.set(game.id, game);
    });
    return map;
  }, [localGames]);

  return (
    <>
      <ArchivesContent
        loading={loading || gamesLoading}
        error={error || (gamesError ? gamesError.message : null)}
        entries={entries}
        datedEntries={datedEntries}
        undatedEntries={undatedEntries}
        games={localGames || []}
        gamesMap={gamesMap}
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
        onGameEdit={handleGameEdit}
        onGameDelete={handleGameDelete}
        onGameJoin={handleGameJoin}
        onGameLeave={handleGameLeave}
        isJoining={isJoining}
        isLeaving={isLeaving}
        userIsAdmin={canManageEntries}
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

      {/* Edit Game Modal */}
      {editingGame && editingGame.gameState === 'scheduled' && (
        <EditGameForm
          game={editingGame}
          onSubmit={handleGameEditSubmit}
          onCancel={handleGameEditCancel}
          isSubmitting={false}
        />
      )}

      {/* Delete Entry Dialog */}
      {pendingDeleteEntry && (
        <ArchiveDeleteDialog
          isOpen={!!pendingDeleteEntry}
          entryTitle={pendingDeleteEntry.title}
          isLoading={isDeleting}
          onConfirm={handleEntryDeleteConfirm}
          onCancel={handleEntryDeleteCancel}
        />
      )}

      {/* Delete Game Dialog */}
      {pendingDeleteGame && (
        <GameDeleteDialog
          isOpen={!!pendingDeleteGame}
          gameTitle={`Game #${pendingDeleteGame.gameId}`}
          isLoading={isDeletingGame}
          onConfirm={handleGameDeleteConfirm}
          onCancel={handleGameDeleteCancel}
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
});

HomeTimeline.displayName = 'HomeTimeline';

export default HomeTimeline;

