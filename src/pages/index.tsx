import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/next-i18next';
import logger from '@/config/logger';

export default function Home() {
  const { t } = useTranslation('common');

  // Log page visit
  if (typeof window !== 'undefined') {
    logger.info('Home page visited', {
      path: window.location.pathname,
      timestamp: new Date().toISOString()
    });
  }

  return (
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
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  logger.info('Generating static props for home page', { locale });
  
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};
