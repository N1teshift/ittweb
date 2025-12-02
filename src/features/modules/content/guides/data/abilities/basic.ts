import type { AbilityData } from './types';

export const BASIC_ABILITIES: AbilityData[] = [
  {
    id: 'collect-meat',
    name: 'Collect Meat',
    category: 'basic',
    description: '',
    tooltip: 'Collects cooked meat within |cff7DBEF1800|r range and stores it in the building\'s inventory.|cFFFFCC00\nCannot be used if there is an enemy in range.|r',
    iconPath: 'btnmonsterlure.png',
    cooldown: 5,
    hotkey: 'C',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 5
            }
      },
  },
  {
    id: 'cook-meat',
    name: 'Cook Meat',
    category: 'basic',
    description: '',
    tooltip: 'Cooks all the corpses around the fire into Cooked Meat',
    iconPath: 'btnmonsterlure.png',
    cooldown: 1,
    hotkey: 'C',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 1
            }
      },
  },
  {
    id: 'cook-and-collect-meat',
    name: 'Cook and collect Meat',
    category: 'basic',
    description: '',
    tooltip: 'Cooks all the corpses around the fire and collects all meat within |cff7DBEF1800|r range and stores it in the building\'s inventory.|cFFFFCC00\nMeat cannot be collected if there is an enemy in range.|r',
    iconPath: 'btnmonsterlure.png',
    cooldown: 1,
    hotkey: 'C',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 1
            }
      },
  }
];

