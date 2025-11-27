import type { AbilityData } from './types';

export const THIEF_ABILITIES: AbilityData[] = [
  {
    id: 'rogue-abilities',
    name: 'Rogue abilities',
    category: 'thief',
    classRequirement: 'thief',
    description: '',
    tooltip: 'Rogue Abilities, contains Thief and Rogue combat abilities',
    iconPath: 'btnspellbookbls.png',
    hotkey: 'E',
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
  },
  {
    id: 'telethief-abilities',
    name: 'Telethief Abilities',
    category: 'thief',
    classRequirement: 'thief',
    description: '',
    tooltip: 'Contains dimentional magic of Telethief',
    iconPath: 'btnspellbookbls.png',
    hotkey: 'E',
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
  },
  {
    id: 'assassin-spells',
    name: 'Assassin Spells',
    category: 'thief',
    classRequirement: 'thief',
    description: '',
    tooltip: 'All the evasion skills you\'ll ever need.',
    iconPath: 'btntome.png',
    hotkey: 'E',
    levels: {
            "1": {
                  "cooldown": 0
            }
      },
  },
  {
    id: 'cloak',
    name: 'Cloak',
    category: 'thief',
    classRequirement: 'thief',
    description: '',
    tooltip: 'The thief goes invisible and move |cffFE890D20%|r faster. Cloak can be used to reveal cliff. Lasts |cff7DBEF14|r seconds, has |cff7DBEF165|r seconds cooldown.',
    iconPath: 'BTNDarkTrollTrapperCloak.png',
    manaCost: 20,
    cooldown: 65,
    duration: 4,
    hotkey: 'E',
    levels: {
            "1": {
                  "manaCost": 20,
                  "cooldown": 65,
                  "duration": 8
            },
            "2": {
                  "manaCost": 20,
                  "cooldown": 65,
                  "duration": 8
            },
            "3": {
                  "manaCost": 20,
                  "cooldown": 65,
                  "duration": 8
            },
            "4": {
                  "manaCost": 20,
                  "cooldown": 65,
                  "duration": 8
            }
      },
    availableToClasses: ['thief'],
    spellbook: 'hero',
  },
  {
    id: 'blink',
    name: 'Blink',
    category: 'thief',
    classRequirement: 'thief',
    description: '',
    tooltip: 'The thief teleports a short distance. Has |cff7DBEF130|r seconds cooldown.',
    cooldown: 30,
    hotkey: 'R',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 30
            }
      },
    availableToClasses: ['thief', 'escape-artist', 'rogue', 'contortionist', 'telethief'],
    spellbook: 'normal',
  },
  {
    id: 'telethief-uses-his-dimentional-magic-to-reach-into-a-random-thief-s-bush-on-the-map-and-steal-a-consumable-item',
    name: 'Telethief uses his dimentional magic to reach into a random thief\'s bush on the map and steal a consumable item.',
    category: 'thief',
    classRequirement: 'thief',
    description: '',
    tooltip: 'Telethief uses his dimentional magic to reach into a random thief\'s bush on the map and steal a consumable item.\nItems stolen this way can only be held in thief\'s pocket. Casting this ability will replace an item currently held in thief\'s pocket.\nAt |cFFFFCC00lvl 4|r Telethief acquires mastery of this ability, reducing cooldown to |cff6495ED30|r seconds.\n|cff6495ED60.0|r seconds cooldown.',
    iconPath: 'btncancel.png',
    manaCost: 40,
    cooldown: 60,
    hotkey: 'S',
    levels: {
            "1": {
                  "manaCost": 40,
                  "cooldown": 60
            },
            "2": {
                  "manaCost": 40,
                  "cooldown": 30
            }
      },
  },
  {
    id: 'rogue-has-developed-formidable-combat-skills-as-well-as-adapted-his-thief-s-skills-to-help-him-in-combat-rogue-is-adept-at-physical-combat-and-maneuvering-can-only-choose-1-subclass',
    name: 'Rogue has developed formidable combat skills as well as adapted his thief\'s skills to help him in combat. Rogue is adept at physical combat and maneuvering.Can only choose 1 subClass!',
    category: 'thief',
    classRequirement: 'thief',
    description: '',
    tooltip: 'Rogue has developed formidable combat skills as well as adapted his thief\'s skills to help him in combat. Rogue is adept at physical combat and maneuvering.|cffFF0202Can only choose 1 subClass!|r|cff7DBEF1\n\nDifficulty: |r|cff1FBF00Easy|r',
    iconPath: 'btndarktroll.png',
    hotkey: 'Q',
  },
  {
    id: 'when-a-thief-decides-that-the-best-way-to-steal-is-by-using-magic-he-becomes-a-telethief-telethief-has-dimentional-magic-providing-combat-utility-to-his-thief-abilities-can-only-choose-1-subclass',
    name: 'When a thief decides that the best way to steal is by using magic, he becomes a TeleThief. TeleThief has dimentional magic, providing combat utility to his thief abilities  Can only choose 1 subClass!',
    category: 'thief',
    classRequirement: 'thief',
    description: '',
    tooltip: 'When a thief decides that the best way to steal is by using magic, he becomes a TeleThief. TeleThief has dimentional magic, providing combat utility to his thief abilities  |cffFF0202Can only choose 1 subClass!|r|cff7DBEF1\n\nDifficulty: |r|cffFE890DMedium|r',
    iconPath: 'BTNContortionist.png',
    hotkey: 'W',
  },
  {
    id: 'the-assassin-has-combined-the-physical-strength-with-the-evasion-magic-he-has-alot-of-escaping-spells-but-also-the-ability-to-backstab-enemy-for-a-big-burst-of-damage',
    name: 'The Assassin has combined the physical strength with the evasion magic, he has alot of escaping spells,but also the ability to backstab enemy for a big burst of damage.',
    category: 'thief',
    classRequirement: 'thief',
    description: '',
    tooltip: 'The Assassin has combined the physical strength with the evasion magic, he has alot of escaping spells,but also the ability to backstab enemy for a big burst of damage.|cff7DBEF1\n\nDifficulty: |r|cffFF0202Hard|r',
    iconPath: 'btndarktrolltrapper.png',
    hotkey: 'E',
  }
];
