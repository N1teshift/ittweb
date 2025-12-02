/**
 * Header component for map persistence info and clear button
 */

import React from 'react';

interface MapPersistenceHeaderProps {
  onClear: () => void;
}

export function MapPersistenceHeader({ onClear }: MapPersistenceHeaderProps) {
  return (
    <div className="max-w-2xl mx-auto mb-6 flex items-center justify-between text-sm text-gray-300">
      <span>Uploaded map is saved locally and will persist after refresh.</span>
      <button
        type="button"
        onClick={onClear}
        className="px-2 py-1 rounded border border-amber-500/30 hover:border-amber-400"
      >
        Clear saved
      </button>
    </div>
  );
}


