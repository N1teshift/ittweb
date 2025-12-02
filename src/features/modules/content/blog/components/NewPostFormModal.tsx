import { useSession } from 'next-auth/react';
import { useNewPostForm } from '../hooks/useNewPostForm';

interface NewPostFormModalProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function NewPostFormModal({ onSuccess, onCancel }: NewPostFormModalProps) {
  const { status } = useSession();
  const {
    formState,
    isSubmitting,
    errorMessage,
    successMessage,
    canSubmit,
    handleFieldChange,
    handleSubmit,
    handleReset,
  } = useNewPostForm(onSuccess);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-amber-500/30 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-medieval-brand text-amber-400">Create Post</h2>
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {status === 'unauthenticated' && (
          <div className="mb-6 rounded-md border border-amber-500/30 bg-black/30 p-4 text-sm text-gray-200">
            Please sign in with Discord to create a post.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="grid gap-6 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-gray-200">
              Title
              <input
                type="text"
                name="title"
                value={formState.title}
                onChange={handleFieldChange}
                placeholder="Patch 1.2 Highlights"
                className="rounded-md border border-amber-500/30 bg-black/40 px-3 py-2 text-white placeholder:text-gray-500 focus:border-amber-400 focus:outline-none"
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-gray-200">
              Slug
              <input
                type="text"
                name="slug"
                value={formState.slug}
                onChange={handleFieldChange}
                placeholder="patch-1-2-highlights"
                className="rounded-md border border-amber-500/30 bg-black/40 px-3 py-2 text-white placeholder:text-gray-500 focus:border-amber-400 focus:outline-none"
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-gray-200">
              Date
              <input
                type="date"
                name="date"
                value={formState.date}
                onChange={handleFieldChange}
                className="rounded-md border border-amber-500/30 bg-black/40 px-3 py-2 text-white placeholder:text-gray-500 focus:border-amber-400 focus:outline-none"
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-gray-200">
              Excerpt (optional)
              <input
                type="text"
                name="excerpt"
                value={formState.excerpt}
                onChange={handleFieldChange}
                placeholder="A quick summary that appears in previews"
                className="rounded-md border border-amber-500/30 bg-black/40 px-3 py-2 text-white placeholder:text-gray-500 focus:border-amber-400 focus:outline-none"
              />
            </label>
          </div>

          <label className="flex flex-col gap-2 text-sm font-medium text-gray-200">
            Content
            <textarea
              name="content"
              value={formState.content}
              onChange={handleFieldChange}
              placeholder="Write your post content in Markdown..."
              rows={12}
              className="rounded-md border border-amber-500/30 bg-black/40 px-3 py-2 text-white placeholder:text-gray-500 focus:border-amber-400 focus:outline-none"
              required
            />
          </label>

          <label className="flex items-center gap-3 text-sm text-gray-200">
            <input
              type="checkbox"
              name="published"
              checked={formState.published}
              onChange={handleFieldChange}
              className="h-4 w-4 rounded border-amber-500/40 bg-black/40 text-amber-400 focus:ring-amber-400"
            />
            Publish immediately
          </label>

          {errorMessage && (
            <div className="rounded-md border border-red-500/40 bg-red-900/20 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="rounded-md border border-green-500/40 bg-green-900/20 px-4 py-3 text-sm text-green-200">
              {successMessage}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={!canSubmit || status === 'loading' || isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-500 rounded-md transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


