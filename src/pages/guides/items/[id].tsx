import { GetStaticPaths, GetStaticProps } from 'next';
import { getStaticPropsWithTranslations } from '@/features/shared/lib/getStaticProps';
import Layout from '@/features/shared/components/Layout';
import Link from 'next/link';
import { ITEMS_DATA, getItemById } from '@/features/guides/data/items';
import { ItemData } from '@/types/items';

type Props = { item: ItemData };

const pageNamespaces = ["common"];

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: ITEMS_DATA.map((item) => ({ params: { id: item.id } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params, locale }) => {
  const id = String(params?.id || '');
  const item = getItemById(id);
  if (!item) {
    return { notFound: true };
  }
  const base = await getStaticPropsWithTranslations(pageNamespaces)({ locale: locale as string });
  return {
    props: {
      ...(base as any).props,
      item,
    },
  };
};

function StatBadge({ label, value, colorClass }: { label: string; value: string | number; colorClass: string }) {
  return (
    <span className={`text-xs ${colorClass} px-2 py-1 rounded`}>{label}: {value}</span>
  );
}

export default function ItemDetailPage({ item }: Props) {
  return (
    <Layout pageTranslationNamespaces={pageNamespaces}>
      <div className="min-h-[calc(100vh-8rem)] px-6 py-10 max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/guides/items" className="text-amber-400 hover:text-amber-300 underline underline-offset-4">← Items Overview</Link>
        </div>

        <header className="mb-6">
          <h1 className="font-medieval-brand text-4xl md:text-5xl mb-2 text-amber-400">{item.name}</h1>
          <p className="text-gray-300 text-lg leading-relaxed max-w-3xl">{item.description}</p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <section className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-6">
            <h2 className="font-medieval-brand text-2xl mb-3">Details</h2>
            <div className="space-y-2 text-gray-300">
              <div>
                <span className="text-gray-400">Category:</span>{' '}
                <span className="text-amber-300 capitalize">{item.category.replace('-', ' ')}</span>
              </div>
              {item.subcategory && (
                <div>
                  <span className="text-gray-400">Subcategory:</span>{' '}
                  <span className="text-amber-300 capitalize">{item.subcategory.replace('-', ' ')}</span>
                </div>
              )}
              {item.craftedAt && (
                <div>
                  <span className="text-gray-400">Crafted at:</span>{' '}
                  <span className="text-blue-300">{item.craftedAt}</span>
                </div>
              )}
            </div>
          </section>

          <section className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-6">
            <h2 className="font-medieval-brand text-2xl mb-3">Stats</h2>
            {item.stats ? (
              <div className="flex flex-wrap gap-2">
                {typeof item.stats.damage === 'number' && (
                  <StatBadge label="Damage" value={item.stats.damage} colorClass="bg-red-500/20 text-red-200" />
                )}
                {typeof item.stats.armor === 'number' && (
                  <StatBadge label="Armor" value={item.stats.armor} colorClass="bg-blue-500/20 text-blue-200" />
                )}
                {typeof item.stats.health === 'number' && (
                  <StatBadge label="Health" value={`+${item.stats.health}`} colorClass="bg-green-500/20 text-green-200" />
                )}
                {typeof item.stats.mana === 'number' && (
                  <StatBadge label="Mana" value={`+${item.stats.mana}`} colorClass="bg-purple-500/20 text-purple-200" />
                )}
                {(item.stats.other || []).map((eff, i) => (
                  <span key={i} className="text-xs bg-green-500/20 text-green-200 px-2 py-1 rounded">{eff}</span>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No stats available.</p>
            )}
          </section>

          <section className="md:col-span-2 bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-6">
            <h2 className="font-medieval-brand text-2xl mb-3">Recipe</h2>
            {item.recipe && item.recipe.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {item.recipe.map((ing, i) => (
                  <span key={i} className="text-sm bg-amber-500/20 text-amber-200 px-2 py-1 rounded">
                    {ing.replace('-', ' ')}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No recipe required.</p>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
}
