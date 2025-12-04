import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]';
import { getStaticPropsWithTranslations } from '@/features/infrastructure/lib/server';
import BlogPost from '@/features/modules/content/blog/components/BlogPost';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Button, ErrorBoundary } from '@/features/infrastructure/components';
import { getEntryById } from '@/features/modules/game-management/entries/lib/entryService';
import { Entry } from '@/types/entry';
import YouTubeEmbed from '@/features/modules/community/archives/media/components/YouTubeEmbed';
import TwitchClipEmbed from '@/features/modules/community/archives/media/components/TwitchClipEmbed';
import { extractYouTubeId, extractTwitchClipId } from '@/features/modules/community/archives/services';
import { logError } from '@/features/infrastructure/logging';

const pageNamespaces = ["common"];

type EntryPageProps = {
  entry: Entry;
  content: MDXRemoteSerializeResult;
  canEdit: boolean;
  canDelete: boolean;
};

export default function EntryPage({ entry, content, canEdit, canDelete }: EntryPageProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteClick = () => {
    setDeleteError(null);
    setShowDeleteDialog(true);
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const response = await fetch(`/api/entries/${entry.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Revalidate the homepage
        try {
          await fetch('/api/revalidate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ path: '/' }),
          });
          window.location.href = '/';
        } catch (revalidateError) {
          logError(revalidateError as Error, 'Failed to revalidate homepage', {
            component: 'EntryPage',
            operation: 'handleDeleteConfirm',
            entryId: entry.id,
          });
          router.push('/');
        }
      } else {
        const error = await response.json();
        setDeleteError(error.error || 'Failed to delete entry');
        setIsDeleting(false);
      }
    } catch (error) {
      logError(error as Error, 'Error deleting entry', {
        component: 'EntryPage',
        operation: 'handleDeleteConfirm',
        entryId: entry.id,
      });
      setDeleteError('Failed to delete entry. Please try again.');
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return dateString.split('T')[0];
    } catch {
      return dateString;
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex justify-center min-h-[calc(100vh-8rem)]">
      <div className="w-full px-6 py-12 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center link-amber"
          >
            ← Back to Home
          </Link>

          {(canEdit || canDelete) && (
            <div className="flex items-center gap-3">
              {canEdit && (
                <Button
                  onClick={() => router.push(`/entries/edit/${entry.id}`)}
                  className="text-sm"
                >
                  Edit
                </Button>
              )}
              {canDelete && (
                <Button
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                  className="text-sm bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              )}
            </div>
          )}
        </div>

        <BlogPost title={entry.title} date={formatDate(entry.date)} author={entry.creatorName}>
          <div className="prose prose-invert max-w-none">
            {/* Memory-specific content */}
            {entry.contentType === 'memory' && (
              <>
                {/* Images */}
                {entry.images && entry.images.length > 0 && (
                  <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {entry.images.map((imageUrl, index) => (
                      <div key={index} className="relative w-full aspect-video rounded-lg overflow-hidden">
                        <Image
                          src={imageUrl}
                          alt={`${entry.title} - Image ${index + 1}`}
                          fill
                          className="object-cover rounded-lg"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          // Priority for first image if it's likely to be LCP (above the fold)
                          priority={index === 0 && entry.contentType === 'memory'}
                          // Unoptimized for Firebase Storage URLs: Next.js cannot optimize authenticated
                          // external URLs. Images are already compressed on upload.
                          unoptimized={imageUrl.includes('firebasestorage.googleapis.com')}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Video */}
                {entry.videoUrl && (() => {
                  const youtubeId = extractYouTubeId(entry.videoUrl);
                  const twitchId = extractTwitchClipId(entry.videoUrl);

                  if (youtubeId) {
                    return (
                      <div className="mb-6">
                        <YouTubeEmbed url={entry.videoUrl} title={entry.title} />
                      </div>
                    );
                  } else if (twitchId) {
                    return (
                      <div className="mb-6">
                        <TwitchClipEmbed url={entry.videoUrl} title={entry.title} />
                      </div>
                    );
                  } else {
                    // Fallback for other video URLs
                    return (
                      <div className="mb-6">
                        <iframe
                          src={entry.videoUrl}
                          className="w-full aspect-video rounded-lg"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    );
                  }
                })()}

                {/* Twitch Clip */}
                {entry.twitchClipUrl && (
                  <div className="mb-6">
                    <TwitchClipEmbed url={entry.twitchClipUrl} title={entry.title} />
                  </div>
                )}
              </>
            )}

            {/* Content */}
            <MDXRemote {...content} />
          </div>
        </BlogPost>

        {/* Delete Dialog */}
        {showDeleteDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-amber-500/30 rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-medieval-brand text-amber-400 mb-4">Delete Entry</h2>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete &quot;{entry.title}&quot;? This action cannot be undone.
              </p>
              {deleteError && (
                <div className="mb-4 bg-red-900/50 border border-red-500 rounded p-3 text-red-300">
                  {deleteError}
                </div>
              )}
              <div className="flex gap-4">
                <button
                  onClick={handleDeleteCancel}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-md transition-colors disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </ErrorBoundary>
  );
}

export const getServerSideProps: GetServerSideProps<EntryPageProps> = async (context) => {
  const id = String(context.params?.id || '');
  const withI18n = getStaticPropsWithTranslations(pageNamespaces);
  const i18nResult = await withI18n({ locale: context.locale as string });

  try {
    const entry = await getEntryById(id);

    if (!entry) {
      return {
        notFound: true,
      };
    }

    // Check permissions
    const session = await getServerSession(context.req, context.res, authOptions);
    let canEdit = false;
    let canDelete = false;

    if (session && session.discordId) {
      try {
        const { getUserDataByDiscordIdServer } = await import('@/features/modules/community/users/services/userDataService.server');
        const { isAdmin } = await import('@/features/modules/community/users');
        const userData = await getUserDataByDiscordIdServer(session.discordId);
        const userIsAdmin = isAdmin(userData?.role);
        const userIsAuthor = entry.createdByDiscordId === session.discordId;

        canEdit = userIsAdmin || userIsAuthor;
        canDelete = userIsAdmin || userIsAuthor;
      } catch (error) {
        logError(error as Error, 'Failed to check permissions', {
          component: 'EntryPage',
          operation: 'getServerSideProps',
          entryId: id,
          discordId: session.discordId,
        });
      }
    }

    const mdxSource = await serialize(entry.content, {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'wrap' }]],
        format: 'mdx',
      },
      parseFrontmatter: false,
    });

    // Convert undefined values to null for JSON serialization in getServerSideProps
    // Next.js cannot serialize undefined, so we convert to null
    const serializableEntry = {
      ...entry,
      submittedAt: entry.submittedAt ?? null,
      createdByDiscordId: entry.createdByDiscordId ?? null,
      deletedAt: entry.deletedAt ?? null,
      images: entry.images ?? null,
      videoUrl: entry.videoUrl ?? null,
      twitchClipUrl: entry.twitchClipUrl ?? null,
      sectionOrder: entry.sectionOrder ?? null,
      isDeleted: entry.isDeleted ?? false,
    } as Entry;

    return {
      props: {
        ...(i18nResult.props || {}),
        translationNamespaces: pageNamespaces,
        entry: serializableEntry,
        content: mdxSource,
        canEdit,
        canDelete,
      },
    };
  } catch (error) {
    logError(error as Error, 'Failed to load entry', {
      component: 'EntryPage',
      operation: 'getServerSideProps',
      entryId: id,
    });
    return {
      notFound: true,
    };
  }
};

