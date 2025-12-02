import React, { memo } from 'react';

interface ArchivesErrorStateProps {
  error: string;
}

const ArchivesErrorState: React.FC<ArchivesErrorStateProps> = memo(({ error }) => {
  return (
    <div className="mb-8">
      <div className="bg-red-900/50 border border-red-500 rounded p-4 text-red-300">
        {error}
      </div>
    </div>
  );
});

ArchivesErrorState.displayName = 'ArchivesErrorState';

export default ArchivesErrorState;


