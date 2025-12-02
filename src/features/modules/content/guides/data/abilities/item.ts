import type { AbilityData } from './types';

export const ITEM_ABILITIES: AbilityData[] = [
  {
    id: 'hypnosis',
    name: 'Hypnosis',
    category: 'item',
    description: '',
    tooltip: 'Puts an enemy into a dream-like state. Beware: Restores enemy energy by 75. Deals 20 damage.',
    iconPath: 'pasbtnelunesblessing.png',
    manaCost: 10,
    cooldown: 30,
    range: 500,
    duration: 5,
    hotkey: 'H',
    targetsAllowed: 'enemies,ground,hero',
    levels: {
            "1": {
                  "manaCost": 10,
                  "cooldown": 20,
                  "duration": 5,
                  "range": 300
            }
      },
  },
  {
    id: 'armor-boost',
    name: 'Armor Boost',
    category: 'item',
    description: '',
    range: 400,
    duration: 15,
    targetsAllowed: 'air,friend,ground,neutral,self',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 15,
                  "range": 400
            }
      },
  },
  {
    id: 'poison',
    name: 'Poison',
    category: 'item',
    description: '',
    iconPath: 'btnslow.png',
    cooldown: 15,
    range: 500,
    duration: 8,
    targetsAllowed: 'air,enemies,ground,neutral,nonhero,organic',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 15,
                  "duration": 8,
                  "range": 500
            }
      },
  },
  {
    id: 'healing-potion',
    name: 'Healing Potion',
    category: 'item',
    description: '',
    tooltip: 'A dilute potion made from Athelas Seed. Instantly restores |cff1FBF00100|r Health point to a target ally.\nCosts |cFFFFCC0012|r energy.',
    iconPath: 'btnlesserrejuvpotion.png',
    range: 600,
    hotkey: 'Q',
    targetsAllowed: 'friend,ground,hero,invulnerable,organic,self,vulnerable,item',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "range": 600
            }
      },
  },
  {
    id: 'cooked-meat-heal',
    name: 'Cooked Meat Heal',
    category: 'item',
    description: '',
    tooltip: 'dummy spell',
    duration: 0.01,
    castTime: 'Abilities\\Spells\\Human\\Heal\\HealTarget.mdx',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 0.01
            }
      },
  },
  {
    id: 'banana-heal',
    name: 'Banana Heal',
    category: 'item',
    description: '',
    tooltip: 'dummy spell',
    duration: 0.01,
    castTime: 'Abilities\\Spells\\Human\\Heal\\HealTarget.mdx',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 0.01
            }
      },
  },
  {
    id: 'honeycomb-heal',
    name: 'Honeycomb Heal',
    category: 'item',
    description: '',
    tooltip: 'dummy spell',
    duration: 0.01,
    castTime: 'Abilities\\Spells\\Human\\Heal\\HealTarget.mdx',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 0.01
            }
      },
  },
  {
    id: 'coconut',
    name: 'Coconut',
    category: 'item',
    description: '',
    tooltip: 'dummy spell',
    duration: 0.01,
    castTime: 'Abilities\\Spells\\Human\\Heal\\HealTarget.mdx',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 0.01
            }
      },
  },
  {
    id: 'blow-gun-ability',
    name: 'Blow Gun Ability',
    category: 'item',
    description: '',
    cooldown: 9,
    range: 450,
    targetsAllowed: 'air,ground,enemy,neutral,organic,self',
    levels: {
            "1": {
                  "cooldown": 9,
                  "range": 450
            }
      },
  },
  {
    id: 'scavenged-mushroom',
    name: 'Scavenged Mushroom',
    category: 'item',
    description: '',
    tooltip: 'dummy spell',
    duration: 0.01,
    castTime: 'Abilities\\Spells\\Human\\Heal\\HealTarget.mdx',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 0.01
            }
      },
  },
  {
    id: 'makrura-carapace-cooldown',
    name: 'Makrura Carapace cooldown',
    category: 'item',
    description: '',
    tooltip: 'dummy spell',
    cooldown: 35,
    duration: 0.01,
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 7,
                  "duration": 0.01
            }
      },
  },
  {
    id: 'battle-armor-cast',
    name: 'Battle Armor Cast',
    category: 'item',
    description: '',
    tooltip: 'dummy spell',
    cooldown: 75,
    duration: 0.01,
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 75,
                  "duration": 0.01
            }
      },
  },
  {
    id: 'steel-coat-cast',
    name: 'Steel Coat Cast',
    category: 'item',
    description: '',
    tooltip: 'dummy spell',
    cooldown: 90,
    duration: 0.01,
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 90,
                  "duration": 0.01
            }
      },
  },
  {
    id: 'consume-raw-meat',
    name: 'Consume Raw Meat',
    category: 'item',
    description: '',
    tooltip: 'dummy spell',
    duration: 0.01,
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 0.01
            }
      },
  },
  {
    id: 'hydra-hardened-scale',
    name: 'Hydra Hardened Scale',
    category: 'item',
    description: '',
  },
  {
    id: 'rip-and-tear',
    name: 'Rip and Tear',
    category: 'item',
    description: '',
    tooltip: 'Your next attack will tear out a chunk of flesh from your target, recovering 1 raw meat and applying a bleed effect which does |cffFF020230.0|r damage and slows target briefly.\nYour auto attacks lower the cooldown by |cff7DBEF10.5|r seconds.\nHas |cff7DBEF112.0|r seconds cooldown.',
    iconPath: 'pasbtnghoulfrenzy.png',
    targetsAllowed: 'ground,enemy,neutral',
  },
  {
    id: 'oracle-potion-cast',
    name: 'Oracle Potion Cast',
    category: 'item',
    description: '',
    tooltip: 'dummy spell',
    cooldown: 20,
    duration: 0.01,
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 20,
                  "duration": 0.01
            }
      },
  },
  {
    id: 'item-crit',
    name: 'Item Crit',
    category: 'item',
    description: '',
  },
  {
    id: 'acid-bomb',
    name: 'Acid Bomb',
    category: 'item',
    description: '',
    tooltip: 'A bomb with nasty liquid from an unknown origin. Throw at a target to reduce their amor by |cffFF02028|r, has a small radius effect. Lasts |cff7DBEF150|r seconds, has |cff7DBEF110|r seconds cooldown.',
    iconPath: 'btnacidbomb.png',
    cooldown: 10,
    range: 600,
    duration: 50,
    hotkey: 'F',
    targetsAllowed: 'air,enemies,ground,organic',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "range": 600
            }
      },
  },
  {
    id: 'max-speed',
    name: 'Max Speed',
    category: 'item',
    description: '',
    cooldown: 35,
    duration: 10,
    levels: {
            "1": {
                  "cooldown": 35,
                  "duration": 10
            }
      },
  },
  {
    id: 'anti-magic-potion-cast',
    name: 'Anti-Magic Potion Cast',
    category: 'item',
    description: '',
    cooldown: 1,
    range: 800,
    duration: 25,
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 1,
                  "duration": 25,
                  "range": 800
            }
      },
  },
  {
    id: 'anti-magic-potion',
    name: 'Anti-Magic Potion',
    category: 'item',
    description: '',
    tooltip: 'Cast an Anti-Magic shield on target, blocking |cff1FBF00200|r magic damage. Lasts |cff7DBEF125|r seconds, has |cff7DBEF11|r seconds cooldown.\nCosts |cFFFFCC0010|r energy.',
    iconPath: 'btnpotionofclarity.png',
    range: 800,
    hotkey: 'R',
    targetsAllowed: 'friend,ground,hero,invulnerable,organic,self,vulnerable',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "range": 800
            }
      },
  },
  {
    id: 'cure-potion',
    name: 'Cure Potion',
    category: 'item',
    description: '',
    tooltip: 'This potion is said to be able to cure anything.\nCosts |cFFFFCC0010|r energy.',
    iconPath: 'btnlesserclaritypotion.png',
    range: 500,
    hotkey: 'E',
    targetsAllowed: 'friend,organic,self',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "range": 500
            }
      },
  },
  {
    id: 'disease-cloud-cast',
    name: 'Disease Cloud Cast',
    category: 'item',
    description: '',
    cooldown: 0.3,
    range: 600,
    duration: 25,
    targetsAllowed: 'enemies',
    levels: {
            "1": {
                  "cooldown": 0.3,
                  "duration": 25,
                  "range": 600
            }
      },
  },
  {
    id: 'disease-potion',
    name: 'Disease Potion',
    category: 'item',
    description: '',
    tooltip: 'Biological warfare! Throw at an enemy to give him  a disease. Dealing |cffFF02025|r damage per second. Last |cff7DBEF125|r seconds.\nCosts |cFFFFCC0012|r energy.',
    iconPath: 'btnpotiongreen.png',
    range: 600,
    duration: 0.03,
    hotkey: 'Z',
    targetsAllowed: 'organic,enemies,vulnerable',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 0.03,
                  "range": 600
            }
      },
  },
  {
    id: 'drunk-potion-cast',
    name: 'Drunk Potion Cast',
    category: 'item',
    description: '',
    cooldown: 20,
    range: 550,
    duration: 13,
    areaOfEffect: 0.01,
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 20,
                  "duration": 13,
                  "range": 550,
                  "areaOfEffect": 0.01
            }
      },
  },
  {
    id: 'drunk-s-potion',
    name: 'Drunk\'s Potion',
    category: 'item',
    description: '',
    tooltip: 'Throw this at an enemy to get them drunk, target is silenced, movement speed slowed by |cffFE890D25%|r, attack speed by |cffFE890D10%|r and has |cffFE890D50%|r chance to miss. Lasts |cff7DBEF18|r (|cff7DBEF113|r) seconds, has |cff7DBEF120|r seconds cooldown.\nCosts |cFFFFCC0018|r energy.',
    iconPath: 'btnlesserinvulneralbility.png',
    range: 550,
    hotkey: 'A',
    targetsAllowed: 'alive,enemies,organic,hero',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "range": 550
            }
      },
  },
  {
    id: 'fervor-potion',
    name: 'Fervor Potion',
    category: 'item',
    description: '',
    tooltip: 'Drink this potion when you want to kill lots of stuff. It increases your attack and movement speed as well as hurts enemies around you.|n|c00ff0000Stimulant|r\nCosts |cFFFFCC0030|r energy.',
    iconPath: 'btngreaterinvulneralbility.png',
    range: 500,
    hotkey: 'X',
    targetsAllowed: 'alive,ground,friend,self,organic',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "range": 500
            }
      },
  },
  {
    id: 'mana-potion',
    name: 'Mana Potion',
    category: 'item',
    description: '',
    tooltip: 'A dilute potion made from Athelas Seed. Instantly restores |cff7DBEF180|r Mana point to a target ally.\nCosts |cFFFFCC0010|r energy.',
    iconPath: 'btnpotionbluesmall.png',
    range: 400,
    hotkey: 'W',
    targetsAllowed: 'friend,ground,hero,invulnerable,organic,self,vulnerable,item',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "range": 400
            }
      },
  },
  {
    id: 'nether-potion',
    name: 'Nether Potion',
    category: 'item',
    description: '',
    tooltip: 'Banish a target into the ethereal realm, target takes increased magical damage, cannot attack but can cast spells and use items. Lasts |cff7DBEF115|r (|cff7DBEF140|r) seconds, has |cff7DBEF120|r seconds cooldown.\nCosts |cFFFFCC0030|r energy.',
    iconPath: 'btnpotionofomniscience.png',
    cooldown: 20,
    range: 350,
    duration: 40,
    hotkey: 'S',
    targetsAllowed: 'vulnerable,organic',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "range": 350
            }
      },
  },
  {
    id: 'omnicure-potion',
    name: 'Omnicure Potion',
    category: 'item',
    description: '',
    tooltip: 'An upgrade of Cure All that affects all allies as well as the caster. Can cure jealousy, track, disease, snake poison, and many others. Can not be used on enemies. Has |cff7DBEF150|r seconds cooldown.\nCosts |cFFFFCC0020|r energy.',
    iconPath: 'btnminorrejuvpotion.png',
    range: 99999,
    duration: 0.03,
    hotkey: 'D',
    targetsAllowed: 'targetAllowed',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 0.03,
                  "range": 99999
            }
      },
  },
  {
    id: 'titan-s-grip',
    name: 'Titan\'s Grip',
    category: 'item',
    description: '',
  },
  {
    id: 'giant-swing',
    name: 'Giant Swing',
    category: 'item',
    description: '',
    tooltip: 'The Warrior has |cffFF634719/21/23%|r chance of dealing |cffFF634710/15/20|r damages to his surrounding.',
    iconPath: 'pasbtnseagiantpulverize.png',
    targetsAllowed: 'ground,enemy,neutral',
  },
  {
    id: 'giant-swing-juggernaut',
    name: 'Giant Swing Juggernaut',
    category: 'item',
    description: '',
    tooltip: 'The Juggernaut has |cffFF634723%|r chance of dealing |cffFF634720|r damages to his surrounding.',
    iconPath: 'pasbtnseagiantpulverize.png',
    targetsAllowed: 'ground,enemy,neutral',
  },
  {
    id: 'root-item-cast',
    name: 'Root Item cast',
    category: 'item',
    description: '',
    cooldown: 20,
    range: 450,
    targetsAllowed: 'ground,enemies,organic',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 20,
                  "range": 450
            }
      },
  },
  {
    id: 'scroll-of-fire-ball',
    name: 'Scroll of Fire Ball',
    category: 'item',
    description: '',
    tooltip: 'Grants the unit the ability to cast Fire Ball dealing |cffFF020260|r damage and stunning the target for |cffFE890D0.1|r/|cffFE890D1|r seconds. Has |cff7DBEF122|r seconds cooldown.',
    iconPath: 'btnscrollofhealing.png',
    cooldown: 22,
    range: 450,
    duration: 1,
    hotkey: 'W',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 22,
                  "duration": 1,
                  "range": 450
            }
      },
  },
  {
    id: 'scroll-of-living-dead',
    name: 'Scroll of Living Dead',
    category: 'item',
    description: '',
    tooltip: 'Grants the unit the ability to cast Living Dead which summons two skeletal bodyguard, each sketelon deal |cffFF02027|r magic damage per hit. Lasts |cff7DBEF115|r seconds, has |cff7DBEF135|r seconds cooldown.',
    iconPath: 'btnskeletonwarrior.png',
    cooldown: 35,
    duration: 15,
    areaOfEffect: 300,
    hotkey: 'R',
    targetsAllowed: 'air,enemies,ground',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 35,
                  "duration": 15,
                  "areaOfEffect": 300
            }
      },
  },
  {
    id: 'scroll-of-stone-armor',
    name: 'Scroll of Stone Armor',
    category: 'item',
    description: '',
    tooltip: 'Grants the unit the ability to Cast Stone armor which increases the target ally armor by |cff1FBF005|r and slows the attack speed of melee attackers by |cffFE890D15%|r for |cffFE890D2|r seconds. Lasts |cff7DBEF115|r seconds, has |cff7DBEF140|r seconds cooldown.',
    iconPath: 'btnscrolluber.png',
    cooldown: 40,
    range: 400,
    duration: 2,
    hotkey: 'E',
    targetsAllowed: 'air,friend,ground,neutral,self',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 40,
                  "duration": 2,
                  "range": 400
            }
      },
  },
  {
    id: 'scroll-of-tsunami',
    name: 'Scroll of Tsunami',
    category: 'item',
    description: '',
    tooltip: 'Grants the unit the ability to cast Tsunami, sending a gigantic wave dealing |cffFF020235|r damage to units in a line. When casted at close range, it deals |cffFF020220|r extra damage to buildings and can instantly put out fires. Has |cff7DBEF115|r seconds cooldown.',
    iconPath: 'btnsnazzyscrollpurple.png',
    cooldown: 15,
    range: 600,
    hotkey: 'A',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 15,
                  "range": 600
            }
      },
  },
  {
    id: 'scroll-of-haste',
    name: 'Scroll of Haste',
    category: 'item',
    description: '',
    tooltip: 'Grant the unit the ability to boost its allies movement speed to the maximum. Lasts |cff7DBEF17|r seconds, has |cff7DBEF135|r seconds cooldown.',
    iconPath: 'btnscrollofhaste.png',
    cooldown: 35,
    duration: 7,
    areaOfEffect: 600,
    hotkey: 'S',
    targetsAllowed: 'air,ground,friend,self,vulnerable,invulnerable,nonsapper',
    levels: {
            "1": {
                  "cooldown": 35,
                  "duration": 7,
                  "areaOfEffect": 600
            }
      },
  },
  {
    id: 'scroll-of-cyclone',
    name: 'Scroll of Cyclone',
    category: 'item',
    description: '',
    tooltip: 'Grants the unit the ability to cast Cyclone which tosses an enemy unit in the air for |cffFE890D5|r/|cffFE890D10|r seconds. Has |cff7DBEF135|r seconds cooldown.',
    iconPath: 'btnbansheemaster.png',
    cooldown: 35,
    range: 500,
    duration: 10,
    hotkey: 'D',
    levels: {
            "1": {
                  "cooldown": 35,
                  "duration": 10,
                  "range": 500
            }
      },
  },
  {
    id: 'entangling-root-scroll',
    name: 'Entangling Root Scroll',
    category: 'item',
    description: '',
    tooltip: 'Grants the unit the ability to cast Entangling Roots, locking the enemy in place for |cffFE890D2|r/|cffFE890D8|r seconds and dealing |cffFF02025|r damage per second. Has |cff7DBEF120|r seconds cooldown.|cffFFD700|nNote: Troll do not take damage and can still attack when affected by this spell.|r',
    iconPath: 'btnscrollofregenerationgreen.png',
    cooldown: 20,
    range: 450,
    hotkey: 'Q',
    targetsAllowed: 'ground,enemies,organic',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 20,
                  "range": 450
            }
      },
  },
  {
    id: 'mage-s-grimoire',
    name: 'Mage\'s Grimoire',
    category: 'item',
    description: '',
    cooldown: 10,
    levels: {
            "1": {
                  "cooldown": 10
            }
      },
  },
  {
    id: 'restores-80-health-points-over-8-seconds-to-a-target-ally-can-store-up-to-3-charges',
    name: 'Restores 80 Health points over 8 seconds to a target ally. Can store up to 3 charges.',
    category: 'item',
    description: '',
    tooltip: 'Restores |cff1FBF0080|r Health points over |cff7DBEF18|r seconds to a target ally. Can store up to |cff6495ED3|r charges. \nEffect is canceled on being attacked. \nHas |cff6495ED15.0|r second cooldown.',
    iconPath: 'btnrenew.png',
    manaCost: 15,
    cooldown: 15,
    range: 6000,
    hotkey: 'R',
    targetsAllowed: 'air,ground,friend,vulnerable,invulnerable,self,organic,nonancient,neutral',
    levels: {
            "1": {
                  "manaCost": 15,
                  "cooldown": 15,
                  "range": 6000
            }
      },
  },
  {
    id: 'movement-speed-bonus-200',
    name: 'Movement Speed Bonus 200',
    category: 'item',
    description: '',
    visualEffects: {
            "attachmentPoints": [
                  "foot,left",
                  "foot,right",
                  2
            ],
            "attachmentTarget": "Abilities\\Weapons\\FaerieDragonMissile\\FaerieDragonMissile.mdx"
      },
  },
  {
    id: 'anabolic-evasion',
    name: 'Anabolic Evasion',
    category: 'item',
    description: '',
  },
  {
    id: 'hydra-fins-spell-shield-amulet',
    name: 'Hydra Fins Spell Shield (Amulet)',
    category: 'item',
    description: '',
    cooldown: 75,
    levels: {
            "1": {
                  "cooldown": 75
            }
      },
  },
  {
    id: 'dummy-spell',
    name: 'dummy spell',
    category: 'item',
    description: '',
    tooltip: 'dummy spell',
    duration: 0.01,
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 0.01
            }
      },
  },
  {
    id: 'clay-explosion',
    name: 'Clay Explosion',
    category: 'item',
    description: '',
    castTime: 'Abilities\\Weapons\\GryphonRiderMissile\\GryphonRiderMissileTarget.mdl',
  },
  {
    id: 'healing-cloak-cast',
    name: 'Healing Cloak Cast',
    category: 'item',
    description: '',
    tooltip: 'dummy spell',
    cooldown: 60,
    duration: 0.01,
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 60,
                  "duration": 0.01
            }
      },
  },
  {
    id: 'mana-cloak-cast',
    name: 'Mana Cloak Cast',
    category: 'item',
    description: '',
    tooltip: 'dummy spell',
    cooldown: 60,
    duration: 0.01,
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 60,
                  "duration": 0.01
            }
      },
  },
  {
    id: 'frost-cloak-cast',
    name: 'Frost Cloak Cast',
    category: 'item',
    description: '',
    tooltip: 'dummy spell',
    cooldown: 35,
    duration: 0.01,
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 35,
                  "duration": 0.01
            }
      },
  },
  {
    id: 'cloak-of-flames-immolation',
    name: 'Cloak of Flames Immolation',
    category: 'item',
    description: '',
    areaOfEffect: 300,
    levels: {
            "1": {
                  "areaOfEffect": 300
            }
      },
  },
  {
    id: 'full-heal',
    name: 'Full Heal',
    category: 'item',
    description: '',
    tooltip: 'Fully restore the user Health and slows nearby enemies movement speed by |cffFE890D50%|r and attack speed by |cffFE890D50%|r for |cff7DBEF12|r/|cff7DBEF16|r seconds, additionally deals |cffFF020210|r damage. Has |cff7DBEF180|r seconds cooldown.',
    iconPath: 'btnmarkoffire.png',
    cooldown: 80,
    duration: 6,
    areaOfEffect: 350,
    hotkey: 'Q',
    targetsAllowed: 'air,enemies,ground,neutral',
    castTime: 'Abilities\\Spells\\Orc\\AncestralSpirit\\AncestralSpiritCaster.mdx',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 80,
                  "duration": 6,
                  "areaOfEffect": 350
            }
      },
  },
  {
    id: 'restore-mana',
    name: 'Restore Mana',
    category: 'item',
    description: '',
    tooltip: 'Fully restore the user Mana and stun nearby enemies for |cff7DBEF11|r/|cff7DBEF14|r seconds,  additionally deals |cffFF020210|r damage. Has |cff7DBEF180|r seconds cooldown.',
    iconPath: 'btnneutralmanashield.png',
    cooldown: 80,
    duration: 4,
    areaOfEffect: 300,
    hotkey: 'W',
    targetsAllowed: 'air,enemies,ground,neutral',
    castTime: 'Abilities\\Spells\\Items\\ResourceItems\\ResourceEffectTarget.mdx',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 80,
                  "duration": 4,
                  "areaOfEffect": 300
            }
      },
  },
  {
    id: 'restore-heat',
    name: 'Restore Heat',
    category: 'item',
    description: '',
    tooltip: 'Fully restore the user Heat and decrease nearby enemies armor by |cffFF020210|r  and damage by |cffFF0202100%|r for |cff7DBEF15|r/|cff7DBEF15|r seconds. Has |cff7DBEF180|r seconds cooldown.',
    iconPath: 'btnwalloffire.png',
    cooldown: 80,
    duration: 5,
    areaOfEffect: 400,
    hotkey: 'E',
    targetsAllowed: 'air,enemies,structure,ground,neutral',
    castTime: 'Abilities\\Spells\\Human\\FlameStrike\\FlameStrikeTarget.mdx',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 80,
                  "duration": 5,
                  "areaOfEffect": 400
            }
      },
  },
  {
    id: 'basic-shield-block',
    name: 'Basic Shield block',
    category: 'item',
    description: '',
  },
  {
    id: 'bone-shield-block',
    name: 'Bone Shield block',
    category: 'item',
    description: '',
  },
  {
    id: 'iron-shield-block',
    name: 'Iron Shield block',
    category: 'item',
    description: '',
  },
  {
    id: 'steel-shield-block',
    name: 'Steel Shield block',
    category: 'item',
    description: '',
  },
  {
    id: 'battle-shield-block',
    name: 'Battle Shield block',
    category: 'item',
    description: '',
  },
  {
    id: 'makrura-carapace-block',
    name: 'Makrura Carapace block',
    category: 'item',
    description: '',
  },
  {
    id: 'troll-protector-block',
    name: 'Troll Protector block',
    category: 'item',
    description: '',
  },
  {
    id: 'shield-bash',
    name: 'Shield Bash',
    category: 'item',
    description: '',
    cooldown: 15,
    range: 100,
    duration: 2,
    areaOfEffect: 0,
    targetsAllowed: 'ground,neutral,enemies,organic,nonancient',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 15,
                  "duration": 2,
                  "range": 100,
                  "areaOfEffect": 0
            }
      },
  },
  {
    id: 'spear-cast-spear',
    name: 'Spear Cast (Spear)',
    category: 'item',
    description: '',
    cooldown: 2,
    range: 1000,
    targetsAllowed: 'air,enemies,ground,neutral,organic,terrain',
    levels: {
            "1": {
                  "cooldown": 2,
                  "range": 1000
            }
      },
  },
  {
    id: 'spear-cast-iron',
    name: 'Spear Cast (Iron)',
    category: 'item',
    description: '',
    cooldown: 5,
    range: 1000,
    targetsAllowed: 'air,enemies,ground,neutral,organic,terrain',
    levels: {
            "1": {
                  "cooldown": 5,
                  "range": 1000
            }
      },
  },
  {
    id: 'spear-cast-steel',
    name: 'Spear Cast (Steel)',
    category: 'item',
    description: '',
    cooldown: 8,
    range: 1000,
    targetsAllowed: 'air,enemies,ground,neutral,organic,terrain',
    levels: {
            "1": {
                  "cooldown": 8,
                  "range": 1000
            }
      },
  },
  {
    id: 'spear-cast-dark',
    name: 'Spear Cast (Dark)',
    category: 'item',
    description: '',
    cooldown: 5,
    range: 1000,
    targetsAllowed: 'air,enemies,ground,neutral,organic,terrain',
    levels: {
            "1": {
                  "cooldown": 5,
                  "range": 1000
            }
      },
  },
  {
    id: 'poison-spear-cast-basic',
    name: 'Poison Spear Cast Basic',
    category: 'item',
    description: '',
    cooldown: 2,
    range: 1000,
    targetsAllowed: 'air,enemies,ground,neutral,organic,terrain',
    levels: {
            "1": {
                  "cooldown": 2,
                  "range": 1000
            }
      },
  },
  {
    id: 'poison-spear-cast-refined',
    name: 'Poison Spear Cast Refined',
    category: 'item',
    description: '',
    cooldown: 5,
    range: 1000,
    targetsAllowed: 'air,enemies,ground,neutral,organic,terrain',
    levels: {
            "1": {
                  "cooldown": 5,
                  "range": 1000
            }
      },
  },
  {
    id: 'poison-spear-cast-ultra',
    name: 'Poison Spear Cast Ultra',
    category: 'item',
    description: '',
    cooldown: 8,
    range: 1000,
    targetsAllowed: 'air,enemies,ground,neutral,organic,terrain',
    levels: {
            "1": {
                  "cooldown": 8,
                  "range": 1000
            }
      },
  },
  {
    id: 'build-armory',
    name: 'Build Armory',
    category: 'item',
    description: '',
    iconPath: 'btnarmory.png',
    range: 100,
    duration: 10,
    levels: {
            "1": {
                  "duration": 10,
                  "range": 100
            }
      },
  },
  {
    id: 'build-ensnare-trap',
    name: 'Build Ensnare Trap',
    category: 'item',
    description: '',
    iconPath: 'btncop.png',
    range: 100,
    duration: 10,
    levels: {
            "1": {
                  "duration": 10,
                  "range": 100
            }
      },
  },
  {
    id: 'build-camp-fire',
    name: 'Build Camp Fire',
    category: 'item',
    description: '',
    iconPath: 'btnfire.png',
    range: 100,
    duration: 7,
    levels: {
            "1": {
                  "duration": 7,
                  "range": 100
            }
      },
  },
  {
    id: 'build-mage-fire',
    name: 'Build Mage Fire',
    category: 'item',
    description: '',
    iconPath: 'btnfire.png',
    range: 100,
    duration: 7,
    levels: {
            "1": {
                  "duration": 7,
                  "range": 100
            }
      },
  },
  {
    id: 'build-tent',
    name: 'Build Tent',
    category: 'item',
    description: '',
    iconPath: 'btntent.png',
    range: 100,
    duration: 7,
    levels: {
            "1": {
                  "duration": 7,
                  "range": 100
            }
      },
  },
  {
    id: 'build-troll-hut',
    name: 'Build Troll Hut',
    category: 'item',
    description: '',
    iconPath: 'btnspiritlodge.png',
    range: 100,
    duration: 10,
    levels: {
            "1": {
                  "duration": 10,
                  "range": 100
            }
      },
  },
  {
    id: 'build-smoke-house',
    name: 'Build Smoke House',
    category: 'item',
    description: '',
    iconPath: 'btnrocktower.png',
    range: 100,
    duration: 8,
    levels: {
            "1": {
                  "duration": 8,
                  "range": 100
            }
      },
  },
  {
    id: 'build-storage-hut',
    name: 'Build Storage Hut',
    category: 'item',
    description: '',
    iconPath: 'btnforesttrollhut1.png',
    range: 100,
    duration: 10,
    levels: {
            "1": {
                  "duration": 10,
                  "range": 100
            }
      },
  },
  {
    id: 'build-spirit-ward',
    name: 'Build Spirit Ward',
    category: 'item',
    description: '',
    iconPath: 'btnabsorbmagic.png',
    range: 100,
    duration: 10,
    levels: {
            "1": {
                  "duration": 10,
                  "range": 100
            }
      },
  },
  {
    id: 'build-mud-hut',
    name: 'Build Mud Hut',
    category: 'item',
    description: '',
    iconPath: 'btngoldmine.png',
    range: 100,
    duration: 10,
    levels: {
            "1": {
                  "duration": 10,
                  "range": 100
            }
      },
  },
  {
    id: 'build-omnidefender',
    name: 'Build Omnidefender',
    category: 'item',
    description: '',
    iconPath: 'btnorctower.png',
    range: 100,
    duration: 10,
    levels: {
            "1": {
                  "duration": 10,
                  "range": 100
            }
      },
  },
  {
    id: 'build-mixing-pot',
    name: 'Build Mixing Pot',
    category: 'item',
    description: '',
    iconPath: 'btnsacrificialpit.png',
    range: 100,
    duration: 10,
    levels: {
            "1": {
                  "duration": 10,
                  "range": 100
            }
      },
  },
  {
    id: 'build-tannery',
    name: 'Build Tannery',
    category: 'item',
    description: '',
    iconPath: 'btnpigfarm.png',
    range: 100,
    duration: 10,
    levels: {
            "1": {
                  "duration": 10,
                  "range": 100
            }
      },
  },
  {
    id: 'build-workshop',
    name: 'Build Workshop',
    category: 'item',
    description: '',
    iconPath: 'btnorclumbermill.png',
    range: 100,
    duration: 10,
    levels: {
            "1": {
                  "duration": 10,
                  "range": 100
            }
      },
  },
  {
    id: 'build-teleport-beacon',
    name: 'Build Teleport Beacon',
    category: 'item',
    description: '',
    iconPath: 'btnenergytower.png',
    range: 100,
    duration: 10,
    levels: {
            "1": {
                  "duration": 10,
                  "range": 100
            }
      },
  },
  {
    id: 'build-witch-doctor-s-hut',
    name: 'Build Witch Doctor\'s Hut',
    category: 'item',
    description: '',
    iconPath: 'btnvoodoolounge.png',
    range: 100,
    duration: 10,
    levels: {
            "1": {
                  "duration": 10,
                  "range": 100
            }
      },
  },
  {
    id: 'build-hatchery',
    name: 'Build Hatchery',
    category: 'item',
    description: '',
    iconPath: 'btnsnowowl.png',
    range: 100,
    duration: 10,
    levels: {
            "1": {
                  "duration": 10,
                  "range": 100
            }
      },
  },
  {
    id: 'build-magic-seed',
    name: 'Build Magic Seed',
    category: 'item',
    description: '',
    iconPath: 'btnroot.png',
    range: 100,
    duration: 5,
    levels: {
            "1": {
                  "duration": 5,
                  "range": 100
            }
      },
  },
  {
    id: 'build-magic-palm-tree',
    name: 'Build Magic palm Tree',
    category: 'item',
    description: '',
    iconPath: 'btntemp.png',
    range: 100,
    duration: 5,
    levels: {
            "1": {
                  "duration": 5,
                  "range": 100
            }
      },
  },
  {
    id: 'build-forge',
    name: 'Build Forge',
    category: 'item',
    description: '',
    iconPath: 'btnforge.png',
    range: 100,
    duration: 10,
    levels: {
            "1": {
                  "duration": 10,
                  "range": 100
            }
      },
  },
  {
    id: 'spear-cast-stone',
    name: 'Spear Cast (Stone)',
    category: 'item',
    description: '',
    iconPath: 'btnthoriumranged.png',
    cooldown: 8,
    range: 1000,
    duration: 7,
    targetsAllowed: 'air,enemies,ground,neutral,organic,terrain',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 8,
                  "duration": 7,
                  "range": 1000
            }
      },
  },
  {
    id: 'magic-cast',
    name: 'Magic cast',
    category: 'item',
    description: '',
    tooltip: 'dummy spell',
    duration: 0.01,
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 0.01
            }
      },
  },
  {
    id: 'fervor-cast',
    name: 'Fervor Cast',
    category: 'item',
    description: '',
    cooldown: 5,
    levels: {
            "1": {
                  "cooldown": 5
            }
      },
  },
  {
    id: 'twin-island-potion-cast',
    name: 'Twin Island Potion Cast',
    category: 'item',
    description: '',
    tooltip: 'dummy spell',
    duration: 0.01,
    castTime: 'Abilities\\Spells\\Human\\Thunderclap\\ThunderclapCaster.mdx',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "duration": 0.01
            }
      },
  },
  {
    id: 'necromancer-s-cloak',
    name: 'Necromancer\'s Cloak',
    category: 'item',
    description: '',
    iconPath: 'btnskeletonwarrior.png',
    cooldown: 5,
    duration: 9999,
    areaOfEffect: 300,
    targetsAllowed: 'air,enemies,ground',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 5,
                  "duration": 9999,
                  "areaOfEffect": 300
            }
      },
  },
  {
    id: 'hunting-net-ensnare',
    name: 'Hunting net Ensnare',
    category: 'item',
    description: '',
    tooltip: 'Hunting net Ensnare',
    cooldown: 12,
    range: 700,
    duration: 13,
    levels: {
            "1": {
                  "cooldown": 12,
                  "duration": 13,
                  "range": 700
            }
      },
  },
  {
    id: 'disc0-ducks-pain-aura',
    name: 'Disc0-Ducks Pain Aura',
    category: 'item',
    description: '',
    areaOfEffect: 5000,
    targetsAllowed: 'air,enemies,ground,hero,invulnerable,vulnerable',
    levels: {
            "1": {
                  "areaOfEffect": 5000
            }
      },
  },
  {
    id: 'disc0-ducks-degen-aura-neutral-hostile',
    name: 'Disc0-Ducks degen Aura (Neutral Hostile)',
    category: 'item',
    description: '',
    areaOfEffect: 5000,
    targetsAllowed: 'air,enemies,ground,hero,invulnerable,vulnerable',
    levels: {
            "1": {
                  "areaOfEffect": 5000
            }
      },
  },
  {
    id: 'shadowpinion-invisibility',
    name: 'ShadowPinion Invisibility',
    category: 'item',
    description: '',
    cooldown: 45,
    duration: 6,
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 45,
                  "duration": 6
            }
      },
  },
  {
    id: 'mur-gul-hunter-throws-a-harpoon-at-the-target-with-the-lowest-amount-of-hp',
    name: 'Mur\'gul Hunter throws a harpoon at the target with the lowest amount of hp.',
    category: 'item',
    description: '',
    tooltip: 'Mur\'gul Hunter throws a harpoon at the target with the lowest amount of hp.\nDoes |cffFF020240.0|r damage and applies |cff0F61453|r stacks of poison.',
    iconPath: 'btnnagaweaponup2.png',
    cooldown: 10,
    range: 800,
    targetsAllowed: 'air,enemies,ground,neutral,organic,terrain',
    levels: {
            "1": {
                  "cooldown": 10,
                  "range": 800
            }
      },
  },
  {
    id: 'murloc-hunting-net',
    name: 'Murloc Hunting Net',
    category: 'item',
    description: '',
    tooltip: 'Murloc Hunting net Ensnare',
    cooldown: 10,
    range: 800,
    duration: 3,
    levels: {
            "1": {
                  "cooldown": 10,
                  "duration": 3,
                  "range": 800
            }
      },
  }
];

