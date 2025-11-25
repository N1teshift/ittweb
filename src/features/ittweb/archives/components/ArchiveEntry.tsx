import React, { useState } from 'react';
import type { ArchiveEntry } from '@/types/archive';
import { extractYouTubeId } from '@/features/shared/lib/archiveService';
import { normalizeSectionOrder } from '@/features/ittweb/archives/utils/archiveFormUtils';
import YouTubeEmbed from './YouTubeEmbed';
import TwitchClipEmbed from './TwitchClipEmbed';
import Image from 'next/image';

type EntrySection = 'images' | 'video' | 'twitch' | 'replay' | 'text';

interface ArchiveEntryProps {
  entry: ArchiveEntry;
  onEdit?: (entry: ArchiveEntry) => void;
  onDelete?: (entry: ArchiveEntry) => void;
  canDelete?: boolean;
  onImageClick?: (url: string, title: string) => void;
}

export default function ArchiveEntry({ entry, onEdit, onDelete, canDelete, onImageClick }: ArchiveEntryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 300; // Characters to show before truncating
  const shouldTruncate = entry.content.length > maxLength;
  const displayText = isExpanded ? entry.content : entry.content.slice(0, maxLength) + '...';

  const formatDate = (dateInfo: ArchiveEntry['dateInfo']) => {
    switch (dateInfo.type) {
      case 'single':
        return dateInfo.singleDate ? new Date(dateInfo.singleDate).toLocaleDateString() : 'Unknown';
      case 'interval':
        const start = dateInfo.startDate ? new Date(dateInfo.startDate).toLocaleDateString() : 'Unknown';
        const end = dateInfo.endDate ? new Date(dateInfo.endDate).toLocaleDateString() : 'Unknown';
        return `${start} - ${end}`;
      case 'undated':
        return dateInfo.approximateText || 'Undated';
      default:
        return 'Unknown';
    }
  };

  const renderSectionedMediaAndText = () => {
    const imageUrls: string[] =
      entry.images && entry.images.length > 0
        ? entry.images
        : entry.mediaType === 'image' && entry.mediaUrl
        ? [entry.mediaUrl]
        : [];

    const video: string | undefined = entry.videoUrl || (entry.mediaType === 'video' ? entry.mediaUrl : undefined);
    const replay: string | undefined = entry.replayUrl || (entry.mediaType === 'replay' ? entry.mediaUrl : undefined);

    const order: EntrySection[] = normalizeSectionOrder(entry.sectionOrder as EntrySection[] | undefined);

    return (
      <div className="space-y-4">
        {order.map((section: EntrySection, idx: number) => {
          if (section === 'images' && imageUrls.length > 0) {
            return (
              <div key={`section-images-${idx}`} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {imageUrls.map((url: string, i: number) => (
                  <div
                    key={url + i}
                    className="relative w-full rounded-lg border border-amber-500/30 overflow-hidden cursor-pointer hover:border-amber-500/50 transition-colors"
                    onClick={() => onImageClick ? onImageClick(url, entry.title) : undefined}
                  >
                    <Image
                      src={url}
                      alt={entry.title}
                      width={800}
                      height={600}
                      className="w-full h-auto max-h-96 object-contain"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      unoptimized={url.includes('firebasestorage.googleapis.com')}
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm opacity-0 hover:opacity-100 transition-opacity">
                        Click to enlarge
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          }

          if (section === 'video' && video) {
            return (
              <div key={`section-video-${idx}`}>
                <YouTubeEmbed url={video} title={entry.title} />
              </div>
            );
          }

          if (section === 'twitch' && entry.twitchClipUrl) {
            return (
              <div key={`section-twitch-${idx}`}>
                <TwitchClipEmbed url={entry.twitchClipUrl} title={entry.title} />
              </div>
            );
          }

          if (section === 'replay' && replay) {
            return (
              <div key={`section-replay-${idx}`}>
                <a
                  href={replay}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 underline"
                >
                  Download replay (.w3g)
                </a>
              </div>
            );
          }

          if (section === 'text') {
            return (
              <div key={`section-text-${idx}`} className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {displayText}
                  {shouldTruncate && (
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="ml-2 text-amber-400 hover:text-amber-300 underline font-medium transition-colors"
                    >
                      {isExpanded ? 'Show Less' : 'Show More'}
                    </button>
                  )}
                </p>
              </div>
            );
          }

          return null;
        })}
      </div>
    );
  };

  const getDateBadgeColor = () => {
    switch (entry.dateInfo.type) {
      case 'undated':
        return 'bg-gray-600 text-gray-300';
      case 'interval':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-amber-600 text-white';
    }
  };

  return (
    <div className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-6 mb-6 hover:border-amber-500/50 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medieval-brand text-2xl text-amber-400">
          {entry.title}
        </h3>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDateBadgeColor()}`}>
            {formatDate(entry.dateInfo)}
          </span>
        </div>
      </div>

      {/* Media and Text in Saved Order */}
      {renderSectionedMediaAndText()}

             {/* Footer */}
       <div className="mt-4 pt-4 border-t border-amber-500/20">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>
            Added by {entry.author} on {new Date(entry.createdAt).toLocaleDateString()}
          </span>
          <div className="flex items-center gap-3">
            {onEdit && (
              <button
                onClick={() => onEdit(entry)}
                className="text-amber-400 hover:text-amber-300 underline font-medium transition-colors"
              >
                Edit
              </button>
            )}
            {canDelete && onDelete && (
              <button
                onClick={() => onDelete(entry)}
                className="text-red-400 hover:text-red-300 underline font-medium transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
