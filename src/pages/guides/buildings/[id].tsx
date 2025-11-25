import { GetStaticPaths, GetStaticProps } from 'next';
import { getStaticPropsWithTranslations } from '@/features/shared/lib/getStaticProps';
import Link from 'next/link';
import { ItemData } from '@/types/items';
import { ITEMS_DATA, getItemById } from '@/features/ittweb/guides/data/items';

type Props = { building: ItemData };

const pageNamespaces = ["common"];

export const getStaticProps: GetStaticProps<Props> = async ({ params, locale }) => {
  const id = String(params?.id || '');
  const building = getItemById(id);
  if (!building || building.category !== 'buildings') {
    return { notFound: true };
  }
  const base = await getStaticPropsWithTranslations(pageNamespaces)({ locale: locale as string });
  return { props: { ...(base as any).props, building } };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = ITEMS_DATA.filter(i => i.category === 'buildings').map(b => ({ params: { id: b.id } }));
  return { paths, fallback: false };
};

export default function BuildingDetail({ building }: Props) {
  return (
    <div className="min-h-[calc(100vh-8rem)] px-6 py-10 max-w-4xl mx-auto">
        <div className="mb-6 space-x-4">
          <Link href="/guides/buildings" className="text-amber-400 hover:text-amber-300">← Buildings</Link>
          <Link href="/guides" className="text-amber-400 hover:text-amber-300">Guides</Link>
        </div>

        <div className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-6">
          <h1 className="font-medieval-brand text-3xl md:text-4xl text-amber-400 mb-2">{building.name}</h1>
          <p className="text-gray-300 mb-4">{building.description}</p>

          {building.recipe && building.recipe.length > 0 && (
            <div className="mb-4">
              <h2 className="text-amber-300 text-lg font-semibold mb-2">Recipe</h2>
              <div className="flex flex-wrap gap-2">
                {building.recipe.map((ingredient, index) => (
                  <span key={index} className="text-xs bg-amber-500/20 text-amber-200 px-2 py-1 rounded">
                    {ingredient.replace('-', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {building.stats && (
            <div className="space-y-2">
              {building.stats.damage !== undefined && (
                <div className="text-sm text-red-300">⚔️ Damage: {building.stats.damage}</div>
              )}
              {building.stats.armor !== undefined && (
                <div className="text-sm text-blue-300">🛡️ Armor: {building.stats.armor}</div>
              )}
              {building.stats.health !== undefined && (
                <div className="text-sm text-green-300">❤️ Health: +{building.stats.health}</div>
              )}
              {building.stats.mana !== undefined && (
                <div className="text-sm text-purple-300">🔮 Mana: +{building.stats.mana}</div>
              )}
              {building.stats.other && building.stats.other.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {building.stats.other.map((effect, index) => (
                    <span key={index} className="text-xs bg-green-500/20 text-green-200 px-2 py-1 rounded">
                      {effect}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
  );
}
