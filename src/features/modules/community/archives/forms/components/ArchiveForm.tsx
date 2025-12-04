import React from 'react';
import { useSession } from 'next-auth/react';
import { createArchiveEntry } from '@/features/modules/community/archives/services';
import { CreateArchiveEntry } from '@/types/archive';
import ArchiveFormBase from './ArchiveFormBase';

interface ArchiveFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ArchiveForm({ onSuccess, onCancel }: ArchiveFormProps) {
  const { data: session } = useSession();
  const defaultAuthor = (session?.user?.name
    || (session?.user?.email ? session.user.email.split('@')[0] : '')
    || 'Discord User');
  const handleSubmit = async (payload: CreateArchiveEntry | Partial<CreateArchiveEntry>) => {
    const entryPayload: CreateArchiveEntry = {
      ...(payload as CreateArchiveEntry),
      createdByDiscordId: session?.discordId || null,
      creatorName: payload.creatorName || defaultAuthor,
    };
    await createArchiveEntry(entryPayload);
  };

  return (
    <ArchiveFormBase
      mode="create"
      defaultAuthor={defaultAuthor}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      onSuccess={onSuccess}
    />
  );
}


