import { useState } from 'react';
import { ArchiveEntry, CreateArchiveEntry, ArchiveEntryType } from '@/types/archive';
import { validateArchiveForm } from '../utils/archiveValidation';
import { buildDateInfo, computeEffectiveSectionOrder, SectionKey } from '../utils/archiveFormUtils';
import { uploadSelectedMedia } from './useArchiveMedia';
import { logError } from '@/features/infrastructure/logging';

interface UseArchiveFormSubmitProps {
  mode: 'create' | 'edit';
  initialEntry?: ArchiveEntry;
  formData: {
    title: string;
    content: string;
    author: string;
    dateType: string;
    singleDate: string;
    approximateText: string;
    entryType?: string;
    mediaUrl?: string;
    twitchClipUrl?: string;
  };
  imageFile: File | null;
  imageFiles: File[];
  currentImages: string[];
  replayFile: File | null;
  sectionOrder: string[];
  existingReplayUrl?: string;
  defaultAuthor?: string;
  onSubmit: (payload: CreateArchiveEntry | Partial<CreateArchiveEntry>) => Promise<void>;
  onSuccess: () => void;
}

export function useArchiveFormSubmit({
  mode,
  initialEntry,
  formData,
  imageFile,
  imageFiles,
  currentImages,
  replayFile,
  sectionOrder,
  existingReplayUrl,
  defaultAuthor,
  onSubmit,
  onSuccess,
}: UseArchiveFormSubmitProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Validate and cast dateType
      const dateType: 'single' | 'undated' = (formData.dateType === 'single' || formData.dateType === 'undated') 
        ? formData.dateType 
        : 'single';
      
      const validationError = validateArchiveForm({
        title: formData.title,
        content: formData.content,
        author: mode === 'create' ? (defaultAuthor || '') : formData.author || '',
        dateType: dateType,
        singleDate: formData.singleDate,
        approximateText: formData.approximateText,
      });
      if (validationError) {
        setError(validationError);
        return;
      }

      // Uploads - use entryId for edit mode to store files in archives/{entryId}/ structure
      const entryId = mode === 'edit' ? initialEntry?.id : undefined;
      const { images, replayUrl } = await uploadSelectedMedia(
        imageFile,
        imageFiles,
        currentImages,
        mode,
        replayFile,
        entryId,
      );

      // DateInfo
      const dateInfo = buildDateInfo({
        dateType,
        singleDate: formData.singleDate,
        approximateText: formData.approximateText
      });

      // Effective order
      const hasImages = Boolean(images && images.length > 0);
      const hasVideo = Boolean(formData.mediaUrl);
      const hasTwitch = Boolean(formData.twitchClipUrl);
      const hasReplay = Boolean(replayUrl || existingReplayUrl);
      const hasGame = Boolean(initialEntry?.linkedGameDocumentId);
      const hasText = Boolean(formData.content && formData.content.trim().length > 0);
      // Cast sectionOrder to proper type
      const typedSectionOrder = sectionOrder as SectionKey[];
      const effectiveSectionOrder = computeEffectiveSectionOrder(typedSectionOrder, { hasImages, hasVideo, hasTwitch, hasReplay, hasGame, hasText });

      if (mode === 'create') {
        const payload: CreateArchiveEntry = {
          title: formData.title.trim(),
          content: formData.content.trim(),
          creatorName: (defaultAuthor || formData.author || '').trim(), 
          dateInfo,
          ...(formData.entryType && (formData.entryType === 'story' || formData.entryType === 'changelog') 
            ? { entryType: formData.entryType as ArchiveEntryType } 
            : {}),
          ...(images && images.length > 0 ? { images } : {}),
          ...(formData.mediaUrl ? { videoUrl: formData.mediaUrl.trim() } : {}),
          ...(formData.twitchClipUrl ? { twitchClipUrl: formData.twitchClipUrl.trim() } : {}),
          ...(replayUrl ? { replayUrl } : {}),
          sectionOrder: effectiveSectionOrder
        };
        await onSubmit(payload);
        onSuccess();
        return;
      }

      // edit
      const updates: Partial<CreateArchiveEntry> = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        creatorName: formData.author.trim(),
        dateInfo,
        ...(images && images.length > 0 ? { images } : {}),
        ...(formData.mediaUrl ? { videoUrl: formData.mediaUrl.trim() } : { videoUrl: '' }),
        ...(formData.twitchClipUrl ? { twitchClipUrl: formData.twitchClipUrl.trim() } : { twitchClipUrl: '' }),
        ...(replayUrl ? { replayUrl } : {}),
        sectionOrder: effectiveSectionOrder
      };
      
      // Only include entryType if it has a value (to avoid undefined)
      if (formData.entryType) {
        const entryType: ArchiveEntryType | undefined = (formData.entryType === 'story' || formData.entryType === 'changelog')
          ? formData.entryType as ArchiveEntryType
          : undefined;
        updates.entryType = entryType;
      } else {
        // Set to undefined to clear existing value if any
        updates.entryType = undefined;
      }
      await onSubmit(updates);
      onSuccess();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      logError(error, 'Failed to submit archive entry', {
        component: 'useArchiveFormSubmit',
        operation: 'handleSubmit',
        mode,
      });
      setError(error.message || 'Failed to submit archive entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    isSubmitting,
    error,
    setError,
  };
}



