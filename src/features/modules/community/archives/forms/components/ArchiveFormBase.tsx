import React, { useMemo } from 'react';
import { ArchiveEntry, CreateArchiveEntry } from '@/types/archive';
import MediaSelector from '../../shared/components/sections/MediaSelector';
import DateSelector from '../../shared/components/sections/DateSelector';
import MediaPreview from '../../shared/components/sections/MediaPreview';
import FormHeader from '../../shared/components/sections/FormHeader';
import { type SectionKey } from '../../shared/utils/archiveFormUtils';
import { useArchiveBaseState } from '../../shared/hooks/useArchiveBaseState';
import { useArchiveMedia } from '../../shared/hooks/useArchiveMedia';
import { useArchiveHandlers } from '../../shared/hooks/useArchiveHandlers';
import { useArchiveFormSubmit } from '../../shared/hooks/useArchiveFormSubmit';

interface ArchiveFormBaseProps {
  mode: 'create' | 'edit';
  initialEntry?: ArchiveEntry;
  onSubmit: (payload: CreateArchiveEntry | Partial<CreateArchiveEntry>) => Promise<void>;
  onCancel: () => void;
  onSuccess: () => void;
  defaultAuthor?: string;
}

export default function ArchiveFormBase({ mode, initialEntry, onSubmit, onCancel, onSuccess, defaultAuthor }: ArchiveFormBaseProps) {
  const {
    formData, setFormData, imageFile, setImageFile, imageFiles, setImageFiles, replayFile, setReplayFile,
    currentImages, setCurrentImages, sectionOrder, setSectionOrder, existingReplayUrl, existingReplayName, setExistingReplayUrl,
  } = useArchiveBaseState(mode, initialEntry);

  const { imagePreviewUrls } = useArchiveMedia(imageFile, imageFiles);
  
  // Combine video URLs for the new MediaSelector (only one should be set at a time)
  const combinedVideoUrl = formData.mediaUrl || formData.twitchClipUrl;

  const { handleSubmit, isSubmitting, error, setError } = useArchiveFormSubmit({
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
  });

  const { 
    handleInputChange,
    handleImageUpload: _handleImageUpload,
    handleReorderImages,
    handleReorderSections,
    handleVideoUrlChange,
    handleTwitchUrlChange: _handleTwitchUrlChange,
    handleReplayUpload: _handleReplayUpload,
    handleCombinedFileUpload,
    handleMediaFieldChange: _handleMediaFieldChange,
    handleRemoveExistingImage,
    handleRemoveReplay,
  } = useArchiveHandlers({
    setFormData, imageFile, imageFiles, setImageFile, setImageFiles, setReplayFile, setCurrentImages, setSectionOrder, setError, setExistingReplayUrl,
  });

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
              placeholder="Enter a title for this archive entry..."
            />
          </div>

          {/* Entry Type */}
          <div>
            <label className="block text-amber-500 mb-2">Entry Type (Optional)</label>
            <select
              name="entryType"
              value={formData.entryType}
              onChange={handleInputChange}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
            >
              <option value="">None</option>
              <option value="story">Story/Memory</option>
              <option value="changelog">Changelog</option>
            </select>
          </div>

          {/* Date under Title */}
          <DateSelector
            dateType={formData.dateType}
            singleDate={formData.singleDate}
            approximateText={formData.approximateText}
            onFieldChange={handleInputChange}
          />

          {/* Content */}
          <div>
            <label className="block text-amber-500 mb-2">Text</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={4}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
              placeholder="Share your memory, experience, or story... (optional)"
            />
          </div>

          {/* Author is inherited from Discord on create and preserved on edit. No manual input. */}

          {/* Media */}
          <MediaSelector 
            videoUrl={combinedVideoUrl}
            onVideoUrlChange={handleVideoUrlChange}
            onFileUpload={handleCombinedFileUpload}
            videoError={error && combinedVideoUrl ? error : ''}
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
            twitchUrl={formData.twitchClipUrl}
            replayName={replayName}
            textPreview={formData.content}
            sectionOrder={sectionOrder as SectionKey[]}
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


