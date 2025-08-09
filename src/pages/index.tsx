import { getStaticPropsWithTranslations } from '@/features/shared/lib/getStaticProps';
import logger from '@/features/shared/utils/loggerUtils';
import Layout from '@/features/shared/components/Layout';
import DiscordButton from '@/features/shared/components/DiscordButton';
import BlogPost from '@/features/blog/components/BlogPost';
import { MDXRemote } from 'next-mdx-remote';
import { loadLatestPostSerialized } from '@/features/blog/lib/posts';

// At the top of the file, define the namespaces for the page
const pageNamespaces = ["common"];

type HomeProps = {
  latestTitle?: string;
  latestDate?: string;
  mdxSource?: any;
};

export default function Home({ latestTitle, latestDate, mdxSource }: HomeProps) {

  // Log page visit
  if (typeof window !== 'undefined') {
    logger.info('Home page visited', {
      path: window.location.pathname,
      timestamp: new Date().toISOString()
    });
  }

  return (
    <Layout pageTranslationNamespaces={pageNamespaces}>
      <div className="flex justify-center min-h-[calc(100vh-8rem)]">
        <div className="w-full px-6 py-12">
          <BlogPost title={latestTitle ?? 'Latest Update'} date={latestDate}>
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
    </Layout>
  );
}

export const getStaticProps = async (ctx: any) => {
  const withI18n = getStaticPropsWithTranslations(pageNamespaces);
  const i18nResult = await withI18n(ctx);
  const latest = await loadLatestPostSerialized();
  return {
    props: {
      ...(i18nResult.props || {}),
      latestTitle: latest?.meta.title ?? null,
      latestDate: latest?.meta.date ?? null,
      mdxSource: latest?.mdxSource ?? null,
    },
  };
};
