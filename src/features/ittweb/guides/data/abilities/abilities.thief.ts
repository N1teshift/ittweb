import type { AbilityData } from './abilities.types';

// Thief Abilities
export const THIEF_ABILITIES: AbilityData[] = [
    {
      id: 'abil-id',
      name: 'Abil Id',
      category: 'thief',
      description: 'Ability extracted from game source.',
    },
    {
      id: 'blink',
      name: 'Blink',
      category: 'thief',
      description: 'The thief teleports a short distance. Has {0} seconds cooldown',
      manaCost: 0,
      cooldown: 30.0,
      duration: 0.0,
    },
    {
      id: 'as-camoflage',
      name: 'Camouflage',
      category: 'thief',
      description: 'Stand Next to a tree and cast to turn invisible. You can not move or cast spells or it',
      manaCost: 0,
      cooldown: 30.0,
      duration: 0.0,
    },
    {
      id: 'buff-camoflage',
      name: 'Camouflage',
      category: 'thief',
      description: 'Stand Next to a tree and cast to turn invisible. You can not move or cast spells or it',
      manaCost: 0,
      cooldown: 30.0,
      duration: 0.0,
    },
];
