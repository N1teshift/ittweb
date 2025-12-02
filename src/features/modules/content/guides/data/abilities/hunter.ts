import type { AbilityData } from './types';

export const HUNTER_ABILITIES: AbilityData[] = [
  {
    id: 'sniff',
    name: 'Sniff',
    category: 'hunter',
    classRequirement: 'hunter',
    description: '',
    tooltip: 'Using his supreme sense of smell, the tracker can locate his quarry by sniffing an item the target has handled in the last |cff7DBEF1300|r seconds, including the remains of an animal killed by them.',
    iconPath: 'btnpoisonoussmell.png',
    cooldown: 3,
    areaOfEffect: 40,
    hotkey: 'W',
    targetsAllowed: 'item',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 3,
                  "areaOfEffect": 40
            }
      },
  }
];

