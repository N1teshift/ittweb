import type { ItemData } from '@/types/items';

export const WEAPON_ITEMS: ItemData[] = [
  {
    id: 'flint-axe',
    name: 'Flint Axe',
    category: 'weapons',
    description: 'Basic melee weapon made from flint and stick. Good starting weapon.',
    recipe: ['flint', 'stick'],
    craftedAt: 'Workshop',
    stats: { damage: 12 },
  },
  {
    id: 'mage-masher',
    name: 'Mage Masher',
    category: 'weapons',
    description: 'Weapon effective against magic users. Causes burn and silence effects.',
    recipe: ['iron-ingot', 'mana-crystal'],
    craftedAt: 'Armory',
    stats: { damage: 18, other: ['Burns mana', 'Silences spells'] },
  },
  {
    id: 'battle-axe',
    name: 'Battle Axe',
    category: 'weapons',
    iconPath: '/icons/itt/items/btnorcmeleeupthree.png',
    description: 'Heavy two-handed weapon with high damage output.',
    recipe: ['steel-ingot', 'stick'],
    craftedAt: 'Armory',
    stats: { damage: 25 },
  },
  {
    id: 'blowgun',
    name: 'Blowgun',
    category: 'weapons',
    description: 'Ranged weapon that fires darts. Silent and accurate.',
    recipe: ['stick', 'hide'],
    craftedAt: 'Workshop',
    stats: { damage: 8, other: ['Ranged attack', 'Silent'] },
  },
];


