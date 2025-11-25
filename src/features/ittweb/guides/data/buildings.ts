import type { ItemData } from '@/types/items';

export type BuildingData = {
  id: string;
  name: string;
  description: string;
  hp?: number;
  armor?: number;
  craftableItems?: string[];
  iconPath?: string;
};

// Building definitions extracted from game source
export const BUILDINGS: BuildingData[] = [
  {
    id: 'witch-doctors-hut',
    name: 'Witch Doctors Hut',
    description: '',
    craftableItems: [
      'ITEM_MAGIC', 'ITEM_MAGIC', 'ITEM_MAGIC', 'ITEM_MAGIC',
      'ITEM_MAGIC', 'ITEM_PANTHER_FANG', 'ITEM_TINDER', 'ITEM_STONE',
      'ITEM_SPIRIT_WATER', 'ITEM_BONE', 'ITEM_MUSHROOM', 'ITEM_FLINT',
      'ITEM_SPIRIT_WIND', 'ITEM_ELK_SKIN_BOOTS', 'ITEM_STICK', 'ITEM_MANA_CRYSTAL',
    ],
  },
  {
    id: 'storage-hut',
    name: 'Storage Hut',
    description: '',
  },
  {
    id: 'smoke-house',
    name: 'Smoke House',
    description: '',
  },
  {
    id: 'forge',
    name: 'Forge',
    description: '',
    craftableItems: [
      'ITEM_ELK_SKIN_GLOVES', 'ITEM_ELK_SKIN_BOOTS', 'ITEM_ELK_SKIN_COAT', 'ITEM_ELK_SKIN_BOOTS',
      'ITEM_STICK', 'ITEM_ELK_SKIN_COAT', 'ITEM_ELK_SKIN_GLOVES', 'ITEM_ELK_SKIN_GLOVES',
      'ITEM_ELK_SKIN_BOOTS', 'ITEM_ELK_SKIN_COAT', 'ITEM_STICK', 'ITEM_STICK',
      'ITEM_STICK', 'ITEM_SHIELD', 'ITEM_ELK_HIDE', 'ITEM_SHIELD',
      'ITEM_SHIELD', 'ITEM_IRON_INGOT', 'ITEM_STONE', 'ITEM_STICK',
      'ITEM_STICK', 'ITEM_STICK', 'ITEM_STICK', 'ITEM_IRON_AXE',
    ],
  },
  {
    id: 'workshop',
    name: 'Workshop',
    description: '',
    craftableItems: [
      'ITEM_TINDER', 'ITEM_STICK', 'ITEM_THISTLES', 'ITEM_SPIRIT_WIND',
      'ITEM_MANA_CRYSTAL', 'ITEM_POISON', 'ITEM_TINDER', 'ITEM_NETS',
      'ITEM_ATHELAS_SEED', 'ITEM_BANANA', 'ITEM_SMOKE_BOMB', 'ITEM_THISTLES',
      'ITEM_MANA_CRYSTAL', 'ITEM_STICK',
    ],
  },
  {
    id: 'mixing-pot',
    name: 'Mixing Pot',
    description: '',
  },
  {
    id: 'tannery',
    name: 'Tannery',
    description: '',
    craftableItems: [
      'ITEM_ELK_HIDE', 'ITEM_ELK_HIDE', 'ITEM_ELK_HIDE', 'ITEM_JUNGLE_WOLF_HIDE',
      'ITEM_JUNGLE_WOLF_HIDE', 'ITEM_JUNGLE_WOLF_HIDE', 'ITEM_JUNGLE_BEAR_HIDE', 'ITEM_JUNGLE_BEAR_HIDE',
      'ITEM_JUNGLE_BEAR_HIDE',
    ],
  },
  {
    id: 'hatchery',
    name: 'Hatchery',
    description: '',
  },
  {
    id: 'armory',
    name: 'Armory',
    description: '',
    craftableItems: [
      'ITEM_GREATER_ESSENCE', 'ITEM_BONE_BOOTS', 'ITEM_BEAR_SKIN_BOOTS', 'ITEM_BEAR_SKIN_GLOVES',
      'ITEM_BEAR_SKIN_GLOVES', 'ITEM_BONE_GLOVES', 'ITEM_WOLF_SKIN_GLOVES', 'ITEM_WOLF_SKIN_BOOTS',
      'ITEM_IRON_STAFF', 'ITEM_IRON_SHIELD', 'ITEM_BONE_SHIELD', 'ITEM_STEEL_GLOVES',
      'ITEM_BEAR_SKIN_COAT', 'ITEM_BONE_COAT', 'ITEM_WOLF_SKIN_COAT', 'ITEM_BONE_COAT',
    ],
  },
];

export function getBuildingById(id: string): BuildingData | undefined {
  return BUILDINGS.find(b => b.id === id);
}

export function getBuildingsByCraftableItem(itemId: string): BuildingData[] {
  return BUILDINGS.filter(b => 
    b.craftableItems?.some(item => item.toLowerCase() === itemId.toLowerCase())
  );
}
