import type { AbilityData } from './types';

export const BUFF_ABILITIES: AbilityData[] = [
  {
    id: 'attack-damage-bonus-10',
    name: 'Attack Damage Bonus +10',
    category: 'buff',
    description: '',
  },
  {
    id: 'armor-bonus-4',
    name: 'Armor Bonus + 4',
    category: 'buff',
    description: '',
  },
  {
    id: 'armor-bonus-2',
    name: 'Armor Bonus + 2',
    category: 'buff',
    description: '',
    castTime: 'Models\\CarapaceEffect.mdx',
  },
  {
    id: 'sustained-manacost-10-per-second-replenishes-health-to-the-master-healer-and-nearby-allies-2e135d90',
    name: 'Sustained manacost: 10 per second   Replenishes health to the Master Healer and nearby allies, healing 1 + 8%xIntelligence health per second.  Drains mana until deactivated.',
    category: 'buff',
    description: '',
    tooltip: '|cffFFD700Sustained manacost:|r |cff7DBEF110|r per second |n|nReplenishes health to the Master Healer and nearby allies, healing |cff1FBF001|r + |cff1FBF008%|rx|cff00EAFFIntelligence|r health per second. |nDrains mana until deactivated.',
    iconPath: 'btnholybolt.png',
    manaCost: 20,
    cooldown: 5,
    areaOfEffect: 1,
    hotkey: 'D',
    levels: {
            "1": {
                  "manaCost": 20,
                  "cooldown": 5,
                  "areaOfEffect": 1
            }
      },
  },
  {
    id: 'while-in-dream-world-dreamwalker-deals-additional-magic-damage-to-enemies-equal-to-0-1xinte-5ac916cf',
    name: 'While in Dream World, Dreamwalker deals additional magic damage to enemies equal to 0.1xIntelligence with every attack.\nDamage and manacost is doubled at lvl |cFFFFCC004\nCosts 0.1xIntelligence mana.',
    category: 'buff',
    description: '',
    tooltip: 'While in Dream World, Dreamwalker deals additional magic damage to enemies equal to |cffFF02020.1|rx|cff00EAFFIntelligence|r with every attack.\nDamage and manacost is doubled at lvl |cFFFFCC004|r\nCosts |cff7DBEF10.1|rx|cff00EAFFIntelligence|r mana.',
    iconPath: 'btnshamanadept.png',
    areaOfEffect: 1,
    hotkey: 'D',
    levels: {
            "1": {
                  "manaCost": 0,
                  "cooldown": 0,
                  "areaOfEffect": 1
            }
      },
  },
  {
    id: 'movement-speed-bonus-per-lvl',
    name: 'Movement speed bonus per lvl',
    category: 'buff',
    description: '',
  },
  {
    id: 'attack-speed-increase-30',
    name: 'Attack Speed Increase 30',
    category: 'buff',
    description: '',
  },
  {
    id: 'when-a-thief-decides-that-physical-strength-and-speed-are-the-key-to-thievery-he-become-an-8a758f92',
    name: 'When a thief decides that physical strength and speed are the key to thievery, he become an Escape Artist. The Escape Artist is adept at using pure physical power to escape from enemies. Can only choose 1 subClass!',
    category: 'buff',
    description: '',
    tooltip: 'When a thief decides that physical strength and speed are the key to thievery, he become an Escape Artist. The Escape Artist is adept at using pure physical power to escape from enemies. |cffFF0202Can only choose 1 subClass!|r|cff7DBEF1\n\nDifficulty: |r|cff1FBF00Easy|r',
    iconPath: 'btndarktroll.png',
    hotkey: 'Q',
  },
  {
    id: 'the-assassin-has-combined-the-physical-strength-with-the-evasion-magic-he-has-alot-of-escap-4d244bba',
    name: 'The Assassin has combined the physical strength with the evasion magic, he has alot of escaping spells,but also the ability to backstab enemy for a big burst of damage.',
    category: 'buff',
    description: '',
    tooltip: 'The Assassin has combined the physical strength with the evasion magic, he has alot of escaping spells,but also the ability to backstab enemy for a big burst of damage.|cff7DBEF1\n\nDifficulty: |r|cffFF0202Hard|r',
    iconPath: 'btndarktrolltrapper.png',
    hotkey: 'E',
  },
  {
    id: 'armor-bonus-1',
    name: 'Armor Bonus + 1',
    category: 'buff',
    description: '',
  },
  {
    id: 'armor-bonus-3',
    name: 'Armor Bonus + 3',
    category: 'buff',
    description: '',
  },
  {
    id: 'armor-bonus-5',
    name: 'Armor Bonus + 5',
    category: 'buff',
    description: '',
  },
  {
    id: 'armor-bonus-6',
    name: 'Armor Bonus + 6',
    category: 'buff',
    description: '',
  },
  {
    id: 'armor-bonus-7',
    name: 'Armor Bonus + 7',
    category: 'buff',
    description: '',
  },
  {
    id: 'armor-bonus-10',
    name: 'Armor Bonus + 10',
    category: 'buff',
    description: '',
  },
  {
    id: 'all-stats-3',
    name: 'All Stats + 3',
    category: 'buff',
    description: '',
  },
  {
    id: 'all-stats-4',
    name: 'All Stats + 4',
    category: 'buff',
    description: '',
  },
  {
    id: 'strength-8',
    name: 'Strength + 8',
    category: 'buff',
    description: '',
  },
  {
    id: 'strength-10',
    name: 'Strength + 10',
    category: 'buff',
    description: '',
  },
  {
    id: 'strength-12',
    name: 'Strength + 12',
    category: 'buff',
    description: '',
  },
  {
    id: 'intelligence-2',
    name: 'Intelligence + 2',
    category: 'buff',
    description: '',
  },
  {
    id: 'intelligence-5',
    name: 'Intelligence + 5',
    category: 'buff',
    description: '',
  },
  {
    id: 'intelligence-8',
    name: 'Intelligence + 8',
    category: 'buff',
    description: '',
  },
  {
    id: 'intelligence-10',
    name: 'Intelligence + 10',
    category: 'buff',
    description: '',
  },
  {
    id: 'agility-4',
    name: 'Agility + 4',
    category: 'buff',
    description: '',
  },
  {
    id: 'agility-6',
    name: 'Agility + 6',
    category: 'buff',
    description: '',
  },
  {
    id: 'agility-8',
    name: 'Agility + 8',
    category: 'buff',
    description: '',
  },
  {
    id: 'movement-speed-bonus-60',
    name: 'Movement Speed Bonus 60',
    category: 'buff',
    description: '',
  },
  {
    id: 'movement-speed-bonus-70',
    name: 'Movement Speed Bonus 70',
    category: 'buff',
    description: '',
  },
  {
    id: 'movement-speed-bonus-80',
    name: 'Movement Speed Bonus 80',
    category: 'buff',
    description: '',
  },
  {
    id: 'movement-speed-bonus-100',
    name: 'Movement Speed Bonus 100',
    category: 'buff',
    description: '',
  },
  {
    id: 'attack-speed-increase-10',
    name: 'Attack Speed Increase 10',
    category: 'buff',
    description: '',
  },
  {
    id: 'attack-speed-increase-15',
    name: 'Attack Speed Increase 15',
    category: 'buff',
    description: '',
  },
  {
    id: 'attack-speed-increase-20',
    name: 'Attack Speed Increase 20',
    category: 'buff',
    description: '',
  },
  {
    id: 'attack-speed-reduction-20',
    name: 'Attack Speed Reduction 20',
    category: 'buff',
    description: '',
  },
  {
    id: 'attack-speed-increase-25',
    name: 'Attack Speed Increase 25',
    category: 'buff',
    description: '',
  },
  {
    id: 'attack-speed-increase-35',
    name: 'Attack Speed Increase 35',
    category: 'buff',
    description: '',
  },
  {
    id: 'attack-speed-increase-100',
    name: 'Attack Speed Increase 100',
    category: 'buff',
    description: '',
  }
];

