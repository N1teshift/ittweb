import React from 'react';

interface DeleteErrorDisplayProps {
  error: string | null;
  onDismiss: () => void;
}

/**
 * Component for displaying delete errors
 */
export function DeleteErrorDisplay({ error, onDismiss }: DeleteErrorDisplayProps) {
  if (!error) return null;

  return (
    <div className="fixed top-20 right-4 bg-red-900/90 border border-red-500 rounded-lg p-4 text-red-300 z-50 max-w-md">
      <div className="flex items-center justify-between">
        <p>{error}</p>
        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-200 ml-4"
          aria-label="Dismiss error"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}



