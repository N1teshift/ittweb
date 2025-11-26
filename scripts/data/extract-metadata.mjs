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
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..', '..');
const EXTRACTED_DIR = path.join(ROOT_DIR, 'data', 'island_troll_tribes', 'extracted_from_w3x');
const OUTPUT_DIR = path.join(ROOT_DIR, 'data', 'island_troll_tribes');
const WORK_DIR = path.join(ROOT_DIR, 'external', 'Work');

/**
 * Load JSON file
 */
function loadJson(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

/**
 * Write JSON file
 */
function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
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
    const getField = (fieldId) => {
      const field = raw.find(r => r.id === fieldId && r.level === 0);
      return field ? field.value : undefined;
    };
    
    // Only include units that are base/subclass/superclass, or have meaningful stats
    const str = getField('ustr');
    const agi = getField('uagi');
    const int = getField('uint');
    const hp = getField('uhpm') || getField('uhpr');
    
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
          baseMana: getField('umpm') || getField('umpr') || 192,
          baseMoveSpeed: getField('umvs') || 290,
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
      baseMana: getField('umpm') || getField('umpr') || 192,
      baseMoveSpeed: getField('umvs') || 290,
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
    const getField = (fieldId) => {
      const field = raw.find(r => r.id === fieldId && r.level === 0);
      return field ? field.value : undefined;
    };
    
    const buildingData = {
      id: slugify(name || id),
      unitId: building.id || id.toUpperCase(),
      name: name,
      description: building.description || '',
      hp: getField('bhpm') || getField('uhpm') || null,
      armor: getField('bdef') || getField('udef') || null,
      craftableItems: [], // Will be populated from recipes if available
    };
    
    buildings.push(buildingData);
  }
  
  return { buildings };
}

/**
 * Extract recipes from JASS file (war3map.j)
 * Looks for recipe patterns in the compiled JASS code
 */
function extractRecipesFromJASS() {
  const jassFile = path.join(WORK_DIR, 'war3map.j');
  if (!fs.existsSync(jassFile)) {
    console.warn('⚠️  war3map.j not found, skipping recipe extraction from JASS');
    return [];
  }
  
  try {
    const content = fs.readFileSync(jassFile, 'utf-8');
    const recipes = [];
    
    // Look for patterns like: call AddRecipe(ITEM_ID, ITEM_INGREDIENT1, ITEM_INGREDIENT2, ...)
    // Or: Recipe.create(ITEM_ID, [INGREDIENTS])
    const recipePatterns = [
      // Pattern 1: AddRecipe calls
      /(?:call\s+)?AddRecipe\s*\(\s*([A-Z0-9_]+)\s*,\s*([^)]+)\s*\)/gi,
      // Pattern 2: Recipe.create or similar
      /Recipe\.(?:create|add)\s*\(\s*([A-Z0-9_]+)\s*,\s*\[([^\]]+)\]/gi,
    ];
    
    // For now, return empty array - recipe extraction from JASS is complex
    // This is a placeholder for future implementation
    console.log('📝 Recipe extraction from JASS not yet implemented');
    return recipes;
    
  } catch (error) {
    console.warn(`⚠️  Error reading war3map.j: ${error.message}`);
    return [];
  }
}

/**
 * Extract recipes from items (if items have recipe data in their modifications)
 */
function extractRecipesFromItems(extractedItems) {
  if (!extractedItems || !extractedItems.items) {
    return [];
  }
  
  const recipes = [];
  
  // Items might have recipe data in their raw modifications
  // This is a placeholder - actual recipe extraction would need to parse
  // the item modifications for recipe-related fields
  
  console.log('📝 Recipe extraction from items not yet implemented');
  return recipes;
}

/**
 * Main function
 */
function main() {
  console.log('📋 Extracting metadata from extracted game data...\n');
  
  // Load extracted data
  const extractedUnits = loadJson(path.join(EXTRACTED_DIR, 'units.json'));
  const extractedBuildings = loadJson(path.join(EXTRACTED_DIR, 'buildings.json'));
  const extractedItems = loadJson(path.join(EXTRACTED_DIR, 'items.json'));
  
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
  
  // Extract recipes (placeholder - complex, needs more work)
  console.log('📝 Extracting recipes...');
  const recipesFromJASS = extractRecipesFromJASS();
  const recipesFromItems = extractRecipesFromItems(extractedItems);
  
  // For now, if recipes.json exists, keep it; otherwise create empty
  const existingRecipes = loadJson(path.join(OUTPUT_DIR, 'recipes.json'));
  if (!existingRecipes) {
    writeJson(path.join(OUTPUT_DIR, 'recipes.json'), { recipes: [] });
    console.log('⚠️  Created empty recipes.json (recipe extraction not yet implemented)\n');
  } else {
    console.log('✅ Using existing recipes.json (recipe extraction not yet implemented)\n');
  }
  
  // Extract abilities metadata (if needed)
  const existingAbilities = loadJson(path.join(OUTPUT_DIR, 'abilities.json'));
  if (!existingAbilities) {
    writeJson(path.join(OUTPUT_DIR, 'abilities.json'), { abilities: [] });
    console.log('✅ Created empty abilities.json\n');
  }
  
  console.log('✅ Metadata extraction complete!');
}

main();

