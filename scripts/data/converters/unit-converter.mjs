/**
 * Unit converter - converts extracted unit data to TypeScript format
 * Handles troll classes, units, and class relationships
 */

import { slugify, convertIconPath, getField } from '../lib/utils.mjs';

// Class relationships (source of truth for subclass/superclass mappings)
export const CLASS_RELATIONSHIPS = {
  hunter: {
    name: 'Hunter',
    subclasses: ['gurubashi-warrior', 'tracker'],
    superclass: 'gurubashi-champion'
  },
  mage: {
    name: 'Mage',
    subclasses: ['elementalist', 'hypnotist', 'dreamwalker'],
    superclass: 'dementia-master'
  },
  priest: {
    name: 'Priest',
    subclasses: ['booster', 'master-healer'],
    superclass: 'sage'
  },
  beastmaster: {
    name: 'Beastmaster',
    subclasses: ['druid', 'shapeshifter', 'dire-wolf', 'dire-bear'],
    superclass: 'jungle-tyrant'
  },
  thief: {
    name: 'Thief',
    subclasses: ['rogue', 'escape-artist', 'contortionist', 'telethief'],
    superclass: 'assassin'
  },
  scout: {
    name: 'Scout',
    subclasses: ['observer', 'trapper', 'hawk'],
    superclass: 'spy'
  },
  gatherer: {
    name: 'Gatherer',
    subclasses: ['radar-gatherer', 'herb-master', 'alchemist'],
    superclass: 'omni-gatherer'
  }
};

// Reverse mapping: subclass/superclass slug -> parent base class slug
export const DERIVED_TO_PARENT = (() => {
  const mapping = {};
  for (const [baseSlug, rel] of Object.entries(CLASS_RELATIONSHIPS)) {
    for (const subSlug of rel.subclasses) {
      mapping[subSlug] = { parent: baseSlug, type: 'sub' };
    }
    if (rel.superclass) {
      mapping[rel.superclass] = { parent: baseSlug, type: 'super' };
    }
  }
  return mapping;
})();

/**
 * Convert base class unit to TypeScript TrollClassData format
 */
export function convertBaseClass(unit, allUnits) {
  const slug = slugify(unit.id || unit.name || 'unknown-class');
  const relationship = CLASS_RELATIONSHIPS[slug];
  const subclasses = relationship?.subclasses || [];
  const superclasses = relationship?.superclass ? [relationship.superclass] : [];
  
  // Clean up description: remove color codes and normalize
  let description = unit.summary || unit.description || '';
  if (description) {
    // Remove Warcraft 3 color codes (|r, |cAARRGGBB, etc.)
    description = description.replace(/\|r/g, '').replace(/\|[cC][0-9A-Fa-f]{8}/g, '');
    // Normalize whitespace
    description = description.replace(/\s+/g, ' ').trim();
  }
  
  return {
    slug: slug,
    name: (unit.name || '').trim(),
    summary: description || `${unit.name} class description coming soon.`,
    iconSrc: undefined,
    subclasses: subclasses,
    superclasses: superclasses.length > 0 ? superclasses : undefined,
    tips: unit.tips || undefined,
    growth: {
      strength: unit.growth?.strength ?? 1.0,
      agility: unit.growth?.agility ?? 1.0,
      intelligence: unit.growth?.intelligence ?? 1.0,
    },
    baseAttackSpeed: unit.baseAttackSpeed ?? 1.5,
    baseMoveSpeed: unit.baseMoveSpeed ?? 290,
    baseHp: unit.baseHp ?? 192,
    baseMana: unit.baseMana ?? 192,
  };
}

/**
 * Convert derived class (subclass/superclass) unit to TypeScript DerivedClassData format
 */
export function convertDerivedClass(unit, allUnits) {
  const slug = slugify(unit.id || unit.name || 'unknown-class');
  const derivedInfo = DERIVED_TO_PARENT[slug];
  const parentSlug = derivedInfo?.parent || 'unknown';
  const derivedType = derivedInfo?.type || (unit.type === 'superclass' ? 'super' : 'sub');
  
  // Clean up description: remove color codes and normalize
  let description = unit.summary || unit.description || '';
  if (description) {
    // Remove Warcraft 3 color codes (|r, |cAARRGGBB, etc.)
    description = description.replace(/\|r/g, '').replace(/\|[cC][0-9A-Fa-f]{8}/g, '');
    // Normalize whitespace
    description = description.replace(/\s+/g, ' ').trim();
  }
  
  return {
    slug: slug,
    name: (unit.name || '').trim(),
    parentSlug: parentSlug,
    type: derivedType,
    summary: description || `${unit.name} class description coming soon.`,
    iconSrc: undefined,
    tips: unit.tips || undefined,
    growth: {
      strength: unit.growth?.strength ?? 1.0,
      agility: unit.growth?.agility ?? 1.0,
      intelligence: unit.growth?.intelligence ?? 1.0,
    },
    baseAttackSpeed: unit.baseAttackSpeed ?? 1.5,
    baseMoveSpeed: unit.baseMoveSpeed ?? 290,
    baseHp: unit.baseHp ?? 192,
    baseMana: unit.baseMana ?? 192,
  };
}

