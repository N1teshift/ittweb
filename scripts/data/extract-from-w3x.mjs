/**
 * Extract game data from compiled .w3x map file
 * 
 * This script extracts items, abilities, units, and buildings from the compiled map file.
 * The .w3x file is an MPQ archive containing standardized object data files.
 * 
 * PREREQUISITE: You need to extract the .w3x file first using an MPQ editor tool.
 * Recommended tools:
 *   - MPQ Editor: https://www.zezula.net/en/mpq/download.html
 *   - Or use: node scripts/extract-mpq-files.mjs (if we create it)
 * 
 * After extraction, place the object files in:
 *   external/Work/
 *     - war3map.w3t (items)
 *     - war3map.w3a (abilities)
 *     - war3map.w3u (units)
 *     - war3map.w3b (buildings/destructables)
 * 
 * Usage: node scripts/data/extract-from-w3x.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ObjectsTranslator } from 'wc3maptranslator';
import { Buffer } from 'buffer';
import { WORK_DIR, TMP_RAW_DIR, ensureTmpDirs } from './paths.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..', '..');

ensureTmpDirs();

/**
 * Read a file from the extracted directory
 */
function readExtractedFile(filename) {
  const filePath = path.join(WORK_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`  File not found: ${filePath}`);
    return null;
  }
  return fs.readFileSync(filePath);
}

/**
 * Parse object data from ObjectsTranslator
 * warToJson is a static method that takes (type, buffer)
 */
function parseObjectData(TranslatorClass, buffer, objectType) {
  try {
    const result = TranslatorClass.warToJson(objectType, buffer);
    if (!result || !result.json) {
      console.warn(`  Failed to parse ${objectType}: no result or json`);
      return null;
    }
    return result.json; // Return the json property which contains { original, custom }
  } catch (error) {
    console.warn(`  Error parsing ${objectType}:`, error.message);
    if (error.stack) {
      console.warn(`  Stack: ${error.stack.split('\n').slice(0, 3).join('\n')}`);
    }
    return null;
  }
}

/**
 * Extract items from war3map.w3t
 */
function extractItems() {
  console.log('\n📦 Extracting Items...');
  const buffer = readExtractedFile('war3map.w3t');
  if (!buffer) {
    console.log('  No items file found');
    return null;
  }
  
  const data = parseObjectData(ObjectsTranslator, buffer, ObjectsTranslator.ObjectType.Items);
  
  // ObjectsTranslator returns { original: {}, custom: {} }
  if (data) {
    // Combine original and custom items
    const originalItems = data.original || {};
    const customItems = data.custom || {};
    const allItems = { ...originalItems, ...customItems };
    
    if (typeof allItems === 'object' && allItems !== null) {
      const itemEntries = Object.entries(allItems).map(([id, item]) => {
        // Items are stored as arrays of modifications
        const modifications = Array.isArray(item) ? item : [];
        
        // Helper to find field value
        const getField = (fieldId) => {
          const field = modifications.find(m => m.id === fieldId && m.level === 0);
          return field ? field.value : '';
        };
        
        // Extract common fields
        const name = getField('unam') || getField('inam') || '';
        const tooltip = getField('utub') || getField('ides') || '';
        const icon = getField('iico') || getField('uico') || '';
        const description = getField('ides') || '';
        
        // Extract numeric fields
        const cost = getField('igol') || 0;
        const level = getField('ilev') || 0;
        const uses = getField('iuse') || 0;
        const classId = getField('icla') || '';
        
        // Extract boolean fields (1 = true, 0 = false)
        const droppable = getField('idrp') !== 0;
        const pawnable = getField('ipaw') !== 0;
        const perishable = getField('iper') !== 0;
        
        return {
          id,
          name: typeof name === 'string' ? name : '',
          description: typeof description === 'string' ? description : '',
          tooltip: typeof tooltip === 'string' ? tooltip : '',
          icon: typeof icon === 'string' ? icon : '',
          // Additional properties
          class: typeof classId === 'string' ? classId : '',
          level: typeof level === 'number' ? level : 0,
          cost: typeof cost === 'number' ? cost : 0,
          uses: typeof uses === 'number' ? uses : 0,
          droppable,
          pawnable,
          perishable,
          // Raw data for reference
          raw: modifications
        };
      });
      
      console.log(`  Found ${itemEntries.length} items`);
      return itemEntries;
    }
  }
  
  console.log('  No items found in parsed data');
  return null;
}

