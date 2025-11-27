/**
 * Extract metadata (recipes, buildings, units) from extracted game data
 * 
 * This script processes the extracted JSON files and generates metadata files:
 * - recipes.json: Crafting recipes (extracted from items or JASS if available)
 * - buildings.json: Building metadata (craftableItems, etc.)
 * - units.json: Unit/class metadata (base/subclass/superclass relationships, stats)
 * 
 * Usage: node scripts/data/extract-metadata.mjs
 */

import fs from 'fs';
import path from 'path';
import { loadJson, writeJson, slugify, getField } from './utils.mjs';
import { TMP_RAW_DIR, TMP_METADATA_DIR, WORK_DIR, ensureTmpDirs } from './paths.mjs';

const EXTRACTED_DIR = TMP_RAW_DIR;
const OUTPUT_DIR = TMP_METADATA_DIR;
const WAR3MAP_FILE = path.join(WORK_DIR, 'war3map.j');

ensureTmpDirs();

/**
 * Extract units metadata from extracted units
 * Identifies base classes, subclasses, and superclasses based on naming patterns
 */
function extractUnitsMetadata(extractedUnits) {
  if (!extractedUnits || !extractedUnits.units) {
    return { units: [] };
  }
  
  const units = [];
  const seenIds = new Set(); // Track seen unit IDs to avoid duplicates
  
  // Base class names (exact matches)
  const baseClassNames = new Set(['Hunter', 'Mage', 'Priest', 'Beastmaster', 'Thief', 'Scout', 'Gatherer']);
  
  // Subclass names (known subclasses)
  const subclassNames = new Set([
    'Warrior', 'Tracker', 'Elementalist', 'Hypnotist', 'Dreamwalker',
    'Booster', 'Master Healer', 'Druid', 'Rogue', 'Observer', 'Trapper',
    'Radar Gatherer', 'Herb Master', 'Alchemist'
  ]);
  
  // Superclass names
  const superclassNames = new Set([
    'Juggernaut', 'Gurubashi Champion', 'Dementia Master', 'Sage', 'Jungle Tyrant', 'Assassin', 'Spy', 'Omnigatherer', 'Omni-Gatherer', 'Omni Gatherer'
  ]);
  
  // Exclusions - things that match class name patterns but are NOT troll classes
  const classExclusions = new Set([
    'Mage Fire',  // This is a campfire building, not a class
    'Hawk Hatchling', 'Tamed Hawk', 'Alpha Hawk'  // These are animals, not the Hawk scout subclass
  ]);
  
  for (const unit of extractedUnits.units) {
    const id = (unit.id || '').toLowerCase();
    const name = (unit.name || '').trim();
    const nameLower = name.toLowerCase();
    
    // Skip indicator/holder/dummy units
    if (nameLower.includes('indicator') || nameLower.includes('holder') || nameLower.includes('dummy')) {
      continue;
    }
    
    // Determine type based on name
    let type = 'unknown';
    
    // Skip if in exclusions list (buildings/animals that match class name patterns)
    if (classExclusions.has(name)) {
      type = 'unknown';
    } else if (baseClassNames.has(name)) {
      type = 'base';
    } else if (subclassNames.has(name)) {
      type = 'subclass';
    } else if (superclassNames.has(name)) {
      type = 'superclass';
    } else {
      // Try fuzzy matching for variations
      for (const baseName of baseClassNames) {
        if (nameLower === baseName.toLowerCase() || nameLower.startsWith(baseName.toLowerCase() + ' ')) {
          // Check fuzzy match isn't in exclusions
          if (!classExclusions.has(name)) {
            type = 'base';
          }
          break;
        }
      }
      if (type === 'unknown') {
        for (const subName of subclassNames) {
          if (nameLower === subName.toLowerCase() || nameLower.includes(subName.toLowerCase())) {
            type = 'subclass';
            break;
          }
        }
      }
      if (type === 'unknown') {
        for (const superName of superclassNames) {
          if (nameLower === superName.toLowerCase() || nameLower.includes(superName.toLowerCase())) {
            type = 'superclass';
            break;
          }
        }
      }
    }
    
    // Extract stats from raw modifications
    const raw = unit.raw || [];
    const getUnitField = (fieldId) => getField(raw, fieldId, 0);
    
    // Only include units that are base/subclass/superclass, or have meaningful stats
    const str = getUnitField('ustr');
    const agi = getUnitField('uagi');
    const int = getUnitField('uint');
    const hp = getUnitField('uhpm') || getUnitField('uhpr');
    
    // Skip units with default/placeholder stats unless they're identified as classes
    if (type === 'unknown' && (!str || str === 1) && (!agi || agi === 1) && (!int || int === 1) && (!hp || hp === 192)) {
      continue;
    }
    
    const unitId = slugify(name || id);
    
    // Skip duplicates (prefer first occurrence, or prefer base/subclass/superclass over unknown)
    if (seenIds.has(unitId)) {
      const existing = units.find(u => u.id === unitId);
      // Replace if current is more specific (base/subclass/superclass) and existing is unknown
      if (existing && existing.type === 'unknown' && type !== 'unknown') {
        const index = units.indexOf(existing);
        units[index] = {
          id: unitId,
          unitId: unit.id || id.toUpperCase(),
          name: name,
          type: type,
          growth: {
            strength: str || 1.0,
            agility: agi || 1.0,
            intelligence: int || 1.0,
          },
          baseHp: hp || 192,
          baseMana: getUnitField('umpm') || getUnitField('umpr') || 192,
          baseMoveSpeed: getUnitField('umvs') || 290,
        };
      }
      continue;
    }
    
    seenIds.add(unitId);
    
    const unitData = {
      id: unitId,
      unitId: unit.id || id.toUpperCase(),
      name: name,
      type: type,
      growth: {
        strength: str || 1.0,
        agility: agi || 1.0,
        intelligence: int || 1.0,
      },
      baseHp: hp || 192,
      baseMana: getUnitField('umpm') || getUnitField('umpr') || 192,
      baseMoveSpeed: getUnitField('umvs') || 290,
    };
    
    units.push(unitData);
  }
  
  return { units };
}

