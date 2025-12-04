import { GetStaticPaths, GetStaticProps } from 'next';
import { getStaticPropsWithTranslations } from '@/features/infrastructure/lib/server';
import { ErrorBoundary, Section } from '@/features/infrastructure/components';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AbilityData } from '@/features/modules/content/guides/data/abilities';
import { ABILITIES, ABILITY_CATEGORIES, getAbilityById } from '@/features/modules/content/guides/data/abilities';
import { getItemById } from '@/features/modules/content/guides/data/items';
import { getClassBySlug } from '@/features/modules/content/guides/data/units/classes';
import { ColoredText } from '@/features/modules/content/guides/components/ColoredText';

type Props = { ability: AbilityData };

const pageNamespaces = ["common"];

export const getStaticProps: GetStaticProps<Props> = async ({ params, locale }) => {
  const id = String(params?.id || '');
  const ability = getAbilityById(id);
  if (!ability) {
    return { notFound: true };
  }
  const base = await getStaticPropsWithTranslations(pageNamespaces)({ locale: locale as string });
  return { props: { ...base.props, ability } };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = ABILITIES.map(a => ({ params: { id: a.id } }));
  return { paths, fallback: false };
};

export default function AbilityDetail({ ability }: Props) {
  const router = useRouter();
  const fromItem = router.query.from === 'item';
  const itemId = router.query.itemId as string | undefined;
  const item = itemId ? getItemById(itemId) : null;

  return (
    <ErrorBoundary>
    <div className="min-h-[calc(100vh-8rem)] px-6 py-10 max-w-4xl mx-auto">
        <div className="mb-6 space-x-4">
          {fromItem && item ? (
            <>
              <Link href={`/guides/items/${item.id}`} className="link-amber">
                ← Back to {item.name}
              </Link>
              <span className="text-gray-500">•</span>
              <Link href="/guides/abilities" className="link-amber">All Abilities</Link>
            </>
          ) : (
            <Link href="/guides/abilities" className="link-amber">← Abilities</Link>
          )}
          <span className="text-gray-500">•</span>
          <Link href="/guides" className="link-amber">Guides</Link>
        </div>

        <Section variant="medieval">
          <div className="flex items-start justify-between mb-2">
            <h1 className="font-medieval-brand text-2xl md:text-4xl text-amber-400">
              <ColoredText text={ability.name} />
            </h1>
            <div className="flex gap-2">
              <span className="text-xs bg-amber-500/20 text-amber-200 px-2 py-1 rounded">
                {ABILITY_CATEGORIES[ability.category] || ability.category}
              </span>
              {ability.classRequirement && (
                <span className="text-xs bg-amber-500/20 text-amber-200 px-2 py-1 rounded">{ability.classRequirement}</span>
              )}
            </div>
          </div>

          {ability.tooltip ? (
            <div className="text-gray-300 mb-4">
              <ColoredText text={ability.tooltip} />
            </div>
          ) : (
            <p className="text-gray-300 mb-4">
              <ColoredText text={ability.description} />
            </p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 text-sm">
            {ability.manaCost !== undefined && (
              <div className="text-blue-300"><span className="text-gray-400">Mana:</span> {ability.manaCost}</div>
            )}
            {ability.cooldown !== undefined && (
              <div className="text-purple-300"><span className="text-gray-400">Cooldown:</span> {ability.cooldown}s</div>
            )}
            {ability.range !== undefined && (
              <div className="text-green-300"><span className="text-gray-400">Range:</span> {ability.range}</div>
            )}
            {ability.areaOfEffect !== undefined && (
              <div className="text-green-300"><span className="text-gray-400">AOE:</span> {ability.areaOfEffect}</div>
            )}
            {ability.maxTargets !== undefined && (
              <div className="text-purple-300"><span className="text-gray-400">Max Targets:</span> {ability.maxTargets}</div>
            )}
            {ability.duration !== undefined && (
              <div className="text-orange-300"><span className="text-gray-400">Duration:</span> {ability.duration}s</div>
            )}
            {ability.castTime !== undefined && typeof ability.castTime === 'number' && (
              <div className="text-cyan-300"><span className="text-gray-400">Cast Time:</span> {ability.castTime}s</div>
            )}
            {ability.hotkey && (
              <div className="text-amber-300"><span className="text-gray-400">Hotkey:</span> [{ability.hotkey}]</div>
            )}
            {ability.targetsAllowed && (
              <div className="col-span-2 md:col-span-4">
                <span className="text-gray-400 text-sm">Targets:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {ability.targetsAllowed.split(',').map((target, idx) => (
                    <span
                      key={idx}
                      className="inline-block bg-blue-500/20 border border-blue-500/50 rounded px-2 py-0.5 text-xs text-blue-200 capitalize"
                    >
                      {target.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {ability.damage && (
            <div className="text-red-300 text-sm mb-3"><span className="text-gray-400">Damage:</span> {ability.damage}</div>
          )}

          {ability.effects && ability.effects.length > 0 && (
            <div className="mb-4">
              <h2 className="text-amber-300 text-lg font-semibold mb-2">Effects</h2>
              <ul className="list-disc list-inside text-gray-300">
                {ability.effects.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}

          {ability.levels && Object.keys(ability.levels).length > 0 && (
            <div className="mb-4">
              <h2 className="text-amber-300 text-lg font-semibold mb-3">Level Scaling</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(ability.levels).map(([level, data]) => (
                  <div key={level} className="bg-black/20 rounded p-3 border border-amber-500/20">
                    <h3 className="font-medieval text-amber-300 mb-2">Level {level}</h3>
                    <div className="space-y-1 text-sm">
                      {data.damage !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Damage:</span>
                          <span className="text-red-400">{data.damage}</span>
                        </div>
                      )}
                      {data.manaCost !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Mana:</span>
                          <span className="text-blue-400">{data.manaCost}</span>
                        </div>
                      )}
                      {data.cooldown !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Cooldown:</span>
                          <span className="text-purple-400">{data.cooldown}s</span>
                        </div>
                      )}
                      {data.range !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Range:</span>
                          <span className="text-green-400">{data.range}</span>
                        </div>
                      )}
                      {data.areaOfEffect !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">AOE:</span>
                          <span className="text-green-400">{data.areaOfEffect}</span>
                        </div>
                      )}
                      {data.duration !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Duration:</span>
                          <span className="text-orange-400">{data.duration}s</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ability.availableToClasses && ability.availableToClasses.length > 0 && (
            <div className="mb-4">
              <h2 className="text-amber-300 text-lg font-semibold mb-3">Available to Classes</h2>
              <div className="flex flex-wrap gap-2">
                {ability.availableToClasses
                  .filter((className) => getClassBySlug(className)) // Only show links for valid classes
                  .map((className) => (
                    <Link
                      key={className}
                      href={`/guides/classes/${className}`}
                      prefetch={false}
                      className="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 rounded px-3 py-1 text-sm transition-colors text-amber-200 hover:text-amber-100"
                    >
                      {className.charAt(0).toUpperCase() + className.slice(1)}
                    </Link>
                  ))}
              </div>
            </div>
          )}

          {ability.spellbook && (
            <div className="mb-4">
              <span className="inline-block bg-purple-500/20 border border-purple-500/50 rounded px-3 py-1 text-sm text-purple-300">
                {ability.spellbook === 'hero' ? 'Hero Ability' : 'Normal Ability'}
              </span>
            </div>
          )}
        </Section>
      </div>
    </ErrorBoundary>
  );
}
