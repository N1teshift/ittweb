import { useCallback } from 'react';
import { useRouter } from 'next/router';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import { getStaticPropsWithTranslations } from '@/features/shared/lib/getStaticProps';
import DiscordButton from '@/features/shared/components/DiscordButton';
import BlogPost from '@/features/ittweb/blog/components/BlogPost';
import { MDXRemote } from 'next-mdx-remote';
import { loadLatestPostSerialized } from '@/features/ittweb/blog/lib/posts';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';
import type { GetStaticProps } from 'next';
import { Button } from '@/features/infrastructure/shared/components/ui';

const pageNamespaces = ["common"];

type HomeProps = {
  latestTitle?: string;
  latestDate?: string;
  mdxSource?: MDXRemoteSerializeResult;
};

export default function Home({ latestTitle, latestDate, mdxSource }: HomeProps) {
  const { status } = useSession();
  const router = useRouter();

  const handleAddPostClick = useCallback(() => {
    if (status !== 'authenticated') {
      signIn('discord');
      return;
    }
    router.push('/posts/new').catch(() => {
      // Navigation failures are surfaced in the console by Next.js
    });
  }, [router, status]);

  return (
    <div className="flex justify-center min-h-[calc(100vh-8rem)]">
      <div className="w-full px-6 py-12">
        <BlogPost title={latestTitle ?? 'Latest Update'} date={latestDate || undefined}>
          {mdxSource ? (
            <MDXRemote {...mdxSource} />
          ) : (
            <p className="text-gray-300">No posts yet.</p>
          )}
          <div className="mt-10 space-y-6">
            <div>
              <DiscordButton />
              <p className="text-sm text-gray-400 mt-3">
                Join the Discord to find players, grab the latest map, and follow development updates.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-base font-semibold text-amber-300">Want to share a fresh update?</p>
                <p className="text-sm text-gray-400">Add a new post directly from the site.</p>
              </div>
              <Button
                type="button"
                onClick={handleAddPostClick}
                disabled={status === 'loading'}
                className="w-full sm:w-auto"
              >
                {status === 'authenticated' ? 'Add New Post' : 'Sign in to Add Post'}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Need help with formatting? Check the{' '}
              <Link href="/development/website" className="text-amber-400 hover:text-amber-300 underline">
                website development notes
              </Link>
              .
            </p>
          </div>
        </BlogPost>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async ({ locale }) => {
  const withI18n = getStaticPropsWithTranslations(pageNamespaces);
  const i18nResult = await withI18n({ locale: locale as string });
  
  try {
    const latest = await loadLatestPostSerialized();
    return {
      props: {
        ...(i18nResult.props || {}),
        translationNamespaces: pageNamespaces,
        latestTitle: latest?.meta.title ?? undefined,
        latestDate: latest?.meta.date ?? undefined,
        mdxSource: latest?.mdxSource ?? undefined,
      },
      // Revalidate every 60 seconds to allow posts to update
      revalidate: 60,
    };
  } catch (error) {
    console.error('Failed to load latest post:', error);
    // Return empty props if there's an error (will show "No posts yet")
    return {
      props: {
        ...(i18nResult.props || {}),
        translationNamespaces: pageNamespaces,
      },
      revalidate: 60,
    };
  }
};
