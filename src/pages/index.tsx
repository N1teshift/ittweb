import { getStaticPropsWithTranslations } from '@/features/shared/lib/getStaticProps';
import logger from '@/features/shared/utils/loggerUtils';
import Layout from '@/features/shared/components/Layout';
import { useFallbackTranslation } from '@/features/shared/hooks/useFallbackTranslation';
import DiscordButton from '@/features/shared/components/DiscordButton';

// At the top of the file, define the namespaces for the page
const pageNamespaces = ["common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

export default function Home() {
  // Use the fallback translation hook to get the translation function
  const { t } = useFallbackTranslation(pageNamespaces);

  // Log page visit
  if (typeof window !== 'undefined') {
    logger.info('Home page visited', {
      path: window.location.pathname,
      timestamp: new Date().toISOString()
    });
  }

  return (
    <Layout pageTranslationNamespaces={pageNamespaces}>
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center max-w-2xl mx-auto px-6 py-12">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl font-bold text-amber-400 mb-8 font-medieval">
            Island Troll Tribes
          </h1>
          
          {/* Content Section */}
          <div className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-8 mb-8">
            <p className="text-lg md:text-xl text-gray-300 mb-4 leading-relaxed">
              www.islandtrolltribes.com is still under construction,
              <br />
              But you can find people to play with, the latest map, and dev updates on Discord!
            </p>
            
            {/* Discord Link */}
            <div className="mt-6">
              <DiscordButton />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
