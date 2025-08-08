export type DerivedClassType = 'sub' | 'super';

export type DerivedClassData = {
  slug: string;
  name: string;
  parentSlug: string; // base class slug
  type: DerivedClassType;
  summary: string;
  tips?: string[];
  growth: { strength: number; agility: number; intelligence: number };
  baseAttackSpeed: number;
  baseMoveSpeed: number;
  baseHp: number;
  baseMana: number;
};

export const DERIVED_CLASSES: DerivedClassData[] = [
  // Hunter tree
  { slug: 'warrior', name: 'Warrior', parentSlug: 'hunter', type: 'sub', summary: 'Tanking and smashing enemies with damage reduction and cleaving hits; straightforward fighter.', growth: { strength: 2.0, agility: 1.0, intelligence: 0.5 }, baseAttackSpeed: 1.95, baseMoveSpeed: 300, baseHp: 192, baseMana: 192 },
  { slug: 'tracker', name: 'Tracker', parentSlug: 'hunter', type: 'sub', summary: 'Chaser who excels at locating and sticking to targets; strong anti-Thief utility.', growth: { strength: 1.3, agility: 1.7, intelligence: 0.5 }, baseAttackSpeed: 1.75, baseMoveSpeed: 310, baseHp: 192, baseMana: 192 },
  { slug: 'juggernaut', name: 'Juggernaut', parentSlug: 'hunter', type: 'super', summary: 'Best fighter; big, fast, and hits very hard.', growth: { strength: 2.5, agility: 1.5, intelligence: 0.5 }, baseAttackSpeed: 1.95, baseMoveSpeed: 330, baseHp: 210, baseMana: 210 },

  // Beastmaster tree
  { slug: 'druid', name: 'Druid', parentSlug: 'beastmaster', type: 'sub', summary: 'Nature- and pet-focused support; turns the battle with allies and pets.', growth: { strength: 1.6, agility: 1.4, intelligence: 1.6 }, baseAttackSpeed: 1.85, baseMoveSpeed: 300, baseHp: 192, baseMana: 192 },
  { slug: 'shapeshifter-wolf', name: 'Shapeshifter (Wolf)', parentSlug: 'beastmaster', type: 'sub', summary: 'Wolf form with lifesteal and ferocity; mobile duelist.', growth: { strength: 1.5, agility: 1.4, intelligence: 0.5 }, baseAttackSpeed: 1.5, baseMoveSpeed: 310, baseHp: 192, baseMana: 192 },
  { slug: 'shapeshifter-bear', name: 'Shapeshifter (Bear)', parentSlug: 'beastmaster', type: 'sub', summary: 'Bear form; strong and durable frontline.', growth: { strength: 2.5, agility: 0.3, intelligence: 0.5 }, baseAttackSpeed: 2.2, baseMoveSpeed: 300, baseHp: 192, baseMana: 192 },
  { slug: 'shapeshifter-panther', name: 'Shapeshifter (Panther)', parentSlug: 'beastmaster', type: 'sub', summary: 'Panther form; stealthy predator with prowl.', growth: { strength: 1.0, agility: 2.0, intelligence: 0.5 }, baseAttackSpeed: 1.65, baseMoveSpeed: 320, baseHp: 192, baseMana: 192 },
  { slug: 'shapeshifter-tiger', name: 'Shapeshifter (Tiger)', parentSlug: 'beastmaster', type: 'sub', summary: 'Tiger form; vicious strikes and high burst.', growth: { strength: 2.0, agility: 1.0, intelligence: 0.5 }, baseAttackSpeed: 1.75, baseMoveSpeed: 320, baseHp: 192, baseMana: 192 },
  { slug: 'dire-wolf', name: 'Dire Wolf', parentSlug: 'beastmaster', type: 'sub', summary: 'Permanent wolf; consumes raw meat and uses meat-based abilities.', growth: { strength: 1.5, agility: 1.4, intelligence: 0.5 }, baseAttackSpeed: 1.5, baseMoveSpeed: 310, baseHp: 192, baseMana: 192 },
  { slug: 'dire-bear', name: 'Dire Bear', parentSlug: 'beastmaster', type: 'sub', summary: 'Permanent bear; very sturdy with defensive tools.', growth: { strength: 2.5, agility: 0.3, intelligence: 0.5 }, baseAttackSpeed: 2.2, baseMoveSpeed: 300, baseHp: 192, baseMana: 192 },
  { slug: 'jungle-tyrant', name: 'Jungle Tyrant', parentSlug: 'beastmaster', type: 'super', summary: 'Second-best fighter; absorbs animal genes and gains abilities based on prey consumed.', growth: { strength: 2.5, agility: 2.2, intelligence: 2.0 }, baseAttackSpeed: 1.75, baseMoveSpeed: 330, baseHp: 210, baseMana: 210 },

  // Mage tree
  { slug: 'elementalist', name: 'Elementalist', parentSlug: 'mage', type: 'sub', summary: 'Controls elements for powerful damage spells.', growth: { strength: 0.5, agility: 0.5, intelligence: 2.25 }, baseAttackSpeed: 1.8, baseMoveSpeed: 280, baseHp: 192, baseMana: 192 },
  { slug: 'hypnotist', name: 'Hypnotist', parentSlug: 'mage', type: 'sub', summary: 'Mind controller; drains energy and applies crowd control.', growth: { strength: 1.0, agility: 0.5, intelligence: 2.25 }, baseAttackSpeed: 1.8, baseMoveSpeed: 280, baseHp: 192, baseMana: 192 },
  { slug: 'dreamwalker', name: 'Dreamwalker', parentSlug: 'mage', type: 'sub', summary: 'Manipulates dreams; siphons health and energy from enemies.', growth: { strength: 1.0, agility: 0.8, intelligence: 2.25 }, baseAttackSpeed: 1.8, baseMoveSpeed: 280, baseHp: 192, baseMana: 192 },
  { slug: 'dementia-master', name: 'Dementia Master', parentSlug: 'mage', type: 'super', summary: 'Dark magic specialist with many damaging spells.', growth: { strength: 1.0, agility: 1.0, intelligence: 3.0 }, baseAttackSpeed: 1.8, baseMoveSpeed: 300, baseHp: 210, baseMana: 210 },

  // Priest tree
  { slug: 'booster', name: 'Booster', parentSlug: 'priest', type: 'sub', summary: 'Offensive buffer; empowers allies with combat buffs.', growth: { strength: 1.5, agility: 0.6, intelligence: 1.35 }, baseAttackSpeed: 1.75, baseMoveSpeed: 280, baseHp: 192, baseMana: 192 },
  { slug: 'master-healer', name: 'Master Healer', parentSlug: 'priest', type: 'sub', summary: 'Healing specialist; can mix/restore mana and heat.', growth: { strength: 1.0, agility: 0.5, intelligence: 1.75 }, baseAttackSpeed: 1.8, baseMoveSpeed: 280, baseHp: 192, baseMana: 192 },
  { slug: 'sage', name: 'Sage', parentSlug: 'priest', type: 'super', summary: 'Pinnacle shaman; many different buffs and healing spells.', growth: { strength: 1.5, agility: 1.0, intelligence: 3.0 }, baseAttackSpeed: 1.75, baseMoveSpeed: 300, baseHp: 210, baseMana: 210 },

  // Thief tree
  { slug: 'rogue', name: 'Rogue', parentSlug: 'thief', type: 'sub', summary: 'Adapts thief skills for combat; strong maneuvering.', growth: { strength: 0.75, agility: 2.3, intelligence: 0.5 }, baseAttackSpeed: 1.8, baseMoveSpeed: 300, baseHp: 192, baseMana: 192 },
  { slug: 'telethief', name: 'TeleThief', parentSlug: 'thief', type: 'sub', summary: 'Dimensional magic; utility teleports and mobility.', growth: { strength: 1.0, agility: 1.5, intelligence: 1.5 }, baseAttackSpeed: 1.75, baseMoveSpeed: 300, baseHp: 192, baseMana: 192 },
  { slug: 'escape-artist', name: 'Escape Artist', parentSlug: 'thief', type: 'sub', summary: 'Physical speed and strength; excels at escaping.', growth: { strength: 1.0, agility: 1.0, intelligence: 1.0 }, baseAttackSpeed: 1.85, baseMoveSpeed: 300, baseHp: 192, baseMana: 192 },
  { slug: 'contortionist', name: 'Contortionist', parentSlug: 'thief', type: 'sub', summary: 'Magic-based evasion and escape tools.', growth: { strength: 1.0, agility: 1.0, intelligence: 1.0 }, baseAttackSpeed: 1.85, baseMoveSpeed: 300, baseHp: 192, baseMana: 192 },
  { slug: 'assassin', name: 'Assassin', parentSlug: 'thief', type: 'super', summary: 'Combines physical prowess and magic; stealth and high burst (backstab).', growth: { strength: 1.5, agility: 2.5, intelligence: 1.5 }, baseAttackSpeed: 1.85, baseMoveSpeed: 300, baseHp: 210, baseMana: 210 },

  // Scout tree
  { slug: 'observer', name: 'Observer', parentSlug: 'scout', type: 'sub', summary: 'Vision control; deploys wards and reveals areas.', growth: { strength: 1.3, agility: 1.7, intelligence: 1.5 }, baseAttackSpeed: 1.8, baseMoveSpeed: 300, baseHp: 192, baseMana: 192 },
  { slug: 'trapper', name: 'Trapper', parentSlug: 'scout', type: 'sub', summary: 'Advanced radar and traps to reveal/slow enemies.', growth: { strength: 1.3, agility: 1.7, intelligence: 1.5 }, baseAttackSpeed: 1.8, baseMoveSpeed: 300, baseHp: 192, baseMana: 192 },
  { slug: 'spy', name: 'Spy', parentSlug: 'scout', type: 'super', summary: 'Best radar and reveals; hiding from Spy is nearly impossible.', growth: { strength: 1.8, agility: 2.2, intelligence: 1.9 }, baseAttackSpeed: 1.7, baseMoveSpeed: 330, baseHp: 210, baseMana: 210 },

  // Gatherer tree
  { slug: 'radar-gatherer', name: 'Radar Gatherer', parentSlug: 'gatherer', type: 'sub', summary: 'Improved item radar; Tele-Gather to fires (no herbs).', growth: { strength: 1.25, agility: 1.35, intelligence: 1.5 }, baseAttackSpeed: 1.8, baseMoveSpeed: 310, baseHp: 192, baseMana: 192 },
  { slug: 'herb-master', name: 'Herb Master', parentSlug: 'gatherer', type: 'sub', summary: 'Tele-Gather herbs and mix anywhere.', growth: { strength: 1.35, agility: 1.25, intelligence: 1.5 }, baseAttackSpeed: 1.8, baseMoveSpeed: 300, baseHp: 192, baseMana: 192 },
  { slug: 'alchemist', name: 'Alchemist', parentSlug: 'gatherer', type: 'sub', summary: 'Uses Philosopher’s Stone energy to conjure potion effects.', growth: { strength: 1.1, agility: 1.2, intelligence: 2.0 }, baseAttackSpeed: 1.8, baseMoveSpeed: 310, baseHp: 192, baseMana: 192 },
  { slug: 'omnigatherer', name: 'OmniGatherer', parentSlug: 'gatherer', type: 'super', summary: 'Has all gatherer abilities and can warp items around.', growth: { strength: 2.0, agility: 2.0, intelligence: 2.0 }, baseAttackSpeed: 1.7, baseMoveSpeed: 300, baseHp: 210, baseMana: 210 },
];

export const SUBCLASS_SLUGS = DERIVED_CLASSES.filter(c => c.type === 'sub').map(c => c.slug);
export const SUPERCLASS_SLUGS = DERIVED_CLASSES.filter(c => c.type === 'super').map(c => c.slug);

export function getDerivedBySlug(slug: string): DerivedClassData | undefined {
  return DERIVED_CLASSES.find(c => c.slug === slug);
}

export function getSubclassesByParentSlug(parentSlug: string): DerivedClassData[] {
  return DERIVED_CLASSES.filter(c => c.parentSlug === parentSlug && c.type === 'sub');
}

export function getSupersByParentSlug(parentSlug: string): DerivedClassData[] {
  return DERIVED_CLASSES.filter(c => c.parentSlug === parentSlug && c.type === 'super');
}


