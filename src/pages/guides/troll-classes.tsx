import { getStaticPropsWithTranslations } from '@/features/infrastructure/lib/server';
import { ErrorBoundary, Section } from '@/features/infrastructure/components';
import Link from 'next/link';
import { BASE_TROLL_CLASSES } from '@/features/modules/content/guides/data/units/classes';
import GuideCard from '@/features/modules/content/guides/components/GuideCard';
import ClassIcon from '@/features/modules/content/guides/components/ClassIcon';

const pageNamespaces = ["common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

export default function TrollClassesGuide() {

  return (
    <ErrorBoundary>
    <div className="min-h-[calc(100vh-8rem)] px-6 py-10 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href="/guides" className="link-amber">← Back to Guides</Link>
      </div>

      <h1 className="font-medieval-brand text-2xl md:text-4xl mb-6">Troll Classes Overview</h1>
      <p className="text-gray-300 mb-8">An overview of base classes, their subclass paths, and quick tips based on game data.</p>

      <Section variant="medieval">
        <h2 className="font-medieval-brand text-2xl mb-4">Browse Classes</h2>
        {BASE_TROLL_CLASSES.length === 0 ? (
          <p className="text-sm text-amber-200/80">
            No class data available yet. Run the extraction pipeline to regenerate `classes.ts`.
          </p>
        ) : (
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
        )}
      </Section>
    </div>
    </ErrorBoundary>
  );
}




