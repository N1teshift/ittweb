import React, { useState } from 'react';
import { extractYouTubeId } from '@/lib/archiveService';

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

  return (
    <div className="mb-4">
      <div className="relative w-full h-64 rounded-lg overflow-hidden border border-amber-500/30">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=0`}
          title={title}
          className="w-full h-full"
          frameBorder="0"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          loading="lazy"
          sandbox="allow-same-origin allow-scripts allow-presentation"
          onError={() => setHasError(true)}
          onLoad={() => setHasError(false)}
        />
      </div>
    </div>
  );
}
