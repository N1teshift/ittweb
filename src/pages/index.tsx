import { getStaticPropsWithTranslations } from '@/features/shared/lib/getStaticProps';
import DiscordButton from '@/features/shared/components/DiscordButton';
import BlogPost from '@/features/ittweb/blog/components/BlogPost';
import { MDXRemote } from 'next-mdx-remote';
import { loadLatestPostSerialized } from '@/features/ittweb/blog/lib/posts';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';
import type { GetStaticProps } from 'next';

const pageNamespaces = ["common"];

type HomeProps = {
  latestTitle?: string;
  latestDate?: string;
  mdxSource?: MDXRemoteSerializeResult;
};

export default function Home({ latestTitle, latestDate, mdxSource }: HomeProps) {

  return (
    <div className="flex justify-center min-h-[calc(100vh-8rem)]">
      <div className="w-full px-6 py-12">
        <BlogPost title={latestTitle ?? 'Latest Update'} date={latestDate || undefined}>
          {mdxSource ? (
            <MDXRemote {...mdxSource} />
          ) : (
            <p className="text-gray-300">No posts yet.</p>
          )}
          <div className="mt-10">
            <DiscordButton />
            <p className="text-sm text-gray-400 mt-3">
              Join the Discord to find players, grab the latest map, and follow development updates.
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
  const latest = await loadLatestPostSerialized();
  return {
    props: {
      ...(i18nResult.props || {}),
      translationNamespaces: pageNamespaces,
      latestTitle: latest?.meta.title ?? undefined,
      latestDate: latest?.meta.date ?? undefined,
      mdxSource: latest?.mdxSource ?? undefined,
    },
  };
};
