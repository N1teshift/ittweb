import React from 'react';

interface SortToggleProps {
  sortOrder: 'newest' | 'oldest';
  onChange: (order: 'newest' | 'oldest') => void;
}

export default function SortToggle({ sortOrder, onChange }: SortToggleProps) {
  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      <span className="text-gray-300">Sort by:</span>
      <div className="flex bg-gray-800 rounded-lg border border-gray-600">
        <button
          onClick={() => onChange('newest')}
          className={`px-4 py-2 rounded-l-lg transition-colors ${
            sortOrder === 'newest'
              ? 'bg-amber-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Newest First
        </button>
        <button
          onClick={() => onChange('oldest')}
          className={`px-4 py-2 rounded-r-lg transition-colors ${
            sortOrder === 'oldest'
              ? 'bg-amber-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Oldest First
        </button>
      </div>
    </div>
  );
}


