import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { ArchiveEntry as ArchiveEntryType } from '@/types/archive';
import type { GameWithPlayers } from '@/features/modules/game-management/games/types';
import { useGame } from '@/features/modules/game-management/games/hooks/useGame';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import { GameLinkedArchiveEntry } from './GameLinkedArchiveEntry';
import { NormalArchiveEntry } from './NormalArchiveEntry';

interface ArchiveEntryProps {
  entry: ArchiveEntryType;
  onEdit?: (entry: ArchiveEntryType) => void;
  onDelete?: (entry: ArchiveEntryType) => void;
  canDelete?: boolean;
  onImageClick?: (url: string, title: string) => void;
  onGameEdit?: (game: GameWithPlayers) => void;
  onGameDelete?: (game: GameWithPlayers) => void;
  onGameJoin?: (gameId: string) => Promise<void>;
  onGameLeave?: (gameId: string) => Promise<void>;
  isJoining?: boolean;
  isLeaving?: boolean;
  userIsAdmin?: boolean;
  game?: GameWithPlayers; // Pre-fetched game data from localGames
}

function ArchiveEntryComponent({ 
  entry, 
  onEdit, 
  onDelete, 
  canDelete, 
  onImageClick,
  onGameEdit,
  onGameDelete,
  onGameJoin,
  onGameLeave,
  isJoining,
  isLeaving,
  userIsAdmin,
  game: preloadedGame,
}: ArchiveEntryProps) {
  const logger = createComponentLogger('ArchiveEntry');
  const [isExpanded, setIsExpanded] = useState(false);
  const [foundGameId, setFoundGameId] = useState<string | null>(null);
  const maxLength = 300; // Characters to show before truncating
  
  // Memoize truncation logic
  const shouldTruncate = useMemo(() => entry.content.length > maxLength, [entry.content.length, maxLength]);
  const displayText = useMemo(
    () => (isExpanded ? entry.content : entry.content.slice(0, maxLength) + '...'),
    [isExpanded, entry.content, maxLength]
  );

  // Memoize scheduled game ID extraction
  const scheduledGameId = useMemo(() => {
  const titleMatch = entry.title.match(/^Game #(\d+)/);
    return titleMatch ? titleMatch[1] : null;
  }, [entry.title]);
  
  // For completed games, always fetch the full game with players to ensure players are displayed
  // For scheduled games, use preloaded game if available (they don't need players, they have participants)
  const gameIdToFetch = preloadedGame?.gameState === 'completed' && preloadedGame?.id
    ? preloadedGame.id
    : (preloadedGame ? '' : (entry.linkedGameDocumentId || foundGameId || ''));
  
  // Fetch game data if linkedGameDocumentId is present, or if we need to fetch players for a completed game
  const { game: fetchedGame, loading: gameLoading, error: gameError } = useGame(gameIdToFetch);
  
  // For completed games, prefer fetched game (which includes players) over preloaded game
  // For scheduled games, use preloaded game if available (faster, and they don't need players)
  const game = preloadedGame?.gameState === 'completed' && fetchedGame
    ? fetchedGame
    : (preloadedGame || fetchedGame);
  
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

  const handleTextExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  // Memoize scheduled game archive detection
  const isScheduledGameArchive = useMemo(() => {
  const titleMatchesPattern = /^Game #\d+/.test(entry.title);
  const hasReplay = !!entry.replayUrl;
    return titleMatchesPattern && hasReplay;
  }, [entry.title, entry.replayUrl]);
  
  // Memoize game number and type extraction
  const { gameNumber, gameType } = useMemo(() => {
  const titleMatch2 = entry.title.match(/^Game #(\d+) - (.+)$/);
    return {
      gameNumber: titleMatch2 ? titleMatch2[1] : null,
      gameType: titleMatch2 ? titleMatch2[2] : null,
    };
  }, [entry.title]);
  
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
        onGameEdit={onGameEdit}
        onGameDelete={onGameDelete}
        onGameJoin={onGameJoin}
        onGameLeave={onGameLeave}
        isJoining={isJoining}
        isLeaving={isLeaving}
        userIsAdmin={userIsAdmin}
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

// Memoize component to prevent unnecessary re-renders when props haven't changed
const ArchiveEntry = React.memo(ArchiveEntryComponent);
export { ArchiveEntry };
export default ArchiveEntry;


