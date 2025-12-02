import React, { memo } from 'react';

interface ArchivesEmptyStateProps {
  isAuthenticated: boolean;
  onAddClick: () => void;
  onSignInClick: () => void;
}

const ArchivesEmptyState: React.FC<ArchivesEmptyStateProps> = memo(({
  isAuthenticated,
  onAddClick,
  onSignInClick,
}) => {
  return (
    <div className="text-center py-12">
      <div className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-8">
        <h3 className="font-medieval-brand text-2xl mb-4 text-amber-400">
          No Archives Yet
        </h3>
        <p className="text-gray-300 mb-6">
          Be the first to contribute to our archives! 
          Share your memories, screenshots, or videos from your Island Troll Tribes experience.
        </p>
        {isAuthenticated ? (
          <button
            onClick={onAddClick}
            className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2 rounded border border-amber-500 transition-colors"
          >
            Add First Entry
          </button>
        ) : (
          <button
            onClick={onSignInClick}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded border border-indigo-500 transition-colors"
          >
            Sign in with Discord to add the first entry
          </button>
        )}
      </div>
    </div>
  );
});

ArchivesEmptyState.displayName = 'ArchivesEmptyState';

export default ArchivesEmptyState;


