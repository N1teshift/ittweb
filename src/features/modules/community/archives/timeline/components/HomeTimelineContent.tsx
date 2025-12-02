import React from 'react';
import type { ArchiveEntry } from '@/types/archive';
import type { Game, GameWithPlayers } from '@/features/modules/game-management/games/types';
import ArchivesContent from './ArchivesContent';

interface HomeTimelineContentProps {
  loading: boolean;
  gamesLoading: boolean;
  error: string | null;
  gamesError: Error | null;
  entries: ArchiveEntry[];
  datedEntries: ArchiveEntry[];
  undatedEntries: ArchiveEntry[];
  localGames: GameWithPlayers[];
  gamesMap: Map<string, GameWithPlayers>;
  isAuthenticated: boolean;
  canManageEntries: boolean;
  currentDiscordId: string | undefined;
  isJoining: string | false;
  isLeaving: string | false;
  onEdit: (entry: ArchiveEntry) => void;
  onRequestDelete: (entry: ArchiveEntry) => void;
  onImageClick: (url: string, title: string) => void;
  onAddClick: () => void;
  onSignInClick: () => void;
  onGameEdit: (game: GameWithPlayers) => void;
  onGameDelete: (game: GameWithPlayers) => void;
  onGameJoin: (gameId: string) => Promise<void>;
  onGameLeave: (gameId: string) => Promise<void>;
}

/**
 * Component for rendering the main timeline content
 */
export function HomeTimelineContent({
  loading,
  gamesLoading,
  error,
  gamesError,
  entries,
  datedEntries,
  undatedEntries,
  localGames,
  gamesMap,
  isAuthenticated,
  canManageEntries,
  currentDiscordId,
  isJoining,
  isLeaving,
  onEdit,
  onRequestDelete,
  onImageClick,
  onAddClick,
  onSignInClick,
  onGameEdit,
  onGameDelete,
  onGameJoin,
  onGameLeave,
}: HomeTimelineContentProps) {
  return (
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
        canManageEntries || (!!currentDiscordId && entry.createdByDiscordId === currentDiscordId)
      }
      onEdit={onEdit}
      onRequestDelete={onRequestDelete}
      onImageClick={onImageClick}
      onAddClick={onAddClick}
      onSignInClick={onSignInClick}
      onGameEdit={onGameEdit as (game: Game) => void}
      onGameDelete={onGameDelete as (game: Game) => void}
      onGameJoin={onGameJoin}
      onGameLeave={onGameLeave}
      isJoining={typeof isJoining === 'string' ? true : isJoining || false}
      isLeaving={typeof isLeaving === 'string' ? true : isLeaving || false}
      userIsAdmin={canManageEntries}
    />
  );
}



