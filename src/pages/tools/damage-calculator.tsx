import { getStaticPropsWithTranslations } from '@/features/shared/lib/getStaticProps';
import logger from '@/features/shared/utils/loggerUtils';
import Layout from '@/features/shared/components/Layout';
import { useFallbackTranslation } from '@/features/shared/hooks/useFallbackTranslation';

const pageNamespaces = ["common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

export default function DamageCalculator() {
  const { t } = useFallbackTranslation(pageNamespaces);

  if (typeof window !== 'undefined') {
    logger.info('Damage Calculator page visited', {
      path: window.location.pathname,
      timestamp: new Date().toISOString()
    });
  }

  return (
    <Layout pageTranslationNamespaces={pageNamespaces}>
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center max-w-2xl mx-auto px-6 py-12">
          {/* Main Heading */}
          <h1 className="font-medieval-brand text-5xl md:text-6xl mb-8">
            Damage Calculator
          </h1>
          
          {/* Content Section */}
          <div className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-8 mb-8">
            <p className="text-lg md:text-xl text-gray-300 mb-4 leading-relaxed">
              Welcome to the Island Troll Tribes Damage Calculator!
              <br />
              This tool will help you calculate damage output for different scenarios.
            </p>
            
            {/* Placeholder Content */}
            <div className="mt-6 space-y-4">
              <div className="text-left">
                <h2 className="font-medieval-brand text-2xl mb-4">Coming Soon</h2>
                <p className="text-gray-300">
                  The damage calculator functionality will be implemented here.
                  <br />
                  Stay tuned for updates!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
