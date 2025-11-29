import { useSession, signIn } from 'next-auth/react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { getStaticPropsWithTranslations } from '@/features/infrastructure/lib/getStaticProps';
import BlogPost from '@/features/modules/blog/components/BlogPost';
import { MDXRemote } from 'next-mdx-remote';
import EntryFormModal from '@/features/modules/entries/components/EntryFormModal';
import ScheduleGameForm from '@/features/modules/scheduled-games/components/ScheduleGameForm';
import { isAdmin } from '@/features/infrastructure/utils/userRoleUtils';
import { timestampToIso } from '@/features/infrastructure/utils/timestampUtils';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';
import type { GetStaticProps } from 'next';
import type { Entry } from '@/types/entry';
import type { CreateScheduledGame } from '@/features/modules/games/types';
import { Button } from '@/features/infrastructure/components/ui';
import YouTubeEmbed from '@/features/modules/archives/components/YouTubeEmbed';
import TwitchClipEmbed from '@/features/modules/archives/components/TwitchClipEmbed';
import { extractYouTubeId, extractTwitchClipId } from '@/features/infrastructure/lib/archiveService';
import { HomeTimeline } from '@/features/modules/archives/components';

const pageNamespaces = ["common"];

type HomeProps = {
  translationNamespaces?: string[];
  latestEntry?: Entry | null;
  mdxSource?: MDXRemoteSerializeResult | null;
};

export default function Home({ latestEntry, mdxSource }: HomeProps) {
  const { data: session, status } = useSession();
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [isSubmittingSchedule, setIsSubmittingSchedule] = useState(false);
  const [userIsAdmin, setUserIsAdmin] = useState(false);

  // Fetch user role to check if admin
  useEffect(() => {
    let isMounted = true;

    const fetchUserRole = async () => {
      if (status !== 'authenticated' || !session?.discordId) {
        if (isMounted) {
          setUserIsAdmin(false);
        }
        return;
      }

      try {
        const response = await fetch('/api/user/me');
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const userData = await response.json();
        if (isMounted) {
          setUserIsAdmin(isAdmin(userData?.data?.role));
        }
      } catch {
        if (isMounted) {
          setUserIsAdmin(false);
        }
      }
    };

    fetchUserRole();

    return () => {
      isMounted = false;
    };
  }, [status, session?.discordId]);

  const formatDate = (dateString: string) => {
    try {
      // Extract just YYYY-MM-DD from ISO string
      return dateString.split('T')[0];
    } catch {
      return dateString;
    }
  };

  const handleCreateEntry = () => {
    if (status !== 'authenticated') {
      signIn('discord');
      return;
    }
    setShowEntryForm(true);
  };

  const handleScheduleClick = () => {
    if (status !== 'authenticated') {
      signIn('discord');
      return;
    }
    setShowScheduleForm(true);
  };

  const handleScheduleSubmit = async (gameData: CreateScheduledGame, addCreatorToParticipants: boolean) => {
    try {
      setIsSubmittingSchedule(true);

      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...gameData,
          gameState: 'scheduled',
          addCreatorToParticipants,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to schedule game');
      }

      setShowScheduleForm(false);
      // Revalidate the homepage to show the new game
      try {
        await fetch('/api/revalidate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ path: '/' }),
        });
      } catch (revalidateError) {
        console.error('Failed to revalidate homepage:', revalidateError);
      }
      // Force a full page reload to fetch the revalidated page
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (err) {
      console.error('Failed to schedule game:', err);
      throw err;
    } finally {
      setIsSubmittingSchedule(false);
    }
  };

  const handleScheduleCancel = () => {
    setShowScheduleForm(false);
  };

  const handleEntrySuccess = () => {
    setShowEntryForm(false);
    // Force a full page reload to fetch the revalidated page
    setTimeout(() => {
      window.location.href = '/';
    }, 500);
  };

  const handleEntryCancel = () => {
    setShowEntryForm(false);
  };


  return (
    <div className="flex justify-center min-h-[calc(100vh-8rem)]">
      <div className="w-full px-6 py-12 max-w-4xl">
        {/* Login Message - Only visible to non-authenticated users */}
        {status !== 'authenticated' && (
          <div className="mb-8 p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg">
            <p className="text-amber-300 text-center font-medium">
              Log in to post, schedule games and archive memories!
            </p>
          </div>
        )}

        {/* Latest Entry */}
        {latestEntry && mdxSource && (
          <BlogPost 
            title={latestEntry.title} 
            date={formatDate(latestEntry.date)} 
            author={latestEntry.creatorName}
          >
            <div className="prose prose-invert max-w-none">
              {latestEntry.contentType === 'memory' && (
                <>
                  {latestEntry.images && latestEntry.images.length > 0 && (
                    <div className="mb-4 relative w-full aspect-video rounded-lg overflow-hidden">
                      <Image 
                        src={latestEntry.images[0]} 
                        alt={latestEntry.title} 
                        fill
                        className="object-cover rounded-lg"
                        sizes="100vw"
                        // Unoptimized for Firebase Storage URLs: Next.js cannot optimize authenticated
                        // external URLs. Images are already compressed on upload.
                        unoptimized={latestEntry.images[0].includes('firebasestorage.googleapis.com')}
                      />
                    </div>
                  )}
                  {latestEntry.videoUrl && (() => {
                    const youtubeId = extractYouTubeId(latestEntry.videoUrl);
                    const twitchId = extractTwitchClipId(latestEntry.videoUrl);
                    
                    if (youtubeId) {
                      return (
                        <div className="mb-4">
                          <YouTubeEmbed url={latestEntry.videoUrl} title={latestEntry.title} />
                        </div>
                      );
                    } else if (twitchId) {
                      return (
                        <div className="mb-4">
                          <TwitchClipEmbed url={latestEntry.videoUrl} title={latestEntry.title} />
                        </div>
                      );
                    } else {
                      // Fallback for other video URLs
                      return (
                        <div className="mb-4">
                          <iframe
                            src={latestEntry.videoUrl}
                            className="w-full aspect-video rounded-lg"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      );
                    }
                  })()}
                  {latestEntry.twitchClipUrl && (
                    <div className="mb-4">
                      <TwitchClipEmbed url={latestEntry.twitchClipUrl} title={latestEntry.title} />
                    </div>
                  )}
                </>
              )}
              <MDXRemote {...mdxSource} />
            </div>
          </BlogPost>
        )}

        {/* Action Buttons - Only visible to authenticated users */}
        {status === 'authenticated' && (
          <div className="mt-12 mb-8 flex flex-wrap justify-end gap-3">
            <Button
              type="button"
              onClick={handleCreateEntry}
              className="bg-amber-600 hover:bg-amber-500 text-white"
            >
              Create Entry
            </Button>
            <Button
              type="button"
              onClick={handleScheduleClick}
              className="bg-amber-600 hover:bg-amber-500 text-white"
            >
              Schedule a game
            </Button>
          </div>
        )}

        {/* Timeline - Unified view of games, posts, and memories */}
        <div className="mt-12">
          <HomeTimeline />
        </div>

        {/* Schedule Game Form Modal */}
        {showScheduleForm && (
          <ScheduleGameForm
            onSubmit={handleScheduleSubmit}
            onCancel={handleScheduleCancel}
            isSubmitting={isSubmittingSchedule}
            userIsAdmin={userIsAdmin}
          />
        )}

        {/* Entry Form Modal */}
        {showEntryForm && (
          <EntryFormModal
            onSuccess={handleEntrySuccess}
            onCancel={handleEntryCancel}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Remove undefined values from an object recursively for JSON serialization
 */
function removeUndefined<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(removeUndefined) as unknown as T;
  }
  
  if (typeof obj === 'object') {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = removeUndefined(value);
      }
    }
    return cleaned as T;
  }
  
  return obj;
}

