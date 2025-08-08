import React from 'react';

interface MediaSelectorProps {
  mediaType: 'image' | 'video' | 'none';
  mediaUrl: string;
  onFieldChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

export default function MediaSelector({ mediaType, mediaUrl, onFieldChange, onImageUpload, error }: MediaSelectorProps) {
  return (
    <div>
      <label className="block text-amber-500 mb-2">Media (Optional)</label>
      <div className="space-y-3">
        <label className="flex items-center">
          <input
            type="radio"
            name="mediaType"
            value="none"
            checked={mediaType === 'none'}
            onChange={onFieldChange}
            className="mr-2"
          />
          No media
        </label>

        <label className="flex items-center">
          <input
            type="radio"
            name="mediaType"
            value="image"
            checked={mediaType === 'image'}
            onChange={onFieldChange}
            className="mr-2"
          />
          Upload image
        </label>

        <label className="flex items-center">
          <input
            type="radio"
            name="mediaType"
            value="video"
            checked={mediaType === 'video'}
            onChange={onFieldChange}
            className="mr-2"
          />
          YouTube video
        </label>
      </div>

      {mediaType === 'image' && (
        <div className="mt-3">
          <label className="block text-amber-500 mb-2">Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={onImageUpload}
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
          />
          <p className="text-sm text-gray-400 mt-1">Max size: 5MB. Images over 2MB will be compressed.</p>
        </div>
      )}

      {mediaType === 'video' && (
        <div className="mt-3">
          <label className="block text-amber-500 mb-2">YouTube URL</label>
          <input
            type="url"
            name="mediaUrl"
            value={mediaUrl}
            onChange={onFieldChange}
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
            placeholder="https://www.youtube.com/watch?v=..."
          />
          {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
        </div>
      )}
    </div>
  );
}
