/**
 * Regenerate iconMap.ts from scratch with proper escaping
 * This script reads all items and abilities and creates a clean iconMap
 */

import fs from 'fs';
import path from 'path';
import { getRootDir, parseJSString, escapeString } from './utils.mjs';

const ROOT_DIR = getRootDir();
const ICONS_DIR = path.join(ROOT_DIR, 'public', 'icons', 'itt');
const ICON_MAP_FILE = path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'data', 'iconMap.ts');

const ITEMS_DIR = path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'data', 'items');
const ABILITIES_DIR = path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'data', 'abilities');
const UNITS_FILE = path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'data', 'units', 'allUnits.ts');

/**
 * Get all PNG files in a flat directory
 * All icons are now in a single flat directory structure
 */
function getAllIconFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    // Skip subdirectories (all icons should be flat now)
    if (entry.isDirectory()) {
      continue;
    }
    
    if (entry.isFile() && entry.name.toLowerCase().endsWith('.png')) {
      files.push({
        filename: entry.name,
        basename: path.basename(entry.name, '.png').toLowerCase(),
        // Category is no longer determined by directory since all icons are flat
        // We'll use 'icons' as a generic category, but matching will search all icons anyway
        category: 'icons'
      });
    }
  }
  
  return files;
}

// parseJSString and escapeString imported from utils.mjs

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
 * Read items from TypeScript files
 */
function readItemsFromTS() {
  const items = [];
  const itemFiles = [
    'armor.ts',
    'weapons.ts',
    'potions.ts',
    'raw-materials.ts',
    'scrolls.ts',
    'buildings.ts',
    'unknown.ts'
  ];
  
  for (const file of itemFiles) {
    const filePath = path.join(ITEMS_DIR, file);
    if (!fs.existsSync(filePath)) continue;
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const arrayMatches = content.matchAll(/export const \w+_ITEMS[^=]*=\s*\[([\s\S]*?)\];/g);
    
    for (const arrayMatch of arrayMatches) {
      const arrayContent = arrayMatch[1];
      const objectMatches = arrayContent.matchAll(/\{([\s\S]*?)\}(?=\s*,|\s*$)/g);
      
      for (const match of objectMatches) {
        const objContent = match[1];
        
        const idMatch = objContent.match(/id:\s*(['"])((?:\\.|(?!\1).)*)\1/);
        if (!idMatch) continue;
        const id = parseJSString(idMatch[0].match(/id:\s*(['"].*?['"])/)[1]);
        
        const nameMatch = objContent.match(/name:\s*(['"])((?:\\.|(?!\1).)*)\1/);
        if (!nameMatch) continue;
        const name = parseJSString(nameMatch[0].match(/name:\s*(['"].*?['"])/)[1]);
        
        const iconMatch = objContent.match(/iconPath:\s*(['"])((?:\\.|(?!\1).)*)\1/);
        const iconPath = iconMatch ? parseJSString(iconMatch[0].match(/iconPath:\s*(['"].*?['"])/)[1]) : null;
        
        items.push({ id, name, iconPath });
      }
    }
  }
  
  return items;
}

/**
 * Read units from TypeScript files
 */
function readUnitsFromTS() {
  const units = [];
  const filePath = UNITS_FILE;
  if (!fs.existsSync(filePath)) return units;
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const arrayMatch = content.match(/export const ALL_UNITS[^=]*=\s*\[([\s\S]*?)\];/);
  if (!arrayMatch) return units;
  
  const arrayContent = arrayMatch[1];
  const objectMatches = arrayContent.matchAll(/\{([\s\S]*?)\}(?=\s*,|\s*$)/g);
  
  for (const match of objectMatches) {
    const objContent = match[1];
    
    const idMatch = objContent.match(/id:\s*(['"])((?:\\.|(?!\1).)*)\1/);
    if (!idMatch) continue;
    const id = parseJSString(idMatch[0].match(/id:\s*(['"].*?['"])/)[1]);
    
    const nameMatch = objContent.match(/name:\s*(['"])((?:\\.|(?!\1).)*)\1/);
    if (!nameMatch) continue;
    const name = parseJSString(nameMatch[0].match(/name:\s*(['"].*?['"])/)[1]);
    
    const iconMatch = objContent.match(/iconPath:\s*(['"])((?:\\.|(?!\1).)*)\1/);
    const iconPath = iconMatch ? parseJSString(iconMatch[0].match(/iconPath:\s*(['"].*?['"])/)[1]) : null;
    
    units.push({ id, name, iconPath });
  }
  
  return units;
}

/**
 * Read abilities from TypeScript files
 */
function readAbilitiesFromTS() {
  const abilities = [];
  const abilityFiles = [
    'basic.ts',
    'beastmaster.ts',
    'gatherer.ts',
    'hunter.ts',
    'mage.ts',
    'priest.ts',
    'scout.ts',
    'thief.ts',
    'item.ts',
    'building.ts',
    'unknown.ts'
  ];
  
  for (const file of abilityFiles) {
    const filePath = path.join(ABILITIES_DIR, file);
    if (!fs.existsSync(filePath)) continue;
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const arrayMatches = content.matchAll(/export const \w+_ABILITIES[^=]*=\s*\[([\s\S]*?)\];/g);
    
    for (const arrayMatch of arrayMatches) {
      const arrayContent = arrayMatch[1];
      const objectMatches = arrayContent.matchAll(/\{([\s\S]*?)\}(?=\s*,|\s*$)/g);
      
      for (const match of objectMatches) {
        const objContent = match[1];
        
        const idMatch = objContent.match(/id:\s*(['"])((?:\\.|(?!\1).)*)\1/);
        if (!idMatch) continue;
        const id = parseJSString(idMatch[0].match(/id:\s*(['"].*?['"])/)[1]);
        
        const nameMatch = objContent.match(/name:\s*(['"])((?:\\.|(?!\1).)*)\1/);
        if (!nameMatch) continue;
        const name = parseJSString(nameMatch[0].match(/name:\s*(['"].*?['"])/)[1]);
        
        const iconMatch = objContent.match(/iconPath:\s*(['"])((?:\\.|(?!\1).)*)\1/);
        const iconPath = iconMatch ? parseJSString(iconMatch[0].match(/iconPath:\s*(['"].*?['"])/)[1]) : null;
        
        abilities.push({ id, name, iconPath });
      }
    }
  }
  
  return abilities;
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
  const allIcons = getAllIconFiles(ICONS_DIR);
  console.log(`   Found ${allIcons.length} total icons\n`);
  
  // Read items and abilities
  console.log('📦 Reading items from TypeScript files...');
  const items = readItemsFromTS();
  console.log(`   Found ${items.length} items\n`);
  
  console.log('✨ Reading abilities from TypeScript files...');
  const abilities = readAbilitiesFromTS();
  console.log(`   Found ${abilities.length} abilities\n`);
  
  console.log('👤 Reading units from TypeScript files...');
  const units = readUnitsFromTS();
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


