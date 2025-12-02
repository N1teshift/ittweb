import type { AbilityData } from './types';

export const PRIEST_ABILITIES: AbilityData[] = [
  {
    id: 'priest-inherited-spells',
    name: 'Priest Inherited Spells',
    category: 'priest',
    classRequirement: 'priest',
    description: '',
    tooltip: 'Inherited Spells from the Priest.',
    iconPath: 'btnmanual.png',
    hotkey: 'R',
    levels: {
            "1": {
                  "cooldown": 0
            }
      },
  },
  {
    id: 'replenish-health',
    name: 'Replenish Health',
    category: 'priest',
    classRequirement: 'priest',
    description: '',
    tooltip: '|cffFFD700Sustained manacost:|r |cff7DBEF110|r per second |n|nReplenishes health to the Master Healer and nearby allies, healing |cff1FBF001|r + |cff1FBF008%|rx|cff00EAFFIntelligence|r health per second. |nDrains mana until deactivated.',
    iconPath: 'btnholybolt.png',
    areaOfEffect: 500,
    targetsAllowed: 'air,allies,friend,ground,invulnerable,organic,self,vulnerable',
    levels: {
            "1": {
                  "areaOfEffect": 500
            }
      },
  },
  {
    id: 'angelic-elemental',
    name: 'Angelic Elemental',
    category: 'priest',
    classRequirement: 'priest',
    description: '',
    tooltip: 'Summons an angelic elemental and projects it forward. Any friendly unit that comes in contact with the elemental gets blessed, increasing their attack damage by |cffFF020225%|r and armor by |cff1FBF003|r for |cff7DBEF120|r seconds. Has |cff7DBEF160|r seconds cooldown.',
    iconPath: 'btndivineintervention.png',
    manaCost: 30,
    cooldown: 60,
    range: 770,
    hotkey: 'S',
    levels: {
            "1": {
                  "manaCost": 30,
                  "cooldown": 60,
                  "range": 770
            }
      },
  },
  {
    id: 'lightning-shield',
    name: 'Lightning Shield',
    category: 'priest',
    classRequirement: 'priest',
    description: '',
    tooltip: 'Cast Lightning Shield on target unit, deals \n|cffFF02023|r + |cffFF02020.1|rx|cff00EAFFIntelligence|r damage per second.\nLast |cff7DBEF120|r seconds, has |cff7DBEF120|r seconds cooldown.',
    iconPath: 'btnlightningshield.png',
    manaCost: 20,
    cooldown: 20,
    range: 900,
    duration: 20,
    hotkey: 'Q',
    targetsAllowed: 'friend,ground,self',
    levels: {
            "1": {
                  "manaCost": 20,
                  "cooldown": 20,
                  "duration": 20,
                  "range": 900
            }
      },
  },
  {
    id: 'spirit-link',
    name: 'Spirit Link',
    category: 'priest',
    classRequirement: 'priest',
    description: '',
    tooltip: 'Links spirits of |cffFE890D2|r units, splitting any damage taken between them.\nLasts |cff7DBEF120|r seconds, Has |cff7DBEF140|r seconds cooldown.',
    iconPath: 'btnspiritlink.png',
    manaCost: 40,
    cooldown: 40,
    duration: 20,
    areaOfEffect: 2000,
    hotkey: 'A',
    levels: {
            "1": {
                  "manaCost": 40,
                  "cooldown": 40,
                  "duration": 20,
                  "areaOfEffect": 2000
            }
      },
  },
  {
    id: 'anchor-soul',
    name: 'Anchor Soul',
    category: 'priest',
    classRequirement: 'priest',
    description: '',
    tooltip: 'Anchors the soul of the target to reality, preventing the unit from dying momentarily. While in effect, the target cannot be reduced to zero health, energy, or heat.|n Lasts |cff7DBEF13|r seconds, has |cff7DBEF160|r seconds cooldown.',
    iconPath: 'btnresurrection.png',
    manaCost: 10,
    cooldown: 60,
    duration: 3,
    hotkey: 'Z',
    targetsAllowed: 'air,friend,ground,self',
    levels: {
            "1": {
                  "manaCost": 10,
                  "cooldown": 60,
                  "duration": 3
            }
      },
  },
  {
    id: 'reincarnation',
    name: 'Reincarnation',
    category: 'priest',
    classRequirement: 'priest',
    description: '',
    tooltip: 'When killed, the Master Healer will come back to life. Has |cff7DBEF1240|r seconds cooldown.|cffFF0202Warning :|r You need to have |cff7DBEF1100|r mana when you die to be reincarnated.',
    manaCost: 100,
    cooldown: 240,
    levels: {
            "1": {
                  "manaCost": 100,
                  "cooldown": 240
            }
      },
  },
  {
    id: 'replenish-energy',
    name: 'Replenish Energy',
    category: 'priest',
    classRequirement: 'priest',
    description: '',
    tooltip: 'The Master Healer emanates a refreshing aura to himself and his allies, granting |cff7DBEF10.33|r energy regeneration per seconds.',
    iconPath: 'pasbtnregenerate.png',
    areaOfEffect: 800,
    targetsAllowed: 'hero,friend,self',
    levels: {
            "1": {
                  "areaOfEffect": 800
            }
      },
  },
  {
    id: 'self-preservation',
    name: 'Self Preservation',
    category: 'priest',
    classRequirement: 'priest',
    description: '',
    tooltip: 'Raises all stats (Health Point, Energy, Heat) of your troll by |cff1FBF0010|r+|cff1FBF00100|r% of your |cff00EAFFIntelligence|r. Has |cff7DBEF160|r seconds cooldown.',
    iconPath: 'btnregenerate.png',
    cooldown: 60,
    hotkey: 'S',
    castTime: 'Models\\Abilities\\SelfPreservation.mdx',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 60
            }
      },
    visualEffects: {
            "attachmentPoints": [
                  "overhead"
            ]
      },
  },
  {
    id: 'open-light-gate',
    name: 'Open Light Gate',
    category: 'priest',
    classRequirement: 'priest',
    description: '',
    tooltip: 'The Sage summons an extraordinary amount of white magic forming it into balls of energy. The energy balls form a ring and slowly dissipate, casting boosting spells on all allies within as they do. The longer this spell is channeled, the longer the gate remains open and the more spells the energy balls cast.',
    iconPath: 'btnsell.png',
    manaCost: 70,
    cooldown: 70,
    hotkey: 'E',
    levels: {
            "1": {
                  "manaCost": 70,
                  "cooldown": 70
            }
      },
  },
  {
    id: 'maximum-fervor',
    name: 'Maximum Fervor',
    category: 'priest',
    classRequirement: 'priest',
    description: '',
    tooltip: 'This spell has a similar effect of a fervor potion and increase armor by |cff1FBF0010|r, damage by |cffFF020250%|r for |cff7DBEF110|r seconds. Has |cff7DBEF160|r seconds cooldown.',
    iconPath: 'btnberserk.png',
    manaCost: 30,
    cooldown: 60,
    hotkey: 'W',
    levels: {
            "1": {
                  "manaCost": 30,
                  "cooldown": 60
            }
      },
  },
  {
    id: 'anti-magic-shell',
    name: 'Anti-Magic Shell',
    category: 'priest',
    classRequirement: 'priest',
    description: '',
    tooltip: 'Grants an anti-magic barrier to target ally that absorbs |cff1FBF0020|r + |cff1FBF00100|r% of your |cff00EAFFIntelligence|r magic damage and blocks them from being ensnared by hunters or ensnare traps. \nLasts |cff7DBEF110|r seconds, has |cff7DBEF11|r seconds cooldown.',
    iconPath: 'btnantimagicshell.png',
    manaCost: 5,
    cooldown: 1,
    range: 600,
    duration: 10,
    areaOfEffect: 600,
    hotkey: 'Q',
    levels: {
            "1": {
                  "manaCost": 20,
                  "cooldown": 20,
                  "range": 600,
                  "areaOfEffect": 600
            },
            "2": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "3": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "4": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "5": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "6": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "7": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "8": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "9": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "10": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "11": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "12": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "13": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "14": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "15": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "16": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "17": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "18": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "19": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "20": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "21": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "22": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "23": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "24": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "25": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "26": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "27": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "28": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "29": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "30": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "31": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "32": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "33": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "34": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "35": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "36": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "37": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "38": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "39": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "40": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "41": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "42": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "43": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "44": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "45": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "46": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "47": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "48": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "49": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "50": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "51": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "52": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "53": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "54": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "55": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "56": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "57": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "58": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "59": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "60": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "61": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "62": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "63": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "64": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "65": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "66": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "67": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "68": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "69": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "70": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "71": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "72": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "73": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "74": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "75": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "76": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "77": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "78": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "79": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            },
            "80": {
                  "manaCost": 5,
                  "cooldown": 1,
                  "duration": 10,
                  "range": 600
            }
      },
  },
  {
    id: 'healing-wave',
    name: 'Healing wave',
    category: 'priest',
    classRequirement: 'priest',
    description: '',
    tooltip: 'Calls forth a wave of healing energy that bounces up to |cffFE890D3|r times, restoring health equal to |cff1FBF0015|r + |cff1FBF0080|r% of your |cff00EAFFIntelligence|r to the primary target. Each jump heals |cffFE890D20%|r less. Bounces on an extremely large range. \nHas |cff7DBEF120|r seconds cooldown.',
    iconPath: 'btnhealingwave.png',
    manaCost: 10,
    cooldown: 20,
    range: 6000,
    hotkey: 'S',
    targetsAllowed: 'air,ground,friend,self,vuln,invu,organic',
    levels: {
            "1": {
                  "manaCost": 10,
                  "cooldown": 20,
                  "range": 6000
            }
      },
  },
  {
    id: 'magic-mist',
    name: 'Magic Mist',
    category: 'priest',
    classRequirement: 'priest',
    description: '',
    tooltip: 'The Priest creates an artificial fog preventing all combat within it. Lasts |cff7DBEF15|r seconds, has |cff7DBEF135|r seconds cooldown.',
    iconPath: 'btncloudoffog.png',
    manaCost: 20,
    cooldown: 35,
    range: 400,
    duration: 0.01,
    areaOfEffect: 400,
    hotkey: 'A',
    targetsAllowed: 'debris',
    levels: {
            "1": {
                  "manaCost": 20,
                  "cooldown": 35,
                  "duration": 0.01,
                  "range": 400,
                  "areaOfEffect": 400
            }
      },
  },
  {
    id: 'mix-energy',
    name: 'Mix Energy',
    category: 'priest',
    classRequirement: 'priest',
    description: '',
    tooltip: 'The Priest psychically links up with a target. Both unit\'s energies are drained, pooled, and redistributed equally between the 2 units. Has |cff7DBEF150|r seconds cooldown.',
    iconPath: 'btnmanadrain.png',
    cooldown: 50,
    range: 500,
    hotkey: 'Q',
    targetsAllowed: 'air,enemies,friend,ground,hero,notself',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 50,
                  "range": 500
            }
      },
  },
  {
    id: 'mix-heat',
    name: 'Mix Heat',
    category: 'priest',
    classRequirement: 'priest',
    description: '',
    tooltip: 'The Priest psychically links up with a target. Both unit\'s heat are drained, pooled, and redistributed equally between the 2 units. Has |cff7DBEF150|r seconds cooldown.',
    iconPath: 'btnheatdrain.png',
    manaCost: 10,
    cooldown: 50,
    range: 500,
    hotkey: 'W',
    targetsAllowed: 'friend,ground,hero,notself',
    levels: {
            "1": {
                  "manaCost": 10,
                  "cooldown": 50,
                  "range": 500
            }
      },
  },
  {
    id: 'mix-health',
    name: 'Mix Health',
    category: 'priest',
    classRequirement: 'priest',
    description: '',
    tooltip: 'The Priest psychically links up with a target. Both unit\'s health is drained, pooled, and redistributed equally between the 2 units. Has |cff7DBEF150|r seconds cooldown.',
    iconPath: 'btnlifedrain.png',
    cooldown: 50,
    range: 500,
    hotkey: 'S',
    targetsAllowed: 'air,friend,ground,hero,notself',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 50,
                  "range": 500
            }
      },
  },
  {
    id: 'ranged-heal',
    name: 'Ranged heal',
    category: 'priest',
    classRequirement: 'priest',
    description: '',
    tooltip: 'Heals a friendly unit for |cff1FBF0015|r+|cff1FBF0080|r% of your |cff00EAFFIntelligence|r. Can be casted from very far away. \nHas |cff7DBEF110|r seconds cooldown.',
    iconPath: 'btnheal.png',
    manaCost: 25,
    cooldown: 10,
    range: 6000,
    hotkey: 'R',
    targetsAllowed: 'air,ground,friend,vulnerable,invulnerable,self,organic,nonancient,neutral',
    levels: {
            "1": {
                  "manaCost": 25,
                  "cooldown": 10,
                  "range": 6000
            }
      },
  },
  {
    id: 'pump-up',
    name: 'Pump Up',
    category: 'priest',
    classRequirement: 'priest',
    description: '',
    tooltip: 'Increase a friendly unit attack speed by |cffFE890D20%|r and movement speed by |cffFE890D10%|r for |cff7DBEF120|r seconds. Has |cff7DBEF130|r seconds cooldown.',
    iconPath: 'btnbloodlust.png',
    cooldown: 30,
    range: 1000,
    duration: 20,
    hotkey: 'E',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 30,
                  "duration": 20,
                  "range": 1000
            }
      },
  }
];

