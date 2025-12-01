/**
 * Convert extracted .w3x data to TypeScript format
 * 
 * This script reads the extracted JSON files and converts them to the TypeScript
 * data structure used by the application.
 * 
 * Usage: node scripts/data/convert-extracted-to-typescript.mjs
 */

import path from 'path';
import { loadJson, slugify } from '../lib/utils.mjs';
import { mapAbilityCategory, isGarbageAbilityName, getMissingAbilityCategorySlugs } from '../converters/category-mapper.mjs';
import { convertItem, loadRecipesMap } from '../converters/item-converter.mjs';
import { convertAbility } from '../converters/ability-converter.mjs';
import { convertUnit, convertBaseClass, convertDerivedClass } from '../converters/unit-converter.mjs';
import { writeItemsFile, writeAbilitiesFile, writeClassesFile, writeDerivedClassesFile, writeAllUnitsFile } from '../generators/file-writer.mjs';
import { generateItemsIndex, generateAbilitiesIndex, generateUnitsIndex, generateAbilitiesTypes, generateItemsIconUtils } from '../generators/index-generator.mjs';
import { TMP_RAW_DIR, TMP_METADATA_DIR, ITEMS_TS_DIR, ABILITIES_TS_DIR, UNITS_TS_DIR } from '../lib/paths.mjs';

const RECIPES_FILE = path.join(TMP_METADATA_DIR, 'recipes.json');
const BUILDINGS_FILE = path.join(TMP_METADATA_DIR, 'buildings.json');
const UNITS_FILE = path.join(TMP_METADATA_DIR, 'units.json');
const EXTRACTED_UNITS_FILE = path.join(TMP_RAW_DIR, 'units.json');

function normalizeObjectId(rawId) {
  if (!rawId || typeof rawId !== 'string') return null;
  const base = rawId.split(':')[0];
  return base ? base.toUpperCase() : null;
}

