import React, { useState, useEffect } from 'react';
import { uploadImage, extractYouTubeId, updateArchiveEntry } from '@/lib/archiveService';
import { ArchiveEntry, CreateArchiveEntry, DateInfo } from '@/types/archive';
import MediaSelector from './sections/MediaSelector';
import DateSelector from './sections/DateSelector';

interface ArchiveEditFormProps {
  entry: ArchiveEntry;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ArchiveEditForm({ entry, onSuccess, onCancel }: ArchiveEditFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    mediaUrl: '',
    mediaType: 'none' as 'image' | 'video' | 'none',
    dateType: 'single' as 'single' | 'interval' | 'undated',
    singleDate: '',
    startDate: '',
    endDate: '',
    approximateText: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Pre-fill form with existing data
  useEffect(() => {
    setFormData({
      title: entry.title,
      content: entry.content,
      author: entry.author,
      mediaUrl: entry.mediaUrl || '',
      mediaType: entry.mediaType || 'none',
      dateType: entry.dateInfo.type,
      singleDate: entry.dateInfo.singleDate || '',
      startDate: entry.dateInfo.startDate || '',
      endDate: entry.dateInfo.endDate || '',
      approximateText: entry.dateInfo.approximateText || ''
    });
  }, [entry]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      setImageFile(file);
      setFormData(prev => ({ ...prev, mediaType: 'image' }));
      setError('');
    }
  };

  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, mediaUrl: url, mediaType: 'video' }));
    
    if (url && !extractYouTubeId(url)) {
      setError('Please enter a valid YouTube URL');
    } else {
      setError('');
    }
  };

  // Route media-related input changes to the appropriate handler (for validation)
  const handleMediaFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'mediaUrl') {
      handleVideoUrlChange(e);
      return;
    }
    handleInputChange(e);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        setError('Title is required');
        return;
      }
      if (!formData.content.trim()) {
        setError('Story/Memory is required');
        return;
      }
      if (!formData.author.trim()) {
        setError('Author name is required');
        return;
      }

      // Validate date fields based on type
      if (formData.dateType === 'single' && !formData.singleDate) {
        setError('Date is required for single date entries');
        return;
      }
      if (formData.dateType === 'interval' && (!formData.startDate || !formData.endDate)) {
        setError('Both start and end dates are required for date ranges');
        return;
      }

      let mediaUrl = formData.mediaUrl;

      // Handle image upload
      if (imageFile) {
        mediaUrl = await uploadImage(imageFile);
      }

      // Create date info object
      const dateInfo: DateInfo = {
        type: formData.dateType,
        ...(formData.dateType === 'single' && formData.singleDate && { singleDate: formData.singleDate }),
        ...(formData.dateType === 'interval' && formData.startDate && { startDate: formData.startDate }),
        ...(formData.dateType === 'interval' && formData.endDate && { endDate: formData.endDate }),
        ...(formData.dateType === 'undated' && formData.approximateText && { approximateText: formData.approximateText })
      };

      const updates: Partial<CreateArchiveEntry> = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        author: formData.author.trim(),
        mediaType: formData.mediaType,
        dateInfo,
        ...(mediaUrl && { mediaUrl })
      };

      await updateArchiveEntry(entry.id, updates);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update archive entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-amber-500/30 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="font-medieval-brand text-3xl mb-6 text-center">Edit Archive Entry</h2>
        
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

          {/* Author */}
          <div>
            <label className="block text-amber-500 mb-2">Your Name *</label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              required
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
              placeholder="Enter your name..."
            />
          </div>

          {/* Media */}
          <MediaSelector
            mediaType={formData.mediaType}
            mediaUrl={formData.mediaUrl}
            onFieldChange={handleMediaFieldChange}
            onImageUpload={handleImageUpload}
            error={error && formData.mediaType === 'video' ? error : ''}
          />
          {formData.mediaType === 'image' && entry.mediaUrl && entry.mediaType === 'image' && (
            <p className="text-sm text-amber-400 mt-1">Current image will be replaced if you upload a new one.</p>
          )}

          {/* Date */}
          <DateSelector
            dateType={formData.dateType}
            singleDate={formData.singleDate}
            startDate={formData.startDate}
            endDate={formData.endDate}
            approximateText={formData.approximateText}
            onFieldChange={handleInputChange}
          />

          {/* Error Message */}
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
              {isSubmitting ? 'Updating...' : 'Update Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
