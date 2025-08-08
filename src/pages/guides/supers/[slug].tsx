import { GetStaticPaths, GetStaticProps } from 'next';
import { getStaticPropsWithTranslations } from '@/features/shared/lib/getStaticProps';
import Layout from '@/features/shared/components/Layout';
import Link from 'next/link';
import { DERIVED_CLASSES, getDerivedBySlug, SUPERCLASS_SLUGS, DerivedClassData } from '@/features/guides/data/derivedClasses';
import { getClassBySlug } from '@/features/guides/data/classes';
import ClassHeader from '@/features/guides/components/ClassHeader';
import ClassModel from '@/features/guides/components/ClassModel';
import StatsCard from '@/features/guides/components/StatsCard';
import { MOVESPEED_PER_LEVEL, getMoveSpeedOffset, ATTR_START_MULTIPLIER } from '@/features/guides/config/balance';

type Props = { cls: DerivedClassData };

const pageNamespaces = ["common"];
export const getStaticProps: GetStaticProps<Props> = async ({ params, locale }) => {
  const slug = String(params?.slug || '');
  const cls = getDerivedBySlug(slug);
  if (!cls || cls.type !== 'super') {
    return { notFound: true };
  }
  const base = await getStaticPropsWithTranslations(pageNamespaces)({ locale: locale as string });
  return { props: { ...(base as any).props, cls } };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: SUPERCLASS_SLUGS.map(slug => ({ params: { slug } })), fallback: false };
};

export default function SuperclassDetail({ cls }: Props) {
  const parent = getClassBySlug(cls.parentSlug);
  const msOffset = getMoveSpeedOffset('super');
  return (
    <Layout pageTranslationNamespaces={pageNamespaces}>
      <div className="min-h-[calc(100vh-8rem)] px-6 py-10 max-w-4xl mx-auto">
        <div className="mb-6 space-x-4">
          <Link href="/guides/troll-classes" className="text-amber-400 hover:text-amber-300 underline underline-offset-4">← Troll Classes Overview</Link>
          {parent && (
            <Link href={`/guides/classes/${parent.slug}`} className="text-amber-400 hover:text-amber-300 underline underline-offset-4">{parent.name}</Link>
          )}
        </div>

        <ClassHeader slug={cls.slug} name={cls.name} summary={cls.summary} />

        <StatsCard
          level1={{
            str: Math.ceil(cls.growth.strength * ATTR_START_MULTIPLIER.super),
            agi: Math.ceil(cls.growth.agility * ATTR_START_MULTIPLIER.super),
            int: Math.ceil(cls.growth.intelligence * ATTR_START_MULTIPLIER.super),
            hp: cls.baseHp,
            mana: cls.baseMana,
            ms: cls.baseMoveSpeed,
            atkSpd: cls.baseAttackSpeed,
          }}
          growth={{ str: cls.growth.strength, agi: cls.growth.agility, int: cls.growth.intelligence }}
          msOffset={msOffset}
          perLevelMsBonus={MOVESPEED_PER_LEVEL}
        />

        <ClassModel slug={cls.slug} name={cls.name} className="mt-8" />

        
      </div>
    </Layout>
  );
}


