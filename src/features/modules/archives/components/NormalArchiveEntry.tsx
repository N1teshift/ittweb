import React from 'react';
import { timestampToIso } from '@/features/infrastructure/utils/timestampUtils';
import type { ArchiveEntry } from '@/types/archive';
import { formatArchiveDate, getDateBadgeColor } from './ArchiveEntryUtils';
import { ArchiveMediaSections } from './ArchiveMediaSections';

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
  return (
    <div className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-6 mb-6 hover:border-amber-500/50 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medieval-brand text-2xl text-amber-400">
          {entry.title}
        </h3>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDateBadgeColor(entry.dateInfo)}`}>
            {formatArchiveDate(entry.dateInfo)}
          </span>
        </div>
      </div>

      {/* Media and Text in Saved Order */}
      <ArchiveMediaSections
        entry={entry}
        onImageClick={onImageClick}
        showText={true}
        displayText={displayText}
        onTextExpand={onTextExpand}
        shouldTruncate={shouldTruncate}
        isExpanded={isExpanded}
      />

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-amber-500/20">
        <div className="flex items-center justify-between text-sm text-gray-400"> 
          <span>
            Added by {entry.creatorName} on {new Date(timestampToIso(entry.createdAt)).toLocaleDateString()}
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

