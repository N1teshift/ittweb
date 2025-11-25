import { getStaticPropsWithTranslations } from '@/features/shared/lib/getStaticProps';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import GuideCard from '@/features/ittweb/guides/components/GuideCard';
import GuideIcon from '@/features/ittweb/guides/components/GuideIcon';
import { BUILDINGS, BuildingData } from '@/features/ittweb/guides/data/buildings';

const pageNamespaces = ["common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

function BuildingCard({ building }: { building: BuildingData }) {
  const icon = (
    <GuideIcon category="buildings" name={building.name} size={48} />
  );

  const craftableBadges = (building.craftableItems || []).slice(0, 8).map((itemId) => ({
    label: itemId.replace(/^ITEM_/, '').replace(/_/g, ' ').toLowerCase(),
    variant: 'amber' as const,
  }));

  return (
    <GuideCard
      href={`/guides/buildings/${building.id}`}
      title={building.name}
      icon={icon}
      description={building.description || 'Details coming soon from extraction data.'}
      primaryTagGroup={
        craftableBadges.length
          ? { label: `Crafts ${building.craftableItems?.length ?? 0} items`, badges: craftableBadges }
          : undefined
      }
    />
  );
}

export default function BuildingsPage() {
  const hasBuildingData = BUILDINGS.length > 0;

  if (!hasBuildingData) {
    return (
      <div className="min-h-[calc(100vh-8rem)] px-6 py-10 max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/guides" className="text-amber-400 hover:text-amber-300">← Back to Guides</Link>
        </div>

        <h1 className="font-medieval-brand text-4xl md:text-5xl mb-4">Buildings</h1>
        <p className="text-gray-300 mb-6">Building data has not been generated yet.</p>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6 text-amber-100">
          <p className="font-semibold mb-2">No building entries available.</p>
          <p className="text-sm text-amber-100/90">
            Run <code className="px-1 py-0.5 bg-black/40 rounded text-amber-200">python src/features/infrastructure/extraction/scripts/current/manage_extraction.py pipeline</code>
            {' '}to rebuild <code className="px-1 py-0.5 bg-black/40 rounded text-amber-200">buildings.ts</code>.
          </p>
        </div>
      </div>
    );
  }

  const [searchQuery, setSearchQuery] = useState('');

  const filteredBuildings = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return BUILDINGS;

    return BUILDINGS.filter((building) => {
      const haystack = [
        building.name,
        building.description,
        ...(building.craftableItems || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [searchQuery]);

  const totalBuildings = BUILDINGS.length;
  const totalCraftableLinks = BUILDINGS.reduce((acc, b) => acc + (b.craftableItems?.length || 0), 0);

  return (
    <div className="min-h-[calc(100vh-8rem)] px-6 py-10 max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/guides" className="text-amber-400 hover:text-amber-300">← Back to Guides</Link>
        </div>

        <div className="mb-8">
          <h1 className="font-medieval-brand text-4xl md:text-5xl mb-4">Buildings</h1>
          <p className="text-gray-300 mb-6 text-lg leading-relaxed">
            Complete list of all core buildings found in Island Troll Tribes. These are extracted directly from the map source.
          </p>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6 grid gap-3 md:grid-cols-3 text-amber-100 text-sm">
            <p><strong>Total Buildings:</strong> {totalBuildings}</p>
            <p><strong>Craftable item links:</strong> {totalCraftableLinks}</p>
            <p><strong>Showing:</strong> {filteredBuildings.length}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search buildings by name, description, or craftable items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-black/30 border border-amber-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-400/50 focus:bg-black/40"
            />
            <span className="absolute right-3 top-3 text-gray-400">🔍</span>
          </div>
        </div>

        {searchQuery.trim() && (
          <div className="mb-6 text-gray-300">
            Showing <span className="text-amber-400 font-semibold">{filteredBuildings.length}</span> buildings matching “{searchQuery}”.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBuildings.map((b) => (
            <BuildingCard key={b.id} building={b} />
          ))}
        </div>

        {filteredBuildings.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="font-medieval-brand text-2xl text-gray-400 mb-2">No buildings found</h3>
            <p className="text-gray-500">Try adjusting your search keywords.</p>
          </div>
        )}
      </div>
  );
}
