import { getStaticPropsWithTranslations } from '@/features/infrastructure/lib/server';
import { ErrorBoundary } from '@/features/infrastructure/components';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState, useMemo, useEffect } from 'react';
import { ITEMS_DATA, ITEMS_BY_CATEGORY, searchItems, getItemById } from '@/features/modules/content/guides/data/items';
import { ALL_UNITS } from '@/features/modules/content/guides/data/units/allUnits';
import { ItemCategory, ItemData } from '@/types/items';
import GuideCard from '@/features/modules/content/guides/components/GuideCard';
import GuideIcon from '@/features/modules/content/guides/components/GuideIcon';

function IconWithTooltip({ 
  children, 
  tooltipText 
}: { 
  children: React.ReactElement; 
  tooltipText: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div className="relative inline-flex">
      {React.cloneElement(children, {
        ...children.props,
        onMouseEnter: (e: React.MouseEvent) => {
          setIsHovered(true);
          children.props.onMouseEnter?.(e);
        },
        onMouseLeave: (e: React.MouseEvent) => {
          setIsHovered(false);
          children.props.onMouseLeave?.(e);
        }
      })}
      {isHovered && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/95 backdrop-blur-sm text-amber-200 text-xs rounded border border-amber-500/50 whitespace-nowrap pointer-events-none z-50 shadow-lg">
          {tooltipText}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
            <div className="border-4 border-transparent border-t-amber-500/50"></div>
          </div>
        </div>
      )}
    </div>
  );
}

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

function ItemCard({ item, category }: { item: ItemData; category?: ItemCategory | 'all' }) {
  const router = useRouter();
  
  // Helper function to normalize names for matching (same as in detail page)
  const normalizeName = (name: string) => 
    name.toLowerCase().replace(/'/g, '').replace(/\s+/g, ' ').trim();
  
  // Find building for craftedAt
  const craftedAtBuilding = item.craftedAt ? (() => {
    const craftedAtNormalized = normalizeName(item.craftedAt);
    return ALL_UNITS.find(unit => {
      const unitNameNormalized = normalizeName(unit.name);
      return unitNameNormalized === craftedAtNormalized ||
             unit.name.toLowerCase() === item.craftedAt!.toLowerCase();
    });
  })() : null;

  const craftedAtIcon = craftedAtBuilding ? (
    <IconWithTooltip tooltipText={craftedAtBuilding.name}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          router.push(`/guides/units/${encodeURIComponent(craftedAtBuilding.id)}?from=item&itemId=${item.id}`);
        }}
        className="flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer"
      >
        <GuideIcon
          category="units"
          name={craftedAtBuilding.name}
          size={32}
        />
      </button>
    </IconWithTooltip>
  ) : null;
  
  const recipeIcons = (item.recipe || []).map((ingredientSlug, index) => {
    const ingredientItem = getItemById(ingredientSlug);
    if (!ingredientItem) return null;
    
    return (
      <IconWithTooltip key={`${ingredientSlug}-${index}`} tooltipText={ingredientItem.name}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            router.push(`/guides/items/${ingredientItem.id}`);
          }}
          className="flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <GuideIcon
            category={ingredientItem.category === 'buildings' ? 'buildings' : 'items'}
            name={ingredientItem.name}
            size={32}
          />
        </button>
      </IconWithTooltip>
    );
  }).filter(Boolean);

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
      category={item.category === 'buildings' ? 'buildings' : 'items'} 
      name={item.name} 
      size={48}
    />
  );

  const footer = (craftedAtIcon || recipeIcons.length > 0) ? (
    <div className="mt-2 pt-2 border-t border-amber-500/20">
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {craftedAtIcon && (
          <div className="flex-shrink-0">
            <div className="text-amber-300 text-xs font-semibold mb-1">Crafted at:</div>
            <div className="flex flex-wrap gap-2">
              {craftedAtIcon}
            </div>
          </div>
        )}
        {recipeIcons.length > 0 && (
          <div className="flex-shrink-0">
            <div className="text-amber-300 text-xs font-semibold mb-1">Recipe:</div>
            <div className="flex flex-wrap gap-2">
              {recipeIcons}
            </div>
          </div>
        )}
      </div>
    </div>
  ) : null;

  const itemHref = category && category !== 'all' 
    ? `/guides/items/${item.id}?category=${category}`
    : `/guides/items/${item.id}`;

  return (
    <GuideCard
      href={itemHref}
      title={item.name}
      icon={icon}
      description={item.description}
      secondaryTagGroup={{
        badges: [...statBadges, ...otherEffects],
      }}
      footer={footer}
    />
  );
}

