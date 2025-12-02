import type { AbilityData } from './types';

export const MAGE_ABILITIES: AbilityData[] = [
  {
    id: 'firebolt',
    name: 'Firebolt',
    category: 'mage',
    classRequirement: 'mage',
    description: '',
    range: 1000,
    duration: 7,
    levels: {
            "1": {
                  "manaCost": 0,
                  "duration": 7,
                  "range": 1000
            }
      },
  },
  {
    id: 'summon-nel-rune',
    name: 'Summon Nel Rune',
    category: 'mage',
    classRequirement: 'mage',
    description: '',
    tooltip: 'Summons a |cff1FBF00Nel|r rune from dementia space. |cff1FBF00Nel|r runes are commonly used in crippling spells. They circle the caster until activated and when activated they seek a nearby enemy and blast it with their element. 5 runes at a time max. Has |cff7DBEF120|r seconds cooldown.',
    iconPath: 'btnnelrune.png',
    manaCost: 15,
    cooldown: 20,
    hotkey: 'W',
    levels: {
            "1": {
                  "manaCost": 15,
                  "cooldown": 20
            }
      },
  },
  {
    id: 'summon-ka-rune',
    name: 'Summon Ka Rune',
    category: 'mage',
    classRequirement: 'mage',
    description: '',
    tooltip: 'Summons a |cffFF0202Ka|r rune from dementia space. |cffFF0202Ka|r runes are commonly used in fire spells. They circle the caster until activated and when activated they seek a nearby enemy and blast it with their element. 5 runes at a time max. Has |cff7DBEF120|r seconds cooldown.',
    iconPath: 'btnkarune.png',
    manaCost: 15,
    cooldown: 20,
    hotkey: 'E',
    levels: {
            "1": {
                  "manaCost": 15,
                  "cooldown": 20
            }
      },
  },
  {
    id: 'summon-lez-rune',
    name: 'Summon Lez Rune',
    category: 'mage',
    classRequirement: 'mage',
    description: '',
    tooltip: 'Summons a |cff1BE5B8Lez|r rune from dementia space. |cff1BE5B8Lez|r runes are commonly used in frost spells. They circle the caster until activated and when activated they seek a nearby enemy and blast it with their element. 5 runes at a time max. Has |cff7DBEF120|r seconds cooldown.',
    iconPath: 'btnlezrune.png',
    manaCost: 15,
    cooldown: 20,
    hotkey: 'R',
    levels: {
            "1": {
                  "manaCost": 15,
                  "cooldown": 20
            }
      },
  },
  {
    id: 'depression-aura',
    name: 'Depression Aura',
    category: 'mage',
    classRequirement: 'mage',
    description: '',
    tooltip: 'The Hypnotist spend many time studying dark magic, he can passively generate a field of depression around him. Units that enter it loose energy quickly. Stacks with depression.',
    iconPath: 'pasbtnshadowpact.png',
    targetsAllowed: 'enemies,ground,hero,organic,vulnerable',
  },
  {
    id: 'depression-orb',
    name: 'Depression Orb',
    category: 'mage',
    classRequirement: 'mage',
    description: '',
    tooltip: 'The Hypnotist uses powerful magic to create an wisp of pure hatred and depression. The wisp is projected at opponents and it depresses all who get near it. Depressed opponents have slightly reduced speed and experience severe energy shortages. Has |cff7DBEF130|r seconds cooldown.',
    iconPath: 'btnorbofcorruption.png',
    manaCost: 20,
    cooldown: 30,
    hotkey: 'R',
    levels: {
            "1": {
                  "manaCost": 20,
                  "cooldown": 30
            }
      },
  },
  {
    id: 'depress',
    name: 'Depress',
    category: 'mage',
    classRequirement: 'mage',
    description: '',
    tooltip: 'The mage casts a spell causing a chemical inbalance in the target\'s head. The target becomes severly depressed causing their attack speed to be reduced by |cffFE890D10%|r and movement speed by |cffFE890D20%|r while loosing |cff1BE5B830|r mana over |cffFE890D10|r seconds. Has |cff7DBEF120|r seconds cooldown.',
    iconPath: 'btnshadowpact.png',
    manaCost: 10,
    cooldown: 20,
    duration: 10,
    areaOfEffect: 0,
    hotkey: 'S',
    levels: {
            "1": {
                  "manaCost": 10,
                  "cooldown": 20,
                  "duration": 10,
                  "areaOfEffect": 0
            }
      },
  },
  {
    id: 'flame-spray',
    name: 'Flame Spray',
    category: 'mage',
    classRequirement: 'mage',
    description: '',
    tooltip: 'Shoots fire bolt at nearby enemies dealing |cffFF020220|r damages. Has |cff7DBEF130|r seconds cooldown.',
    iconPath: 'btnfirebolt.png',
    manaCost: 10,
    cooldown: 30,
    areaOfEffect: 600,
    hotkey: 'W',
    levels: {
            "1": {
                  "manaCost": 10,
                  "cooldown": 30,
                  "duration": 0,
                  "areaOfEffect": 600
            }
      },
  },
  {
    id: 'metronome-impale',
    name: 'Metronome Impale',
    category: 'mage',
    classRequirement: 'mage',
    description: '',
    range: 99999,
    duration: 0.5,
    levels: {
            "0": {
                  "duration": 0.5
            },
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "range": 99999
            }
      },
  },
  {
    id: 'metronome-nova',
    name: 'Metronome Nova',
    category: 'mage',
    classRequirement: 'mage',
    description: '',
    range: 99999,
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "range": 99999
            }
      },
  },
  {
    id: 'metronome-mana-burn',
    name: 'Metronome Mana Burn',
    category: 'mage',
    classRequirement: 'mage',
    description: '',
    range: 99999,
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "range": 99999
            }
      },
  },
  {
    id: 'metronome-nova-ultimate',
    name: 'Metronome Nova Ultimate',
    category: 'mage',
    classRequirement: 'mage',
    description: '',
    range: 99999,
    duration: 5,
    areaOfEffect: 600,
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 5,
                  "range": 99999,
                  "areaOfEffect": 600
            }
      },
  },
  {
    id: 'metronome',
    name: 'Metronome',
    category: 'mage',
    classRequirement: 'mage',
    description: '',
    tooltip: 'Barrages enemies with random, chaining effects. Has |cff7DBEF145|r seconds cooldown.',
    iconPath: 'btnwandofmanasteal.png',
    manaCost: 20,
    cooldown: 45,
    duration: 0.01,
    hotkey: 'D',
    targetsAllowed: 'air,enemies,ground,neutral,organic',
    levels: {
            "1": {
                  "manaCost": 20,
                  "cooldown": 45,
                  "duration": 0.01
            }
      },
  },
  {
    id: 'reduce-food',
    name: 'Reduce Food',
    category: 'mage',
    classRequirement: 'mage',
    description: '',
    tooltip: 'The mage conjures a hungry spirit which is thrown at a target. The spirit devours 0 to 1 Cooked meats in the targest inventory, but can not reduce the food count below 1. Has |cff7DBEF115|r seconds cooldown.',
    iconPath: 'btnmonsterlure.png',
    manaCost: 25,
    cooldown: 15,
    range: 100,
    hotkey: 'R',
    targetsAllowed: 'enemies,ground,hero',
    levels: {
            "1": {
                  "manaCost": 25,
                  "cooldown": 15,
                  "range": 100
            }
      },
  },
  {
    id: 'the-hypnotist-is-adept-at-controlling-enemies-thoughts-and-emotions-he-can-easily-zap-enemi-63008cf0',
    name: 'The Hypnotist is adept at controlling enemies thoughts and emotions. He can easily zap enemies energy by means of depression and got some crowd controll spells. Can only choose 1 subClass!',
    category: 'mage',
    classRequirement: 'mage',
    description: '',
    tooltip: 'The Hypnotist is adept at controlling enemies thoughts and emotions. He can easily zap enemies energy by means of depression and got some crowd controll spells. |cffFF0202Can only choose 1 subClass!|r|cff7DBEF1\n\nDifficulty: |r|cffFF0202Hard|r',
    iconPath: 'btnhypnotist.png',
    hotkey: 'W',
  }
];

