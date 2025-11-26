import React, { memo } from 'react';
import { useSession } from 'next-auth/react';
import SortToggle from './sections/SortToggle';

interface ArchivesToolbarProps {
  isAuthenticated: boolean;
  entriesCount: number;
  sortOrder: 'newest' | 'oldest';
  onAddClick: () => void;
  onSignInClick: () => void;
  onSortOrderChange: (order: 'newest' | 'oldest') => void;
}

const ArchivesToolbar: React.FC<ArchivesToolbarProps> = memo(({
  isAuthenticated,
  entriesCount,
  sortOrder,
  onAddClick,
  onSignInClick,
  onSortOrderChange,
}) => {
  return (
    <div className="sticky top-16 z-40 bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60 border-y border-amber-500/20">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        {isAuthenticated ? (
          <button
            onClick={onAddClick}
            className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2 rounded-lg border border-amber-500 font-medium transition-colors"
          >
            Become an Archivist
          </button>
        ) : (
          <button
            onClick={onSignInClick}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg border border-indigo-500 font-medium transition-colors"
          >
            Sign in with Discord to contribute
          </button>
        )}
        <div className="ml-auto">
          {entriesCount > 0 && (
            <SortToggle sortOrder={sortOrder} onChange={onSortOrderChange} />
          )}
        </div>
      </div>
    </div>
  );
});

ArchivesToolbar.displayName = 'ArchivesToolbar';

export default ArchivesToolbar;
