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

import path from 'path';
import { getRootDir, loadJson, writeJson, slugify, getField } from './utils.mjs';

const ROOT_DIR = getRootDir();
const EXTRACTED_DIR = path.join(ROOT_DIR, 'data', 'island_troll_tribes', 'extracted_from_w3x');
const OUTPUT_DIR = path.join(ROOT_DIR, 'data', 'island_troll_tribes');

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

// Recipe extraction is not yet implemented - keeping existing recipes.json if available

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
  
  // Recipes: Keep existing recipes.json if available, otherwise create empty
  console.log('📝 Checking recipes...');
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

