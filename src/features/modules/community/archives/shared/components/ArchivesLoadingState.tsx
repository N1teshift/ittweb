import React, { memo } from 'react';

const ArchivesLoadingState: React.FC = memo(() => {
  return (
    <div className="text-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
      <p className="text-gray-400">Loading archives...</p>
    </div>
  );
});

ArchivesLoadingState.displayName = 'ArchivesLoadingState';

export default ArchivesLoadingState;


