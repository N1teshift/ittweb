export type TrollClassData = {
  slug: string;
  name: string;
  summary: string;
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
    summary: 'Fast and strong,the hunter is hard to beat in battle. He has the Net ability allowing him to hunt easier and catch enemies, he can learn Track which amplifies damage and gives vision on target. A good damage class.',
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
    summary: 'Slow with moderate damage,the Troll Mage is equipped with more offensive spells than the Priest. He has Null Damage and can learn many Offensive Spells. A good damage class.',
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
    summary: 'Slow with low damage,the Troll Priest has many buff and healing spells. He has The Glow,which increases movement rate of nearby allies,and can learn many Defensive Spells. A good support class.',
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
    summary: 'Fast and strong,the Beastmaster can tame pet which assist him in battle. His regular skill Spirit of the Beast gives 5% per level better chance to find babies and attracts wild animals. A good damage class.',
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
    summary: 'Weak in battle but good at escaping,the thief has a short ranged Blink and can learn a short term Cloak. He is good at stealing item and has the best night vision. A good gathering class.',
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
    summary: 'Weak in battle,the scout is a good vision controller. He has an Enemy Detector and can learn Reveal which reveals the area around it. He is good at locating enemies and animals. A good gathering class.',
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
    summary: 'Weak in battle,the gatherer is good at gathering items and crafting stuff. He can learn Radar Manipulations which uses the minimap to find items. A good gathering class. // Sub Classes ToolTip',
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

