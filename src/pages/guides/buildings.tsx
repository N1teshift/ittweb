import { getStaticPropsWithTranslations } from '@/features/shared/lib/getStaticProps';
import Layout from '@/features/shared/components/Layout';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ITEMS_DATA, getItemsByCategory, getItemsBySubcategory, searchItems } from '@/features/guides/data/items';
import { ItemData, ItemSubcategory } from '@/types/items';

const pageNamespaces = ["common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

const buildingSubcategories: ItemSubcategory[] = [
  'stat-management',
  'storage',
  'crafting',
  'defensive',
  'special-buildings',
];

const subcategoryLabels: Record<ItemSubcategory, string> = {
  'herbs': 'Herbs',
  'materials': 'Materials',
  'healing-potions': 'Healing',
  'mana-potions': 'Mana',
  'special-potions': 'Special',
  'stat-management': 'Stat Management',
  'storage': 'Storage',
  'crafting': 'Crafting',
  'defensive': 'Defensive',
  'special-buildings': 'Special',
};

const subcategoryEmojis: Record<ItemSubcategory, string> = {
  'herbs': '🌿',
  'materials': '🪨',
  'healing-potions': '❤️',
  'mana-potions': '🔮',
  'special-potions': '✨',
  'stat-management': '🔥',
  'storage': '📦',
  'crafting': '⚒️',
  'defensive': '🏹',
  'special-buildings': '🌀',
};

function BuildingCard({ building }: { building: ItemData }) {
  return (
    <Link href={`/guides/buildings/${building.id}`} className="block">
      <div className="bg-black/40 backdrop-blur-sm border border-amber-500/30 rounded-lg p-4 hover:border-amber-400/50 transition-colors">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medieval-brand text-lg text-amber-400">{building.name}</h3>
          {building.subcategory && (
            <span className="text-xs bg-amber-500/20 text-amber-200 px-2 py-1 rounded flex items-center gap-1">
              <span>{subcategoryEmojis[building.subcategory]}</span>
              {subcategoryLabels[building.subcategory]}
            </span>
          )}
        </div>

        <p className="text-gray-300 text-sm mb-3 leading-relaxed">
          {building.description}
        </p>

        {building.recipe && building.recipe.length > 0 && (
          <div className="mb-3">
            <h4 className="text-amber-300 text-sm font-semibold mb-1">Recipe:</h4>
            <div className="flex flex-wrap gap-1">
              {building.recipe.map((ingredient, index) => (
                <span key={index} className="text-xs bg-amber-500/20 text-amber-200 px-2 py-1 rounded">
                  {ingredient.replace('-', ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {building.stats && building.stats.other && building.stats.other.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {building.stats.other.map((effect, index) => (
              <span
                key={index}
                className="text-xs bg-green-500/20 text-green-200 px-2 py-1 rounded"
              >
                {effect}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function BuildingsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<ItemSubcategory | 'all'>('all');

  const allBuildings = useMemo(() => getItemsByCategory('buildings'), []);

  const filteredBuildings = useMemo(() => {
    let result: ItemData[] = allBuildings;

    if (searchQuery.trim()) {
      // search across all items then restrict to buildings
      result = searchItems(searchQuery.trim()).filter((i) => i.category === 'buildings');
    }

    if (selectedSubcategory !== 'all') {
      result = result.filter((b) => b.subcategory === selectedSubcategory);
    }

    return result;
  }, [allBuildings, searchQuery, selectedSubcategory]);

  const buildingsBySubcategory = useMemo(() => {
    const groups: Record<ItemSubcategory, ItemData[]> = {
      'herbs': [],
      'materials': [],
      'healing-potions': [],
      'mana-potions': [],
      'special-potions': [],
      'stat-management': [],
      'storage': [],
      'crafting': [],
      'defensive': [],
      'special-buildings': [],
    };

    filteredBuildings.forEach((b) => {
      if (b.subcategory && groups[b.subcategory]) {
        groups[b.subcategory].push(b);
      }
    });

    return groups;
  }, [filteredBuildings]);

  const totalBuildings = allBuildings.length;

  return (
    <Layout pageTranslationNamespaces={pageNamespaces}>
      <div className="min-h-[calc(100vh-8rem)] px-6 py-10 max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/guides" className="text-amber-400 hover:text-amber-300 underline underline-offset-4">← Back to Guides</Link>
        </div>

        <div className="mb-8">
          <h1 className="font-medieval-brand text-4xl md:text-5xl mb-4">Buildings</h1>
          <p className="text-gray-300 mb-6 text-lg leading-relaxed">
            Complete list of all buildings available in Island Troll Tribes, organized by function and type.
          </p>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
            <p className="text-amber-200 text-sm">
              <strong>Total Buildings:</strong> {totalBuildings} •
              <strong> Categories:</strong> {buildingSubcategories.length}
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search buildings by name, description, or recipe ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-black/30 border border-amber-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-400/50 focus:bg-black/40"
            />
            <span className="absolute right-3 top-3 text-gray-400">🔍</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSubcategory('all')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                selectedSubcategory === 'all'
                  ? 'bg-amber-500 text-black font-semibold'
                  : 'bg-black/30 text-gray-300 hover:bg-black/50 border border-amber-500/30'
              }`}
            >
              All Types
            </button>
            {buildingSubcategories.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubcategory(sub)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                  selectedSubcategory === sub
                    ? 'bg-amber-500 text-black font-semibold'
                    : 'bg-black/30 text-gray-300 hover:bg-black/50 border border-amber-500/30'
                }`}
              >
                <span>{subcategoryEmojis[sub]}</span>
                {subcategoryLabels[sub]}
                <span className="text-xs opacity-75">
                  ({getItemsBySubcategory(sub).filter(i => i.category === 'buildings').length})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {searchQuery.trim() && (
          <div className="mb-6">
            <p className="text-gray-300">
              Found <span className="text-amber-400 font-semibold">{filteredBuildings.length}</span> buildings
              matching &quot;{searchQuery}&quot;
            </p>
          </div>
        )}

        {/* Buildings Display */}
        {selectedSubcategory === 'all' ? (
          <div className="space-y-8">
            {buildingSubcategories.map((sub) => {
              const buildings = buildingsBySubcategory[sub];
              if (!buildings || buildings.length === 0) return null;
              return (
                <div key={sub} className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{subcategoryEmojis[sub]}</span>
                    <h2 className="font-medieval-brand text-2xl text-amber-400">
                      {subcategoryLabels[sub]}
                    </h2>
                    <span className="text-gray-400 text-sm">({buildings.length} buildings)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {buildings.map((b) => (
                      <BuildingCard key={b.id} building={b} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBuildings.map((b) => (
              <BuildingCard key={b.id} building={b} />
            ))}
          </div>
        )}

        {filteredBuildings.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="font-medieval-brand text-2xl text-gray-400 mb-2">No buildings found</h3>
            <p className="text-gray-500">Try adjusting your search or selecting a different type.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
