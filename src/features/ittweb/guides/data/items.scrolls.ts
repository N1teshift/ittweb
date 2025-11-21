import type { ItemData } from '@/types/items';

export const SCROLL_ITEMS: ItemData[] = [
  {
    id: 'scroll-living-dead',
    name: 'Scroll of Living Dead',
    category: 'scrolls',
    description: 'Summons undead minions to fight for you.',
    stats: { other: ['Summons undead'] },
  },
  {
    id: 'scroll-fireball',
    name: 'Scroll of Fireball',
    category: 'scrolls',
    description: 'Launches a powerful fireball at enemies.',
    stats: { damage: 100, other: ['Area damage', 'Fire damage'] },
  },
  {
    id: 'scroll-entangling-roots',
    name: 'Scroll of Entangling Roots',
    category: 'scrolls',
    description: 'Roots burst from the ground to trap enemies.',
    stats: { other: ['Root enemies', 'Area effect'] },
  },
  {
    id: 'scroll-stone-skin',
    name: 'Scroll of Stone Skin',
    category: 'scrolls',
    description: 'Hardens skin to provide damage reduction.',
    stats: { armor: 5, other: ['Temporary armor boost'] },
  },
  {
    id: 'scroll-cyclone',
    name: 'Scroll of Cyclone',
    category: 'scrolls',
    description: 'Creates a powerful whirlwind that damages enemies.',
    stats: { damage: 75, other: ['Wind damage', 'Knockback'] },
  },
  {
    id: 'scroll-tsunami',
    name: 'Scroll of Tsunami',
    category: 'scrolls',
    description: 'Summons a massive wave to devastate the battlefield.',
    stats: { damage: 150, other: ['Water damage', 'Area flood'] },
  },
];



