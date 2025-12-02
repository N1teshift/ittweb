import type { AbilityData } from './types';

export const UNKNOWN_ABILITIES: AbilityData[] = [
  {
    id: 'leave-detect',
    name: 'Leave Detect',
    category: 'unknown',
    description: '',
  },
  {
    id: 'overcharged',
    name: 'Overcharged',
    category: 'unknown',
    description: '',
    duration: 15,
    areaOfEffect: 0,
    targetsAllowed: 'self',
    levels: {
            "1": {
                  "duration": 15,
                  "areaOfEffect": 0
            }
      },
    visualEffects: {
            "attachmentPoints": [
                  "hand,right",
                  "hand,left",
                  2
            ],
            "attachmentTarget": "Abilities\\Spells\\Human\\ManaFlare\\ManaFlareBase.mdx"
      },
  },
  {
    id: 'overcharge',
    name: 'Overcharge',
    category: 'unknown',
    description: '',
    tooltip: 'Causes the next spell you cast to have a bonus effect, last |cff7DBEF110|r seconds.\n\n|cffFF6347Zap|r\nForks to three targets.\n\n|cffFF6347Meteor|r\nSet the ground on fire dealing |cffFF020215|r damage per second for |cff7DBEF17|r seconds.\n\n|cffFF6347FrostBlast|r\nShoots out out 7 projectiles in quick succession, dealing |cffFE890D30%|r of the normal damage.\n\n|cffFF6347Earthguardian|r\nInstantly summons all 7 orbs.\n\n|cffFF6347Brambles|r\nAdditionally roots targets for |cff7DBEF13|r seconds.\n\n|cffFF6347Meditate|r\nCan meditate while moving. Cancels on damage.',
    iconPath: 'btnfeedback.png',
    manaCost: 12,
    cooldown: 16,
    hotkey: 'A',
    levels: {
            "1": {
                  "manaCost": 12,
                  "cooldown": 16,
                  "duration": 0
            }
      },
  },
  {
    id: 'brambles',
    name: 'Brambles',
    category: 'unknown',
    description: '',
    tooltip: 'Causes brambles to surface from underground in a straight line, and units who stand in the brambles receive |cffFF02028|r damage per second and have their movement speed slowed by |cffFE890D75%|r, attack speed slowed by |cffFE890D25%|r. The brambles last |cff7DBEF16|r seconds. Has |cff7DBEF140|r seconds cooldown.',
    iconPath: 'btnentanglingroots.png',
    manaCost: 16,
    cooldown: 40,
    range: 700,
    hotkey: 'S',
    levels: {
            "1": {
                  "manaCost": 16,
                  "cooldown": 40,
                  "range": 700
            }
      },
  },
  {
    id: 'canniablize-dummy',
    name: 'Canniablize Dummy',
    category: 'unknown',
    description: '',
    levels: {
            "1": {
                  "duration": 0
            }
      },
  },
  {
    id: 'hatch',
    name: 'Hatch',
    category: 'unknown',
    description: '',
    tooltip: 'Fill up the hatcherie\'s slots with 5 objects marked with "Hatchery Transmutable" plus an egg to try and hatch the egg. The Hawk you get and it\'s stats depend on what items you hatch the egg with.',
    iconPath: 'btnphoenixegg.png',
    duration: 0.01,
    areaOfEffect: 0,
    targetsAllowed: 'invulnerable',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 0.01,
                  "areaOfEffect": 0
            }
      },
  },
  {
    id: 'owl-speed',
    name: 'Owl Speed',
    category: 'unknown',
    description: '',
    tooltip: 'Owl Speed',
    iconPath: 'btnsnowowl.png',
    areaOfEffect: 10,
    targetsAllowed: 'self',
    levels: {
            "1": {
                  "areaOfEffect": 10
            },
            "2": {
                  "areaOfEffect": 10
            },
            "3": {
                  "areaOfEffect": 10
            },
            "4": {
                  "areaOfEffect": 10
            },
            "5": {
                  "areaOfEffect": 10
            },
            "6": {
                  "areaOfEffect": 10
            }
      },
  },
  {
    id: 'owl-gathering-radius',
    name: 'Owl Gathering Radius',
    category: 'unknown',
    description: '',
    tooltip: 'Move along, sir. Nothing to see here',
    iconPath: 'btnsnowowl.png',
    areaOfEffect: 10,
    targetsAllowed: 'self',
    levels: {
            "1": {
                  "areaOfEffect": 10
            },
            "2": {
                  "areaOfEffect": 10
            },
            "3": {
                  "areaOfEffect": 10
            },
            "4": {
                  "areaOfEffect": 10
            },
            "5": {
                  "areaOfEffect": 10
            },
            "6": {
                  "areaOfEffect": 10
            }
      },
  },
  {
    id: 'owl-movement-radius',
    name: 'Owl Movement Radius',
    category: 'unknown',
    description: '',
    tooltip: 'Owl Movement',
    iconPath: 'btnsnowowl.png',
    areaOfEffect: 10,
    targetsAllowed: 'self',
    levels: {
            "1": {
                  "areaOfEffect": 10
            },
            "2": {
                  "areaOfEffect": 10
            },
            "3": {
                  "areaOfEffect": 10
            },
            "4": {
                  "areaOfEffect": 10
            },
            "5": {
                  "areaOfEffect": 10
            },
            "6": {
                  "areaOfEffect": 10
            }
      },
  },
  {
    id: 'owl-health',
    name: 'Owl Health',
    category: 'unknown',
    description: '',
    tooltip: 'Owl Health',
    iconPath: 'btnsnowowl.png',
    targetsAllowed: 'self',
  },
  {
    id: 'owl-inventory',
    name: 'Owl Inventory',
    category: 'unknown',
    description: '',
  },
  {
    id: 'temp-speed-bonus',
    name: 'Temp Speed Bonus',
    category: 'unknown',
    description: '',
    tooltip: 'Adept at running, the Thief sprints as fast as he can',
    cooldown: 25,
    duration: 10,
    levels: {
            "1": {
                  "cooldown": 25,
                  "duration": 10
            }
      },
  },
  {
    id: 'healing',
    name: 'Healing',
    category: 'unknown',
    description: '',
    duration: 25,
    levels: {
            "1": {
                  "duration": 25
            }
      },
  },
  {
    id: 'taste-for-blood',
    name: 'Taste for Blood',
    category: 'unknown',
    description: '',
    tooltip: 'Nearby friendly melee units gain <A0EJ,DataA1,%>% of their physical damage dealt when they hit enemy units.',
    areaOfEffect: 800,
    levels: {
            "1": {
                  "areaOfEffect": 800
            }
      },
  },
  {
    id: 'bear-s-endurance',
    name: 'Bear\'s Endurance',
    category: 'unknown',
    description: '',
    tooltip: 'Gives <A0EK,DataA1,.> additional armor to nearby friendly units.',
    iconPath: 'pasbtndrunkendodge.png',
  },
  {
    id: 'cat-s-grace',
    name: 'Cat\'s Grace',
    category: 'unknown',
    description: '',
    tooltip: 'Increases nearby friendly units\' movement speed by <A0EL,DataA1,%>% and attack rate by <A0EL,DataB1,%>%.',
    iconPath: 'pasbtnevasion.png',
    areaOfEffect: 800,
    levels: {
            "1": {
                  "areaOfEffect": 800
            }
      },
  },
  {
    id: '100-gold',
    name: '100 Gold',
    category: 'unknown',
    description: '',
  },
  {
    id: 'fell-tree',
    name: 'Fell Tree',
    category: 'unknown',
    description: '',
    tooltip: 'Might of Dire Bear allows him to fell a tree instanteniously.\nAlso gives you an ability to fell trees with your attacks.\nHas |cff7DBEF17.0|r seconds cooldown.',
    manaCost: 40,
    cooldown: 7,
    range: 150,
    hotkey: 'R',
    levels: {
            "1": {
                  "manaCost": 40,
                  "cooldown": 7,
                  "duration": 0,
                  "range": 150
            }
      },
  },
  {
    id: 'sleep-outside',
    name: 'Sleep Outside',
    category: 'unknown',
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
  },
  {
    id: 'sleep-inside-tent',
    name: 'Sleep Inside Tent',
    category: 'unknown',
    description: '',
    tooltip: 'The Troll can sleep inside the tent to restore |cff00EAFF80|r mana. Has |cff6495ED<AMdc,Cool1>|r seconds cooldown.',
    cooldown: 10,
    range: 300,
    duration: 6,
    hotkey: 'F',
    targetsAllowed: 'friend,ground,hero,self',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 10,
                  "duration": 6,
                  "range": 300
            }
      },
  },
  {
    id: 'sleep-inside-hut',
    name: 'Sleep Inside Hut',
    category: 'unknown',
    description: '',
    tooltip: 'The Troll can sleep inside the hut to restore |cff00EAFF200|r mana. Has |cff6495ED<AMdd,Cool1>|r seconds cooldown.',
    cooldown: 10,
    range: 300,
    duration: 6,
    hotkey: 'F',
    targetsAllowed: 'friend,ground,hero,self',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 10,
                  "duration": 6,
                  "range": 300
            }
      },
  },
  {
    id: 'stupefy-field',
    name: 'Stupefy Field',
    category: 'unknown',
    description: '',
    tooltip: 'The Hypnotist generates a magic field. Anyone, including allies and the hypnotist, that enters this field becomes temporarily stupefied. Stupefied units have attack and movespeed extremely reduced. Last |cff7DBEF110|r seconds. Has |cff7DBEF160|r seconds cooldown.',
    iconPath: 'btnpolymorph.png',
    manaCost: 10,
    cooldown: 60,
    hotkey: 'F',
    castTime: 'Abilities\\Spells\\Orc\\Voodoo\\VoodooAuraTarget.mdx,Abilities\\Spells\\Human\\FlameStrike\\FlameStrikeTarget.mdx',
    levels: {
            "1": {
                  "manaCost": 10,
                  "cooldown": 60
            }
      },
  },
  {
    id: 'stupefying-aura',
    name: 'Stupefying Aura',
    category: 'unknown',
    description: '',
    tooltip: 'You shouldn\'t see this',
    iconPath: 'btnload.png',
    targetsAllowed: 'enemies,friend,ground,organic,self,vulnerable,nonancient',
  },
  {
    id: 'strenght-2',
    name: 'Strenght + 2',
    category: 'unknown',
    description: '',
  },
  {
    id: 'amh-abrf',
    name: 'AMh{:Abrf',
    category: 'unknown',
    description: '',
  },
  {
    id: 'attack-trees',
    name: 'Attack Trees',
    category: 'unknown',
    description: '',
    areaOfEffect: 0,
    targetsAllowed: 'debris,ground,item,structure,tree,ward',
    levels: {
            "1": {
                  "areaOfEffect": 0
            }
      },
  },
  {
    id: 'stone-axe-damage-bonus',
    name: 'Stone Axe Damage Bonus',
    category: 'unknown',
    description: '',
  },
  {
    id: 'iron-axe-damage-bonus',
    name: 'Iron Axe Damage Bonus',
    category: 'unknown',
    description: '',
  },
  {
    id: 'steel-axe-damage-bonus',
    name: 'Steel Axe Damage Bonus',
    category: 'unknown',
    description: '',
  },
  {
    id: 'battle-axe-damage-bonus',
    name: 'Battle Axe Damage Bonus',
    category: 'unknown',
    description: '',
  },
  {
    id: 'mage-masher-axe-damage-bonus',
    name: 'Mage Masher Axe Damage Bonus',
    category: 'unknown',
    description: '',
  },
  {
    id: 'mage-masher-silence',
    name: 'Mage Masher Silence',
    category: 'unknown',
    description: '',
    manaCost: 10,
    cooldown: 45,
    range: 350,
    duration: 12,
    areaOfEffect: 225,
    levels: {
            "1": {
                  "manaCost": 10,
                  "cooldown": 45,
                  "duration": 12,
                  "range": 350,
                  "areaOfEffect": 225
            }
      },
  },
  {
    id: 'battle-axe-purge',
    name: 'Battle Axe Purge',
    category: 'unknown',
    description: '',
    cooldown: 60,
    range: 400,
    duration: 15,
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 60,
                  "duration": 15,
                  "range": 400
            }
      },
  },
  {
    id: 'increased-movement-sped-by-20',
    name: 'Increased movement sped by 20',
    category: 'unknown',
    description: '',
  },
  {
    id: 'bone-tistle',
    name: 'Bone Tistle',
    category: 'unknown',
    description: '',
    tooltip: 'Bone Tistle',
    iconPath: 'btnthoriumranged.png',
    range: 99999,
    duration: 2,
    targetsAllowed: 'air,enemies,ground,neutral,organic,terrain',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 2,
                  "range": 99999
            }
      },
  },
  {
    id: 'loaded-hero-thistles',
    name: 'Loaded Hero Thistles',
    category: 'unknown',
    description: '',
    range: 99999,
    duration: 16,
    targetsAllowed: 'air,enemies,ground,neutral,organic,terrain',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 17,
                  "range": 99999
            }
      },
  },
  {
    id: 'loaded-normal-thistles',
    name: 'Loaded Normal Thistles',
    category: 'unknown',
    description: '',
    range: 99999,
    duration: 16,
    targetsAllowed: 'air,enemies,ground,neutral,organic,terrain',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 16,
                  "range": 99999
            }
      },
  },
  {
    id: 'loaded-dark-thistles',
    name: 'Loaded Dark Thistles',
    category: 'unknown',
    description: '',
    range: 99999,
    duration: 16,
    targetsAllowed: 'air,enemies,ground,neutral,organic,terrain',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 16,
                  "range": 99999
            }
      },
  },
  {
    id: 'scavenge-for-food',
    name: 'Scavenge for food',
    category: 'unknown',
    description: '',
    tooltip: 'Scavenge for food from hidden stash or mushroom colony, attempting to collect all edible food as well as generating one unit of food.\nThe amount of food scavenged is doubled at lvl |cFFFFCC004|r.\nHas |cff7DBEF130.0|r seconds cooldown.',
    iconPath: 'btnstrengthofthewild.png',
    manaCost: 20,
    cooldown: 30,
    hotkey: 'E',
    targetsAllowed: 'neutral,ground,structure,invulnerable',
    levels: {
            "1": {
                  "manaCost": 20,
                  "cooldown": 30,
                  "range": 0
            }
      },
  },
  {
    id: 'placeholder-ability',
    name: 'PlaceHolder Ability',
    category: 'unknown',
    description: '',
    range: 0.01,
    targetsAllowed: 'bridge',
    levels: {
            "1": {
                  "range": 0.01
            }
      },
  },
  {
    id: 'grabs-a-nearby-corpse-and-stores-it-for-later-use-unattended-corpses-will-rot-after-two-min-3b8247bf',
    name: 'Grabs a nearby corpse and stores it for later use. Unattended corpses will rot after two minutes. Current Capacity: 0 / 8',
    category: 'unknown',
    description: '',
    tooltip: 'Grabs a nearby corpse and stores it for later use. Unattended corpses will rot after two minutes.|n|cffFFD700Current Capacity: 0 / 8|r',
    iconPath: 'btncorpsegrab0.png',
    range: 128,
    areaOfEffect: 800,
    hotkey: 'C',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "range": 128,
                  "areaOfEffect": 800
            }
      },
  },
  {
    id: 'grabs-a-nearby-corpse-and-stores-it-for-later-use-unattended-corpses-will-rot-after-two-min-53924ddb',
    name: 'Grabs a nearby corpse and stores it for later use. Unattended corpses will rot after two minutes. Current Capacity: 1 / 8',
    category: 'unknown',
    description: '',
    tooltip: 'Grabs a nearby corpse and stores it for later use. Unattended corpses will rot after two minutes.|n|cffFFD700Current Capacity: 1 / 8|r',
    iconPath: 'btncorpsegrab1.png',
    range: 128,
    areaOfEffect: 800,
    hotkey: 'C',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "range": 128,
                  "areaOfEffect": 800
            }
      },
  },
  {
    id: 'grabs-a-nearby-corpse-and-stores-it-for-later-use-unattended-corpses-will-rot-after-two-min-c98cf91d',
    name: 'Grabs a nearby corpse and stores it for later use. Unattended corpses will rot after two minutes. Current Capacity: 2 / 8',
    category: 'unknown',
    description: '',
    tooltip: 'Grabs a nearby corpse and stores it for later use. Unattended corpses will rot after two minutes.|n|cffFFD700Current Capacity: 2 / 8|r',
    iconPath: 'btncorpsegrab2.png',
    range: 128,
    areaOfEffect: 800,
    hotkey: 'C',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "range": 128,
                  "areaOfEffect": 800
            }
      },
  },
  {
    id: 'grabs-a-nearby-corpse-and-stores-it-for-later-use-unattended-corpses-will-rot-after-two-min-26621400',
    name: 'Grabs a nearby corpse and stores it for later use. Unattended corpses will rot after two minutes. Current Capacity: 3 / 8',
    category: 'unknown',
    description: '',
    tooltip: 'Grabs a nearby corpse and stores it for later use. Unattended corpses will rot after two minutes.|n|cffFFD700Current Capacity: 3 / 8|r',
    iconPath: 'btncorpsegrab3.png',
    range: 128,
    areaOfEffect: 800,
    hotkey: 'C',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "range": 128,
                  "areaOfEffect": 800
            }
      },
  },
  {
    id: 'grabs-a-nearby-corpse-and-stores-it-for-later-use-unattended-corpses-will-rot-after-two-min-d84c5bd4',
    name: 'Grabs a nearby corpse and stores it for later use. Unattended corpses will rot after two minutes. Current Capacity: 4 / 8',
    category: 'unknown',
    description: '',
    tooltip: 'Grabs a nearby corpse and stores it for later use. Unattended corpses will rot after two minutes.|n|cffFFD700Current Capacity: 4 / 8|r',
    iconPath: 'btncorpsegrab4.png',
    range: 128,
    areaOfEffect: 800,
    hotkey: 'C',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "range": 128,
                  "areaOfEffect": 800
            }
      },
  },
  {
    id: 'grabs-a-nearby-corpse-and-stores-it-for-later-use-unattended-corpses-will-rot-after-two-min-d86d7f9b',
    name: 'Grabs a nearby corpse and stores it for later use. Unattended corpses will rot after two minutes. Current Capacity: 5 / 8',
    category: 'unknown',
    description: '',
    tooltip: 'Grabs a nearby corpse and stores it for later use. Unattended corpses will rot after two minutes.|n|cffFFD700Current Capacity: 5 / 8|r',
    iconPath: 'btncorpsegrab5.png',
    range: 128,
    areaOfEffect: 800,
    hotkey: 'C',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "range": 128,
                  "areaOfEffect": 800
            }
      },
  },
  {
    id: 'grabs-a-nearby-corpse-and-stores-it-for-later-use-unattended-corpses-will-rot-after-two-min-1d713c17',
    name: 'Grabs a nearby corpse and stores it for later use. Unattended corpses will rot after two minutes. Current Capacity: 6 / 8',
    category: 'unknown',
    description: '',
    tooltip: 'Grabs a nearby corpse and stores it for later use. Unattended corpses will rot after two minutes.|n|cffFFD700Current Capacity: 6 / 8|r',
    iconPath: 'btncorpsegrab6.png',
    range: 128,
    areaOfEffect: 800,
    hotkey: 'C',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "range": 128,
                  "areaOfEffect": 800
            }
      },
  },
  {
    id: 'grabs-a-nearby-corpse-and-stores-it-for-later-use-unattended-corpses-will-rot-after-two-min-2dcb6cbb',
    name: 'Grabs a nearby corpse and stores it for later use. Unattended corpses will rot after two minutes. Current Capacity: 7 / 8',
    category: 'unknown',
    description: '',
    tooltip: 'Grabs a nearby corpse and stores it for later use. Unattended corpses will rot after two minutes.|n|cffFFD700Current Capacity: 7 / 8|r',
    iconPath: 'btncorpsegrab7.png',
    range: 128,
    areaOfEffect: 800,
    hotkey: 'C',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "range": 128,
                  "areaOfEffect": 800
            }
      },
  },
  {
    id: 'grabs-a-nearby-corpse-and-stores-it-for-later-use-unattended-corpses-will-rot-after-two-min-ec57b4f8',
    name: 'Grabs a nearby corpse and stores it for later use. Unattended corpses will rot after two minutes. Current Capacity: 8 / 8',
    category: 'unknown',
    description: '',
    tooltip: 'Grabs a nearby corpse and stores it for later use. Unattended corpses will rot after two minutes.|n|cffFFD700Current Capacity: 8 / 8|r',
    range: 128,
    areaOfEffect: 800,
    hotkey: 'C',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "range": 128,
                  "areaOfEffect": 800
            }
      },
  },
  {
    id: 'drop-corpse',
    name: 'Drop Corpse',
    category: 'unknown',
    description: '',
    tooltip: 'Drops a carried corpse onto the ground.|n|cffFFD700Current Capacity: 0 / 8|r',
    iconPath: 'btncorpsedrop1.png',
    hotkey: 'C',
    levels: {
            "1": {
                  "manaCost": 0
            }
      },
  },
  {
    id: 'panic',
    name: 'Panic',
    category: 'unknown',
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
  },
  {
    id: 'consume-corpse',
    name: 'Consume Corpse',
    category: 'unknown',
    description: '',
    tooltip: 'Consume a nearby corpse for 50 |cffd67a7ahealth|r.',
    duration: 2.5,
    hotkey: 'E',
    levels: {
            "1": {
                  "duration": 2.5
            }
      },
  },
  {
    id: 'thick-fur',
    name: 'Thick Fur',
    category: 'unknown',
    description: '',
    tooltip: 'Dire Bear\'s thick fur provides protection from cold, removing heat and health cost for sleeping outside.\nAt lvl |cFFFFCC004|r provides +|cff1FBF004|r armor',
    iconPath: 'btn_misc_pelt_bear_01.png',
  },
  {
    id: 'r-locate-elk-and-hostile-units',
    name: '[R] - Locate Elk and Hostile Units',
    category: 'unknown',
    description: '',
    tooltip: 'Ping |cff1FBF00Elk|r|cffC2E8EB and |cffFF0202Hostile Units|r surrounding your position. Has |cff7DBEF130|r seconds cooldown.',
    iconPath: 'btnspy.png',
    cooldown: 30,
    hotkey: 'R',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 30
            }
      },
  },
  {
    id: 'a-locate-elk-and-hostile-units',
    name: '[A] - Locate Elk and Hostile Units',
    category: 'unknown',
    description: '',
    tooltip: 'Ping |cff1FBF00Elk|r|cffC2E8EB and |cffFF0202Hostile Units|r surrounding your position. Has |cff7DBEF130|r seconds cooldown.',
    iconPath: 'btnspy.png',
    cooldown: 30,
    hotkey: 'A',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 30
            }
      },
  },
  {
    id: 'q-locate-elk',
    name: '[Q] - Locate Elk',
    category: 'unknown',
    description: '',
    tooltip: 'Ping |cff1FBF00Elk|r surrounding your position. Has |cff7DBEF130|r seconds cooldown.',
    iconPath: 'btnspy.png',
    cooldown: 30,
    hotkey: 'Q',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 30
            }
      },
  },
  {
    id: 'w-locate-hawk',
    name: '[W] - Locate Hawk',
    category: 'unknown',
    description: '',
    tooltip: 'Ping |cff1BE5B8Hawk|r surrounding your position. Has |cff7DBEF130|r seconds cooldown.',
    iconPath: 'btnspy.png',
    cooldown: 30,
    hotkey: 'W',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 30
            }
      },
  },
  {
    id: 'e-locate-hostile-animals',
    name: '[E] - Locate Hostile Animals',
    category: 'unknown',
    description: '',
    tooltip: 'Ping |cffFF0202Hostile Animals|r surrounding your position. Has |cff7DBEF130|r seconds cooldown.',
    iconPath: 'btnspy.png',
    cooldown: 30,
    hotkey: 'E',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 30
            }
      },
  },
  {
    id: 'r-locate-hostile-building',
    name: '[R] - Locate Hostile Building',
    category: 'unknown',
    description: '',
    tooltip: 'Ping |cffFE890DHostile Building|r surrounding your position. Has |cff7DBEF130|r seconds cooldown.',
    iconPath: 'btnspy.png',
    cooldown: 30,
    hotkey: 'R',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 30
            }
      },
  },
  {
    id: 'a-locate-trolls',
    name: '[A] - Locate Trolls',
    category: 'unknown',
    description: '',
    tooltip: 'Ping |cffFF0202Trolls|r surrounding your position. Has |cff7DBEF130|r seconds cooldown.',
    iconPath: 'btnspy.png',
    cooldown: 30,
    hotkey: 'A',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 30
            }
      },
  },
  {
    id: 's-locate-living-clay',
    name: '[S] - Locate Living Clay',
    category: 'unknown',
    description: '',
    tooltip: 'Ping |cffE45AAFLiving Clay|r surrounding your position. Has |cff7DBEF130|r seconds cooldown.',
    iconPath: 'btnspy.png',
    cooldown: 30,
    hotkey: 'S',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 30
            }
      },
  },
  {
    id: 'way-of-the-tracker',
    name: 'Way of the Tracker',
    category: 'unknown',
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
    id: 'way-of-the-hawk',
    name: 'Way of the Hawk',
    category: 'unknown',
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
    category: 'unknown',
    description: '',
    tooltip: 'The Warrior Skills, contains description of the warrior abilities.',
    iconPath: 'btntrollpredator.png',
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
    id: 'offensive-spells',
    name: 'Offensive Spells',
    category: 'unknown',
    description: '',
    tooltip: 'The Mage Spells, contains various offensive spells.',
    iconPath: 'btnnecromanceradept.png',
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
  },
  {
    id: 'elementalist-spells',
    name: 'Elementalist Spells',
    category: 'unknown',
    description: '',
    tooltip: 'The Elementalist Masteries, contains various damage dealing spells.',
    iconPath: 'btnmanual.png',
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
    id: 'hypnotist-spells',
    name: 'Hypnotist Spells',
    category: 'unknown',
    description: '',
    tooltip: 'The Hypnotist Voodoo magic, contains various crowd control and energy zapping spells.',
    iconPath: 'btnbookofthedead.png',
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
    id: 'dreamwalker-abilities',
    name: 'Dreamwalker Abilities',
    category: 'unknown',
    description: '',
    tooltip: 'Dreamwalker Abilities.',
    iconPath: 'btnbookofthedead.png',
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
    id: 'dementia-spells',
    name: 'Dementia Spells',
    category: 'unknown',
    description: '',
    tooltip: 'The Dementia Master Black Magic, contains odd damage dealing spells.',
    iconPath: 'btnnecromancermaster.png',
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
    id: 'defensive-spells',
    name: 'Defensive Spells',
    category: 'unknown',
    description: '',
    tooltip: 'The Priest Spells, contains various defensive spells.',
    iconPath: 'btnmanual.png',
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
  },
  {
    id: 'booster-spells',
    name: 'Booster Spells',
    category: 'unknown',
    description: '',
    tooltip: 'The Booster Spells, contains various buffing spells.',
    iconPath: 'btnsorceressmaster.png',
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
            },
            "4": {
                  "cooldown": 0
            }
      },
  },
  {
    id: 'master-healer-spells',
    name: 'Master Healer Spells',
    category: 'unknown',
    description: '',
    tooltip: 'The Master Healer Healing Prowess, contains various healing spells.',
    iconPath: 'btnsorceressmaster.png',
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
    id: 'sage-spells',
    name: 'Sage Spells',
    category: 'unknown',
    description: '',
    tooltip: 'The Sage Shamanic Art, contains the most powerfull buff a troll can cast .',
    iconPath: 'btnsorceressmaster.png',
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
    id: 'shapeshifter-forms',
    name: 'Shapeshifter Forms',
    category: 'unknown',
    description: '',
    tooltip: 'Shapeshift into an animal form. Unlock following transformation :\n|cffFFD700Level 1 - Wolf\nLevel 2 - Bear\nLevel 3 - Panther\nLevel 4 - Tiger|r',
    iconPath: 'btnbearform.png',
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
            },
            "4": {
                  "cooldown": 0
            }
      },
  },
  {
    id: 'direwolf-abilities',
    name: 'Direwolf Abilities',
    category: 'unknown',
    description: '',
    tooltip: 'Dire Wolf Abilities.',
    iconPath: 'btndirewolf.png',
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
            },
            "4": {
                  "cooldown": 0
            }
      },
  },
  {
    id: 'dire-bear-abilities',
    name: 'Dire Bear Abilities',
    category: 'unknown',
    description: '',
    tooltip: 'Dire Bear Abilities.',
    iconPath: 'btnbearform.png',
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
            },
            "4": {
                  "cooldown": 0
            }
      },
  },
  {
    id: 'rendo-s-evolution',
    name: 'Rendo\'s Evolution',
    category: 'unknown',
    description: '',
    tooltip: 'Jungle Tyrant evolutions, contains following abilities :|cffFFD700\nLevel 1 - Hawk Eye, Snake Toxin\nLevel 2 - Panther Instinct, Elk Jump\nLevel 4 - Wolf Bite|r',
    iconPath: 'btnforceofnature.png',
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
    id: 'thieve-s-skills',
    name: 'Thieve\'s skills',
    category: 'unknown',
    description: '',
    tooltip: 'Thief\'s skills',
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
            },
            "4": {
                  "cooldown": 0
            }
      },
  },
  {
    id: 'rogue-abilities',
    name: 'Rogue abilities',
    category: 'unknown',
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
    category: 'unknown',
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
    id: 'physical-evasion-spells',
    name: 'Physical Evasion Spells',
    category: 'unknown',
    description: '',
    tooltip: 'The Escape Artist Physical Abilities, contains another set of evasion spells.',
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
    id: 'magical-evasion-spells',
    name: 'Magical Evasion Spells',
    category: 'unknown',
    description: '',
    tooltip: 'The Contortionist Magical Abilities, contais another set of evasion spells.',
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
    category: 'unknown',
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
    id: 'trap-toolkit',
    name: 'Trap Toolkit',
    category: 'unknown',
    description: '',
    tooltip: 'The Trapper Toolkit, contains a few trap spell.',
    iconPath: 'btnpackbeast.png',
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
  },
  {
    id: 'oberserver-spells',
    name: 'Oberserver Spells',
    category: 'unknown',
    description: '',
    tooltip: 'The Observer spells, contains various spells to observe those around him.',
    iconPath: 'btntome.png',
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
  },
  {
    id: 'greater-hawk-abilities',
    name: 'Greater Hawk abilities',
    category: 'unknown',
    description: '',
    tooltip: 'The Scout Falconry knowledge.',
    iconPath: 'btntome.png',
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
    id: 'item-radar',
    name: 'Item Radar',
    category: 'unknown',
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
  },
  {
    id: 'druidic-spells',
    name: 'Druidic Spells',
    category: 'unknown',
    description: '',
    tooltip: 'Spells that connect the Druid and his team with the ebb and flow of life.',
    iconPath: 'btnentrapmentward.png',
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
    id: 'philosopher-s-stone-conjuration-powers',
    name: 'Philosopher\'s Stone conjuration powers',
    category: 'unknown',
    description: '',
    tooltip: 'Alchemist can use energy of The Philosopher\'s Stone to conjure spell effects of potions',
    iconPath: 'btntemp.png',
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
            },
            "4": {
                  "cooldown": 0
            }
      },
  },
  {
    id: 'juggernaut-inherited-spells',
    name: 'Juggernaut Inherited Spells',
    category: 'unknown',
    description: '',
    tooltip: 'The Juggernaut Skill set, can use spells from tracker & warrior too.',
    iconPath: 'btntrollpredator.png',
    hotkey: 'E',
    levels: {
            "1": {
                  "cooldown": 0
            }
      },
  },
  {
    id: 'mage-inherited-spells',
    name: 'Mage Inherited Spells',
    category: 'unknown',
    description: '',
    tooltip: 'Inherited Spells from the Mage.',
    iconPath: 'btnnecromanceradept.png',
    hotkey: 'R',
    levels: {
            "1": {
                  "cooldown": 0
            }
      },
  },
  {
    id: 'dementia-inherited-spells',
    name: 'Dementia Inherited Spells',
    category: 'unknown',
    description: '',
    tooltip: 'A bunch of assorted mage spells.',
    iconPath: 'btnnecromanceradept.png',
    hotkey: 'R',
    levels: {
            "1": {
                  "cooldown": 0
            }
      },
  },
  {
    id: 'sage-inherited-spells',
    name: 'Sage Inherited Spells',
    category: 'unknown',
    description: '',
    tooltip: 'A bunch of assorted booster & master healer spells.',
    iconPath: 'btnmanual.png',
    hotkey: 'R',
    levels: {
            "1": {
                  "cooldown": 0
            }
      },
  },
  {
    id: 'pet-spells',
    name: 'Pet Spells',
    category: 'unknown',
    description: '',
    tooltip: 'Use these to control your pet.',
    iconPath: 'btnbeastcall.png',
    hotkey: 'R',
    levels: {
            "1": {
                  "cooldown": 0
            }
      },
  },
  {
    id: 'spy-inherited-spells',
    name: 'Spy Inherited Spells',
    category: 'unknown',
    description: '',
    tooltip: 'All the scouting skills you\'ll ever need.',
    iconPath: 'btntome.png',
    hotkey: 'T',
    levels: {
            "1": {
                  "cooldown": 0
            }
      },
  },
  {
    id: 'hawk-inherited-spells',
    name: 'Hawk Inherited Spells',
    category: 'unknown',
    description: '',
    tooltip: 'The Scout Falconry knowledge.',
    iconPath: 'btntome.png',
    hotkey: 'E',
    levels: {
            "1": {
                  "cooldown": 0
            }
      },
  },
  {
    id: 'advanced-item-radar',
    name: 'Advanced Item Radar',
    category: 'unknown',
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
    category: 'unknown',
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
    id: 'track',
    name: 'Track',
    category: 'unknown',
    description: '',
    tooltip: 'Gives vision of the tracked unit and reduces armor by |cffFF02021|r Lasts |cff7DBEF115|r seconds, has |cff7DBEF145|r seconds cooldown.',
    iconPath: 'atctrack.png',
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
  },
  {
    id: 'devour',
    name: 'Devour',
    category: 'unknown',
    description: '',
    tooltip: 'Completely devour an elk, restoring 3 raw meat.\nDire wolf swallows up and digests every part of the animal, therefore, no hides , bones nor corpses are dropped upon the animal death.\nDevouring a hostile animal will unlock a corresponding passive, you can freely switch between them but only one can be active at a time.\nHas |cff7DBEF160.0|r seconds cooldown.',
    iconPath: 'btnlycanwolfbite.png',
    cooldown: 60,
    range: 128,
    hotkey: 'R',
    targetsAllowed: 'enemies,nonhero,organic,nonancient',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 25,
                  "range": 128
            }
      },
  },
  {
    id: 'thrill-of-the-hunt',
    name: 'Thrill of the Hunt',
    category: 'unknown',
    description: '',
  },
  {
    id: 'gives-a-10-chance-to-avoind-an-attack',
    name: 'Gives a 10% chance to avoind an attack.',
    category: 'unknown',
    description: '',
    tooltip: 'Gives a |cff7DBEF110%|r chance to avoind an attack.',
    iconPath: 'btnwindserpentpassive.png',
    hotkey: 'A',
  },
  {
    id: 'increases-maximum-ravenous-beast-charges-by-cffffcc003',
    name: 'Increases maximum Ravenous Beast charges by |cFFFFCC003.',
    category: 'unknown',
    description: '',
    tooltip: 'Increases maximum Ravenous Beast charges by |cFFFFCC003|r.',
    iconPath: 'btntimberwolfpassive.png',
    hotkey: 'S',
  },
  {
    id: 'increases-armour-by-2-and-removes-heat-and-health-cost-for-sleeping-outside',
    name: 'Increases armour by 2 and removes heat and health cost for sleeping outside.',
    category: 'unknown',
    description: '',
    tooltip: 'Increases armour by |cffFE890D2|r and removes heat and health cost for sleeping outside.',
    iconPath: 'btnfrostbearpassive.png',
    hotkey: 'D',
  },
  {
    id: 'increases-your-movement-speed-by-50-for-1-second-after-attacking-an-enemy',
    name: 'Increases your movement speed by 50 for 1 second after attacking an enemy.',
    category: 'unknown',
    description: '',
    tooltip: 'Increases your movement speed by |cffFE890D50|r for |cff7DBEF11|r second after attacking an enemy.',
    iconPath: 'btnpantherpassive.png',
    hotkey: 'F',
  },
  {
    id: 'snake-reflexes',
    name: 'Snake Reflexes',
    category: 'unknown',
    description: '',
    tooltip: 'Gives a |cff7DBEF110%|r chance to avoind an attack.',
    iconPath: 'btnwindserpentpassive.png',
  },
  {
    id: 'wolf-voracity',
    name: 'Wolf Voracity',
    category: 'unknown',
    description: '',
  },
  {
    id: 'hit-points-regeneration-3per-second',
    name: 'Hit Points Regeneration 3per second',
    category: 'unknown',
    description: '',
  },
  {
    id: 'battle-armor-spell-damage-reduction',
    name: 'Battle Armor Spell Damage Reduction',
    category: 'unknown',
    description: '',
  },
  {
    id: 'stats-bonus-battle-armor',
    name: 'Stats Bonus (Battle Armor)',
    category: 'unknown',
    description: '',
  },
  {
    id: 'ami-aicd',
    name: 'AMi}:AIcd',
    category: 'unknown',
    description: '',
    areaOfEffect: 300,
    targetsAllowed: 'enemies,ground,organic,vulnerable',
    levels: {
            "1": {
                  "areaOfEffect": 300
            }
      },
  },
  {
    id: 'ravenous-beast',
    name: 'Ravenous Beast',
    category: 'unknown',
    description: '',
    tooltip: 'Dire Wolf hungers for the blood of others.\nYou gain a charge of Voracity every |cff6495ED10.0|r seconds, up to a maximum of |cFFFFCC005|r.\nYou can spend a charge of Voracity to consume raw meat, recovering |cff1FBF0050.0|r health.',
    iconPath: 'btncannibalize.png',
  },
  {
    id: 'stash-meat',
    name: 'Stash Meat.',
    category: 'unknown',
    description: '',
    tooltip: 'Create a stash of |cFFFFCC008|r raw meat which can be retrieved later.\nHas |cff7DBEF1120.0|r seconds cooldown.',
    iconPath: 'btnfeedpet.png',
    manaCost: 60,
    cooldown: 120,
    range: 150,
    hotkey: 'E',
    levels: {
            "1": {
                  "manaCost": 60,
                  "cooldown": 120,
                  "range": 150
            }
      },
  },
  {
    id: 'howl-of-terror',
    name: 'Howl of Terror',
    category: 'unknown',
    description: '',
    tooltip: 'Dire Wolf unleashes a Howl of Terror, which causes an eclipse that blocks out the sun and creates an artificial night. \nLasts |cff7DBEF130|r seconds\nGrants Night Stalker to your allies for the duration.\nHas |cff7DBEF160.0|r seconds cooldown.',
    iconPath: 'btnlonewolf.png',
    cooldown: 60,
    range: 128,
    hotkey: 'W',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 60,
                  "range": 128
            }
      },
  },
  {
    id: 'night-stalker',
    name: 'Night Stalker.',
    category: 'unknown',
    description: '',
    tooltip: 'Dire Wolf is as effective at stalking prey at night as during the day.\nYour night vision is equal to your day vision.',
    iconPath: 'pasunitwolf.png',
  },
  {
    id: 'hidden-spellbook',
    name: 'Hidden Spellbook',
    category: 'unknown',
    description: '',
    tooltip: 'You are not supposed to be seeing this',
    levels: {
            "1": {
                  "cooldown": 0
            }
      },
  },
  {
    id: 'bark-skin',
    name: 'Bark Skin',
    category: 'unknown',
    description: '',
    tooltip: 'Imbue your target with the strength of nature, making its skin tough as bark, gives |cff1FBF004|r armor and reflect |cffFF020230%|r flat damage upon melee attack to its attacker. Lasts |cff7DBEF110|r seconds, has |cff7DBEF145|r seconds cooldown.',
    iconPath: 'btnthornshield.png',
    cooldown: 45,
    range: 200,
    duration: 10,
    hotkey: 'R',
    levels: {
            "1": {
                  "cooldown": 45,
                  "duration": 10,
                  "range": 200
            }
      },
  },
  {
    id: 'nature-s-bond',
    name: 'Nature\'s Bond',
    category: 'unknown',
    description: '',
    tooltip: 'The strong bond between the Druid and his pet causes them to split all damage between themselves. They also share |cff1FBF0050%|r of any healing with eachother. Lasts |cff7DBEF115|r seconds, has |cff7DBEF160|r seconds cooldown.',
    manaCost: 20,
    cooldown: 60,
    range: 99999,
    duration: 15,
    areaOfEffect: 99999,
    hotkey: 'D',
    targetsAllowed: 'playerunits,organic,air,ground',
    levels: {
            "1": {
                  "manaCost": 20,
                  "cooldown": 60,
                  "duration": 15,
                  "range": 99999,
                  "areaOfEffect": 99999
            }
      },
  },
  {
    id: 'rejuvenation',
    name: 'Rejuvenation',
    category: 'unknown',
    description: '',
    tooltip: 'Heal target ally for |cff1FBF00150|r over |cff7DBEF110|r seconds. Has |cff7DBEF130|r seconds cooldown.',
    manaCost: 30,
    cooldown: 30,
    range: 150,
    duration: 10,
    hotkey: 'E',
    levels: {
            "1": {
                  "manaCost": 30,
                  "cooldown": 30,
                  "duration": 10,
                  "range": 150
            }
      },
  },
  {
    id: 'sentinel',
    name: 'Sentinel',
    category: 'unknown',
    description: '',
    tooltip: 'Send out a Sentinel Owl to watch from a nearby tree for |cff7DBEF1300|rseconds. The Owl will disappear if the tree is attacked. Has |cff7DBEF160|r seconds cooldown.',
    iconPath: 'btnsentinel.png',
    manaCost: 15,
    cooldown: 60,
    range: 150,
    hotkey: 'Q',
    levels: {
            "0": {
                  "manaCost": 15
            },
            "1": {
                  "cooldown": 60,
                  "range": 150
            }
      },
  },
  {
    id: 'the-druid-takes-great-care-of-the-spirit-of-those-around-him-granting-allies-0-33-health-re-18e8d89f',
    name: 'The Druid takes great care of the spirit of those around him, granting allies 0.33 health regeneration.',
    category: 'unknown',
    description: '',
    tooltip: 'The Druid takes great care of the spirit of those around him, granting allies |cffD67A7A0.33|r health regeneration.\n\nAdditionally pets affected by |cffC2E8EBSpiritual Guidance|r are able to transcend into their spirit form, gaining |cffD67A7A2|r points for every stats (armor & attack damage).',
    iconPath: 'pasbtnspiritualguidance.png',
    areaOfEffect: 800,
    levels: {
            "1": {
                  "areaOfEffect": 800
            }
      },
  },
  {
    id: 'the-druid-and-his-pet-unleash-a-mighty-roar-inspiring-allies-and-striking-fear-into-the-hea-544dbdb6',
    name: 'The Druid and his pet unleash a mighty roar, inspiring allies and striking fear into the hearts of enemies. Has 45 seconds cooldown.',
    category: 'unknown',
    description: '',
    tooltip: 'The Druid and his pet unleash a mighty roar, inspiring allies and striking fear into the hearts of enemies. Has |cff7DBEF145|r seconds cooldown.|cffFF6347\n\nDruid\n|rIncreases nearby allies\' damage by |cffFF020230%|r.|cffFF6347\n\nElk\n|rIncreases nearby allies movement speed by |cffFE890D50|r.|cffFF6347\n\nWolf\n|rDecreases nearby enemies\' movement speed by |cffFE890D10%|r and attack speed by |cffFFFC0020%|r.|cffFF6347\n\nBear\n|rDecreases nearby enemies\' damage by |cffFF020230%|r.',
    iconPath: 'btnverdantsong.png',
    manaCost: 20,
    cooldown: 45,
    duration: 7,
    hotkey: 'W',
    targetsAllowed: 'air,ground,friend,self,vulnerable,invulnerable,nonsapper',
    levels: {
            "1": {
                  "manaCost": 20,
                  "cooldown": 45,
                  "duration": 7
            }
      },
  },
  {
    id: 'animal-training',
    name: 'Animal Training',
    category: 'unknown',
    description: '',
    tooltip: 'Beastmaster\'s pet has undergone training increasing it\'s movement speed to match hero\'s and reducing its collision size.',
    iconPath: 'btnanimaltraining.png',
  },
  {
    id: 'eat-a-raw-corpse-to-gain-1-energy-energy-can-be-used-to-grow-your-pet-or-increase-its-stats',
    name: 'Eat a raw corpse to gain 1 energy. energy can be used to grow your pet, or increase its stats.',
    category: 'unknown',
    description: '',
    tooltip: 'Eat a raw corpse to gain |cff6495ED1|r energy. energy can be used to grow your pet, or increase its stats. \nYou can upgrade any stat a total of |cffFFD7003|r times every time your troll levels up.',
    iconPath: 'atccannibalize.png',
    range: 128,
    areaOfEffect: 800,
    hotkey: 'D',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "range": 128,
                  "areaOfEffect": 800
            }
      },
  },
  {
    id: 'increase-damage',
    name: 'Increase Damage',
    category: 'unknown',
    description: '',
    tooltip: 'Increase your pet\'s damage by |cffFF02021|r.',
    iconPath: 'btnstrengthofthewild.png',
    manaCost: 2,
    range: 99999,
    hotkey: 'Z',
    levels: {
            "1": {
                  "manaCost": 2,
                  "cooldown": 0,
                  "range": 99999
            }
      },
  },
  {
    id: 'increase-armor',
    name: 'Increase Armor',
    category: 'unknown',
    description: '',
    tooltip: 'Increase your pet\'s armor by |cff1FBF001|r.',
    iconPath: 'btnreinforcedhides.png',
    manaCost: 2,
    range: 99999,
    hotkey: 'X',
    levels: {
            "1": {
                  "manaCost": 2,
                  "cooldown": 0,
                  "range": 99999
            }
      },
  },
  {
    id: 'increase-your-pet-s-magical-resistance-by-10',
    name: 'Increase your pet\'s magical resistance by 10%.',
    category: 'unknown',
    description: '',
    tooltip: 'Increase your pet\'s magical resistance by |cff00EAFF10%|r.',
    iconPath: 'btnthickfur.png',
    manaCost: 2,
    range: 99999,
    hotkey: 'C',
    levels: {
            "1": {
                  "manaCost": 2,
                  "cooldown": 0,
                  "range": 99999
            }
      },
  },
  {
    id: 'toggle-pet-control',
    name: 'Toggle Pet Control',
    category: 'unknown',
    description: '',
    tooltip: 'Toggle between |cffFFFC00Manual|r and |cffFE890DAutomatic|r pet controls.\n\n|cffFFFC00Manual|r : Manual mode uses regular unit controls.\n\n|cffFE890DAutomatic|r : In automatic mode the pet will copy actions taken by the owner.',
    iconPath: 'btnselectunit.png',
    range: 99999,
    hotkey: 'R',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "range": 99999
            }
      },
  },
  {
    id: 'the-pet-will-revive-next-to-its-master-90-seconds-after-it-dies',
    name: 'The pet will revive next to its master 90 seconds after it dies.',
    category: 'unknown',
    description: '',
    tooltip: 'The pet will revive next to its master |cffFFD70090|r seconds after it dies.',
    iconPath: 'pasbtnreincarnation.png',
  },
  {
    id: 'bear-s-bulwark',
    name: 'Bear\'s Bulwark',
    category: 'unknown',
    description: '',
    tooltip: 'Gives friendly nearby units |cff1FBF004|r armor. Lasts |cff7DBEF110|r seconds, has |cff7DBEF145|r seconds cooldown.',
    manaCost: 20,
    cooldown: 45,
    duration: 10,
    areaOfEffect: 600,
    hotkey: 'E',
    levels: {
            "1": {
                  "manaCost": 20,
                  "cooldown": 45,
                  "duration": 10,
                  "areaOfEffect": 600
            }
      },
  },
  {
    id: 'prowl',
    name: 'Prowl',
    category: 'unknown',
    description: '',
    tooltip: 'The panther become invisible for |cff7DBEF120|r seconds but has its movement speed reduced by |cffFE890D50%|r while being invisible. Has a |cff7DBEF12|r second fade time. Has |cff7DBEF160|r seconds cooldown.',
    iconPath: 'btnpantherprowl.png',
    manaCost: 20,
    cooldown: 60,
    duration: 20,
    hotkey: 'E',
    levels: {
            "1": {
                  "manaCost": 20,
                  "cooldown": 60,
                  "duration": 20
            }
      },
  },
  {
    id: 'vicious-strike-attack-trigger',
    name: 'Vicious Strike Attack trigger',
    category: 'unknown',
    description: '',
    iconPath: 'pasbtnviciousstrike.png',
    targetsAllowed: 'air,enemies,ground,ward',
  },
  {
    id: 'vicious-strikes-true-spell',
    name: 'Vicious Strikes True spell',
    category: 'unknown',
    description: '',
    tooltip: 'Apply a on-hit effect which reduce the target movement speed by |cffFE890D35%|r and attack speed by |cffFE890D10%|r for |cff7DBEF16|r seconds Has |cff7DBEF115|r seconds cooldown.',
    iconPath: 'pasbtnviciousstrike.png',
    cooldown: 15,
    range: 99999,
    duration: 9,
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 15,
                  "duration": 9,
                  "range": 99999
            }
      },
  },
  {
    id: 'wolf-s-hunger',
    name: 'Wolf\'s Hunger',
    category: 'unknown',
    description: '',
    tooltip: 'The Wolf\'s hunger allows him to lifesteal for |cffFF020275%|r of his damage dealt for |cff7DBEF15|r seconds. Has |cff7DBEF130|r seconds cooldown.',
    iconPath: 'btnvampiricaura.png',
    manaCost: 20,
    cooldown: 30,
    duration: 5,
    hotkey: 'E',
    levels: {
            "1": {
                  "manaCost": 20,
                  "cooldown": 30,
                  "duration": 5
            }
      },
  },
  {
    id: 'spirit-of-the-beast',
    name: 'Spirit of the Beast',
    category: 'unknown',
    description: '',
    tooltip: 'Animals are more at ease around the Beastmaster and move slowly. This makes them easier to hunt.',
    iconPath: 'btnenchantedbears.png',
    areaOfEffect: 400,
    targetsAllowed: 'enemies,ground,nonhero,organic,vulnerable',
    levels: {
            "1": {
                  "areaOfEffect": 400
            }
      },
  },
  {
    id: 'elk-jump',
    name: 'Elk Jump',
    category: 'unknown',
    description: '',
    tooltip: 'Rendo uses the Elk potent calves to jump a short distance. Has |cff7DBEF160|r seconds cooldown.',
    iconPath: 'btnnagaunburrow.png',
    manaCost: 20,
    cooldown: 60,
    range: 99999,
    hotkey: 'R',
    levels: {
            "1": {
                  "manaCost": 20,
                  "cooldown": 60,
                  "range": 99999
            }
      },
  },
  {
    id: 'true-sight',
    name: 'True Sight',
    category: 'unknown',
    description: '',
    duration: 20,
    areaOfEffect: 0,
    targetsAllowed: 'self',
    levels: {
            "1": {
                  "duration": 20,
                  "areaOfEffect": 0
            }
      },
    visualEffects: {
            "attachmentPoints": [
                  "overhead"
            ],
            "attachmentTarget": "Abilities\\Spells\\Human\\MagicSentry\\MagicSentryCaster.mdx"
      },
  },
  {
    id: 'oracle-clarity',
    name: 'Oracle clarity',
    category: 'unknown',
    description: '',
    tooltip: 'Reveal invisible unit',
    range: 900,
    duration: 20,
    castTime: 'Abilities\\Spells\\Human\\MagicSentry\\MagicSentryCaster.mdx',
    levels: {
            "1": {
                  "duration": 20,
                  "range": 900
            }
      },
  },
  {
    id: 'hawk-eye',
    name: 'Hawk Eye',
    category: 'unknown',
    description: '',
    tooltip: 'Rendo uses the Hawk piercing eye to spot invisible unit around him. Lasts |cff7DBEF125|r seconds, has |cff7DBEF160|r seconds cooldown.',
    iconPath: 'btnscout.png',
    manaCost: 10,
    cooldown: 60,
    hotkey: 'Q',
    levels: {
            "1": {
                  "manaCost": 10,
                  "cooldown": 60
            }
      },
  },
  {
    id: 'panther-instinct-dummy-cast',
    name: 'Panther Instinct Dummy Cast',
    category: 'unknown',
    description: '',
    iconPath: 'btnevasion.png',
    range: 99999,
    duration: 4,
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 4,
                  "range": 99999
            }
      },
  },
  {
    id: 'panther-instinct',
    name: 'Panther Instinct',
    category: 'unknown',
    description: '',
    tooltip: 'Rendo uses the Panther inner instinct to predict incoming attack and dodge their damage. Lasts |cff7DBEF14|r seconds, has |cff7DBEF160|r seconds cooldown.',
    iconPath: 'btnevasion.png',
    manaCost: 20,
    cooldown: 1,
    levels: {
            "1": {
                  "manaCost": 20,
                  "cooldown": 1
            }
      },
  },
  {
    id: 'snake-toxin-true-cast',
    name: 'Snake Toxin True Cast',
    category: 'unknown',
    description: '',
    range: 99999,
    duration: 15,
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 15,
                  "range": 99999
            }
      },
  },
  {
    id: 'snake-toxin',
    name: 'Snake Toxin',
    category: 'unknown',
    description: '',
    tooltip: 'Rendo uses the Snake poisonous glands to soak his claws with poison toxin. Target affected by the poison got their attack speed reduced by |cffFE890D30%|r and movement speed reduced by |cffFE890D20%|r, the poison last |cff7DBEF15|r seconds. Lasts |cff7DBEF115|r seconds, has |cff7DBEF160|r seconds cooldown.',
    iconPath: 'btnslowpoison.png',
    manaCost: 10,
    cooldown: 1,
    hotkey: 'W',
    levels: {
            "1": {
                  "manaCost": 10,
                  "cooldown": 1
            }
      },
  },
  {
    id: 'wolf-bite',
    name: 'Wolf Bite',
    category: 'unknown',
    description: '',
    tooltip: 'Rendo uses the Wolf inner instinct to target a vital spot of the enemy and bite it off, causing it to bleed profusely. The more ground covered, the more damage taken. The target leaves traces of blood on the ground when moving. Lasts |cff7DBEF115|r seconds, has |cff7DBEF160|r seconds cooldown.',
    iconPath: 'btnreddragondevour.png',
    manaCost: 20,
    cooldown: 60,
    range: 128,
    duration: 15,
    hotkey: 'A',
    targetsAllowed: 'hero,enemies',
    levels: {
            "1": {
                  "manaCost": 20,
                  "cooldown": 60,
                  "duration": 15,
                  "range": 128
            }
      },
  },
  {
    id: 'breath-of-hydra',
    name: 'Breath of Hydra',
    category: 'unknown',
    description: '',
    iconPath: 'btncorrosivebreath.png',
    range: 800,
    duration: 10,
    targetsAllowed: 'terrain',
    levels: {
            "1": {
                  "duration": 10,
                  "range": 800
            }
      },
  },
  {
    id: 'binds-an-enemy-target-for-2-50-8-seconds-on-heroes-normal-units',
    name: 'Binds an enemy target for 2.50/8 seconds on heroes/normal units.',
    category: 'unknown',
    description: '',
    tooltip: 'Binds an enemy target for 2.50/8 seconds on heroes/normal units.',
    iconPath: 'btnensnare.png',
    cooldown: 10,
    range: 700,
    duration: 8,
    targetsAllowed: 'air,enemies,ground,neutral,nonancient,organic',
    levels: {
            "1": {
                  "cooldown": 10,
                  "duration": 8,
                  "range": 700
            }
      },
  },
  {
    id: 'boss-spell-resistance',
    name: 'Boss Spell Resistance',
    category: 'unknown',
    description: '',
  },
  {
    id: 'quick-drop-items',
    name: 'Quick Drop Items',
    category: 'unknown',
    description: '',
    tooltip: 'Drops all the items in this unit on the ground.',
    iconPath: 'btnundeadload.png',
    cooldown: 0.5,
    hotkey: 'V',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0.5
            }
      },
  },
  {
    id: 'firebomb-effect',
    name: 'FireBomb Effect',
    category: 'unknown',
    description: '',
    range: 10000,
    duration: 5.5,
    areaOfEffect: 170,
    targetsAllowed: 'enemies,friend,neutral,self,structure,tree',
    levels: {
            "1": {
                  "manaCost": 0,
                  "duration": 5.5,
                  "range": 10000,
                  "areaOfEffect": 170
            }
      },
  },
  {
    id: 'fire-bomb-cast',
    name: 'Fire Bomb Cast',
    category: 'unknown',
    description: '',
    cooldown: 15,
    range: 700,
    areaOfEffect: 150,
    targetsAllowed: 'terrain',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 15,
                  "duration": 0,
                  "range": 700,
                  "areaOfEffect": 150
            }
      },
  },
  {
    id: 'create-philosophers-s-stone',
    name: 'Create Philosophers\'s stone',
    category: 'unknown',
    description: '',
    tooltip: 'Create Philosophers stone\n\nPhilosopher\'s stone converts Alchemist\'s mana into energy over time. It can be used to conjure Potion effects|cff7DBEF1\nCosts 2 mana per 1 energy|r\nMaximum energy = |cff7DBEF110|r +|cff00EAFF0.8|r|cff00EAFFIntelligence|r\nConverts |cff7DBEF10.2|r  + |cff7DBEF10.2|r per |cff00EAFF20 Intelligence |renergy per second.',
    iconPath: 'btnheartofsearinox.png',
    cooldown: 1,
    hotkey: 'E',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 1
            }
      },
  },
  {
    id: 'anabolic-potion',
    name: 'Anabolic Potion',
    category: 'unknown',
    description: '',
    tooltip: 'Boost the consumer movement speed to the max. Lasts |cff7DBEF110|r seconds, has |cff7DBEF135|r seconds cooldown.\nCosts |cFFFFCC0012|r energy.',
    iconPath: 'btnpotionred.png',
    hotkey: 'A',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0
            }
      },
  },
  {
    id: 'omnicure',
    name: 'OmniCure',
    category: 'unknown',
    description: '',
    tooltip: 'An upgrade of Cure All that affects all allies as well as the caster. Can cure jealousy, track, disease, snake poison, and many others. Can not be used on enemies. Has |cff7DBEF150|r seconds cooldown.',
    iconPath: 'btnbigbadvoodoospell.png',
    manaCost: 10,
    cooldown: 50,
    hotkey: 'E',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 50
            }
      },
  },
  {
    id: 'radar-spells',
    name: 'Radar Spells',
    category: 'unknown',
    description: '',
    tooltip: 'Contains various item radar abilities for more efficient gathering.',
    iconPath: 'btnspy.png',
    cooldown: 50,
    hotkey: 'R',
    levels: {
            "1": {
                  "cooldown": 50
            },
            "2": {
                  "cooldown": 50
            },
            "3": {
                  "cooldown": 50
            }
      },
  },
  {
    id: 'tele-gather-person-buff',
    name: 'Tele-Gather person buff',
    category: 'unknown',
    description: '',
    duration: 130,
    targetsAllowed: 'air,friend,ground,neutral,organic',
    levels: {
            "1": {
                  "manaCost": 0,
                  "duration": 130
            }
      },
  },
  {
    id: 'tele-gathering',
    name: 'Tele-Gathering',
    category: 'unknown',
    description: '',
    tooltip: 'The Tele-Gatherer magically links up with the targeted campfire as its outlet and starts Tele-gathering. While Tele-Gathering, up to |cff7DBEF115|r items picked up are warped directly to the outlet. Lasts |cff7DBEF150|r seconds, has |cff7DBEF1120|r seconds cooldown.',
    iconPath: 'btnspellsteal.png',
    manaCost: 20,
    cooldown: 120,
    range: 100,
    duration: 50,
    hotkey: 'E',
    targetsAllowed: 'sapper,friend',
    levels: {
            "1": {
                  "manaCost": 30,
                  "duration": 110,
                  "range": 100
            },
            "2": {
                  "manaCost": 25,
                  "cooldown": 120,
                  "duration": 70
            },
            "3": {
                  "manaCost": 30,
                  "cooldown": 120,
                  "duration": 90
            }
      },
  },
  {
    id: 'tele-thief',
    name: 'Tele-Thief',
    category: 'unknown',
    description: '',
    tooltip: 'The thief uses a powerful magic designating the targeted fire as its tele-thiefing outlet. While tele-thiefing, any item picked up near enemy buildings warps to the tele-thiefing outlet. Lasts |cff7DBEF1100|r seconds, has |cff7DBEF1140|r seconds cooldown.',
    iconPath: 'btnspellsteal.png',
    manaCost: 30,
    cooldown: 140,
    range: 100,
    duration: 100,
    hotkey: 'W',
    targetsAllowed: 'sapper,friend',
    levels: {
            "1": {
                  "manaCost": 30,
                  "cooldown": 140,
                  "duration": 100,
                  "range": 100
            }
      },
  },
  {
    id: 'tele-thief-person-buff',
    name: 'Tele-Thief person buff',
    category: 'unknown',
    description: '',
    duration: 100,
    targetsAllowed: 'air,friend,ground,neutral,organic',
    levels: {
            "1": {
                  "manaCost": 0,
                  "duration": 100
            }
      },
  },
  {
    id: 'unsafe-heat-camp-fire',
    name: 'Unsafe Heat Camp Fire',
    category: 'unknown',
    description: '',
    areaOfEffect: 175,
    targetsAllowed: 'nonsapper,notself,structure',
    levels: {
            "1": {
                  "areaOfEffect": 175
            }
      },
    visualEffects: {
            "attachmentPoints": [
                  1,
                  "origin"
            ],
            "attachmentTarget": "Abilities\\Spells\\Other\\BreathOfFire\\BreathOfFireTarget.mdx"
      },
  },
  {
    id: 'unsafe-heat-mage-fire',
    name: 'Unsafe Heat Mage Fire',
    category: 'unknown',
    description: '',
    areaOfEffect: 360,
    targetsAllowed: 'nonsapper,notself,structure',
    levels: {
            "1": {
                  "areaOfEffect": 360
            }
      },
    visualEffects: {
            "attachmentPoints": [
                  1,
                  "origin"
            ],
            "attachmentTarget": "Abilities\\Spells\\Other\\BreathOfFire\\BreathOfFireTarget.mdx"
      },
  },
  {
    id: 'bonfire',
    name: 'Bonfire',
    category: 'unknown',
    description: '',
    tooltip: 'Gives heat to nearby units',
    iconPath: 'dispasbtnimmolation.png',
    areaOfEffect: 300,
    targetsAllowed: 'hero',
    levels: {
            "1": {
                  "areaOfEffect": 300
            }
      },
  },
  {
    id: 'camp-fire-heat-aura',
    name: 'Camp Fire Heat Aura',
    category: 'unknown',
    description: '',
    tooltip: 'Heats all friendly trolls in a distance of |cffFE890D380|r around the fire.',
    iconPath: 'btnincinerateon.png',
    cooldown: 0.5,
    range: 380,
    duration: 5,
    hotkey: 'R',
    targetsAllowed: 'air,enemies,friend,ground,hero,invulnerable,neutral,nonancient,organic,vulnerable',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0.5,
                  "duration": 5,
                  "range": 380
            }
      },
  },
  {
    id: 'mage-fire-heat-aura',
    name: 'Mage Fire Heat Aura',
    category: 'unknown',
    description: '',
    tooltip: 'Heats all friendly trolls in a distance of |cffFE890D600|r around the fire.',
    iconPath: 'btnincinerateon.png',
    cooldown: 0.5,
    range: 600,
    duration: 5,
    hotkey: 'R',
    targetsAllowed: 'air,enemies,friend,ground,hero,invulnerable,neutral,nonancient,organic,vulnerable',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0.5,
                  "duration": 5,
                  "range": 600
            }
      },
  },
  {
    id: 'hero-glow',
    name: 'Hero Glow',
    category: 'unknown',
    description: '',
    areaOfEffect: 1,
    levels: {
            "1": {
                  "areaOfEffect": 1
            }
      },
    visualEffects: {
            "attachmentPoints": [
                  "origin"
            ],
            "attachmentTarget": "Models\\Abilities\\GeneralHeroGlow.mdx"
      },
  },
  {
    id: 'bear-block',
    name: 'Bear Block',
    category: 'unknown',
    description: '',
  },
  {
    id: 'panther-shadow-meld',
    name: 'Panther Shadow Meld',
    category: 'unknown',
    description: '',
  },
  {
    id: 'throw-your-axe-to-do-0-8x-attack-damage',
    name: 'Throw your axe to do 0.8x attack damage.',
    category: 'unknown',
    description: '',
    tooltip: 'Throw your axe to do |cffFF02020.8x|r attack damage.\nApplies |cff7DBEF160%|r slow that decays over |cff7DBEF18|r(|cff7DBEF12|r) seconds.\nHas |cff7DBEF110|r seconds cooldown.',
    iconPath: 'btnaxethrow.png',
    manaCost: 10,
    cooldown: 10,
    range: 700,
    hotkey: 'Q',
    targetsAllowed: 'ground,enemies,vulnerable,neutral,alive,organic,air',
    levels: {
            "1": {
                  "manaCost": 10,
                  "cooldown": 10,
                  "range": 700
            }
      },
  },
  {
    id: 'charge-towards-enemy-stunning-them-for-3-0-5-seconds-on-impact',
    name: 'Charge towards enemy stunning them for 3(0.5) seconds on impact.',
    category: 'unknown',
    description: '',
    tooltip: 'Charge towards enemy stunning them for |cff7DBEF13|r(|cff7DBEF10.5|r) seconds on impact.\nYou are invulnerable and ignore terrain during charge.\nHas |cff7DBEF120|r seconds cooldown.',
    iconPath: 'btnshieldcharge.png',
    cooldown: 20,
    range: 600,
    duration: 0.5,
    hotkey: 'E',
    targetsAllowed: 'ground,enemies,neutral,vulnerable,alive,organic',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 20,
                  "duration": 0.5,
                  "range": 600
            }
      },
  },
  {
    id: 'perform-shield-bash-dealing-attack-damage-and-pushing-enemies-away-in-a-cone',
    name: 'Perform shield bash, dealing attack damage and pushing enemies away in a cone.',
    category: 'unknown',
    description: '',
    tooltip: 'Perform shield bash, dealing attack damage and pushing enemies away in a cone.',
    cooldown: 1,
    range: 700,
    duration: 0.5,
    hotkey: 'R',
    targetsAllowed: 'ground,enemies,neutral,vulnerable,alive,organic,air',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 1,
                  "duration": 0.5,
                  "range": 700
            }
      },
  },
  {
    id: 'warrior-throws-two-axes-that-spiral-around-him-dealing-0-2x-attack-damage-on-impact',
    name: 'Warrior throws two axes that spiral around him, dealing 0.2x attack damage on impact.',
    category: 'unknown',
    description: '',
    tooltip: 'Warrior throws two axes that spiral around him, dealing |cffFF02020.2|rx attack damage on impact.\nRemoves immobilizing effects on use.\nHas |cff7DBEF125|r seconds cooldown.',
    iconPath: 'btnwhirlingaxes.png',
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
    category: 'unknown',
    description: '',
    tooltip: 'Gurubashi Warrior gains different abilitites depending on weapons he has equipped:\n\n|cFFFFCC00One-handed weapon|r - Axe Throw\n|cFFFFCC00Two-handed weapon|r - Whirlwind\n|cFFFFCC00Shield|r - Shield Charge, replaces Spiked Net\n|cFFFFCC00Two weapons|r - Whirling Axes; replaces Spiked Net',
    iconPath: 'pasbtnweaponsofchoice.png',
  },
  {
    id: 'deal-0-8x-attack-damage-per-second-to-enemies-in-350-radius-lasts-for-3-seconds',
    name: 'Deal 0.8x attack damage per second to enemies in 350 radius. Lasts for 3 seconds',
    category: 'unknown',
    description: '',
    tooltip: 'Deal |cffFF02020.8x|r attack damage per second to enemies in |cff7DBEF1350|r radius. Lasts for |cff7DBEF13|r seconds\nYou are immune to spells during effect.\nHas |cff7DBEF145|r seconds cooldown.',
    manaCost: 35,
    cooldown: 45,
    duration: 3,
    areaOfEffect: 350,
    hotkey: 'W',
    targetsAllowed: 'ground,enemies,vulnerable,alive,organic,neutral,air',
    levels: {
            "1": {
                  "manaCost": 35,
                  "cooldown": 45,
                  "duration": 3,
                  "areaOfEffect": 350
            }
      },
  },
  {
    id: 'binds-an-enemy-target-for-2-5-8-0-seconds-on-heroes-normal-units-air-units-and-fish-will-be-5a680253',
    name: 'Binds an enemy target for 2.5/8.0 seconds on heroes/normal units. Air units and fish will be moved next to the caster. Has 10 seconds cooldown.',
    category: 'unknown',
    description: '',
    tooltip: 'Binds an enemy target for |cffFE890D2.5|r/|cffFE890D8.0|r seconds on heroes/normal units. Air units and fish will be moved next to the caster. Has |cff7DBEF110|r seconds cooldown.',
    iconPath: 'atcensnare.png',
    cooldown: 10,
    range: 700,
    duration: 8,
    hotkey: 'R',
    targetsAllowed: 'air,enemies,ground,neutral,nonancient,organic',
    levels: {
            "1": {
                  "cooldown": 10,
                  "duration": 8,
                  "range": 700
            }
      },
  },
  {
    id: 'rage',
    name: 'Rage',
    category: 'unknown',
    description: '',
    tooltip: 'Permanently increase attack speed by |cffFF020210%|r.',
    iconPath: 'btnheadhunterberserker.png',
    areaOfEffect: 1,
    levels: {
            "1": {
                  "areaOfEffect": 1
            }
      },
  },
  {
    id: 'hide-tracking-beacon',
    name: 'Hide Tracking Beacon',
    category: 'unknown',
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
    category: 'unknown',
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
    category: 'unknown',
    description: '',
    tooltip: 'Throws a bottle filled with dirty stuff, causing the target to get dysentery-like symptoms and poop hot, steaming diarrhea uncontrollably. Tracks a lot longer than normal track and is good for tracking long range. Lasts |cff7DBEF145|r seconds, has |cff7DBEF140|r seconds cooldown.',
    iconPath: 'btntracking.png',
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
    id: 'endurance',
    name: 'Endurance',
    category: 'unknown',
    description: '',
    tooltip: 'Increases the warriors health efficiency by reducing damage. He has |cffFE890D35%|r chance to reduce incoming damage. Damage is reduced by |cffFF020210|r but cannot go below |cffFF02023|r',
    iconPath: 'btnheadhunterberserker.png',
  },
  {
    id: 'binds-an-enemy-target-for-2-5-8-0-seconds-on-heroes-normal-units-air-units-and-fish-will-be-2dd5271e',
    name: 'Binds an enemy target for 2.5/8.0 seconds on heroes/normal units. Air units and fish will be moved next to the caster. Deals 24.0 damage over time. Has 10 seconds cooldown.',
    category: 'unknown',
    description: '',
    tooltip: 'Binds an enemy target for |cffFE890D2.5|r/|cffFE890D8.0|r seconds on heroes/normal units. Air units and fish will be moved next to the caster.|nDeals |cffFF020224.0|r damage over time. Has |cff7DBEF110|r seconds cooldown.',
    iconPath: 'btnspikednet.png',
    cooldown: 10,
    range: 700,
    duration: 8,
    hotkey: 'R',
    targetsAllowed: 'air,enemies,ground,neutral,nonancient,organic,vulnerable',
    levels: {
            "1": {
                  "cooldown": 10,
                  "duration": 8,
                  "range": 700
            }
      },
  },
  {
    id: 'thrill-of-battle',
    name: 'Thrill of Battle',
    category: 'unknown',
    description: '',
    tooltip: 'The Warrior thrives in combat and is always looking for |nhis next opponent. He moves |cffFE890D30%|r faster and attacks |cffFE890D20%|r faster.|n',
    iconPath: 'btnthrillofbattle.png',
    targetsAllowed: 'self',
  },
  {
    id: 'undying',
    name: 'Undying',
    category: 'unknown',
    description: '',
    tooltip: 'After countless battles the Warrior feels less and less pain from each wound.|nHe receives |cffFE890D10|r% less damage increasing to |cffFE890D15.000001|r% less |ndamage when below |cffFE890D50|r% health. |n',
    iconPath: 'btnundying.png',
  },
  {
    id: 'inventory-unit-3-slot',
    name: 'Inventory Unit 3 Slot',
    category: 'unknown',
    description: '',
  },
  {
    id: 'inventory-unit-4-slot',
    name: 'Inventory Unit 4 Slot',
    category: 'unknown',
    description: '',
  },
  {
    id: 'inventory-unit-5-slot',
    name: 'Inventory Unit 5 Slot',
    category: 'unknown',
    description: '',
  },
  {
    id: 'inventory-unit-6-slot',
    name: 'Inventory Unit 6 Slot',
    category: 'unknown',
    description: '',
  },
  {
    id: 'inventory-building-2-slot',
    name: 'Inventory Building 2 Slot',
    category: 'unknown',
    description: '',
  },
  {
    id: 'inventory-building-3-slot',
    name: 'Inventory Building 3 Slot',
    category: 'unknown',
    description: '',
  },
  {
    id: 'open-dark-gate',
    name: 'Open Dark Gate',
    category: 'unknown',
    description: '',
    tooltip: 'The Dementia Summoner channels pure balls or dark energy which he uses to construct a gate. As the balls dissipate, they cast spells on enemies inside the gate. The longer the gate is channeled the longer it lasts and the faster the orbs cast spells. Runes carried by the Dementia Master have increased range inside the gate and he can use the gate and Dementia Summoning to summon monsters from the Dementia Realm. Can last up to |cff7DBEF140|r seconds, has |cff7DBEF170|r seconds cooldown.',
    iconPath: 'btnportal.png',
    manaCost: 80,
    cooldown: 70,
    hotkey: 'Q',
    levels: {
            "1": {
                  "manaCost": 80,
                  "cooldown": 70
            }
      },
  },
  {
    id: 'burn',
    name: 'Burn',
    category: 'unknown',
    description: '',
    duration: 5,
    targetsAllowed: 'air,enemies,ground,neutral,organic',
    levels: {
            "1": {
                  "manaCost": 0,
                  "duration": 5
            }
      },
  },
  {
    id: 'null-damage',
    name: 'Null Damage',
    category: 'unknown',
    description: '',
    tooltip: 'Reduce target damage by |cffFF020250%|r, attack speed by |cffFE890D25%|r and movement speed by |cffFE890D10%|r for |cff7DBEF110|r/|cff7DBEF130|r seconds. Has |cff7DBEF145|r seconds cooldown.',
    iconPath: 'btncripple.png',
    manaCost: 20,
    cooldown: 45,
    duration: 30,
    hotkey: 'R',
    levels: {
            "1": {
                  "manaCost": 20,
                  "cooldown": 45,
                  "duration": 30
            }
      },
  },
  {
    id: 'fire-sphere',
    name: 'Fire Sphere',
    category: 'unknown',
    description: '',
    visualEffects: {
            "attachmentPoints": [
                  "hand,left",
                  "hand,right"
            ],
            "attachmentTarget": "Abilities\\Weapons\\PhoenixMissile\\Phoenix_Missile.mdx"
      },
  },
  {
    id: 'unholy-flame',
    name: 'Unholy Flame',
    category: 'unknown',
    description: '',
    range: 5000,
    duration: 25,
    areaOfEffect: 1,
    targetsAllowed: 'air,enemies,friend,ground,neutral,nonancient,organic',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 25,
                  "range": 5000,
                  "areaOfEffect": 1
            }
      },
  },
  {
    id: 'ice-sphere',
    name: 'Ice Sphere',
    category: 'unknown',
    description: '',
    visualEffects: {
            "attachmentPoints": [
                  "head",
                  "hand,left",
                  "hand,right"
            ],
            "attachmentTarget": "Abilities\\Weapons\\ZigguratMissile\\ZigguratMissile.mdx"
      },
  },
  {
    id: 'summon-silence',
    name: 'Summon Silence',
    category: 'unknown',
    description: '',
    range: 3500,
    duration: 10,
    targetsAllowed: 'enemies,friend,hero,ground,neutral,nonancient,organic',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 10,
                  "range": 3500
            }
      },
  },
  {
    id: 'activates-runes',
    name: 'Activates Runes',
    category: 'unknown',
    description: '',
    tooltip: 'Casting this spell causes nearby runes to become active and seek targets in a very close range around the caster. Runes will seek any enemies inside a dark gate if the caster casts this inside the gate as well. This skill can also be used in a gate to perform a dementia summoning. Has |cff7DBEF110|r seconds cooldown.',
    iconPath: 'btnfaeriefire.png',
    cooldown: 10,
    hotkey: 'A',
    levels: {
            "1": {
                  "cooldown": 10
            }
      },
  },
  {
    id: 'dementia-summoning',
    name: 'Dementia Summoning',
    category: 'unknown',
    description: '',
    tooltip: 'Passively gives the Dementia Master the ability to summon a monster from dementia space using Dementia Runes. Summoning must be performed close to the center of an open dark gate and you must have a correct rune order. The Dementia Master managed to decipher the following rune order from the ancient dark book.\n|cffFF0202Ka|r |cff7DBEF1Lez|r |cffFF0202Ka|r |cff1FBF00Nel|r |cffFF0202Ka|r\n|cff1FBF00Nel|r |cff1FBF00Nel|r |cffFF0202Ka|r |cff1FBF00Nel|r |cff7DBEF1Lez|r\n|cff7DBEF1Lez|r |cff1FBF00Nel|r |cff7DBEF1Lez|r |cff7DBEF1Lez|r |cffFF0202Ka|r\n|cffFF0202Warning! Dementia Summonings can be unpredictable and dangerous. No creature wants to be summoned for no reason!|r|r',
    iconPath: 'pasbtngenericspellimmunity.png',
  },
  {
    id: 'dream-eater',
    name: 'Dream Eater',
    category: 'unknown',
    description: '',
    tooltip: 'Consume all the dreams you hold as well as dreams of all enemies within |cff7DBEF11300|r radius that are currently sleeping.\nConsuming a dream steals |cff7DBEF115|r+|cff7DBEF10.75|rx|cff00EAFFIntelligence|r mana from the target, deals |cffFF020215|r+|cffFF02020.75|rx|cff00EAFFIntelligence|r damage and recovers half of damage dealt as life.',
    iconPath: 'btndevourmagic.png',
    manaCost: 10,
    cooldown: 5,
    hotkey: 'W',
    targetsAllowed: 'enemies,ground,hero',
    levels: {
            "1": {
                  "manaCost": 10,
                  "cooldown": 20
            }
      },
  },
  {
    id: 'dreamwalking',
    name: 'Dreamwalking',
    category: 'unknown',
    description: '',
    tooltip: 'You are dreamwalking.',
    iconPath: 'btnsensedreams.png',
    range: 99999,
    duration: 9999,
    targetsAllowed: 'friend,ground,hero,self',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 9999,
                  "range": 99999
            }
      },
  },
  {
    id: 'induce-dreamwalking',
    name: 'Induce Dreamwalking',
    category: 'unknown',
    description: '',
    tooltip: 'Induce Dreamwalking state in your ally, recovering |cff00EAFF80|r mana.',
    iconPath: 'btnetherealformon.png',
    cooldown: 20,
    range: 300,
    hotkey: 'F',
    targetsAllowed: 'friend,hero',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 20,
                  "range": 300
            }
      },
  },
  {
    id: 'dream-stealer',
    name: 'Dream Stealer',
    category: 'unknown',
    description: '',
    tooltip: 'Dreamwalker will steal dreams of any enemies in 1300 range.\nDreams last for |cff7DBEF110.0|r seconds, after which they are automatically consumed.',
    iconPath: 'btnpasdoom.png',
  },
  {
    id: 'arcane-interference',
    name: 'Arcane Interference',
    category: 'unknown',
    description: '',
    tooltip: 'The more powerful the spell, the harder it is to control mana, increasing mana cost of \nyour Elementalist spells by |cffFF02022.5|r% per |cff00EAFF1 Intelligence|r beyond 40.',
    iconPath: 'btnarcaneinterference.png',
  },
  {
    id: 'orb-daze-dummy-spell',
    name: 'Orb daze Dummy Spell',
    category: 'unknown',
    description: '',
    range: 99999,
    duration: 0.5,
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 0.5,
                  "range": 99999
            }
      },
  },
  {
    id: 'orb-damage-reducer-dummy-spell',
    name: 'Orb Damage Reducer Dummy Spell',
    category: 'unknown',
    description: '',
    range: 99999,
    duration: 1.5,
    areaOfEffect: 1,
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 1.5,
                  "range": 99999,
                  "areaOfEffect": 1
            }
      },
  },
  {
    id: 'earth-guardians',
    name: 'Earth Guardians',
    category: 'unknown',
    description: '',
    tooltip: 'Channels to conjure 7 earth orbs that circle around you, dealing damage to enemies that come close equal to |cffFF020210.0|r+|cffFF02020.8|rx|cff00EAFFIntelligence|r  and slow their attack speed by |cffFE890D80%|r. Subsequent impacts on the same target deal |cffFF020225%|r damage. Has |cff7DBEF135|r seconds cooldown.',
    iconPath: 'btngolemstormbolt.png',
    manaCost: 20,
    cooldown: 35,
    hotkey: 'W',
    levels: {
            "1": {
                  "manaCost": 20,
                  "cooldown": 35
            }
      },
  },
  {
    id: 'frost-blast',
    name: 'Frost Blast',
    category: 'unknown',
    description: '',
    tooltip: 'Shoots out a missile of frost that explodes on impact, dealing |cffFF02026.0|r to |cffFF020215.0|r + |cffFF02020.45|rx to |cffFF02021.15|rx |cff00EAFFIntelligence|r damage to units in a small area and slows their movement and attack speeds by |cffFE890D35%|r - |cffFE890D60%|r for |cff7DBEF12|r - |cff7DBEF14|r seconds with effects increasing by distance travelled before impact. Has |cff7DBEF135|r seconds cooldown.',
    iconPath: 'btnfrostbolt.png',
    manaCost: 12,
    cooldown: 35,
    range: 1650,
    hotkey: 'E',
    levels: {
            "1": {
                  "manaCost": 12,
                  "cooldown": 35,
                  "range": 1650
            }
      },
  },
  {
    id: 'meditate',
    name: 'Meditate',
    category: 'unknown',
    description: '',
    tooltip: 'Channels to recover |cff7DBEF140|r + |cff7DBEF13.0|rx |cff00EAFFIntelligence|r mana over |cff7DBEF17|r seconds. Cancels on damage. Has |cff7DBEF172|r seconds cooldown.',
    iconPath: 'btnmedidate.png',
    cooldown: 72,
    hotkey: 'D',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 72
            }
      },
  },
  {
    id: 'meteor',
    name: 'Meteor',
    category: 'unknown',
    description: '',
    tooltip: 'Calls down a meteor to impact on target point after 1 second. On impact, deals |cffFF020210.0|r + |cffFF02020.875|rx |cff00EAFFIntelligence|r damage and applies a burning effect on targets hit for another |cffFF020215.0|r + |cffFF02021.0|rx |cff00EAFFIntelligence|r damage over time. Has |cff7DBEF128|r seconds cooldown.',
    iconPath: 'btnfirerocks.png',
    manaCost: 24,
    cooldown: 28,
    range: 800,
    areaOfEffect: 240,
    hotkey: 'R',
    levels: {
            "1": {
                  "manaCost": 24,
                  "cooldown": 28,
                  "duration": 0,
                  "range": 800,
                  "areaOfEffect": 240
            }
      },
  },
  {
    id: 'meteor-stun-dummy-spell',
    name: 'Meteor Stun Dummy Spell',
    category: 'unknown',
    description: '',
    range: 9999,
    duration: 1.5,
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 1.5,
                  "range": 9999
            }
      },
  },
  {
    id: 'zap',
    name: 'Zap',
    category: 'unknown',
    description: '',
    tooltip: 'Zaps the target dealing damage equal to your |cff00EAFFIntelligence|r. Stacks charges on the target and on the third charge, they explode slowing movement and attack speed by |cffFE890D75%|r and dealing bonus damage equal to |cffFF020250.0|r% of your |cff00EAFFIntelligence|r and causing another Zap to be cast on other units nearby.\nDoes |cffFF020220.0|r extra damage to animals. \nCharge last |cff7DBEF115|r seconds. Has |cff7DBEF13|r seconds cooldown.',
    manaCost: 15,
    cooldown: 3,
    range: 800,
    areaOfEffect: 1,
    hotkey: 'Q',
    levels: {
            "1": {
                  "manaCost": 15,
                  "cooldown": 3,
                  "range": 800,
                  "areaOfEffect": 1
            }
      },
  },
  {
    id: 'zap-dummy-slow',
    name: 'Zap Dummy Slow',
    category: 'unknown',
    description: '',
    range: 1500,
    duration: 3,
    targetsAllowed: 'air,allies,enemies,ground',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 3,
                  "range": 1500
            }
      },
  },
  {
    id: 'zap-auto-cast',
    name: 'Zap auto cast',
    category: 'unknown',
    description: '',
    duration: 9999,
    areaOfEffect: 0,
    targetsAllowed: 'self',
    levels: {
            "1": {
                  "duration": 9999,
                  "areaOfEffect": 0
            }
      },
    visualEffects: {
            "attachmentPoints": [
                  "hand,right",
                  "hand,left",
                  2
            ],
            "attachmentTarget": "Abilities\\Weapons\\FarseerMissile\\FarseerMissile.mdx"
      },
  },
  {
    id: 'anger',
    name: 'Anger',
    category: 'unknown',
    description: '',
    tooltip: 'Causes a target to become angery, increasing its attack speed by |cffFE890D75%|r while doing |cffFF020210|r damage per second to it. Anger last |cffFE890D10|r seconds, target become |cffFF6347Exhausted|r afterward. Has |cff7DBEF112|r seconds cooldown.|cffFF6347\n\nExhausted\n|rTarget attack speed is reduced by |cffFE890D50%|r, movement speed by |cffFE890D25%|r for |cff7DBEF14|r seconds.',
    iconPath: 'btnunholyfrenzy.png',
    manaCost: 20,
    cooldown: 12,
    duration: 10,
    hotkey: 'E',
    targetsAllowed: 'air,ground,hero,organic',
    levels: {
            "1": {
                  "manaCost": 20,
                  "cooldown": 12,
                  "duration": 10
            }
      },
  },
  {
    id: 'jealousy',
    name: 'Jealousy',
    category: 'unknown',
    description: '',
    tooltip: 'The Hypnotist curses an enemy causing nearby allies to attack it. Jealousy has a melee casting range and no casting animation to make it hard to notice. A jealousied troll will be attacked by his allied towers as well. Lasts |cffFE890D7|r seconds. Has |cff7DBEF175|r seconds cooldown.',
    iconPath: 'btnsacrifice.png',
    manaCost: 30,
    cooldown: 75,
    duration: 30,
    hotkey: 'D',
    targetsAllowed: 'hero,enemy',
    levels: {
            "1": {
                  "manaCost": 30,
                  "cooldown": 75,
                  "duration": 30
            }
      },
  },
  {
    id: 'seizures',
    name: 'Seizures',
    category: 'unknown',
    description: '',
    tooltip: 'Manipulates the targets brain sending small electric pulses through his nerves causing him seizures. The seizures do |cffFF02024|r damage per stun and have a random chance of occuring. Seizures stop after |cff7DBEF18|r seconds. Has |cff7DBEF130|r seconds cooldown.',
    iconPath: 'btnpurge.png',
    manaCost: 20,
    cooldown: 30,
    hotkey: 'S',
    targetsAllowed: 'air,enemies,ground,neutral,organic,terrain',
    levels: {
            "1": {
                  "manaCost": 20,
                  "cooldown": 30
            }
      },
  },
  {
    id: 'seizure-bolt',
    name: 'Seizure Bolt',
    category: 'unknown',
    description: '',
    duration: 0.1,
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 0.1
            }
      },
  },
  {
    id: 'entangling-root-troll',
    name: 'Entangling Root Troll',
    category: 'unknown',
    description: '',
    range: 99999,
    duration: 8,
    targetsAllowed: 'enemies,ground,neutral,organic,hero',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 8,
                  "range": 99999
            }
      },
  },
  {
    id: 'entangling-root-hostile',
    name: 'Entangling Root Hostile',
    category: 'unknown',
    description: '',
    range: 99999,
    duration: 8,
    targetsAllowed: 'ground,enemies,neutral,organic',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 8,
                  "range": 99999
            }
      },
  },
  {
    id: 'acquired-knowlede',
    name: 'Acquired Knowlede',
    category: 'unknown',
    description: '',
    tooltip: 'Mage can add a scroll to its Grimoire permanently gaining it\'s powers. \n\nMage gains |cff1FBF002|r |cff00EAFFIntelligence|r per page added to the Grimoire.',
    iconPath: 'btnnecromancermaster.png',
  },
  {
    id: 'add-a-scroll-to-your-grimoire',
    name: 'Add a scroll to your Grimoire',
    category: 'unknown',
    description: '',
    tooltip: 'Add a scroll to your Grimoire',
    iconPath: 'btnspellsteal.png',
    cooldown: 1,
    hotkey: 'Z',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 1
            }
      },
  },
  {
    id: 'make-temporary-mage-fire',
    name: 'Make Temporary Mage Fire',
    category: 'unknown',
    description: '',
    tooltip: 'The mage conjures a powerful fire on his energy alone. The is placed where he is and lasts for |cffFE890D30|r seconds. Has |cff7DBEF1150|r seconds cooldown.',
    iconPath: 'btnfire.png',
    manaCost: 40,
    cooldown: 150,
    duration: 30,
    hotkey: 'A',
    levels: {
            "1": {
                  "manaCost": 40,
                  "cooldown": 150,
                  "duration": 30
            }
      },
  },
  {
    id: 'negative-blast',
    name: 'Negative Blast',
    category: 'unknown',
    description: '',
    tooltip: 'Blasts a target with negative energy dealing |cffFF020240|r damage and slowing for a short duration. Has |cff7DBEF120|r seconds cooldown.',
    iconPath: 'btnwandofshadowsight.png',
    manaCost: 10,
    cooldown: 20,
    duration: 5,
    hotkey: 'E',
    levels: {
            "1": {
                  "manaCost": 10,
                  "cooldown": 20,
                  "duration": 5
            }
      },
  },
  {
    id: 'spirit-prison-cage-dummy',
    name: 'Spirit Prison Cage Dummy',
    category: 'unknown',
    description: '',
    range: 99999,
    duration: 5,
    targetsAllowed: 'enemies,ground,neutral,nonancient,organic',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 5,
                  "range": 99999
            }
      },
  },
  {
    id: 'spirit-prison',
    name: 'Spirit Prison',
    category: 'unknown',
    description: '',
    tooltip: 'Unleash a tormented spirit in a straight line, caging and revealing the first enemy hit. Lasts |cff7DBEF11.75|r (|cff7DBEF15|r) seconds, has |cff7DBEF120|r seconds cooldown.',
    iconPath: 'btnwitchdoctormaster.png',
    manaCost: 10,
    cooldown: 20,
    range: 1400,
    hotkey: 'Q',
    levels: {
            "1": {
                  "manaCost": 10,
                  "cooldown": 20,
                  "range": 1400
            }
      },
  },
  {
    id: 'doomsday',
    name: 'Doomsday',
    category: 'unknown',
    description: '',
    duration: 4,
    areaOfEffect: 900,
    targetsAllowed: 'enemies,friend,ground,neutral,self,structure,tree',
    levels: {
            "1": {
                  "manaCost": 0,
                  "duration": 4,
                  "areaOfEffect": 900
            }
      },
  },
  {
    id: 'mix-herb',
    name: 'Mix Herb',
    category: 'unknown',
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
    id: 'pass-meat',
    name: 'Pass Meat',
    category: 'unknown',
    description: '',
    tooltip: 'Use this ability to pass meat to an ally.\n|cff7DBEF110|r seconds charge recovery.',
    iconPath: 'btnpassmeat6.png',
    range: 150,
    hotkey: 'D',
    targetsAllowed: 'allies,hero,friend',
    levels: {
            "1": {
                  "range": 150
            }
      },
  },
  {
    id: 'a-thief-s-pocket',
    name: 'A Thief\'s pocket',
    category: 'unknown',
    description: '',
    tooltip: 'Thief has a secret pocket granting him an extra slot. \nThief\'s pocket can only hold items that are stolen or come from thief\'s bush.',
    iconPath: 'btnthiefpouch.png',
  },
  {
    id: 'fortitude',
    name: 'Fortitude',
    category: 'unknown',
    description: '',
    tooltip: 'Gives |cff1FBF003|r bonus armor to allied trolls around you.',
    iconPath: 'pasbtndevotion.png',
    targetsAllowed: 'air,allies,friend,ground,hero,invulnerable,self,vulnerable',
  },
  {
    id: 'increase-metabolism',
    name: 'Increase Metabolism',
    category: 'unknown',
    description: '',
    tooltip: 'Increases the health recovered by food and potions by |cff1FBF0050%|r and boosts movement speed by |cffFE890D20%|r.\nExtra healing is limited to |cff1FBF00100|r+|cff1FBF0010.0|rx|cff00EAFFIntelligence|r\nLasts |cff7DBEF130|r seconds, Has |cff7DBEF160|r seconds cooldown.',
    iconPath: 'btnancestralspirit.png',
    manaCost: 40,
    cooldown: 60,
    range: 700,
    duration: 30,
    hotkey: 'D',
    targetsAllowed: 'air,ground,friend,organic,self,neutral',
    levels: {
            "1": {
                  "manaCost": 40,
                  "cooldown": 60,
                  "duration": 30,
                  "range": 700
            }
      },
  },
  {
    id: 'troll-battle-call',
    name: 'Troll Battle Call',
    category: 'unknown',
    description: '',
    tooltip: 'Increase damage by |cffFF020220%|r and defense by |cff1FBF001|r of you and allied trolls around for |cff7DBEF160|r seconds. Medium range.',
    iconPath: 'btnhowlofterror.png',
    manaCost: 20,
    cooldown: 60,
    duration: 20,
    areaOfEffect: 2000,
    hotkey: 'R',
    castTime: 'Abilities\\Spells\\NightElf\\Taunt\\TauntCaster.mdx',
    levels: {
            "1": {
                  "manaCost": 20,
                  "cooldown": 60,
                  "duration": 20,
                  "areaOfEffect": 2000
            }
      },
  },
  {
    id: 'cure-all',
    name: 'Cure All',
    category: 'unknown',
    description: '',
    tooltip: 'Dispels buffs and effects from friendly units. Can be used to cure snake poison, disease or even jealousy among other things. Has |cff7DBEF145|r seconds cooldown.',
    manaCost: 10,
    cooldown: 45,
    range: 400,
    hotkey: 'W',
    targetsAllowed: 'air,allies,friend,ground,invulnerable,self,vulnerable',
    levels: {
            "1": {
                  "manaCost": 10,
                  "cooldown": 45,
                  "range": 400
            }
      },
  },
  {
    id: 'windless-small-debuff',
    name: 'Windless Small Debuff',
    category: 'unknown',
    description: '',
    range: 9000,
    duration: 0.01,
    targetsAllowed: 'hero',
    levels: {
            "1": {
                  "manaCost": 0,
                  "duration": 0.01,
                  "range": 9000
            }
      },
  },
  {
    id: 'the-glow',
    name: 'The Glow',
    category: 'unknown',
    description: '',
    tooltip: 'The Troll Priest generates a friendly warming aura that spreads enveloping friendly units and envigorating them, adding |cffFE890D10%|r move speed, |cffFE890D5%|r attack speed, and heat.',
    areaOfEffect: 400,
    levels: {
            "1": {
                  "areaOfEffect": 400
            }
      },
  },
  {
    id: 'am4-acen',
    name: 'AM4|:ACen',
    category: 'unknown',
    description: '',
    range: 99999,
    duration: 8,
    targetsAllowed: 'enemies,air,neutral',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 8,
                  "range": 99999
            }
      },
  },
  {
    id: 'swoop',
    name: 'Swoop',
    category: 'unknown',
    description: '',
    tooltip: 'Hawk swoops down onto a target, attempting to claw their eyes out, blinding them.\nDeals |cffFF020210|r damage per second.\nLasts for |cff7DBEF14|r(|cff7DBEF12|r) seconds.\nHas |cff7DBEF120|r seconds cooldown.',
    iconPath: 'pasbtnswoopenemy.png',
  },
  {
    id: 'fetch',
    name: 'Fetch',
    category: 'unknown',
    description: '',
    tooltip: 'Hawk can fetch an item for you. Can be used on bushes.|cFFFFCC00\nLvl 1: |rcan be used on items.|cFFFFCC00\nLvl 2: |rcan be used on bushes.\nHas |cff7DBEF110|r seconds cooldown.',
    iconPath: 'pasbtnfetchitem.png',
  },
  {
    id: 'command-your-hawk-to-swoop-at-a-target-can-be-used-on-various-targets-for-different-effects-a1114446',
    name: 'Command your Hawk to swoop at a target. Can be used on various targets for different effects. See tooltips in spellbook to learn more.',
    category: 'unknown',
    description: '',
    tooltip: 'Command your Hawk to swoop at a target. Can be used on various targets for different effects. See tooltips in spellbook to learn more.\nRange: |cff7DBEF11200|r',
    iconPath: 'btnhawkswoop.png',
    range: 1200,
    hotkey: 'R',
    targetsAllowed: 'enemies,ground,neutral,item,vulnerable,invulnerable',
    levels: {
            "1": {
                  "range": 1200
            },
            "2": {
                  "range": 1200
            }
      },
  },
  {
    id: 'command-greater-hawk-to-carry-you-to-safety-flying-a-short-distance-can-be-used-on-an-ally-cffffcc00',
    name: 'Command Greater Hawk to carry you to safety, flying a short distance. Can be used on an ally.|cFFFFCC00',
    category: 'unknown',
    description: '',
    tooltip: 'Command Greater Hawk to carry you to safety, flying a short distance. Can be used on an ally.|cFFFFCC00\nLvl 2: |rcan be used on area to order hawk to carry you to that location.|cFFFFCC00\nLvl 4: |rcan be used on an ally to order hawk to carry them in your direction.\nDistance: |cff7DBEF1900|r\nHas |cff7DBEF140|r seconds cooldown.',
    iconPath: 'btnwing.png',
    cooldown: 40,
    range: 2000,
    hotkey: 'E',
    targetsAllowed: 'self',
    levels: {
            "1": {
                  "cooldown": 40,
                  "range": 2000
            },
            "2": {
                  "cooldown": 40,
                  "range": 2000
            }
      },
  },
  {
    id: 'greater-hawk-circles-around-an-ally-creating-a-cyclone-protecting-him-for-the-duration',
    name: 'Greater Hawk circles around an ally creating a cyclone, protecting him for the duration.',
    category: 'unknown',
    description: '',
    tooltip: 'Greater Hawk circles around an ally creating a cyclone, protecting him for the duration.\nTarget becomes invulnerable for |cff7DBEF13|r seconds and causes |cffFF020240|r damage to enemies upon landing.\nHas |cff7DBEF120|r seconds cooldown.',
    iconPath: 'btntornado.png',
    cooldown: 20,
    range: 1200,
    duration: 2.5,
    hotkey: 'W',
    targetsAllowed: 'self,friend,alive',
    levels: {
            "1": {
                  "range": 1200
            },
            "2": {
                  "range": 1200
            }
      },
  },
  {
    id: 'shadow-sight',
    name: 'Shadow Sight',
    category: 'unknown',
    description: '',
    tooltip: 'The Trapper can see invisble unit around him.',
    iconPath: 'pasbtntrollsight.png',
    range: 1000,
    levels: {
            "1": {
                  "range": 1000
            }
      },
  },
  {
    id: 'bear-trap-dummy',
    name: 'Bear Trap Dummy',
    category: 'unknown',
    description: '',
    range: 99999,
    duration: 5,
    targetsAllowed: 'enemies,ground,hero',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 5,
                  "range": 99999
            }
      },
  },
  {
    id: 'tracking-trap',
    name: 'Tracking Trap',
    category: 'unknown',
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
    id: 'spiked-trap',
    name: 'Spiked Trap',
    category: 'unknown',
    description: '',
    tooltip: 'An itchy trap, troll who walks on it will get slowed by |cffFE890D80%|r for |cffFE890D5|r seconds. Spiked Trap last |cff7DBEF1240|r seconds, has |cff7DBEF160|r seconds cooldown.',
    iconPath: 'btnmeatapult.png',
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
    id: 'bear-trap',
    name: 'Bear Trap',
    category: 'unknown',
    description: '',
    tooltip: 'Troll walking through this trap will be immobilized for |cffFE890D5|r seconds. Bear Trap last |cff7DBEF1240|r seconds, has |cff7DBEF160|r seconds cooldown.',
    iconPath: 'btnbeartrap.png',
    manaCost: 10,
    cooldown: 60,
    range: 100,
    areaOfEffect: 200,
    hotkey: 'R',
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
    id: 'amk-aeah',
    name: 'AMk{:AEah',
    category: 'unknown',
    description: '',
    areaOfEffect: 700,
    targetsAllowed: 'air,ground,enemies,vulnerable,invulnerable,hero',
    levels: {
            "1": {
                  "areaOfEffect": 700
            }
      },
  },
  {
    id: 'amk-amin',
    name: 'AMk}:Amin',
    category: 'unknown',
    description: '',
    targetsAllowed: 'air,ground,enemies,vulnerable,invulnerable,hero',
  },
  {
    id: 'ward-the-area',
    name: 'Ward the Area',
    category: 'unknown',
    description: '',
    tooltip: 'Places a living clay at the target spot. Living clay last |cffFE890D480|r seconds, has |cff7DBEF170|r seconds cooldown.',
    iconPath: 'btngreensentryward.png',
    manaCost: 10,
    cooldown: 70,
    range: 50,
    areaOfEffect: 700,
    hotkey: 'R',
    levels: {
            "1": {
                  "manaCost": 10,
                  "cooldown": 40,
                  "range": 50,
                  "areaOfEffect": 700
            },
            "2": {
                  "manaCost": 10,
                  "cooldown": 50,
                  "range": 50,
                  "areaOfEffect": 700
            },
            "3": {
                  "manaCost": 10,
                  "cooldown": 40,
                  "range": 50,
                  "areaOfEffect": 700
            }
      },
  },
  {
    id: 'select-hero-short-ranged',
    name: 'Select Hero (Short Ranged)',
    category: 'unknown',
    description: '',
    range: 200,
    levels: {
            "1": {
                  "range": 200
            }
      },
  },
  {
    id: 'am7-ane2',
    name: 'AM7|:Ane2',
    category: 'unknown',
    description: '',
    range: 5,
    levels: {
            "1": {
                  "range": 5
            }
      },
  },
  {
    id: 'cloak',
    name: 'Cloak',
    category: 'unknown',
    description: '',
    tooltip: 'The thief goes invisible and move |cffFE890D20%|r faster. Cloak can be used to reveal cliff. Lasts |cff7DBEF14|r seconds, has |cff7DBEF165|r seconds cooldown.',
    iconPath: 'btndarktrolltrappercloak.png',
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
  },
  {
    id: 'nether-fade',
    name: 'Nether Fade',
    category: 'unknown',
    description: '',
    tooltip: 'The Thief fades into the astral plane for several seconds. While there, he cannot be attacked but takes increased spell damage. Lasts |cff7DBEF115|r seconds, has |cff7DBEF150|r seconds cooldown.',
    iconPath: 'btnbanish.png',
    manaCost: 30,
    cooldown: 50,
    hotkey: 'Q',
    levels: {
            "1": {
                  "manaCost": 30,
                  "cooldown": 50
            }
      },
  },
  {
    id: 'windless',
    name: 'Windless',
    category: 'unknown',
    description: '',
    manaCost: 30,
    range: 99999,
    duration: 15,
    levels: {
            "1": {
                  "manaCost": 30,
                  "duration": 15,
                  "range": 99999
            }
      },
  },
  {
    id: 'smoke-stream',
    name: 'Smoke Stream',
    category: 'unknown',
    description: '',
    tooltip: 'The Magic Thief releases a stream of smoke bocking all combat and spells. Smoke is only released while you are moving. Lasts |cff7DBEF19|r seconds, has |cff7DBEF120|r seconds cooldown.',
    iconPath: 'btncloudoffog.png',
    manaCost: 10,
    cooldown: 20,
    hotkey: 'R',
    castTime: 'Abilities\\Spells\\Undead\\RegenerationAura\\ObsidianRegenAura.mdx',
    levels: {
            "1": {
                  "manaCost": 10,
                  "cooldown": 20
            }
      },
  },
  {
    id: 'camouflage',
    name: 'Camouflage',
    category: 'unknown',
    description: '',
    tooltip: 'Stand Next to a tree and cast to turn invisible. You can not move or cast spells or it breaks the invisibility. While invisible, you lose 3x as many stats as normal. Has |cff7DBEF130|r seconds cooldown.',
    iconPath: 'btnambush.png',
    cooldown: 30,
    hotkey: 'Q',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 30
            }
      },
  },
  {
    id: 'jump',
    name: 'Jump',
    category: 'unknown',
    description: '',
    tooltip: 'Allows the thief to jump a short distance. Has |cff7DBEF140|r seconds cooldown.',
    iconPath: 'btnnagaunburrow.png',
    manaCost: 5,
    cooldown: 40,
    range: 99999,
    hotkey: 'R',
    targetsAllowed: 'terrain',
    levels: {
            "1": {
                  "manaCost": 5,
                  "cooldown": 40,
                  "range": 99999
            }
      },
  },
  {
    id: 'blur',
    name: 'Blur',
    category: 'unknown',
    description: '',
    tooltip: 'Makes the Rogue move as fast as he can, leaving blurs.\nIf an enemy comes in contact with blurs, its attack accuracy is temporarily decreased by |cffFE890D20%|r.\nWhile active, Rogue gains |cffFE890D20%|rincreased attack speed.\nEvery time Rogue gets hit by a troll, cooldown is reduced by 1.\n Lasts |cff7DBEF111|r seconds, has |cff7DBEF140|r seconds cooldown.',
    iconPath: 'btnevasion.png',
    manaCost: 30,
    cooldown: 40,
    duration: 11,
    hotkey: 'W',
    levels: {
            "1": {
                  "manaCost": 30,
                  "cooldown": 40,
                  "duration": 11
            }
      },
  },
  {
    id: 'dazzle',
    name: 'Dazzle',
    category: 'unknown',
    description: '',
    range: 99999,
    duration: 3,
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 3,
                  "range": 99999
            }
      },
  },
  {
    id: 'attempt-a-close-range-combat-maneuver-swapping-places-with-an-ally',
    name: 'Attempt a close range combat maneuver, swapping places with an ally.',
    category: 'unknown',
    description: '',
    tooltip: 'Attempt a close range combat maneuver, swapping places with an ally.|cff6495ED\n30 |rsconds cooldown',
    iconPath: 'btndispelmagic.png',
    cooldown: 30,
    range: 150,
    hotkey: 'F',
    targetsAllowed: 'ground,neutral,vulnerable,alive,organic,allies,friend',
    levels: {
            "1": {
                  "cooldown": 30,
                  "range": 150
            }
      },
  },
  {
    id: 'steal-a-piece-of-food-from-a-closest-enemy-in-500-0-range-if-your-inventory-is-full-it-is-g-c7e9a644',
    name: 'Steal a piece of food from a closest enemy in 500.0 range. If your inventory is full, it is gonna be automatically consumed.',
    category: 'unknown',
    description: '',
    tooltip: 'Steal a piece of food from a closest enemy in |cff6495ED500.0|r range. If your inventory is full, it is gonna be automatically consumed.\nSteal Food priority list:\n - Cooked Meat\n - Coconut\n - Banana\n - Scavenged Mushroom.\n - Honeycomb.\n|cff6495ED30.0|r seconds cooldown.',
    iconPath: 'btnstealmeat.png',
    manaCost: 20,
    cooldown: 30,
    range: 150,
    hotkey: 'R',
    targetsAllowed: 'ground,enemies,vulnerable,alive,organic,hero',
    levels: {
            "1": {
                  "manaCost": 20,
                  "cooldown": 25
            }
      },
  },
  {
    id: 'steal',
    name: 'Steal',
    category: 'unknown',
    description: '',
    tooltip: 'Steal an item from a target. Different targets are allowed depending on the lvl of the Rogue:|cFFFFCC00\n\nLvl 2|r - Can be used on thief\'s bush to find a hidden item.|cFFFFCC00\n\nLvl 3|r - Can be used on enemy trolls to steal a stone/hide/mana crystal/flint.|cFFFFCC00\n\nLvl 4|r - Can be used on a trading ship to steal a random item. You can only steal a single item from a ship.\n|cff6495ED60 |rseconds cooldown',
    iconPath: 'btnpickupitem.png',
    cooldown: 60,
    range: 200,
    hotkey: 'Q',
    targetsAllowed: 'ground,neutral,structure,invulnerable,vulnerable,enemies,hero,nonhero',
    levels: {
            "1": {
                  "cooldown": 60,
                  "range": 500
            },
            "2": {
                  "cooldown": 60,
                  "range": 200
            }
      },
  },
  {
    id: 'blink',
    name: 'Blink',
    category: 'unknown',
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
  },
  {
    id: 'telethief-uses-his-dimentional-magic-to-reach-into-a-random-thief-s-bush-on-the-map-and-ste-8311478b',
    name: 'Telethief uses his dimentional magic to reach into a random thief\'s bush on the map and steal a consumable item.',
    category: 'unknown',
    description: '',
    tooltip: 'Telethief uses his dimentional magic to reach into a random thief\'s bush on the map and steal a consumable item.\nItems stolen this way can only be held in thief\'s pocket. Casting this ability will replace an item currently held in thief\'s pocket.\nAt |cFFFFCC00lvl 4|r Telethief acquires mastery of this ability, reducing cooldown to |cff6495ED30|r seconds.\n|cff6495ED60.0|r seconds cooldown.',
    iconPath: 'btnfaeriefire.png',
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
    id: 'summons-a-bee-hive-that-generates-bees',
    name: 'Summons a bee hive that generates bees',
    category: 'unknown',
    description: '',
    tooltip: 'Summons a bee hive that generates bees',
    iconPath: 'btnskink.png',
    cooldown: 60,
    range: 350,
    duration: 20,
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 60,
                  "duration": 20,
                  "range": 350
            }
      },
  },
  {
    id: 'uber-hive',
    name: 'Uber Hive',
    category: 'unknown',
    description: '',
    tooltip: 'This is the uber hive',
    iconPath: 'btnskink.png',
    cooldown: 60,
    range: 350,
    duration: 20,
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 60,
                  "duration": 20,
                  "range": 350
            }
      },
  },
  {
    id: 'mental-quickness',
    name: 'Mental quickness.',
    category: 'unknown',
    description: '',
    tooltip: 'Telethief\'s mental prowess allows him to use his abilities and items from dimentional pocket more often.\n\nGain |cff7DBEF12.0|r% Cooldown Recovery speed per |cff00EAFFIntelligence|r|cFFFFCC00\n\nDoes not affect Cloak or Blink|r',
    iconPath: 'btncontortionist.png',
  },
  {
    id: 'feed-a-piece-of-food-directly-to-your-ally-using-dimentional-magic',
    name: 'Feed a piece of food directly to your ally using dimentional magic.',
    category: 'unknown',
    description: '',
    tooltip: 'Feed a piece of food directly to your ally using dimentional magic.\nSelects a target with lowest hp in |cff6495ED600.0|r range.\n|cff6495ED5.0|r seconds cooldown.',
    iconPath: 'btntelefeedmeat.png',
    manaCost: 5,
    cooldown: 5,
    range: 600,
    duration: 0.03,
    hotkey: 'F',
    levels: {
            "1": {
                  "manaCost": 5,
                  "cooldown": 5,
                  "duration": 0.03,
                  "range": 600
            }
      },
  },
  {
    id: 'aml-abrf',
    name: 'AMl{:Abrf',
    category: 'unknown',
    description: '',
  },
  {
    id: 'amm-abrf',
    name: 'AMm!:Abrf',
    category: 'unknown',
    description: '',
  },
  {
    id: 'the-warrior-is-adept-at-tanking-and-smashing-enemies-he-gets-damage-reduction-and-his-attac-9d2014cf',
    name: 'The Warrior is adept at tanking and smashing enemies. He gets damage reduction and his attack can hit enemies around him,however he can\'t use track anymore. A pretty straight forward class. Can only choose 1 subClass!',
    category: 'unknown',
    description: '',
    tooltip: 'The Warrior is adept at tanking and smashing enemies. He gets damage reduction and his attack can hit enemies around him,however he can\'t use track anymore. A pretty straight forward class. |cffFF0202Can only choose 1 subClass!|r|cff7DBEF1\n\nDifficulty: |r|cff1FBF00Easy|r',
    iconPath: 'btntrollpredator.png',
    hotkey: 'Q',
  },
  {
    id: 'the-tracker-is-adept-at-chasing-and-tracking-enemies-he-got-a-nice-spell-kit-allowing-him-t-aaf2c11c',
    name: 'The Tracker is adept at chasing and tracking enemies. He got a nice spell kit allowing him to track down enemy troll. Can only choose 1 subClass!',
    category: 'unknown',
    description: '',
    tooltip: 'The Tracker is adept at chasing and tracking enemies. He got a nice spell kit allowing him to track down enemy troll. |cffFF0202Can only choose 1 subClass!|r|cff7DBEF1\n\nDifficulty: |r|cffFE890DMedium|r',
    iconPath: 'btnicetroll.png',
    hotkey: 'W',
  },
  {
    id: 'the-juggernaut-is-the-best-fighting-class-in-the-game-he-is-big-he-is-fast-and-he-hit-really-hard',
    name: 'The Juggernaut is the best fighting class in the game, he is big, he is fast and he hit really hard.',
    category: 'unknown',
    description: '',
    tooltip: 'The Juggernaut is the best fighting class in the game, he is big, he is fast and he hit really hard.|cff7DBEF1\n\nDifficulty: |r|cff1FBF00Easy|r',
    iconPath: 'btntrollpredator.png',
    hotkey: 'E',
  },
  {
    id: 'the-elementalist-is-adept-at-controlling-the-elements-allowing-him-to-cast-powerful-damage-8b4682ea',
    name: 'The Elementalist is adept at controlling the elements,allowing him to cast powerful damage dealing spells. Can only choose 1 subClass!',
    category: 'unknown',
    description: '',
    tooltip: 'The Elementalist is adept at controlling the elements,allowing him to cast powerful damage dealing spells. |cffFF0202Can only choose 1 subClass!|r|cff7DBEF1\n\nDifficulty: |r|cffFE890DMedium|r',
    iconPath: 'btnicetrollshaman.png',
    hotkey: 'Q',
  },
  {
    id: 'dreamwalker-has-control-over-dreams-both-his-and-his-enemies-he-can-consume-dreams-of-his-e-9fe58232',
    name: 'Dreamwalker has control over dreams, both his and his enemies. He can consume dreams of his enemiesstealing their health and energy.Can only choose 1 subClass!',
    category: 'unknown',
    description: '',
    tooltip: 'Dreamwalker has control over dreams, both his and his enemies. He can consume dreams of his enemiesstealing their health and energy.|cffFF0202Can only choose 1 subClass!|r|cff7DBEF1\n\nDifficulty: |r|cffFF0202Hard|r',
    iconPath: 'btnhypnotist.png',
    hotkey: 'W',
  },
  {
    id: 'the-dementia-master-spent-too-much-time-studying-dark-magic-and-trying-to-talk-with-being-f-bc39ffdf',
    name: 'The Dementia Master spent too much time studying dark magic and trying to talk with being from another world, he got alot of damage dealing spells.',
    category: 'unknown',
    description: '',
    tooltip: 'The Dementia Master spent too much time studying dark magic and trying to talk with being from another world, he got alot of damage dealing spells.|cff7DBEF1\n\nDifficulty: |r|cffFF0202Hard|r',
    iconPath: 'btndarktrollshadowpriest.png',
    hotkey: 'E',
  },
  {
    id: 'the-booster-is-adept-at-buffing-up-allies-with-magic-spells-he-doesn-t-have-any-healing-spe-cf4fbcdc',
    name: 'The Booster is adept at buffing up allies with magic spells. He doesn\'t have any healing spells,but he gets more offensive buffs. Can only choose 1 subClass!',
    category: 'unknown',
    description: '',
    tooltip: 'The Booster is adept at buffing up allies with magic spells. He doesn\'t have any healing spells,but he gets more offensive buffs. |cffFF0202Can only choose 1 subClass!|r|cff7DBEF1\n\nDifficulty: |r|cffFE890DMedium|r',
    iconPath: 'btnforesttrollshadowpriest.png',
    hotkey: 'Q',
  },
  {
    id: 'the-master-healer-is-adept-at-healing-allies-with-magic-spells-he-also-has-spells-allowing-feaca320',
    name: 'The Master Healer is adept at healing allies with magic spells. He also has spells allowing him to mix/restore his mana and heat. Can only choose 1 subClass!',
    category: 'unknown',
    description: '',
    tooltip: 'The Master Healer is adept at healing allies with magic spells. He also has spells allowing him to mix/restore his mana and heat. |cffFF0202Can only choose 1 subClass!|r|cff7DBEF1\n\nDifficulty: |r|cffFE890DMedium|r',
    iconPath: 'btnmasterhealer.png',
    hotkey: 'W',
  },
  {
    id: 'the-sage-has-reached-the-pinnacle-of-the-troll-shamanic-art-he-can-use-alot-of-different-bu-c8396f58',
    name: 'The Sage has reached the pinnacle of the Troll Shamanic Art, he can use ALOT of different buffs and healing spells.',
    category: 'unknown',
    description: '',
    tooltip: 'The Sage has reached the pinnacle of the Troll Shamanic Art, he can use ALOT of different buffs and healing spells.|cff7DBEF1\n\nDifficulty: |r|cffFF0202Hard|r',
    iconPath: 'btnforesttrollshadowpriest.png',
    hotkey: 'E',
  },
  {
    id: 'the-druid-is-focused-on-using-nature-and-his-pet-s-to-support-his-team-and-turn-the-battle-172893d3',
    name: 'The Druid is focused on using nature and his pet\'s to support his team and turn the battle in his favor.Can only choose 1 subClass!',
    category: 'unknown',
    description: '',
    tooltip: 'The Druid is focused on using nature and his pet\'s to support his team and turn the battle in his favor.|cffFF0202Can only choose 1 subClass!|r|cff7DBEF1\n\nDifficulty: |r|cffFE890DMedium|r',
    iconPath: 'btndruidoftheclawforesttrolliconv1.png',
    hotkey: 'W',
  },
  {
    id: 'rogue-has-developed-formidable-combat-skills-as-well-as-adapted-his-thief-s-skills-to-help-e313ff1a',
    name: 'Rogue has developed formidable combat skills as well as adapted his thief\'s skills to help him in combat. Rogue is adept at physical combat and maneuvering.Can only choose 1 subClass!',
    category: 'unknown',
    description: '',
    tooltip: 'Rogue has developed formidable combat skills as well as adapted his thief\'s skills to help him in combat. Rogue is adept at physical combat and maneuvering.|cffFF0202Can only choose 1 subClass!|r|cff7DBEF1\n\nDifficulty: |r|cff1FBF00Easy|r',
    iconPath: 'btndarktroll.png',
    hotkey: 'Q',
  },
  {
    id: 'when-a-thief-decides-that-the-best-way-to-steal-is-by-using-magic-he-becomes-a-contortionis-4b4e3a23',
    name: 'When a thief decides that the best way to steal is by using magic, he becomes a Contortionist. The Contortionist is adept at evading enemies through magic spells. Can only choose 1 subClass!',
    category: 'unknown',
    description: '',
    tooltip: 'When a thief decides that the best way to steal is by using magic, he becomes a Contortionist. The Contortionist is adept at evading enemies through magic spells. |cffFF0202Can only choose 1 subClass!|r|cff7DBEF1\n\nDifficulty: |r|cffFE890DMedium|r',
    iconPath: 'btncontortionist.png',
    hotkey: 'W',
  },
  {
    id: 'when-a-thief-decides-that-the-best-way-to-steal-is-by-using-magic-he-becomes-a-telethief-te-8ed148aa',
    name: 'When a thief decides that the best way to steal is by using magic, he becomes a TeleThief. TeleThief has dimentional magic, providing combat utility to his thief abilities  Can only choose 1 subClass!',
    category: 'unknown',
    description: '',
    tooltip: 'When a thief decides that the best way to steal is by using magic, he becomes a TeleThief. TeleThief has dimentional magic, providing combat utility to his thief abilities  |cffFF0202Can only choose 1 subClass!|r|cff7DBEF1\n\nDifficulty: |r|cffFE890DMedium|r',
    iconPath: 'btncontortionist.png',
    hotkey: 'W',
  },
  {
    id: 'the-herb-master-tele-gatherers-can-mix-herbs-wherever-they-go-he-can-learn-tele-gathering-a-483733e0',
    name: 'The Herb Master Tele-Gatherers can mix herbs wherever they go. He can learn Tele-Gathering,a spell allowing him to teleport items picked up to a fire. Can tele-gather herbs. Can only choose 1 subClass!',
    category: 'unknown',
    description: '',
    tooltip: 'The Herb Master Tele-Gatherers can mix herbs wherever they go. He can learn Tele-Gathering,a spell allowing him to teleport items picked up to a fire. Can tele-gather herbs. |cffFF0202Can only choose 1 subClass!|r|cff7DBEF1\n\nDifficulty: |r|cffFE890DMedium|r',
    iconPath: 'btnicetrollshadowpriest.png',
    hotkey: 'Q',
  },
  {
    id: 'the-radar-is-adept-at-locating-and-gathering-items-he-got-an-improved-item-radar-and-he-can-bb1bba51',
    name: 'The Radar is adept at locating and gathering items, he got an improved Item Radar and he can learn Tele-Gathering,a spell allowing him to teleport items picked up to a fire. Cannot tele-gather herbs. Can only choose 1 subClass!',
    category: 'unknown',
    description: '',
    tooltip: 'The Radar is adept at locating and gathering items, he got an improved Item Radar and he can learn Tele-Gathering,a spell allowing him to teleport items picked up to a fire. Cannot tele-gather herbs. |cffFF0202Can only choose 1 subClass!|r|cff7DBEF1\n\nDifficulty: |r|cffFE890DMedium|r',
    iconPath: 'btnterrortroll.png',
    hotkey: 'W',
  },
  {
    id: 'the-alchemist-has-discovered-the-secret-of-the-philosopher-s-stone-which-allows-him-to-conj-f7447318',
    name: 'The Alchemist has discovered the secret of the Philosopher\'s Stone which allows him to conjure potion effects. Can only choose 1 subClass!',
    category: 'unknown',
    description: '',
    tooltip: 'The Alchemist has discovered the secret of the Philosopher\'s Stone which allows him to conjure potion effects. |cffFF0202Can only choose 1 subClass!|r|cff7DBEF1\n\nDifficulty: |r|cffFE890DMedium|r',
    iconPath: 'btnalchemist.png',
    hotkey: 'R',
  },
  {
    id: 'the-omni-gatherer-got-all-the-gatherer-abilities-possible-he-can-also-warp-items-around-him-17674261',
    name: 'The Omni Gatherer got all the gatherer abilities possible, he can also warp items around him when he gets lazy.',
    category: 'unknown',
    description: '',
    tooltip: 'The Omni Gatherer got all the gatherer abilities possible, he can also warp items around him when he gets lazy.|cff7DBEF1\n\nDifficulty: |r|cff1FBF00Easy|r',
    iconPath: 'btnterrortroll.png',
    hotkey: 'E',
  },
  {
    id: 'unload-items',
    name: 'Unload Items',
    category: 'unknown',
    description: '',
    tooltip: 'Unloads each spot in the bush to the corresponding slot of the target. (Example: Slot 1 unloads to slot 1, ect)',
    iconPath: 'btnundeadunload.png',
    cooldown: 2,
    range: 300,
    hotkey: 'D',
    targetsAllowed: 'hero,nonhero',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 2,
                  "range": 300
            }
      },
  },
  {
    id: 'strenght-4',
    name: 'Strenght + 4',
    category: 'unknown',
    description: '',
  },
  {
    id: 'bears-tenacity',
    name: 'Bears Tenacity',
    category: 'unknown',
    description: '',
    tooltip: 'Causes your troll to go into a panic, making him move |cffFE890D30%|r faster, but take |cffFF020210%|r extra damage.|n Lasts |cff7DBEF12|r seconds, has |cff7DBEF115|r seconds cooldown.|cFFFFFFC9Tip: Use this as often as possible to maximize efficiency.|r',
    range: 99999,
    duration: 1,
    hotkey: 'N',
    targetsAllowed: 'ground,friend,hero,nonhero,enemies',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 1,
                  "range": 99999
            },
            "2": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 1,
                  "range": 99999
            },
            "3": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 1,
                  "range": 99999
            },
            "4": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 1,
                  "range": 99999
            },
            "5": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 1,
                  "range": 99999
            }
      },
  },
  {
    id: 'health-rejuv',
    name: 'Health Rejuv',
    category: 'unknown',
    description: '',
    iconPath: 'btnreplenishhealth.png',
    range: 99999,
    duration: 15,
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 15,
                  "range": 99999
            }
      },
  },
  {
    id: 'mana-rejuv',
    name: 'Mana Rejuv',
    category: 'unknown',
    description: '',
    iconPath: 'btnreplenishmana.png',
    range: 99999,
    duration: 15,
    targetsAllowed: 'hero',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 15,
                  "range": 99999
            }
      },
  },
  {
    id: 'ice-veil',
    name: 'Ice Veil',
    category: 'unknown',
    description: '',
    range: 99999,
    duration: 2,
    areaOfEffect: 1,
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 2,
                  "range": 99999,
                  "areaOfEffect": 1
            }
      },
  },
  {
    id: 'hydra-claw-poison',
    name: 'Hydra Claw Poison',
    category: 'unknown',
    description: '',
    iconPath: 'btnimprovedstrengthofthewild.png',
    duration: 7,
    levels: {
            "1": {
                  "duration": 7
            }
      },
  },
  {
    id: 'horn-of-mammoth-spellbook',
    name: 'Horn of Mammoth SpellBook',
    category: 'unknown',
    description: '',
  },
  {
    id: 'troll-protector-aura',
    name: 'Troll Protector Aura',
    category: 'unknown',
    description: '',
    tooltip: 'Provides |cff1FBF002.5|r bonus armor and |cff1FBF0015%|r magic resistance to allied trolls around you.',
    iconPath: 'pasbtndevotion.png',
    targetsAllowed: 'air,allies,friend,ground,hero,invulnerable,self,vulnerable',
  },
  {
    id: 'amm-acss',
    name: 'AMm{:ACss',
    category: 'unknown',
    description: '',
    range: 99999,
    duration: 30,
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 30,
                  "range": 99999
            }
      },
  },
  {
    id: 'pin',
    name: 'Pin',
    category: 'unknown',
    description: '',
    cooldown: 45,
    range: 200,
    duration: 8,
    targetsAllowed: 'enemies,ground,neutral,organic,hero,nonhero',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 20,
                  "duration": 8,
                  "range": 300
            }
      },
  },
  {
    id: 'healing-salve',
    name: 'Healing Salve',
    category: 'unknown',
    description: '',
    iconPath: 'btnbronzebowlfullgreen.png',
    range: 600,
    targetsAllowed: 'friend,ground,hero,invulnerable,organic,self,vulnerable',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "range": 600
            }
      },
  },
  {
    id: 'disco-s-pf',
    name: 'Disco\'s PF',
    category: 'unknown',
    description: '',
    tooltip: 'Throws Fire at nearby enemies',
    cooldown: 1.5,
    duration: 1,
    areaOfEffect: 500,
    levels: {
            "1": {
                  "cooldown": 1.5,
                  "duration": 1,
                  "areaOfEffect": 500
            }
      },
  },
  {
    id: 'perm-immolation',
    name: 'Perm Immolation',
    category: 'unknown',
    description: '',
    areaOfEffect: 400,
    levels: {
            "1": {
                  "areaOfEffect": 400
            }
      },
  },
  {
    id: 'firepinion-movespeed',
    name: 'FirePinion Movespeed',
    category: 'unknown',
    description: '',
  },
  {
    id: 'venom-fang',
    name: 'Venom Fang',
    category: 'unknown',
    description: '',
    duration: 4,
    targetsAllowed: 'enemies,ground,neutral,organic,hero,nonhero',
    levels: {
            "1": {
                  "duration": 4
            }
      },
  },
  {
    id: 'venom-fang-attack-bonus',
    name: 'Venom Fang attack bonus',
    category: 'unknown',
    description: '',
  },
  {
    id: 'wolfs-bloodlust-claws-bloodlust',
    name: 'WOLFS_BLOODLUST_CLAWS_BLOODLUST',
    category: 'unknown',
    description: '',
    tooltip: 'Increase a friendly unit attack speed by |cffFE890D20%|r and movement speed by |cffFE890D10%|r for {2} seconds. Has {3} seconds cooldown.',
    iconPath: 'btnbloodlust.png',
    range: 1000,
    hotkey: 'E',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 0,
                  "range": 1000
            }
      },
  },
  {
    id: 'murloc-poison',
    name: 'Murloc Poison',
    category: 'unknown',
    description: '',
    duration: 5,
    targetsAllowed: 'enemies,ground,neutral,organic,hero,nonhero',
    levels: {
            "1": {
                  "duration": 5
            }
      },
  },
  {
    id: 'boss-rewards',
    name: 'Boss Rewards',
    category: 'unknown',
    description: '',
    tooltip: 'You can purchase items for merchant\'s |cff7DBEF1Favour|r. |cff7DBEF1Favour|r is displayed as merchant\'s mana.\nItem |cff7DBEF1Favour|r cost is equivalent to |cFFFFCC00gold|r cost.',
    iconPath: 'btnmedalionofcourage.png',
  },
  {
    id: 'binds-an-enemy-target-for-1-5-8-0-seconds-on-heroes-normal-units',
    name: 'Binds an enemy target for 1.5/8.0 seconds on heroes/normal units.',
    category: 'unknown',
    description: '',
    tooltip: 'Binds an enemy target for |cff7DBEF11.5|r/|cff7DBEF18.0|r seconds on heroes/normal units.',
    iconPath: 'atcensnare.png',
    cooldown: 10,
    range: 700,
    duration: 8,
    hotkey: 'R',
    targetsAllowed: 'air,enemies,ground,neutral,nonancient,organic',
    levels: {
            "1": {
                  "cooldown": 10,
                  "duration": 8,
                  "range": 700
            }
      },
  },
  {
    id: 'tower-item-dummy-cast-enemy',
    name: 'Tower Item Dummy Cast Enemy',
    category: 'unknown',
    description: '',
    tooltip: 'Causes the Omnitower to use the item in slot 1 on any enemy non troll unit within 575 range.\n|cffFFD700Can cast any charged items which can target units and following scrolls :\nScroll Of Fire Ball, Entangling Root, Stone Armor, Tsunami|r',
    iconPath: 'btnstag.png',
    cooldown: 3,
    range: 575,
    duration: 0.01,
    hotkey: 'S',
    targetsAllowed: 'nonhero,enemies,nonancient,organic',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 3,
                  "duration": 0.01,
                  "range": 575
            }
      },
  },
  {
    id: 'troll-targeting',
    name: 'Troll Targeting',
    category: 'unknown',
    description: '',
    tooltip: 'Causes the Omnitower to use the item in slot 1 on any enemy troll within 575 range.\n|cffFFD700Can cast any charged items which can target units and following scrolls :\nScroll Of Fire Ball, Entangling Root, Stone Armor, Tsunami|r',
    iconPath: 'atctrack.png',
    cooldown: 3,
    range: 575,
    duration: 0.01,
    hotkey: 'A',
    targetsAllowed: 'hero,enemies,nonancient,organic',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 3,
                  "duration": 0.01,
                  "range": 575
            }
      },
  },
  {
    id: 'f-special-herb-quick-make-page',
    name: '[F] - Special Herb Quick Make Page',
    category: 'unknown',
    description: '',
    tooltip: 'More Recipes here\n\nContains Quick Make spell for special herb recipes',
    iconPath: 'btnrightbook.png',
    cooldown: 0.25,
    hotkey: 'F',
    levels: {
            "1": {
                  "cooldown": 0.25
            },
            "2": {
                  "cooldown": 0.25
            },
            "3": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'c-melt-herbs',
    name: '[C] - Melt Herbs',
    category: 'unknown',
    description: '',
    tooltip: 'Melt down herbs to gain mana: \nAthelas: |cff7DBEF11|r mana.\nRiver Root/Stem: |cff7DBEF13|r mana.\nNative Herb: |cff7DBEF15|r mana.\nExotic Herb: |cff7DBEF17.5|r mana.\nSpirit of Wind/Water/Darknes: |cff7DBEF16|r mana.\nLesser Essence: |cff7DBEF110|r mana.\nGreater Essence: |cff7DBEF115|r mana.',
    iconPath: 'btnunstableconcoction.png',
    cooldown: 0.25,
    hotkey: 'C',
    levels: {
            "1": {
                  "cooldown": 0.25
            },
            "2": {
                  "cooldown": 0.25
            },
            "3": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'f-armor-quick-make-page',
    name: '[F] - Armor Quick Make Page',
    category: 'unknown',
    description: '',
    tooltip: 'More Recipes here\n\nContains Quick Make spell for Armor items recipes',
    iconPath: 'btnrightbook.png',
    cooldown: 0.25,
    hotkey: 'F',
    levels: {
            "1": {
                  "cooldown": 0.25
            },
            "2": {
                  "cooldown": 0.25
            },
            "3": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'c-more-forge-quick-make-page',
    name: '[C] - More Forge Quick Make Page',
    category: 'unknown',
    description: '',
    tooltip: 'More Recipes here\n\nContains Quick Make spell for Shield and ensnare trap recipes',
    iconPath: 'btnrightbook.png',
    cooldown: 0.25,
    hotkey: 'C',
    levels: {
            "1": {
                  "cooldown": 0.25
            },
            "2": {
                  "cooldown": 0.25
            },
            "3": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'c-more-witch-doctors-hut-quick-make-page',
    name: '[C] - More Witch Doctors Hut Quick Make Page',
    category: 'unknown',
    description: '',
    tooltip: 'More Recipes here\n\nContains Quick Make spell for more scrolls, spirit ward, living clay and magic seeds recipes',
    iconPath: 'btnrightbook.png',
    cooldown: 0.25,
    hotkey: 'C',
    levels: {
            "1": {
                  "cooldown": 0.25
            },
            "2": {
                  "cooldown": 0.25
            },
            "3": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'f-more-workshop-quick-make-page',
    name: '[F] - More Workshop Quick Make Page',
    category: 'unknown',
    description: '',
    tooltip: 'More Recipes here\n\nContains Quick Make spell for Smoke/Fire Bomb, Dark Thistles, EMP, and Transport ship',
    iconPath: 'btnrightbook.png',
    cooldown: 0.25,
    hotkey: 'F',
    levels: {
            "1": {
                  "cooldown": 0.25
            },
            "2": {
                  "cooldown": 0.25
            },
            "3": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'f-more-armory-quick-make-page',
    name: '[F] - More Armory Quick Make Page',
    category: 'unknown',
    description: '',
    tooltip: 'More Recipes here\n\nContains Quick Make spell for Anabolic Boots and Troll Protector',
    iconPath: 'btnrightbook.png',
    cooldown: 0.25,
    hotkey: 'F',
    levels: {
            "1": {
                  "cooldown": 0.25
            },
            "2": {
                  "cooldown": 0.25
            },
            "3": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'b-buildings-craft-recipe',
    name: '[B] - Buildings Craft Recipe',
    category: 'unknown',
    description: '',
    tooltip: 'Look here to construct buildings, this page contains all buildings recipes, type -crafting for explanation about crafting.',
    iconPath: 'btnbasicstruct.png',
    cooldown: 0.25,
    hotkey: 'B',
    levels: {
            "1": {
                  "cooldown": 0.25
            },
            "2": {
                  "cooldown": 0.25
            },
            "3": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'x07i-aall',
    name: 'x07i:Aall',
    category: 'unknown',
    description: '',
  },
  {
    id: 'subclass-menu',
    name: 'Subclass Menu',
    category: 'unknown',
    description: '',
    tooltip: 'Choose a subclass.',
    iconPath: 'btnstatup.png',
    hotkey: 'T',
    levels: {
            "1": {
                  "cooldown": 0
            }
      },
  },
  {
    id: 'melt-a-river-stem',
    name: 'Melt a River Stem',
    category: 'unknown',
    description: '',
    tooltip: 'Find and melt a River Stem in |cff7DBEF1900|r radius, granting |cff7DBEF13|r mana to Mixing Pot.',
    iconPath: 'btndotadepttraining.png',
    cooldown: 0.5,
    hotkey: 'Q',
    levels: {
            "1": {
                  "cooldown": 0.5
            }
      },
  },
  {
    id: 'teleport-mirror',
    name: 'Teleport Mirror',
    category: 'unknown',
    description: '',
    tooltip: 'Teleports a friendly unit around the Teleportation Beacon 180Â°. Can be upgraded by putting a Magic into the teleport beacon.',
    iconPath: 'btnwispsplode.png',
    cooldown: 2.5,
    range: 700,
    hotkey: 'Q',
    targetsAllowed: 'friend,organic,ground',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 2.5,
                  "range": 700
            },
            "2": {
                  "manaCost": 0,
                  "cooldown": 2.5,
                  "range": 1100
            }
      },
  }
];

