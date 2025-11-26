/**
 * Map extracted icon paths to actual icon files in public/icons/itt
 * 
 * This script:
 * 1. Reads all items and abilities from TypeScript files
 * 2. Checks if their iconPath files exist in public/icons/itt
 * 3. Updates iconMap.ts with the mappings
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..', '..');
const ICONS_DIR = path.join(ROOT_DIR, 'public', 'icons', 'itt');
const ICON_MAP_FILE = path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'utils', 'iconMap.ts');

// TypeScript data directories
const ITEMS_DIR = path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'data', 'items');
const ABILITIES_DIR = path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'data', 'abilities');

/**
 * Get all PNG files in a directory recursively
 */
function getAllIconFiles(dir, baseDir = dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllIconFiles(fullPath, baseDir));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.png')) {
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      files.push({
        filename: entry.name,
        path: relativePath,
        fullPath: fullPath,
        category: path.relative(ICONS_DIR, dir).split(path.sep)[0] || 'items'
      });
    }
  }
  
  return files;
}

/**
 * Find icon file by filename (case-insensitive)
 */
function findIconFile(iconFilename, allIcons) {
  if (!iconFilename) return null;
  
  // Remove path if present, just get filename
  const filename = path.basename(iconFilename);
  const filenameLower = filename.toLowerCase();
  
  // Try exact match first
  let found = allIcons.find(icon => icon.filename.toLowerCase() === filenameLower);
  if (found) return found;
  
  // Try without extension
  const nameWithoutExt = filenameLower.replace(/\.png$/i, '');
  found = allIcons.find(icon => {
    const iconName = icon.filename.toLowerCase().replace(/\.png$/i, '');
    return iconName === nameWithoutExt;
  });
  if (found) return found;
  
  return null;
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
    // Extract item arrays - handle multiline arrays
    const arrayMatches = content.matchAll(/export const \w+_ITEMS[^=]*=\s*\[([\s\S]*?)\];/g);
    
    for (const arrayMatch of arrayMatches) {
      const arrayContent = arrayMatch[1];
      // Parse items - handle multiline objects
      const itemMatches = arrayContent.matchAll(/\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)'([\s\S]*?)\},?\s*(?=\{|$)/g);
      
      for (const match of itemMatches) {
        const itemContent = match[0];
        const iconMatch = itemContent.match(/iconPath:\s*'([^']+)'/);
        const iconPath = iconMatch ? iconMatch[1] : null;
        
        items.push({
          id: match[1],
          name: match[2],
          iconPath: iconPath
        });
      }
    }
  }
  
  return items;
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
    // Extract ability arrays - handle multiline arrays
    const arrayMatches = content.matchAll(/export const \w+_ABILITIES[^=]*=\s*\[([\s\S]*?)\];/g);
    
    for (const arrayMatch of arrayMatches) {
      const arrayContent = arrayMatch[1];
      // Parse abilities - handle multiline objects
      const abilityMatches = arrayContent.matchAll(/\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)'([\s\S]*?)\},?\s*(?=\{|$)/g);
      
      for (const match of abilityMatches) {
        const abilityContent = match[0];
        const iconMatch = abilityContent.match(/iconPath:\s*'([^']+)'/);
        const iconPath = iconMatch ? iconMatch[1] : null;
        
        abilities.push({
          id: match[1],
          name: match[2],
          iconPath: iconPath
        });
      }
    }
  }
  
  return abilities;
}

/**
 * Update iconMap.ts with mappings
 */