/**
 * Determine unit type based on name, race, and classification
 */
export function determineUnitType(unit) {
  const name = (unit.name || '').toLowerCase();
  const race = (unit.race || '').toLowerCase();
  const classification = (unit.classification || '').toLowerCase();
  
  if (name.includes('unit_dummy_item_reward') || name.startsWith('unit dummy item reward')) {
    return 'unit-dummy-item-reward';
  }
  
  if (name.includes('dummy')) {
    return 'dummy';
  }
  
  const buildingKeywords = ['hut', 'totem', 'fire', 'beacon', 'tower', 'house', 'lodge', 
                            'workshop', 'armory', 'forge', 'tannery', 'pot', 'ward', 'kit', 'hatchery'];
  if ((classification.includes('townhall') || classification.includes('structure') || 
      classification.includes('mechanical') || classification.includes('sapper') ||
      name.includes('indicator') || name.includes('holder') || name.includes('altar') ||
      buildingKeywords.some(keyword => name.includes(keyword))) &&
      !name.includes('living clay')) {
    return 'building';
  }
  
  const animalExclusions = ['form', 'trap', 'beastmaster', 'dire wolf', 'dire bear'];
  const isHawkAnimal = (name.includes('hawk hatchling') || name.includes('tamed hawk') || 
                        name.includes('alpha hawk'));
  const animalKeywords = ['deer', 'bear', 'wolf', 'panther', 'tiger', 'elk', 'boar', 
                          'bird', 'snake', 'fish', 'beast', 'creature', 'animal',
                          'fawn', 'dragon', 'hatchling', 'tamed'];
  if ((animalKeywords.some(keyword => name.includes(keyword)) || race === 'creeps' || isHawkAnimal) &&
      !animalExclusions.some(exclusion => name.includes(exclusion))) {
    return 'animal';
  }
  
  if (name === 'the one') {
    return 'boss';
  }
  const bossKeywords = ['boss', 'ancient', 'lord', 'tyrant', 'hydra', 'alligator'];
  if ((bossKeywords.some(keyword => name.includes(keyword)) || classification.includes('ancient')) &&
      !name.includes('beastmaster') && !name.includes('jungle tyrant')) {
    return 'boss';
  }
  
  const nonTrollKeywords = ['merchant', 'ship', 'transport', 'afterimage', 'random', 'repick', 'picker'];
  if (nonTrollKeywords.some(keyword => name.includes(keyword))) {
    return 'other';
  }
  
  if (name.includes('trap') && !name.includes('trapper')) {
    return 'other';
  }
  
  if (name.includes('troll') && !name.includes('hut') && !name.includes('totem') && 
      !name.includes('fire') && !name.includes('merchant') && !name.includes('ship')) {
    return 'troll';
  }
  
  const trollClassKeywords = [
    'hunter', 'mage', 'priest', 'thief', 'scout', 'gatherer', 'beastmaster',
    'warrior', 'champion', 'gurubashi',
    'tracker', 'trapper', 'spy',
    'elementalist', 'hypnotist', 'dreamwalker', 'dementia', 'booster', 'healer', 'sage', 'druid',
    'rogue', 'escape artist', 'contortionist', 'assassin',
    'herb master', 'alchemist',
    'form', 'dire wolf', 'dire bear',
    'hawk',
    'jungle tyrant'
  ];
  
  if ((trollClassKeywords.some(keyword => name.includes(keyword)) || race === 'orc') &&
      !isHawkAnimal && !name.includes('dire bear bee')) {
    const isTrap = name.includes('trap') && !name.includes('trapper');
    if (!buildingKeywords.some(keyword => name.includes(keyword)) &&
        !nonTrollKeywords.some(keyword => name.includes(keyword)) &&
        !isTrap) {
      return 'troll';
    }
  }
  
  return 'other';
}

/**
 * Extract unit stats from raw data (fallback if stats not in extractedUnit)
 */
export function extractUnitStats(unit) {
  const raw = unit.raw || [];
  const getUnitField = (fieldId) => getField(raw, fieldId, 0);
  
  return {
    hp: getUnitField('uhpm') || getUnitField('uhpr'),
    mana: getUnitField('umpm') || getUnitField('umpr'),
    armor: getUnitField('udef'),
    moveSpeed: getUnitField('umvs'),
    attackSpeed: getUnitField('ubsa'),
    damage: getUnitField('ua1b') || getUnitField('ua1d'),
  };
}

/**
 * Calculate damage range from base and dice values
 */
function calculateDamageRange(damageBase, damageDice) {
  if (damageBase === undefined && damageDice === undefined) return undefined;
  const base = damageBase || 0;
  const dice = damageDice || 0;
  const min = base;
  const max = base + dice;
  return { min, max };
}

