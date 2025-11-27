import type { AbilityData } from './types';

export const BASIC_ABILITIES: AbilityData[] = [
  {
    id: 'sleep-outside',
    name: 'Sleep Outside',
    category: 'basic',
    description: '',
    tooltip: 'The Troll can sleep outside to restore |cff00EAFF80|r mana but lose |cffFF020220|r health point and |cffFE890D15|r heat. This can kill you if any of your stats reach 0. Has |cff6495ED<AMd5,Cool1>|r seconds cooldown.',
    cooldown: 10,
    range: 300,
    duration: 6,
    hotkey: 'F',
    targetsAllowed: 'friend,ground,hero,self',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 10,
                  "duration": 5,
                  "range": 300
            }
      },
    availableToClasses: ['basic'],
  },
  {
    id: 'panic',
    name: 'Panic',
    category: 'basic',
    description: '',
    tooltip: 'Causes your troll to go into a panic, making him move |cffFE890D30%|r faster and attack |cffFE890D20%|r faster, but take |cffFF020210%|r extra damage.|n Lasts |cff7DBEF115|r seconds, has |cff7DBEF115|r seconds cooldown.|cFFFFFFC9Tip: Use this as often as possible to maximize efficiency.|r',
    manaCost: 20,
    cooldown: 15,
    duration: 15,
    hotkey: 'N',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 15,
                  "duration": 15
            }
      },
    availableToClasses: ['basic'],
  },
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
  },
  {
    id: 'hero-glow',
    name: 'Hero Glow',
    category: 'basic',
    description: '',
    areaOfEffect: 1,
    levels: {
            "1": {
                  "areaOfEffect": 1
            }
      },
    availableToClasses: ['basic'],
    visualEffects: {
            "attachmentPoints": [
                  "origin"
            ],
            "attachmentTarget": "Models\\Abilities\\GeneralHeroGlow.mdx"
      },
  }
];
