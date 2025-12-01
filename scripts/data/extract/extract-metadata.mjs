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
import { loadJson, writeJson, slugify, getField, validateJsonStructure, validateArrayItems, logWarning } from '../lib/utils.mjs';
import { TMP_RAW_DIR, TMP_METADATA_DIR, WORK_DIR, ROOT_DIR, ensureTmpDirs } from '../lib/paths.mjs';

const WURST_UNIT_TEXT_FILE = path.join(ROOT_DIR, 'external', 'island-troll-tribes', 'wurst', 'objects', 'units', 'TrollUnitTextConstant.wurst');

const EXTRACTED_DIR = TMP_RAW_DIR;
const OUTPUT_DIR = TMP_METADATA_DIR;
const WAR3MAP_FILE = path.join(WORK_DIR, 'war3map.j');

ensureTmpDirs();

/**
 * Extract class descriptions from TrollUnitTextConstant.wurst
 * Returns a map of class slug -> description text
 */
function extractClassDescriptions() {
  const descriptions = {};
  
  if (!fs.existsSync(WURST_UNIT_TEXT_FILE)) {
    logWarning(`Wurst unit text file not found: ${WURST_UNIT_TEXT_FILE}`);
    return descriptions;
  }
  
  const content = fs.readFileSync(WURST_UNIT_TEXT_FILE, 'utf-8');
  
  // Map TOOLTIP_* constant names to class slugs
  const tooltipToSlug = {
    'TOOLTIP_HUNTER': 'hunter',
    'TOOLTIP_MAGE': 'mage',
    'TOOLTIP_PRIEST': 'priest',
    'TOOLTIP_BEASTMASTER': 'beastmaster',
    'TOOLTIP_THIEF': 'thief',
    'TOOLTIP_SCOUT': 'scout',
    'TOOLTIP_GATHERER': 'gatherer',
    // Subclasses
    'TOOLTIP_WARRIOR': 'gurubashi-warrior',
    'TOOLTIP_TRACKER': 'tracker',
    'TOOLTIP_ELEMENTALIST': 'elementalist',
    'TOOLTIP_DREAMWALKER': 'dreamwalker',
    'TOOLTIP_HYPNOTIST': 'hypnotist',
    'TOOLTIP_BOOSTER': 'booster',
    'TOOLTIP_MASTER_HEALER': 'master-healer',
    'TOOLTIP_SHAPESHIFTER': 'shapeshifter',
    'TOOLTIP_DIRE_WOLF': 'dire-wolf',
    'TOOLTIP_DIRE_BEAR': 'dire-bear',
    'TOOLTIP_DRUID': 'druid',
    'TOOLTIP_ESCAPE_ARTIST': 'escape-artist',
    'TOOLTIP_ROGUE': 'rogue',
    'TOOLTIP_CONTORTIONIST': 'contortionist',
    'TOOLTIP_TELETHIEF': 'telethief',
    'TOOLTIP_OBSERVER': 'observer',
    'TOOLTIP_TRAPPER': 'trapper',
    'TOOLTIP_RADAR_GATHERER': 'radar-gatherer',
    'TOOLTIP_ALCHEMIST': 'alchemist',
    'TOOLTIP_HERB_MASTER': 'herb-master',
    // Superclasses
    'TOOLTIP_JUGGERNAUT': 'gurubashi-champion', // Juggernaut is the superclass for Hunter
    'TOOLTIP_DEMENTIA_MASTER': 'dementia-master',
    'TOOLTIP_SAGE': 'sage',
    'TOOLTIP_JUNGLE_TYRANT': 'jungle-tyrant',
    'TOOLTIP_ASSASSIN': 'assassin',
    'TOOLTIP_SPY': 'spy',
    'TOOLTIP_OMNIGATHERER': 'omni-gatherer',
  };
  
  // Extract each TOOLTIP_* constant
  for (const [tooltipConst, slug] of Object.entries(tooltipToSlug)) {
    // Match: public constant TOOLTIP_NAME = "" + "text" + "more text" + CONSTANT
    // Constants don't have semicolons, they end with a newline before the next constant
    // Match until the next "public constant" or end of content
    const regex = new RegExp(
      `public\\s+constant\\s+${tooltipConst}\\s*=\\s*([^]*?)(?=\\n\\s*public\\s+constant|$)`,
      's'
    );
    
    const match = content.match(regex);
    if (match) {
      let tooltipText = match[1].trim();
      
      // Remove string concatenation operators and quotes
      // Handle patterns like: "" + "text" + CONSTANT + "more text"
      tooltipText = tooltipText
        .replace(/^""\s*\+\s*/, '') // Remove leading "" +
        .replace(/\s*\+\s*/g, ' ') // Replace all + with space
        .replace(/COLOR_[A-Z_]+\.toColorString\(\)/g, '') // Remove color functions
        .replace(/\.color\([^)]+\)/g, '') // Remove .color() calls
        .replace(/["']/g, '') // Remove quotes
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/^\s+|\s+$/g, '') // Trim
        // Remove constants like INVENTORY_3_SLOT, DIFFICULTY_EASY, SUBCLASS_WARNING
        .replace(/\b(INVENTORY_[0-9]_SLOT|DIFFICULTY_[A-Z]+|SUBCLASS_WARNING)\b/g, '')
        .replace(/\s+/g, ' ') // Normalize whitespace again
        .trim();
      
      if (tooltipText && tooltipText.length > 10) {
        descriptions[slug] = tooltipText;
      }
    }
  }
  
  return descriptions;
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
      description: unit.description || unit.tooltip || '', // Include description/tooltip from extracted data
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
    
    // Use stats from extracted building (from enhanced extraction), fallback to raw if needed
    const raw = building.raw || [];
    const getBuildingField = (fieldId) => getField(raw, fieldId, 0);
    
    const buildingData = {
      id: slugify(name || id),
      unitId: building.id || id.toUpperCase(),
      name: name,
      description: building.description || '',
      // Building stats (use extracted values, fallback to raw extraction)
      hp: building.hp ?? (getBuildingField('bhpm') || getBuildingField('uhpm') || null),
      armor: building.armor ?? (getBuildingField('bdef') || getBuildingField('udef') || null),
      buildTime: building.buildTime ?? undefined,
      goldCost: building.goldCost ?? undefined,
      lumberCost: building.lumberCost ?? undefined,
      repairCost: building.repairCost ?? undefined,
      repairTime: building.repairTime ?? undefined,
      supplyProvided: building.supplyProvided ?? undefined,
      supplyUsed: building.supplyUsed ?? undefined,
      abilities: building.abilities ?? undefined,
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
 * Extract item metadata from war3map.j
 * Maps item constants to their names for better categorization
 */
function extractItemsMetadata() {
  const itemIdToNameMap = new Map(); // Maps item constant to normalized name
  
  // Parse war3map.j to extract LocalObjectIDs_ITEM_* constants and their names
  if (fs.existsSync(WAR3MAP_FILE)) {
    const warContent = fs.readFileSync(WAR3MAP_FILE, 'utf-8');
    const lines = warContent.split(/\r?\n/);
    const { objectMap, aliasMap } = buildLocalObjectMetadata(lines);
    
    // Extract all ITEM constants
    const itemIdRegex = /integer\s+LocalObjectIDs_ITEM_([A-Z0-9_]+)\s*=/g;
    let match;
    
    while ((match = itemIdRegex.exec(warContent)) !== null) {
      const itemConstName = `LocalObjectIDs_ITEM_${match[1]}`;
      const resolved = resolveAlias(itemConstName, aliasMap);
      
      if (resolved && resolved.startsWith('LocalObjectIDs_ITEM_')) {
        const itemMeta = objectMap.get(resolved);
        if (itemMeta && itemMeta.name) {
          // Normalize the name for mapping
          const normalizedName = itemMeta.name
            .toLowerCase()
            .trim();
          
          // Map both the constant name (without prefix) and the object name
          const constNameWithoutPrefix = match[1].toLowerCase().replace(/_/g, '-');
          itemIdToNameMap.set(constNameWithoutPrefix, normalizedName);
          itemIdToNameMap.set(normalizedName, normalizedName);
          
          // Also map slugified versions
          const slugified = slugify(itemMeta.name);
          if (slugified && slugified !== normalizedName) {
            itemIdToNameMap.set(slugified, normalizedName);
          }
        }
      }
    }
    
    console.log(`  Found ${itemIdToNameMap.size} item ID mappings from war3map.j`);
  }
  
  return {
    generatedAt: new Date().toISOString(),
    source: 'war3map.j',
    itemIdToNameMap: Object.fromEntries(itemIdToNameMap),
    totalMappings: itemIdToNameMap.size,
  };
}

/**
 * Extract ability metadata from war3map.j and Wurst source files
 * Maps ability IDs and names to their categories (hunter, mage, priest, etc.)
 */
function extractAbilitiesMetadata() {
  const abilityCategoryMap = new Map(); // Maps ability name/id to category
  const abilityIdToNameMap = new Map(); // Maps ability ID to name from war3map.j
  
  // Step 1: Parse war3map.j to extract LocalObjectIDs_ABILITY_* constants
  if (fs.existsSync(WAR3MAP_FILE)) {
    const warContent = fs.readFileSync(WAR3MAP_FILE, 'utf-8');
    const abilityIdRegex = /integer\s+LocalObjectIDs_ABILITY_([A-Z0-9_]+)\s*=/g;
    let match;
    
    while ((match = abilityIdRegex.exec(warContent)) !== null) {
      const abilityName = match[1];
      // Convert ABILITY_NAME to ability-name format
      const normalizedName = abilityName
        .toLowerCase()
        .replace(/_/g, '-')
        .replace(/^ability-/, '');
      abilityIdToNameMap.set(abilityName, normalizedName);
    }
    
    console.log(`  Found ${abilityIdToNameMap.size} ability IDs in war3map.j`);
  }
  
  // Step 2: Parse Wurst source file to extract ability-to-class mappings
  const wurstFile = path.join(ROOT_DIR, 'island-troll-tribes', 'wurst', 'objects', 'units', 'TrollUnitTextConstant.wurst');
  if (fs.existsSync(wurstFile)) {
    const wurstContent = fs.readFileSync(wurstFile, 'utf-8');
    
    // Map class names to categories
    const classToCategoryMap = {
      'HUNTER': 'hunter',
      'MAGE': 'mage',
      'PRIEST': 'priest',
      'BEASTMASTER': 'beastmaster',
      'THIEF': 'thief',
      'SCOUT': 'scout',
      'GATHERER': 'gatherer',
      'WARRIOR': 'hunter', // Warrior is a hunter subclass
      'TRACKER': 'hunter', // Tracker is a hunter subclass
      'JUGGERNAUT': 'hunter', // Juggernaut is a hunter superclass
      'ELEMENTALIST': 'mage', // Elementalist is a mage subclass
      'HYPNOTIST': 'mage', // Hypnotist is a mage subclass
      'DREAMWALKER': 'mage', // Dreamwalker is a mage subclass
      'DEMENTIA_MASTER': 'mage', // Dementia Master is a mage superclass
      'BOOSTER': 'priest', // Booster is a priest subclass
      'MASTER_HEALER': 'priest', // Master Healer is a priest subclass
      'SAGE': 'priest', // Sage is a priest superclass
      'ESCAPE_ARTIST': 'thief', // Escape Artist is a thief subclass
      'ROGUE': 'thief', // Rogue is a thief subclass
      'TELETHIEF': 'thief', // TeleThief is a thief subclass
      'CONTORTIONIST': 'thief', // Contortionist is a thief subclass
      'ASSASSIN': 'thief', // Assassin is a thief superclass
      'OBSERVER': 'scout', // Observer is a scout subclass
      'TRAPPER': 'scout', // Trapper is a scout subclass
      'HAWK': 'scout', // Hawk is a scout subclass
      'SPY': 'scout', // Spy is a scout superclass
      'RADAR_GATHERER': 'gatherer', // Radar Gatherer is a gatherer subclass
      'HERB_MASTER': 'gatherer', // Herb Master is a gatherer subclass
      'ALCHEMIST': 'gatherer', // Alchemist is a gatherer subclass
      'OMNIGATHERER': 'gatherer', // Omnigatherer is a gatherer superclass
      'DRUID': 'beastmaster', // Druid is a beastmaster subclass
      'SHAPESHIFTER': 'beastmaster', // Shapeshifter is a beastmaster subclass
      'DIRE_WOLF': 'beastmaster', // Dire Wolf is a beastmaster subclass
      'DIRE_BEAR': 'beastmaster', // Dire Bear is a beastmaster subclass
      'JUNGLE_TYRANT': 'beastmaster', // Jungle Tyrant is a beastmaster superclass
    };
    
    // Extract HERO_SPELLS_*, NORMAL_SPELLS_*, and BASIC_TROLL_SPELLS constants
    const spellListRegex = /(?:HERO_SPELLS|NORMAL_SPELLS|BASIC_TROLL_SPELLS)_?([A-Z_]*)\s*=\s*commaList\(([^)]+)\)/g;
    let spellMatch;
    
    while ((spellMatch = spellListRegex.exec(wurstContent)) !== null) {
      const className = spellMatch[1] || ''; // Empty for BASIC_TROLL_SPELLS
      const abilityList = spellMatch[2];
      
      // Handle BASIC_TROLL_SPELLS
      let category;
      if (!className) {
        category = 'basic';
      } else {
        category = classToCategoryMap[className];
      }
      
      if (category) {
        // Parse ability list (comma-separated ABILITY_* constants)
        const abilities = abilityList
          .split(',')
          .map(a => a.trim())
          .filter(a => a && a.startsWith('ABILITY_'))
          .map(a => {
            // Remove ABILITY_ prefix and normalize
            const name = a.replace(/^ABILITY_/, '').toLowerCase().replace(/_/g, '-');
            return name;
          });
        
        // Map each ability to the category
        for (const abilityName of abilities) {
          abilityCategoryMap.set(abilityName, category);
          // Also try with 'ability-' prefix
          abilityCategoryMap.set(`ability-${abilityName}`, category);
        }
      }
    }
    
    console.log(`  Found ${abilityCategoryMap.size} ability-to-category mappings from Wurst source`);
  }
  
  // Step 3: Parse LocalObjectIDs.wurst to get ability constant names
  const localObjectIdsFile = path.join(ROOT_DIR, 'island-troll-tribes', 'wurst', 'assets', 'LocalObjectIDs.wurst');
  if (fs.existsSync(localObjectIdsFile)) {
    const localContent = fs.readFileSync(localObjectIdsFile, 'utf-8');
    // Extract ability constant definitions
    const abilityConstRegex = /public\s+let\s+ABILITY_([A-Z0-9_]+)\s*=/g;
    let constMatch;
    
    while ((constMatch = abilityConstRegex.exec(localContent)) !== null) {
      const abilityConstName = constMatch[1];
      const normalizedName = abilityConstName.toLowerCase().replace(/_/g, '-');
      
      // If we have a category for this ability, map the constant name too
      if (abilityCategoryMap.has(normalizedName)) {
        const category = abilityCategoryMap.get(normalizedName);
        abilityCategoryMap.set(abilityConstName.toLowerCase().replace(/_/g, '-'), category);
        abilityCategoryMap.set(`ability-${normalizedName}`, category);
      }
    }
  }
  
  return {
    generatedAt: new Date().toISOString(),
    source: 'war3map.j + Wurst source files',
    abilityCategoryMap: Object.fromEntries(abilityCategoryMap),
    abilityIdToNameMap: Object.fromEntries(abilityIdToNameMap),
    totalMappings: abilityCategoryMap.size,
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
  
  // Validate loaded data structure
  if (extractedUnits) {
    validateJsonStructure(extractedUnits, ['units'], 'extractedUnits');
    if (extractedUnits.units) {
      validateArrayItems(extractedUnits.units, ['id', 'name'], 'extractedUnits.units');
    }
  }
  
  if (extractedBuildings) {
    validateJsonStructure(extractedBuildings, ['buildings'], 'extractedBuildings');
    if (extractedBuildings.buildings) {
      validateArrayItems(extractedBuildings.buildings, ['id', 'name'], 'extractedBuildings.buildings');
    }
  }
  
  // Extract class descriptions from Wurst source
  console.log('📝 Extracting class descriptions from Wurst source...');
  const classDescriptions = extractClassDescriptions();
  console.log(`✅ Extracted ${Object.keys(classDescriptions).length} class descriptions\n`);
  
  // Extract units metadata
  console.log('👤 Extracting units metadata...');
  const unitsMetadata = extractUnitsMetadata(extractedUnits);
  
  // Add descriptions to units metadata
  if (unitsMetadata.units) {
    for (const unit of unitsMetadata.units) {
      const slug = unit.id || slugify(unit.name || '');
      if (classDescriptions[slug]) {
        unit.description = classDescriptions[slug];
      }
    }
  }
  
  // Also store descriptions separately for reference
  unitsMetadata.classDescriptions = classDescriptions;
  
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
  
  // Extract items metadata from war3map.j
  console.log('📦 Extracting items metadata...');
  const itemsMetadata = extractItemsMetadata();
  writeJson(path.join(OUTPUT_DIR, 'items.json'), itemsMetadata);
  console.log(`✅ Extracted ${itemsMetadata.totalMappings} item ID mappings\n`);
  
  // Extract abilities metadata from war3map.j and Wurst source
  console.log('✨ Extracting abilities metadata...');
  const abilitiesMetadata = extractAbilitiesMetadata();
  writeJson(path.join(OUTPUT_DIR, 'abilities.json'), abilitiesMetadata);
  console.log(`✅ Extracted ${abilitiesMetadata.totalMappings} ability category mappings\n`);
  
  console.log('✅ Metadata extraction complete!');
}

main();