function CategorySection({ category, items, selectedCategory }: { category: ItemCategory; items: ItemData[]; selectedCategory: ItemCategory | 'all' }) {
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
            <ItemCard key={item.id} item={item} category={selectedCategory} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ItemsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Lazy initializer - reads from URL immediately on client, avoids flash
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>(() => {
    if (typeof window === 'undefined') return 'all'; // SSR
    
    // Read directly from URL for instant initialization
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get('category');
    
    if (categoryParam && (categoryParam === 'all' || Object.keys(categoryDisplayNames).includes(categoryParam))) {
      return categoryParam as ItemCategory | 'all';
    }
    return 'all';
  });
  
  const hasItemData = ITEMS_DATA.length > 0;

  // Sync state with URL query params (handles browser back/forward and router updates)
  useEffect(() => {
    if (!router.isReady) return;
    
    const categoryParam = router.query.category as string | undefined;
    const newCategory = categoryParam && (categoryParam === 'all' || Object.keys(categoryDisplayNames).includes(categoryParam))
      ? (categoryParam as ItemCategory | 'all')
      : 'all';
    
    // Only update if different to avoid unnecessary re-renders
    if (newCategory !== selectedCategory) {
      setSelectedCategory(newCategory);
    }
  }, [router.query.category, router.isReady, selectedCategory]);

  // Update URL when category changes
  const handleCategoryChange = (category: ItemCategory | 'all') => {
    setSelectedCategory(category);
    const query = { ...router.query };
    if (category === 'all') {
      delete query.category;
    } else {
      query.category = category;
    }
    router.push({
      pathname: router.pathname,
      query,
    }, undefined, { shallow: true });
  };

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
      <ErrorBoundary>
      <div className="min-h-[calc(100vh-8rem)] px-6 py-10 max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/guides" className="text-amber-400 hover:text-amber-300">← Back to Guides</Link>
        </div>

        <h1 className="font-medieval-brand text-2xl md:text-4xl mb-4">Items</h1>
        <p className="text-gray-300 mb-6">Item data has not been generated yet.</p>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6 text-amber-100">
          <p className="font-semibold mb-2">No item entries available.</p>
          <p className="text-sm text-amber-100/90">
            Run <code className="px-1 py-0.5 bg-black/40 rounded text-amber-200">python src/features/infrastructure/extraction/scripts/current/manage_extraction.py pipeline</code>
            {' '}to rebuild <code className="px-1 py-0.5 bg-black/40 rounded text-amber-200">items.ts</code> and its category files before viewing this page.
          </p>
        </div>
      </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
    <div className="min-h-[calc(100vh-8rem)] px-6 py-10 max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/guides" className="text-amber-400 hover:text-amber-300">← Back to Guides</Link>
        </div>

        <div className="mb-8">
          <h1 className="font-medieval-brand text-2xl md:text-4xl mb-4">Items</h1>
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
              onClick={() => handleCategoryChange('all')}
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
                onClick={() => handleCategoryChange(category)}
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
                  selectedCategory={selectedCategory}
                />
              );
            })}
          </div>
        ) : (
          // Show single category
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {itemsByCategory[selectedCategory].map((item) => (
              <ItemCard key={item.id} item={item} category={selectedCategory} />
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
    </ErrorBoundary>
  );
}
