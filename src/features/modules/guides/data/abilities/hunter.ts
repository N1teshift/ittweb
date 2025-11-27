import type { AbilityData } from './types';

export const HUNTER_ABILITIES: AbilityData[] = [
  {
    id: 'way-of-the-tracker',
    name: 'Way of the Tracker',
    category: 'hunter',
    classRequirement: 'hunter',
    description: '',
    tooltip: 'The Tracker Knowledge, contains various spells to track a target.',
    iconPath: 'btnnecromanceradept.png',
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
    id: 'warrior-skills',
    name: 'Warrior Skills',
    category: 'hunter',
    classRequirement: 'hunter',
    description: '',
    tooltip: 'The Warrior Skills, contains description of the warrior abilities.',
    iconPath: 'BTNTrollPredator.png',
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
    id: 'juggernaut-inherited-spells',
    name: 'Juggernaut Inherited Spells',
    category: 'hunter',
    classRequirement: 'hunter',
    description: '',
    tooltip: 'The Juggernaut Skill set, can use spells from tracker & warrior too.',
    iconPath: 'BTNTrollPredator.png',
    hotkey: 'E',
    levels: {
            "1": {
                  "cooldown": 0
            }
      },
  },
  {
    id: 'track',
    name: 'Track',
    category: 'hunter',
    classRequirement: 'hunter',
    description: '',
    tooltip: 'Gives vision of the tracked unit and reduces armor by |cffFF02021|r Lasts |cff7DBEF115|r seconds, has |cff7DBEF145|r seconds cooldown.',
    iconPath: 'ATCTrack.png',
    cooldown: 45,
    range: 700,
    duration: 15,
    hotkey: 'E',
    targetsAllowed: 'air,ground,enemies,neutral',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 35,
                  "duration": 15,
                  "range": 700
            },
            "2": {
                  "cooldown": 35,
                  "duration": 25,
                  "range": 700
            },
            "3": {
                  "cooldown": 35,
                  "duration": 25,
                  "range": 700
            }
      },
    availableToClasses: ['hunter'],
    spellbook: 'hero',
  },
  {
    id: 'sniff',
    name: 'Sniff',
    category: 'hunter',
    classRequirement: 'hunter',
    description: '',
    tooltip: 'Using his supreme sense of smell, the tracker can locate his quarry by sniffing an item the target has handled in the last |cff7DBEF1300|r seconds, including the remains of an animal killed by them.',
    iconPath: 'BTNPoisonousSmell.png',
    cooldown: 3,
    hotkey: 'W',
    targetsAllowed: 'item',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 3,
                  "areaOfEffect": 40
            }
      },
  },
  {
    id: 'warrior-throws-two-axes-that-spiral-around-him-dealing-0-2x-attack-damage-on-impact',
    name: 'Warrior throws two axes that spiral around him, dealing 0.2x attack damage on impact.',
    category: 'hunter',
    classRequirement: 'hunter',
    description: '',
    tooltip: 'Warrior throws two axes that spiral around him, dealing |cffFF02020.2|rx attack damage on impact.\nRemoves immobilizing effects on use.\nHas |cff7DBEF125|r seconds cooldown.',
    iconPath: 'BTNWhirlingAxes.png',
    cooldown: 25,
    duration: 0.01,
    hotkey: 'R',
    targetsAllowed: 'ground,enemies,neutral,vulnerable,alive,organic',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 25,
                  "duration": 0.01
            }
      },
  },
  {
    id: 'weapons-of-choice',
    name: 'Weapons of Choice',
    category: 'hunter',
    classRequirement: 'hunter',
    description: '',
    tooltip: 'Gurubashi Warrior gains different abilitites depending on weapons he has equipped:\n\n|cFFFFCC00One-handed weapon|r - Axe Throw\n|cFFFFCC00Two-handed weapon|r - Whirlwind\n|cFFFFCC00Shield|r - Shield Charge, replaces Spiked Net\n|cFFFFCC00Two weapons|r - Whirling Axes; replaces Spiked Net',
    iconPath: 'PASBTNWeaponsOfChoice.png',
  },
  {
    id: 'rage',
    name: 'Rage',
    category: 'hunter',
    classRequirement: 'hunter',
    description: '',
    tooltip: 'Permanently increase attack speed by |cffFF020210%|r.',
    iconPath: 'btnheadhunterberserker.png',
    areaOfEffect: 1,
    levels: {
            "1": {
                  "areaOfEffect": 1
            }
      },
    availableToClasses: ['juggernaut'],
    spellbook: 'hero',
  },
  {
    id: 'hide-tracking-beacon',
    name: 'Hide Tracking Beacon',
    category: 'hunter',
    classRequirement: 'hunter',
    description: '',
    tooltip: 'Allows the tracker to put a tracking beacon on a unit. Tracking beacons remain inplace for |cff7DBEF1300|r seconds or until you place another one. Once placed, the location of the unit can be found with the Query Tracking Beacon skill. Has |cff7DBEF140|r seconds cooldown.',
    iconPath: 'btnspy.png',
    cooldown: 40,
    hotkey: 'R',
    targetsAllowed: 'enemies,ground,hero',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 40
            }
      },
  },
  {
    id: 'query-tracking-beacon',
    name: 'Query Tracking Beacon',
    category: 'hunter',
    classRequirement: 'hunter',
    description: '',
    tooltip: 'Pings the location of the tracking beacon. Has |cff7DBEF140|r seconds cooldown.',
    iconPath: 'btnspy.png',
    cooldown: 40,
    hotkey: 'A',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 40
            }
      },
  },
  {
    id: 'dysentery-track-aka-charlie-brown',
    name: 'Dysentery Track AKA "Charlie Brown',
    category: 'hunter',
    classRequirement: 'hunter',
    description: '',
    tooltip: 'Throws a bottle filled with dirty stuff, causing the target to get dysentery-like symptoms and poop hot, steaming diarrhea uncontrollably. Tracks a lot longer than normal track and is good for tracking long range. Lasts |cff7DBEF145|r seconds, has |cff7DBEF140|r seconds cooldown.',
    iconPath: 'BTNTracking.png',
    cooldown: 40,
    range: 500,
    duration: 45,
    hotkey: 'Q',
    targetsAllowed: 'organic,enemies,ground',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 40,
                  "duration": 45,
                  "range": 500
            }
      },
  },
  {
    id: 'tracking-trap',
    name: 'Tracking Trap',
    category: 'hunter',
    classRequirement: 'hunter',
    description: '',
    tooltip: 'Troll walking through this trap will get tracked, having their position revealed and armor reduced by |cffFF02024|r for |cff7DBEF130|r seconds. Track Trap last |cff7DBEF1240|r seconds, has |cff7DBEF160|r seconds cooldown.',
    iconPath: 'btnstasistrap.png',
    manaCost: 10,
    cooldown: 60,
    range: 100,
    areaOfEffect: 200,
    hotkey: 'Q',
    levels: {
            "1": {
                  "manaCost": 10,
                  "cooldown": 60,
                  "range": 100,
                  "areaOfEffect": 200
            }
      },
  },
  {
    id: 'the-warrior-is-adept-at-tanking-and-smashing-enemies-he-gets-damage-reduction-and-his-attack-can-hit-enemies-around-him-however-he-can-t-use-track-anymore-a-pretty-straight-forward-class-can-only-choose-1-subclass',
    name: 'The Warrior is adept at tanking and smashing enemies. He gets damage reduction and his attack can hit enemies around him,however he can\'t use track anymore. A pretty straight forward class. Can only choose 1 subClass!',
    category: 'hunter',
    classRequirement: 'hunter',
    description: '',
    tooltip: 'The Warrior is adept at tanking and smashing enemies. He gets damage reduction and his attack can hit enemies around him,however he can\'t use track anymore. A pretty straight forward class. |cffFF0202Can only choose 1 subClass!|r|cff7DBEF1\n\nDifficulty: |r|cff1FBF00Easy|r',
    iconPath: 'BTNTrollPredator.png',
    hotkey: 'Q',
  },
  {
    id: 'the-tracker-is-adept-at-chasing-and-tracking-enemies-he-got-a-nice-spell-kit-allowing-him-to-track-down-enemy-troll-can-only-choose-1-subclass',
    name: 'The Tracker is adept at chasing and tracking enemies. He got a nice spell kit allowing him to track down enemy troll. Can only choose 1 subClass!',
    category: 'hunter',
    classRequirement: 'hunter',
    description: '',
    tooltip: 'The Tracker is adept at chasing and tracking enemies. He got a nice spell kit allowing him to track down enemy troll. |cffFF0202Can only choose 1 subClass!|r|cff7DBEF1\n\nDifficulty: |r|cffFE890DMedium|r',
    iconPath: 'btnicetroll.png',
    hotkey: 'W',
  },
  {
    id: 'the-juggernaut-is-the-best-fighting-class-in-the-game-he-is-big-he-is-fast-and-he-hit-really-hard',
    name: 'The Juggernaut is the best fighting class in the game, he is big, he is fast and he hit really hard.',
    category: 'hunter',
    classRequirement: 'hunter',
    description: '',
    tooltip: 'The Juggernaut is the best fighting class in the game, he is big, he is fast and he hit really hard.|cff7DBEF1\n\nDifficulty: |r|cff1FBF00Easy|r',
    iconPath: 'BTNTrollPredator.png',
    hotkey: 'E',
  }
];
