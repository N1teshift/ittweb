import { useState, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { EntryContentType } from '@/types/entry';
import { uploadImage } from '@/features/modules/community/archives/services';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import type { ArchiveEntry } from '@/types/archive';

const logger = createComponentLogger('EntryEditModal');

interface EntryEditModalProps {
  entry: ArchiveEntry;
  entryId: string; // The actual entry ID (without "entry-" prefix)
  onSuccess: (entryId?: string) => void;
  onCancel: () => void;
}

export default function EntryEditModal({ entry, entryId, onSuccess, onCancel }: EntryEditModalProps) {
  const { data: session } = useSession();
  const [contentType, setContentType] = useState<EntryContentType>(
    entry.entryType === 'story' ? 'post' : 'memory'
  );
  const [title, setTitle] = useState(entry.title);
  const [content, setContent] = useState(entry.content);
  const [date, setDate] = useState(
    entry.dateInfo.singleDate ? entry.dateInfo.singleDate.split('T')[0] : new Date().toISOString().slice(0, 10)
  );
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>(entry.images || []);
  const [videoUrl, setVideoUrl] = useState(entry.videoUrl || '');
  const [twitchClipUrl, setTwitchClipUrl] = useState(entry.twitchClipUrl || '');
  const [sectionOrder] = useState<Array<'images' | 'video' | 'twitch' | 'text'>>(
    (entry.sectionOrder as Array<'images' | 'video' | 'twitch' | 'text'>) || ['text']
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(files);

    // Create preview URLs for new files
    const newUrls = files.map(file => URL.createObjectURL(file));
    setImagePreviewUrls([...imagePreviewUrls, ...newUrls]);
  };

  const handleRemoveImage = (index: number) => {
    const newUrls = imagePreviewUrls.filter((_, i) => i !== index);
    setImagePreviewUrls(newUrls);
    // If removing an existing image (not a blob URL), we need to track it
    // For now, just remove from preview - the submit handler will handle the rest
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!session?.user) {
      setError('You must be signed in to edit an entry');
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload new images if any
      const uploadedImageUrls: string[] = [];
      if (contentType === 'memory' && images.length > 0) {
        for (const image of images) {
          const url = await uploadImage(image);
          uploadedImageUrls.push(url);
        }
      }

      // Separate existing images (URLs) from new blob previews
      const existingImageUrls = imagePreviewUrls.filter(url =>
        !url.startsWith('blob:') && typeof url === 'string' && url.length > 0
      );
      const allImageUrls = [...existingImageUrls, ...uploadedImageUrls];

      const entryData = {
        title: title.trim(),
        content: content.trim(),
        contentType,
        date: new Date(date).toISOString(),
        ...(contentType === 'memory' && {
          images: allImageUrls.length > 0 ? allImageUrls : undefined,
          videoUrl: videoUrl.trim() || undefined,
          twitchClipUrl: twitchClipUrl.trim() || undefined,
          sectionOrder: allImageUrls.length > 0 || videoUrl || twitchClipUrl
            ? sectionOrder
            : undefined,
        }),
      };

      const response = await fetch(`/api/entries/${entryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entryData),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to update entry';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          try {
            const text = await response.text();
            errorMessage = text || errorMessage;
          } catch {
            errorMessage = response.statusText || errorMessage;
          }
        }
        throw new Error(errorMessage);
      }

      logger.info('Entry updated', { entryId, contentType, title });

      // Pass entryId to onSuccess so parent can fetch and update the entry
      onSuccess(entryId);
    } catch (err) {
      const error = err as Error;
      logError(error, 'Failed to update entry', {
        component: 'EntryEditModal',
        operation: 'updateEntry',
        entryId,
        contentType,
      });
      setError(error.message || 'Failed to update entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-amber-500/30 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-medieval-brand text-amber-400">Edit Entry</h2>
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Content Type */}
          <div>
            <label className="block text-amber-500 mb-2">Content Type *</label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as EntryContentType)}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
              required
            >
              <option value="post">Post</option>
              <option value="memory">Memory</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-amber-500 mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
              placeholder="Enter a title..."
              required
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-amber-500 mb-2">Date *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
              required
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-amber-500 mb-2">Content *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
              placeholder="Write your content in Markdown..."
              required
            />
          </div>

          {/* Memory-specific fields */}
          {contentType === 'memory' && (
            <>
              {/* Images */}
              <div>
                <label className="block text-amber-500 mb-2">Images (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                />
                {imagePreviewUrls.length > 0 && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {imagePreviewUrls.map((url, i) => (
                      <div key={i} className="relative w-full h-32 rounded overflow-hidden group">
                        <Image
                          src={url}
                          alt={`Preview ${i + 1}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(i)}
                          className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-amber-500 mb-2">Video URL (optional)</label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  placeholder="https://..."
                />
              </div>

              {/* Twitch Clip URL */}
              <div>
                <label className="block text-amber-500 mb-2">Twitch Clip URL (optional)</label>
                <input
                  type="url"
                  value={twitchClipUrl}
                  onChange={(e) => setTwitchClipUrl(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  placeholder="https://clips.twitch.tv/..."
                />
              </div>
            </>
          )}

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
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-500 rounded-md transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Update Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


