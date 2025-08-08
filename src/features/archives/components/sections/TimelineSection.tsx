import React from 'react';
import type { ArchiveEntry as ArchiveEntryType } from '@/types/archive';
import ArchiveEntry from '../ArchiveEntry';

interface TimelineSectionProps {
  title: string;
  entries: ArchiveEntryType[];
  titleClassName?: string;
  onEdit: (entry: ArchiveEntryType) => void;
  onImageClick: (url: string, title: string) => void;
}

export default function TimelineSection({ title, entries, titleClassName, onEdit, onImageClick }: TimelineSectionProps) {
  if (entries.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className={`font-medieval-brand text-3xl mb-8 ${titleClassName ?? 'text-amber-400'}`}>
        {title}
      </h2>
      <div className="space-y-8">
        {entries.map((entry) => (
          <ArchiveEntry
            key={entry.id}
            entry={entry}
            onEdit={onEdit}
            onImageClick={onImageClick}
          />
        ))}
      </div>
    </div>
  );
}