function updateIconMap(itemMappings, abilityMappings) {
  let content = fs.readFileSync(ICON_MAP_FILE, 'utf-8');
  
  // Find the ICON_MAP object - look for the opening brace after the declaration
  const mapStartMatch = content.match(/export const ICON_MAP: IconMap = \{/);
  if (!mapStartMatch) {
    console.error('Could not find ICON_MAP declaration in iconMap.ts');
    return;
  }
  
  const mapStart = mapStartMatch.index;
  // Find the matching closing brace (account for nested braces)
  let braceCount = 0;
  let mapEnd = mapStart;
  let inString = false;
  let stringChar = null;
  
  for (let i = mapStart; i < content.length; i++) {
    const char = content[i];
    const prevChar = i > 0 ? content[i - 1] : '';
    
    // Handle string literals
    if (!inString && (char === '"' || char === "'" || char === '`')) {
      inString = true;
      stringChar = char;
    } else if (inString && char === stringChar && prevChar !== '\\') {
      inString = false;
      stringChar = null;
    }
    
    if (!inString) {
      if (char === '{') braceCount++;
      if (char === '}') {
        braceCount--;
        if (braceCount === 0) {
          mapEnd = i;
          break;
        }
      }
    }
  }
  
  if (mapEnd === mapStart) {
    console.error('Could not find end of ICON_MAP object');
    return;
  }
  
  // Build new mappings
  const itemsMap = {};
  const abilitiesMap = {};
  
  for (const mapping of itemMappings) {
    if (mapping.found) {
      itemsMap[mapping.item.name] = mapping.iconFile.filename;
    }
  }
  
  for (const mapping of abilityMappings) {
    if (mapping.found) {
      abilitiesMap[mapping.ability.name] = mapping.iconFile.filename;
    }
  }
  
  // Format the mappings
  const itemsEntries = Object.entries(itemsMap).map(([key, value]) => `    '${key}': '${value}'`).join(',\n');
  const abilitiesEntries = Object.entries(abilitiesMap).map(([key, value]) => `    '${key}': '${value}'`).join(',\n');
  
  const newMapContent = `export const ICON_MAP: IconMap = {
  abilities: {
${abilitiesEntries || '    // No mappings yet'}
  },
  items: {
${itemsEntries || '    // No mappings yet'}
  },
  buildings: {},
  trolls: {},
};`;
  
  content = content.substring(0, mapStart) + newMapContent + content.substring(mapEnd + 1);
  
  fs.writeFileSync(ICON_MAP_FILE, content);
  console.log(`✅ Updated ${ICON_MAP_FILE}`);
}

function main() {
  console.log('🔍 Mapping extracted icons to icon files...\n');
  
  // Get all icon files
  console.log('📁 Scanning icon directories...');
  const allIcons = getAllIconFiles(ICONS_DIR);
  console.log(`   Found ${allIcons.length} icon files\n`);
  
  // Read items and abilities
  console.log('📦 Reading items from TypeScript files...');
  const items = readItemsFromTS();
  console.log(`   Found ${items.length} items\n`);
  
  console.log('✨ Reading abilities from TypeScript files...');
  const abilities = readAbilitiesFromTS();
  console.log(`   Found ${abilities.length} abilities\n`);
  
  // Map items
  console.log('🔗 Mapping items to icons...');
  const itemMappings = items.map(item => {
    const iconFile = item.iconPath ? findIconFile(item.iconPath, allIcons) : null;
    return {
      item,
      iconFile,
      found: !!iconFile
    };
  });
  
  const itemsFound = itemMappings.filter(m => m.found).length;
  const itemsNotFound = itemMappings.filter(m => !m.found && m.item.iconPath);
  console.log(`   ✅ Mapped ${itemsFound} items`);
  if (itemsNotFound.length > 0) {
    console.log(`   ⚠️  ${itemsNotFound.length} items with icons not found:`);
    itemsNotFound.slice(0, 10).forEach(m => {
      console.log(`      - ${m.item.name}: ${m.item.iconPath}`);
    });
    if (itemsNotFound.length > 10) {
      console.log(`      ... and ${itemsNotFound.length - 10} more`);
    }
  }
  console.log();
  
  // Map abilities
  console.log('🔗 Mapping abilities to icons...');
  const abilityMappings = abilities.map(ability => {
    const iconFile = ability.iconPath ? findIconFile(ability.iconPath, allIcons) : null;
    return {
      ability,
      iconFile,
      found: !!iconFile
    };
  });
  
  const abilitiesFound = abilityMappings.filter(m => m.found).length;
  const abilitiesNotFound = abilityMappings.filter(m => !m.found && m.ability.iconPath);
  console.log(`   ✅ Mapped ${abilitiesFound} abilities`);
  if (abilitiesNotFound.length > 0) {
    console.log(`   ⚠️  ${abilitiesNotFound.length} abilities with icons not found:`);
    abilitiesNotFound.slice(0, 10).forEach(m => {
      console.log(`      - ${m.ability.name}: ${m.ability.iconPath}`);
    });
    if (abilitiesNotFound.length > 10) {
      console.log(`      ... and ${abilitiesNotFound.length - 10} more`);
    }
  }
  console.log();
  
  // Update iconMap.ts
  console.log('💾 Updating iconMap.ts...');
  updateIconMap(itemMappings, abilityMappings);
  
  console.log('\n✅ Icon mapping complete!');
  console.log(`\n📊 Summary:`);
  console.log(`   Items mapped: ${itemsFound} / ${items.length}`);
  console.log(`   Abilities mapped: ${abilitiesFound} / ${abilities.length}`);
}

main();

