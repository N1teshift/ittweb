import type { AbilityData } from './types';

export const BUILDING_ABILITIES: AbilityData[] = [
  {
    id: 'pack-up',
    name: 'Pack Up',
    category: 'building',
    description: '',
    tooltip: 'Packs the building back into a kit.',
    iconPath: 'btnpackbeast.png',
    cooldown: 1,
    areaOfEffect: 0,
    hotkey: 'P',
    targetsAllowed: 'self',
    castTime: 'Abilities\\Spells\\Human\\MassTeleport\\MassTeleportTarget.mdx',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 1,
                  "duration": 0,
                  "areaOfEffect": 0
            }
      },
  },
  {
    id: 'mud-hut-resilience',
    name: 'Mud Hut Resilience',
    category: 'building',
    description: '',
    iconPath: 'pasbtndevotion.png',
    targetsAllowed: 'air,friend,ground,hero,invulnerable,self,vulnerable',
  },
  {
    id: 'quick-make-healing-potion',
    name: 'Quick make Healing Potion',
    category: 'building',
    description: '',
    tooltip: 'Spend mana to craft |cff1FBF00a Healing Potion.|rA dilute potion made from Athelas Seed. Instantly restores |cff1FBF00100|r Health point to a target ally.\n\n|cff7DBEF14|r mana required to craft.|cFFFFCC00\nMixing pot gains mana from melting down herbs.|r',
    iconPath: 'btnlesserrejuvpotion.png',
    cooldown: 0.25,
    hotkey: 'Q',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-mana-potion',
    name: 'Quick make Mana Potion',
    category: 'building',
    description: '',
    tooltip: 'Spend mana to craft a Mana Potion, restore 80 mana to the consumer :\n\n|cff7DBEF13|r mana required to craft.|cFFFFCC00\nMixing pot gains mana from melting down herbs.|r',
    iconPath: 'btnpotionbluesmall.png',
    cooldown: 0.25,
    hotkey: 'W',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-disease-potion',
    name: 'Quick make Disease Potion',
    category: 'building',
    description: '',
    tooltip: 'Spend mana to craft a Disease Potion. Biological warfare! Throw at an enemy to give him  a disease. Dealing |cffFF02025|r damage per second. Last |cff7DBEF125|r seconds.\n\n|cff7DBEF15|r mana required to craft.|cFFFFCC00\nMixing pot gains mana from melting down herbs.|r',
    iconPath: 'btnpotiongreen.png',
    cooldown: 0.25,
    hotkey: 'E',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-drunks-potion',
    name: 'Quick make Drunks Potion',
    category: 'building',
    description: '',
    tooltip: 'Spend mana to craft a |cffFE890DDrunk Potion. |rThrow this at an enemy to get them drunk, target is silenced, movement speed slowed by |cffFE890D25%|r, attack speed by |cffFE890D10%|r and has |cffFE890D50%|r chance to miss. Lasts |cff7DBEF18|r (|cff7DBEF113|r) seconds, has |cff7DBEF120|r seconds cooldown.\n\n|cff7DBEF110|r mana required to craft.|cFFFFCC00\nMixing pot gains mana from melting down herbs.|r',
    iconPath: 'btnlesserinvulneralbility.png',
    cooldown: 0.25,
    hotkey: 'R',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-spirit-of-wind',
    name: 'Quick make Spirit Of Wind',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a Represents the pure essence of wind. Used in crafting certain stuff. :\n\n2x |cff949596River Stem|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnorboflightning.png',
    cooldown: 0.25,
    hotkey: 'A',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-spirit-of-water',
    name: 'Quick make Spirit Of Water',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a Represents the pure essence of water. Used in crafting certain stuff. :\n\n2x |cff1BE5B8River Root|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnorboffrost.png',
    cooldown: 0.25,
    hotkey: 'S',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-spirit-of-darkness',
    name: 'Quick make Spirit Of Darkness',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a Spirit Of Darkness, dark essence used to create ominous artefact :\n\n1x |cff1BE5B8River Root|r + 1x |cff949596River Stem|r + 2x |cff1FBF00Athelas Seed|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnorbofdarkness.png',
    cooldown: 0.25,
    hotkey: 'D',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-lesser-essence',
    name: 'Quick make Lesser Essence',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a A lesser essence made from native herbs. Used in crafting. :\n\n2x |cffFFFC00Native Herb|r',
    iconPath: 'btnorangeessence.png',
    cooldown: 0.25,
    hotkey: 'Z',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-greater-essence',
    name: 'Quick make Greater Essence',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a A greater essence made from exotic herbs from neighbouring islands. Used in crafting. :\n\n2x |cffBE00FEExotic herb|r',
    iconPath: 'btnpurpleessence.png',
    cooldown: 0.25,
    hotkey: 'X',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-acid-bomb',
    name: 'Quick make Acid Bomb',
    category: 'building',
    description: '',
    tooltip: 'Spend mana to craft an |cffBE00FEAcid Bomb. |rA bomb with nasty liquid from an unknown origin. Throw at a target to reduce their amor by |cffFF02028|r, has a small radius effect. Lasts |cff7DBEF150|r seconds, has |cff7DBEF110|r seconds cooldown.\n\n|cff7DBEF125|r mana required to craft.|cFFFFCC00\nMixing pot gains mana from melting down herbs.|r',
    iconPath: 'btnacidbomb.png',
    cooldown: 0.25,
    hotkey: 'Q',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-bee-hive',
    name: 'Quick make Bee Hive',
    category: 'building',
    description: '',
    tooltip: 'Spend mana to craft a |cffFE890DBee Hive. |rCreates a Bee Hive that releases bees to sting enemies. If the bee hive is destroyed, bees stop spawning. Each bee deal 1 magic damage and last for |cff7DBEF112|r seconds, the hive spawn 1 bee every seconds. Lasts |cff7DBEF120|r seconds, has |cff7DBEF160|r seconds cooldown.\n\n|cff7DBEF16|r mana required to craft.|cFFFFCC00\nMixing pot gains mana from melting down herbs.|r',
    iconPath: 'btncrate.png',
    cooldown: 0.25,
    hotkey: 'W',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-anabolic-potion',
    name: 'Quick make Anabolic Potion',
    category: 'building',
    description: '',
    tooltip: 'Spend mana to craft an |cffFE890DAnabolic Potion. |rBoost the consumer movement speed to the max. Lasts |cff7DBEF110|r seconds, has |cff7DBEF135|r seconds cooldown.\n\n|cff7DBEF16|r mana required to craft.|cFFFFCC00\nMixing pot gains mana from melting down herbs.|r',
    iconPath: 'btnpotionred.png',
    cooldown: 0.25,
    hotkey: 'E',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-fervor-potion',
    name: 'Quick make Fervor Potion',
    category: 'building',
    description: '',
    tooltip: 'Spend mana to craft Increase the consumer attack speed by |cffFE890D20%|r and armor by |cff1FBF005|r. This potion put alot of stress on the consumer body. Lasts |cff7DBEF120|r seconds, has |cff7DBEF15|r seconds cooldown.\n\n|cff7DBEF110|r mana required to craft.|cFFFFCC00\nMixing pot gains mana from melting down herbs.|r',
    iconPath: 'btngreaterinvulneralbility.png',
    cooldown: 0.25,
    hotkey: 'R',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-nether-potion',
    name: 'Quick make Nether Potion',
    category: 'building',
    description: '',
    tooltip: 'Spend mana to craft a |cffBE00FENether Potion. |rBanish a target into the ethereal realm, target takes increased magical damage, cannot attack but can cast spells and use items. Lasts |cff7DBEF115|r (|cff7DBEF140|r) seconds, has |cff7DBEF120|r seconds cooldown.\n\n|cff7DBEF115|r mana required to craft.|cFFFFCC00\nMixing pot gains mana from melting down herbs.|r',
    iconPath: 'btnpotionofomniscience.png',
    cooldown: 0.25,
    hotkey: 'A',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-cure-all',
    name: 'Quick make Cure All',
    category: 'building',
    description: '',
    tooltip: 'Spend mana to craft a Cure All, remove positive/negative buff & effect on the target ally\n\n|cff7DBEF13|r mana required to craft.|cFFFFCC00\nMixing pot gains mana from melting down herbs.|r',
    iconPath: 'btnlesserclaritypotion.png',
    cooldown: 0.25,
    hotkey: 'S',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-anti-magic-potion',
    name: 'Quick make Anti-Magic Potion',
    category: 'building',
    description: '',
    tooltip: 'Spend mana to craft an |cff1FBF00Anti-Magic Potion. |rCast an Anti-Magic shield on target, blocking |cff1FBF00200|r magic damage. Lasts |cff7DBEF125|r seconds, has |cff7DBEF11|r seconds cooldown.\n\n|cff7DBEF13|r mana required to craft.|cFFFFCC00\nMixing pot gains mana from melting down herbs.|r',
    iconPath: 'btnpotionofclarity.png',
    cooldown: 0.25,
    hotkey: 'D',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-battle-gloves',
    name: 'Quick make Battle Gloves',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a pair of |cffBE00FEBattle Gloves. |rIncreases wearer\'s attack speed by |cffFE890D<AM3b,DataA1,%>%|r, armor by |cff1FBF00<AM2z,DataA1>|r and all stats by |cff1FBF004|r and a critical strike for |cffFF02021x6|r damage on a |cff7DBEF16|r second cooldown. Attacking enemies reduces the cooldown of the critical strike by |cff7DBEF11|r second.\n\n1x |cffFF0202Steel Gloves|r + 1x |cffDCB9EBSpirit of Wind|r + 1x |cff00EAFFSpirit of Water|r + 1x |cff7DBEF1Mana Crystal|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnimprovedunholystrength.png',
    cooldown: 0.25,
    hotkey: 'Q',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-robe-of-the-magi',
    name: 'Quick make Robe of the Magi',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get |cffBE00FERobe of the Magi. \n|rA robe belonging to a great magi of old\n\nIntelligence +|cff1FBF0010|r\nArmor +|cff1FBF003|r\n\n1x |cffFE890DBone Coat|r + 1x |cffDCB9EBSpirit of Wind|r + 1x |cff00EAFFSpirit of Water|r + 1x |cff7DBEF1Mana Crystal|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnrobeofthemagi.png',
    cooldown: 0.25,
    hotkey: 'W',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-battle-axe',
    name: 'Quick make Battle Axe',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a Battle Axe. A two handed axe, increase damage by 14, attack speed by|cff6495ED 20%|r\n\n1x |cffBE00FEGreater essence|r + 1x  |cffFF0202Steel Axe|r 1x |cffDCB9EBSpirit of Wind|r + 1x |cff00EAFFSpirit of Water|r + 1x |cff7DBEF1Mana Crystal|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnorcmeleeupthree.png',
    cooldown: 0.25,
    hotkey: 'E',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-battle-shield',
    name: 'Quick make Battle Shield',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get A Battle Shield, reduce damage taken by |cffFE890D10|r, gives |cff1FBF007|r armor. Has a bash ability, silences and disarms the target. Lasts |cff7DBEF12|r seconds, has |cff7DBEF115|r seconds cooldown.\n\n1x |cffFE890DBone Shield|r + 1x |cffFE890DElk Hide|r + 1x |cffFF0202Steel Ingot|r + 1x |cffDCB9EBSpirit of Wind|r + 1x |cff00EAFFSpirit of Water|r + 1x |cff7DBEF1Mana Crystal|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnarcanitearmor.png',
    cooldown: 0.25,
    hotkey: 'R',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-boots-of-wolf-s-stamina',
    name: 'Quick make Boots of Wolf\'s Stamina',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get |cffBE00FEBoots of Wolf\'s Stamina. \n|rIncreases wearer\'s movement speed by |cffFE890D<AMdv,DataA1>|r intelligence by |cff00EAFF<AM6p,DataB1>|r, agility by |cff1FBF00<AMem,DataA1>|r armor by |cff1FBF00<AM2v,DataA1>|r and provides warmth.|nRemoves mana cost and extra damage taken penalty from panic.\n\n1x |cffFE890DWolf Skin Boots |r + 1x |cffFFFC00Lesser essence|r + 1x |cffDCB9EBSpirit of Wind|r + 1x |cff00EAFFSpirit of Water|r + 1x |cff7DBEF1Mana Crystal|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnbootsofwolfstamina.png',
    cooldown: 0.25,
    hotkey: 'S',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-claws-of-wolf-s-bloodlust',
    name: 'Quick make Claws of Wolf\'s Bloodlust',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get |cffBE00FEClaws of Wolf\'s Bloodlust. \n|rIncreases wearer\'s attack speed by |cffFE890D<AM3b,DataA1,%>%|r, damage by |cffFF0202<AIti,DataA1>|r, armor by |cff1FBF00<AM2w,DataA1>|r and agility by |cff1FBF00<AMel,DataA1>|r. |nFills wearer with insatiable bloodlust, granting permanent bloodlust buff.\n\n1x |cffFE890DWolf Skin Gloves |r +1x |cffFF0202Steel Ingot|r + 1x |cffBE00FEGreater essence|r 1x |cffDCB9EBSpirit of Wind|r + 1x |cff00EAFFSpirit of Water|r + 1x |cff7DBEF1Mana Crystal|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnwolfsbloodlustclaws.png',
    cooldown: 0.25,
    hotkey: 'A',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-coat-of-wolf-s-voracity',
    name: 'Quick make Coat of Wolf\'s Voracity',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get |cffBE00FECoat of Wolf\'s Voracity. \n|rA coat imbued with voracity of a Dire Wolf. Allows wearer to consume raw meat, and to consume corpses instantly.  |cFFFFCC00\nUse this item to consume raw meat instantly restoring|r|cff1FBF0050.0|r|cFFFFCC00 health.|r\n+|cff1FBF00<AM2w,DataA1>|r Armor\n+|cff1FBF00<AIs6,DataC1>|r Strength\n+|cff1FBF00<AMem,DataA1>|r Agility\n\n1x |cffFE890DWolf Skin Coat |r 1x |cffBE00FESpirit of Darkness|r + 1x |cff7DBEF1Mana Crystal|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnchestofwolfvoracity.png',
    cooldown: 0.25,
    hotkey: 'S',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-boots-of-bear-s-tenacity',
    name: 'Quick make Boots of Bear\'s Tenacity',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get |cffFF0202Boots of Bear\'s Tenacity. \n|rIncreases wearer\'s movement speed by |cffFE890D<AMds,DataA1>|r intelligence by |cff00EAFF<AIi6,DataB1>|r, strength by |cffFE890D<AMep,DataC1>|r armor by |cff1FBF00<AM2z,DataA1>|r and provides warmth.\nGrants wearer tenacity of a bear, no snare will be able to stop you. \nWhenever you are ensnared you gain |cffFFFC002.5|rs decaying movement speed debuff instead of being immobilized\n\n1x |cffFE890DBear Skin Boots |r +  1x |cffFFFC00Lesser essence|r + 1x |cffDCB9EBSpirit of Wind|r + 1x |cff00EAFFSpirit of Water|r + 1x |cff7DBEF1Mana Crystal|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnbootsofbeartenacity.png',
    cooldown: 0.25,
    hotkey: 'F',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-paws-of-bear-s-greed',
    name: 'Quick make Paws of Bear\'s Greed',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get |cffFE890DPaws of Bear\'s Greed. \n|rIncreases wearer\'s attack speed by |cffFE890D<AM39,DataA1,%>%|r, damage by |cffFF0202<AIth,DataA1>|r, armor by |cff1FBF00<AM2z,DataA1>|r and strength by |cff1FBF00<AMep,DataC1>|r. |nBears greed for honey is so strong it allows you to find it where there\'s none.\nUse this item on a hidden stash to find a honeycomb.\n\n1x |cffFE890DBear Skin Gloves |r + |cffFF0202Iron Ingot|r 1x |cffFFFC00Lesser essence|r + 1x |cffDCB9EBSpirit of Wind|r + 1x |cff00EAFFSpirit of Water|r + 1x |cff7DBEF1Mana Crystal|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnbearglovesofgreed.png',
    cooldown: 0.25,
    hotkey: 'X',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-coat-of-bear-s-terrifying-presence',
    name: 'Quick make Coat of Bear\'s Terrifying Presence',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get |cffFF0202Coat of Bear\'s Terrifying Presence. \n|rA coat made out of a hide of ancient bear.|nAnimals will freeze in your terrifying presence.|nEnemies shaken with fear suffer 20% damage penalty.|n+|cff1FBF00<AMer,DataC1>|r Strength.|n+|cff1FBF00<AM2x,DataA1>|r Armor.\n\n1x |cffFE890DBear Skin Coat |r + |cffFF0202Steel Ingot|r + 1x |cffBE00FESpirit of Darkness|r + 1x |cffDCB9EBSpirit of Wind|r + 1x |cff00EAFFSpirit of Water|r + 1x |cff7DBEF1Mana Crystal|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btncoatofbearpresence.png',
    cooldown: 0.25,
    hotkey: 'C',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-troll-protector',
    name: 'Quick make Troll Protector',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get |cff00EAFFTroll Protector. \n|rProvides |cff1FBF002.5|r bonus armor and |cff1FBF0015%|r magic resistance to allied trolls around you.\n\n1x |cffFE890DIron Shield |r+ 1x |cffFE890DElk Hide|r + 1x |cff7DBEF1Mana Crystal|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btntrollprotector.png',
    cooldown: 0.25,
    hotkey: 'W',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-anabolic-boots',
    name: 'Quick make Anabolic Boots',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a pair of |cffBE00FEAnabolic Boots. |rIncreases wearer\'s movement speed by |cffFE890D<AMdw,DataA1>|r, armor by |cff1FBF00<AM2z,DataA1>|r and all stats by |cff1FBF004|r. Also gives |cffBE00FE10%|r chance to dodge an attack.\n\n1x |cffFE890DBone Boots|r + 1x |cffFFFC00Lesser essence|r + 1x |cffDCB9EBSpirit of Wind|r + 1x |cff00EAFFSpirit of Water|r + 1x |cff7DBEF1Mana Crystal|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnwirtsotherleg.png',
    cooldown: 0.25,
    hotkey: 'Q',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-conducting-rod',
    name: 'Quick make Conducting Rod',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get |cffBE00FEConducting Rod. \n|rSteel rod infused with magic for better mana conductivity.\nAllows wielder to ignore basic troll magic resistance and increases all spell damage done to animals by 33%.\n+|cff1FBF0010 |rIntelligence\n+|cff1FBF003 |rArmor\n\n1x |cffFE890DIron Staff |r + 1x |cffFF0202Steel Ingot|r + 1x |cffE45AAFNether Potion|r + 1x |cffDCB9EBSpirit of Wind|r + 1x |cff00EAFFSpirit of Water|r + 1x |cff7DBEF1Mana Crystal|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnadvancedstrengthofthemoon.png',
    cooldown: 0.25,
    hotkey: 'E',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-battle-armor',
    name: 'Quick make Battle Armor',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get A coat embedded with a protective mana layer. Increase all stats by |cff1FBF004|r, Armor by |cff1FBF00<AM2{,DataA1>|r and provides |cff00EAFF30%|r magic resistance. Can cast Anti-Magic on nearby allied heroes. Has |cff7DBEF175|r seconds cooldown.\n\n1x |cffFE890DBone Coat|r + 1x |cffDCB9EBSpirit of Wind|r + 1x |cff00EAFFSpirit of Water|r + 1x |cff7DBEF1Mana Crystal|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnnagaarmorup2.png',
    cooldown: 0.25,
    hotkey: 'R',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-magefist',
    name: 'Quick make Magefist',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get |cffBE00FEMagefist. \n|rCrafted by the most skilled sorcerers of Azeroth, Magefist radiates with an ethereal glow, resonating with the potent energies of magic.\nGrants |cff00EAFFArcane Might|r: \n+|cff1FBF001|r Strength per |cff00EAFF3 Intelligence|r\n+|cffFE890D<AM3b,DataA1,%>%|r Attack speed\n+|cff1FBF00<AM2w,DataA1>|r Armor\n+|cff1FBF00<AM6p,DataB1>|r Intelligence\n\n1x |cffFF0202Bone Gloves |r+ 1x |cffFF0202Steel Ingot|r + 1x |cffFFFC00Lesser essence|r + 1x |cffDCB9EBSpirit of Wind|r+ 1x |cff00EAFFSpirit of Water|r + 1x |cff7DBEF1Mana Crystal|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnspellsteal.png',
    cooldown: 0.25,
    hotkey: 'A',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-battle-staff',
    name: 'Quick make Battle Staff',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a |cffBE00FEBattle Staff. \n|rWood and steel unite in this fearsome weapon. Each end adorned with menacing skulls, it provides both defensive and spellcasting benefits.\n+|cff1FBF0014|r Attack damage\n+|cff1FBF004|r Armor\n+|cff1FBF0012|r Intelligence\n\n1x |cffFE890DIron Staff|r+ 1x |cffFF0202Steel Ingot|r + 2x |cffFFD700Bone|r + 1x |cffDCB9EBSpirit of Wind|r + 1x |cff00EAFFSpirit of Water|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnbattlestaff.png',
    cooldown: 0.25,
    hotkey: 'S',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-scroll-of-entangling-root',
    name: 'Quick make Scroll Of Entangling Root',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a |cff1FBF00Scroll of Entangling Root|r. Grants the unit the ability to cast Entangling Roots, locking the enemy in place for |cffFE890D2|r/|cffFE890D8|r seconds and dealing |cffFF02025|r damage per second. Has |cff7DBEF120|r seconds cooldown.|cffFFD700|nNote: Troll do not take damage and can still attack when affected by this spell.|r :\n\n1x |cff1FBF00Tinder|r + 1x |cff7DBEF1Mana Crystal|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnscrollofregenerationgreen.png',
    cooldown: 0.25,
    hotkey: 'Q',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-scroll-of-stone-armor',
    name: 'Quick make Scroll Of Stone Armor',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a |cffFE890DScroll of Stone Armor|r. Grants the unit the ability to Cast Stone armor which increases the target ally armor by |cff1FBF005|r and slows the attack speed of melee attackers by |cffFE890D15%|r for |cffFE890D2|r seconds. Lasts |cff7DBEF115|r seconds, has |cff7DBEF140|r seconds cooldown. :\n\n1x |cff949596Stone|r + 1x |cff7DBEF1Mana Crystal|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnscrolluber.png',
    cooldown: 0.25,
    hotkey: 'W',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-scroll-of-tsunami',
    name: 'Quick make Scroll Of Tsunami',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a |cffBE00FEScroll of Tsunami|r. Grants the unit the ability to cast Tsunami, sending a gigantic wave dealing |cffFF020235|r damage to units in a line. When casted at close range, it deals |cffFF020220|r extra damage to buildings and can instantly put out fires. Has |cff7DBEF115|r seconds cooldown. :\n\n1x |cff00EAFFSpirit of Water|r + 1x |cff7DBEF1Mana Crystal|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnsnazzyscrollpurple.png',
    cooldown: 0.25,
    hotkey: 'E',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-scroll-of-living-dead',
    name: 'Quick make Scroll Of Living Dead',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a |cffFFFC00Scroll of Living Dead|r. Grants the unit the ability to cast Living Dead which summons two skeletal bodyguard, each sketelon deal |cffFF02027|r magic damage per hit. Lasts |cff7DBEF115|r seconds, has |cff7DBEF135|r seconds cooldown. :\n\n1x |cffFFD700Bone|r + 1x |cff7DBEF1Mana Crystal|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnsnazzyscroll.png',
    cooldown: 0.25,
    hotkey: 'R',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-scroll-of-fireball',
    name: 'Quick make Scroll Of Fireball',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a |cffFF0202Scroll of Fire Ball|r. Grants the unit the ability to cast Fire Ball dealing |cffFF020260|r damage and stunning the target for |cffFE890D0.1|r/|cffFE890D1|r seconds. Has |cff7DBEF122|r seconds cooldown. :\n\n1x |cffFF0202Flint|r + 1x |cff7DBEF1Mana Crystal|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnscrollofhealing.png',
    cooldown: 0.25,
    hotkey: 'Q',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-scroll-of-cyclone',
    name: 'Quick make Scroll Of Cyclone',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a |cff00EAFFScroll of Cyclone|r. Grants the unit the ability to cast Cyclone which tosses an enemy unit in the air for |cffFE890D5|r/|cffFE890D10|r seconds. Has |cff7DBEF135|r seconds cooldown. :\n\n1x |cffDCB9EBSpirit of Wind|r + 1x |cff7DBEF1Mana Crystal|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnbansheemaster.png',
    cooldown: 0.25,
    hotkey: 'W',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-scroll-of-swiftness',
    name: 'Quick make Scroll Of Swiftness',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a |cffFE890DScroll of Haste|r. Grant the unit the ability to boost its allies movement speed to the maximum. Lasts |cff7DBEF17|r seconds, has |cff7DBEF135|r seconds cooldown. :\n\n1x |cffA46F33Elk Hide Boots|r + 1x |cff7DBEF1Mana Crystal|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnscrollofhaste.png',
    cooldown: 0.25,
    hotkey: 'E',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-cloak-of-flames',
    name: 'Quick make Cloak Of Flames',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a |cffFF0202Cloak Of Flames. |rProvides +|cff1FBF00<AM2v,DataA1>|r armor, +|cff1FBF003|r all stats and burns nearby enemies within melee range for |cffFF0202<AM3|,DataA1>|r damage per second.\n\n1x |cff00EAFFMagic|r + 1x |cffFE890DBone Coat|r + 1x |cffFF0202Flint|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btncloakofinferno.png',
    cooldown: 0.25,
    hotkey: 'A',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-cloak-of-frost',
    name: 'Quick make Cloak Of Frost',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a |cff00EAFFCloak Of Frost. |rProvides +|cff1FBF00<AM2v,DataA1>|r armor, +|cff1FBF003|r all stats and can be cast to emit |cff00EAFF5|r ice waves, each wave freezes nearby enemy units dealing |cffFF020216|r damage, and slowing their movement and attack speeds by |cffFE890D35%|r for |cff7DBEF12|r seconds. Each wave refresh the slow duration, the slow amount does not stack. Has |cff7DBEF135|r seconds cooldown.\n\n1x |cff00EAFFMagic|r + 1x |cffFE890DBone Coat|r + 1x |cff00EAFFSpirit of Water|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btncloakoffrost.png',
    cooldown: 0.25,
    hotkey: 'S',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-cloak-of-healing',
    name: 'Quick make Cloak Of Healing',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a |cff1FBF00Cloak Of Healing. |rProvides +|cff1FBF00<AM2v,DataA1>|r armor, +|cff1FBF003|r all stats and can be cast to restore all |cff1FBF00150|r health points to nearby allies over |cff7DBEF115|r seconds. Has |cff7DBEF160|r seconds cooldown.\n\n1x |cff00EAFFMagic|r + 1x |cffFE890DBone Coat|r + 1x |cff1FBF00Healing Potion|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btncloakofhealing.png',
    cooldown: 0.25,
    hotkey: 'D',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-cloak-of-mana',
    name: 'Quick make Cloak Of Mana',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a |cffBE00FECloak Of Mana. |rProvides +|cff1FBF00<AM2v,DataA1>|r armor, +|cff1FBF003|r all stats and can be cast to restore |cff00EAFF100|r mana points to nearby allies over |cff7DBEF115|r seconds. Has |cff7DBEF160|r seconds cooldown.\n\n1x |cff00EAFFMagic|r + 1x |cffFE890DBone Coat|r + 1x |cff00EAFFMana Potion|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btncloakofmana.png',
    cooldown: 0.25,
    hotkey: 'F',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-living-clay',
    name: 'Quick make Living Clay',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a Living Clay. A sentry ward that explodes on contact, has 3 charges :\n\n1x |cffFE890DClay Ball|r + 1x |cff7DBEF1Mana Crystal|r\n\nThe Mana Crystal is not consumed upon crafting.\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btngreensentryward.png',
    cooldown: 0.25,
    hotkey: 'R',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-magic-seed',
    name: 'Quick make Magic Seed',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a Magic Seed. Can grow a tree, has 2 charges :\n\n1x |cff1FBF00Stick|r + 1x |cff7DBEF1Mana Crystal|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnroot.png',
    cooldown: 0.25,
    hotkey: 'A',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-spirit-ward',
    name: 'Quick make Spirit Ward',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a Spirit Ward. Can be used to revive 1 allied troll :\n\n3x |cff7DBEF1Mana Crystal|r + 1x |cff1FBF00Stick|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnabsorbmagic.png',
    cooldown: 0.25,
    hotkey: 'S',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-poison',
    name: 'Quick make Poison',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a Poison salve. Can be used to craft poison spear :\n\n3x |cff1FBF00Mushroom|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnhealingsalve.png',
    cooldown: 0.25,
    hotkey: 'Z',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-venom-fang',
    name: 'Quick make Venom Fang',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get |cff00EAFFA Fang of the Elder Panther imbued with poison. \n+|cff1FBF004|r Damage. |cff00EAFF\nVenom|r:\nReplaces your attack with a deadly venom, dealing |cff1FBF00150.0|r% of premitigation damage as |cffBE00FEmagic|r damage over |cff6495ED3|r seconds.\nDoes 33% more damage to non-hero targets.|cffFF0202\nDoes not stack.|r|r:\n\n1x |cffFE890DPanther Fang|r 2x |cff1FBF00Poison|r 1x |cffDCB9EBSpirit of Wind|r 1x |cff00EAFFSpirit of Water|r 1x |cff7DBEF1Mana Crystal|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnpoisonfang.png',
    cooldown: 0.25,
    hotkey: 'X',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-necromancer-s-cloak',
    name: 'Quick make Necromancer\'s cloak',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a |cffBE00FENecromancer\'s cloak. |rProvides +|cff1FBF00<AM2v,DataA1>|r armor, +|cff1FBF003|r all stats and grants the power to command living dead, permanently raising two skeletal warriors. Cloak can be used to recall your minions. |cffFFFC00\n\nSkeletal bodyguards can be empowered by collecting 10 bones.|r\n\n1x |cff00EAFFMagic|r + 1x |cffFE890DBone Coat|r + 1x |cffFFFC00Scroll of Living Dead|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnskullshroudglowincreased.png',
    cooldown: 0.25,
    hotkey: 'S',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-ensnare-trap',
    name: 'Quick make Ensnare Trap',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get an Ensnare Trap. Deals few ranged damage, can net trolls & animals, good for killing hawk :\n\n1x |cff1FBF00Tinder|r + 1x |cffFFD700Bone|r + 1x |cff1FBF00Stick|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btncop.png',
    cooldown: 0.25,
    hotkey: 'Q',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-blow-gun',
    name: 'Quick make Blow Gun',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a BlowGun. Used for shooting small things. Can be loaded with thistles or bones. Drag and drops items on the blowgun to load, click and use on your own troll to unload : \n\n1x |cff1FBF00Stick|r + 1x |cffFE890DClay Ball|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnalleriaflute.png',
    cooldown: 0.25,
    hotkey: 'W',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-poison-thistles',
    name: 'Quick make Poison Thistles',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a Poison thistles. Creates a special type of blowgun ammo. Makes thistles poison even more potent :\n\n1x |cff1FBF00Thistles|r 1x |cff1FBF00Poison|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnpoisonquill.png',
    cooldown: 0.25,
    hotkey: 'E',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-magic-tree-seed',
    name: 'Quick make Magic Tree Seed',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get This seed will grow a Magic Palm Tree, which produces a coconut every minute: \n\n 1x |cff00EAFFMagic|r 1x |cffFFFC00Coconut|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnacorn.png',
    cooldown: 0.25,
    hotkey: 'R',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-mana-crystal',
    name: 'Quick make Mana Crystal',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get A glowing crystal of mana. Used to make magical items :\n\n1x |cffDCB9EBSpirit of Wind|r + 1x |cff00EAFFSpirit of Water|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnmanacrystal.png',
    cooldown: 0.25,
    hotkey: 'A',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-magic',
    name: 'Quick make Magic',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get an essence of Magic :\n\n2x |cff7DBEF1Mana Crystal|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnmoonstone.png',
    cooldown: 0.25,
    hotkey: 'S',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-poison-spear',
    name: 'Quick make Poison Spear',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a Poison Spear. Hurls a poisoned spear at a targeted enemy unit, dealing 15 initial damage and 15 damage every 3 seconds.Reduce attack speed by 30% and movement speed by 30%. Lasts |cff7DBEF130|r (|cff7DBEF140|r) seconds, has |cff7DBEF12|r seconds cooldown.\n\n1x |cff1FBF00Poison|r + 1x |cffFFD700Bone|r + 1x |cff949596Stone|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnenvenomedspear.png',
    cooldown: 0.25,
    hotkey: 'D',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-nets',
    name: 'Quick make Nets',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a Nets. Can cast net on targeted enemy, locking them down, good for hunting animals and catch enemy troll. Has 3 charges. Last 2.5(10) seconds, has 15 seconds cooldown :\n\n2x |cff1FBF00Tinder|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnensnare.png',
    cooldown: 0.25,
    hotkey: 'Z',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-hunting-net',
    name: 'Quick make Hunting Net',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a Hunting Net. Reusable if target dies while netted, good for hunting animals and catch enemy troll. Has 1 charge. Last 2.5(8) seconds, has 15 seconds cooldown :\n\n1x |cff7DBEF1Nets|r 1x |cff949596Stone|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnhuntingnet.png',
    cooldown: 0.25,
    hotkey: 'X',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-healing-salve',
    name: 'Quick make Healing Salve',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get 3x|cff1FBF00 Healing Salve |rA Healing Salve made from Athelas Seed. Restores |cff1FBF00120|r Health points over |cff7DBEF18|r seconds to a target ally. \nEffect is canceled on being attacked.\n\n 1x |cff1FBF00Athelas Seed|r + 1x|cffFFFC00 Banana|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnbronzebowlfullgreen.png',
    cooldown: 0.25,
    hotkey: 'C',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-smoke-bomb',
    name: 'Quick make Smoke Bomb',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a Smoke Bomb. The skin of a banana containing the spirit of wind. When activated, the banana releases the wind and creates a smokescreen. Has 3 charges :\n\n1x |cffFFD700Banana|r 1x |cffDCB9EBSpirit of Wind|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnsmokepot.png',
    cooldown: 0.25,
    hotkey: 'Q',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-fire-bomb',
    name: 'Quick make Fire Bomb',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a Fire Bomb. A shell of destructible material that is highly flammable when thrown, deals 67 damage. Only damage ally/enemy buildings and trees, has 2 charges :\n\n1x |cff530080Smoke Bomb|r 1x |cffFF0202Flint|r + 1x |cff7DBEF1Mana Crystal|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnliquidfire.png',
    cooldown: 0.25,
    hotkey: 'W',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-emp',
    name: 'Quick make EMP',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get an EMP. When activated, disables all towers and enemy buildings around the user for 45 seconds :\n\n2x |cff7DBEF1Mana Crystal|r + 1x |cffDCB9EBSpirit of Wind|r + 1x |cff00EAFFSpirit of Water|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnwispsplode.png',
    cooldown: 0.25,
    hotkey: 'E',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-transport-ship',
    name: 'Quick make Transport Ship',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a Transport Ship Kit. Build a ship which allows you to travel on water :\n\n2x |cff1FBF00Stick|r + 2x |cffFE890DClay Ball|r + 2x |cffFE890DElk Hide|r|cffFF0202\n\nWarning: Transport Ship mode must be enabled to create ship|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnnightelftransport.png',
    cooldown: 0.25,
    hotkey: 'R',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-dark-thistles',
    name: 'Quick make Dark Thistles',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a Dark thistles. Creates a special type of blowgun ammo. Instead of poisoning, dark thistles depress enemies and zap mana from them over time :\n\n1x |cff1FBF00Thistles|r 1x |cffBE00FESpirit of Darkness|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnquillspray.png',
    cooldown: 0.25,
    hotkey: 'A',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-elk-skin-boots',
    name: 'Quick make Elk Skin Boots',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a pair of|cffFE890D Elk Skin Boots. |rIncreases wearer\'s movement speed by |cffFE890D<AMds,DataA1>|r, intelligence by |cff00EAFF<AM6m,DataB1>|r and provides warmth.|cffFFFC00\n|nAll basic boots transmute into the same bone/iron/steel boots.|r \n\n2x |cffFE890DElk Hide|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnelkhideboots.png',
    cooldown: 0.25,
    hotkey: 'Q',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-elk-skin-gloves',
    name: 'Quick make Elk Skin Gloves',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a pair of|cffFE890D  Elk Skin Gloves. |rIncreases wearer\'s attack speed by |cffFE890D<AM37,DataA1,%>%|r and provides warmth.|cffFFFC00\n|nAll basic gloves transmute into the same bone/iron/steel gloves.|r\n\n2x |cffFE890DElk Hide|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnelkhidegloves.png',
    cooldown: 0.25,
    hotkey: 'W',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-elk-skin-coat',
    name: 'Quick make Elk Skin Coat',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get an |cffFE890DElk Skin Coat. |rA coat made from animals pelt. Increases Strength by |cff1FBF00<AMef,DataC1>|r, Intelligence by |cff1FBF00<AM6l,DataB1>|r, Armor by |cff1FBF00<AM2t,DataA1>|r and provides warmth.|cffFE890D\n\nBasic Coat|r|r|cffFFFC00\n\nAll basic Coat transmute into the same Bone/Iron/Steel Coat.|r\n\n3x |cffFE890DElk Hide|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnelkhidecoat.png',
    cooldown: 0.25,
    hotkey: 'E',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-jungle-wolf-skin-boots',
    name: 'Quick make Jungle Wolf Skin Boots',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a pair of|cffFE890D Jungle Wolf Skin Boots. |rIncreases wearer\'s movement speed by |cffFE890D<AMds,DataA1>|r intelligence by |cff00EAFF<AIi4,DataB1>|r, agility by |cff1FBF00<AMel,DataA1>|r armor by |cff1FBF00<AM2u,DataA1>|r and provides warmth.|cffFFFC00\n|nAll basic boots transmute into the same bone/iron/steel boots.|r \n\n1x |cffFE890DJungle Wolf Hide|r\n1x |cffFE890DElk Hide|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnwolfhideboots.png',
    cooldown: 0.25,
    hotkey: 'A',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-jungle-wolf-skin-gloves',
    name: 'Quick make Jungle Wolf Skin Gloves',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a pair of|cffFE890D Jungle Wolf Skin Gloves. |rIncreases wearer\'s attack speed by |cffFE890D<AM38,DataA1,%>%|r, damage by |cffFF0202<AIth,DataA1>|r, armor by |cff1FBF00<AM2u,DataA1>|r and provides warmth.|cffFFFC00\n|nAll basic gloves transmute into the same bone/iron/steel gloves.|r\n\n1x |cffFE890DJungle Wolf Hide|r\n1x |cffFE890DElk Hide|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnwolfhidegloves.png',
    cooldown: 0.25,
    hotkey: 'S',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-jungle-wolf-skin-coat',
    name: 'Quick make Jungle Wolf Skin Coat',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a |cffFE890DJungle Wolf Skin Coat. |rA coat made from animals pelt. Increases Strength by |cff1FBF00<AIs3,DataC1>|r, Intelligence by |cff1FBF00<AM6m,DataB1>|r, Armor by |cff1FBF00<AM2u,DataA1>|r and provides warmth.|cffFE890D\n\nBasic Coat|r|r|cffFFFC00\n\nAll basic Coat transmute into the same Bone/Iron/Steel Coat.|r\n\n1x |cffFE890DJungle Wolf Hide|r\n2x |cffFE890DElk Hide|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnwolfhidecoat.png',
    cooldown: 0.25,
    hotkey: 'D',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-jungle-bear-skin-boots',
    name: 'Quick make Jungle Bear Skin Boots',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a pair of|cffFE890D Jungle Bear Skin Boots. |rIncreases wearer\'s movement speed by |cffFE890D<AMds,DataA1>|r intelligence by |cff00EAFF<AM6n,DataB1>|r, strength by |cffFE890D<AIs6,DataC1>|r armor by |cff1FBF00<AM2v,DataA1>|r and provides warmth.|cffFFFC00\n|nAll basic boots transmute into the same bone/iron/steel boots.|r \n\n1x |cffFE890DJungle Bear Hide|r\n1x |cffFE890DElk Hide|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnbearhideboots.png',
    cooldown: 0.25,
    hotkey: 'Z',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-jungle-bear-skin-gloves',
    name: 'Quick make Jungle Bear Skin Gloves',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a pair of|cffFE890D Jungle Bear Skin Gloves. |rIncreases wearer\'s attack speed by |cffFE890D<AM39,DataA1,%>%|r, damage by |cffFF0202<AIat,DataA1>|r, armor by |cff1FBF00<AM2v,DataA1>|r and provides warmth.|cffFFFC00\n|nAll basic gloves transmute into the same bone/iron/steel gloves.|r\n\n1x |cffFE890DJungle Bear Hide|r\n1x |cffFE890DElk Hide|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnbearhidegloves.png',
    cooldown: 0.25,
    hotkey: 'X',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-jungle-bear-skin-coat',
    name: 'Quick make Jungle Bear Skin Coat',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a |cffFE890DJungle Bear Skin Coat. |rA coat made from animals pelt. Increases Strength by |cff1FBF00<AIs6,DataC1>|r, Intelligence by |cff1FBF00<AIi4,DataB1>|r, Armor by |cff1FBF00<AM2v,DataA1>|r and provides warmth.|cffFE890D\n\nBasic Coat|r|r|cffFFFC00\n\nAll basic Coat transmute into the same Bone/Iron/Steel Coat.|r\n\n1x |cffFE890DJungle Bear Hide|r\n2x |cffFE890DElk Hide|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnbearhidecoat.png',
    cooldown: 0.25,
    hotkey: 'C',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-hydra-scale-boots',
    name: 'Quick make Hydra Scale Boots',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a pair of |cff82FF20Hydra Scale Boots. |rIncreases wearer\'s movement speed by |cffFE890D<AMdv,DataA1>|r, armor by |cff1FBF00<AM2z,DataA1>|r armor and all stats by |cff1FBF005|r. Also gives spell shield with |cff7DBEF1<AMdz,Cool1>|r second cooldown.\n\n2x |cff82FF20Hydra Scale|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnhydrawarstomp.png',
    cooldown: 0.25,
    hotkey: 'Q',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-hydra-scale-gloves',
    name: 'Quick make Hydra Scale Gloves',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a pair of |cff82FF20Hydra Scale Gloves. |rIncreases wearer\'s attack speed by |cffFE890D<AM3c,DataA1,%>%|r, all stats by |cff1FBF005|r and has a poisonous attack effect that lowers attack speed by |cffFFFC00<AM63,DataB1,%>%|r and movement speed by |cffFFFC00<AM63,DataC1,%>%|r and deals |cffFF0202<AM63,DataA1>|r damage per second for |cff7DBEF1<AM63,HeroDur1>|r seconds on trolls and |cff7DBEF1<AM63,Dur1>|r seconds on units. Can cast |cffFF6347Tsunami|r.|cffFF6347\n\nTsunami\n|rGrants the unit the ability to cast Tsunami, sending a gigantic wave dealing |cffFF020235|r damage to units in a line. When casted at close range, it deals |cffFF020220|r extra damage to buildings and can instantly put out fires. Has |cff7DBEF115|r seconds cooldown.\n\n2x |cff82FF20Hydra Scale|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnimprovedstrengthofthewild.png',
    cooldown: 0.25,
    hotkey: 'W',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-hydra-scale-coat',
    name: 'Quick make Hydra Scale Coat',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a |cff82FF20Hydra Scale Coat. |rA coat embedded with the scale of the Great Hydra. Increase all stats by |cff1FBF002|r, Armor by |cff1FBF00<AM2|,DataA1>|r and returns |cffBE00FE35%|r melee damage received.\n\n3x |cff82FF20Hydra Scale|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnnagaarmorup3.png',
    cooldown: 0.25,
    hotkey: 'E',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-iron-staff',
    name: 'Quick make Iron Staff',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get A magic staff reinforced with iron.\n+|cff1FBF008|r Attack damage\n+|cff1FBF002|r Armor\n+|cff1FBF008|r Intelligence\n\n1x |cff1FBF00Stick|r1x 2x |cffFF0202Iron Ingot|r1x |cff7DBEF1Mana Crystal|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnwand.png',
    cooldown: 0.25,
    hotkey: 'Q',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-iron-spear',
    name: 'Quick make Iron Spear',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a Iron Spear. Deals 70 damage on target, has 60% chance of being recoverable :\n\n1x |cff1FBF00Stick|r/|cffFFD700Bone|r + 1x |cffFF0202Iron Ingot|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnstrengthofthemoon.png',
    cooldown: 0.25,
    hotkey: 'W',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-steel-spear',
    name: 'Quick make Steel Spear',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a Steel Spear. Deals 100 damage on target, has 60% chance of being recoverable :\n\n1x |cff1FBF00Stick|r/|cffFFD700Bone|r + 1x |cffFF0202Steel Ingot|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnthoriumranged.png',
    cooldown: 0.25,
    hotkey: 'E',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-dark-spear',
    name: 'Quick make Dark Spear',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a Dark Spear. Deals 40 damage and will zap 10 plus 40% of the target\'s current energy :\n\n1x |cffBE00FESpirit of Darkness|r1x |cff1FBF00Stick|r/|cffFFD700Bone|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnarcaniteranged.png',
    cooldown: 0.25,
    hotkey: 'R',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-iron-axe',
    name: 'Quick make Iron Axe',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get an Iron Axe. Increase damage by 9, allows tree to be cut :\n\n1x |cff1FBF00Stick|r/|cffFFD700Bone|r + 2x |cffFF0202Iron Ingot|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnorcmeleeuptwo.png',
    cooldown: 0.25,
    hotkey: 'A',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-steel-axe',
    name: 'Quick make Steel Axe',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a Steel Axe. Increase damage by 12, allows tree to be cut :\n\n1x |cff1FBF00Stick|r/|cffFFD700Bone|r + 2x |cffFF0202Steel Ingot|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnspiritwalkeradepttraining.png',
    cooldown: 0.25,
    hotkey: 'S',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-chameleon-hatchet',
    name: 'Quick make Chameleon Hatchet',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a Chameleon Hatchet. Hatchet becomes an extension of the wielder\'s will, changing in response to their needs. \nWhen wielded by a warrior, it pulses with the vigor of strength, cleaving through enemies with brute force. In the hands of a rogue, it becomes a weapon of speed and precision, dancing with agility. \nAnd when embraced by a sorcerer, it channels the wielderâs arcane powers, enhancing their intellect and focus.\n+|cff1FBF008|r to Attack Damage\n+|cff1FBF008|r to Strength|cff949596\n+8 to Agility|r|cff949596\n+8 to Intelligence|r\n|cFFFFCC00Activate this item to switch attribute.|r\n\n1x |cffFE890DIron Axe|r + 1x |cffFF0202Iron Ingot|r + 1x |cffDCB9EBSpirit of Wind|r + 1x |cff00EAFFSpirit of Water|r + 1x |cff7DBEF1Mana Crystal|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnchameleonhatchetstr.png',
    cooldown: 0.25,
    hotkey: 'D',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-iron-ingot',
    name: 'Quick make Iron Ingot',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get an Iron Ingot. A Hard and shiny ingot of iron that could be used in production of powerful gear. Transmutes to steel ingot in armory. :\n\n1x |cff949596Stone|r + 1x |cffFF0202Flint|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnironingot.png',
    cooldown: 0.25,
    hotkey: 'Z',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-steel-ingot',
    name: 'Quick make Steel Ingot',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a Steel Ingot. A Hard and shiny ingot of steel that could be used in production of high quality gear. :\n\n2x |cffFF0202Iron Ingot|r + 2x |cffFF0202Flint|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnsteelingot.png',
    cooldown: 0.25,
    hotkey: 'X',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-shield',
    name: 'Quick make Shield',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get A Basic Shield, reduce damage taken by |cffFE890D3|r, gives |cff7DBEF110%|r magic resistance.\n\n1x |cffFE890DElk Hide|r + 2x |cff1FBF00Stick|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnsteelarmor.png',
    cooldown: 0.25,
    hotkey: 'Q',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-bone-shield',
    name: 'Quick make Bone Shield',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get A Bone Shield, reduce damage taken by |cffFE890D5|r, gives |cff1FBF001|r armor and |cff7DBEF110%|r magic resistance.\n\n1x |cffA46F33Shield|r + 5x |cffFFD700Bone|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnimprovedunholyarmor.png',
    cooldown: 0.25,
    hotkey: 'W',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-iron-shield',
    name: 'Quick make Iron Shield',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get An Iron Shield, reduce damage taken by |cffFE890D7|r, gives |cff1FBF002|r armor and |cff7DBEF110%|r magic resistance.\n\n1x |cffA46F33Shield|r+ 2x |cffFF0202Iron Ingot|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnhumanarmorupone.png',
    cooldown: 0.25,
    hotkey: 'E',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-steel-shield',
    name: 'Quick make Steel Shield',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get A Steel Shield, reduce damage taken by |cffFE890D10|r, gives |cff1FBF004|r armor and |cff7DBEF110%|r magic resistance. Has a bash ability, silences and disarms the target. Lasts |cff7DBEF12|r seconds, has |cff7DBEF115|r seconds cooldown.\n\n1x |cffA46F33Shield|r+ 2x |cffFF0202Steel Ingot|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnthoriumarmor.png',
    cooldown: 0.25,
    hotkey: 'R',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-bone-boots',
    name: 'Quick make Bone Boots',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a pair of |cffFE890DBone Boots. |rIncreases wearer\'s movement speed by |cffFE890D<AMdt,DataA1>|r, intelligence by |cff00EAFF<AIi3,DataB1>|r, armor by |cff1FBF00<AM2v,DataA1>|r and provides warmth.|cffFFFC00\n|nAll basic boots transmute into the same bone/iron/steel boots.|r \n\n1x |cffA46F33Elk Hide Boots|r + 5x |cffFFD700Bone|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnboneboots.png',
    cooldown: 0.25,
    hotkey: 'Q',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-iron-boots',
    name: 'Quick make Iron Boots',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a pair of |cff949596Iron Boots. |rIncreases wearer\'s movement speed by |cffFE890D<AMdu,DataA1>|r, intelligence by |cff00EAFF<AIi6,DataB1>|r, armor by |cff1FBF00<AM2v,DataA1>|r and provides warmth.|cffFFFC00\n|nAll basic boots transmute into the same bone/iron/steel boots.|r \n\n1x |cffA46F33Elk Hide Boots|r + 2x |cffFF0202Iron Ingot|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnboots.png',
    cooldown: 0.25,
    hotkey: 'W',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-steel-boots',
    name: 'Quick make Steel Boots',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a pair of |cff00EAFFSteel Boots. |rIncreases wearer\'s movement speed by |cffFE890D<AMdv,DataA1>|r, intelligence by |cff00EAFF<AM6p,DataB1>|r, armor by |cff1FBF00<AM2z,DataA1>|r and provides warmth.|cffFFFC00\n|nAll basic boots transmute into the same bone/iron/steel boots.|r \n\n1x |cffA46F33Elk Hide Boots|r + 2x |cffFF0202Steel Ingot|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnsteelboots.png',
    cooldown: 0.25,
    hotkey: 'E',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-bone-gloves',
    name: 'Quick make Bone Gloves',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a |cffFE890DBone Gloves. |rIncreases wearer\'s attack speed by |cffFE890D<AM39,DataA1,%>%|r, damage by |cffFF0202<AItg,DataA1>|r, armor by |cff1FBF00<AM2u,DataA1>|r and provides warmth.|cffFFFC00\n|nAll basic gloves transmute into the same bone/iron/steel gloves.|r\n\n1x |cffA46F33Elk Hide Boots|r + 5x |cffFFD700Bone|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btngauntletsofogrepower.png',
    cooldown: 0.25,
    hotkey: 'A',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-iron-gloves',
    name: 'Quick make Iron Gloves',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get an |cff949596Iron Gloves. |rIncreases wearer\'s attack speed by |cffFE890D<AM3a,DataA1,%>%|r, damage by |cffFF0202<AIth,DataA1>|r, armor by |cff1FBF00<AM2v,DataA1>|r and provides warmth.|cffFFFC00\n|nAll basic gloves transmute into the same bone/iron/steel gloves.|r\n\n1x |cffA46F33Elk Hide Boots|r + 2x |cffFF0202Iron Ingot|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnirongloves.png',
    cooldown: 0.25,
    hotkey: 'S',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-steel-gloves',
    name: 'Quick make Steel Gloves',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a |cff00EAFFSteel Gloves. |rIncreases wearer\'s attack speed by |cffFE890D<AM3c,DataA1,%>%|r, damage by |cffFF0202<AIti,DataA1>|r, armor by |cff1FBF00<AM2z,DataA1>|r and provides warmth.|cffFFFC00\n|nAll basic gloves transmute into the same bone/iron/steel gloves.|r\n\n1x |cffA46F33Elk Hide Boots|r + 2x |cffFF0202Steel Ingot|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnadvancedunholystrength.png',
    cooldown: 0.25,
    hotkey: 'D',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-bone-coat',
    name: 'Quick make Bone Coat',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a |cffFE890DBone Coat. |rA coat made from animals pelt. Increases Strength by |cff1FBF00<AIs3,DataC1>|r, Intelligence by |cff1FBF00<AIi4,DataB1>|r, Armor by |cff1FBF00<AM2u,DataA1>|r and provides warmth.\n\n1x |cffA46F33Elk Hide Coat|r + 5x |cffFFD700Bone|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnbonecoat.png',
    cooldown: 0.25,
    hotkey: 'Z',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-iron-coat',
    name: 'Quick make Iron Coat',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get an |cff949596Iron Coat. |rA coat made from animals pelt. Increases Strength by |cff1FBF00<AIs4,DataC1>|r, Intelligence by |cff1FBF00<AIi6,DataB1>|r, Armor by |cff1FBF00<AM2v,DataA1>|r and provides warmth.\n\n1x |cffA46F33Elk Hide Coat|r + 2x |cffFF0202Iron Ingot|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnimprovedmoonarmor.png',
    cooldown: 0.25,
    hotkey: 'X',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-steel-coat',
    name: 'Quick make Steel Coat',
    category: 'building',
    description: '',
    tooltip: 'Put those materials in the correct order to get a |cff00EAFFSteel Coat. |rA coat made from animals pelt. Increases Strength by |cff1FBF00<AMep,DataC1>|r, Intelligence by |cff1FBF00<AM6o,DataB1>|r, Armor by |cff1FBF00<AM2z,DataA1>|r and provides warmth. Can cast |cff1FBF00Cure All|r on wearer. Has |cff7DBEF190|r seconds cooldown.\n\n1x |cffA46F33Elk Hide Coat|r + 2x |cffFF0202Steel Ingot|r\n\nThis Quick Make ability will attempt to craft the item, including all intermediary ingridients.',
    iconPath: 'btnadvancedmoonarmor.png',
    cooldown: 0.25,
    hotkey: 'C',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-camp-fire-kit',
    name: 'Quick make Camp Fire Kit',
    category: 'building',
    description: '',
    tooltip: 'Pick up the following materials in the correct order or click on this once they\'re in your inventory to get a Camp Fire Kit. A handy dandy kit for starting a fire, can be used to cook meat, heat yourself up or burn buildings, might burn your own buildings too :\n\n1x |cff1FBF00Tinder|r + 1x |cffFF0202Flint|r + 1x |cff1FBF00Stick|r\n\nIf you do not have enough inventory to craft to pick all items, you can use the craft master 5000 at the center of the map. This Quick Make ability will find the nearest material and craft the said building, material have to be either on the ground just next to the unit or inside its inventory. For more information abouts item, type |cffFFD700-recipes|r, all the items are listed there.',
    iconPath: 'btnfire.png',
    cooldown: 0.25,
    hotkey: 'Q',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-tent-kit',
    name: 'Quick make Tent Kit',
    category: 'building',
    description: '',
    tooltip: 'Pick up the following materials in the correct order or click on this once they\'re in your inventory to get a Tent Kit. A kit used to build tent, can be used to sleep without getting cold, can be packed up :\n\n1x |cff1FBF00Stick|r + 1x |cffFE890DElk Hide|r + 1x |cff1FBF00Stick|r\n\nIf you do not have enough inventory to craft to pick all items, you can use the craft master 5000 at the center of the map. This Quick Make ability will find the nearest material and craft the said building, material have to be either on the ground just next to the unit or inside its inventory. For more information abouts item, type |cffFFD700-recipes|r, all the items are listed there.',
    iconPath: 'btntent.png',
    cooldown: 0.25,
    hotkey: 'W',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-mud-hut-kit',
    name: 'Quick make Mud Hut Kit',
    category: 'building',
    description: '',
    tooltip: 'Pick up the following materials in the correct order or click on this once they\'re in your inventory to get a Mud Hut Kit. A kit used to build a Mud Hut, a very good place to sleep, also has an armor aura :\n\n4x |cffFE890DClay Ball|r\n\nIf you do not have enough inventory to craft to pick all items, you can use the craft master 5000 at the center of the map. This Quick Make ability will find the nearest material and craft the said building, material have to be either on the ground just next to the unit or inside its inventory. For more information abouts item, type |cffFFD700-recipes|r, all the items are listed there.',
    iconPath: 'btngoldmine.png',
    cooldown: 0.25,
    hotkey: 'R',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-forge-kit',
    name: 'Quick make Forge Kit',
    category: 'building',
    description: '',
    tooltip: 'Pick up the following materials in the correct order or click on this once they\'re in your inventory to get A Forge Kit. A kit used to build a Forge, a place to craft ingots and basic weapons :\n\n1x |cffFF0202Flint|r 3x |cff949596Stone|r\n\nIf you do not have enough inventory to craft to pick all items, you can use the craft master 5000 at the center of the map. This Quick Make ability will find the nearest material and craft the said building, material have to be either on the ground just next to the unit or inside its inventory. For more information abouts item, type |cffFFD700-recipes|r, all the items are listed there.',
    iconPath: 'btnforge.png',
    cooldown: 0.25,
    hotkey: 'E',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-workshop-kit',
    name: 'Quick make Workshop Kit',
    category: 'building',
    description: '',
    tooltip: 'Pick up the following materials in the correct order or click on this once they\'re in your inventory to get a Workshop Kit. A kit used to build a Workshop, a place where you can craft high quality gear and utility items :\n\n1x |cff1FBF00Stick|r + 1x |cff1FBF00Tinder|r + 1x |cffFE890DClay Ball|r + 1x |cff1FBF00Stick|r\n\nIf you do not have enough inventory to craft to pick all items, you can use the craft master 5000 at the center of the map. This Quick Make ability will find the nearest material and craft the said building, material have to be either on the ground just next to the unit or inside its inventory. For more information abouts item, type |cffFFD700-recipes|r, all the items are listed there.',
    iconPath: 'btnorclumbermill.png',
    cooldown: 0.25,
    hotkey: 'S',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-mixing-pot-kit',
    name: 'Quick make Mixing Pot Kit',
    category: 'building',
    description: '',
    tooltip: 'Pick up the following materials in the correct order or click on this once they\'re in your inventory to get a Mixing Pot Kit. A kit used to build a Mixing Pot, can be used to create powerful items and materials by mixing herbs :\n\n1x |cff1FBF00Stick|r + 3x |cffFE890DClay Ball|r\n\nIf you do not have enough inventory to craft to pick all items, you can use the craft master 5000 at the center of the map. This Quick Make ability will find the nearest material and craft the said building, material have to be either on the ground just next to the unit or inside its inventory. For more information abouts item, type |cffFFD700-recipes|r, all the items are listed there.',
    iconPath: 'btnsacrificialpit.png',
    cooldown: 0.25,
    hotkey: 'D',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-witch-doctors-hut-kit',
    name: 'Quick make Witch Doctors Hut Kit',
    category: 'building',
    description: '',
    tooltip: 'Pick up the following materials in the correct order or click on this once they\'re in your inventory to get a Witch Doctors Hut Kit. A kit used to build a Witch Doctors Hut, a place where you can craft magical items :\n\n1x |cff1FBF00Stick|r + 1x |cff7DBEF1Mana Crystal|r + 1x |cff1FBF00Stick|r + 1x |cff7DBEF1Mana Crystal|r + 1x |cff1FBF00Stick|r\n\nIf you do not have enough inventory to craft to pick all items, you can use the craft master 5000 at the center of the map. This Quick Make ability will find the nearest material and craft the said building, material have to be either on the ground just next to the unit or inside its inventory. For more information abouts item, type |cffFFD700-recipes|r, all the items are listed there.',
    iconPath: 'btnvoodoolounge.png',
    cooldown: 0.25,
    hotkey: 'F',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-tannery-kit',
    name: 'Quick make Tannery Kit',
    category: 'building',
    description: '',
    tooltip: 'Pick up the following materials in the correct order or click on this once they\'re in your inventory to get a Tannery Kit. A kit used to build a Tannery, a place where you can craft armor and cloth from hides :\n\n2x |cff1FBF00Stick|r + 2x |cff949596Stone|r + 1x |cffFE890DClay Ball|r\n\nIf you do not have enough inventory to craft to pick all items, you can use the craft master 5000 at the center of the map. This Quick Make ability will find the nearest material and craft the said building, material have to be either on the ground just next to the unit or inside its inventory. For more information abouts item, type |cffFFD700-recipes|r, all the items are listed there.',
    iconPath: 'btnpigfarm.png',
    cooldown: 0.25,
    hotkey: 'Z',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-omnitower-kit',
    name: 'Quick make Omnitower Kit',
    category: 'building',
    description: '',
    tooltip: 'Pick up the following materials in the correct order or click on this once they\'re in your inventory to get a Omnitower Kit. A kit used to build an Omnitower, a tower dealing small amount of damage, can use activable items like spear, scroll or blowgun :\n\n1x |cff949596Stone|r + 3x |cff1FBF00Stick|r\n\nIf you do not have enough inventory to craft to pick all items, you can use the craft master 5000 at the center of the map. This Quick Make ability will find the nearest material and craft the said building, material have to be either on the ground just next to the unit or inside its inventory. For more information abouts item, type |cffFFD700-recipes|r, all the items are listed there.',
    iconPath: 'btnorctower.png',
    cooldown: 0.25,
    hotkey: 'X',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-armory-kit',
    name: 'Quick make Armory Kit',
    category: 'building',
    description: '',
    tooltip: 'Pick up the following materials in the correct order or click on this once they\'re in your inventory to get an Armoy Kit. A kit used to build an Armory, a place where you can craft weapons, gear and other useful items :\n\n1x |cff1FBF00Stick|r + 2x |cffFF0202Iron Ingot|r\n\nIf you do not have enough inventory to craft to pick all items, you can use the craft master 5000 at the center of the map. This Quick Make ability will find the nearest material and craft the said building, material have to be either on the ground just next to the unit or inside its inventory. For more information abouts item, type |cffFFD700-recipes|r, all the items are listed there.',
    iconPath: 'btnarmory.png',
    cooldown: 0.25,
    hotkey: 'A',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'quick-make-teleport-beacon-kit',
    name: 'Quick make Teleport Beacon Kit',
    category: 'building',
    description: '',
    tooltip: 'Pick up the following materials in the correct order or click on this once they\'re in your inventory to get a Teleport Beacon Kit. A kit used to build a Teleport Beacon, can be used to blink yourself on the other side of the beacon :\n\n2x |cff949596Stone|r + 1x |cff7DBEF1Mana Crystal|r + 1x |cff1FBF00Stick|r\n\nIf you do not have enough inventory to craft to pick all items, you can use the craft master 5000 at the center of the map. This Quick Make ability will find the nearest material and craft the said building, material have to be either on the ground just next to the unit or inside its inventory. For more information abouts item, type |cffFFD700-recipes|r, all the items are listed there.',
    iconPath: 'btnenergytower.png',
    cooldown: 0.25,
    hotkey: 'C',
    levels: {
            "1": {
                  "cooldown": 0.25
            }
      },
  },
  {
    id: 'melt-a-river-root',
    name: 'Melt a River Root',
    category: 'building',
    description: '',
    tooltip: 'Find and melt a River Root in |cff7DBEF1900|r radius, granting |cff7DBEF13|r mana to Mixing Pot.',
    iconPath: 'btnwandofneutralization.png',
    cooldown: 0.5,
    hotkey: 'W',
    levels: {
            "1": {
                  "cooldown": 0.5
            }
      },
  },
  {
    id: 'melt-a-native-herb',
    name: 'Melt a Native Herb',
    category: 'building',
    description: '',
    tooltip: 'Find and melt a Native Herb in |cff7DBEF1900|r radius, granting |cff7DBEF15|r mana to Mixing Pot.',
    iconPath: 'btnyellowherb.png',
    cooldown: 0.5,
    hotkey: 'E',
    levels: {
            "1": {
                  "cooldown": 0.5
            }
      },
  },
  {
    id: 'melt-an-exotic-herb',
    name: 'Melt an Exotic Herb',
    category: 'building',
    description: '',
    tooltip: 'Find and melt an Exotic Herb in |cff7DBEF1900|r radius, granting |cff7DBEF17.5|r mana to Mixing Pot.',
    iconPath: 'btnpurpleherb.png',
    cooldown: 0.5,
    hotkey: 'R',
    levels: {
            "1": {
                  "cooldown": 0.5
            }
      },
  },
  {
    id: 'melt-everything',
    name: 'Melt everything',
    category: 'building',
    description: '',
    tooltip: 'Find and melt every herb in |cff7DBEF1900|r radius, including athelas, spirits and essences.',
    iconPath: 'btndizzy.png',
    cooldown: 0.5,
    hotkey: 'X',
    levels: {
            "1": {
                  "cooldown": 0.5
            }
      },
  }
];

