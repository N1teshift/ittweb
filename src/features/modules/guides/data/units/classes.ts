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
    subclasses: ['gurubashi-warrior', 'tracker'],
    superclasses: ['gurubashi-champion'],
    growth: { strength: 4, agility: 4, intelligence: 2 },
    baseAttackSpeed: 1.5,
    baseMoveSpeed: 300,
    baseHp: 192,
    baseMana: 192,
  },
  {
    slug: 'mage',
    name: 'Mage',
    summary: 'Mage class description coming soon.',
    subclasses: ['elementalist', 'hypnotist', 'dreamwalker'],
    superclasses: ['dementia-master'],
    growth: { strength: 2, agility: 2, intelligence: 6 },
    baseAttackSpeed: 1.5,
    baseMoveSpeed: 270,
    baseHp: 192,
    baseMana: 192,
  },
  {
    slug: 'priest',
    name: 'Priest',
    summary: 'Priest class description coming soon.',
    subclasses: ['booster', 'master-healer'],
    superclasses: ['sage'],
    growth: { strength: 2, agility: 2, intelligence: 5 },
    baseAttackSpeed: 1.5,
    baseMoveSpeed: 270,
    baseHp: 192,
    baseMana: 192,
  },
  {
    slug: 'beastmaster',
    name: 'Beastmaster',
    summary: 'Beastmaster class description coming soon.',
    subclasses: ['druid', 'shapeshifter', 'dire-wolf', 'dire-bear'],
    superclasses: ['jungle-tyrant'],
    growth: { strength: 4, agility: 3, intelligence: 2 },
    baseAttackSpeed: 1.5,
    baseMoveSpeed: 300,
    baseHp: 192,
    baseMana: 192,
  },
  {
    slug: 'thief',
    name: 'Thief',
    summary: 'Thief class description coming soon.',
    subclasses: ['rogue', 'escape-artist', 'contortionist', 'telethief'],
    superclasses: ['assassin'],
    growth: { strength: 3, agility: 5, intelligence: 2 },
    baseAttackSpeed: 1.5,
    baseMoveSpeed: 300,
    baseHp: 192,
    baseMana: 192,
  },
  {
    slug: 'scout',
    name: 'Scout',
    summary: 'Scout class description coming soon.',
    subclasses: ['observer', 'trapper', 'hawk'],
    superclasses: ['spy'],
    growth: { strength: 3, agility: 4, intelligence: 4 },
    baseAttackSpeed: 1.5,
    baseMoveSpeed: 300,
    baseHp: 192,
    baseMana: 192,
  },
  {
    slug: 'gatherer',
    name: 'Gatherer',
    summary: 'Gatherer class description coming soon.',
    subclasses: ['radar-gatherer', 'herb-master', 'alchemist'],
    superclasses: ['omni-gatherer'],
    growth: { strength: 3, agility: 3, intelligence: 5 },
    baseAttackSpeed: 1.5,
    baseMoveSpeed: 300,
    baseHp: 192,
    baseMana: 192,
  }
];

export const BASE_TROLL_CLASS_SLUGS: string[] = BASE_TROLL_CLASSES.map(c => c.slug);

export function getClassBySlug(slug: string): TrollClassData | undefined {
  return BASE_TROLL_CLASSES.find(c => c.slug === slug);
}
