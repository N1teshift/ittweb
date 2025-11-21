import React from 'react';
import { updateArchiveEntry } from '@/lib/archiveService';
import { ArchiveEntry, CreateArchiveEntry } from '@/types/archive';
import ArchiveFormBase from './ArchiveFormBase';

interface ArchiveEditFormProps {
  entry: ArchiveEntry;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ArchiveEditForm({ entry, onSuccess, onCancel }: ArchiveEditFormProps) {
  const handleSubmit = async (updates: Partial<CreateArchiveEntry>) => {
    const { author: _omitAuthor, ...rest } = updates;
    await updateArchiveEntry(entry.id, rest);
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
