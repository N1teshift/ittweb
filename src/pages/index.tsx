import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { getStaticPropsWithTranslations } from '@/features/shared/lib/getStaticProps';
import BlogPost from '@/features/ittweb/blog/components/BlogPost';
import { MDXRemote } from 'next-mdx-remote';
import { loadLatestPostSerialized, loadAllPosts } from '@/features/ittweb/blog/lib/posts';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';
import type { GetStaticProps } from 'next';
import type { PostMeta } from '@/features/ittweb/blog/lib/posts';
import { Button } from '@/features/infrastructure/shared/components/ui';

const pageNamespaces = ["common"];

type HomeProps = {
  translationNamespaces?: string[];
  latestTitle?: string | null;
  latestDate?: string | null;
  latestAuthor?: string | null;
  mdxSource?: MDXRemoteSerializeResult | null;
  allPosts: PostMeta[];
};

export default function Home({ latestTitle, latestDate, latestAuthor, mdxSource, allPosts }: HomeProps) {
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

  return (
    <div className="flex justify-center min-h-[calc(100vh-8rem)]">
      <div className="w-full px-6 py-12 max-w-4xl">
        {/* Create Post Button - Only visible to authenticated users */}
        {status === 'authenticated' && (
          <div className="mb-8 flex justify-end">
            <Button
              type="button"
              onClick={handleCreatePost}
              className="bg-amber-600 hover:bg-amber-500 text-white"
            >
              Create Post
            </Button>
          </div>
        )}
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

        {/* All Posts List */}
        {allPosts.length > 0 && (
          <div className="mt-16">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-amber-400 font-medieval mb-2">All Posts</h2>
              <div className="w-16 h-1 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full opacity-80"></div>
            </div>
            <div className="grid gap-4 md:gap-6">
              {allPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/posts/${post.slug}`}
                  className="group block"
                >
                  <div className="bg-black/40 backdrop-blur-sm border border-amber-500/20 rounded-lg p-6 hover:border-amber-500/40 hover:bg-black/50 transition-all duration-300 shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-amber-500/5">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="text-xl md:text-2xl font-semibold text-amber-400 group-hover:text-amber-300 transition-colors font-medieval mb-2">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-gray-300 mt-2 leading-relaxed line-clamp-2">{post.excerpt}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400 flex-shrink-0">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-amber-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{formatDate(post.date)}</span>
                        </div>
                        {post.author && (
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-amber-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-amber-400/80">{post.author}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* No posts message */}
        {allPosts.length === 0 && !mdxSource && (
          <BlogPost title="Latest Update">
            <p className="text-gray-300">No posts yet.</p>
          </BlogPost>
        )}
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async ({ locale }) => {
  const withI18n = getStaticPropsWithTranslations(pageNamespaces);
  const i18nResult = await withI18n({ locale: locale as string });
  
  try {
    const [latest, allPostsData] = await Promise.all([
      loadLatestPostSerialized().catch(() => null),
      loadAllPosts().catch(() => []),
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

    // Build props object, only including properties that have values
    const props: HomeProps = {
      ...(i18nResult.props || {}),
      translationNamespaces: pageNamespaces,
      allPosts,
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
    console.error('Failed to load posts:', errorMessage);
    // Return empty props if there's an error (will show "No posts yet")
    return {
      props: {
        ...(i18nResult.props || {}),
        translationNamespaces: pageNamespaces,
        allPosts: [],
      },
      revalidate: 60,
    };
  }
};
