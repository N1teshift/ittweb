import { getStaticPropsWithTranslations } from '@/features/shared/lib/getStaticProps';
import logger from '@/features/shared/utils/loggerUtils';
import Layout from '@/features/shared/components/Layout';
import { useFallbackTranslation } from '@/features/shared/hooks/useFallbackTranslation';

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
    // Pass the namespaces to the layout component
    <Layout pageTranslationNamespaces={pageNamespaces}>
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {t('welcome')}
            </h1>
            <p className="text-lg text-foreground/80 mb-8">
              {t('description')}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-2">Next.js</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  React framework for production
                </p>
              </div>
              
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-2">TypeScript</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Type safety and better development experience
                </p>
              </div>
              
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-2">Tailwind CSS</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Utility-first CSS framework
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
