import { getStaticPropsWithTranslations } from '@/features/shared/lib/getStaticProps';
import Layout from '@/features/shared/components/Layout';
import { useFallbackTranslation } from '@/features/shared/hooks/useFallbackTranslation';
import Link from 'next/link';
import { BASE_TROLL_CLASSES } from '@/features/guides/data/classes';
import GuideCard from '@/features/guides/components/GuideCard';
import ClassIcon from '@/features/guides/components/ClassIcon';

const pageNamespaces = ["common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

export default function TrollClassesGuide() {
  const { t } = useFallbackTranslation(pageNamespaces);

  return (
    <Layout pageTranslationNamespaces={pageNamespaces}>
      <div className="min-h-[calc(100vh-8rem)] px-6 py-10 max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/guides" className="text-amber-400 hover:text-amber-300">← Back to Guides</Link>
        </div>

        <h1 className="font-medieval-brand text-4xl md:text-5xl mb-6">Troll Classes Overview</h1>
        <p className="text-gray-300 mb-8">An overview of base classes, their subclass paths, and quick tips based on game data.</p>

        <section className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-6">
          <h2 className="font-medieval-brand text-2xl mb-4">Browse Classes</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {BASE_TROLL_CLASSES.map((c) => (
              <GuideCard
                key={c.slug}
                href={`/guides/classes/${c.slug}`}
                title={c.name}
                icon={<ClassIcon slug={c.slug} name={c.name} size={36} />}
                description={<p className="line-clamp-3">{c.summary}</p>}
              />
            ))}
          </div>
        </section>

        
      </div>
    </Layout>
  );
}


