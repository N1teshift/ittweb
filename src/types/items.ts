export type ItemCategory = 
  | 'raw-materials'
  | 'weapons'
  | 'armor'
  | 'tools'
  | 'potions'
  | 'scrolls'
  | 'buildings';

export type ItemSubcategory =
  | 'herbs'
  | 'materials'
  | 'healing-potions'
  | 'mana-potions'
  | 'special-potions'
  | 'stat-management'
  | 'storage'
  | 'crafting'
  | 'defensive'
  | 'special-buildings';

export type ItemData = {
  id: string;
  name: string;
  category: ItemCategory;
  subcategory?: ItemSubcategory;
  description: string;
  recipe?: string[];
  craftedAt?: string;
  stats?: {
    damage?: number;
    armor?: number;
    health?: number;
    mana?: number;
    other?: string[];
  };
};

export type ItemsByCategory = {
  [K in ItemCategory]: ItemData[];
};