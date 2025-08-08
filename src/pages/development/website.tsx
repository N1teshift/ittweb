import { getStaticPropsWithTranslations } from '@/features/shared/lib/getStaticProps';
import logger from '@/features/shared/utils/loggerUtils';
import Layout from '@/features/shared/components/Layout';
import DiscordButton from '@/features/shared/components/DiscordButton';
import GitHubButton from '@/features/shared/components/GitHubButton';
import { useFallbackTranslation } from '@/features/shared/hooks/useFallbackTranslation';

const pageNamespaces = ["common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

export default function WebsiteDevelopmentPage() {
  const { t } = useFallbackTranslation(pageNamespaces);

  if (typeof window !== 'undefined') {
    logger.info('Website Development page visited', {
      path: window.location.pathname,
      timestamp: new Date().toISOString()
    });
  }

  const changeLogEntries: { date: string; hash: string; message: string }[] = [
    { date: '2025-08-09', hash: 'd47caa8', message: 'Archives feature: editing flow, image zoom modal, sorting toggle, Firebase env vars, component refactor and cleanup (moved to features/archives)' },
    { date: '2025-08-08', hash: '9343c5a', message: 'Header and Footer introduced' },
    { date: '2025-08-08', hash: 'd3bab51', message: 'Complete project setup: shared utilities, Layout component, and proper i18next configuration' },
    { date: '2025-08-08', hash: '847ae62', message: 'Initial setup: Next.js website with TypeScript, Tailwind CSS, i18next, and Winston logging' },
    { date: '2025-08-08', hash: '7fb4ee4', message: 'Initial commit' },
  ];

  return (
    <Layout pageTranslationNamespaces={pageNamespaces}>
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="max-w-3xl w-full mx-auto px-6 py-12">
          <h1 className="font-medieval-brand text-4xl md:text-5xl mb-6 text-center">Website Development</h1>

          <div className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-6 md:p-8 space-y-8">
            <section>
              <h2 className="font-medieval-brand text-2xl mb-3">Contribute to this Website</h2>
              <p className="text-gray-300 leading-relaxed">
                This website is open for community contributions. It is hosted on Vercel and connected to our domain
                <span className="text-amber-400"> www.islandtrolltribes.com</span>, with the source managed on GitHub.
                If you want to help with web features, content, or fixes, you’re welcome!
              </p>
              <ul className="list-disc list-inside mt-3 text-gray-300 space-y-1">
                <li>Hosted on Vercel (GitHub integration for automatic deploys)</li>
                <li>Pull Requests welcome from the community</li>
                <li>Tech stack: Next.js, TypeScript, Tailwind CSS, Firebase</li>
              </ul>
              <div className="mt-4">
                <GitHubButton href="https://github.com/N1teshift/ittweb">Contribute on GitHub</GitHubButton>
              </div>
            </section>

            <section>
              <h2 className="font-medieval-brand text-2xl mb-3">Contact</h2>
              <p className="text-gray-300 leading-relaxed">
                If you want to reach me about website development, contact me on Discord.
                I’m in the Island Troll Tribes community under the name <span className="text-amber-400">Scatman33</span>.
              </p>
              <div className="mt-4">
                <DiscordButton>Join the Discord</DiscordButton>
              </div>
            </section>

            <section>
              <h2 className="font-medieval-brand text-2xl mb-3">Website Change Log</h2>
              <div className="space-y-4 text-gray-300">
                {changeLogEntries.map((entry) => (
                  <div key={`${entry.date}-${entry.hash}`} className="border border-amber-500/20 rounded-md p-3">
                    <p className="text-amber-300">
                      {entry.date} <span className="text-xs text-gray-400 align-middle">({entry.hash})</span>
                    </p>
                    <p className="mt-1 leading-relaxed">{entry.message}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Roadmap intentionally omitted for now */}
          </div>
        </div>
      </div>
    </Layout>
  );
}


