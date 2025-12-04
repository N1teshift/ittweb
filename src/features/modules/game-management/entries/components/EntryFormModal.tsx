import { useState, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { EntryContentType } from '@/types/entry';
import { uploadImage } from '@/features/modules/community/archives/services';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';

const logger = createComponentLogger('EntryFormModal');

interface EntryFormModalProps {
  onSuccess: (entryId?: string) => void;
  onCancel: () => void;
}

export default function EntryFormModal({ onSuccess, onCancel }: EntryFormModalProps) {
  const { data: session } = useSession();
  const [contentType, setContentType] = useState<EntryContentType>('post');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [twitchClipUrl, setTwitchClipUrl] = useState('');
  const [sectionOrder] = useState<Array<'images' | 'video' | 'twitch' | 'text'>>(['text']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(files);

    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(urls);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!session?.user) {
      setError('You must be signed in to create an entry');
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images if any
      const uploadedImageUrls: string[] = [];
      if (contentType === 'memory' && images.length > 0) {
        for (const image of images) {
          const url = await uploadImage(image);
          uploadedImageUrls.push(url);
        }
      }

      const entryData = {
        title: title.trim(),
        content: content.trim(),
        contentType,
        date: new Date(date).toISOString(),
        ...(contentType === 'memory' && {
          images: uploadedImageUrls.length > 0 ? uploadedImageUrls : undefined,
          videoUrl: videoUrl.trim() || undefined,
          twitchClipUrl: twitchClipUrl.trim() || undefined,
          sectionOrder: uploadedImageUrls.length > 0 || videoUrl || twitchClipUrl
            ? sectionOrder
            : undefined,
        }),
      };

      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entryData),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to create entry';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If response is not JSON, try to get text
          try {
            const text = await response.text();
            errorMessage = text || errorMessage;
          } catch {
            // If all else fails, use status text
            errorMessage = response.statusText || errorMessage;
          }
        }
        throw new Error(errorMessage);
      }

      // Get the entry ID from the response
      const responseData = await response.json();
      // API returns { success: true, data: { id: "..." } } or { id: "..." }
      const entryId = responseData.data?.id || responseData.id;

      logger.info('Entry created', { contentType, title, entryId });

      onSuccess(entryId);
    } catch (err) {
      const error = err as Error;
      logError(error, 'Failed to create entry', {
        component: 'EntryFormModal',
        operation: 'createEntry',
        contentType,
      });
      setError(error.message || 'Failed to create entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-amber-500/30 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-medieval-brand text-amber-400">Create Entry</h2>
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
                      <div key={i} className="relative w-full h-32 rounded overflow-hidden">
                        <Image
                          src={url}
                          alt={`Preview ${i + 1}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
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
              {isSubmitting ? 'Creating...' : 'Create Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


