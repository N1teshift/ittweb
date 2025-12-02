import React from 'react';
import type { ArchiveEntry as ArchiveEntryType } from '@/types/archive';
import type { GameWithPlayers } from '@/features/modules/game-management/games/types';
import { ArchiveEntry } from '@/features/modules/community/archives/display/components';

interface TimelineSectionProps {
  title: string;
  entries: ArchiveEntryType[];
  titleClassName?: string;
  onEdit?: (entry: ArchiveEntryType) => void;
  onDelete?: (entry: ArchiveEntryType) => void;
  canDeleteEntry?: (entry: ArchiveEntryType) => boolean;
  onImageClick: (url: string, title: string) => void;
  onGameEdit?: (game: GameWithPlayers) => void;
  onGameDelete?: (game: GameWithPlayers) => void;
  onGameJoin?: (gameId: string) => Promise<void>;
  onGameLeave?: (gameId: string) => Promise<void>;
  isJoining?: boolean;
  isLeaving?: boolean;
  userIsAdmin?: boolean;
  gamesMap?: Map<string, GameWithPlayers>;
}

export default function TimelineSection({ 
  title, 
  entries, 
  titleClassName, 
  onEdit, 
  onDelete, 
  canDeleteEntry, 
  onImageClick,
  onGameEdit,
  onGameDelete,
  onGameJoin,
  onGameLeave,
  isJoining,
  isLeaving,
  userIsAdmin,
  gamesMap,
}: TimelineSectionProps) {
  if (entries.length === 0) return null;

  return (
    <div className="mb-12">
      {title && (
        <h2 className={`font-medieval-brand text-3xl mb-8 ${titleClassName ?? 'text-amber-400'}`}>
          {title}
        </h2>
      )}
      <div className="space-y-8">
        {entries.map((entry) => (
          <ArchiveEntry
            key={entry.id}
            entry={entry}
            onEdit={onEdit}
            onDelete={canDeleteEntry && canDeleteEntry(entry) ? onDelete : undefined}
            canDelete={canDeleteEntry ? canDeleteEntry(entry) : false}
            onImageClick={onImageClick}
            onGameEdit={onGameEdit}
            onGameDelete={onGameDelete}
            onGameJoin={onGameJoin}
            onGameLeave={onGameLeave}
            isJoining={isJoining}
            isLeaving={isLeaving}
            userIsAdmin={userIsAdmin}
            game={entry.linkedGameDocumentId ? gamesMap?.get(entry.linkedGameDocumentId) : undefined}
          />
        ))}
      </div>
    </div>
  );
}


