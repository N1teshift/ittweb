import type { ItemData } from '@/types/items';

export const ARMOR_ITEMS: ItemData[] = [
  {
    id: 'wood-boots',
    name: 'Wood Boots',
    category: 'armor',
    description: 'Basic foot protection made from wood.',
    recipe: ['stick', 'hide'],
    craftedAt: 'Tannery',
    stats: { armor: 2 },
  },
  {
    id: 'wood-helmet',
    name: 'Wood Helmet',
    category: 'armor',
    description: 'Simple head protection crafted from wood.',
    recipe: ['stick', 'hide'],
    craftedAt: 'Tannery',
    stats: { armor: 3 },
  },
  {
    id: 'wood-body-armor',
    name: 'Wood Body Armor',
    category: 'armor',
    description: 'Basic chest protection made from wooden plates.',
    recipe: ['stick', 'stick', 'hide'],
    craftedAt: 'Tannery',
    stats: { armor: 4 },
  },
  {
    id: 'wood-shield',
    name: 'Wood Shield',
    category: 'armor',
    description: 'Basic shield providing modest protection.',
    recipe: ['stick', 'hide'],
    craftedAt: 'Tannery',
    stats: { armor: 2, other: ['Blocks attacks'] },
  },
  {
    id: 'battle-armor',
    name: 'Battle Armor',
    category: 'armor',
    description: 'Heavy armor providing excellent protection.',
    recipe: ['steel-ingot', 'iron-ingot', 'hide'],
    craftedAt: 'Armory',
    stats: { armor: 8 },
  },
  {
    id: 'anabolic-boots',
    name: 'Anabolic Boots',
    category: 'armor',
    description: 'Enhanced boots that increase movement speed.',
    recipe: ['wood-boots', 'anabolic-potion'],
    craftedAt: 'Armory',
    stats: { armor: 3, other: ['Increased movement speed'] },
  },
  {
    id: 'battle-gloves',
    name: 'Battle Gloves',
    category: 'armor',
    description: 'Protective gloves that enhance combat effectiveness.',
    recipe: ['hide', 'iron-ingot'],
    craftedAt: 'Armory',
    stats: { armor: 2, other: ['Increased attack speed'] },
  },
];



