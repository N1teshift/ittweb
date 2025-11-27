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
    iconPath: 'btncancel.png',
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
    id: 'item-radar',
    name: 'Item Radar',
    category: 'gatherer',
    classRequirement: 'gatherer',
    description: '',
    tooltip: 'Contains spells allowing the gatherer to locate the items nearby using minimap ping.',
    iconPath: 'btnspy.png',
    hotkey: 'R',
    levels: {
            "1": {
                  "cooldown": 0
            },
            "2": {
                  "cooldown": 0
            },
            "3": {
                  "cooldown": 0
            }
      },
    availableToClasses: ['gatherer'],
    spellbook: 'hero',
  },
  {
    id: 'advanced-item-radar',
    name: 'Advanced Item Radar',
    category: 'gatherer',
    classRequirement: 'gatherer',
    description: '',
    tooltip: 'An improved item radar, can cast multiple spell at same time.',
    iconPath: 'btnspy.png',
    hotkey: 'R',
    levels: {
            "1": {
                  "cooldown": 0
            }
      },
  },
  {
    id: 'omnigatherer-inherited-spells',
    name: 'Omnigatherer Inherited Spells',
    category: 'gatherer',
    classRequirement: 'gatherer',
    description: '',
    tooltip: 'Contains all spells from the gatherer class.',
    iconPath: 'btntome.png',
    hotkey: 'T',
    levels: {
            "1": {
                  "cooldown": 0
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
    iconPath: 'BTNMushroom.png',
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
  },
  {
    id: 'mix-herb',
    name: 'Mix Herb',
    category: 'gatherer',
    classRequirement: 'gatherer',
    description: '',
    tooltip: 'Takes all the herbs in the pot and mixes them into a potion if a potion can be made. All items in the pot are used except for non-herbs. If you add to many herbs of one type, you lose the extra. Many powerful items can be made here so experiment and have fun.|nItems with the |c00408000Herb|r tag are considered herbs.',
    iconPath: 'btnunstableconcoction.png',
    duration: 0.01,
    hotkey: 'R',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 0.01
            }
      },
  },
  {
    id: 'the-herb-master-tele-gatherers-can-mix-herbs-wherever-they-go-he-can-learn-tele-gathering-a-spell-allowing-him-to-teleport-items-picked-up-to-a-fire-can-tele-gather-herbs-can-only-choose-1-subclass',
    name: 'The Herb Master Tele-Gatherers can mix herbs wherever they go. He can learn Tele-Gathering,a spell allowing him to teleport items picked up to a fire. Can tele-gather herbs. Can only choose 1 subClass!',
    category: 'gatherer',
    classRequirement: 'gatherer',
    description: '',
    tooltip: 'The Herb Master Tele-Gatherers can mix herbs wherever they go. He can learn Tele-Gathering,a spell allowing him to teleport items picked up to a fire. Can tele-gather herbs. |cffFF0202Can only choose 1 subClass!|r|cff7DBEF1\n\nDifficulty: |r|cffFE890DMedium|r',
    iconPath: 'btnicetrollshadowpriest.png',
    hotkey: 'Q',
  },
  {
    id: 'the-radar-is-adept-at-locating-and-gathering-items-he-got-an-improved-item-radar-and-he-can-learn-tele-gathering-a-spell-allowing-him-to-teleport-items-picked-up-to-a-fire-cannot-tele-gather-herbs-can-only-choose-1-subclass',
    name: 'The Radar is adept at locating and gathering items, he got an improved Item Radar and he can learn Tele-Gathering,a spell allowing him to teleport items picked up to a fire. Cannot tele-gather herbs. Can only choose 1 subClass!',
    category: 'gatherer',
    classRequirement: 'gatherer',
    description: '',
    tooltip: 'The Radar is adept at locating and gathering items, he got an improved Item Radar and he can learn Tele-Gathering,a spell allowing him to teleport items picked up to a fire. Cannot tele-gather herbs. |cffFF0202Can only choose 1 subClass!|r|cff7DBEF1\n\nDifficulty: |r|cffFE890DMedium|r',
    iconPath: 'BTNTerrorTroll.png',
    hotkey: 'W',
  },
  {
    id: 'the-alchemist-has-discovered-the-secret-of-the-philosopher-s-stone-which-allows-him-to-conjure-potion-effects-can-only-choose-1-subclass',
    name: 'The Alchemist has discovered the secret of the Philosopher\'s Stone which allows him to conjure potion effects. Can only choose 1 subClass!',
    category: 'gatherer',
    classRequirement: 'gatherer',
    description: '',
    tooltip: 'The Alchemist has discovered the secret of the Philosopher\'s Stone which allows him to conjure potion effects. |cffFF0202Can only choose 1 subClass!|r|cff7DBEF1\n\nDifficulty: |r|cffFE890DMedium|r',
    iconPath: 'BTNAlchemist.png',
    hotkey: 'R',
  }
];
