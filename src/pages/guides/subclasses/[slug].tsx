import { GetStaticPaths, GetStaticProps } from 'next';
import { getStaticPropsWithTranslations } from '@/features/infrastructure/lib/server';
import { ErrorBoundary } from '@/features/infrastructure/components';
import Link from 'next/link';
import { getDerivedClassBySlug, SUBCLASS_SLUGS, DerivedClassData } from '@/features/modules/content/guides/data/units/derivedClasses';
import { getClassBySlug } from '@/features/modules/content/guides/data/units/classes';
import ClassHeader from '@/features/modules/content/guides/components/ClassHeader';
import StatsCard from '@/features/modules/content/guides/components/StatsCard';
import { MOVESPEED_PER_LEVEL, getMoveSpeedOffset, ATTR_START_MULTIPLIER } from '@/features/modules/content/guides/config/balance';

type Props = { cls: DerivedClassData };

const pageNamespaces = ["common"];
export const getStaticProps: GetStaticProps<Props> = async ({ params, locale }) => {
  const slug = String(params?.slug || '');
  const cls = getDerivedClassBySlug(slug);
  if (!cls || cls.type !== 'sub') {
    return { notFound: true };
  }
  const base = await getStaticPropsWithTranslations(pageNamespaces)({ locale: locale as string });
  return { props: { ...base.props, cls } };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: SUBCLASS_SLUGS.map((slug: string) => ({ params: { slug } })), fallback: false };
};

export default function SubclassDetail({ cls }: Props) {
  const parent = getClassBySlug(cls.parentSlug);
  const msOffset = getMoveSpeedOffset('sub');
  return (
    <ErrorBoundary>
    <div className="min-h-[calc(100vh-8rem)] px-6 py-10 max-w-4xl mx-auto">
        <div className="mb-6 space-x-4">
          <Link href="/guides/troll-classes" className="link-amber">← Troll Classes Overview</Link>
          {parent && (
            <Link href={`/guides/classes/${parent.slug}`} className="link-amber">{parent.name}</Link>
          )}
        </div>

        <ClassHeader slug={cls.slug} name={cls.name} summary={cls.summary} iconSrc={cls.iconSrc} />

        <StatsCard
          level1={{
            str: Math.ceil(cls.growth.strength * ATTR_START_MULTIPLIER.sub),
            agi: Math.ceil(cls.growth.agility * ATTR_START_MULTIPLIER.sub),
            int: Math.ceil(cls.growth.intelligence * ATTR_START_MULTIPLIER.sub),
            hp: cls.baseHp,
            mana: cls.baseMana,
            ms: cls.baseMoveSpeed,
            atkSpd: cls.baseAttackSpeed,
          }}
          growth={{ str: cls.growth.strength, agi: cls.growth.agility, int: cls.growth.intelligence }}
          msOffset={msOffset}
          perLevelMsBonus={MOVESPEED_PER_LEVEL}
        />
      </div>
    </ErrorBoundary>
  );
}


