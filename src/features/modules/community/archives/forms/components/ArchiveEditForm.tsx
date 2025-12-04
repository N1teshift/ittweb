import React from 'react';
import { updateArchiveEntry } from '@/features/modules/community/archives/services';
import { ArchiveEntry, CreateArchiveEntry } from '@/types/archive';
import ArchiveFormBase from './ArchiveFormBase';

interface ArchiveEditFormProps {
  entry: ArchiveEntry;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ArchiveEditForm({ entry, onSuccess, onCancel }: ArchiveEditFormProps) {
  const handleSubmit = async (updates: Partial<CreateArchiveEntry>) => {
    // Remove any legacy fields that don't exist in CreateArchiveEntry
    const { author: _omitAuthor, mediaUrl: _omitMediaUrl, mediaType: _omitMediaType, ...rest } = updates as Record<string, unknown>;
    await updateArchiveEntry(entry.id, rest as Partial<CreateArchiveEntry>);
  };

  return (
    <ArchiveFormBase
      mode="edit"
      initialEntry={entry}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      onSuccess={onSuccess}
    />
  );
}