function formatConstName(constName) {
  if (!constName) return null;
  const cleaned = constName
    .replace(/^LocalObjectIDs_/, '')
    .replace(/^UNIT_/, '')
    .replace(/^ITEM_/, '')
    .replace(/^ABILITY_/, '')
    .toLowerCase();
  if (!cleaned) return constName;
  return cleaned
    .split('_')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

/**
 * Main conversion function
 */
function main() {
  console.log('🔄 Converting extracted .w3x data to TypeScript format...\n');

  // Load extracted data
  const itemsData = loadJson(path.join(TMP_RAW_DIR, 'items.json'));
  const abilitiesData = loadJson(path.join(TMP_RAW_DIR, 'abilities.json'));
  const buildingsData = loadJson(BUILDINGS_FILE);
  const unitsData = loadJson(UNITS_FILE);
  const extractedUnitsData = loadJson(EXTRACTED_UNITS_FILE);
  const recipes = loadRecipesMap();

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
  const nameSet = new Set();
  const convertedItems = [];
  const objectIdToItem = new Map();

  for (const item of itemsData.items) {
    if (!item.name || nameSet.has(item.name)) {
      continue;
    }
    const converted = convertItem(item);
    if (!converted) continue;

    convertedItems.push(converted);
    nameSet.add(item.name);

    const baseObjectId = normalizeObjectId(item.id);
    if (baseObjectId && !objectIdToItem.has(baseObjectId)) {
      objectIdToItem.set(baseObjectId, converted);
    }
  }

  // Attach recipe metadata (after conversion so all items/slugs are known)
  const buildingSlugByUnitId = new Map();
  if (buildingsData?.buildings) {
    for (const building of buildingsData.buildings) {
      const unitCode = normalizeObjectId(building.unitId);
      if (!unitCode) continue;
      const label = building.name || building.id || building.unitId;
      buildingSlugByUnitId.set(unitCode, label);
    }
  }

  for (const [objectId, item] of objectIdToItem.entries()) {
    const recipe = recipes.get(objectId);
    if (!recipe) continue;

    const ingredientSlugs = (recipe.ingredients || [])
      .map((code) => objectIdToItem.get(code)?.id)
      .filter(Boolean);

    if (ingredientSlugs.length > 0) {
      item.recipe = ingredientSlugs;
    }

    if (recipe.mixingPotManaRequirement !== null && recipe.mixingPotManaRequirement !== undefined) {
      item.mixingPotManaRequirement = recipe.mixingPotManaRequirement;
    }

    const craftedAtLabel =
      buildingSlugByUnitId.get(recipe.craftedAtCode) ||
      formatConstName(recipe.craftedAtName) ||
      formatConstName(recipe.craftedAtConst);

    if (craftedAtLabel) {
      item.craftedAt = craftedAtLabel;
    }
  }

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
    const filePath = path.join(ITEMS_TS_DIR, fileName);
    writeItemsFile(filePath, items, category);
    console.log(`✅ Wrote ${items.length} items to ${fileName}`);
  }

  // Load additional ability data sources
  const wurstDetailsData = loadJson(path.join(TMP_METADATA_DIR, 'ability-details-wurst.json'));
  const relationshipsData = loadJson(path.join(TMP_METADATA_DIR, 'ability-relationships.json'));
  
  // Create lookup maps for merging
  const wurstDetailsMap = new Map();
  if (wurstDetailsData && wurstDetailsData.abilities) {
    for (const [abilityId, details] of Object.entries(wurstDetailsData.abilities)) {
      wurstDetailsMap.set(abilityId, details);
      // Also try with 'ability-' prefix
      wurstDetailsMap.set(`ability-${abilityId}`, details);
    }
    console.log(`  📚 Loaded ${Object.keys(wurstDetailsData.abilities).length} ability details from Wurst source`);
  }
  
  const relationshipsMap = new Map();
  if (relationshipsData && relationshipsData.relationships) {
    for (const [abilityId, rel] of Object.entries(relationshipsData.relationships)) {
      relationshipsMap.set(abilityId, rel);
      // Also try with 'ability-' prefix
      relationshipsMap.set(`ability-${abilityId}`, rel);
    }
    console.log(`  🔗 Loaded ${Object.keys(relationshipsData.relationships).length} ability relationships`);
  }
  console.log();

  // Convert abilities (deduplicate by name, filter garbage)
  const abilityMap = new Map();
  let filteredCount = 0;
  for (const ability of abilitiesData.abilities) {
    // Merge Wurst details if available
    const abilitySlug = slugify(ability.name || ability.id);
    const wurstDetails = wurstDetailsMap.get(abilitySlug) || wurstDetailsMap.get(ability.id?.toLowerCase());
    
    if (wurstDetails) {
      // Merge Wurst data into ability, but prefer raw data if Wurst data looks invalid (contains placeholders)
      const isInvalidHotkey = (val) => !val || typeof val !== 'string' || val.includes('TOOLTIP') || val.includes('lvl') || val.length > 5;
      const isInvalidTargets = (val) => !val || typeof val !== 'string' || val.includes('TARGET_ALLOWED') || val.includes('DUMMY') || val.includes('commaList') || val.includes('TargetsAllowed.');
      
      Object.assign(ability, {
        areaOfEffect: wurstDetails.areaOfEffect ?? ability.areaOfEffect,
        maxTargets: wurstDetails.maxTargets ?? ability.maxTargets,
        hotkey: (isInvalidHotkey(wurstDetails.hotkey) ? ability.hotkey : wurstDetails.hotkey) ?? ability.hotkey,
        targetsAllowed: (isInvalidTargets(wurstDetails.targetsAllowed) ? ability.targetsAllowed : wurstDetails.targetsAllowed) ?? ability.targetsAllowed,
        castRange: wurstDetails.castRange ?? ability.castRange,
        duration: wurstDetails.duration ?? ability.duration,
        damage: wurstDetails.damage ?? ability.damage,
        manaCost: wurstDetails.manaCost ?? ability.manaCost,
        cooldown: wurstDetails.cooldown ?? ability.cooldown,
        visualEffects: wurstDetails.visualEffects ?? ability.visualEffects,
        buttonPosition: wurstDetails.buttonPosition ?? ability.buttonPosition,
      });
    }
    
    // Merge relationships if available
    const rel = relationshipsMap.get(abilitySlug) || relationshipsMap.get(ability.id?.toLowerCase());
    if (rel) {
      ability.availableToClasses = rel.classes;
      ability.spellbook = rel.spellTypes.includes('hero') ? 'hero' : 
                         rel.spellTypes.includes('normal') ? 'normal' : undefined;
    }
    
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

    // Deduplicate by ID, merging fields from duplicates (prefer non-undefined values)
    if (!abilityMap.has(converted.id)) {
      abilityMap.set(converted.id, converted);
    } else {
      // Merge the new ability into the existing one, keeping non-undefined values
      const existing = abilityMap.get(converted.id);
      for (const [key, value] of Object.entries(converted)) {
        // If existing value is undefined/null/empty and new value is defined, use new value
        if ((existing[key] === undefined || existing[key] === null || existing[key] === '') && 
            value !== undefined && value !== null && value !== '') {
          existing[key] = value;
        }
        // For levels, merge the objects
        else if (key === 'levels' && value && typeof value === 'object' && existing[key] && typeof existing[key] === 'object') {
          existing[key] = { ...existing[key], ...value };
        }
        // For arrays like availableToClasses, merge and deduplicate
        else if (Array.isArray(value) && Array.isArray(existing[key])) {
          existing[key] = [...new Set([...existing[key], ...value])];
        }
      }
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
    'bonushandler': 'bonushandler.ts',
    'buff': 'buff.ts',
    'auradummy': 'auradummy.ts',
    'unknown': 'unknown.ts',
  };

  for (const [categoryKey, fileName] of Object.entries(abilityFileMap)) {
    const abilities = abilitiesByCategory[categoryKey] || [];
    const filePath = path.join(ABILITIES_TS_DIR, fileName);
    writeAbilitiesFile(filePath, abilities, categoryKey);
    console.log(`✅ Wrote ${abilities.length} abilities to ${fileName}`);
  }

  console.log('\n✅ Conversion complete!');

  const missingAbilityCategorySlugs = getMissingAbilityCategorySlugs();
  if (missingAbilityCategorySlugs.length > 0) {
    const sampleMissing = missingAbilityCategorySlugs.slice(0, 10);
    console.warn(`⚠️  ${missingAbilityCategorySlugs.length} abilities missing category metadata. Assigned 'unknown'. Sample: ${sampleMissing.join(', ')}`);
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

    const classesFilePath = path.join(UNITS_TS_DIR, 'classes.ts');
    writeClassesFile(classesFilePath, convertedBaseClasses);
    console.log(`✅ Wrote ${convertedBaseClasses.length} base classes to classes.ts`);

    // Filter and convert derived classes (subclass/superclass)
    const derivedUnits = allUnits.filter(u =>
      (u.type === 'subclass' || u.type === 'superclass') &&
      !u.id?.endsWith('-1')
    );
    const convertedDerivedClasses = derivedUnits.map(u => convertDerivedClass(u, allUnits));

    const derivedClassesFilePath = path.join(UNITS_TS_DIR, 'derivedClasses.ts');
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

    // Deduplicate units by name and type (keep first occurrence)
    const seenUnits = new Map();
    const deduplicatedUnits = [];
    const duplicatesRemoved = [];

    for (const unit of convertedUnits) {
      const key = `${unit.name}|${unit.type}`;
      if (seenUnits.has(key)) {
        duplicatesRemoved.push({ name: unit.name, type: unit.type, id: unit.id, existingId: seenUnits.get(key) });
      } else {
        seenUnits.set(key, unit.id);
        deduplicatedUnits.push(unit);
      }
    }

    if (duplicatesRemoved.length > 0) {
      console.log(`\n⚠️  Removed ${duplicatesRemoved.length} duplicate units:`);
      // Group duplicates by name for cleaner output
      const dupGroups = {};
      duplicatesRemoved.forEach(dup => {
        const key = `${dup.name} (${dup.type})`;
        if (!dupGroups[key]) dupGroups[key] = [];
        dupGroups[key].push(dup.id);
      });
      Object.entries(dupGroups).slice(0, 10).forEach(([name, ids]) => {
        console.log(`   ${name}: removed IDs ${ids.join(', ')}`);
      });
      if (duplicatesRemoved.length > 10) {
        console.log(`   ... and ${duplicatesRemoved.length - 10} more duplicates`);
      }
    }

    // Group by type for summary
    const unitsByType = {};
    deduplicatedUnits.forEach(u => {
      unitsByType[u.type] = (unitsByType[u.type] || 0) + 1;
    });

    const allUnitsFilePath = path.join(UNITS_TS_DIR, 'allUnits.ts');
    writeAllUnitsFile(allUnitsFilePath, deduplicatedUnits);
    console.log(`✅ Wrote ${deduplicatedUnits.length} units to allUnits.ts (${convertedUnits.length - deduplicatedUnits.length} duplicates removed)`);
    console.log(`   Types: ${Object.entries(unitsByType).map(([type, count]) => `${type}: ${count}`).join(', ')}`);
  } else {
    console.log('\n⚠️  No extracted units data found, skipping all units conversion');
  }

  // Generate index files and utility files
  console.log('\n📝 Generating index and utility files...');
  generateItemsIndex(ITEMS_TS_DIR, itemsByCategory);
  generateAbilitiesIndex(ABILITIES_TS_DIR, abilitiesByCategory);
  generateUnitsIndex(UNITS_TS_DIR);
  generateAbilitiesTypes(ABILITIES_TS_DIR);
  generateItemsIconUtils(ITEMS_TS_DIR);

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
