export type ItemCategory = 
  | 'raw-materials'
  | 'weapons'
  | 'armor'
  | 'potions'
  | 'scrolls'
  | 'buildings'
  | 'unknown';

export type ItemSubcategory =
  | 'herbs'
  | 'materials'
  | 'animal-parts'
  | 'essences'
  | 'metals'
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
  tooltip?: string; // Extended tooltip from game data
  recipe?: string[];
  craftedAt?: string;
  mixingPotManaRequirement?: number;
  iconPath?: string;
  stats?: {
    damage?: number;
    armor?: number;
    health?: number;
    mana?: number;
    strength?: number;
    agility?: number;
    intelligence?: number;
    other?: string[];
  };
};

export type ItemsByCategory = {
  [K in ItemCategory]: ItemData[];
};
