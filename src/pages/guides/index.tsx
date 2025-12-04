import { getStaticPropsWithTranslations } from '@/features/infrastructure/lib/server';
import { Logger } from '@/features/infrastructure/logging';
import { ErrorBoundary } from '@/features/infrastructure/components';
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

export default function Guides() {

  if (typeof window !== 'undefined') {
    Logger.info('Guides page visited', {
      path: window.location.pathname,
      timestamp: new Date().toISOString()
    });
  }

  return (
    <ErrorBoundary>
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="text-center max-w-2xl mx-auto px-6 py-12">
        {/* Main Heading */}
        <h1 className="font-medieval-brand text-5xl md:text-6xl mb-8">
          Guides
        </h1>
        
        {/* Content Section */}
        <div className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-8 mb-8">
          <p className="text-lg md:text-xl text-gray-300 mb-4 leading-relaxed">
            Welcome to the Island Troll Tribes Guides section!
            <br />
            Here you&apos;ll find comprehensive guides for all aspects of the game.
          </p>
          
          {/* Content */}
          <div className="mt-6 space-y-4">
            <div className="text-left">
              <h2 className="font-medieval-brand text-2xl mb-4">Available Guides</h2>
              <ul className="text-gray-300 space-y-2">
                <li>
                  • <Link href="/guides/troll-classes" className="text-amber-400 hover:text-amber-300">Troll Classes</Link>
                </li>
                <li>
                  • <Link href="/guides/abilities" className="text-amber-400 hover:text-amber-300">Abilities</Link>
                </li>
                <li>
                  • <Link href="/guides/items" className="text-amber-400 hover:text-amber-300">Items</Link>
                </li>
                <li>
                  • <Link href="/guides/units" className="text-amber-400 hover:text-amber-300">Units</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    </ErrorBoundary>
  );
}






