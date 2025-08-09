import React, { useMemo, useState } from 'react';
import { ArchiveEntry, CreateArchiveEntry } from '@/types/archive';
import MediaSelector from './sections/MediaSelector';
import DateSelector from './sections/DateSelector';
import MediaPreview from './sections/MediaPreview';
import FormHeader from './sections/FormHeader';
import { validateArchiveForm } from '../utils/archiveValidation';
import { buildDateInfo, computeEffectiveSectionOrder } from '../utils/archiveFormUtils';
import { useArchiveBaseState } from '../hooks/useArchiveBaseState';
import { useArchiveMedia, uploadSelectedMedia } from '../hooks/useArchiveMedia';
import { useArchiveHandlers } from '../hooks/useArchiveHandlers';

type SectionKey = 'images' | 'video' | 'replay' | 'text';

interface ArchiveFormBaseProps {
  mode: 'create' | 'edit';
  initialEntry?: ArchiveEntry;
  onSubmit: (payload: CreateArchiveEntry | Partial<CreateArchiveEntry>) => Promise<void>;
  onCancel: () => void;
  onSuccess: () => void;
  defaultAuthor?: string;
}

export default function ArchiveFormBase({ mode, initialEntry, onSubmit, onCancel, onSuccess, defaultAuthor }: ArchiveFormBaseProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const {
    formData, setFormData, imageFile, setImageFile, imageFiles, setImageFiles, replayFile, setReplayFile,
    currentImages, setCurrentImages, sectionOrder, setSectionOrder, existingReplayUrl, existingReplayName, setExistingReplayUrl,
  } = useArchiveBaseState(mode, initialEntry);

  const { imagePreviewUrls } = useArchiveMedia(imageFile, imageFiles);

  const { 
    handleInputChange, handleImageUpload, handleReorderImages, handleReorderSections,
    handleVideoUrlChange, handleReplayUpload, handleMediaFieldChange, handleRemoveExistingImage, handleRemoveReplay
  } = useArchiveHandlers({
    setFormData, imageFile, imageFiles, setImageFile, setImageFiles, setReplayFile, setCurrentImages, setSectionOrder, setError, setExistingReplayUrl,
  });

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const validationError = validateArchiveForm({
        title: formData.title,
        content: formData.content,
        author: mode === 'create' ? (defaultAuthor || '') : formData.author,
        dateType: formData.dateType,
        singleDate: formData.singleDate,
        startDate: formData.startDate,
        endDate: formData.endDate,
        approximateText: formData.approximateText,
      });
      if (validationError) {
        setError(validationError);
        return;
      }

      // Uploads
      const { images, replayUrl } = await uploadSelectedMedia(
        imageFile,
        imageFiles,
        currentImages,
        mode,
        replayFile,
      );

      // DateInfo
      const dateInfo = buildDateInfo({
        dateType: formData.dateType,
        singleDate: formData.singleDate,
        startDate: formData.startDate,
        endDate: formData.endDate,
        approximateText: formData.approximateText
      });

      // Effective order
      const hasImages = Boolean(images && images.length > 0);
      const hasVideo = Boolean(formData.mediaUrl);
      const hasReplay = Boolean(replayUrl || existingReplayUrl);
      const hasText = Boolean(formData.content && formData.content.trim().length > 0);
      const effectiveSectionOrder = computeEffectiveSectionOrder(sectionOrder, { hasImages, hasVideo, hasReplay, hasText });

      if (mode === 'create') {
        const payload: CreateArchiveEntry = {
          title: formData.title.trim(),
          content: formData.content.trim(),
          author: (defaultAuthor || '').trim(),
          mediaType: hasImages ? 'image' : hasVideo ? 'video' : replayFile ? 'replay' : 'none',
          dateInfo,
          ...(images && images.length > 0 ? { images } : {}),
          ...(formData.mediaUrl ? { videoUrl: formData.mediaUrl } : {}),
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
        author: formData.author.trim(),
        mediaType: hasImages ? 'image' : hasVideo ? 'video' : (replayUrl || existingReplayUrl) ? 'replay' : 'none',
        dateInfo,
        ...(images && images.length > 0 ? { images } : {}),
        ...(formData.mediaUrl ? { videoUrl: formData.mediaUrl } : {}),
        ...(replayUrl ? { replayUrl } : {}),
        sectionOrder: effectiveSectionOrder
      };
      await onSubmit(updates);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit archive entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const replayName = useMemo(() => (replayFile ? replayFile.name : existingReplayName), [replayFile, existingReplayName]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-amber-500/30 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <FormHeader mode={mode} />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-amber-500 mb-2">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
              placeholder="Enter a title for this memory..."
            />
          </div>

          {/* Date under Title */}
          <DateSelector
            dateType={formData.dateType}
            singleDate={formData.singleDate}
            startDate={formData.startDate}
            endDate={formData.endDate}
            approximateText={formData.approximateText}
            onFieldChange={handleInputChange}
          />

          {/* Content */}
          <div>
            <label className="block text-amber-500 mb-2">Story/Memory *</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
              placeholder="Share your memory, experience, or story..."
            />
          </div>

          {/* Author is inherited from Discord on create and preserved on edit. No manual input. */}

          {/* Media */}
          <MediaSelector 
            mediaUrl={formData.mediaUrl}
            onVideoUrlChange={handleVideoUrlChange}
            onImageUpload={handleImageUpload}
            onReplayUpload={handleReplayUpload}
            multipleImages
            videoError={error && formData.mediaUrl ? error : ''}
            showHeader={false}
          />

          <MediaPreview
            images={(imageFiles.length || imageFile) ? (
              imagePreviewUrls.map((u, i) => ({ key: u + i, url: u }))
            ) : (
              currentImages.map((u, i) => ({ key: u + i, url: u }))
            )}
            onReorderImages={handleReorderImages}
            videoUrl={formData.mediaUrl}
            replayName={replayName}
            textPreview={formData.content}
            sectionOrder={sectionOrder}
            onReorderSections={handleReorderSections}
            onRemoveImage={mode === 'edit' ? handleRemoveExistingImage : undefined}
            onRemoveReplay={mode === 'edit' ? handleRemoveReplay : undefined}
          />

          {/* Error */}
          {error && (
            <div className="bg-red-900/50 border border-red-500 rounded p-3 text-red-300">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded border border-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 text-white py-2 px-4 rounded border border-amber-500 transition-colors"
            >
              {isSubmitting ? (mode === 'create' ? 'Adding...' : 'Updating...') : (mode === 'create' ? 'Add to Archives' : 'Update Entry')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
