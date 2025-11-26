import { getStaticPropsWithTranslations } from '@/features/shared/lib/getStaticProps';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { ITEMS_DATA, ITEMS_BY_CATEGORY, searchItems } from '@/features/modules/guides/data/items';
import { ItemCategory, ItemData } from '@/types/items';
import GuideCard from '@/features/modules/guides/components/GuideCard';
import GuideIcon from '@/features/modules/guides/components/GuideIcon';

const pageNamespaces = ["common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

const categoryDisplayNames: Record<ItemCategory, string> = {
  'raw-materials': 'Raw Materials',
  'weapons': 'Weapons',
  'armor': 'Armor',
  'potions': 'Potions',
  'scrolls': 'Scrolls',
  'buildings': 'Buildings',
  'unknown': 'Unknown',
};

const categoryEmojis: Record<ItemCategory, string> = {
  'raw-materials': '🌿',
  'weapons': '⚔️',
  'armor': '🛡️',
  'potions': '🧪',
  'scrolls': '📜',
  'buildings': '🏠',
  'unknown': '❓',
};

function ItemCard({ item }: { item: ItemData }) {
  const recipeBadges = (item.recipe || []).map((ingredient) => ({
    label: ingredient.replace('-', ' '),
    variant: 'amber' as const,
  }));

  const craftedAtBadges = item.craftedAt
    ? [{ label: item.craftedAt, variant: 'blue' as const }]
    : [];

  const statBadges: { label: string; variant: 'red' | 'blue' | 'green' | 'purple' }[] = [];
  if (item.stats) {
    if (typeof item.stats.damage === 'number') statBadges.push({ label: `Damage: ${item.stats.damage}`, variant: 'red' });
    if (typeof item.stats.armor === 'number') statBadges.push({ label: `Armor: ${item.stats.armor}`, variant: 'blue' });
    if (typeof item.stats.health === 'number') statBadges.push({ label: `Health: +${item.stats.health}`, variant: 'green' });
    if (typeof item.stats.mana === 'number') statBadges.push({ label: `Mana: +${item.stats.mana}`, variant: 'purple' });
  }

  const otherEffects = item.stats?.other && item.stats.other.length > 0
    ? item.stats.other.map((e) => ({ label: e, variant: 'green' as const }))
    : [];

  const icon = (
    <GuideIcon 
      category="items" 
      name={item.name} 
      size={48}
      src={item.iconPath ? `/icons/itt/${item.iconPath}` : undefined}
    />
  );

  return (
    <GuideCard
      href={`/guides/items/${item.id}`}
      title={item.name}
      icon={icon}
      description={item.description}
      primaryTagGroup={recipeBadges.length ? { label: 'Recipe:', badges: recipeBadges } : undefined}
      secondaryTagGroup={{
        label: craftedAtBadges.length ? 'Crafted at:' : undefined,
        badges: [...craftedAtBadges, ...statBadges, ...otherEffects],
      }}
    />
  );
}

function CategorySection({ category, items }: { category: ItemCategory; items: ItemData[] }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="mb-8">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full p-4 bg-black/50 backdrop-blur-sm border border-amber-500/30 rounded-lg hover:border-amber-400/50 transition-colors mb-4"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{categoryEmojis[category]}</span>
          <h2 className="font-medieval-brand text-2xl text-amber-400">
            {categoryDisplayNames[category]}
          </h2>
          <span className="text-gray-400 text-sm">({items.length} items)</span>
        </div>
        <span className={`text-amber-400 transform transition-transform ${expanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {expanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ItemsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all');
  const hasItemData = ITEMS_DATA.length > 0;

  const filteredItems = useMemo(() => {
    let items = ITEMS_DATA;

    // Filter by search query
    if (searchQuery.trim()) {
      items = searchItems(searchQuery.trim());
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      items = items.filter(item => item.category === selectedCategory);
    }

    return items;
  }, [searchQuery, selectedCategory]);

  const itemsByCategory = useMemo(() => {
    const result: Record<ItemCategory, ItemData[]> = {
      'raw-materials': [],
      'weapons': [],
      'armor': [],
      'potions': [],
      'scrolls': [],
      'buildings': [],
      'unknown': [],
    };

    filteredItems.forEach(item => {
      result[item.category].push(item);
    });

    return result;
  }, [filteredItems]);

  if (!hasItemData) {
    return (
      <div className="min-h-[calc(100vh-8rem)] px-6 py-10 max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/guides" className="text-amber-400 hover:text-amber-300">← Back to Guides</Link>
        </div>

        <h1 className="font-medieval-brand text-4xl md:text-5xl mb-4">Items</h1>
        <p className="text-gray-300 mb-6">Item data has not been generated yet.</p>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6 text-amber-100">
          <p className="font-semibold mb-2">No item entries available.</p>
          <p className="text-sm text-amber-100/90">
            Run <code className="px-1 py-0.5 bg-black/40 rounded text-amber-200">python src/features/infrastructure/extraction/scripts/current/manage_extraction.py pipeline</code>
            {' '}to rebuild <code className="px-1 py-0.5 bg-black/40 rounded text-amber-200">items.ts</code> and its category files before viewing this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] px-6 py-10 max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/guides" className="text-amber-400 hover:text-amber-300">← Back to Guides</Link>
        </div>

        <div className="mb-8">
          <h1 className="font-medieval-brand text-4xl md:text-5xl mb-4">Items</h1>
          <p className="text-gray-300 mb-6 text-lg leading-relaxed">
            Comprehensive catalog of all items available in Island Troll Tribes. 
            From basic materials to powerful artifacts, weapons, and buildings.
          </p>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
            <p className="text-amber-200 text-sm">
              <strong>Total Items:</strong> {ITEMS_DATA.length} • 
              <strong> Categories:</strong> {Object.keys(categoryDisplayNames).length} • 
              <strong> Craftable Items:</strong> {ITEMS_DATA.filter(item => item.recipe).length}
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search items by name, description, or recipe ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-black/30 border border-amber-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-400/50 focus:bg-black/40"
            />
            <span className="absolute right-3 top-3 text-gray-400">🔍</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-amber-500 text-black font-semibold'
                  : 'bg-black/30 text-gray-300 hover:bg-black/50 border border-amber-500/30'
              }`}
            >
              All Categories
            </button>
            {(Object.keys(categoryDisplayNames) as ItemCategory[]).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                  selectedCategory === category
                    ? 'bg-amber-500 text-black font-semibold'
                    : 'bg-black/30 text-gray-300 hover:bg-black/50 border border-amber-500/30'
                }`}
              >
                <span>{categoryEmojis[category]}</span>
                {categoryDisplayNames[category]}
                <span className="text-xs opacity-75">
                  ({ITEMS_BY_CATEGORY[category]?.length || 0})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {searchQuery.trim() && (
          <div className="mb-6">
            <p className="text-gray-300">
              Found <span className="text-amber-400 font-semibold">{filteredItems.length}</span> items 
              matching &quot;{searchQuery}&quot;
            </p>
          </div>
        )}

        {/* Items Display */}
        {selectedCategory === 'all' ? (
          // Show all categories
          <div className="space-y-8">
            {(Object.keys(categoryDisplayNames) as ItemCategory[]).map((category) => {
              const categoryItems = itemsByCategory[category];
              if (categoryItems.length === 0) return null;
              
              return (
                <CategorySection 
                  key={category} 
                  category={category} 
                  items={categoryItems} 
                />
              );
            })}
          </div>
        ) : (
          // Show single category
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {itemsByCategory[selectedCategory].map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-medieval-brand text-2xl text-gray-400 mb-2">No items found</h3>
            <p className="text-gray-500">
              Try adjusting your search terms or selecting a different category.
            </p>
          </div>
        )}
      </div>
  );
}