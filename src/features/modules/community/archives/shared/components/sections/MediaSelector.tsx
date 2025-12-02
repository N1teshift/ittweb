import React from 'react';

interface MediaSelectorProps {
  videoUrl: string; // YouTube or Twitch URL
  onVideoUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void; // Combined handler for images and replays
  videoError?: string;
  showHeader?: boolean;
}

export default function MediaSelector({
  videoUrl,
  onVideoUrlChange,
  onFileUpload,
  videoError,
  showHeader = true,
}: MediaSelectorProps) {
  return (
    <div>
      {showHeader && (
        <label className="block text-amber-500 mb-2">Media (Optional)</label>
      )}

      {/* Combined File Upload (Images and Replays) */}
      <div className="mt-3">
        <label className="block text-amber-500 mb-2">Upload Images or Replay</label>
        <input
          type="file"
          accept="image/*,.w3g"
          onChange={onFileUpload}
          multiple
          className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
        />
        <p className="text-sm text-gray-400 mt-1">
          Images: Max 5MB each (over 2MB will be compressed). Replays: .w3g files, max 50MB.
        </p>
      </div>

      {/* Video URL (YouTube or Twitch) */}
      <div className="mt-6">
        <label className="block text-amber-500 mb-2">Video URL (YouTube or Twitch)</label>
        <input
          type="url"
          name="videoUrl"
          value={videoUrl}
          onChange={onVideoUrlChange}
          className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
          placeholder="https://www.youtube.com/watch?v=... or https://clips.twitch.tv/..."
        />
        {videoError && <p className="text-sm text-red-400 mt-2">{videoError}</p>}
      </div>
    </div>
  );
}


