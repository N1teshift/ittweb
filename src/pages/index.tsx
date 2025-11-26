import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { getStaticPropsWithTranslations } from '@/features/shared/lib/getStaticProps';
import BlogPost from '@/features/ittweb/blog/components/BlogPost';
import { MDXRemote } from 'next-mdx-remote';
import { loadLatestPostSerialized, loadAllPosts } from '@/features/ittweb/blog/lib/posts';
import { getAllArchiveEntries } from '@/features/shared/lib/archiveService.server';
import { getAllScheduledGames } from '@/features/ittweb/scheduled-games/lib/scheduledGameService';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';
import type { GetStaticProps } from 'next';
import type { PostMeta } from '@/features/ittweb/blog/lib/posts';
import type { ArchiveEntry } from '@/types/archive';
import type { ScheduledGame } from '@/types/scheduledGame';
import { Button } from '@/features/infrastructure/shared/components/ui';

const pageNamespaces = ["common"];

type RecentActivityItem = 
  | { type: 'post'; data: PostMeta }
  | { type: 'archive'; data: ArchiveEntry }
  | { type: 'scheduled-game'; data: ScheduledGame };

type HomeProps = {
  translationNamespaces?: string[];
  latestTitle?: string | null;
  latestDate?: string | null;
  latestAuthor?: string | null;
  mdxSource?: MDXRemoteSerializeResult | null;
  recentActivity: RecentActivityItem[];
};

