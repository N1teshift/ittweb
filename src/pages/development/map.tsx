import { getStaticPropsWithTranslations } from '@/features/shared/lib/getStaticProps';
import logger from '@/features/shared/utils/loggerUtils';
import GitHubButton from '@/features/shared/components/GitHubButton';
import { useFallbackTranslation } from '@/features/shared/hooks/useFallbackTranslation';

const pageNamespaces = ["common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

export default function MapDevelopmentPage() {
  const { t } = useFallbackTranslation(pageNamespaces);

  if (typeof window !== 'undefined') {
    logger.info('Map Development page visited', {
      path: window.location.pathname,
      timestamp: new Date().toISOString()
    });
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="max-w-3xl w-full mx-auto px-6 py-12">
          <h1 className="font-medieval-brand text-4xl md:text-5xl mb-6 text-center">Map Development</h1>

          <div className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-6 md:p-8 space-y-8">
            <section>
              <h2 className="font-medieval-brand text-2xl mb-3">Current Maintainer</h2>
              <p className="text-gray-300 leading-relaxed">
                The Island Troll Tribes map development is currently maintained by <span className="text-amber-400">bamnupko</span>.
              </p>
            </section>

            <section>
              <h2 className="font-medieval-brand text-2xl mb-3">Contribute to the Map</h2>
              <p className="text-gray-300 leading-relaxed">
                Contributions are welcome. You can participate by opening pull requests, reporting issues, or discussing changes
                in the community. The map source and contribution workflow are available on GitHub.
              </p>
              <div className="mt-4">
                <GitHubButton href="https://github.com/Exactuz/island-troll-tribes">View Map Repository</GitHubButton>
              </div>
            </section>
          </div>
        </div>
      </div>
  );
}