/**
 * Extract buildings metadata from extracted buildings
 */
function extractBuildingsMetadata(extractedBuildings) {
  if (!extractedBuildings || !extractedBuildings.buildings) {
    return { buildings: [] };
  }
  
  const buildings = [];
  
  for (const building of extractedBuildings.buildings) {
    const id = (building.id || '').toLowerCase();
    const name = (building.name || '').trim();
    
    // Extract stats from raw modifications
    const raw = building.raw || [];
    const getBuildingField = (fieldId) => getField(raw, fieldId, 0);
    
    const buildingData = {
      id: slugify(name || id),
      unitId: building.id || id.toUpperCase(),
      name: name,
      description: building.description || '',
      hp: getBuildingField('bhpm') || getBuildingField('uhpm') || null,
      armor: getBuildingField('bdef') || getBuildingField('udef') || null,
      craftableItems: [], // Will be populated from recipes if available
    };
    
    buildings.push(buildingData);
  }
  
  return { buildings };
}

/**
 * Decode Warcraft III object ID integer into its 4-character string
 */
function decodeObjectId(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null;
  }
  let result = '';
  let remaining = value;
  for (let i = 0; i < 4; i++) {
    const charCode = remaining & 0xff;
    result = String.fromCharCode(charCode) + result;
    remaining = remaining >>> 8;
  }
  return result.trim() ? result : null;
}

/**
 * Build lookup tables for LocalObjectIDs_* constants and alias chains
 */
