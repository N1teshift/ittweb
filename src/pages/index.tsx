import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { getStaticPropsWithTranslations } from '@/features/shared/lib/getStaticProps';
import BlogPost from '@/features/modules/blog/components/BlogPost';
import { MDXRemote } from 'next-mdx-remote';
import { getAllEntriesServer } from '@/features/modules/entries/lib/entryService.server';
import EntryFormModal from '@/features/modules/entries/components/EntryFormModal';
import ScheduleGameForm from '@/features/modules/scheduled-games/components/ScheduleGameForm';
import { getUserDataByDiscordId } from '@/features/shared/lib/userDataService';
import { isAdmin } from '@/features/shared/utils/userRoleUtils';
import { timestampToIso } from '@/features/infrastructure/utils/timestampUtils';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';
import type { GetStaticProps } from 'next';
import type { Entry } from '@/types/entry';
import type { Game, CreateScheduledGame } from '@/features/modules/games/types';
import { Button } from '@/features/infrastructure/shared/components/ui';

const pageNamespaces = ["common"];

type RecentActivityItem = 
  | { type: 'entry'; data: Entry }
  | { type: 'game'; data: Game };

type HomeProps = {
  translationNamespaces?: string[];
  latestEntry?: Entry | null;
  mdxSource?: MDXRemoteSerializeResult | null;
  recentActivity: RecentActivityItem[];
};

