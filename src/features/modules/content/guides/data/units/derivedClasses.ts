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
    summary: 'The Warrior is adept at tanking and smashing enemies. He gets damage reduction and his attack can hit enemies around him ,however he cant use track anymore. A pretty straight forward class.',
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
    summary: 'The Tracker is adept at chasing and tracking enemies. He got a nice spell kit allowing him to track down enemy troll.',
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
    summary: 'The Juggernaut is the best fighting class in the game, he is big, he is fast and he hit really hard.',
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
    summary: 'The Elementalist is adept at controlling the elements,allowing him to cast powerful damage dealing spells.',
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
    summary: 'The Hypnotist is adept at controlling enemies thoughts and emotions. He can easily zap enemies energy by means of depression and got some crowd controll spells.',
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
    summary: 'Dreamwalker has control over dreams, both his and his enemies. He can consume dreams of his enemies stealing their health and energy.',
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
    summary: 'The Dementia Master spent too much time studying dark magic and trying to talk with being from another world, he got alot of damage dealing spells.',
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
    summary: 'The Booster is adept at buffing up allies with magic spells. He doesnt have any healing spells,but he gets more offensive buffs.',
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
    summary: 'The Master Healer is adept at healing allies with magic spells. He also has spells allowing him to mix/restore his mana and heat.',
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
    summary: 'The Sage has reached the pinnacle of the Troll Shamanic Art, he can use ALOT of different buffs and healing spells.',
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
    summary: 'The Druid is focused on using nature and his pets to support his team and turn the battle in his favor.',
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
    summary: 'When the Beastmaster spend too much time in company of the wild, he start looking and behaving like a wild animal, the Jungle Tyrant is the second best fighting class in the game, he can absord hostile animal gene pool by eating them and gains an ability based on which type of animal he ate.',
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
    summary: 'Rogue has developed formidable combat skills as well as adapted his thiefs skills to help him in combat. Rogue is adept at physical combat and maneuvering.',
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
    summary: 'The Assassin has combined the physical strength with the evasion magic, he has alot of escaping spells, but also the ability to backstab enemy for a big burst of damage.',
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
    summary: 'The Trapper got an advanced radar allowing him to locate precisely animals and enemies. He also has the ability to place traps which either reveals enemy position or slow them down.',
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
    summary: 'The Spy got the best radar and reveal possible,its nearly impossible to hide from him',
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
    summary: 'The Herb Master Tele-Gatherers can mix herbs wherever they go. He can learn Tele-Gathering,a spell allowing him to teleport items picked up to a fire. Can tele-gather herbs. // SupserSub Classes ToolTip',
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
    summary: 'The Radar is adept at locating and gathering items, he got an improved Item Radar and he can learn Tele-Gathering,a spell allowing him to teleport items picked up to a fire. Cannot tele-gather herbs.',
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
    summary: 'The Alchemist has discovered the secret of the Philosophers Stone which allows him to conjure potion effects.',
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
    summary: 'The Omni Gatherer got all the gatherer abilities possible, he can also warp items around him when he gets lazy.',
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

