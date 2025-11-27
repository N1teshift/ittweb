import { GetStaticPaths, GetStaticProps } from 'next';
import { getStaticPropsWithTranslations } from '@/features/shared/lib/getStaticProps';
import Link from 'next/link';
import { BASE_TROLL_CLASS_SLUGS, getClassBySlug, TrollClassData } from '@/features/modules/guides/data/units/classes';
import { getSubclassesByParentSlug, getSupersByParentSlug } from '@/features/modules/guides/data/units/derivedClasses';
import { getAbilitiesByClass, ABILITY_CATEGORIES, AbilityData } from '@/features/modules/guides/data/abilities';
import ClassHeader from '@/features/modules/guides/components/ClassHeader';
import StatsCard from '@/features/modules/guides/components/StatsCard';
import GuideCard from '@/features/modules/guides/components/GuideCard';
import GuideIcon from '@/features/modules/guides/components/GuideIcon';
import { MOVESPEED_PER_LEVEL, getMoveSpeedOffset, ATTR_START_MULTIPLIER } from '@/features/modules/guides/config/balance';

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
      ...base.props,
      cls,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  if (!BASE_TROLL_CLASS_SLUGS || BASE_TROLL_CLASS_SLUGS.length === 0) {
    console.error('BASE_TROLL_CLASS_SLUGS is undefined or empty');
    return {
      paths: [],
      fallback: false,
    };
  }
  return {
    paths: BASE_TROLL_CLASS_SLUGS.map((slug) => ({ params: { slug } })),
    fallback: false,
  };
};

function AbilityCard({ ability }: { ability: AbilityData }) {
  const primaryBadges = [
    ability.manaCost !== undefined
      ? { label: `Mana: ${ability.manaCost}`, variant: 'blue' as const }
      : null,
    ability.cooldown !== undefined
      ? { label: `Cooldown: ${ability.cooldown}s`, variant: 'purple' as const }
      : null,
    ability.range !== undefined
      ? { label: `Range: ${ability.range}`, variant: 'green' as const }
      : null,
    ability.areaOfEffect !== undefined
      ? { label: `AOE: ${ability.areaOfEffect}`, variant: 'green' as const }
      : null,
    ability.maxTargets !== undefined
      ? { label: `Targets: ${ability.maxTargets}`, variant: 'purple' as const }
      : null,
    ability.duration !== undefined
      ? { label: `Duration: ${ability.duration}s`, variant: 'amber' as const }
      : null,
    ability.damage
      ? { label: `Damage: ${ability.damage}`, variant: 'red' as const }
      : null,
  ].filter(Boolean) as { label: string; variant: 'blue' | 'purple' | 'green' | 'amber' | 'red' }[];

  const secondaryBadges = [
    ability.hotkey
      ? { label: `[${ability.hotkey}]`, variant: 'amber' as const }
      : null,
    ability.category
      ? { label: ABILITY_CATEGORIES[ability.category] || ability.category, variant: 'gray' as const }
      : null,
  ].filter(Boolean) as { label: string; variant: 'amber' | 'gray' }[];

  const footer = ability.effects && ability.effects.length > 0 && (
    <div className="text-xs">
      <span className="text-gray-400">Effects:</span>
      <ul className="list-disc list-inside text-gray-300 mt-1">
        {ability.effects.map((effect, index) => (
          <li key={index}>{effect}</li>
        ))}
      </ul>
    </div>
  );

  const icon = (
    <GuideIcon 
      category="abilities" 
      name={ability.name} 
      size={48}
      src={ability.iconPath ? `/icons/itt/${ability.iconPath}` : undefined}
    />
  );

  return (
    <GuideCard
      href={`/guides/abilities/${ability.id}`}
      title={ability.name}
      icon={icon}
      description={ability.description}
      primaryTagGroup={primaryBadges.length ? { badges: primaryBadges } : undefined}
      secondaryTagGroup={secondaryBadges.length ? { badges: secondaryBadges } : undefined}
      footer={footer || undefined}
    />
  );
}

export default function TrollClassDetail({ cls }: Props) {
  const subs = getSubclassesByParentSlug(cls.slug);
  const supers = getSupersByParentSlug(cls.slug);
  const abilities = getAbilitiesByClass(cls.slug);
  const msOffset = getMoveSpeedOffset('base');
  return (
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
            {subs.length > 0 ? (
              <ul className="text-gray-300 list-disc pl-5 space-y-1">
                {subs.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/guides/subclasses/${s.slug}`} className="text-amber-400 hover:text-amber-300">{s.name}</Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">None</p>
            )}
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

        {abilities.length > 0 && (
          <section className="mt-8 bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-6">
            <h2 className="font-medieval-brand text-2xl mb-4">Abilities</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {abilities.map((ability) => (
                <AbilityCard key={ability.id} ability={ability} />
              ))}
            </div>
          </section>
        )}
    </div>
  );
}


