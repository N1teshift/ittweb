import React, { memo, useMemo } from 'react';
import { ArchiveEntry } from '@/types/archive';
import type { Game, GameWithPlayers } from '@/features/modules/game-management/games/types';
import TimelineSection from '../../shared/components/sections/TimelineSection';
import { timestampToIso } from '@/features/infrastructure/utils';
import {
  ArchivesEmptyState,
  ArchivesLoadingState,
  ArchivesErrorState,
} from '../../shared/components';

interface ArchivesContentProps {
  loading: boolean;
  error: string | null;
  entries: ArchiveEntry[];
  datedEntries: ArchiveEntry[];
  undatedEntries: ArchiveEntry[];
  games?: Game[];
  gamesMap?: Map<string, GameWithPlayers>; // Map of game document ID to game data for direct lookup
  isAuthenticated: boolean;
  canManageEntries: boolean;
  canDeleteEntry?: (entry: ArchiveEntry) => boolean;
  onEdit: (entry: ArchiveEntry) => void;
  onRequestDelete: (entry: ArchiveEntry) => void;
  onImageClick: (url: string, title: string) => void;
  onAddClick: () => void;
  onSignInClick: () => void;
  onGameEdit?: (game: Game) => void;
  onGameDelete?: (game: Game) => void;
  onGameJoin?: (gameId: string) => Promise<void>;
  onGameLeave?: (gameId: string) => Promise<void>;
  isJoining?: boolean;
  isLeaving?: boolean;
  userIsAdmin?: boolean;
}

