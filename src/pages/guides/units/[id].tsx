import { GetStaticPaths, GetStaticProps } from 'next';
import { getStaticPropsWithTranslations } from '@/features/infrastructure/lib/getStaticProps';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ALL_UNITS, getUnitById, UnitData } from '@/features/modules/guides/data/units/allUnits';
import { getItemById } from '@/features/modules/guides/data/items';
import GuideIcon from '@/features/modules/guides/components/GuideIcon';
import { ColoredText } from '@/features/modules/guides/components/ColoredText';

type Props = { unit: UnitData };

const pageNamespaces = ["common"];

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: ALL_UNITS.map((unit) => ({ 
      params: { id: encodeURIComponent(unit.id) } 
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params, locale }) => {
  const encodedId = String(params?.id || '');
  const id = decodeURIComponent(encodedId);
  const unit = getUnitById(id);
  if (!unit) {
    return { notFound: true };
  }
  const base = await getStaticPropsWithTranslations(pageNamespaces)({ locale: locale as string });
  return {
    props: {
      ...base.props,
      unit,
    },
  };
};

function StatBadge({ label, value, colorClass }: { label: string; value: string | number; colorClass: string }) {
  return (
    <span className={`text-xs ${colorClass} px-2 py-1 rounded`}>{label}: {value}</span>
  );
}

const typeDisplayNames: Record<string, string> = {
  'troll': 'Troll',
  'animal': 'Animal',
  'boss': 'Boss',
  'building': 'Building',
  'unit-dummy-item-reward': 'Unit Dummy Item Reward',
  'dummy': 'Dummy',
  'other': 'Other',
};

export default function UnitDetailPage({ unit }: Props) {
  const router = useRouter();
  const fromItem = router.query.from === 'item';
  const itemId = router.query.itemId as string | undefined;
  const item = itemId ? getItemById(itemId) : null;

  const icon = unit.iconPath ? (
    <GuideIcon 
      category="units" 
      name={unit.name} 
      size={64}
      src={`/icons/itt/${unit.iconPath}`}
    />
  ) : (
    <GuideIcon category="units" name={unit.name} size={64} />
  );

  return (
    <div className="min-h-[calc(100vh-8rem)] px-6 py-10 max-w-4xl mx-auto">
        <div className="mb-6 space-x-4">
          {fromItem && item ? (
            <>
              <Link href={`/guides/items/${item.id}`} className="text-amber-400 hover:text-amber-300">
                ← Back to {item.name}
              </Link>
              <span className="text-gray-500">•</span>
              <Link href="/guides/units" className="text-amber-400 hover:text-amber-300">All Units</Link>
            </>
          ) : (
            <Link href="/guides/units" className="text-amber-400 hover:text-amber-300">← Units Overview</Link>
          )}
        </div>

        <header className="mb-6 flex items-start gap-4">
          <div className="flex-shrink-0">
            {icon}
          </div>
          <div className="flex-1">
            <h1 className="font-medieval-brand text-4xl md:text-5xl mb-2 text-amber-400">{unit.name}</h1>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-xs bg-gray-500/20 text-gray-300 px-2 py-1 rounded capitalize">
                {typeDisplayNames[unit.type] || unit.type}
              </span>
              {unit.race && (
                <span className="text-xs bg-gray-500/20 text-gray-300 px-2 py-1 rounded">
                  {unit.race}
                </span>
              )}
              {unit.classification && unit.classification !== '_' && (
                <span className="text-xs bg-gray-500/20 text-gray-300 px-2 py-1 rounded">
                  {unit.classification}
                </span>
              )}
            </div>
            {unit.tooltip ? (
              <div className="text-gray-300 text-lg leading-relaxed">
                <ColoredText text={unit.tooltip} />
              </div>
            ) : unit.description ? (
              <p className="text-gray-300 text-lg leading-relaxed">
                <ColoredText text={unit.description} />
              </p>
            ) : (
              <p className="text-gray-400 italic">No description available.</p>
            )}
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <section className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-6">
            <h2 className="font-medieval-brand text-2xl mb-3">Details</h2>
            <div className="space-y-2 text-gray-300">
              <div>
                <span className="text-gray-400">Type:</span>{' '}
                <span className="text-amber-300 capitalize">{typeDisplayNames[unit.type] || unit.type}</span>
              </div>
              {unit.race && (
                <div>
                  <span className="text-gray-400">Race:</span>{' '}
                  <span className="text-amber-300">{unit.race}</span>
                </div>
              )}
              {unit.classification && unit.classification !== '_' && (
                <div>
                  <span className="text-gray-400">Classification:</span>{' '}
                  <span className="text-amber-300">{unit.classification}</span>
                </div>
              )}
              {unit.id && (
                <div>
                  <span className="text-gray-400">ID:</span>{' '}
                  <span className="text-gray-500 font-mono text-sm">{unit.id}</span>
                </div>
              )}
            </div>
          </section>

          <section className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-6">
            <h2 className="font-medieval-brand text-2xl mb-3">Stats</h2>
            {(unit.hp !== undefined || unit.mana !== undefined || unit.damage !== undefined || 
              unit.armor !== undefined || unit.moveSpeed !== undefined || unit.attackSpeed !== undefined) ? (
              <div className="flex flex-wrap gap-2">
                {unit.hp !== undefined && (
                  <StatBadge label="HP" value={unit.hp} colorClass="bg-green-500/20 text-green-200" />
                )}
                {unit.mana !== undefined && (
                  <StatBadge label="Mana" value={unit.mana} colorClass="bg-purple-500/20 text-purple-200" />
                )}
                {unit.damage !== undefined && unit.damage >= 0 && (
                  <StatBadge label="Damage" value={unit.damage} colorClass="bg-red-500/20 text-red-200" />
                )}
                {unit.armor !== undefined && (
                  <StatBadge label="Armor" value={unit.armor} colorClass="bg-blue-500/20 text-blue-200" />
                )}
                {unit.moveSpeed !== undefined && (
                  <StatBadge label="Move Speed" value={unit.moveSpeed} colorClass="bg-amber-500/20 text-amber-200" />
                )}
                {unit.attackSpeed !== undefined && (
                  <StatBadge label="Attack Speed" value={unit.attackSpeed} colorClass="bg-yellow-500/20 text-yellow-200" />
                )}
              </div>
            ) : (
              <p className="text-gray-400">No stats available.</p>
            )}
          </section>

          {unit.craftableItems && unit.craftableItems.length > 0 && (
            <section className="md:col-span-2 bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-6">
              <h2 className="font-medieval-brand text-2xl mb-3">Craftable Items</h2>
              <div className="flex flex-wrap gap-2">
                {unit.craftableItems.map((itemId, i) => (
                  <Link
                    key={i}
                    href={`/guides/items/${itemId}`}
                    className="text-sm bg-amber-500/20 text-amber-200 px-2 py-1 rounded hover:bg-amber-500/30 transition-colors"
                  >
                    {itemId.replace(/-/g, ' ')}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
  );
}