function buildLocalObjectMetadata(lines) {
  const receiverValues = new Map();
  const receiverNames = new Map();
  const objectMap = new Map(); // LocalObjectIDs_CONST -> { name, objectId }
  const aliasMap = new Map(); // Alias -> target

  for (const line of lines) {
    let match = line.match(/^\s*set\s+receiver_(\d+)\s*=\s*(\d+)/);
    if (match) {
      receiverValues.set(match[1], Number(match[2]));
      continue;
    }

    match = line.match(/^\s*call\s+int_registerObjectID\s*\(\s*receiver_(\d+)\s*,\s*"([^"]+)"/);
    if (match) {
      receiverNames.set(match[1], match[2]);
      continue;
    }

    match = line.match(/^\s*set\s+(LocalObjectIDs_[A-Za-z0-9_]+)\s*=\s*receiver_(\d+)/);
    if (match) {
      const constName = match[1];
      const receiverId = match[2];
      const numericId = receiverValues.get(receiverId);
      const objectName = receiverNames.get(receiverId) || null;
      objectMap.set(constName, {
        name: objectName,
        objectId: decodeObjectId(numericId),
      });
      continue;
    }

    match = line.match(/^\s*set\s+([A-Za-z0-9_]+)\s*=\s*([A-Za-z0-9_]+)/);
    if (match && !match[1].startsWith('receiver') && !match[2].startsWith('receiver')) {
      aliasMap.set(match[1], match[2]);
    }
  }

  return { objectMap, aliasMap };
}

/**
 * Resolve alias chains until we either hit a LocalObjectIDs_* constant or no change
 */
function resolveAlias(name, aliasMap, depth = 0) {
  let current = name;
  const visited = new Set();
  while (current && aliasMap.has(current) && !visited.has(current)) {
    visited.add(current);
    current = aliasMap.get(current);
  }
  return current;
}

/**
 * Extract argument list from a dispatch call line (ignores trailing stack string)
 */
