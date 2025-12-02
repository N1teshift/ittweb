import type { AbilityData } from './types';

export const GATHERER_ABILITIES: AbilityData[] = [
  {
    id: 'gatherer-salves',
    name: 'Gatherer Salves',
    category: 'gatherer',
    classRequirement: 'gatherer',
    description: '',
    tooltip: 'The Gatherer can create consumable items not available to other classes. Click here to see the recipes.',
    iconPath: 'btnbarrel.png',
    cooldown: 90,
    hotkey: 'W',
    levels: {
            "1": {
                  "cooldown": 90
            }
      },
  },
  {
    id: 'recipe-armor-salve',
    name: 'Recipe: Armor Salve',
    category: 'gatherer',
    classRequirement: 'gatherer',
    description: '',
    tooltip: 'Slot 1: Mushroom |nSlot 2: Stone |nCreates a salve that grants the target ally <A0ED,DataB1> bonus armor for <A0ED,DataA1> seconds.',
    iconPath: 'btnrockgolem.png',
    range: 1,
    levels: {
            "1": {
                  "range": 1
            }
      },
  },
  {
    id: 'recipe-healing-salve',
    name: 'Recipe: Healing Salve',
    category: 'gatherer',
    classRequirement: 'gatherer',
    description: '',
    tooltip: 'Slot 1: Mushroom |nSlot 2: Tinder |nSlot 3: River Root |nCreates a salve with 2 uses that heals for <A0EG,DataA1> over <A0EG,HeroDur1> seconds.',
    iconPath: 'btnhealingsalve.png',
    range: 1,
    levels: {
            "1": {
                  "range": 1
            }
      },
  },
  {
    id: 'recipe-hypnosis-salve',
    name: 'Recipe: Hypnosis Salve',
    category: 'gatherer',
    classRequirement: 'gatherer',
    description: '',
    tooltip: 'Slot 1: Mushroom |nSlot 2: Athelas Seed |nSlot 3: Athelas Seed |nCreates a salve that sleeps target enemy troll for <A0DH,HeroDur1> seconds.',
    iconPath: 'pasbtnelunesblessing.png',
    range: 1,
    levels: {
            "1": {
                  "range": 1
            }
      },
  },
  {
    id: 'recipe-poison-salve',
    name: 'Recipe: Poison Salve',
    category: 'gatherer',
    classRequirement: 'gatherer',
    description: '',
    tooltip: 'Slot 1: Mushroom |nSlot 2: Thistles |nCreates a salve that slows target enemy non-troll\'s movement speed by <A0EE,DataA1,%>% and attack speed by <A0EE,DataB1,%>% for <A0EE,Dur1> seconds.',
    iconPath: 'btnvialempty.png',
    range: 1,
    levels: {
            "1": {
                  "range": 1
            }
      },
  },
  {
    id: 'recipe-speed-salve',
    name: 'Recipe: Speed Salve',
    category: 'gatherer',
    classRequirement: 'gatherer',
    description: '',
    tooltip: 'Slot 1: Mushroom |nSlot 2: Tinder |nSlot 3: River Stem |nCreates a salve with 2 uses that buffs the user\'s movement speed by <A0EF,DataA1,%>% for <A0EF,Dur1> seconds.',
    iconPath: 'btnpotionred.png',
    range: 1,
    levels: {
            "1": {
                  "range": 1
            }
      },
  },
  {
    id: 'find-tinders',
    name: 'Find Tinders',
    category: 'gatherer',
    classRequirement: 'gatherer',
    description: '',
    tooltip: 'Pings all nearby tinder in the minimap and reveals them for a short duration. Ignores items near enemies.',
    iconPath: 'btnshimmerweed.png',
    manaCost: 15,
    cooldown: 50,
    hotkey: 'Q',
    levels: {
            "1": {
                  "manaCost": 15,
                  "cooldown": 50
            },
            "2": {
                  "manaCost": 15,
                  "cooldown": 50
            },
            "3": {
                  "manaCost": 15,
                  "cooldown": 50
            }
      },
  },
  {
    id: 'find-sticks',
    name: 'Find Sticks',
    category: 'gatherer',
    classRequirement: 'gatherer',
    description: '',
    tooltip: 'Pings all nearby sticks in the minimap and reveals them for a short duration. Ignores items near enemies.',
    iconPath: 'btnnaturetouchgrow.png',
    manaCost: 15,
    cooldown: 50,
    hotkey: 'W',
    levels: {
            "1": {
                  "manaCost": 15,
                  "cooldown": 50
            },
            "2": {
                  "manaCost": 15,
                  "cooldown": 50
            },
            "3": {
                  "manaCost": 15,
                  "cooldown": 50
            }
      },
  },
  {
    id: 'find-mushrooms',
    name: 'Find Mushrooms',
    category: 'gatherer',
    classRequirement: 'gatherer',
    description: '',
    tooltip: 'Pings all nearby mana crystals in the minimap and reveals them for a short duration. Ignores items near enemies.',
    iconPath: 'btnmushroom.png',
    manaCost: 15,
    cooldown: 50,
    hotkey: 'E',
    levels: {
            "1": {
                  "manaCost": 15,
                  "cooldown": 50
            },
            "2": {
                  "manaCost": 15,
                  "cooldown": 50
            },
            "3": {
                  "manaCost": 15,
                  "cooldown": 50
            }
      },
  },
  {
    id: 'find-clay-balls',
    name: 'Find Clay Balls',
    category: 'gatherer',
    classRequirement: 'gatherer',
    description: '',
    tooltip: 'Pings all nearby clay balls in the minimap and reveals them for a short duration. Ignores items near enemies.',
    iconPath: 'btnthunderlizardegg.png',
    manaCost: 15,
    cooldown: 50,
    hotkey: 'R',
    levels: {
            "1": {
                  "manaCost": 15,
                  "cooldown": 50
            },
            "2": {
                  "manaCost": 15,
                  "cooldown": 50
            },
            "3": {
                  "manaCost": 15,
                  "cooldown": 50
            }
      },
  },
  {
    id: 'find-flints',
    name: 'Find Flints',
    category: 'gatherer',
    classRequirement: 'gatherer',
    description: '',
    tooltip: 'Pings all nearby flints in the minimap and reveals them for a short duration. Ignores items near enemies.',
    iconPath: 'btnstaffofsanctuary.png',
    manaCost: 15,
    cooldown: 50,
    hotkey: 'A',
    levels: {
            "1": {
                  "manaCost": 15,
                  "cooldown": 50
            },
            "2": {
                  "manaCost": 15,
                  "cooldown": 50
            },
            "3": {
                  "manaCost": 15,
                  "cooldown": 50
            }
      },
  },
  {
    id: 'find-stones',
    name: 'Find Stones',
    category: 'gatherer',
    classRequirement: 'gatherer',
    description: '',
    tooltip: 'Pings all nearby stones in the minimap and reveals them for a short duration. Ignores items near enemies.',
    iconPath: 'btngolemstormbolt.png',
    manaCost: 15,
    cooldown: 50,
    hotkey: 'S',
    levels: {
            "1": {
                  "manaCost": 15,
                  "cooldown": 50
            },
            "2": {
                  "manaCost": 15,
                  "cooldown": 50
            },
            "3": {
                  "manaCost": 15,
                  "cooldown": 50
            }
      },
  },
  {
    id: 'find-mana-crystals',
    name: 'Find Mana Crystals',
    category: 'gatherer',
    classRequirement: 'gatherer',
    description: '',
    tooltip: 'Pings all nearby mana crystals in the minimap and reveals them for a short duration. Ignores items near enemies.',
    iconPath: 'btnmanastone.png',
    manaCost: 15,
    cooldown: 50,
    hotkey: 'D',
    levels: {
            "1": {
                  "manaCost": 15,
                  "cooldown": 50
            },
            "2": {
                  "manaCost": 15,
                  "cooldown": 50
            },
            "3": {
                  "manaCost": 15,
                  "cooldown": 50
            }
      },
  },
  {
    id: 'item-warp',
    name: 'Item Warp',
    category: 'gatherer',
    classRequirement: 'gatherer',
    description: '',
    tooltip: 'Teleports items in the area around the gatherer right to him. Has |cffFE890D900|r range and |cff7DBEF1120|r seconds cooldown. |cffFFD700Note : Items near an ally campfire won\'t be warped, you don\'t want to mess up your base, do you?|r',
    iconPath: 'btnneutralmanashield.png',
    manaCost: 30,
    cooldown: 120,
    hotkey: 'E',
    levels: {
            "1": {
                  "manaCost": 30,
                  "cooldown": 120
            },
            "2": {
                  "manaCost": 30,
                  "cooldown": 100
            },
            "3": {
                  "manaCost": 30,
                  "cooldown": 80
            }
      },
  }
];

