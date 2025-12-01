/**
 * Extract ability relationships from Wurst source files
 * 
 * Parses TrollUnitTextConstant.wurst to extract:
 * - Which classes get which abilities (HERO_SPELLS_*, NORMAL_SPELLS_*)
 * - Spellbook contents
 * - Ability inheritance chains
 * 
 * Usage: node scripts/data/extract-ability-relationships.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ROOT_DIR } from '../lib/paths.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TROLL_UNIT_FILE = path.join(ROOT_DIR, 'island-troll-tribes', 'wurst', 'objects', 'units', 'TrollUnitTextConstant.wurst');

/**
 * Normalize ability constant name to slug
 */
function normalizeAbilityName(abilityConst) {
  return abilityConst
    .replace(/^ABILITY_/, '')
    .toLowerCase()
    .replace(/_/g, '-');
}

/**
 * Normalize class name
 */
function normalizeClassName(className) {
  if (!className) return 'basic';
  return className.toLowerCase().replace(/_/g, '-');
}

/**
 * Parse commaList() content
 */
function parseCommaList(content) {
  // Remove outer commaList() wrapper
  const inner = content.replace(/^commaList\s*\(/, '').replace(/\)$/, '');
  
  // Split by comma, handling nested structures
  const items = [];
  let current = '';
  let depth = 0;
  
  for (let i = 0; i < inner.length; i++) {
    const char = inner[i];
    if (char === '(') depth++;
    else if (char === ')') depth--;
    else if (char === ',' && depth === 0) {
      items.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  if (current.trim()) {
    items.push(current.trim());
  }
  
  return items
    .map(item => item.trim())
    .filter(item => item && item.startsWith('ABILITY_'))
    .map(normalizeAbilityName);
}

/**
 * Extract spell lists from file
 */
function extractSpellLists(content) {
  const relationships = {};
  const spellbooks = {};
  
  // Map class names to categories
  const classToCategoryMap = {
    'HUNTER': 'hunter',
    'MAGE': 'mage',
    'PRIEST': 'priest',
    'BEASTMASTER': 'beastmaster',
    'THIEF': 'thief',
    'SCOUT': 'scout',
    'GATHERER': 'gatherer',
    'WARRIOR': 'hunter',
    'TRACKER': 'hunter',
    'JUGGERNAUT': 'hunter',
    'ELEMENTALIST': 'mage',
    'HYPNOTIST': 'mage',
    'DREAMWALKER': 'mage',
    'DEMENTIA_MASTER': 'mage',
    'BOOSTER': 'priest',
    'MASTER_HEALER': 'priest',
    'SAGE': 'priest',
    'ESCAPE_ARTIST': 'thief',
    'ROGUE': 'thief',
    'TELETHIEF': 'thief',
    'CONTORTIONIST': 'thief',
    'ASSASSIN': 'thief',
    'OBSERVER': 'scout',
    'TRAPPER': 'scout',
    'HAWK': 'scout',
    'SPY': 'scout',
    'RADAR_GATHERER': 'gatherer',
    'HERB_MASTER': 'gatherer',
    'ALCHEMIST': 'gatherer',
    'OMNIGATHERER': 'gatherer',
    'DRUID': 'beastmaster',
    'SHAPESHIFTER': 'beastmaster',
    'DIRE_WOLF': 'beastmaster',
    'DIRE_BEAR': 'beastmaster',
    'JUNGLE_TYRANT': 'beastmaster',
  };
  
  // Extract HERO_SPELLS_*, NORMAL_SPELLS_*, and BASIC_TROLL_SPELLS
  const spellListRegex = /(?:HERO_SPELLS|NORMAL_SPELLS|BASIC_TROLL_SPELLS)_?([A-Z_]*)\s*=\s*commaList\(([^)]+)\)/g;
  let match;
  
  while ((match = spellListRegex.exec(content)) !== null) {
    const className = match[1] || ''; // Empty for BASIC_TROLL_SPELLS
    const abilityListStr = match[2];
    const abilities = parseCommaList(`commaList(${abilityListStr})`);
    
    // Determine category
    let category;
    if (!className) {
      category = 'basic';
    } else {
      category = classToCategoryMap[className] || normalizeClassName(className);
    }
    
    const normalizedClass = normalizeClassName(className);
    const spellType = match[0].includes('HERO_SPELLS') ? 'hero' : 
                     match[0].includes('NORMAL_SPELLS') ? 'normal' : 'basic';
    
    // Map each ability to classes
    for (const ability of abilities) {
      if (!relationships[ability]) {
        relationships[ability] = {
          classes: [],
          categories: [],
          spellTypes: [],
        };
      }
      
      if (normalizedClass && !relationships[ability].classes.includes(normalizedClass)) {
        relationships[ability].classes.push(normalizedClass);
      }
      if (category && !relationships[ability].categories.includes(category)) {
        relationships[ability].categories.push(category);
      }
      if (!relationships[ability].spellTypes.includes(spellType)) {
        relationships[ability].spellTypes.push(spellType);
      }
      
      // Track spellbook relationships
      if (ability.includes('spellbook') || ability.includes('inherited')) {
        if (!spellbooks[ability]) {
          spellbooks[ability] = [];
        }
        if (normalizedClass && !spellbooks[ability].includes(normalizedClass)) {
          spellbooks[ability].push(normalizedClass);
        }
      }
    }
  }
  
  // Extract inherited spell lists
  const inheritedRegex = /(?:SUB_|SS_)(\w+)_INHERITED_SPELL\s*=\s*commaList\(([^)]+)\)/g;
  while ((match = inheritedRegex.exec(content)) !== null) {
    const className = match[1];
    const abilityListStr = match[2];
    const abilities = parseCommaList(`commaList(${abilityListStr})`);
    
    const normalizedClass = normalizeClassName(className);
    const category = classToCategoryMap[className] || normalizeClassName(className);
    
    for (const ability of abilities) {
      if (!relationships[ability]) {
        relationships[ability] = {
          classes: [],
          categories: [],
          spellTypes: [],
          inherited: true,
        };
      }
      
      if (normalizedClass && !relationships[ability].classes.includes(normalizedClass)) {
        relationships[ability].classes.push(normalizedClass);
      }
      if (category && !relationships[ability].categories.includes(category)) {
        relationships[ability].categories.push(category);
      }
      relationships[ability].inherited = true;
    }
  }
  
  return { relationships, spellbooks };
}

/**
 * Main extraction function
 */
function main() {
  console.log('🔗 Extracting ability relationships from Wurst source files...\n');
  
  if (!fs.existsSync(TROLL_UNIT_FILE)) {
    console.warn(`⚠️  TrollUnitTextConstant.wurst not found: ${TROLL_UNIT_FILE}`);
    return;
  }
  
  const content = fs.readFileSync(TROLL_UNIT_FILE, 'utf-8');
  const { relationships, spellbooks } = extractSpellLists(content);
  
  console.log(`  ✅ Found relationships for ${Object.keys(relationships).length} abilities`);
  console.log(`  ✅ Found ${Object.keys(spellbooks).length} spellbook relationships\n`);
  
  // Save results
  const outputDir = path.join(ROOT_DIR, 'tmp', 'work-data', 'metadata');
  fs.mkdirSync(outputDir, { recursive: true });
  
  const outputFile = path.join(outputDir, 'ability-relationships.json');
  const output = {
    generatedAt: new Date().toISOString(),
    source: 'TrollUnitTextConstant.wurst',
    totalAbilities: Object.keys(relationships).length,
    relationships,
    spellbooks,
  };
  
  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
  console.log(`✅ Saved to: ${outputFile}`);
}

main();



