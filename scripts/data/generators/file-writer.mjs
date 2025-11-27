/**
 * File writer - generates TypeScript files for items, abilities, and units
 */

import fs from 'fs';
import { escapeString } from '../utils.mjs';

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
  hp?: number;
  mana?: number;
  armor?: number;
  moveSpeed?: number;
  attackSpeed?: number;
  damage?: number;
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
  if (unit.hp !== undefined) {
    lines.push(`    hp: ${unit.hp},`);
  }
  if (unit.mana !== undefined) {
    lines.push(`    mana: ${unit.mana},`);
  }
  if (unit.armor !== undefined) {
    lines.push(`    armor: ${unit.armor},`);
  }
  if (unit.moveSpeed !== undefined) {
    lines.push(`    moveSpeed: ${unit.moveSpeed},`);
  }
  if (unit.attackSpeed !== undefined) {
    lines.push(`    attackSpeed: ${unit.attackSpeed},`);
  }
  if (unit.damage !== undefined) {
    lines.push(`    damage: ${unit.damage},`);
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

