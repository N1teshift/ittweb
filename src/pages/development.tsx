import { getStaticPropsWithTranslations } from '@/features/infrastructure/lib/server';
import { Logger } from '@/features/infrastructure/logging';
import { DiscordButton, GitHubButton, Section, ErrorBoundary } from '@/features/infrastructure/components';
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
    Logger.info('Development page visited', {
      path: window.location.pathname,
      timestamp: new Date().toISOString()
    });
  }

  return (
    <ErrorBoundary>
      <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-3xl w-full mx-auto px-6 py-12">
        <h1 className="font-medieval-brand text-2xl md:text-4xl mb-6 text-center">Development</h1>

        <div className="space-y-6">
          {/* Map Development Section */}
          <Section variant="medieval" className="md:p-8">
            <h2 className="font-medieval-brand text-2xl mb-4">Map Development</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medieval-brand text-xl mb-2">Current Maintainer</h3>
                <p className="text-gray-300 leading-relaxed">
                  The Island Troll Tribes map development is currently maintained by <span className="text-amber-400">bamnupko</span>.
                </p>
              </div>
              <div>
                <h3 className="font-medieval-brand text-xl mb-2">Contribute to the Map</h3>
                <p className="text-gray-300 leading-relaxed">
                  Contributions are welcome. You can participate by opening pull requests, reporting issues, or discussing changes
                  in the community. The map source and contribution workflow are available on GitHub.
                </p>
                <div className="mt-4">
                  <GitHubButton href="https://github.com/Exactuz/island-troll-tribes">View Map Repository</GitHubButton>
                </div>
              </div>
            </div>
          </Section>

          {/* Website Development Section */}
          <Section variant="medieval" className="md:p-8">
            <h2 className="font-medieval-brand text-2xl mb-4">Website Development</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medieval-brand text-xl mb-2">Contribute to this Website</h3>
                <p className="text-gray-300 leading-relaxed">
                  This website is open for community contributions. It is hosted on Vercel and connected to our domain
                  <span className="text-amber-400"> www.islandtrolltribes.com</span>, with the source managed on GitHub.
                  If you want to help with web features, content, or fixes, you&apos;re welcome!
                </p>
                <ul className="list-disc list-inside mt-3 text-gray-300 space-y-1">
                  <li>Hosted on Vercel (GitHub integration for automatic deploys)</li>
                  <li>Pull Requests welcome from the community</li>
                  <li>Tech stack: Next.js, TypeScript, Tailwind CSS, Firebase</li>
                </ul>
                <div className="mt-4">
                  <GitHubButton href="https://github.com/N1teshift/ittweb">View Website Repository</GitHubButton>
                </div>
              </div>
              <div>
                <h3 className="font-medieval-brand text-xl mb-2">Contact</h3>
                <p className="text-gray-300 leading-relaxed">
                  If you want to reach me about website development, contact me on Discord.
                  I&apos;m in the Island Troll Tribes community under the name <span className="text-amber-400">Scatman33</span>.
                </p>
                <div className="mt-4">
                  <DiscordButton>Join the Discord</DiscordButton>
                </div>
              </div>
            </div>
          </Section>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

