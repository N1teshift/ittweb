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
import { ObjectsTranslator } from 'wc3maptranslator';
import { Buffer } from 'buffer';
import { WORK_DIR, TMP_RAW_DIR, ensureTmpDirs } from '../lib/paths.mjs';
import { logWarning, logError, validateDirExists, writeJson } from '../lib/utils.mjs';

ensureTmpDirs();

/**
 * Read a file from the extracted directory
 */
function readExtractedFile(filename) {
  const filePath = path.join(WORK_DIR, filename);
  if (!fs.existsSync(filePath)) {
    logWarning(`File not found: ${filename}`, { filePath });
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
      logWarning(`Failed to parse ${objectType}: no result or json`, { objectType });
      return null;
    }
    return result.json; // Return the json property which contains { original, custom }
  } catch (error) {
    logWarning(`Error parsing ${objectType}`, { objectType, error: error.message });
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
        const lumberCost = getField('ilum') || 0;
        const hitPoints = getField('ihpc') || 0;
        const maxStack = getField('ista') || 0;
        const stockMaximum = getField('isto') || 0;
        const stockReplenishInterval = getField('istr') || 0;
        const scalingValue = getField('isca') || 0;
        
        // Extract string fields
        const hotkey = getField('uhot') || getField('ihot') || '';
        const abilities = getField('iabi') || '';
        const modelPath = getField('ifil') || '';
        
        // Extract boolean fields (1 = true, 0 = false)
        const droppable = getField('idrp') !== 0;
        const pawnable = getField('ipaw') !== 0;
        const perishable = getField('iper') !== 0;
        const activelyUsed = getField('iusa') !== 0;
        const ignoreCooldown = getField('iucd') !== 0;
        
        // Parse abilities string (comma-separated list)
        const abilitiesList = typeof abilities === 'string' && abilities.trim()
          ? abilities.split(',').map(a => a.trim()).filter(Boolean)
          : [];
        
        return {
          id,
          name: typeof name === 'string' ? name : '',
          description: typeof description === 'string' ? description : '',
          tooltip: typeof tooltip === 'string' ? tooltip : '',
          icon: typeof icon === 'string' ? icon : '',
          // Cost & Stock
          cost: typeof cost === 'number' ? cost : 0,
          lumberCost: typeof lumberCost === 'number' ? lumberCost : 0,
          stockMaximum: typeof stockMaximum === 'number' ? stockMaximum : 0,
          stockReplenishInterval: typeof stockReplenishInterval === 'number' ? stockReplenishInterval : 0,
          // Item Properties
          class: typeof classId === 'string' ? classId : '',
          level: typeof level === 'number' ? level : 0,
          uses: typeof uses === 'number' ? uses : 0,
          hitPoints: typeof hitPoints === 'number' ? hitPoints : 0,
          maxStack: typeof maxStack === 'number' ? maxStack : 0,
          scalingValue: typeof scalingValue === 'number' ? scalingValue : 0,
          modelPath: typeof modelPath === 'string' ? modelPath : '',
          // Usage & Abilities
          hotkey: typeof hotkey === 'string' ? hotkey : '',
          abilities: abilitiesList,
          activelyUsed,
          ignoreCooldown,
          // Boolean Flags
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
        
        // Helper to get all levels for a field
        const getAllLevels = (fieldId) => {
          const levels = {};
          modifications
            .filter(m => m.id === fieldId)
            .forEach(m => {
              if (m.value !== '' && m.value !== null && m.value !== undefined) {
                levels[m.level] = m.value;
              }
            });
          return Object.keys(levels).length > 0 ? levels : undefined;
        };
        
        // Extract common fields
        // For tooltips, prefer level 1 (aub1 level 1 often has more detailed tooltips)
        const name = getField('anam') || getField('unam') || '';
        const tooltip = getField('aub1', 1) || getField('aub1') || getField('aub2', 1) || getField('aub2') || getField('utub') || '';
        const icon = getField('aart') || getField('uico') || '';
        const description = getField('ades') || '';
        
        // Extract additional fields
        const areaOfEffect = getField('aare');
        const maxTargets = getField('acap');
        const hotkey = getField('ahky');
        const targetsAllowed = getField('atar');
        const castTime = getField('acat');
        
        // Extract attachment points (visual effects)
        const attachmentPoints = modifications
          .filter(m => m.id.startsWith('ata') && m.id !== 'atar' && m.id !== 'atat')
          .map(m => m.value)
          .filter(v => v && v !== '');
        const attachmentTarget = getField('atat');
        
        // Extract level-specific data
        const levels = {
          damage: getAllLevels('ahd1') || getAllLevels('ahd2'),
          manaCost: getAllLevels('amcs') || getAllLevels('amc1') || getAllLevels('amc2'),
          cooldown: getAllLevels('acdn') || getAllLevels('acd1') || getAllLevels('acd2'),
          duration: getAllLevels('adur') || getAllLevels('ahdu'),
          range: getAllLevels('aran') || getAllLevels('arng'),
          areaOfEffect: getAllLevels('aare'),
        };
        
        return {
          id,
          name: typeof name === 'string' ? name : '',
          description: typeof description === 'string' ? description : '',
          tooltip: typeof tooltip === 'string' ? tooltip : '',
          icon: typeof icon === 'string' ? icon : '',
          hero: getField('aher') === 1,
          item: getField('aite') === 1,
          race: getField('arac') || '',
          // Additional fields
          areaOfEffect: areaOfEffect !== '' ? (typeof areaOfEffect === 'number' ? areaOfEffect : parseFloat(areaOfEffect) || undefined) : undefined,
          maxTargets: maxTargets !== '' ? (typeof maxTargets === 'number' ? maxTargets : parseInt(maxTargets, 10) || undefined) : undefined,
          hotkey: hotkey !== '' ? hotkey : undefined,
          targetsAllowed: targetsAllowed !== '' ? targetsAllowed : undefined,
          castTime: castTime !== '' ? castTime : undefined,
          attachmentPoints: attachmentPoints.length > 0 ? attachmentPoints : undefined,
          attachmentTarget: attachmentTarget !== '' ? attachmentTarget : undefined,
          levels: Object.keys(levels).length > 0 ? levels : undefined,
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
        
        // Extract primary attributes
        const strength = getField('ustr');
        const agility = getField('uagi');
        const intelligence = getField('uint');
        const strengthPerLevel = getField('ustg');
        const agilityPerLevel = getField('uagp');
        const intelligencePerLevel = getField('uinp');
        
        // Extract combat stats
        const hp = getField('uhpm') || getField('uhpr');
        const mana = getField('umpm') || getField('umpr');
        const armor = getField('udef');
        const damageBase = getField('ua1b');
        const damageDice = getField('ua1d');
        const attackCooldown = getField('ua1c');
        const attackRange = getField('ua1r');
        const acquisitionRange = getField('uacq');
        const attackType = getField('ua1t');
        const defenseType = getField('udty');
        
        // Extract movement stats
        const moveSpeed = getField('umvs');
        const turnRate = getField('umvr');
        const collisionSize = getField('ucol');
        
        // Extract vision stats
        const sightRangeDay = getField('usid');
        const sightRangeNight = getField('usin');
        
        // Extract cost/resource stats
        const goldCost = getField('ugol');
        const lumberCost = getField('ulum');
        const foodCost = getField('ufoo');
        const buildTime = getField('ubld');
        
        // Extract abilities
        const abilities = getField('uabi') || '';
        const ability1 = getField('uag1') || '';
        const ability2 = getField('uag2') || '';
        const ability3 = getField('uag3') || '';
        const ability4 = getField('uag4') || '';
        const ability5 = getField('uag5') || '';
        const ability6 = getField('uag6') || '';
        
        // Parse abilities list (comma-separated or individual slots)
        const abilitiesList = [];
        if (typeof abilities === 'string' && abilities.trim()) {
          abilitiesList.push(...abilities.split(',').map(a => a.trim()).filter(Boolean));
        }
        [ability1, ability2, ability3, ability4, ability5, ability6].forEach(abil => {
          if (abil && !abilitiesList.includes(abil)) {
            abilitiesList.push(abil);
          }
        });
        
        // Extract classification flags
        const isBuilding = getField('ubdg') === 1;
        const isFlyer = getField('ufma') !== 0;
        const isWorker = getField('uapw') === 1;
        const canAttack = getField('uap') === 1;
        const canHarvest = getField('uhar') === 1;
        
        // Helper to parse numeric values safely
        const parseNumber = (value) => {
          if (value === undefined || value === null || value === '') return undefined;
          if (typeof value === 'number') return value;
          const parsed = parseFloat(value);
          return isNaN(parsed) ? undefined : parsed;
        };
        
        // Helper to parse integer values
        const parseIntValue = (value) => {
          if (value === undefined || value === null || value === '') return undefined;
          if (typeof value === 'number') return Math.floor(value);
          const parsed = parseInt(value, 10);
          return isNaN(parsed) ? undefined : parsed;
        };
        
        return {
          id,
          name: typeof name === 'string' ? name : '',
          description: typeof description === 'string' ? description : '',
          tooltip: typeof tooltip === 'string' ? tooltip : '',
          icon: typeof icon === 'string' ? icon : '',
          race: getField('urac') || '',
          classification: getField('utyp') || '',
          // Primary attributes
          strength: parseNumber(strength),
          agility: parseNumber(agility),
          intelligence: parseNumber(intelligence),
          strengthPerLevel: parseNumber(strengthPerLevel),
          agilityPerLevel: parseNumber(agilityPerLevel),
          intelligencePerLevel: parseNumber(intelligencePerLevel),
          // Combat stats
          hp: parseNumber(hp),
          mana: parseNumber(mana),
          armor: parseNumber(armor),
          damageBase: parseNumber(damageBase),
          damageDice: parseNumber(damageDice),
          attackCooldown: parseNumber(attackCooldown),
          attackRange: parseNumber(attackRange),
          acquisitionRange: parseNumber(acquisitionRange),
          attackType: typeof attackType === 'string' ? attackType : undefined,
          defenseType: typeof defenseType === 'string' ? defenseType : undefined,
          // Movement stats
          moveSpeed: parseNumber(moveSpeed),
          turnRate: parseNumber(turnRate),
          collisionSize: parseNumber(collisionSize),
          // Vision stats
          sightRangeDay: parseIntValue(sightRangeDay),
          sightRangeNight: parseIntValue(sightRangeNight),
          // Cost/resource stats
          goldCost: parseIntValue(goldCost),
          lumberCost: parseIntValue(lumberCost),
          foodCost: parseNumber(foodCost),
          buildTime: parseNumber(buildTime),
          // Abilities
          abilities: abilitiesList.length > 0 ? abilitiesList : undefined,
          // Classification flags
          isBuilding: isBuilding || undefined,
          isFlyer: isFlyer || undefined,
          isWorker: isWorker || undefined,
          canAttack: canAttack || undefined,
          canHarvest: canHarvest || undefined,
          // Raw data for reference
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
        
        // Extract building-specific stats
        const hp = getField('bhpm') || getField('uhpm') || getField('uhpr');
        const armor = getField('bdef') || getField('udef');
        const buildTime = getField('ubld');
        const goldCost = getField('ugol');
        const lumberCost = getField('ulum') || getField('ulur');
        const repairCost = getField('bprc');
        const repairTime = getField('bprt');
        const supplyProvided = getField('ubsp');
        const supplyUsed = getField('ubsa') || getField('ufoo');
        
        // Extract abilities for buildings (some buildings have abilities)
        const abilities = getField('uabi') || '';
        
        // Helper to parse numeric values safely
        const parseNumber = (value) => {
          if (value === undefined || value === null || value === '') return undefined;
          if (typeof value === 'number') return value;
          const parsed = parseFloat(value);
          return isNaN(parsed) ? undefined : parsed;
        };
        
        // Helper to parse integer values
        const parseIntValue = (value) => {
          if (value === undefined || value === null || value === '') return undefined;
          if (typeof value === 'number') return Math.floor(value);
          const parsed = parseInt(value, 10);
          return isNaN(parsed) ? undefined : parsed;
        };
        
        // Parse abilities list (comma-separated)
        const abilitiesList = typeof abilities === 'string' && abilities.trim()
          ? abilities.split(',').map(a => a.trim()).filter(Boolean)
          : [];
        
        return {
          id,
          name: typeof name === 'string' ? name : '',
          description: typeof description === 'string' ? description : '',
          tooltip: typeof tooltip === 'string' ? tooltip : '',
          icon: typeof icon === 'string' ? icon : '',
          // Building stats
          hp: parseNumber(hp),
          armor: parseNumber(armor),
          buildTime: parseNumber(buildTime),
          goldCost: parseIntValue(goldCost),
          lumberCost: parseIntValue(lumberCost),
          repairCost: parseNumber(repairCost),
          repairTime: parseNumber(repairTime),
          supplyProvided: parseIntValue(supplyProvided),
          supplyUsed: parseIntValue(supplyUsed),
          // Abilities
          abilities: abilitiesList.length > 0 ? abilitiesList : undefined,
          // Raw data for reference
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
  try {
    validateDirExists(WORK_DIR);
  } catch (error) {
    logError('Extracted files directory not found', error, { workDir: WORK_DIR });
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
    writeJson(outputFile, output);
    console.log(`\n✅ Saved combined data to: ${outputFile}`);
    
    // Write individual files
    if (items) {
      writeJson(path.join(TMP_RAW_DIR, 'items.json'), { items, generatedAt: new Date().toISOString() });
    }
    if (abilities) {
      writeJson(path.join(TMP_RAW_DIR, 'abilities.json'), { abilities, generatedAt: new Date().toISOString() });
    }
    if (units) {
      writeJson(path.join(TMP_RAW_DIR, 'units.json'), { units, generatedAt: new Date().toISOString() });
    }
    if (buildings) {
      writeJson(path.join(TMP_RAW_DIR, 'buildings.json'), { buildings, generatedAt: new Date().toISOString() });
    }
    
    console.log('\n📊 Summary:');
    console.log(`  Items: ${items?.length || 0}`);
    console.log(`  Abilities: ${abilities?.length || 0}`);
    console.log(`  Units: ${units?.length || 0}`);
    console.log(`  Buildings: ${buildings?.length || 0}`);
    console.log(`\n✅ Extraction complete!`);
    
  } catch (error) {
    logError('Extraction failed', error);
    process.exit(1);
  }
}

main();

