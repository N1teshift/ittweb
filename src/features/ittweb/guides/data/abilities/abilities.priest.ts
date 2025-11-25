import type { AbilityData } from './abilities.types';

// Priest Abilities
export const PRIEST_ABILITIES: AbilityData[] = [
    {
      id: 'battle-armor-anti-magic',
      name: 'Anti-Magic Shell',
      category: 'priest',
      description: 'Anti-Magic Shell',
      manaCost: 20,
      cooldown: 20.0,
      duration: 10.0,
    },
    {
      id: 'abil-banish-id',
      name: 'Cure All',
      category: 'priest',
      description: 'Dispels buffs and effects from friendly units. Can be used to cure snake poison, disease or even jealousy among other things.',
      manaCost: 10,
      cooldown: 45.0,
    },
    {
      id: 'true-magic-mist-id',
      name: 'True Magic Mist Id',
      category: 'priest',
      description: 'Ability extracted from game source.',
    },
    {
      id: 'sage-mix-heat',
      name: 'Mix ',
      category: 'priest',
      description: 'Mix',
      cooldown: 50.0,
    },
    {
      id: 'sage-mix-energy',
      name: 'Mix ',
      category: 'priest',
      description: 'Mix',
      cooldown: 50.0,
    },
    {
      id: 'buff-the-glow',
      name: 'Buff The Glow',
      category: 'priest',
      description: 'Ability extracted from game source.',
    },
];