function extractCallArgs(line) {
  const sanitizedLine = line.replace(/,\s*".*$/, ')');
  const openIndex = sanitizedLine.indexOf('(');
  if (openIndex === -1) return [];
  let closeIndex = sanitizedLine.lastIndexOf(')');
  if (closeIndex === -1) {
    closeIndex = sanitizedLine.length;
  }
  const argsSection = sanitizedLine.slice(openIndex + 1, closeIndex).trim();
  if (!argsSection) return [];
  return argsSection
    .split(',')
    .map((arg) => arg.trim())
    .filter((arg) => arg.length > 0);
}

/**
 * Convert constant metadata entry to serializable payload
 */
function serializeObjectRef(constName, objectMap) {
  if (!constName) return null;
  const meta = objectMap.get(constName);
  if (!meta) return null;
  return {
    const: constName,
    name: meta.name || null,
    objectId: meta.objectId || null,
  };
}

/**
 * Extract crafting recipes from war3map.j
 */
function extractRecipesMetadata() {
  if (!fs.existsSync(WAR3MAP_FILE)) {
    console.warn(`⚠️  war3map.j not found at ${WAR3MAP_FILE}. Recipes will be empty.`);
    return { recipes: [], generatedAt: new Date().toISOString(), source: 'war3map.j' };
  }

  const warContent = fs.readFileSync(WAR3MAP_FILE, 'utf-8');
  const lines = warContent.split(/\r?\n/);
  const { objectMap, aliasMap } = buildLocalObjectMetadata(lines);
  const recipesByItem = new Map();

  const newItemRegex = /new_CustomItemType_\d+\(\s*(LocalObjectIDs_ITEM_[A-Za-z0-9_]+)/;

  let currentItemConst = null;

  for (const line of lines) {
    const newItemMatch = line.match(newItemRegex);
    if (newItemMatch) {
      const resolved = resolveAlias(newItemMatch[1], aliasMap);
      if (resolved && resolved.startsWith('LocalObjectIDs_ITEM_')) {
        currentItemConst = resolved;
        const itemRef = serializeObjectRef(currentItemConst, objectMap);
        if (!recipesByItem.has(currentItemConst)) {
          recipesByItem.set(currentItemConst, {
            itemConst: currentItemConst,
            item: itemRef,
            itemObjectId: itemRef?.objectId || null,
            ingredients: [],
            craftedAt: null,
            quickMakeAbility: null,
            mixingPotManaRequirement: null,
          });
        }
      } else {
        currentItemConst = null;
      }
      continue;
    }

    if (!currentItemConst) {
      continue;
    }

    if (!line.includes('call')) {
      continue;
    }

    if (line.includes('setItemRecipe')) {
      const args = extractCallArgs(line);
      if (args.length <= 1) continue;
      const ingredientConsts = args
        .slice(1) // drop receiver argument
        .map((arg) => resolveAlias(arg, aliasMap))
        .filter((constName) => constName && constName.startsWith('LocalObjectIDs_ITEM_'));

      const entry = recipesByItem.get(currentItemConst);
      entry.ingredients = ingredientConsts.map((constName) => serializeObjectRef(constName, objectMap)).filter(Boolean);
      continue;
    }

    if (line.includes('setUnitRequirement')) {
      const args = extractCallArgs(line);
      if (args.length <= 1) continue;
      const unitConst = resolveAlias(args[1], aliasMap);
      if (unitConst && unitConst.startsWith('LocalObjectIDs_UNIT_')) {
        const entry = recipesByItem.get(currentItemConst);
        entry.craftedAt = serializeObjectRef(unitConst, objectMap);
      }
      continue;
    }

    if (line.includes('setMixingPotManaRequirement')) {
      const args = extractCallArgs(line);
      if (args.length <= 1) continue;
      const manaValue = Number(args[1]);
      if (!Number.isNaN(manaValue)) {
        const entry = recipesByItem.get(currentItemConst);
        entry.mixingPotManaRequirement = manaValue;
      }
      continue;
    }

    if (line.includes('setQuickMakeAbility')) {
      const args = extractCallArgs(line);
      if (args.length <= 1) continue;
      const abilityConst = resolveAlias(args[1], aliasMap);
      if (abilityConst) {
        const entry = recipesByItem.get(currentItemConst);
        entry.quickMakeAbility = abilityConst;
      }
    }
  }

  const recipes = Array.from(recipesByItem.values()).filter((recipe) => recipe.ingredients.length > 0);

  return {
    generatedAt: new Date().toISOString(),
    source: 'war3map.j',
    recipes,
  };
}

/**
 * Main function
 */
function main() {
  console.log('📋 Extracting metadata from extracted game data...\n');
  
  // Load extracted data
  const extractedUnits = loadJson(path.join(EXTRACTED_DIR, 'units.json'));
  const extractedBuildings = loadJson(path.join(EXTRACTED_DIR, 'buildings.json'));
  
  // Extract units metadata
  console.log('👤 Extracting units metadata...');
  const unitsMetadata = extractUnitsMetadata(extractedUnits);
  writeJson(path.join(OUTPUT_DIR, 'units.json'), unitsMetadata);
  console.log(`✅ Extracted ${unitsMetadata.units.length} units metadata\n`);
  
  // Extract buildings metadata
  console.log('🏠 Extracting buildings metadata...');
  const buildingsMetadata = extractBuildingsMetadata(extractedBuildings);
  writeJson(path.join(OUTPUT_DIR, 'buildings.json'), buildingsMetadata);
  console.log(`✅ Extracted ${buildingsMetadata.buildings.length} buildings metadata\n`);
  
  // Extract recipes metadata directly from war3map.j
  console.log('🍲 Extracting recipes metadata...');
  const recipesMetadata = extractRecipesMetadata();
  writeJson(path.join(OUTPUT_DIR, 'recipes.json'), recipesMetadata);
  console.log(`✅ Extracted ${recipesMetadata.recipes.length} recipes\n`);
  
  // Extract abilities metadata (if needed)
  const existingAbilities = loadJson(path.join(OUTPUT_DIR, 'abilities.json'));
  if (!existingAbilities) {
    writeJson(path.join(OUTPUT_DIR, 'abilities.json'), { abilities: [] });
    console.log('✅ Created empty abilities.json\n');
  }
  
  console.log('✅ Metadata extraction complete!');
}

main();

