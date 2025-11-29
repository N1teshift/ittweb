import React, { memo, useMemo } from 'react';
import { ArchiveEntry } from '@/types/archive';
import type { Game } from '@/features/modules/games/types';
import TimelineSection from './sections/TimelineSection';
import { timestampToIso } from '@/features/infrastructure/utils/timestampUtils';
import { 
  ArchivesEmptyState,
  ArchivesLoadingState,
  ArchivesErrorState,
} from './index';

interface ArchivesContentProps {
  loading: boolean;
  error: string | null;
  entries: ArchiveEntry[];
  datedEntries: ArchiveEntry[];
  undatedEntries: ArchiveEntry[];
  games?: Game[];
  isAuthenticated: boolean;
  canManageEntries: boolean;
  canDeleteEntry?: (entry: ArchiveEntry) => boolean;
  onEdit: (entry: ArchiveEntry) => void;
  onRequestDelete: (entry: ArchiveEntry) => void;
  onImageClick: (url: string, title: string) => void;
  onAddClick: () => void;
  onSignInClick: () => void;
}

const ArchivesContent: React.FC<ArchivesContentProps> = memo(({
  loading,
  error,
  entries,
  datedEntries,
  undatedEntries,
  games = [],
  isAuthenticated,
  canManageEntries,
  canDeleteEntry,
  onEdit,
  onRequestDelete,
  onImageClick,
  onAddClick,
  onSignInClick,
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
      .map(game => ({
        id: `game-${game.id}`,
        title: `Game #${game.gameId}`,
        content: '',
        creatorName: 'System',
        linkedGameDocumentId: game.id, // Set the document ID so ArchiveEntry component can fetch full game data
        dateInfo: {
          type: 'single' as const,
          singleDate: timestampToIso(game.datetime),
        },
        createdAt: timestampToIso(game.createdAt),
        updatedAt: timestampToIso(game.updatedAt),
        isDeleted: false,
      } as ArchiveEntry));
  }, [games, archivedGameDocumentIds, archivedNumericGameIds]);

  // Merge dated entries with games, sorted by date
  // Also deduplicate by checking if any game-based entry already exists as an archive entry
  const mergedDatedEntries = useMemo(() => {
    const all = [...datedEntries];
    
    // Add games that don't have archive entries, but also check for duplicates by numeric gameId
    gamesWithoutArchives.forEach(gameEntry => {
      // Extract numeric gameId from the game entry title
      const gameTitleMatch = gameEntry.title.match(/^Game #(\d+)/);
      if (gameTitleMatch) {
        const numericGameId = parseInt(gameTitleMatch[1], 10);
        // Check if we already have an archive entry with this numeric gameId
        const alreadyExists = datedEntries.some(entry => {
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
    return all.sort((a, b) => {
      const timeA = new Date(timestampToIso(a.createdAt)).getTime();
      const timeB = new Date(timestampToIso(b.createdAt)).getTime();
      return timeB - timeA; // Newest first
    });
  }, [datedEntries, gamesWithoutArchives]);

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
            title="Timeline"
            entries={mergedDatedEntries}
            onEdit={isAuthenticated ? onEdit : undefined}
            onDelete={onRequestDelete}
            canDeleteEntry={resolveCanDelete}
            onImageClick={onImageClick}
          />

          <TimelineSection 
            title="Undated Archives"
            titleClassName="text-gray-400"
            entries={undatedEntries}
            onEdit={isAuthenticated ? onEdit : undefined}
            onDelete={onRequestDelete}
            canDeleteEntry={resolveCanDelete}
            onImageClick={onImageClick}
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
