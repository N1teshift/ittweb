import React, { memo } from 'react';
import { ArchiveEntry } from '@/types/archive';
import TimelineSection from './sections/TimelineSection';
import { 
  ArchivesEmptyState,
  ArchivesLoadingState,
  ArchivesErrorState,
} from './index';

interface ArchivesContentProps {
  loading: boolean;
  error: string | null;
  entries: ArchiveEntry[];
  datedEntries: ArchiveEntry[];
  undatedEntries: ArchiveEntry[];
  isAuthenticated: boolean;
  canManageEntries: boolean;
  canDeleteEntry?: (entry: ArchiveEntry) => boolean;
  onEdit: (entry: ArchiveEntry) => void;
  onRequestDelete: (entry: ArchiveEntry) => void;
  onImageClick: (url: string, title: string) => void;
  onAddClick: () => void;
  onSignInClick: () => void;
}

const ArchivesContent: React.FC<ArchivesContentProps> = memo(({
  loading,
  error,
  entries,
  datedEntries,
  undatedEntries,
  isAuthenticated,
  canManageEntries,
  canDeleteEntry,
  onEdit,
  onRequestDelete,
  onImageClick,
  onAddClick,
  onSignInClick,
}) => {
  const resolveCanDelete = (entry: ArchiveEntry) => {
    if (canManageEntries) {
      return true;
    }
    if (canDeleteEntry) {
      return canDeleteEntry(entry);
    }
    return false;
  };

  return (
    <div className="max-w-4xl mx-auto px-6">
      {/* Error Message */}
      {error && <ArchivesErrorState error={error} />}

      {/* Loading State */}
      {loading && <ArchivesLoadingState />}

      {/* Timeline */}
      {!loading && (
        <div className="pb-12">
          <TimelineSection 
            title="Timeline"
            entries={datedEntries}
            onEdit={isAuthenticated ? onEdit : undefined}
            onDelete={onRequestDelete}
            canDeleteEntry={resolveCanDelete}
            onImageClick={onImageClick}
          />

          <TimelineSection 
            title="Undated Archives"
            titleClassName="text-gray-400"
            entries={undatedEntries}
            onEdit={isAuthenticated ? onEdit : undefined}
            onDelete={onRequestDelete}
            canDeleteEntry={resolveCanDelete}
            onImageClick={onImageClick}
          />

          {/* Empty State */}
          {entries.length === 0 && !loading && (
            <ArchivesEmptyState 
              isAuthenticated={isAuthenticated}
              onAddClick={onAddClick}
              onSignInClick={onSignInClick}
            />
          )}
        </div>
      )}
    </div>
  );
});

ArchivesContent.displayName = 'ArchivesContent';

export default ArchivesContent;
