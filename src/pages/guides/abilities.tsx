import { getStaticPropsWithTranslations } from '@/features/shared/lib/getStaticProps';
import Layout from '@/features/shared/components/Layout';
import Link from 'next/link';

const pageNamespaces = ["common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

export default function AbilitiesPage() {
  return (
    <Layout pageTranslationNamespaces={pageNamespaces}>
      <div className="min-h-[calc(100vh-8rem)] px-6 py-10 max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/guides" className="text-amber-400 hover:text-amber-300 underline underline-offset-4">← Back to Guides</Link>
        </div>

        <h1 className="font-medieval-brand text-4xl md:text-5xl mb-6">Abilities</h1>
        <p className="text-gray-300 mb-6">A comprehensive list of abilities. This page is scaffolded and ready to populate from game data.</p>

        <div className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-6">
          <p className="text-gray-400">Coming soon: filterable, categorized ability list.</p>
        </div>
      </div>
    </Layout>
  );
}


