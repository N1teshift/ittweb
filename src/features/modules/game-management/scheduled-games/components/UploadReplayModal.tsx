import React, { useState, FormEvent } from 'react';
import type { Game } from '@/features/modules/game-management/games/types';
import { useModalAccessibility } from '@/features/infrastructure/hooks';

interface ApiResponse {
  success?: boolean;
  error?: string;
  message?: string;
  gameId?: string;
  archiveId?: string;
}

interface UploadReplayModalProps {
  game: Game;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function UploadReplayModal({ game, onClose, onSuccess }: UploadReplayModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'parsing' | 'processing'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const modalRef = useModalAccessibility({
    isOpen: true,
    onClose,
    trapFocus: true,
    focusOnOpen: true,
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a replay file');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccessMessage(null);
      setStatus('uploading');

      const formData = new FormData();
      formData.append('replay', file);

      // Show parsing status after a short delay (upload starts immediately)
      const parsingTimeout = setTimeout(() => {
        setStatus('parsing');
      }, 1000);

      const response = await fetch(`/api/games/${game.id}/upload-replay`, {
        method: 'POST',
        body: formData,
      });

      clearTimeout(parsingTimeout);
      setStatus('processing');

      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload replay');
      }

      setStatus('idle');
      setSuccessMessage(data.message || 'Replay uploaded successfully!');
      setFile(null);

      // Close modal and refresh after a short delay
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      }, 1500);
    } catch (err) {
      setStatus('idle');
      setError(err instanceof Error ? err.message : 'Failed to upload replay');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-replay-title"
    >
      <div className="bg-gray-900 border border-amber-500/30 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 id="upload-replay-title" className="text-2xl font-medieval-brand text-amber-400">Upload Replay</h2>
            <p className="text-sm text-gray-400 mt-1">
              Upload a .w3g replay file to automatically extract game data. The replay will be parsed to extract players, stats, and results.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            aria-label="Close upload replay modal"
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-amber-500 mb-2">Replay File (.w3g) *</label>
            <input
              type="file"
              accept=".w3g"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
              required
            />
            <p className="text-sm text-gray-400 mt-2">
              The replay file will be parsed automatically to extract game data including players, stats, and match results.
            </p>
          </div>

          {/* Status Indicator */}
          {submitting && (
            <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
                </div>
                <div className="flex-1">
                  <p className="text-blue-300 font-medium">
                    {status === 'uploading' && 'Uploading replay file...'}
                    {status === 'parsing' && 'Parsing replay and extracting game data...'}
                    {status === 'processing' && 'Processing and saving game data...'}
                  </p>
                  <p className="text-blue-400 text-sm mt-1">
                    {status === 'uploading' && 'Please wait while we upload your file'}
                    {status === 'parsing' && 'Analyzing replay structure, players, and match results'}
                    {status === 'processing' && 'Creating game record and updating archive'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-900/50 border border-red-500 rounded px-4 py-2 text-red-200">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-900/40 border border-green-500 rounded px-4 py-2 text-green-200">
              {successMessage}
            </div>
          )}

          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              aria-label="Cancel uploading replay"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded disabled:opacity-50"
            >
              {submitting ? 'Uploading...' : 'Upload Replay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


