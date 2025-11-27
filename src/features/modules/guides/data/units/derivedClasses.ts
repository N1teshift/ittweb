import { BASE_TROLL_CLASSES } from './classes';

export type DerivedClassType = 'sub' | 'super';

export type DerivedClassData = {
  slug: string;
  name: string;
  parentSlug: string;
  type: DerivedClassType;
  summary: string;
  iconSrc?: string;
  tips?: string[];
  growth: { strength: number; agility: number; intelligence: number };
  baseAttackSpeed: number;
  baseMoveSpeed: number;
  baseHp: number;
  baseMana: number;
};

export const DERIVED_CLASSES: DerivedClassData[] = [
  {
    slug: 'gurubashi-warrior',
    name: 'Gurubashi Warrior',
    parentSlug: 'hunter',
    type: 'sub',
    summary: 'Gurubashi Warrior class description coming soon.',
    growth: { strength: 16, agility: 8, intelligence: 4 },
    baseAttackSpeed: 1.5,
    baseMoveSpeed: 300,
    baseHp: 192,
    baseMana: 192,
  },
  {
    slug: 'tracker',
    name: 'Tracker',
    parentSlug: 'hunter',
    type: 'sub',
    summary: 'Tracker class description coming soon.',
    growth: { strength: 11, agility: 14, intelligence: 4 },
    baseAttackSpeed: 1.5,
    baseMoveSpeed: 310,
    baseHp: 192,
    baseMana: 192,
  },
  {
    slug: 'gurubashi-champion',
    name: 'Gurubashi Champion',
    parentSlug: 'hunter',
    type: 'super',
    summary: 'Gurubashi Champion class description coming soon.',
    growth: { strength: 28, agility: 28, intelligence: 28 },
    baseAttackSpeed: 1.5,
    baseMoveSpeed: 330,
    baseHp: 210,
    baseMana: 210,
  },
  {
    slug: 'elementalist',
    name: 'Elementalist',
    parentSlug: 'mage',
    type: 'sub',
    summary: 'Elementalist class description coming soon.',
    growth: { strength: 4, agility: 4, intelligence: 18 },
    baseAttackSpeed: 1.5,
    baseMoveSpeed: 280,
    baseHp: 192,
    baseMana: 192,
  },
  {
    slug: 'hypnotist',
    name: 'Hypnotist',
    parentSlug: 'mage',
    type: 'sub',
    summary: 'Hypnotist class description coming soon.',
    growth: { strength: 8, agility: 4, intelligence: 18 },
    baseAttackSpeed: 1.5,
    baseMoveSpeed: 280,
    baseHp: 192,
    baseMana: 192,
  },
  {
    slug: 'dreamwalker',
    name: 'Dreamwalker',
    parentSlug: 'mage',
    type: 'sub',
    summary: 'Dreamwalker class description coming soon.',
    growth: { strength: 8, agility: 7, intelligence: 18 },
    baseAttackSpeed: 1.5,
    baseMoveSpeed: 280,
    baseHp: 192,
    baseMana: 192,
  },
  {
    slug: 'dementia-master',
    name: 'Dementia Master',
    parentSlug: 'mage',
    type: 'super',
    summary: 'Dementia Master class description coming soon.',
    growth: { strength: 11, agility: 11, intelligence: 11 },
    baseAttackSpeed: 1.5,
    baseMoveSpeed: 300,
    baseHp: 210,
    baseMana: 210,
  },
  {
    slug: 'booster',
    name: 'Booster',
    parentSlug: 'priest',
    type: 'sub',
    summary: 'Booster class description coming soon.',
    growth: { strength: 12, agility: 5, intelligence: 11 },
    baseAttackSpeed: 1.5,
    baseMoveSpeed: 280,
    baseHp: 192,
    baseMana: 192,
  },
  {
    slug: 'master-healer',
    name: 'Master Healer',
    parentSlug: 'priest',
    type: 'sub',
    summary: 'Master Healer class description coming soon.',
    growth: { strength: 8, agility: 4, intelligence: 14 },
    baseAttackSpeed: 1.5,
    baseMoveSpeed: 280,
    baseHp: 192,
    baseMana: 192,
  },
  {
    slug: 'sage',
    name: 'Sage',
    parentSlug: 'priest',
    type: 'super',
    summary: 'Sage class description coming soon.',
    growth: { strength: 17, agility: 17, intelligence: 17 },
    baseAttackSpeed: 1.5,
    baseMoveSpeed: 300,
    baseHp: 210,
    baseMana: 210,
  },
  {
    slug: 'druid',
    name: 'Druid',
    parentSlug: 'beastmaster',
    type: 'sub',
    summary: 'Druid class description coming soon.',
    growth: { strength: 13, agility: 12, intelligence: 13 },
    baseAttackSpeed: 1.5,
    baseMoveSpeed: 300,
    baseHp: 192,
    baseMana: 192,
  },
  {
    slug: 'jungle-tyrant',
    name: 'Jungle Tyrant',
    parentSlug: 'beastmaster',
    type: 'super',
    summary: 'Jungle Tyrant class description coming soon.',
    growth: { strength: 28, agility: 28, intelligence: 28 },
    baseAttackSpeed: 1.5,
    baseMoveSpeed: 330,
    baseHp: 210,
    baseMana: 210,
  },
  {
    slug: 'rogue',
    name: 'Rogue',
    parentSlug: 'thief',
    type: 'sub',
    summary: 'Rogue class description coming soon.',
    growth: { strength: 6, agility: 19, intelligence: 4 },
    baseAttackSpeed: 1.5,
    baseMoveSpeed: 300,
    baseHp: 192,
    baseMana: 192,
  },
  {
    slug: 'assassin',
    name: 'Assassin',
    parentSlug: 'thief',
    type: 'super',
    summary: 'Assassin class description coming soon.',
    growth: { strength: 17, agility: 17, intelligence: 17 },
    baseAttackSpeed: 1.5,
    baseMoveSpeed: 300,
    baseHp: 210,
    baseMana: 210,
  },
  {
    slug: 'trapper',
    name: 'Trapper',
    parentSlug: 'scout',
    type: 'sub',
    summary: 'Trapper class description coming soon.',
    growth: { strength: 11, agility: 14, intelligence: 12 },
    baseAttackSpeed: 1.5,
    baseMoveSpeed: 300,
    baseHp: 192,
    baseMana: 192,
  },
  {
    slug: 'spy',
    name: 'Spy',
    parentSlug: 'scout',
    type: 'super',
    summary: 'Spy class description coming soon.',
    growth: { strength: 20, agility: 20, intelligence: 20 },
    baseAttackSpeed: 1.5,
    baseMoveSpeed: 330,
    baseHp: 210,
    baseMana: 210,
  },
  {
    slug: 'herb-master',
    name: 'Herb Master',
    parentSlug: 'gatherer',
    type: 'sub',
    summary: 'Herb Master class description coming soon.',
    growth: { strength: 11, agility: 10, intelligence: 12 },
    baseAttackSpeed: 1.5,
    baseMoveSpeed: 300,
    baseHp: 192,
    baseMana: 192,
  },
  {
    slug: 'radar-gatherer',
    name: 'Radar Gatherer',
    parentSlug: 'gatherer',
    type: 'sub',
    summary: 'Radar Gatherer class description coming soon.',
    growth: { strength: 10, agility: 11, intelligence: 12 },
    baseAttackSpeed: 1.5,
    baseMoveSpeed: 310,
    baseHp: 192,
    baseMana: 192,
  },
  {
    slug: 'alchemist',
    name: 'Alchemist',
    parentSlug: 'gatherer',
    type: 'sub',
    summary: 'Alchemist class description coming soon.',
    growth: { strength: 9, agility: 10, intelligence: 16 },
    baseAttackSpeed: 1.5,
    baseMoveSpeed: 310,
    baseHp: 192,
    baseMana: 192,
  },
  {
    slug: 'omni-gatherer',
    name: 'Omni Gatherer',
    parentSlug: 'gatherer',
    type: 'super',
    summary: 'Omni Gatherer class description coming soon.',
    growth: { strength: 22, agility: 22, intelligence: 22 },
    baseAttackSpeed: 1.5,
    baseMoveSpeed: 300,
    baseHp: 210,
    baseMana: 210,
  }
];

