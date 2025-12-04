interface WipeEntriesDialogProps {
  isOpen: boolean;
  isWiping: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function WipeEntriesDialog({
  isOpen,
  isWiping,
  error,
  onConfirm,
  onCancel,
}: WipeEntriesDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
        onClick={() => !isWiping && onCancel()}
      />
      <div className="relative w-full max-w-md rounded-lg border border-red-500/40 bg-gray-900/95 backdrop-blur-md p-6 shadow-2xl">
        <div className="mb-4">
          <h3 className="text-2xl font-semibold text-white mb-2">Wipe All Entries?</h3>
          <p className="mt-2 text-sm text-gray-300">
            This will permanently delete:
          </p>
          <ul className="mt-2 text-sm text-gray-400 list-disc list-inside space-y-1">
            <li>All entries from Firestore (entries and archives collections)</li>
            <li>All archived photos from Firebase Storage (archives/ folder)</li>
            <li>All posts and memories</li>
          </ul>
          <p className="mt-3 text-sm text-red-300 font-semibold">
            ⚠️ This action cannot be undone. All entries and their associated images will be permanently deleted.
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
            disabled={isWiping}
            className="rounded-md border border-gray-600 px-4 py-2 text-sm font-medium text-gray-200 transition-colors hover:bg-gray-700/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isWiping}
            className="rounded-md border border-red-600 bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isWiping ? 'Deleting…' : 'Delete All Entries'}
          </button>
        </div>
      </div>
    </div>
  );
}

