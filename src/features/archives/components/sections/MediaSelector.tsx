import React from 'react';

interface MediaSelectorProps {
  mediaUrl: string; // YouTube URL
  onVideoUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void; // supports multiple
  onReplayUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  multipleImages?: boolean;
  videoError?: string;
  showHeader?: boolean;
}

export default function MediaSelector({ mediaUrl, onVideoUrlChange, onImageUpload, onReplayUpload, multipleImages, videoError, showHeader = true }: MediaSelectorProps) {
  return (
    <div>
      {showHeader && (
        <label className="block text-amber-500 mb-2">Media (Optional)</label>
      )}

      {/* Images */}
      <div className="mt-3">
        <label className="block text-amber-500 mb-2">Upload Image(s)</label>
        <input
          type="file"
          accept="image/*"
          onChange={onImageUpload}
          multiple={multipleImages}
          className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
        />
        <p className="text-sm text-gray-400 mt-1">Max size per image: 5MB. Images over 2MB will be compressed.</p>
      </div>

      {/* YouTube */}
      <div className="mt-6">
        <label className="block text-amber-500 mb-2">YouTube URL</label>
        <input
          type="url"
          name="mediaUrl"
          value={mediaUrl}
          onChange={onVideoUrlChange}
          className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
          placeholder="https://www.youtube.com/watch?v=..."
        />
        {videoError && <p className="text-sm text-red-400 mt-2">{videoError}</p>}
      </div>

      {/* Replay */}
      <div className="mt-6">
        <label className="block text-amber-500 mb-2">Upload Replay (.w3g)</label>
        <input
          type="file"
          accept=".w3g"
          onChange={onReplayUpload}
          className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
        />
        <p className="text-sm text-gray-400 mt-1">Max size: 50MB.</p>
      </div>
    </div>
  );
}