/**
 * Extract abilities from war3map.w3a
 */
function extractAbilities() {
  console.log('\n✨ Extracting Abilities...');
  const buffer = readExtractedFile('war3map.w3a');
  if (!buffer) {
    console.log('  No abilities file found');
    return null;
  }
  
  const data = parseObjectData(ObjectsTranslator, buffer, ObjectsTranslator.ObjectType.Abilities);
  
  if (data) {
    // Combine original and custom abilities
    const originalAbilities = data.original || {};
    const customAbilities = data.custom || {};
    const allAbilities = { ...originalAbilities, ...customAbilities };
    
    if (typeof allAbilities === 'object' && allAbilities !== null) {
      const abilityEntries = Object.entries(allAbilities).map(([id, ability]) => {
        // Abilities are stored as arrays of modifications
        const modifications = Array.isArray(ability) ? ability : [];
        
        // Helper to find field value (checks level 0 first, then other levels)
        const getField = (fieldId, preferLevel = 0) => {
          // Try preferred level first
          let field = modifications.find(m => m.id === fieldId && m.level === preferLevel);
          // If not found, try level 0
          if (!field) {
            field = modifications.find(m => m.id === fieldId && m.level === 0);
          }
          // If still not found, try any level
          if (!field) {
            field = modifications.find(m => m.id === fieldId);
          }
          return field ? field.value : '';
        };
        
        // Extract common fields
        // For tooltips, prefer level 1 (aub1 level 1 often has more detailed tooltips)
        const name = getField('anam') || getField('unam') || '';
        const tooltip = getField('aub1', 1) || getField('aub1') || getField('aub2', 1) || getField('aub2') || getField('utub') || '';
        const icon = getField('aart') || getField('uico') || '';
        const description = getField('ades') || '';
        
        return {
          id,
          name: typeof name === 'string' ? name : '',
          description: typeof description === 'string' ? description : '',
          tooltip: typeof tooltip === 'string' ? tooltip : '',
          icon: typeof icon === 'string' ? icon : '',
          hero: getField('aher') === 1,
          item: getField('aite') === 1,
          race: getField('arac') || '',
          raw: modifications
        };
      });
      
      console.log(`  Found ${abilityEntries.length} abilities`);
      return abilityEntries;
    }
  }
  
  return null;
}

/**
 * Extract units from war3map.w3u
 */
function extractUnits() {
  console.log('\n👤 Extracting Units...');
  const buffer = readExtractedFile('war3map.w3u');
  if (!buffer) {
    console.log('  No units file found');
    return null;
  }
  
  const data = parseObjectData(ObjectsTranslator, buffer, ObjectsTranslator.ObjectType.Units);
  
  if (data) {
    // Combine original and custom units
    const originalUnits = data.original || {};
    const customUnits = data.custom || {};
    const allUnits = { ...originalUnits, ...customUnits };
    
    if (typeof allUnits === 'object' && allUnits !== null) {
      const unitEntries = Object.entries(allUnits).map(([id, unit]) => {
        // Units are stored as arrays of modifications
        const modifications = Array.isArray(unit) ? unit : [];
        
        // Helper to find field value
        const getField = (fieldId) => {
          const field = modifications.find(m => m.id === fieldId && m.level === 0);
          return field ? field.value : '';
        };
        
        // Extract common fields
        const name = getField('unam') || '';
        const tooltip = getField('utub') || getField('utip') || '';
        const icon = getField('uico') || '';
        const description = getField('ides') || '';
        
        return {
          id,
          name: typeof name === 'string' ? name : '',
          description: typeof description === 'string' ? description : '',
          tooltip: typeof tooltip === 'string' ? tooltip : '',
          icon: typeof icon === 'string' ? icon : '',
          race: getField('urac') || '',
          classification: getField('utyp') || '',
          raw: modifications
        };
      });
      
      console.log(`  Found ${unitEntries.length} units`);
      return unitEntries;
    }
  }
  
  return null;
}

/**
 * Extract buildings/destructables from war3map.w3b
 */
