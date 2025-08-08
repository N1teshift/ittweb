import { getStaticPropsWithTranslations } from '@/features/shared/lib/getStaticProps';
import Layout from '@/features/shared/components/Layout';
import { useFallbackTranslation } from '@/features/shared/hooks/useFallbackTranslation';
import Link from 'next/link';
import { BASE_TROLL_CLASSES } from '@/features/guides/data/classes';

const pageNamespaces = ["common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

export default function TrollClassesGuide() {
  const { t } = useFallbackTranslation(pageNamespaces);

  return (
    <Layout pageTranslationNamespaces={pageNamespaces}>
      <div className="min-h-[calc(100vh-8rem)] px-6 py-10 max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/guides" className="text-amber-400 hover:text-amber-300 underline underline-offset-4">← Back to Guides</Link>
        </div>

        <h1 className="font-medieval-brand text-4xl md:text-5xl mb-6">Troll Classes Overview</h1>
        <p className="text-gray-300 mb-8">An overview of base classes, their subclass paths, and quick tips based on game data.</p>

        <section className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-6">
          <h2 className="font-medieval-brand text-2xl mb-4">Browse Classes</h2>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {BASE_TROLL_CLASSES.map((c) => (
              <li key={c.slug}>
                <Link href={`/guides/classes/${c.slug}`} className="block border border-amber-500/20 hover:border-amber-500/50 rounded-md p-4 transition-colors">
                  <div className="font-medieval-brand text-xl mb-1">{c.name}</div>
                  <p className="text-gray-300 text-sm line-clamp-3">{c.summary}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        
      </div>
    </Layout>
  );
}


