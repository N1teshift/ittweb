import React, { useState } from 'react';
import { extractYouTubeId } from '@/features/modules/community/archives/services';

interface YouTubeEmbedProps {
  url: string;
  title: string;
}

export default function YouTubeEmbed({ url, title }: YouTubeEmbedProps) {
  const [hasError, setHasError] = useState(false);
  const videoId = extractYouTubeId(url);

  if (!videoId) {
    return (
      <div className="mb-4">
        <div className="w-full h-64 bg-gray-800 rounded-lg border border-red-500/30 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <p className="text-sm">Invalid YouTube URL</p>
            <p className="text-xs mt-1">{url}</p>
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="mb-4">
        <div className="w-full h-64 bg-gray-800 rounded-lg border border-amber-500/30 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <p className="text-sm">Video unavailable</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-500 hover:text-amber-400 text-xs mt-2 block"
            >
              Watch on YouTube
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Use privacy-enhanced mode (youtube-nocookie.com) to reduce tracking
  // Add parameters to disable tracking and reduce third-party script errors
  const embedParams = new URLSearchParams({
    rel: '0', // Don't show related videos
    modestbranding: '1', // Hide YouTube logo
    enablejsapi: '0', // Disable JavaScript API (reduces tracking)
    fs: '0', // Disable fullscreen button (reduces tracking)
    iv_load_policy: '3', // Hide video annotations
    playsinline: '1', // Play inline on mobile
    showinfo: '0', // Hide video info (deprecated but harmless)
  });

  return (
    <div className="mb-4">
      <div className="relative w-full h-64 rounded-lg overflow-hidden border border-amber-500/30">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?${embedParams.toString()}`}
          title={title}
          className="w-full h-full"
          frameBorder="0"
          allow="clipboard-write; encrypted-media; picture-in-picture"
          allowFullScreen
          loading="lazy"
          onError={() => setHasError(true)}
          onLoad={() => setHasError(false)}
        />
      </div>
    </div>
  );
}


