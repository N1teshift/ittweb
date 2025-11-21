import type { ItemData } from '@/types/items';

export const TOOL_ITEMS: ItemData[] = [
  {
    id: 'sonar-compass',
    name: 'Sonar Compass',
    category: 'tools',
    description: 'Navigation tool that reveals nearby enemies and items.',
    recipe: ['mana-crystal', 'iron-ingot'],
    craftedAt: 'Workshop',
    stats: { other: ['Reveals enemies', 'Shows items'] },
  },
  {
    id: 'net',
    name: 'Net',
    category: 'tools',
    description: 'Trapping tool used to ensnare enemies.',
    recipe: ['stick', 'hide'],
    craftedAt: 'Workshop',
    stats: { other: ['Ensnares enemies'] },
  },
  {
    id: 'smoke-bomb',
    name: 'Smoke Bomb',
    category: 'tools',
    description: 'Creates a cloud of smoke for concealment.',
    recipe: ['clay-ball', 'special-herb'],
    craftedAt: "Witch Doctor's Hut",
    stats: { other: ['Creates smoke cloud'] },
  },
  {
    id: 'bee-hive',
    name: 'Bee Hive',
    category: 'tools',
    description: 'Deployable hive that produces bees to attack enemies.',
    recipe: ['stick', 'clay-ball'],
    craftedAt: 'Workshop',
    stats: { other: ['Spawns attacking bees'] },
  },
  {
    id: 'camouflage-coat',
    name: 'Camouflage Coat',
    category: 'tools',
    description: 'Provides invisibility when not moving.',
    recipe: ['hide', 'special-herb'],
    craftedAt: 'Tannery',
    stats: { other: ['Invisibility when stationary'] },
  },
  {
    id: 'transport-ship',
    name: 'Transport Ship',
    category: 'tools',
    description: 'Allows water transportation and carries multiple trolls.',
    recipe: ['stick', 'stick', 'stick', 'hide'],
    craftedAt: 'Workshop',
    stats: { other: ['Water transport', 'Carries multiple units'] },
  },
  {
    id: 'emp-device',
    name: 'EMP Device',
    category: 'tools',
    description: 'Electronic device that disables magical effects.',
    recipe: ['mana-crystal', 'steel-ingot'],
    craftedAt: 'Workshop',
    stats: { other: ['Disables magic', 'Area effect'] },
  },
];