export default function Home({ latestEntry, mdxSource, recentActivity }: HomeProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
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
        const userData = await getUserDataByDiscordId(session.discordId);
        if (isMounted) {
          setUserIsAdmin(isAdmin(userData?.role));
        }
      } catch (error) {
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
      // Reload the page to show the new game in recent activity
      router.reload();
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

  const getActivityDate = (item: RecentActivityItem): string => {
    switch (item.type) {
      case 'entry':
        return item.data.date;
      case 'game':
        if (item.data.gameState === 'scheduled' && item.data.scheduledDateTime) {
          return timestampToIso(item.data.scheduledDateTime);
        }
        if (item.data.gameState === 'completed' && item.data.datetime) {
          return timestampToIso(item.data.datetime);
        }
        return timestampToIso(item.data.createdAt);
      default:
        return new Date().toISOString();
    }
  };

  const getActivityTitle = (item: RecentActivityItem): string => {
    switch (item.type) {
      case 'entry':
        return item.data.title;
      case 'game':
        if (item.data.gameState === 'scheduled') {
          const teamSize = item.data.teamSize === 'custom' ? item.data.customTeamSize : item.data.teamSize;
          return `${teamSize} - ${item.data.gameType === 'elo' ? 'ELO' : 'Normal'} Game #${item.data.gameId}`;
        }
        return item.data.archiveContent?.title || `Game #${item.data.gameId}`;
      default:
        return '';
    }
  };

  const getActivityAuthor = (item: RecentActivityItem): string | undefined => {
    switch (item.type) {
      case 'entry':
        return item.data.creatorName;
      case 'game':
        return item.data.creatorName;
      default:
        return undefined;
    }
  };

  const getActivityUrl = (item: RecentActivityItem): string => {
    switch (item.type) {
      case 'entry':
        return `/entries/${item.data.id}`;
      case 'game':
        return `/games/${item.data.id}`;
      default:
        return '/';
    }
  };

  const getActivityTypeLabel = (item: RecentActivityItem): string => {
    switch (item.type) {
      case 'entry':
        return item.data.contentType === 'post' ? 'Post' : 'Memory';
      case 'game':
        return item.data.gameState === 'scheduled' ? 'Scheduled Game' : 'Game';
      default:
        return '';
    }
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
              {latestEntry.contentType === 'memory' && latestEntry.images && latestEntry.images.length > 0 && (
                <div className="mb-4">
                  <img src={latestEntry.images[0]} alt={latestEntry.title} className="w-full rounded-lg" />
                </div>
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

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div className="mt-8">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-amber-400 font-medieval mb-1">Recent Activity</h2>
              <div className="w-12 h-0.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full opacity-80"></div>
            </div>
            <div className="grid gap-2">
              {recentActivity.map((item) => {
                const title = getActivityTitle(item);
                const author = getActivityAuthor(item);
                const url = getActivityUrl(item);
                const date = getActivityDate(item);
                const typeLabel = getActivityTypeLabel(item);
                const key = item.type === 'entry' 
                  ? `entry-${item.data.id}` 
                  : `game-${item.data.id}`;

                return (
                  <Link
                    key={key}
                    href={url}
                    className="group block"
                  >
                    <div className="bg-black/40 backdrop-blur-sm border border-amber-500/20 rounded p-3 hover:border-amber-500/40 hover:bg-black/50 transition-all duration-300">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1.5">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-semibold text-amber-500/70 uppercase tracking-wide">
                              {typeLabel}
                            </span>
                          </div>
                          <h3 className="text-sm md:text-base font-semibold text-amber-400 group-hover:text-amber-300 transition-colors font-medieval truncate">
                            {title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400 flex-shrink-0">
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3 text-amber-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{formatDate(date)}</span>
                          </div>
                          {author && (
                            <div className="flex items-center gap-1">
                              <svg className="w-3 h-3 text-amber-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span className="text-amber-400/80">{author}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* No activity message */}
        {recentActivity.length === 0 && !mdxSource && (
          <BlogPost title="Latest Update">
            <p className="text-gray-300">No recent activity yet.</p>
          </BlogPost>
        )}

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
  const [{ getAllEntriesServer }, { getGames }] = await Promise.all([
    import('@/features/modules/entries/lib/entryService.server'),
    import('@/features/modules/games/lib/gameService'),
  ]);
  
  try {
    const [allEntries, allGames] = await Promise.all([
      getAllEntriesServer().catch((err) => {
        console.error('Failed to fetch entries:', err);
        return [];
      }),
      getGames({ limit: 100 }).catch((err) => {
        console.error('Failed to fetch games:', err);
        return { games: [], hasMore: false };
      }),
    ]);
    
    console.log('Fetched entries:', allEntries.length);
    console.log('Fetched games:', allGames.games.length);
    
    // Debug: Log entry details
    if (allEntries.length > 0) {
      console.log('Entry details:', allEntries.map(e => ({
        id: e.id,
        title: e.title,
        contentType: e.contentType,
        date: e.date,
        isDeleted: e.isDeleted
      })));
    } else {
      console.log('No entries found - checking if query failed silently');
    }

    // Sanitize entries and games to remove undefined values
    const sanitizedEntries = allEntries.map(removeUndefined) as Entry[];
    const sanitizedGames = allGames.games.map(removeUndefined) as Game[];
    
    console.log('Sanitized entries:', sanitizedEntries.length);

    // Combine all activity items
    const activityItems: RecentActivityItem[] = [
      ...sanitizedEntries.map((entry): RecentActivityItem => ({ type: 'entry', data: entry })),
      ...sanitizedGames.map((game): RecentActivityItem => ({ type: 'game', data: game })),
    ];

    // Sort by date (most recent first)
    // Import timestampToIso for server-side conversion
    const { timestampToIso: serverTimestampToIso } = await import('@/features/infrastructure/utils/timestampUtils');
    const getItemDate = (item: RecentActivityItem): Date => {
      switch (item.type) {
        case 'entry':
          return new Date(item.data.date);
        case 'game':
          if (item.data.gameState === 'scheduled' && item.data.scheduledDateTime) {
            return new Date(serverTimestampToIso(item.data.scheduledDateTime));
          }
          if (item.data.gameState === 'completed' && item.data.datetime) {
            return new Date(serverTimestampToIso(item.data.datetime));
          }
          return new Date(serverTimestampToIso(item.data.createdAt));
        default:
          return new Date(0);
      }
    };

    const sortedActivity = activityItems
      .sort((a, b) => getItemDate(b).getTime() - getItemDate(a).getTime());
    
    console.log('Total activity items:', sortedActivity.length);
    console.log('Activity breakdown:', {
      entries: sortedActivity.filter(a => a.type === 'entry').length,
      games: sortedActivity.filter(a => a.type === 'game').length
    });
    
    // Get latest entry (post) for display
    const latestEntry = sanitizedEntries
      .filter(e => e.contentType === 'post')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] || null;
    
    console.log('Latest entry:', latestEntry ? { id: latestEntry.id, title: latestEntry.title } : 'none');
    
    // Serialize latest entry content if exists
    let mdxSource: MDXRemoteSerializeResult | null = null;
    if (latestEntry) {
      const { serialize } = await import('next-mdx-remote/serialize');
      mdxSource = await serialize(latestEntry.content);
    }

    // Sanitize the final activity array to remove any undefined values
    const sanitizedActivity = sortedActivity.map((item) => {
      return {
        type: item.type,
        data: removeUndefined(item.data),
      } as RecentActivityItem;
    });

    // Build props object
    const props: HomeProps = {
      ...(i18nResult.props || {}),
      translationNamespaces: pageNamespaces,
      recentActivity: sanitizedActivity,
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
    console.error('Failed to load recent activity:', errorMessage);
    // Return empty props if there's an error (will show "No recent activity yet")
    return {
      props: {
        ...(i18nResult.props || {}),
        translationNamespaces: pageNamespaces,
        recentActivity: [],
      },
      revalidate: 60,
    };
  }
};
