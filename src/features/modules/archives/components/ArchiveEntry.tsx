import React, { useState, useEffect } from 'react';
import type { ArchiveEntry } from '@/types/archive';
import { useGame } from '@/features/modules/games/hooks/useGame';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import { GameLinkedArchiveEntry } from './GameLinkedArchiveEntry';
import { NormalArchiveEntry } from './NormalArchiveEntry';

interface ArchiveEntryProps {
  entry: ArchiveEntry;
  onEdit?: (entry: ArchiveEntry) => void;
  onDelete?: (entry: ArchiveEntry) => void;
  canDelete?: boolean;
  onImageClick?: (url: string, title: string) => void;
}

export default function ArchiveEntry({ entry, onEdit, onDelete, canDelete, onImageClick }: ArchiveEntryProps) {
  const logger = createComponentLogger('ArchiveEntry');
  const [isExpanded, setIsExpanded] = useState(false);
  const [foundGameId, setFoundGameId] = useState<string | null>(null);
  const maxLength = 300; // Characters to show before truncating
  const shouldTruncate = entry.content.length > maxLength;
  const displayText = isExpanded ? entry.content : entry.content.slice(0, maxLength) + '...';
  
  // Extract scheduled game ID from title for fallback lookup
  const titleMatch = entry.title.match(/^Game #(\d+)/);
  const scheduledGameId = titleMatch ? titleMatch[1] : null;
  
  // Fetch game data if linkedGameDocumentId is present
  const { game, loading: gameLoading, error: gameError } = useGame(entry.linkedGameDocumentId || foundGameId || '');
  
  // If no linkedGameDocumentId in entry but we have a scheduled game ID, try to find the game by numeric gameId
  useEffect(() => {
    if (!entry.linkedGameDocumentId && scheduledGameId && !game && !gameLoading && !foundGameId) {
      // Try to find game by matching the numeric gameId field (which matches scheduledGameId)
      fetch(`/api/games?gameId=${scheduledGameId}&limit=1`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data?.games?.length > 0) {
            const foundGame = data.data.games[0];
            if (foundGame.id) {
              setFoundGameId(foundGame.id);
            } else {
              logger.warn('Game found but no document ID in response', {
                scheduledGameId,
                foundGame,
                entryId: entry.id,
              });
            }
          }
        })
        .catch((err) => {
          const error = err instanceof Error ? err : new Error('Unknown error');
          logError(error, 'Failed to fetch game by scheduledGameId', {
            component: 'ArchiveEntry',
            operation: 'findGameByScheduledId',
            scheduledGameId,
            entryId: entry.id,
          });
        });
    }
  }, [entry.linkedGameDocumentId, scheduledGameId, game, gameLoading, foundGameId, entry.id, logger]);

  const handleTextExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Check if this is an auto-created archive entry from a scheduled game
  // Identified by: title pattern "Game #X - ..." AND having replayUrl
  const titleMatchesPattern = /^Game #\d+/.test(entry.title);
  const hasReplay = !!entry.replayUrl;
  const isScheduledGameArchive = titleMatchesPattern && hasReplay;
  
  // Extract game number from title if game data not available
  const titleMatch = entry.title.match(/^Game #(\d+) - (.+)$/);
  const gameNumber = titleMatch ? titleMatch[1] : null;
  const gameType = titleMatch ? titleMatch[2] : null;
  
  // If this archive entry has a gameId OR is a scheduled game archive, render it as a GameCard-style component
  if (entry.linkedGameDocumentId || isScheduledGameArchive) {
    return (
      <GameLinkedArchiveEntry
        entry={entry}
        game={game}
        gameLoading={gameLoading}
        gameError={gameError?.message || null}
        gameNumber={gameNumber}
        gameType={gameType}
        onEdit={onEdit}
        onDelete={onDelete}
        canDelete={canDelete}
        onImageClick={onImageClick}
        displayText={displayText}
        shouldTruncate={shouldTruncate}
        isExpanded={isExpanded}
        onTextExpand={handleTextExpand}
      />
    );
  }

  // Normal archive entry (no gameId)
  return (
    <NormalArchiveEntry
      entry={entry}
      onEdit={onEdit}
      onDelete={onDelete}
      canDelete={canDelete}
      onImageClick={onImageClick}
      displayText={displayText}
      shouldTruncate={shouldTruncate}
      isExpanded={isExpanded}
      onTextExpand={handleTextExpand}
    />
  );
}