/**
 * Convert extracted unit to TypeScript UnitData format
 */
export function convertUnit(extractedUnit, udirCounter, buildingsMap) {
  // Use stats from extractedUnit (from enhanced extraction), fallback to extractUnitStats if needed
  const fallbackStats = extractUnitStats(extractedUnit);
  const unitType = determineUnitType(extractedUnit);
  
  let unitName = (extractedUnit.name || '').trim();
  let unitId = extractedUnit.id || slugify(unitName || 'unknown-unit');
  
  if (unitType === 'unit-dummy-item-reward') {
    const originalId = extractedUnit.id || unitId;
    if (!udirCounter.has(originalId)) {
      udirCounter.set(originalId, udirCounter.size + 1);
    }
    const counter = udirCounter.get(originalId);
    unitName = `UDIR_${counter}`;
    unitId = slugify(unitName);
  }
  
  let craftableItems = undefined;
  if (unitType === 'building' && buildingsMap) {
    const normalizedName = unitName.toLowerCase().replace(/'/g, '').replace(/\s+/g, ' ');
    const buildingMatch = buildingsMap.get(extractedUnit.id) || 
                         buildingsMap.get(unitName.toLowerCase()) ||
                         buildingsMap.get(normalizedName);
    
    if (!buildingMatch) {
      for (const [key, building] of buildingsMap.entries()) {
        const normalizedKey = key.replace(/'/g, '').replace(/\s+/g, ' ');
        if (normalizedName === normalizedKey) {
          craftableItems = building.craftableItems;
          break;
        }
      }
    } else if (buildingMatch.craftableItems) {
      craftableItems = buildingMatch.craftableItems;
    }
  }
  
  // Calculate damage range from base and dice
  const damageRange = calculateDamageRange(extractedUnit.damageBase, extractedUnit.damageDice);
  
  return {
    id: unitId,
    name: unitName,
    description: (extractedUnit.description || '').trim() || undefined,
    tooltip: (extractedUnit.tooltip || '').trim() || undefined,
    iconPath: convertIconPath(extractedUnit.icon),
    race: extractedUnit.race || undefined,
    classification: extractedUnit.classification || undefined,
    type: unitType,
    // Primary attributes
    strength: extractedUnit.strength ?? undefined,
    agility: extractedUnit.agility ?? undefined,
    intelligence: extractedUnit.intelligence ?? undefined,
    strengthPerLevel: extractedUnit.strengthPerLevel ?? undefined,
    agilityPerLevel: extractedUnit.agilityPerLevel ?? undefined,
    intelligencePerLevel: extractedUnit.intelligencePerLevel ?? undefined,
    // Combat stats
    hp: extractedUnit.hp ?? fallbackStats.hp ?? undefined,
    mana: extractedUnit.mana ?? fallbackStats.mana ?? undefined,
    armor: extractedUnit.armor ?? fallbackStats.armor ?? undefined,
    damageMin: damageRange?.min ?? undefined,
    damageMax: damageRange?.max ?? undefined,
    attackCooldown: extractedUnit.attackCooldown ?? undefined,
    attackRange: extractedUnit.attackRange ?? undefined,
    acquisitionRange: extractedUnit.acquisitionRange ?? undefined,
    attackType: extractedUnit.attackType ?? undefined,
    defenseType: extractedUnit.defenseType ?? undefined,
    // Movement stats
    moveSpeed: extractedUnit.moveSpeed ?? fallbackStats.moveSpeed ?? undefined,
    turnRate: extractedUnit.turnRate ?? undefined,
    collisionSize: extractedUnit.collisionSize ?? undefined,
    // Vision stats
    sightRangeDay: extractedUnit.sightRangeDay ?? undefined,
    sightRangeNight: extractedUnit.sightRangeNight ?? undefined,
    // Cost/resource stats
    goldCost: extractedUnit.goldCost ?? undefined,
    lumberCost: extractedUnit.lumberCost ?? undefined,
    foodCost: extractedUnit.foodCost ?? undefined,
    buildTime: extractedUnit.buildTime ?? undefined,
    // Abilities
    abilities: extractedUnit.abilities ?? undefined,
    // Classification flags
    isBuilding: extractedUnit.isBuilding ?? undefined,
    isFlyer: extractedUnit.isFlyer ?? undefined,
    isWorker: extractedUnit.isWorker ?? undefined,
    canAttack: extractedUnit.canAttack ?? undefined,
    canHarvest: extractedUnit.canHarvest ?? undefined,
    // Legacy fields (for backward compatibility)
    attackSpeed: extractedUnit.attackCooldown ?? fallbackStats.attackSpeed ?? undefined,
    damage: damageRange ? `${damageRange.min}-${damageRange.max}` : fallbackStats.damage ?? undefined,
    craftableItems: craftableItems,
  };
}