export default function Home({ latestTitle, latestDate, latestAuthor, mdxSource, recentActivity }: HomeProps) {
  const { status } = useSession();
  const router = useRouter();

  const formatDate = (dateString: string) => {
    try {
      // Extract just YYYY-MM-DD from ISO string
      return dateString.split('T')[0];
    } catch {
      return dateString;
    }
  };

  const handleCreatePost = () => {
    router.push('/posts/new').catch(() => {
      // Navigation failures are surfaced in the console by Next.js
    });
  };

  const getActivityDate = (item: RecentActivityItem): string => {
    switch (item.type) {
      case 'post':
        return item.data.date;
      case 'archive':
        return item.data.createdAt;
      case 'scheduled-game':
        return item.data.createdAt;
      default:
        return new Date().toISOString();
    }
  };

  const getActivityTitle = (item: RecentActivityItem): string => {
    switch (item.type) {
      case 'post':
        return item.data.title;
      case 'archive':
        return item.data.title;
      case 'scheduled-game':
        const teamSize = item.data.teamSize === 'custom' ? item.data.customTeamSize : item.data.teamSize;
        return `${teamSize} - ${item.data.gameType === 'elo' ? 'ELO' : 'Normal'} Game #${item.data.scheduledGameId}`;
      default:
        return '';
    }
  };

  const getActivityAuthor = (item: RecentActivityItem): string | undefined => {
    switch (item.type) {
      case 'post':
        return item.data.author;
      case 'archive':
        return item.data.author;
      case 'scheduled-game':
        return item.data.scheduledByName;
      default:
        return undefined;
    }
  };

  const getActivityUrl = (item: RecentActivityItem): string => {
    switch (item.type) {
      case 'post':
        return `/posts/${item.data.slug}`;
      case 'archive':
        return `/archives`;
      case 'scheduled-game':
        return `/scheduled-games`;
      default:
        return '/';
    }
  };

  const getActivityTypeLabel = (item: RecentActivityItem): string => {
    switch (item.type) {
      case 'post':
        return 'Post';
      case 'archive':
        return 'Archive';
      case 'scheduled-game':
        return 'Scheduled Game';
      default:
        return '';
    }
  };

  return (
    <div className="flex justify-center min-h-[calc(100vh-8rem)]">
      <div className="w-full px-6 py-12 max-w-4xl">
        {/* Latest Post */}
        {mdxSource && latestTitle && (
          <BlogPost 
            title={latestTitle} 
            date={latestDate ? formatDate(latestDate) : undefined} 
            author={latestAuthor || undefined}
          >
            <MDXRemote {...mdxSource} />
          </BlogPost>
        )}

        {/* Create Post Button - Only visible to authenticated users */}
        {status === 'authenticated' && (
          <div className="mt-12 mb-8 flex justify-end">
            <Button
              type="button"
              onClick={handleCreatePost}
              className="bg-amber-600 hover:bg-amber-500 text-white"
            >
              Create Post
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
                const key = item.type === 'post' 
                  ? `post-${item.data.slug}` 
                  : item.type === 'archive'
                  ? `archive-${item.data.id}`
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
                          {item.type === 'post' && item.data.excerpt && (
                            <p className="text-xs text-gray-300 mt-0.5 leading-snug line-clamp-1">{item.data.excerpt}</p>
                          )}
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
  
  try {
    const [latest, allPostsData, archiveEntries, scheduledGames] = await Promise.all([
      loadLatestPostSerialized().catch(() => null),
      loadAllPosts().catch(() => []),
      getAllArchiveEntries().catch(() => []),
      getAllScheduledGames(true, false).catch(() => []), // includePast=true to get recent games
    ]);

    // Convert loaded posts to PostMeta format and sanitize undefined values
    const allPosts: PostMeta[] = allPostsData.map((post) => {
      const meta = post.meta;
      // Remove undefined properties for JSON serialization (null is fine, undefined is not)
      const sanitized: PostMeta = {
        title: meta.title,
        date: meta.date,
        slug: meta.slug,
      };
      if (meta.id !== undefined) sanitized.id = meta.id;
      if (meta.excerpt !== undefined) sanitized.excerpt = meta.excerpt;
      if (meta.author !== undefined) sanitized.author = meta.author;
      if (meta.createdByDiscordId !== undefined) {
        sanitized.createdByDiscordId = meta.createdByDiscordId;
      }
      return sanitized;
    });

    // Sanitize archive entries and scheduled games to remove undefined values
    const sanitizedArchiveEntries = archiveEntries.map(removeUndefined) as ArchiveEntry[];
    const sanitizedScheduledGames = scheduledGames.map(removeUndefined) as ScheduledGame[];

    // Combine all activity items
    const activityItems: RecentActivityItem[] = [
      ...allPosts.map((post): RecentActivityItem => ({ type: 'post', data: post })),
      ...sanitizedArchiveEntries.map((entry): RecentActivityItem => ({ type: 'archive', data: entry })),
      ...sanitizedScheduledGames.map((game): RecentActivityItem => ({ type: 'scheduled-game', data: game })),
    ];

    // Sort by date (most recent first) and limit to 5
    const getItemDate = (item: RecentActivityItem): Date => {
      switch (item.type) {
        case 'post':
          return new Date(item.data.date);
        case 'archive':
          return new Date(item.data.createdAt);
        case 'scheduled-game':
          return new Date(item.data.createdAt);
        default:
          return new Date(0);
      }
    };

    const sortedActivity = activityItems
      .sort((a, b) => getItemDate(b).getTime() - getItemDate(a).getTime())
      .slice(0, 5);

    // Sanitize the final activity array to remove any undefined values
    const sanitizedActivity = sortedActivity.map((item) => {
      return {
        type: item.type,
        data: removeUndefined(item.data),
      } as RecentActivityItem;
    });

    // Build props object, only including properties that have values
    const props: HomeProps = {
      ...(i18nResult.props || {}),
      translationNamespaces: pageNamespaces,
      recentActivity: sanitizedActivity,
    };

    if (latest?.meta.title) {
      props.latestTitle = latest.meta.title;
    }
    if (latest?.meta.date) {
      props.latestDate = latest.meta.date;
    }
    if (latest?.meta.author) {
      props.latestAuthor = latest.meta.author;
    }
    if (latest?.mdxSource) {
      props.mdxSource = latest.mdxSource;
    }

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
