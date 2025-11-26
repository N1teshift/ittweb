/**
 * Convert extracted .w3x data to TypeScript format
 * 
 * This script reads the extracted JSON files and converts them to the TypeScript
 * data structure used by the application.
 * 
 * Usage: node scripts/convert-extracted-to-typescript.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..', '..');
const EXTRACTED_DIR = path.join(ROOT_DIR, 'data', 'island_troll_tribes', 'extracted_from_w3x');
const RECIPES_FILE = path.join(ROOT_DIR, 'data', 'island_troll_tribes', 'recipes.json');
const ABILITIES_META_FILE = path.join(ROOT_DIR, 'data', 'island_troll_tribes', 'abilities.json');
const BUILDINGS_FILE = path.join(ROOT_DIR, 'data', 'island_troll_tribes', 'buildings.json');
const UNITS_FILE = path.join(ROOT_DIR, 'data', 'island_troll_tribes', 'units.json');
const EXTRACTED_UNITS_FILE = path.join(EXTRACTED_DIR, 'units.json');
const FORCE_UNKNOWN_ABILITY_CATEGORIES = true;

// TypeScript output directories
const ITEMS_DIR = path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'data', 'items');
const ABILITIES_DIR = path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'data', 'abilities');
const UNITS_DIR = path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'data', 'units');

/**
 * Load JSON file
 */
