import React from 'react';
import type { ArchiveEntry } from '@/types/archive';
import type { GameWithPlayers } from '@/features/modules/game-management/games/types';
import EntryEditModal from '@/features/modules/game-management/entries/components/EntryEditModal';
import EditGameForm from '@/features/modules/game-management/scheduled-games/components/EditGameForm';
import GameDeleteDialog from '@/features/modules/game-management/scheduled-games/components/GameDeleteDialog';
import ArchiveDeleteDialog from '@/features/modules/community/archives/forms/components/ArchiveDeleteDialog';

interface HomeTimelineModalsProps {
  editingEntry: ArchiveEntry | null;
  editingGame: GameWithPlayers | null;
  pendingDeleteEntry: ArchiveEntry | null;
  pendingDeleteGame: GameWithPlayers | null;
  isDeleting: boolean;
  isDeletingGame: boolean;
  extractEntryId: (archiveEntryId: string) => string | null;
  onEditSuccess: (entryId?: string) => Promise<void>;
  onEditCancel: () => void;
  onGameEditSubmit: (updates: {
    teamSize: string;
    customTeamSize?: string;
    gameType: string;
    gameVersion?: string;
    gameLength?: number;
    modes: string[];
  }) => Promise<void>;
  onGameEditCancel: () => void;
  onEntryDeleteConfirm: () => Promise<void>;
  onEntryDeleteCancel: () => void;
  onGameDeleteConfirm: () => Promise<void>;
  onGameDeleteCancel: () => void;
}

/**
 * Component for managing all modals and dialogs in HomeTimeline
 */
export function HomeTimelineModals({
  editingEntry,
  editingGame,
  pendingDeleteEntry,
  pendingDeleteGame,
  isDeleting,
  isDeletingGame,
  extractEntryId,
  onEditSuccess,
  onEditCancel,
  onGameEditSubmit,
  onGameEditCancel,
  onEntryDeleteConfirm,
  onEntryDeleteCancel,
  onGameDeleteConfirm,
  onGameDeleteCancel,
}: HomeTimelineModalsProps) {
  return (
    <>
      {/* Edit Entry Modal */}
      {editingEntry && editingEntry.id.startsWith('entry-') && (
        <EntryEditModal
          entry={editingEntry}
          entryId={extractEntryId(editingEntry.id)!}
          onSuccess={onEditSuccess}
          onCancel={onEditCancel}
        />
      )}

      {/* Edit Game Modal */}
      {editingGame && editingGame.gameState === 'scheduled' && (
        <EditGameForm
          game={editingGame}
          onSubmit={onGameEditSubmit}
          onCancel={onGameEditCancel}
          isSubmitting={false}
        />
      )}

      {/* Delete Entry Dialog */}
      {pendingDeleteEntry && (
        <ArchiveDeleteDialog
          isOpen={!!pendingDeleteEntry}
          entryTitle={pendingDeleteEntry.title}
          isLoading={isDeleting}
          onConfirm={onEntryDeleteConfirm}
          onCancel={onEntryDeleteCancel}
        />
      )}

      {/* Delete Game Dialog */}
      {pendingDeleteGame && (
        <GameDeleteDialog
          isOpen={!!pendingDeleteGame}
          gameTitle={`Game #${pendingDeleteGame.gameId}`}
          isLoading={isDeletingGame}
          onConfirm={onGameDeleteConfirm}
          onCancel={onGameDeleteCancel}
        />
      )}
    </>
  );
}




