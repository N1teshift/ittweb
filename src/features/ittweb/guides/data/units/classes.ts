export type TrollClassData = {
  slug: string;
  name: string;
  summary: string;
  // Optional explicit icon path, e.g. "/icons/itt/trolls/btnorcwarlock.png"
  iconSrc?: string;
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
    summary: 'Extracted from game source.',
    subclasses: ['warrior', 'tracker'],
    superclasses: ['juggernaut'],
    growth: { strength: 1.3, agility: 1.2, intelligence: 0.5 },
    baseAttackSpeed: 1.8,
    baseMoveSpeed: 290,
    baseHp: 192,
    baseMana: 192,
  },
  {
    slug: 'mage',
    name: 'Mage',
    summary: 'Extracted from game source.',
    subclasses: ['elementalist', 'hypnotist', 'dreamwalker'],
    superclasses: ['dementia-master'],
    growth: { strength: 0.5, agility: 0.5, intelligence: 2.0 },
    baseAttackSpeed: 1.8,
    baseMoveSpeed: 290,
    baseHp: 192,
    baseMana: 192,
  },
  {
    slug: 'priest',
    name: 'Priest',
    summary: 'Extracted from game source.',
    subclasses: ['booster', 'master-healer'],
    superclasses: ['sage'],
    growth: { strength: 0.6, agility: 0.4, intelligence: 1.35 },
    baseAttackSpeed: 1.8,
    baseMoveSpeed: 290,
    baseHp: 192,
    baseMana: 192,
  },
  {
    slug: 'beastmaster',
    name: 'Beastmaster',
    summary: 'Extracted from game source.',
    subclasses: ['druid', 'shapeshifter-wolf', 'shapeshifter-bear', 'shapeshifter-panther', 'shapeshifter-tiger', 'dire-wolf', 'dire-bear'],
    superclasses: ['jungle-tyrant'],
    growth: { strength: 1.2, agility: 1.0, intelligence: 0.5 },
    baseAttackSpeed: 1.8,
    baseMoveSpeed: 290,
    baseHp: 192,
    baseMana: 192,
  },
  {
    slug: 'thief',
    name: 'Thief',
    summary: 'Extracted from game source.',
    subclasses: ['rogue', 'telethief', 'escape-artist', 'contortionist'],
    superclasses: ['assassin'],
    growth: { strength: 0.75, agility: 1.5, intelligence: 0.5 },
    baseAttackSpeed: 1.8,
    baseMoveSpeed: 290,
    baseHp: 192,
    baseMana: 192,
  },
  {
    slug: 'scout',
    name: 'Scout',
    summary: 'Extracted from game source.',
    subclasses: ['observer', 'trapper'],
    superclasses: ['spy'],
    growth: { strength: 1.0, agility: 1.3, intelligence: 1.2 },
    baseAttackSpeed: 1.8,
    baseMoveSpeed: 290,
    baseHp: 192,
    baseMana: 192,
  },
  {
    slug: 'gatherer',
    name: 'Gatherer',
    summary: 'Extracted from game source.',
    subclasses: ['radar-gatherer', 'herb-master', 'alchemist'],
    superclasses: ['omnigatherer'],
    growth: { strength: 0.8, agility: 0.9, intelligence: 1.5 },
    baseAttackSpeed: 1.8,
    baseMoveSpeed: 290,
    baseHp: 192,
    baseMana: 192,
  },
];

// Helper functions
export function getClassBySlug(slug: string): TrollClassData | undefined {
  return BASE_TROLL_CLASSES.find(cls => cls.slug === slug);
}

export const BASE_TROLL_CLASS_SLUGS = BASE_TROLL_CLASSES.map(cls => cls.slug);