const ArchivesContent: React.FC<ArchivesContentProps> = memo(({
  loading,
  error,
  entries,
  datedEntries: _datedEntries,
  undatedEntries: _undatedEntries,
  games = [],
  gamesMap,
  isAuthenticated,
  canManageEntries,
  canDeleteEntry,
  onEdit,
  onRequestDelete,
  onImageClick,
  onAddClick,
  onSignInClick,
  onGameEdit,
  onGameDelete,
  onGameJoin,
  onGameLeave,
  isJoining,
  isLeaving,
  userIsAdmin,
}) => {
  const resolveCanDelete = (entry: ArchiveEntry) => {
    if (canManageEntries) {
      return true;
    }
    if (canDeleteEntry) {
      return canDeleteEntry(entry);
    }
    return false;
  };

  // Get game IDs (document IDs) that already have archive entries
  const archivedGameDocumentIds = useMemo(() => {
    return new Set(entries.filter(e => e.linkedGameDocumentId).map(e => e.linkedGameDocumentId!));
  }, [entries]);

  // Get numeric gameIds (scheduled game IDs) that already have archive entries
  // This helps catch archive entries that are detected by title pattern but might not have gameId set yet
  const archivedNumericGameIds = useMemo(() => {
    const numericIds = new Set<number>();
    entries.forEach(entry => {
      // Check if entry title matches "Game #X" pattern
      const titleMatch = entry.title.match(/^Game #(\d+)/);
      if (titleMatch) {
        const numericId = parseInt(titleMatch[1], 10);
        if (!isNaN(numericId)) {
          numericIds.add(numericId);
        }
      }
    });
    return numericIds;
  }, [entries]);

  // Filter games that don't have archive entries and convert them to archive-like entries for display
  const gamesWithoutArchives = useMemo(() => {
    if (!games || games.length === 0) {
      return [];
    }
    
    return games
      .filter(game => {
        // Exclude if game document ID is already in an archive entry
        if (archivedGameDocumentIds.has(game.id)) {
          return false;
        }
        // Exclude if numeric gameId matches an archived game's numeric ID (from title pattern)
        // This catches archive entries that match "Game #X" pattern
        if (archivedNumericGameIds.has(game.gameId)) { // gameId here is the numeric replay ID, not document ID
          return false;
        }
        return true;
      })
      .map(game => {
        // For scheduled games, use scheduledDateTime (prefer scheduledDateTimeString if available); for completed games, use datetime
        const gameDate = game.gameState === 'scheduled' && (game.scheduledDateTimeString || game.scheduledDateTime)
          ? (game.scheduledDateTimeString || timestampToIso(game.scheduledDateTime))
          : game.datetime
          ? timestampToIso(game.datetime)
          : timestampToIso(game.createdAt); // Fallback to createdAt if neither exists

        return {
        id: `game-${game.id}`,
        title: `Game #${game.gameId}`,
        content: '',
          creatorName: game.creatorName || 'System',
        linkedGameDocumentId: game.id, // Set the document ID so ArchiveEntry component can fetch full game data
        dateInfo: {
          type: 'single' as const,
            singleDate: gameDate,
        },
        createdAt: timestampToIso(game.createdAt),
        updatedAt: timestampToIso(game.updatedAt),
        isDeleted: false,
        } as ArchiveEntry;
      });
  }, [games, archivedGameDocumentIds, archivedNumericGameIds]);

  // Merge ALL entries (dated + undated) with games, sorted by createdAt
  // Also deduplicate by checking if any game-based entry already exists as an archive entry
  const mergedAllEntries = useMemo(() => {
    // Start with ALL entries (both dated and undated) - create a fresh array
    const all: ArchiveEntry[] = [];
    
    // Add all entries first
    entries.forEach(entry => all.push(entry));
    
    // Add games that don't have archive entries, but also check for duplicates by numeric gameId
    gamesWithoutArchives.forEach(gameEntry => {
      // Extract numeric gameId from the game entry title
      const gameTitleMatch = gameEntry.title.match(/^Game #(\d+)/);
      if (gameTitleMatch) {
        const numericGameId = parseInt(gameTitleMatch[1], 10);
        // Check if we already have an archive entry with this numeric gameId (check ALL entries, not just dated)
        const alreadyExists = entries.some(entry => {
          const entryTitleMatch = entry.title.match(/^Game #(\d+)/);
          if (entryTitleMatch) {
            return parseInt(entryTitleMatch[1], 10) === numericGameId;
          }
          return false;
        });
        if (!alreadyExists) {
          all.push(gameEntry);
        }
      } else {
        // If no numeric gameId in title, just add it (shouldn't happen, but safety check)
        all.push(gameEntry);
      }
    });
    
    // Sort by creation date (when the record was added to the system)
    // Sorting down to the second (millisecond precision) by createdAt
    // Create a new sorted array to ensure proper mixing
    const sorted = [...all].sort((a, b) => {
      // Ensure both createdAt values are properly converted to ISO strings first
      const isoA = timestampToIso(a.createdAt);
      const isoB = timestampToIso(b.createdAt);
      const timeA = new Date(isoA).getTime();
      const timeB = new Date(isoB).getTime();
      
      // If timestamps are invalid, put them at the end
      if (isNaN(timeA) && isNaN(timeB)) return 0;
      if (isNaN(timeA)) return 1;
      if (isNaN(timeB)) return -1;
      
      return timeB - timeA; // Newest first
    });
    
    // Limit to 20 most recent items after merging entries and games
    return sorted.slice(0, 20);
  }, [entries, gamesWithoutArchives]);

  return (
    <div className="max-w-4xl mx-auto px-6">
      {/* Error Message */}
      {error && <ArchivesErrorState error={error} />}

      {/* Loading State */}
      {loading && <ArchivesLoadingState />}

      {/* Timeline */}
      {!loading && (
        <div className="pb-12">
          <TimelineSection 
            title=""
            entries={mergedAllEntries}
            onEdit={isAuthenticated ? onEdit : undefined}
            onDelete={onRequestDelete}
            canDeleteEntry={resolveCanDelete}
            onImageClick={onImageClick}
            onGameEdit={onGameEdit}
            onGameDelete={onGameDelete}
            onGameJoin={onGameJoin}
            onGameLeave={onGameLeave}
            isJoining={isJoining}
            isLeaving={isLeaving}
            userIsAdmin={userIsAdmin}
            gamesMap={gamesMap}
          />

          {/* Empty State */}
          {entries.length === 0 && games.length === 0 && !loading && (
            <ArchivesEmptyState 
              isAuthenticated={isAuthenticated}
              onAddClick={onAddClick}
              onSignInClick={onSignInClick}
            />
          )}
        </div>
      )}
    </div>
  );
});

ArchivesContent.displayName = 'ArchivesContent';

export default ArchivesContent;


