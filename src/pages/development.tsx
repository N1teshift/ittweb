import { getStaticPropsWithTranslations } from '@/features/shared/lib/getStaticProps';
import logger from '@/features/shared/utils/loggerUtils';
import Link from 'next/link';
import type { GetStaticProps } from 'next';

const pageNamespaces = ["common"];
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const withI18n = getStaticPropsWithTranslations(pageNamespaces);
  const i18nResult = await withI18n({ locale: locale as string });
  return {
    props: {
      ...(i18nResult.props || {}),
      translationNamespaces: pageNamespaces,
    },
  };
};

export default function Development() {

  if (typeof window !== 'undefined') {
    logger.info('Development page visited', {
      path: window.location.pathname,
      timestamp: new Date().toISOString()
    });
  }

      return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center max-w-2xl mx-auto px-6 py-12">
          {/* Main Heading */}
          <h1 className="font-medieval-brand text-5xl md:text-6xl mb-8">
            Development
          </h1>
          
          {/* Content Section */}
          <div className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-8 mb-8">
            <p className="text-lg md:text-xl text-gray-300 mb-4 leading-relaxed">
              Welcome to the Island Troll Tribes Development section!
              <br />
              Stay updated with the latest development progress.
            </p>
            
            {/* Placeholder Content */}
            <div className="mt-6 space-y-4">
              <div className="text-left">
                <h2 className="font-medieval-brand text-2xl mb-4">Development Updates</h2>
                <ul className="text-gray-300 space-y-2">
                  <li>
                    <Link href="/development/map" className="text-amber-400 hover:text-amber-300">
                      • Map Development
                    </Link>
                  </li>
                  <li>
                    <Link href="/development/website" className="text-amber-400 hover:text-amber-300">
                      • Website Development
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}
