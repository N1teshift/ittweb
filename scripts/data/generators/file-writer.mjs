/**
 * File writer - generates TypeScript files for items, abilities, and units
 */

import fs from 'fs';
import { escapeString } from '../lib/utils.mjs';

/**
 * Write TypeScript file with items
 */
export function writeItemsFile(filePath, items, category) {
  const content = `import type { ItemData } from '@/types/items';

export const ${category.toUpperCase().replace(/-/g, '_')}_ITEMS: ItemData[] = [
${items.map(item => {
  const lines = [`  {`];
  lines.push(`    id: '${item.id}',`);
  lines.push(`    name: '${escapeString(item.name)}',`);
  lines.push(`    category: '${item.category}',`);
  if (item.subcategory) {
    lines.push(`    subcategory: '${item.subcategory}',`);
  }
  if (item.description) {
    lines.push(`    description: '${escapeString(item.description)}',`);
  } else {
    lines.push(`    description: '',`);
  }
  if (item.tooltip) {
    lines.push(`    tooltip: '${escapeString(item.tooltip)}',`);
  }
  if (item.iconPath) {
    lines.push(`    iconPath: '${item.iconPath}',`);
  }
  if (item.recipe && item.recipe.length > 0) {
    lines.push(`    recipe: [${item.recipe.map(r => `'${r}'`).join(', ')}],`);
  }
  if (item.craftedAt) {
    lines.push(`    craftedAt: '${item.craftedAt}',`);
  }
  if (item.mixingPotManaRequirement !== undefined) {
    lines.push(`    mixingPotManaRequirement: ${item.mixingPotManaRequirement},`);
  }
  // Cost information
  if (item.cost !== undefined && item.cost > 0) {
    lines.push(`    cost: ${item.cost},`);
  }
  if (item.lumberCost !== undefined && item.lumberCost > 0) {
    lines.push(`    lumberCost: ${item.lumberCost},`);
  }
  // Usage information
  if (item.hotkey) {
    lines.push(`    hotkey: '${item.hotkey}',`);
  }
  if (item.uses !== undefined && item.uses > 0) {
    lines.push(`    uses: ${item.uses},`);
  }
  if (item.hitPoints !== undefined && item.hitPoints > 0) {
    lines.push(`    hitPoints: ${item.hitPoints},`);
  }
  if (item.maxStack !== undefined && item.maxStack > 0) {
    lines.push(`    maxStack: ${item.maxStack},`);
  }
  // Stock information
  if (item.stockMaximum !== undefined && item.stockMaximum > 0) {
    lines.push(`    stockMaximum: ${item.stockMaximum},`);
  }
  if (item.stockReplenishInterval !== undefined && item.stockReplenishInterval > 0) {
    lines.push(`    stockReplenishInterval: ${item.stockReplenishInterval},`);
  }
  // Abilities
  if (item.abilities && Array.isArray(item.abilities) && item.abilities.length > 0) {
    lines.push(`    abilities: [${item.abilities.map(a => `'${a}'`).join(', ')}],`);
  }
  // Stats
  if (item.stats && Object.keys(item.stats).length > 0) {
    const statsLines = ['    stats: {'];
    const statEntries = [];
    if (item.stats.damage !== undefined) statEntries.push(`      damage: ${item.stats.damage}`);
    if (item.stats.armor !== undefined) statEntries.push(`      armor: ${item.stats.armor}`);
    if (item.stats.health !== undefined) statEntries.push(`      health: ${item.stats.health}`);
    if (item.stats.mana !== undefined) statEntries.push(`      mana: ${item.stats.mana}`);
    if (item.stats.strength !== undefined) statEntries.push(`      strength: ${item.stats.strength}`);
    if (item.stats.agility !== undefined) statEntries.push(`      agility: ${item.stats.agility}`);
    if (item.stats.intelligence !== undefined) statEntries.push(`      intelligence: ${item.stats.intelligence}`);
    if (item.stats.attackSpeed !== undefined) statEntries.push(`      attackSpeed: ${item.stats.attackSpeed}`);
    if (item.stats.other && Array.isArray(item.stats.other) && item.stats.other.length > 0) {
      statEntries.push(`      other: [${item.stats.other.map(o => `'${escapeString(o)}'`).join(', ')}]`);
    }
    statsLines.push(statEntries.join(',\n'));
    statsLines.push('    },');
    lines.push(statsLines.join('\n'));
  }
  lines.push(`  }`);
  return lines.join('\n');
}).join(',\n')}
];
`;
  
  fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * Write TypeScript file with abilities
 */
export function writeAbilitiesFile(filePath, abilities, category) {
  const constName = category.toUpperCase().replace(/-/g, '_') + '_ABILITIES';
  
  const content = `import type { AbilityData } from './types';

export const ${constName}: AbilityData[] = [
${abilities.map(ability => {
  const lines = [`  {`];
  lines.push(`    id: '${ability.id}',`);
  lines.push(`    name: '${escapeString(ability.name)}',`);
  lines.push(`    category: '${ability.category}',`);
  if (ability.classRequirement) {
    lines.push(`    classRequirement: '${ability.classRequirement}',`);
  }
  if (ability.description) {
    lines.push(`    description: '${escapeString(ability.description)}',`);
  } else {
    lines.push(`    description: '',`);
  }
  if (ability.tooltip) {
    lines.push(`    tooltip: '${escapeString(ability.tooltip)}',`);
  }
  if (ability.iconPath) {
    lines.push(`    iconPath: '${ability.iconPath}',`);
  }
  if (ability.manaCost !== undefined) {
    lines.push(`    manaCost: ${ability.manaCost},`);
  }
  if (ability.cooldown !== undefined) {
    lines.push(`    cooldown: ${ability.cooldown},`);
  }
  if (ability.range !== undefined) {
    lines.push(`    range: ${ability.range},`);
  }
  if (ability.duration !== undefined) {
    lines.push(`    duration: ${ability.duration},`);
  }
  if (ability.damage !== undefined) {
    lines.push(`    damage: '${ability.damage}',`);
  }
  if (ability.areaOfEffect !== undefined) {
    lines.push(`    areaOfEffect: ${ability.areaOfEffect},`);
  }
  if (ability.maxTargets !== undefined) {
    lines.push(`    maxTargets: ${ability.maxTargets},`);
  }
  if (ability.hotkey) {
    lines.push(`    hotkey: '${ability.hotkey}',`);
  }
  if (ability.targetsAllowed) {
    lines.push(`    targetsAllowed: '${escapeString(ability.targetsAllowed)}',`);
  }
  if (ability.castTime !== undefined) {
    if (typeof ability.castTime === 'string') {
      lines.push(`    castTime: '${escapeString(ability.castTime)}',`);
    } else {
      lines.push(`    castTime: ${ability.castTime},`);
    }
  }
  if (ability.levels && Object.keys(ability.levels).length > 0) {
    const levelsStr = JSON.stringify(ability.levels, null, 6).split('\n').map((line, idx) => idx === 0 ? line : '      ' + line).join('\n');
    lines.push(`    levels: ${levelsStr},`);
  }
  if (ability.availableToClasses && ability.availableToClasses.length > 0) {
    lines.push(`    availableToClasses: [${ability.availableToClasses.map(c => `'${c}'`).join(', ')}],`);
  }
  if (ability.spellbook) {
    lines.push(`    spellbook: '${ability.spellbook}',`);
  }
  if (ability.visualEffects) {
    const visualEffectsStr = JSON.stringify(ability.visualEffects, null, 6).split('\n').map((line, idx) => idx === 0 ? line : '      ' + line).join('\n');
    lines.push(`    visualEffects: ${visualEffectsStr},`);
  }
  if (ability.buttonPosition) {
    lines.push(`    buttonPosition: { x: ${ability.buttonPosition.x}, y: ${ability.buttonPosition.y} },`);
  }
  lines.push(`  }`);
  return lines.join('\n');
}).join(',\n')}
];
`;
  
  fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * Write TypeScript file with base classes
 */
export function writeClassesFile(filePath, classes) {
  const content = `export type TrollClassData = {
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
${classes.map(cls => {
  const lines = [`  {`];
  lines.push(`    slug: '${cls.slug}',`);
  lines.push(`    name: '${escapeString(cls.name)}',`);
  lines.push(`    summary: '${escapeString(cls.summary)}',`);
  if (cls.iconSrc) {
    lines.push(`    iconSrc: '${cls.iconSrc}',`);
  }
  lines.push(`    subclasses: [${cls.subclasses.map(s => `'${s}'`).join(', ')}],`);
  if (cls.superclasses && cls.superclasses.length > 0) {
    lines.push(`    superclasses: [${cls.superclasses.map(s => `'${s}'`).join(', ')}],`);
  }
  if (cls.tips && cls.tips.length > 0) {
    lines.push(`    tips: [${cls.tips.map(t => `'${escapeString(t)}'`).join(', ')}],`);
  }
  lines.push(`    growth: { strength: ${cls.growth.strength}, agility: ${cls.growth.agility}, intelligence: ${cls.growth.intelligence} },`);
  lines.push(`    baseAttackSpeed: ${cls.baseAttackSpeed},`);
  lines.push(`    baseMoveSpeed: ${cls.baseMoveSpeed},`);
  lines.push(`    baseHp: ${cls.baseHp},`);
  lines.push(`    baseMana: ${cls.baseMana},`);
  lines.push(`  }`);
  return lines.join('\n');
}).join(',\n')}
];

export const BASE_TROLL_CLASS_SLUGS: string[] = BASE_TROLL_CLASSES.map(c => c.slug);

export function getClassBySlug(slug: string): TrollClassData | undefined {
  return BASE_TROLL_CLASSES.find(c => c.slug === slug);
}
`;
  
  fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * Write TypeScript file with derived classes
 */
export function writeDerivedClassesFile(filePath, classes) {
  const content = `import { BASE_TROLL_CLASSES } from './classes';

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
${classes.map(cls => {
  const lines = [`  {`];
  lines.push(`    slug: '${cls.slug}',`);
  lines.push(`    name: '${escapeString(cls.name)}',`);
  lines.push(`    parentSlug: '${cls.parentSlug}',`);
  lines.push(`    type: '${cls.type}',`);
  lines.push(`    summary: '${escapeString(cls.summary)}',`);
  if (cls.iconSrc) {
    lines.push(`    iconSrc: '${cls.iconSrc}',`);
  }
  if (cls.tips && cls.tips.length > 0) {
    lines.push(`    tips: [${cls.tips.map(t => `'${escapeString(t)}'`).join(', ')}],`);
  }
  lines.push(`    growth: { strength: ${cls.growth.strength}, agility: ${cls.growth.agility}, intelligence: ${cls.growth.intelligence} },`);
  lines.push(`    baseAttackSpeed: ${cls.baseAttackSpeed},`);
  lines.push(`    baseMoveSpeed: ${cls.baseMoveSpeed},`);
  lines.push(`    baseHp: ${cls.baseHp},`);
  lines.push(`    baseMana: ${cls.baseMana},`);
  lines.push(`  }`);
  return lines.join('\n');
}).join(',\n')}
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
`;
  
  fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * Write TypeScript file with all units
 */
export function writeAllUnitsFile(filePath, units) {
  const content = `export type UnitType = 'troll' | 'animal' | 'boss' | 'building' | 'unit-dummy-item-reward' | 'dummy' | 'other';

export type UnitData = {
  id: string;
  name: string;
  description?: string;
  tooltip?: string;
  iconPath?: string;
  race?: string;
  classification?: string;
  type: UnitType;
  // Primary attributes
  strength?: number;
  agility?: number;
  intelligence?: number;
  strengthPerLevel?: number;
  agilityPerLevel?: number;
  intelligencePerLevel?: number;
  // Combat stats
  hp?: number;
  mana?: number;
  armor?: number;
  damageMin?: number;
  damageMax?: number;
  attackCooldown?: number;
  attackRange?: number;
  acquisitionRange?: number;
  attackType?: 'normal' | 'pierce' | 'siege' | 'magic' | 'chaos' | 'hero' | string;
  defenseType?: 'unarmored' | 'light' | 'medium' | 'heavy' | 'fortified' | 'hero' | string;
  // Movement stats
  moveSpeed?: number;
  turnRate?: number;
  collisionSize?: number;
  // Vision stats
  sightRangeDay?: number;
  sightRangeNight?: number;
  // Cost/resource stats
  goldCost?: number;
  lumberCost?: number;
  foodCost?: number;
  buildTime?: number;
  // Abilities
  abilities?: string[];
  // Classification flags
  isBuilding?: boolean;
  isFlyer?: boolean;
  isWorker?: boolean;
  canAttack?: boolean;
  canHarvest?: boolean;
  // Legacy fields (for backward compatibility)
  attackSpeed?: number;
  damage?: number | string;
  craftableItems?: string[];
};

export const ALL_UNITS: UnitData[] = [
${units.map(unit => {
  const lines = [`  {`];
  lines.push(`    id: '${unit.id}',`);
  lines.push(`    name: '${escapeString(unit.name)}',`);
  if (unit.description) {
    lines.push(`    description: '${escapeString(unit.description)}',`);
  }
  if (unit.tooltip) {
    lines.push(`    tooltip: '${escapeString(unit.tooltip)}',`);
  }
  if (unit.iconPath) {
    lines.push(`    iconPath: '${unit.iconPath}',`);
  }
  if (unit.race) {
    lines.push(`    race: '${unit.race}',`);
  }
  if (unit.classification) {
    lines.push(`    classification: '${unit.classification}',`);
  }
  lines.push(`    type: '${unit.type}',`);
  // Primary attributes
  if (unit.strength !== undefined) {
    lines.push(`    strength: ${unit.strength},`);
  }
  if (unit.agility !== undefined) {
    lines.push(`    agility: ${unit.agility},`);
  }
  if (unit.intelligence !== undefined) {
    lines.push(`    intelligence: ${unit.intelligence},`);
  }
  if (unit.strengthPerLevel !== undefined) {
    lines.push(`    strengthPerLevel: ${unit.strengthPerLevel},`);
  }
  if (unit.agilityPerLevel !== undefined) {
    lines.push(`    agilityPerLevel: ${unit.agilityPerLevel},`);
  }
  if (unit.intelligencePerLevel !== undefined) {
    lines.push(`    intelligencePerLevel: ${unit.intelligencePerLevel},`);
  }
  // Combat stats
  if (unit.hp !== undefined) {
    lines.push(`    hp: ${unit.hp},`);
  }
  if (unit.mana !== undefined) {
    lines.push(`    mana: ${unit.mana},`);
  }
  if (unit.armor !== undefined) {
    lines.push(`    armor: ${unit.armor},`);
  }
  if (unit.damageMin !== undefined) {
    lines.push(`    damageMin: ${unit.damageMin},`);
  }
  if (unit.damageMax !== undefined) {
    lines.push(`    damageMax: ${unit.damageMax},`);
  }
  if (unit.attackCooldown !== undefined) {
    lines.push(`    attackCooldown: ${unit.attackCooldown},`);
  }
  if (unit.attackRange !== undefined) {
    lines.push(`    attackRange: ${unit.attackRange},`);
  }
  if (unit.acquisitionRange !== undefined) {
    lines.push(`    acquisitionRange: ${unit.acquisitionRange},`);
  }
  if (unit.attackType !== undefined && unit.attackType !== '') {
    lines.push(`    attackType: '${unit.attackType}',`);
  }
  if (unit.defenseType !== undefined && unit.defenseType !== '') {
    lines.push(`    defenseType: '${unit.defenseType}',`);
  }
  // Movement stats
  if (unit.moveSpeed !== undefined) {
    lines.push(`    moveSpeed: ${unit.moveSpeed},`);
  }
  if (unit.turnRate !== undefined) {
    lines.push(`    turnRate: ${unit.turnRate},`);
  }
  if (unit.collisionSize !== undefined) {
    lines.push(`    collisionSize: ${unit.collisionSize},`);
  }
  // Vision stats
  if (unit.sightRangeDay !== undefined) {
    lines.push(`    sightRangeDay: ${unit.sightRangeDay},`);
  }
  if (unit.sightRangeNight !== undefined) {
    lines.push(`    sightRangeNight: ${unit.sightRangeNight},`);
  }
  // Cost/resource stats
  if (unit.goldCost !== undefined && unit.goldCost > 0) {
    lines.push(`    goldCost: ${unit.goldCost},`);
  }
  if (unit.lumberCost !== undefined && unit.lumberCost > 0) {
    lines.push(`    lumberCost: ${unit.lumberCost},`);
  }
  if (unit.foodCost !== undefined && unit.foodCost > 0) {
    lines.push(`    foodCost: ${unit.foodCost},`);
  }
  if (unit.buildTime !== undefined) {
    lines.push(`    buildTime: ${unit.buildTime},`);
  }
  // Abilities
  if (unit.abilities && unit.abilities.length > 0) {
    lines.push(`    abilities: [${unit.abilities.map(a => `'${a}'`).join(', ')}],`);
  }
  // Classification flags
  if (unit.isBuilding === true) {
    lines.push(`    isBuilding: true,`);
  }
  if (unit.isFlyer === true) {
    lines.push(`    isFlyer: true,`);
  }
  if (unit.isWorker === true) {
    lines.push(`    isWorker: true,`);
  }
  if (unit.canAttack === true) {
    lines.push(`    canAttack: true,`);
  }
  if (unit.canHarvest === true) {
    lines.push(`    canHarvest: true,`);
  }
  // Legacy fields (for backward compatibility)
  if (unit.attackSpeed !== undefined) {
    lines.push(`    attackSpeed: ${unit.attackSpeed},`);
  }
  if (unit.damage !== undefined) {
    if (typeof unit.damage === 'string') {
      lines.push(`    damage: '${unit.damage}',`);
    } else {
      lines.push(`    damage: ${unit.damage},`);
    }
  }
  if (unit.craftableItems && unit.craftableItems.length > 0) {
    lines.push(`    craftableItems: [${unit.craftableItems.map(item => `'${item}'`).join(', ')}],`);
  }
  lines.push(`  }`);
  return lines.join('\n');
}).join(',\n')}
];

export function getUnitById(id: string): UnitData | undefined {
  return ALL_UNITS.find(u => u.id === id);
}

export function getUnitsByType(type: UnitType): UnitData[] {
  return ALL_UNITS.filter(u => u.type === type);
}

export function searchUnits(query: string): UnitData[] {
  const lowercaseQuery = query.toLowerCase();
  return ALL_UNITS.filter(unit => 
    unit.name.toLowerCase().includes(lowercaseQuery) ||
    unit.description?.toLowerCase().includes(lowercaseQuery) ||
    unit.race?.toLowerCase().includes(lowercaseQuery)
  );
}
`;
  
  fs.writeFileSync(filePath, content, 'utf-8');
}

