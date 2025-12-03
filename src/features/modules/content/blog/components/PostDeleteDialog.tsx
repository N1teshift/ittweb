import React from 'react';
import { useModalAccessibility } from '@/features/infrastructure/hooks';

interface PostDeleteDialogProps {
  isOpen: boolean;
  postTitle?: string;
  isLoading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function PostDeleteDialog({
  isOpen,
  postTitle,
  isLoading = false,
  error,
  onConfirm,
  onCancel,
}: PostDeleteDialogProps) {
  const modalRef = useModalAccessibility({
    isOpen,
    onClose: onCancel,
    trapFocus: true,
    focusOnOpen: true,
  });

  if (!isOpen) return null;

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center px-4" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="delete-dialog-title"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
        data-testid="backdrop"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-md rounded-lg border border-amber-500/40 bg-gray-900/95 backdrop-blur-md p-6 shadow-2xl animate-scale-in">
        <div className="mb-4">
          <h3 id="delete-dialog-title" className="text-2xl font-semibold text-white font-medieval">Delete Post?</h3>
          <p className="mt-2 text-sm text-gray-300">
            {postTitle
              ? `"${postTitle}" will be permanently deleted. This action cannot be undone.`
              : 'This post will be permanently deleted. This action cannot be undone.'}
          </p>
          {error && (
            <div className="mt-3 rounded-md border border-red-500/40 bg-red-900/20 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}
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


