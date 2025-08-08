import React, { useState } from 'react';
import type { ArchiveEntry } from '@/types/archive';
import { extractYouTubeId } from '@/lib/archiveService';
import YouTubeEmbed from './YouTubeEmbed';
import Image from 'next/image';

interface ArchiveEntryProps {
  entry: ArchiveEntry;
  onEdit?: (entry: ArchiveEntry) => void;
  onImageClick?: (url: string, title: string) => void;
}

export default function ArchiveEntry({ entry, onEdit, onImageClick }: ArchiveEntryProps) {
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

  const renderMedia = () => {
    if (!entry.mediaUrl || entry.mediaType === 'none') return null;

                   if (entry.mediaType === 'image') {
        return (
          <div className="mb-4">
                         <div 
               className="relative w-full rounded-lg border border-amber-500/30 overflow-hidden cursor-pointer hover:border-amber-500/50 transition-colors"
               onClick={() => onImageClick && entry.mediaUrl ? onImageClick(entry.mediaUrl, entry.title) : null}
             >
              <Image
                src={entry.mediaUrl}
                alt={entry.title}
                width={800}
                height={600}
                className="w-full h-auto max-h-96 object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onError={(e) => {
                  // Silently handle image load errors
                }}
              />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm opacity-0 hover:opacity-100 transition-opacity">
                  Click to enlarge
                </div>
              </div>
            </div>
          </div>
        );
      }

    if (entry.mediaType === 'video') {
      return <YouTubeEmbed url={entry.mediaUrl} title={entry.title} />;
    }

    return null;
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
          {entry.dateInfo.type === 'undated' && entry.dateInfo.approximateText && (
            <span className="text-gray-400 text-sm">
              ({entry.dateInfo.approximateText})
            </span>
          )}
        </div>
      </div>

      {/* Media */}
      {renderMedia()}

      {/* Content */}
      <div className="prose prose-invert max-w-none">
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

             {/* Footer */}
       <div className="mt-4 pt-4 border-t border-amber-500/20">
         <div className="flex items-center justify-between text-sm text-gray-400">
           <span>
             Added by {entry.author} on {new Date(entry.createdAt).toLocaleDateString()}
           </span>
           {onEdit && (
             <button
               onClick={() => onEdit(entry)}
               className="text-amber-400 hover:text-amber-300 underline font-medium transition-colors"
             >
               Edit
             </button>
           )}
         </div>
       </div>

     </div>
   );
 }
