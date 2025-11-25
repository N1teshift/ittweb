import { GetStaticPaths, GetStaticProps } from 'next';
import { getStaticPropsWithTranslations } from '@/features/shared/lib/getStaticProps';
import Link from 'next/link';
import { AbilityData } from '@/features/ittweb/guides/data/abilities';
import { ABILITIES, ABILITY_CATEGORIES, getAbilityById } from '@/features/ittweb/guides/data/abilities';

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
  return (
    <div className="min-h-[calc(100vh-8rem)] px-6 py-10 max-w-4xl mx-auto">
        <div className="mb-6 space-x-4">
          <Link href="/guides/abilities" className="text-amber-400 hover:text-amber-300">← Abilities</Link>
          <Link href="/guides" className="text-amber-400 hover:text-amber-300">Guides</Link>
        </div>

        <div className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-6">
          <div className="flex items-start justify-between mb-2">
            <h1 className="font-medieval-brand text-3xl md:text-4xl text-amber-400">{ability.name}</h1>
            <div className="flex gap-2">
              <span className="text-xs bg-amber-500/20 text-amber-200 px-2 py-1 rounded">
                {ABILITY_CATEGORIES[ability.category] || ability.category}
              </span>
              {ability.classRequirement && (
                <span className="text-xs bg-amber-500/20 text-amber-200 px-2 py-1 rounded">{ability.classRequirement}</span>
              )}
            </div>
          </div>

          <p className="text-gray-300 mb-4">{ability.description}</p>

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
            {ability.duration !== undefined && (
              <div className="text-orange-300"><span className="text-gray-400">Duration:</span> {ability.duration}s</div>
            )}
          </div>

          {ability.damage && (
            <div className="text-red-300 text-sm mb-3"><span className="text-gray-400">Damage:</span> {ability.damage}</div>
          )}

          {ability.effects && ability.effects.length > 0 && (
            <div>
              <h2 className="text-amber-300 text-lg font-semibold mb-2">Effects</h2>
              <ul className="list-disc list-inside text-gray-300">
                {ability.effects.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
  );
}
