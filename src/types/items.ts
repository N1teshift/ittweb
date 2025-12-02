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
  
  // Cost information
  cost?: number; // Gold cost
  lumberCost?: number; // Lumber/resource cost
  
  // Usage information
  hotkey?: string; // Keyboard shortcut for using item
  uses?: number; // Number of charges/uses
  hitPoints?: number; // Item durability/hit points
  maxStack?: number; // Maximum stack size
  
  // Stock information (for shop items)
  stockMaximum?: number; // Maximum stock at shops
  stockReplenishInterval?: number; // Time between stock replenishments (in seconds)
  
  // Abilities
  abilities?: string[]; // List of ability IDs granted by item
  
  // Stats and bonuses
  stats?: {
    damage?: number;
    armor?: number;
    health?: number;
    mana?: number;
    strength?: number;
    agility?: number;
    intelligence?: number;
    attackSpeed?: number; // Attack speed bonus
    other?: string[];
  };
};

export type ItemsByCategory = {
  [K in ItemCategory]: ItemData[];
};

