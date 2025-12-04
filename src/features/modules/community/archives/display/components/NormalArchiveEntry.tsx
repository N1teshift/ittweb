import React from 'react';
import Image from 'next/image';
import { timestampToIso } from '@/features/infrastructure/utils';
import type { ArchiveEntry } from '@/types/archive';
import YouTubeEmbed from '../../media/components/YouTubeEmbed';
import TwitchClipEmbed from '../../media/components/TwitchClipEmbed';

interface NormalArchiveEntryProps {
  entry: ArchiveEntry;
  onEdit?: (entry: ArchiveEntry) => void;
  onDelete?: (entry: ArchiveEntry) => void;
  canDelete?: boolean;
  onImageClick?: (url: string, title: string) => void;
  displayText: string;
  shouldTruncate: boolean;
  isExpanded: boolean;
  onTextExpand: () => void;
}

export function NormalArchiveEntry({
  entry,
  onEdit,
  onDelete,
  canDelete,
  onImageClick,
  displayText,
  shouldTruncate,
  isExpanded,
  onTextExpand,
}: NormalArchiveEntryProps) {
  // Get entry type label
  // If entryType is 'story', it's a Post
  // If entry ID starts with 'entry-', it came from the entries collection
  //   - If it's not a post (entryType !== 'story'), it's a Memory
  // If entry has media (images/video), it's likely a Memory
  // Otherwise, it's a generic Entry
  const entryTypeLabel = entry.entryType === 'story' ? 'Post' : 
    entry.id.startsWith('entry-') ? 'Memory' : // Entries from entries collection that aren't posts are memories
    (entry.images && entry.images.length > 0) || entry.videoUrl || entry.twitchClipUrl ? 'Memory' :
    'Entry';

  const imageUrls: string[] = entry.images && entry.images.length > 0 ? entry.images : [];
  const video: string | undefined = entry.videoUrl;
  const hasMedia = imageUrls.length > 0 || video || entry.twitchClipUrl;

  const handleTextExpandClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onTextExpand();
  };

  return (
    <div className="bg-gradient-to-br from-black/40 via-amber-950/20 to-black/40 backdrop-blur-sm border-2 border-amber-500/40 rounded-lg p-6 mb-6 hover:border-amber-400/70 hover:shadow-lg hover:shadow-amber-500/20 transition-all relative group">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold text-amber-300">
              {entry.title}
            </h3>
          </div>
        </div>
        <span className="px-3 py-1 text-xs bg-amber-500/30 border border-amber-400/50 rounded text-amber-300 font-medium">
          {entryTypeLabel}
        </span>
      </div>

      {/* Media sections */}
      {hasMedia && (
        <div className="mt-4 pt-4 border-t border-amber-500/20 space-y-3">
          {imageUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {imageUrls.slice(0, 2).map((url: string, i: number) => (
                <div
                  key={url + i}
                  className="relative w-full rounded-lg border border-amber-500/30 overflow-hidden cursor-pointer hover:border-amber-500/50 transition-colors"
                  onClick={() => onImageClick ? onImageClick(url, entry.title) : undefined}
                >
                  <Image
                    src={url}
                    alt={entry.title}
                    width={400}
                    height={300}
                    className="w-full h-auto max-h-32 object-cover"
                    sizes="(max-width: 768px) 50vw, 200px"
                    unoptimized={url.includes('firebasestorage.googleapis.com')}
                  />
                </div>
              ))}
            </div>
          )}
          {video && (
            <div>
              <YouTubeEmbed url={video} title={entry.title} />
            </div>
          )}
          {entry.twitchClipUrl && (
            <div>
              <TwitchClipEmbed url={entry.twitchClipUrl} title={entry.title} />
            </div>
          )}
        </div>
      )}

      {/* Text content */}
      {entry.content && entry.content.trim() && (
        <div className="mt-4 pt-4 border-t border-amber-500/20">
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">
              {displayText}
              {shouldTruncate && (
                <button
                  onClick={handleTextExpandClick}
                  className="ml-2 text-amber-400 hover:text-amber-300 underline font-medium transition-colors"
                >
                  {isExpanded ? 'Show Less' : 'Show More'}
                </button>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Archive metadata */}
      <div className="mt-4 pt-4 border-t-2 border-amber-500/30">
        <div className="flex items-center justify-between text-xs"> 
          <span className="text-gray-400">
            Added by <span className="text-amber-400/80">{entry.creatorName}</span> on {new Date(timestampToIso(entry.createdAt)).toLocaleDateString()}
          </span>
          {(onEdit || (canDelete && onDelete)) && (
            <div className="flex items-center gap-3">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEdit(entry);
                  }}
                  className="text-amber-400 hover:text-amber-300 underline font-medium transition-colors"
                >
                  Edit
                </button>
              )}
              {canDelete && onDelete && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(entry);
                  }}
                  className="text-red-400 hover:text-red-300 underline font-medium transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



