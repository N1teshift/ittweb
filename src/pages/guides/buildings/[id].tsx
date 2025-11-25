import { GetStaticPaths, GetStaticProps } from 'next';
import { getStaticPropsWithTranslations } from '@/features/shared/lib/getStaticProps';
import Link from 'next/link';
import { BUILDINGS, BuildingData, getBuildingById } from '@/features/ittweb/guides/data/buildings';

type Props = { building: BuildingData };

const pageNamespaces = ["common"];

export const getStaticProps: GetStaticProps<Props> = async ({ params, locale }) => {
  const id = String(params?.id || '');
  const building = getBuildingById(id);
  if (!building) {
    return { notFound: true };
  }
  const base = await getStaticPropsWithTranslations(pageNamespaces)({ locale: locale as string });
  return { props: { ...(base as any).props, building } };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = BUILDINGS.map(b => ({ params: { id: b.id } }));
  return { paths, fallback: false };
};

export default function BuildingDetail({ building }: Props) {
  return (
    <div className="min-h-[calc(100vh-8rem)] px-6 py-10 max-w-4xl mx-auto">
      <div className="mb-6 space-x-4">
        <Link href="/guides/buildings" className="text-amber-400 hover:text-amber-300">← Buildings</Link>
        <Link href="/guides" className="text-amber-400 hover:text-amber-300">Guides</Link>
      </div>

      <div className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-6 space-y-6">
        <div>
          <h1 className="font-medieval-brand text-3xl md:text-4xl text-amber-400 mb-2">{building.name}</h1>
          <p className="text-gray-300">{building.description || 'Description coming soon from extraction data.'}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-black/30 border border-amber-500/20 rounded-lg p-4">
            <h2 className="text-amber-300 text-lg font-semibold mb-3">Stats</h2>
            <dl className="space-y-2 text-sm text-gray-200">
              <div className="flex justify-between">
                <dt className="text-gray-400">HP</dt>
                <dd>{building.hp ?? '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Armor</dt>
                <dd>{building.armor ?? '—'}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-black/30 border border-amber-500/20 rounded-lg p-4">
            <h2 className="text-amber-300 text-lg font-semibold mb-3">Craftable Items</h2>
            {building.craftableItems?.length ? (
              <div className="flex flex-wrap gap-2">
                {building.craftableItems.map((itemId) => (
                  <span key={itemId} className="text-xs bg-amber-500/20 text-amber-100 px-2 py-1 rounded">
                    {itemId.toLowerCase()}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No items linked yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