function loadJson(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

/**
 * Convert Windows path to icon path format
 */
function convertIconPath(iconPath) {
  if (!iconPath) return undefined;
  
  // Convert Windows backslashes to forward slashes
  let converted = iconPath.replace(/\\/g, '/');
  
  // Remove "ReplaceableTextures/CommandButtons/" prefix if present
  converted = converted.replace(/^ReplaceableTextures\/CommandButtons\//i, '');
  
  // Remove .blp extension and add .png (or keep original extension)
  converted = converted.replace(/\.blp$/i, '.png');
  
  return converted;
}

/**
 * Generate slug from name
 */
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Strip Warcraft 3 color codes from text
 * Removes |cffRRGGBB, |r, and |n codes
 */
function stripColorCodes(str) {
  if (!str) return '';
  return str.replace(/\|cff[0-9a-fA-F]{6}/g, '').replace(/\|r/g, '').replace(/\|n/g, ' ').trim();
}

/**
 * Escape string for TypeScript/JavaScript
 */
function escapeString(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')  // Escape backslashes first
    .replace(/'/g, "\\'")     // Escape single quotes
    .replace(/\n/g, '\\n')    // Escape newlines
    .replace(/\r/g, '\\r')    // Escape carriage returns
    .replace(/\t/g, '\\t');   // Escape tabs
}

/**
 * Map item to category - NO HEURISTICS
 * Items must have explicit category metadata or default to 'unknown'
 */
function mapItemCategory(item) {
  // Check for explicit category in item metadata
  if (item.category) {
    const category = item.category.toLowerCase();
    // Validate it's a valid category
    const validCategories = ['raw-materials', 'weapons', 'armor', 'potions', 'scrolls', 'buildings', 'unknown'];
    if (validCategories.includes(category)) {
      return { category: category };
    }
  }
  
  // No heuristics - default to unknown
  return { category: 'unknown' };
}

const VALID_ABILITY_CATEGORIES = new Set([
  'basic',
  'hunter',
  'beastmaster',
  'mage',
  'priest',
  'thief',
  'scout',
  'gatherer',
  'item',
  'building',
  'unknown',
]);

function normalizeAbilityCategory(rawCategory) {
  if (!rawCategory) return 'unknown';
  const lowered = rawCategory.toLowerCase();
  if (lowered === 'subclass' || lowered === 'superclass') {
    return 'unknown';
  }
  return VALID_ABILITY_CATEGORIES.has(lowered) ? lowered : 'unknown';
}

/**
 * Check if an ability name looks like an internal/garbage identifier
 */
function isGarbageAbilityName(name) {
  if (!name || name.length < 2) return true;
  
  const trimmed = name.trim();
  
  // Very short names (1-2 chars) are likely garbage
  if (trimmed.length <= 2) return true;
  
  // Names with colons and letters/numbers (internal IDs like "AMha:Aro1", "$wsl:ANcl", "AM02:Sca1")
  // Pattern: starts with uppercase letters, optionally followed by lowercase/numbers, then colon/pipe
  if (/^[A-Z]{2,}[A-Za-z0-9]*[:|][A-Za-z0-9]/.test(trimmed)) return true;
  
  // Names starting with $ followed by lowercase (internal refs like "$wsl:ANcl")
  if (/^\$[a-z]/.test(trimmed)) return true;
  
  // All caps with numbers and special chars, very short (like "AM02", "AM7|")
  if (/^[A-Z0-9|:]{2,6}$/.test(trimmed) && trimmed.length <= 6) return true;
  
  // Single character or just numbers
  if (/^[0-9]$/.test(trimmed)) return true;
  
  return false;
}

const abilityMetadata = FORCE_UNKNOWN_ABILITY_CATEGORIES ? null : loadJson(ABILITIES_META_FILE);
const ABILITY_METADATA_MAP = new Map();
if (abilityMetadata?.abilities) {
  for (const abilityMeta of abilityMetadata.abilities) {
    const slug = abilityMeta.id || slugify(abilityMeta.name || '');
    if (!slug) continue;
    ABILITY_METADATA_MAP.set(slug, abilityMeta);
  }
} else {
  console.warn('⚠️  No ability metadata found; all abilities will default to category "unknown".');
}
const missingAbilityCategorySlugs = new Set();

/**
 * Look up ability category from metadata
 */
function mapAbilityCategory(slug) {
  const meta = ABILITY_METADATA_MAP.get(slug);
  if (meta) {
    return {
      category: normalizeAbilityCategory(meta.category),
      classRequirement: meta.classRequirement
    };
  }
  missingAbilityCategorySlugs.add(slug);
  return { category: 'unknown' };
}

/**
 * Load recipes to get crafting information
 */
function loadRecipes() {
  const recipesData = loadJson(RECIPES_FILE);
  if (!recipesData || !recipesData.recipes) return new Map();
  
  const recipeMap = new Map();
  for (const recipe of recipesData.recipes) {
    const itemId = recipe.itemId || recipe.itemName;
    if (itemId) {
      recipeMap.set(itemId, {
        ingredients: recipe.ingredients || recipe.ingredientNames || [],
        craftedAt: recipe.unitRequirement || recipe.craftedAt,
        mixingPotManaRequirement: recipe.mixingPotManaRequirement
      });
    }
  }
  
  return recipeMap;
}

/**
 * Convert extracted item to TypeScript ItemData
 */
function convertItem(extractedItem, recipes) {
  // Note: categoryInfo is already checked before calling this function
  const categoryInfo = mapItemCategory(extractedItem);
  if (!categoryInfo) {
    return null; // Should not happen, but safety check
  }
  
  const recipe = recipes.get(extractedItem.id) || recipes.get(extractedItem.name);
  
  // Trim whitespace from strings
  const name = (extractedItem.name || extractedItem.id || '').trim();
  const description = (extractedItem.description || '').trim();
  const tooltip = extractedItem.tooltip ? extractedItem.tooltip.trim() : undefined;
  
  return {
    id: slugify(name),
    name: name,
    category: categoryInfo.category,
    subcategory: categoryInfo.subcategory,
    description: description,
    tooltip: tooltip,
    iconPath: convertIconPath(extractedItem.icon),
    recipe: recipe?.ingredients || undefined,
    craftedAt: recipe?.craftedAt || undefined,
    mixingPotManaRequirement: recipe?.mixingPotManaRequirement || undefined,
    // Note: stats would need to be extracted from raw modifications if needed
  };
}

/**
 * Convert extracted ability to TypeScript AbilityData
 */
function convertAbility(extractedAbility) {
  // Try to extract mana cost, cooldown, etc. from raw modifications
  const raw = extractedAbility.raw || [];
  const getField = (fieldId) => {
    const field = raw.find(r => r.id?.toLowerCase() === fieldId.toLowerCase() && r.level === 0);
    return field ? field.value : undefined;
  };
  const getStringField = (...fieldIds) => {
    for (const id of fieldIds) {
      const field = raw.find(r => r.id?.toLowerCase() === id.toLowerCase() && typeof r.value === 'string' && r.value.trim());
      if (field) {
        return field.value.trim();
      }
    }
    return undefined;
  };
  
  // Trim whitespace from strings and gracefully fall back to raw string values
  let name = (extractedAbility.name || '').trim();
  if (!name) {
    name =
      getStringField('atp1', 'atp2', 'atp3', 'aret', 'arut', 'aub1', 'anam', 'unam') ||
      (extractedAbility.tooltip ? extractedAbility.tooltip.split('\n').find(line => line.trim())?.trim() : undefined) ||
      (extractedAbility.id || '').trim();
  }
  const safeName = name || (extractedAbility.id || 'unknown-ability');
  // Strip color codes from ability names (they should be clean for display)
  const cleanName = stripColorCodes(safeName).trim();
  const slug = slugify(cleanName);
  const categoryInfo = mapAbilityCategory(slug);
  
  const description = (extractedAbility.description || '').trim();
  const tooltip = extractedAbility.tooltip ? extractedAbility.tooltip.trim() : undefined;
  
  return {
    id: slug,
    name: cleanName,
    category: categoryInfo.category,
    classRequirement: categoryInfo.classRequirement,
    description: description,
    tooltip: tooltip,
    iconPath: convertIconPath(extractedAbility.icon),
    manaCost: getField('amcs') || getField('amc1') || getField('amc2') || undefined,
    cooldown: getField('acdn') || getField('acd1') || getField('acd2') || undefined,
    range: getField('aran') || getField('arng') || undefined,
    duration: getField('adur') || getField('ahdu') || undefined,
    damage: getField('ahd1') || getField('ahd2') || undefined,
    // effects would need more complex parsing
  };
}

/**
 * Write TypeScript file with items
 */
function writeItemsFile(filePath, items, category) {
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
 * Convert base class unit to TypeScript TrollClassData format
 */
function convertBaseClass(unit, allUnits) {
  const slug = slugify(unit.id || unit.name || 'unknown-class');
  
  // Find subclasses and superclasses for this base class
  const subclasses = allUnits
    .filter(u => u.type === 'subclass' && u.id && u.id.startsWith(unit.id))
    .map(u => slugify(u.id || u.name))
    .filter(Boolean);
  
  const superclasses = allUnits
    .filter(u => u.type === 'superclass' && u.id && u.id.startsWith(unit.id))
    .map(u => slugify(u.id || u.name))
    .filter(Boolean);
  
  return {
    slug: slug,
    name: (unit.name || '').trim(),
    summary: unit.summary || unit.description || `${unit.name} class description coming soon.`,
    iconSrc: undefined, // Could be extracted from unit data if available
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
 * Determine unit type based on name, race, and classification
 */
function determineUnitType(unit) {
  const name = (unit.name || '').toLowerCase();
  const race = (unit.race || '').toLowerCase();
  const classification = (unit.classification || '').toLowerCase();
  
  // Check for Unit Dummy Item Reward units (must check this first before general dummy check)
  if (name.includes('unit_dummy_item_reward') || name.startsWith('unit dummy item reward')) {
    return 'unit-dummy-item-reward';
  }
  
  // Check for other dummy units
  if (name.includes('dummy')) {
    return 'dummy';
  }
  
  // Check for buildings (must check before trolls to catch "Troll Hut", "Troll Totem", "Mage Fire")
  const buildingKeywords = ['hut', 'totem', 'fire', 'beacon', 'tower', 'house', 'lodge', 
                            'workshop', 'armory', 'forge', 'tannery', 'pot', 'ward', 'kit', 'hatchery'];
  // Exclude "Living Clay" which is not a building
  if ((classification.includes('townhall') || classification.includes('structure') || 
      classification.includes('mechanical') || classification.includes('sapper') ||
      name.includes('indicator') || name.includes('holder') || name.includes('altar') ||
      buildingKeywords.some(keyword => name.includes(keyword))) &&
      !name.includes('living clay')) {
    return 'building';
  }
  
  // Check for animals FIRST (before trolls) to catch animals that might have race='orc'
  // But exclude troll classes/forms and traps
  const animalExclusions = ['form', 'trap', 'beastmaster', 'dire wolf', 'dire bear'];
  // Special case: "Hawk" alone is a troll class, but "Hawk Hatchling", "Tamed Hawk", "Alpha Hawk" are animals
  const isHawkAnimal = (name.includes('hawk hatchling') || name.includes('tamed hawk') || 
                        name.includes('alpha hawk'));
  const animalKeywords = ['deer', 'bear', 'wolf', 'panther', 'tiger', 'elk', 'boar', 
                          'bird', 'snake', 'fish', 'beast', 'creature', 'animal',
                          'fawn', 'dragon', 'hatchling', 'tamed'];
  if ((animalKeywords.some(keyword => name.includes(keyword)) || race === 'creeps' || isHawkAnimal) &&
      !animalExclusions.some(exclusion => name.includes(exclusion))) {
    return 'animal';
  }
  
  // Check for bosses (but exclude "beastmaster" and "jungle tyrant" which are troll classes)
  // "The One" is a special case - exact match
  if (name === 'the one') {
    return 'boss';
  }
  const bossKeywords = ['boss', 'ancient', 'lord', 'tyrant', 'hydra', 'alligator'];
  if ((bossKeywords.some(keyword => name.includes(keyword)) || classification.includes('ancient')) &&
      !name.includes('beastmaster') && !name.includes('jungle tyrant')) {
    return 'boss';
  }
  
  // Check for non-troll units that contain "troll" in name (should be "other")
  const nonTrollKeywords = ['merchant', 'ship', 'transport', 'afterimage', 'random', 'repick', 'picker'];
  if (nonTrollKeywords.some(keyword => name.includes(keyword))) {
    return 'other';
  }
  
  // Check for traps (should be "other") - but exclude "trapper" which is a troll class
  if (name.includes('trap') && !name.includes('trapper')) {
    return 'other';
  }
  
  // Check for trolls (after animals and exclusions to avoid false positives)
  // Only match if it's an actual troll class/role, not just any mention of "troll"
  if (name.includes('troll') && !name.includes('hut') && !name.includes('totem') && 
      !name.includes('fire') && !name.includes('merchant') && !name.includes('ship')) {
    return 'troll';
  }
  
  // Check for troll classes/forms
  const trollClassKeywords = [
    // Base classes
    'hunter', 'mage', 'priest', 'thief', 'scout', 'gatherer', 'beastmaster',
    // Warrior/Combat classes
    'warrior', 'champion', 'gurubashi',
    // Tracking/Scout classes
    'tracker', 'trapper', 'spy',
    // Mage/Priest variants
    'elementalist', 'hypnotist', 'dreamwalker', 'dementia', 'booster', 'healer', 'sage', 'druid',
    // Thief variants
    'rogue', 'escape artist', 'contortionist', 'assassin',
    // Crafting/Gathering classes
    'herb master', 'alchemist',
    // Shapeshifter forms
    'form', 'dire wolf', 'dire bear',
    // Observer class - "Hawk" (but not "Hawk Hatchling", "Tamed Hawk", "Alpha Hawk")
    'hawk',
    // Beastmaster variant
    'jungle tyrant'
  ];
  // Special case: "Hawk" alone is a troll class, but exclude hawk animals (reuse isHawkAnimal from above)
  // Exclude "Dire bear bee" which is not a troll class
  if ((trollClassKeywords.some(keyword => name.includes(keyword)) || race === 'orc') &&
      !isHawkAnimal && !name.includes('dire bear bee')) {
    // But exclude if it's a building, trap (but not "trapper" which is a troll class), or other non-troll unit
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
 * Extract unit stats from raw data
 */
function extractUnitStats(unit) {
  const raw = unit.raw || [];
  
  const getField = (fieldId) => {
    const field = raw.find(r => r.id === fieldId && r.level === 0);
    return field ? field.value : undefined;
  };
  
  return {
    hp: getField('uhpm') || getField('uhpr'),
    mana: getField('umpm') || getField('umpr'),
    armor: getField('udef'),
    moveSpeed: getField('umvs'),
    attackSpeed: getField('ubsa'),
    damage: getField('ua1b') || getField('ua1d'),
  };
}

/**
 * Convert extracted unit to TypeScript UnitData format
 */
function convertUnit(extractedUnit, udirCounter, buildingsMap) {
  const stats = extractUnitStats(extractedUnit);
  const unitType = determineUnitType(extractedUnit);
  
  // Handle Unit Dummy Item Reward units - rename them
  let unitName = (extractedUnit.name || '').trim();
  let unitId = extractedUnit.id || slugify(unitName || 'unknown-unit');
  
  if (unitType === 'unit-dummy-item-reward') {
    // Use the original unit ID as the key to ensure consistent numbering
    const originalId = extractedUnit.id || unitId;
    if (!udirCounter.has(originalId)) {
      udirCounter.set(originalId, udirCounter.size + 1);
    }
    const counter = udirCounter.get(originalId);
    unitName = `UDIR_${counter}`;
    unitId = slugify(unitName);
  }
  
  // Merge craftableItems from buildings.json if this is a building
  let craftableItems = undefined;
  if (unitType === 'building' && buildingsMap) {
    // Try to match by unitId first, then by name (normalized for comparison)
    const normalizedName = unitName.toLowerCase().replace(/'/g, '').replace(/\s+/g, ' ');
    const buildingMatch = buildingsMap.get(extractedUnit.id) || 
                         buildingsMap.get(unitName.toLowerCase()) ||
                         buildingsMap.get(normalizedName);
    
    // Also try matching by removing apostrophes and extra spaces
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
  
  return {
    id: unitId,
    name: unitName,
    description: (extractedUnit.description || '').trim() || undefined,
    tooltip: (extractedUnit.tooltip || '').trim() || undefined,
    iconPath: convertIconPath(extractedUnit.icon),
    race: extractedUnit.race || undefined,
    classification: extractedUnit.classification || undefined,
    type: unitType,
    hp: stats.hp,
    mana: stats.mana,
    armor: stats.armor,
    moveSpeed: stats.moveSpeed,
    attackSpeed: stats.attackSpeed,
    damage: stats.damage,
    craftableItems: craftableItems,
  };
}

/**
 * Convert derived class (subclass/superclass) unit to TypeScript DerivedClassData format
 */
function convertDerivedClass(unit, allUnits) {
  const slug = slugify(unit.id || unit.name || 'unknown-class');
  
  // Try to find parent base class by matching id prefix
  const parentBase = allUnits.find(u => 
    u.type === 'base' && 
    unit.id && 
    unit.id.startsWith(u.id) &&
    unit.id !== u.id
  );
  
  const parentSlug = parentBase ? slugify(parentBase.id || parentBase.name) : 'unknown';
  
  return {
    slug: slug,
    name: (unit.name || '').trim(),
    parentSlug: parentSlug,
    type: unit.type === 'superclass' ? 'super' : 'sub',
    summary: unit.summary || unit.description || `${unit.name} class description coming soon.`,
    iconSrc: undefined, // Could be extracted from unit data if available
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
 * Write TypeScript file with base classes
 */
function writeClassesFile(filePath, classes) {
  const content = `export type TrollClassData = {
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

export function getClassBySlug(slug: string): TrollClassData | undefined {
  return BASE_TROLL_CLASSES.find(c => c.slug === slug);
}
`;
  
  fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * Write TypeScript file with derived classes
 */
function writeDerivedClassesFile(filePath, classes) {
  const content = `export type DerivedClassType = 'sub' | 'super';

export type DerivedClassData = {
  slug: string;
  name: string;
  parentSlug: string; // base class slug
  type: DerivedClassType;
  summary: string;
  // Optional explicit icon path, e.g. "/icons/itt/trolls/btnorcwarlock.png"
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
`;
  
  fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * Write TypeScript file with all units
 */
function writeAllUnitsFile(filePath, units) {
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


/**
 * Write TypeScript file with abilities
 */
function writeAbilitiesFile(filePath, abilities, category) {
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
 * Main conversion function
 */
function main() {
  console.log('🔄 Converting extracted .w3x data to TypeScript format...\n');
  
  // Load extracted data
  const itemsData = loadJson(path.join(EXTRACTED_DIR, 'items.json'));
  const abilitiesData = loadJson(path.join(EXTRACTED_DIR, 'abilities.json'));
  const buildingsData = loadJson(BUILDINGS_FILE);
  const unitsData = loadJson(UNITS_FILE);
  const extractedUnitsData = loadJson(EXTRACTED_UNITS_FILE);
  const recipes = loadRecipes();
  
  if (!itemsData || !itemsData.items) {
    console.error('❌ No items data found');
    return;
  }
  
  if (!abilitiesData || !abilitiesData.abilities) {
    console.error('❌ No abilities data found');
    return;
  }
  
  console.log(`📦 Processing ${itemsData.items.length} items...`);
  console.log(`✨ Processing ${abilitiesData.abilities.length} abilities...`);
  if (buildingsData && buildingsData.buildings) {
    console.log(`🏠 Processing ${buildingsData.buildings.length} buildings...`);
  }
  if (unitsData && unitsData.units) {
    const baseCount = unitsData.units.filter(u => u.type === 'base').length;
    const subCount = unitsData.units.filter(u => u.type === 'subclass').length;
    const superCount = unitsData.units.filter(u => u.type === 'superclass').length;
    console.log(`👤 Processing ${unitsData.units.length} units (${baseCount} base, ${subCount} subclass, ${superCount} superclass)...`);
  }
  console.log();
  
  // Convert items (deduplicate by name)
  const itemMap = new Map();
  for (const item of itemsData.items) {
    if (!item.name || itemMap.has(item.name)) continue;
    
    itemMap.set(item.name, convertItem(item, recipes));
  }
  const convertedItems = Array.from(itemMap.values());
  
  // Group items by category
  const itemsByCategory = {};
  for (const item of convertedItems) {
    if (!itemsByCategory[item.category]) {
      itemsByCategory[item.category] = [];
    }
    itemsByCategory[item.category].push(item);
  }
  
  // Write item files
  const categoryFileMap = {
    'scrolls': 'scrolls.ts',
    'weapons': 'weapons.ts',
    'armor': 'armor.ts',
    'potions': 'potions.ts',
    'raw-materials': 'raw-materials.ts',
    'buildings': 'buildings.ts',
    'unknown': 'unknown.ts',
  };
  
  for (const [category, items] of Object.entries(itemsByCategory)) {
    const fileName = categoryFileMap[category] || `${category}.ts`;
    const filePath = path.join(ITEMS_DIR, fileName);
    writeItemsFile(filePath, items, category);
    console.log(`✅ Wrote ${items.length} items to ${fileName}`);
  }
  
  // Convert abilities (deduplicate by name, filter garbage)
  const abilityMap = new Map();
  let filteredCount = 0;
  for (const ability of abilitiesData.abilities) {
    const converted = convertAbility(ability);
    if (!converted.name) {
      filteredCount++;
      continue;
    }
    
    // Filter out garbage/internal ability names
    if (isGarbageAbilityName(converted.name)) {
      filteredCount++;
      continue;
    }
    
    if (!abilityMap.has(converted.id)) {
      abilityMap.set(converted.id, converted);
    }
  }
  const convertedAbilities = Array.from(abilityMap.values());
  
  if (filteredCount > 0) {
    console.log(`⚠️  Filtered out ${filteredCount} garbage/internal abilities`);
  }
  
  // Group abilities by category
  const abilitiesByCategory = {};
  for (const ability of convertedAbilities) {
    if (!abilitiesByCategory[ability.category]) {
      abilitiesByCategory[ability.category] = [];
    }
    abilitiesByCategory[ability.category].push(ability);
  }
  
  // Write ability files
  const abilityFileMap = {
    'basic': 'basic.ts',
    'hunter': 'hunter.ts',
    'beastmaster': 'beastmaster.ts',
    'mage': 'mage.ts',
    'priest': 'priest.ts',
    'thief': 'thief.ts',
    'scout': 'scout.ts',
    'gatherer': 'gatherer.ts',
    'item': 'item.ts',
    'building': 'building.ts',
    'unknown': 'unknown.ts',
  };
  
  for (const [categoryKey, fileName] of Object.entries(abilityFileMap)) {
    const abilities = abilitiesByCategory[categoryKey] || [];
    const filePath = path.join(ABILITIES_DIR, fileName);
    writeAbilitiesFile(filePath, abilities, categoryKey);
    console.log(`✅ Wrote ${abilities.length} abilities to ${fileName}`);
  }
  
  console.log('\n✅ Conversion complete!');
  
  if (missingAbilityCategorySlugs.size > 0) {
    const sampleMissing = Array.from(missingAbilityCategorySlugs).slice(0, 10);
    console.warn(`⚠️  ${missingAbilityCategorySlugs.size} abilities missing category metadata. Assigned 'unknown'. Sample: ${sampleMissing.join(', ')}`);
  }
  
  // Create buildings map for merging craftableItems into units
  const buildingsMap = new Map();
  if (buildingsData && buildingsData.buildings) {
    for (const building of buildingsData.buildings) {
      // Map by unitId and by name (lowercase, normalized) for matching
      if (building.unitId) {
        buildingsMap.set(building.unitId.toLowerCase(), building);
      }
      if (building.name) {
        const normalizedName = building.name.toLowerCase().replace(/'/g, '').replace(/\s+/g, ' ');
        buildingsMap.set(building.name.toLowerCase(), building);
        buildingsMap.set(normalizedName, building);
      }
    }
    console.log(`\n🏠 Loaded ${buildingsData.buildings.length} buildings for merging into units`);
  }
  
  // Convert units/classes
  if (unitsData && unitsData.units) {
    console.log('\n👤 Converting units/classes...');
    const allUnits = unitsData.units;
    
    // Filter and convert base classes
    const baseUnits = allUnits.filter(u => u.type === 'base' && !u.id?.endsWith('-1'));
    const convertedBaseClasses = baseUnits.map(u => convertBaseClass(u, allUnits));
    
    const classesFilePath = path.join(UNITS_DIR, 'classes.ts');
    writeClassesFile(classesFilePath, convertedBaseClasses);
    console.log(`✅ Wrote ${convertedBaseClasses.length} base classes to classes.ts`);
    
    // Filter and convert derived classes (subclass/superclass)
    const derivedUnits = allUnits.filter(u => 
      (u.type === 'subclass' || u.type === 'superclass') && 
      !u.id?.endsWith('-1')
    );
    const convertedDerivedClasses = derivedUnits.map(u => convertDerivedClass(u, allUnits));
    
    const derivedClassesFilePath = path.join(UNITS_DIR, 'derivedClasses.ts');
    writeDerivedClassesFile(derivedClassesFilePath, convertedDerivedClasses);
    console.log(`✅ Wrote ${convertedDerivedClasses.length} derived classes to derivedClasses.ts`);
  } else {
    console.log('\n⚠️  No units data found, skipping class conversion');
  }
  
  // Convert all extracted units (trolls, animals, bosses, etc.)
  if (extractedUnitsData && extractedUnitsData.units) {
    console.log('\n👥 Converting all units...');
    // Filter out indicator/holder units and other non-gameplay units
    const gameplayUnits = extractedUnitsData.units.filter(u => 
      u.name && 
      !u.name.toLowerCase().includes('indicator') &&
      !u.name.toLowerCase().includes('holder') &&
      !u.name.toLowerCase().includes('recipe')
    );
    
    // Track UDIR counter for renaming Unit Dummy Item Reward units
    const udirCounter = new Map();
    
    const convertedUnits = gameplayUnits.map(u => convertUnit(u, udirCounter, buildingsMap));
    
    // Group by type for summary
    const unitsByType = {};
    convertedUnits.forEach(u => {
      unitsByType[u.type] = (unitsByType[u.type] || 0) + 1;
    });
    
    const allUnitsFilePath = path.join(UNITS_DIR, 'allUnits.ts');
    writeAllUnitsFile(allUnitsFilePath, convertedUnits);
    console.log(`✅ Wrote ${convertedUnits.length} units to allUnits.ts`);
    console.log(`   Types: ${Object.entries(unitsByType).map(([type, count]) => `${type}: ${count}`).join(', ')}`);
  } else {
    console.log('\n⚠️  No extracted units data found, skipping all units conversion');
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`  Items: ${convertedItems.length}`);
  console.log(`  Abilities: ${convertedAbilities.length}`);
  if (buildingsData && buildingsData.buildings) {
    console.log(`  Buildings: ${buildingsData.buildings.length}`);
  }
  if (unitsData && unitsData.units) {
    const baseCount = unitsData.units.filter(u => u.type === 'base' && !u.id?.endsWith('-1')).length;
    const derivedCount = unitsData.units.filter(u => 
      (u.type === 'subclass' || u.type === 'superclass') && !u.id?.endsWith('-1')
    ).length;
    console.log(`  Base Classes: ${baseCount}`);
    console.log(`  Derived Classes: ${derivedCount}`);
  }
  if (extractedUnitsData && extractedUnitsData.units) {
    const gameplayUnits = extractedUnitsData.units.filter(u => 
      u.name && 
      !u.name.toLowerCase().includes('indicator') &&
      !u.name.toLowerCase().includes('holder') &&
      !u.name.toLowerCase().includes('recipe')
    );
    console.log(`  All Units: ${gameplayUnits.length}`);
  }
  console.log(`  Item categories: ${Object.keys(itemsByCategory).length}`);
  console.log(`  Ability categories: ${Object.keys(abilitiesByCategory).length}`);
}

main();

