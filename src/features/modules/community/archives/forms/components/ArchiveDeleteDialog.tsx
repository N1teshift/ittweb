import React from 'react';
import { useModalAccessibility } from '@/features/infrastructure/hooks';

interface ArchiveDeleteDialogProps {
  isOpen: boolean;
  entryTitle?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ArchiveDeleteDialog({
  isOpen,
  entryTitle,
  isLoading = false,
  onConfirm,
  onCancel,
}: ArchiveDeleteDialogProps) {
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
      aria-labelledby="archive-delete-dialog-title"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
      <div className="relative w-full max-w-md rounded-lg border border-amber-500/40 bg-gray-900/95 p-6 shadow-2xl animate-scale-in">
        <div className="mb-4">
          <h3 id="archive-delete-dialog-title" className="text-2xl font-semibold text-white">Delete Entry?</h3>
          <p className="mt-2 text-sm text-gray-300">
            {entryTitle
              ? `Are you sure you want to delete "${entryTitle}"? This action cannot be undone.`
              : 'Are you sure you want to delete this entry? This action cannot be undone.'}
          </p>
        </div>
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-md border border-gray-600 px-4 py-2 text-sm font-medium text-gray-200 transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
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





