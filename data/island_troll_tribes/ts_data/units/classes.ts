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
    summary: 'Hunter class description coming soon.',
    subclasses: [],
    growth: { strength: 1.3, agility: 1.2, intelligence: 0.5 },
    baseAttackSpeed: 1.5,
    baseMoveSpeed: 290,
    baseHp: 192,
    baseMana: 192,
  },
  {
    slug: 'mage',
    name: 'Mage',
    summary: 'Mage class description coming soon.',
    subclasses: [],
    growth: { strength: 0.5, agility: 0.5, intelligence: 2 },
    baseAttackSpeed: 1.5,
    baseMoveSpeed: 290,
    baseHp: 192,
    baseMana: 192,
  },
  {
    slug: 'priest',
    name: 'Priest',
    summary: 'Priest class description coming soon.',
    subclasses: [],
    growth: { strength: 0.6, agility: 0.4, intelligence: 1.35 },
    baseAttackSpeed: 1.5,
    baseMoveSpeed: 290,
    baseHp: 192,
    baseMana: 192,
  },
  {
    slug: 'beastmaster',
    name: 'Beastmaster',
    summary: 'Beastmaster class description coming soon.',
    subclasses: [],
    growth: { strength: 1.2, agility: 1, intelligence: 0.5 },
    baseAttackSpeed: 1.5,
    baseMoveSpeed: 290,
    baseHp: 192,
    baseMana: 192,
  },
  {
    slug: 'thief',
    name: 'Thief',
    summary: 'Thief class description coming soon.',
    subclasses: [],
    growth: { strength: 0.75, agility: 1.5, intelligence: 0.5 },
    baseAttackSpeed: 1.5,
    baseMoveSpeed: 290,
    baseHp: 192,
    baseMana: 192,
  },
  {
    slug: 'scout',
    name: 'Scout',
    summary: 'Scout class description coming soon.',
    subclasses: [],
    growth: { strength: 1, agility: 1.3, intelligence: 1.2 },
    baseAttackSpeed: 1.5,
    baseMoveSpeed: 290,
    baseHp: 192,
    baseMana: 192,
  },
  {
    slug: 'gatherer',
    name: 'Gatherer',
    summary: 'Gatherer class description coming soon.',
    subclasses: [],
    growth: { strength: 0.8, agility: 0.9, intelligence: 1.5 },
    baseAttackSpeed: 1.5,
    baseMoveSpeed: 290,
    baseHp: 192,
    baseMana: 192,
  }
];

export const BASE_TROLL_CLASS_SLUGS: string[] = BASE_TROLL_CLASSES.map(c => c.slug);

export function getClassBySlug(slug: string): TrollClassData | undefined {
  return BASE_TROLL_CLASSES.find(c => c.slug === slug);
}