function extractBuildings() {
  console.log('\n🏗️  Extracting Buildings...');
  const buffer = readExtractedFile('war3map.w3b');
  if (!buffer) {
    console.log('  No buildings file found');
    return null;
  }
  
  const data = parseObjectData(ObjectsTranslator, buffer, ObjectsTranslator.ObjectType.Destructables);
  
  if (data) {
    // Combine original and custom destructables
    const originalBuildings = data.original || {};
    const customBuildings = data.custom || {};
    const allBuildings = { ...originalBuildings, ...customBuildings };
    
    if (typeof allBuildings === 'object' && allBuildings !== null) {
      const buildingEntries = Object.entries(allBuildings).map(([id, building]) => {
        // Buildings/destructables are stored as arrays of modifications
        const modifications = Array.isArray(building) ? building : [];
        
        // Helper to find field value
        const getField = (fieldId) => {
          const field = modifications.find(m => m.id === fieldId && m.level === 0);
          return field ? field.value : '';
        };
        
        // Extract common fields
        const name = getField('bnam') || getField('unam') || '';
        const tooltip = getField('btub') || getField('utub') || '';
        const icon = getField('bico') || getField('uico') || '';
        const description = getField('bdes') || '';
        
        return {
          id,
          name: typeof name === 'string' ? name : '',
          description: typeof description === 'string' ? description : '',
          tooltip: typeof tooltip === 'string' ? tooltip : '',
          icon: typeof icon === 'string' ? icon : '',
          raw: modifications
        };
      });
      
      console.log(`  Found ${buildingEntries.length} buildings/destructables`);
      return buildingEntries;
    }
  }
  
  return null;
}

/**
 * Main extraction function
 */
function main() {
  console.log('🗺️  Extracting data from .w3x map file object data...');
  console.log(`\nLooking for extracted files in: ${WORK_DIR}`);
  
  // Check if extracted directory exists
  if (!fs.existsSync(WORK_DIR)) {
    console.error(`\n❌ Extracted files directory not found: ${WORK_DIR}`);
    console.error('\n📋 INSTRUCTIONS:');
    console.error('  1. Extract the .w3x file using an MPQ editor (e.g., MPQ Editor)');
    console.error('  2. Extract these files from the archive:');
    console.error('     - war3map.w3t (items)');
    console.error('     - war3map.w3a (abilities)');
    console.error('     - war3map.w3u (units)');
    console.error('     - war3map.w3b (buildings/destructables)');
    console.error(`  3. Place them in: ${WORK_DIR}`);
    console.error('\n  Or use: node scripts/extract-mpq-files.mjs (if available)');
    process.exit(1);
  }
  
  try {
    // Extract object data
    const items = extractItems();
    const abilities = extractAbilities();
    const units = extractUnits();
    const buildings = extractBuildings();
    
    // Save extracted data
    const output = {
      generatedAt: new Date().toISOString(),
      source: 'Island.Troll.Tribes.v3.28.w3x',
      stats: {
        items: items?.length || 0,
        abilities: abilities?.length || 0,
        units: units?.length || 0,
        buildings: buildings?.length || 0,
      },
      items: items || [],
      abilities: abilities || [],
      units: units || [],
      buildings: buildings || [],
    };
    
    // Write combined output
    const outputFile = path.join(TMP_RAW_DIR, 'all_objects.json');
    fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
    console.log(`\n✅ Saved combined data to: ${outputFile}`);
    
    // Write individual files
    if (items) {
      fs.writeFileSync(
        path.join(TMP_RAW_DIR, 'items.json'),
        JSON.stringify({ items, generatedAt: new Date().toISOString() }, null, 2)
      );
    }
    if (abilities) {
      fs.writeFileSync(
        path.join(TMP_RAW_DIR, 'abilities.json'),
        JSON.stringify({ abilities, generatedAt: new Date().toISOString() }, null, 2)
      );
    }
    if (units) {
      fs.writeFileSync(
        path.join(TMP_RAW_DIR, 'units.json'),
        JSON.stringify({ units, generatedAt: new Date().toISOString() }, null, 2)
      );
    }
    if (buildings) {
      fs.writeFileSync(
        path.join(TMP_RAW_DIR, 'buildings.json'),
        JSON.stringify({ buildings, generatedAt: new Date().toISOString() }, null, 2)
      );
    }
    
    console.log('\n📊 Summary:');
    console.log(`  Items: ${items?.length || 0}`);
    console.log(`  Abilities: ${abilities?.length || 0}`);
    console.log(`  Units: ${units?.length || 0}`);
    console.log(`  Buildings: ${buildings?.length || 0}`);
    console.log(`\n✅ Extraction complete!`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();

