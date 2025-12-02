import React from 'react';

interface GameDeleteDialogProps {
  isOpen: boolean;
  gameTitle?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function GameDeleteDialog({
  isOpen,
  gameTitle,
  isLoading = false,
  onConfirm,
  onCancel,
}: GameDeleteDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        aria-hidden="true"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-md rounded-lg border border-amber-500/40 bg-gray-900/95 backdrop-blur-md p-6 shadow-2xl">
        <div className="mb-4">
          <h3 className="text-2xl font-semibold text-white font-medieval-brand">Delete Game?</h3>
          <p className="mt-2 text-sm text-gray-300">
            {gameTitle
              ? `Are you sure you want to delete "${gameTitle}"? This action cannot be undone.`
              : 'Are you sure you want to delete this game? This action cannot be undone.'}
          </p>
        </div>
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-md border border-gray-600 px-4 py-2 text-sm font-medium text-gray-200 transition-colors hover:bg-gray-700/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-md border border-red-600 bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}