export const SUBCLASS_SLUGS = DERIVED_CLASSES
  .filter(cls => cls.type === 'sub')
  .map(cls => cls.slug);

export const SUPERCLASS_SLUGS = DERIVED_CLASSES
  .filter(cls => cls.type === 'super')
  .map(cls => cls.slug);

export function getDerivedClassBySlug(slug: string): DerivedClassData | undefined {
  return DERIVED_CLASSES.find(c => c.slug === slug);
}

export function getSubclassesByParentSlug(parentSlug: string): DerivedClassData[] {
  const byParentSlug = DERIVED_CLASSES.filter(c => c.parentSlug === parentSlug && c.type === 'sub');
  const baseClass = BASE_TROLL_CLASSES.find(c => c.slug === parentSlug);
  if (baseClass && baseClass.subclasses && baseClass.subclasses.length > 0) {
    const fromBaseClass = baseClass.subclasses
      .map(slug => DERIVED_CLASSES.find(c => c.slug === slug && c.type === 'sub'))
      .filter((c) => c !== undefined);
    const all = [...byParentSlug, ...fromBaseClass];
    return all.filter((c, index, self) => 
      index === self.findIndex(d => d.slug === c.slug)
    );
  }
  return byParentSlug;
}

export function getSupersByParentSlug(parentSlug: string): DerivedClassData[] {
  const byParentSlug = DERIVED_CLASSES.filter(c => c.parentSlug === parentSlug && c.type === 'super');
  const baseClass = BASE_TROLL_CLASSES.find(c => c.slug === parentSlug);
  if (baseClass && baseClass.superclasses && baseClass.superclasses.length > 0) {
    const fromBaseClass = baseClass.superclasses
      .map(slug => DERIVED_CLASSES.find(c => c.slug === slug && c.type === 'super'))
      .filter((c) => c !== undefined);
    const all = [...byParentSlug, ...fromBaseClass];
    return all.filter((c, index, self) => 
      index === self.findIndex(d => d.slug === c.slug)
    );
  }
  return byParentSlug;
}
