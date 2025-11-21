import { GetStaticPaths, GetStaticProps } from 'next';
import { getStaticPropsWithTranslations } from '@/features/shared/lib/getStaticProps';
import Layout from '@/features/shared/components/Layout';
import Link from 'next/link';
import { BASE_TROLL_CLASS_SLUGS, getClassBySlug, TrollClassData } from '@/features/ittweb/guides/data/classes';
import { getSubclassesByParentSlug, getSupersByParentSlug } from '@/features/ittweb/guides/data/derivedClasses';
import ClassModel from '@/features/ittweb/guides/components/ClassModel';
import ClassHeader from '@/features/ittweb/guides/components/ClassHeader';
import StatsCard from '@/features/ittweb/guides/components/StatsCard';
import { MOVESPEED_PER_LEVEL, getMoveSpeedOffset, ATTR_START_MULTIPLIER } from '@/features/ittweb/guides/config/balance';

type Props = { cls: TrollClassData };

const pageNamespaces = ["common"];
export const getStaticProps: GetStaticProps<Props> = async ({ params, locale }) => {
  const slug = String(params?.slug || '');
  const cls = getClassBySlug(slug);
  if (!cls) {
    return { notFound: true };
  }
  const base = await getStaticPropsWithTranslations(pageNamespaces)({ locale: locale as string });
  return {
    props: {
      ...(base as any).props,
      cls,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: BASE_TROLL_CLASS_SLUGS.map((slug) => ({ params: { slug } })),
    fallback: false,
  };
};

export default function TrollClassDetail({ cls }: Props) {
  const subs = getSubclassesByParentSlug(cls.slug);
  const supers = getSupersByParentSlug(cls.slug);
  const msOffset = getMoveSpeedOffset('base');
  return (
    <Layout pageTranslationNamespaces={pageNamespaces}>
      <div className="min-h-[calc(100vh-8rem)] px-6 py-10 max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/guides/troll-classes" className="text-amber-400 hover:text-amber-300">← Troll Classes Overview</Link>
        </div>

        <ClassHeader slug={cls.slug} name={cls.name} summary={cls.summary} iconSrc={cls.iconSrc} />

        <StatsCard
          level1={{
            str: Math.ceil(cls.growth.strength * ATTR_START_MULTIPLIER.base),
            agi: Math.ceil(cls.growth.agility * ATTR_START_MULTIPLIER.base),
            int: Math.ceil(cls.growth.intelligence * ATTR_START_MULTIPLIER.base),
            hp: cls.baseHp,
            mana: cls.baseMana,
            ms: cls.baseMoveSpeed,
            atkSpd: cls.baseAttackSpeed,
          }}
          growth={{ str: cls.growth.strength, agi: cls.growth.agility, int: cls.growth.intelligence }}
          msOffset={msOffset}
          perLevelMsBonus={MOVESPEED_PER_LEVEL}
        />

        <div className="grid md:grid-cols-2 gap-6">
          <section className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-6">
            <h2 className="font-medieval-brand text-2xl mb-3">Subclass paths</h2>
            <ul className="text-gray-300 list-disc pl-5 space-y-1">
              {subs.map((s) => (
                <li key={s.slug}>
                  <Link href={`/guides/subclasses/${s.slug}`} className="text-amber-400 hover:text-amber-300">{s.name}</Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-6">
            <h2 className="font-medieval-brand text-2xl mb-3">Superclasses</h2>
            <ul className="text-gray-300 list-disc pl-5 space-y-1">
              {supers.length > 0 ? (
                supers.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/guides/supers/${s.slug}`} className="text-amber-400 hover:text-amber-300">{s.name}</Link>
                  </li>
                ))
              ) : (
                <li>None</li>
              )}
            </ul>
          </section>

          <section className="md:col-span-2 bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-6">
            <h2 className="font-medieval-brand text-2xl mb-3">Tips</h2>
            <ul className="text-gray-300 list-disc pl-5 space-y-1">
              {(cls.tips || []).map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </section>
        </div>

        <ClassModel slug={cls.slug} name={cls.name} className="mt-8" />
      </div>
    </Layout>
  );
}