export const getStaticProps: GetStaticProps<HomeProps> = async ({ locale }) => {
  const withI18n = getStaticPropsWithTranslations(pageNamespaces);
  const i18nResult = await withI18n({ locale: locale as string });
  const [{ getAllEntriesServer }] = await Promise.all([
    import('@/features/modules/entries/lib/entryService.server'),
  ]);
  
  try {
    // Only fetch entries for the latest blog post
    const allEntries = await getAllEntriesServer().catch((err) => {
      console.error('Failed to fetch entries:', err);
      return [];
    });

    // Sanitize entries to remove undefined values
    const sanitizedEntries = allEntries.map(removeUndefined) as Entry[];
    
    // Get latest entry (post) for display
    const latestEntry = sanitizedEntries
      .filter(e => e.contentType === 'post')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] || null;
    
    // Serialize latest entry content if exists
    let mdxSource: MDXRemoteSerializeResult | null = null;
    if (latestEntry) {
      const { serialize } = await import('next-mdx-remote/serialize');
      mdxSource = await serialize(latestEntry.content);
    }

    // Build props object
    const props: HomeProps = {
      ...(i18nResult.props || {}),
      translationNamespaces: pageNamespaces,
      latestEntry: latestEntry ? removeUndefined(latestEntry) : null,
      mdxSource,
    };

    return {
      props,
      // Revalidate every 60 seconds to allow posts to update
      revalidate: 60,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Failed to load latest entry:', errorMessage);
    // Return empty props if there's an error
    return {
      props: {
        ...(i18nResult.props || {}),
        translationNamespaces: pageNamespaces,
      },
      revalidate: 60,
    };
  }
};
