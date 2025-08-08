export type TrollClassData = {
  slug: string;
  name: string;
  summary: string;
  subclasses: string[];
  superclasses?: string[];
  tips?: string[];
  growth: { strength: number; agility: number; intelligence: number };
  baseAttackSpeed: number;
  baseMoveSpeed: number;
  baseHp: number;
  baseMana: number;
};

export const BASE_TROLL_CLASSES: TrollClassData[] = [
  {
    slug: 'hunter',
    name: 'Hunter',
    summary:
      'Fast, high base damage; excels at early combat. Gains Track and Net for chase and control.',
    subclasses: ['Warrior', 'Tracker'],
    superclasses: ['Juggernaut'],
    tips: [
      'Highest base damage and fast attack speed.',
      'Levels the fastest; strong early aggression.',
      'Trackers work well against Thief.',
    ],
    growth: { strength: 1.3, agility: 1.2, intelligence: 0.5 },
    baseAttackSpeed: 1.75,
    baseMoveSpeed: 300,
    baseHp: 192,
    baseMana: 192,
  },
  {
    slug: 'beastmaster',
    name: 'Beastmaster',
    summary:
      'Tames pets and leverages Spirit of the Beast; flexible damage and utility.',
    subclasses: ['Shapeshifter (Wolf/Bear/Panther/Tiger)', 'Druid'],
    superclasses: ['Jungle Tyrant'],
    tips: [
      'High base damage; passively slows nearby animals.',
      'Versatile support/escape/chase options when subclassed.',
    ],
    growth: { strength: 1.2, agility: 1.0, intelligence: 0.5 },
    baseAttackSpeed: 1.77,
    baseMoveSpeed: 300,
    baseHp: 192,
    baseMana: 192,
  },
  {
    slug: 'mage',
    name: 'Mage',
    summary: 'Offensive spellcaster with strong burst but limited energy.',
    subclasses: ['Elementalist', 'Hypnotist', 'Dreamwalker'],
    superclasses: ['Dementia Master'],
    tips: [
      'Good versus melee opponents; carry mana potions.',
      'Weak to Mage Masher (burn/silence).',
      'Can use Mage Fire to cook food on the spot.',
    ],
    growth: { strength: 0.5, agility: 0.5, intelligence: 2.0 },
    baseAttackSpeed: 1.77,
    baseMoveSpeed: 270,
    baseHp: 192,
    baseMana: 192,
  },
  {
    slug: 'priest',
    name: 'Priest',
    summary:
      'Support-focused class with buffs and healing; shines when subclassed.',
    subclasses: ['Booster', 'Master Healer'],
    superclasses: ['Sage'],
    tips: [
      'Low base damage and attack speed; normalizes when subclassed.',
      'Master Healer focuses on healing/mix; Booster provides offensive buffs.',
    ],
    growth: { strength: 0.6, agility: 0.4, intelligence: 1.35 },
    baseAttackSpeed: 1.8,
    baseMoveSpeed: 270,
    baseHp: 192,
    baseMana: 192,
  },
  {
    slug: 'thief',
    name: 'Thief',
    summary:
      'Evasive gatherer with Blink and Cloak; excels at disruption and theft.',
    subclasses: ['Rogue', 'TeleThief', 'Escape Artist', 'Contortionist'],
    superclasses: ['Assassin'],
    tips: [
      'Powerful but often misused; best at demolition and early denial.',
      "Steal stones/mana crystals to slow enemy base growth.",
    ],
    growth: { strength: 0.75, agility: 1.5, intelligence: 0.5 },
    baseAttackSpeed: 1.8,
    baseMoveSpeed: 300,
    baseHp: 192,
    baseMana: 192,
  },
  {
    slug: 'scout',
    name: 'Scout',
    summary: 'Vision control specialist with enemy detection and reveals.',
    subclasses: ['Observer', 'Trapper'],
    superclasses: ['Spy'],
    tips: [
      'Weak unsub; strong map control and warding when subclassed.',
      'Good at finding enemy bases using radar.',
    ],
    growth: { strength: 1.0, agility: 1.3, intelligence: 1.2 },
    baseAttackSpeed: 1.8,
    baseMoveSpeed: 300,
    baseHp: 192,
    baseMana: 192,
  },
  {
    slug: 'gatherer',
    name: 'Gatherer',
    summary:
      'Crafting and item-focused class; base building and economy powerhouse.',
    subclasses: ['Radar Gatherer', 'Herb Master', 'Alchemist'],
    superclasses: ['OmniGatherer'],
    tips: [
      'Weak unsub; later can solo hunt with items.',
      'Radar pings/reveals items; Alchemist conjures potion effects via Philosopher’s Stone.',
    ],
    growth: { strength: 0.8, agility: 0.9, intelligence: 1.5 },
    baseAttackSpeed: 2.0,
    baseMoveSpeed: 300,
    baseHp: 192,
    baseMana: 192,
  },
];

export const BASE_TROLL_CLASS_SLUGS = BASE_TROLL_CLASSES.map((c) => c.slug);

export function getClassBySlug(slug: string): TrollClassData | undefined {
  return BASE_TROLL_CLASSES.find((c) => c.slug === slug);
}


