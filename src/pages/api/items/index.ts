import type { NextApiRequest } from 'next';
import { createGetHandler } from '@/features/infrastructure/api';
import { ITEMS_DATA } from '@/features/modules/content/guides/data/items';
import type { ItemCategory, ItemData } from '@/types/items';

type ItemsApiResponse = {
  items: ItemData[];
  meta: {
    total: number;
    buildingsTotal: number;
    count: number;
    category?: ItemCategory;
    query?: string;
  };
};

function normalizeCategory(value: unknown): ItemCategory | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim().toLowerCase();
  const allowed: ItemCategory[] = [
    'raw-materials',
    'weapons',
    'armor',
    'potions',
    'scrolls',
    'buildings',
    'unknown',
  ];
  return allowed.includes(normalized as ItemCategory) ? (normalized as ItemCategory) : undefined;
}

/**
 * GET /api/items - Get all items with optional filtering
 */
export default createGetHandler<ItemsApiResponse>(
  async (req: NextApiRequest) => {
    const category = normalizeCategory(req.query.category);
    const searchQuery = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';

    let items = ITEMS_DATA;

    if (category) {
      items = items.filter((item) => item.category === category);
    }

    if (searchQuery) {
      items = items.filter((item) => {
        const haystack = `${item.name} ${item.description ?? ''} ${(item.recipe ?? []).join(' ')}`.toLowerCase();
        return haystack.includes(searchQuery);
      });
    }

    const total = ITEMS_DATA.length;
    const buildingsTotal = ITEMS_DATA.filter((item) => item.category === 'buildings').length;

    return {
      items,
      meta: {
        total,
        buildingsTotal,
        count: items.length,
        category,
        query: searchQuery || undefined,
      },
    };
  },
  {
    requireAuth: false,
    logRequests: true,
    // Cache for 1 hour - items data is static
    cacheControl: {
      public: true,
      maxAge: 3600,
      mustRevalidate: true,
    },
  }
);




