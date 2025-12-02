import type { AbilityData } from './types';

export const SCOUT_ABILITIES: AbilityData[] = [
  {
    id: 'advanced-scout-radar',
    name: 'Advanced Scout Radar',
    category: 'scout',
    classRequirement: 'scout',
    description: '',
    tooltip: 'An improved better radar to locate unit around him with high precision.',
    iconPath: 'btnspy.png',
    hotkey: 'R',
    levels: {
            "1": {
                  "cooldown": 0
            }
      },
  },
  {
    id: 'reveal',
    name: 'Reveal',
    category: 'scout',
    classRequirement: 'scout',
    description: '',
    tooltip: 'Reveals an area around you, detects invisible units. Lasts |cff7DBEF18|r seconds, has |cff7DBEF120|r seconds cooldown.',
    iconPath: 'btnreveal.png',
    cooldown: 20,
    hotkey: 'E',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 20
            },
            "2": {
                  "manaCost": 0,
                  "cooldown": 20
            },
            "3": {
                  "manaCost": 0,
                  "cooldown": 20
            }
      },
  },
  {
    id: 'greater-reveal',
    name: 'Greater Reveal',
    category: 'scout',
    classRequirement: 'scout',
    description: '',
    tooltip: 'Reveals an large area around you, detects invisible units. Lasts |cff7DBEF110|r seconds, has |cff7DBEF120|r seconds cooldown.',
    iconPath: 'btnreveal.png',
    cooldown: 20,
    hotkey: 'E',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 20
            },
            "2": {
                  "manaCost": 0,
                  "cooldown": 20
            },
            "3": {
                  "manaCost": 0,
                  "cooldown": 20
            }
      },
  },
  {
    id: 'chain-reveal',
    name: 'Chain Reveal',
    category: 'scout',
    classRequirement: 'scout',
    description: '',
    tooltip: 'Cast multiple reveal around you and on your living clays, detects invisible units. Lasts |cff7DBEF110|r seconds, has |cff7DBEF150|r seconds cooldown.',
    iconPath: 'btnreveal.png',
    cooldown: 50,
    hotkey: 'E',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 50
            },
            "2": {
                  "manaCost": 0,
                  "cooldown": 50
            },
            "3": {
                  "manaCost": 0,
                  "cooldown": 50
            }
      },
  },
  {
    id: 'bird-of-prey',
    name: 'Bird of Prey',
    category: 'scout',
    classRequirement: 'scout',
    description: '',
    tooltip: 'Hawk can instantly kill and bring small prey to you.|cFFFFCC00\nLvl 1: |rcan be on area to catch closest fish in |cff7DBEF1300|r radius. Has |cff7DBEF15|r seconds cooldown.|cFFFFCC00\nLvl 2: |rcan be used on baby animals. Has |cff7DBEF110|r seconds cooldown.|cFFFFCC00\nLvl 4: |rcan be used on snakes. Has |cff7DBEF110|r seconds cooldown.',
    iconPath: 'pasbtnbirdofprey.png',
  },
  {
    id: 'bring-down',
    name: 'Bring Down',
    category: 'scout',
    classRequirement: 'scout',
    description: '',
    tooltip: 'Hawk can bring down a bird, slamming it into the ground, preventing it from flying for |cff7DBEF18|r seconds. |cFFFFCC00\nLvl 2: |rdeals |cffFF020240|r damage.|cFFFFCC00\nLvl 4: |rdeals |cffFF020260|r damage.\nHas |cff7DBEF120|r seconds cooldown.',
    iconPath: 'pasbtnbringdown.png',
  },
  {
    id: 'eagle-sight',
    name: 'Eagle Sight',
    category: 'scout',
    classRequirement: 'scout',
    description: '',
    tooltip: 'Hawk grants Scout vision of nearby resources and bushes.|cFFFFCC00\nLvl 1: |rgain vision of resources in |cff7DBEF1600|r radius. |cFFFFCC00\nLvl 2: |rgain vision of bushes, radius increased to |cff7DBEF1750|r.|cFFFFCC00\nLvl 4: |rradius increased to |cff7DBEF1900|r.',
    iconPath: 'pasbtneaglesight.png',
  },
  {
    id: 'dream-vision',
    name: 'Dream Vision',
    category: 'scout',
    classRequirement: 'scout',
    description: '',
    tooltip: 'You can see through the eyes of nearby hawks while dreaming.\nUpon entering sleep, gain shared vision with a nearest neutral hawk in radius, if no hawk was found, gain vision of your hawk instead.|cFFFFCC00\nLvl 2: |r|cff7DBEF12000|r radius.|cFFFFCC00\nLvl 4: |r|cff7DBEF13000|r radius.',
    iconPath: 'pasbtndreamvision.png',
  },
  {
    id: 'reveal-short-range',
    name: 'Reveal Short Range',
    category: 'scout',
    classRequirement: 'scout',
    description: '',
    range: 99999,
    duration: 1,
    areaOfEffect: 450,
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 1,
                  "range": 99999,
                  "areaOfEffect": 450
            }
      },
  },
  {
    id: 'the-observer-is-adept-at-controlling-vision-he-can-learn-to-drop-wards-to-keep-vision-on-an-8486ec20',
    name: 'The Observer is adept at controlling vision. He can learn to drop wards to keep vision on an area and has a wide ranged reveal. Can only choose 1 subClass!',
    category: 'scout',
    classRequirement: 'scout',
    description: '',
    tooltip: 'The Observer is adept at controlling vision. He can learn to drop wards to keep vision on an area and has a wide ranged reveal. |cffFF0202Can only choose 1 subClass!|r|cff7DBEF1\n\nDifficulty: |r|cff1FBF00Easy|r',
    iconPath: 'btnwyvernrider.png',
    hotkey: 'Q',
  },
  {
    id: 'the-trapper-got-an-advanced-radar-allowing-him-to-locate-precisely-animals-and-enemies-he-a-b4ac2769',
    name: 'The Trapper got an advanced radar allowing him to locate precisely animals and enemies. He also has the ability to place traps which either reveals enemy position or slow them down. Can only choose 1 subClass!',
    category: 'scout',
    classRequirement: 'scout',
    description: '',
    tooltip: 'The Trapper got an advanced radar allowing him to locate precisely animals and enemies. He also has the ability to place traps which either reveals enemy position or slow them down. |cffFF0202Can only choose 1 subClass!|r|cff7DBEF1\n\nDifficulty: |r|cffFE890DMedium|r',
    iconPath: 'btntrapper.png',
    hotkey: 'W',
  },
  {
    id: 'the-spy-got-the-best-radar-and-reveal-possible-it-s-nearly-impossible-to-hide-from-him',
    name: 'The Spy got the best radar and reveal possible,it\'s nearly impossible to hide from him',
    category: 'scout',
    classRequirement: 'scout',
    description: '',
    tooltip: 'The Spy got the best radar and reveal possible,it\'s nearly impossible to hide from him|cff7DBEF1\n\nDifficulty: |r|cff1FBF00Easy|r',
    iconPath: 'btnforesttrolltrapper.png',
    hotkey: 'E',
  }
];

