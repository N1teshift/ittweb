/**
 * Regenerate iconMap.ts from scratch with proper escaping
 * This script reads all items and abilities and creates a clean iconMap
 */

import fs from 'fs';
import path from 'path';
import { getRootDir, parseJSString, escapeString, getAllIconFiles, readItemsFromTS, readAbilitiesFromTS, readUnitsFromTS } from '../lib/utils.mjs';
import { ITEMS_TS_DIR, ABILITIES_TS_DIR, UNITS_TS_DIR } from '../lib/paths.mjs';

const ROOT_DIR = getRootDir();
const ICONS_DIR = path.join(ROOT_DIR, 'public', 'icons', 'itt');
const ICON_MAP_FILE = path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'data', 'iconMap.ts');

const UNITS_FILE = path.join(UNITS_TS_DIR, 'allUnits.ts');

/**
 * Normalize string for matching
 */
function normalize(str) {
  return str
    .toLowerCase()
    .replace(/[|]/g, '')
    .replace(/cff[0-9a-fA-F]{6}/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Find icon by exact filename match first, then by name similarity
 */
function findIconForName(name, iconPath, allIcons) {
  // If iconPath is provided, try to find exact match
  if (iconPath) {
    const iconFilename = path.basename(iconPath);
    const exactMatch = allIcons.find(icon => 
      icon.filename.toLowerCase() === iconFilename.toLowerCase()
    );
    if (exactMatch) return exactMatch.filename;
  }
  
  // Try to find by name similarity
  const normalizedName = normalize(name);
  const keywords = normalizedName.split(/\s+/).filter(w => w.length > 2);
  
  let bestMatch = null;
  let bestScore = 0;
  
  for (const icon of allIcons) {
    const iconBase = icon.basename;
    let score = 0;
    
    if (iconBase === normalizedName) {
      return icon.filename; // Exact match
    }
    
    // Count matching keywords
    for (const keyword of keywords) {
      if (iconBase.includes(keyword)) {
        score += keyword.length;
      }
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = icon;
    }
  }
  
  return bestScore > 5 ? bestMatch.filename : null;
}


/**
 * Generate iconMap.ts content
 */
function generateIconMap(items, abilities, units, allIcons) {
  // Since all icons are now in a flat directory, we search all icons for matches
  // The category filtering is no longer needed, but we keep the logic for clarity
  
  // Build item mappings
  const itemMappings = {};
  for (const item of items) {
    const icon = findIconForName(item.name, item.iconPath, allIcons);
    if (icon) {
      itemMappings[item.name] = icon;
    }
  }
  
  // Build ability mappings
  const abilityMappings = {};
  for (const ability of abilities) {
    const icon = findIconForName(ability.name, ability.iconPath, allIcons);
    if (icon) {
      abilityMappings[ability.name] = icon;
    }
  }
  
  // Build unit mappings
  const unitMappings = {};
  for (const unit of units) {
    const icon = findIconForName(unit.name, unit.iconPath, allIcons);
    if (icon) {
      unitMappings[unit.name] = icon;
    }
  }
  
  // Generate TypeScript content
  const itemsEntries = Object.entries(itemMappings)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `    '${escapeString(key)}': '${value}'`)
    .join(',\n');
  
  const abilitiesEntries = Object.entries(abilityMappings)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `    '${escapeString(key)}': '${value}'`)
    .join(',\n');
  
  const unitsEntries = Object.entries(unitMappings)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `    '${escapeString(key)}': '${value}'`)
    .join(',\n');
  
  return `import { ITTIconCategory } from '../utils/iconUtils';

export type IconMap = {
  abilities: Record<string, string>;
  items: Record<string, string>;
  buildings: Record<string, string>;
  trolls: Record<string, string>;
  units: Record<string, string>;
};

// Central, explicit mapping (display name/id -> icon filename without path, with extension)
// This file is generated - do not edit manually
export const ICON_MAP: IconMap = {
  abilities: {
${abilitiesEntries || '    // No mappings yet'}
  },
  items: {
${itemsEntries || '    // No mappings yet'}
  },
  buildings: {},
  trolls: {},
  units: {
${unitsEntries || '    // No mappings yet'}
  },
};

`;
}

function main() {
  console.log('🔄 Regenerating iconMap.ts from scratch...\n');
  
  // Get all icon files
  console.log('📁 Scanning icon directories...');
  const allIcons = getAllIconFiles(ICONS_DIR, 'array');
  console.log(`   Found ${allIcons.length} total icons\n`);
  
  // Read items and abilities
  console.log('📦 Reading items from TypeScript files...');
  const items = readItemsFromTS(ITEMS_TS_DIR);
  console.log(`   Found ${items.length} items\n`);
  
  console.log('✨ Reading abilities from TypeScript files...');
  const abilities = readAbilitiesFromTS(ABILITIES_TS_DIR);
  console.log(`   Found ${abilities.length} abilities\n`);
  
  console.log('👤 Reading units from TypeScript files...');
  const units = readUnitsFromTS(UNITS_FILE);
  console.log(`   Found ${units.length} units\n`);
  
  // Generate iconMap
  console.log('🔗 Generating icon mappings...');
  const iconMapContent = generateIconMap(items, abilities, units, allIcons);
  
  // Write to file
  console.log('💾 Writing iconMap.ts...');
  fs.writeFileSync(ICON_MAP_FILE, iconMapContent);
  
  // Count mappings
  const itemsMatch = iconMapContent.match(/items: \{[\s\S]*?\}/);
  const abilitiesMatch = iconMapContent.match(/abilities: \{[\s\S]*?\}/);
  const unitsMatch = iconMapContent.match(/units: \{[\s\S]*?\}/);
  
  const itemsCount = itemsMatch ? (itemsMatch[0].match(/'[^']+': '[^']+'/g) || []).length : 0;
  const abilityCount = abilitiesMatch ? (abilitiesMatch[0].match(/'[^']+': '[^']+'/g) || []).length : 0;
  const unitsCount = unitsMatch ? (unitsMatch[0].match(/'[^']+': '[^']+'/g) || []).length : 0;
  
  console.log(`✅ Generated iconMap.ts`);
  console.log(`\n📊 Summary:`);
  console.log(`   Items mapped: ${itemsCount}`);
  console.log(`   Abilities mapped: ${abilityCount}`);
  console.log(`   Units mapped: ${unitsCount}`);
}

main();


