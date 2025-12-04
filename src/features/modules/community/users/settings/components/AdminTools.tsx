interface AdminToolsProps {
  onWipeTestDataClick: () => void;
  onWipeEntriesClick: () => void;
  wipeSuccess: string | null;
  wipeEntriesSuccess: string | null;
}

export function AdminTools({
  onWipeTestDataClick,
  onWipeEntriesClick,
  wipeSuccess,
  wipeEntriesSuccess,
}: AdminToolsProps) {
  return (
    <div className="pt-6 border-t border-amber-500/20 space-y-4">
      <h3 className="text-lg font-semibold text-white">Admin Tools</h3>

      {/* Success Messages */}
      {wipeSuccess && (
        <div className="rounded-md border border-green-500/40 bg-green-900/20 px-4 py-3 text-sm text-green-200">
          {wipeSuccess}
        </div>
      )}
      {wipeEntriesSuccess && (
        <div className="rounded-md border border-green-500/40 bg-green-900/20 px-4 py-3 text-sm text-green-200">
          {wipeEntriesSuccess}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onWipeTestDataClick}
          className="px-4 py-2 text-sm rounded-md bg-orange-800 hover:bg-orange-700 text-white transition-colors border border-orange-600"
        >
          Wipe Test Data
        </button>
        <button
          onClick={onWipeEntriesClick}
          className="px-4 py-2 text-sm rounded-md bg-red-800 hover:bg-red-700 text-white transition-colors border border-red-600"
        >
          Wipe All Entries
        </button>
      </div>
      <p className="text-xs text-gray-500">
        <strong>Wipe Test Data:</strong> Deletes all games, player stats, and associated archive entries. Use only for development/testing.
      </p>
      <p className="text-xs text-gray-500">
        <strong>Wipe All Entries:</strong> Deletes all entries (posts and memories) from Firestore and all archived photos from Firebase Storage. This action cannot be undone.
      </p>
    </div>
  );
}

