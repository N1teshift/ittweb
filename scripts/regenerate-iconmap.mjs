/**
 * Regenerate iconMap.ts from scratch with proper escaping
 * This script reads all items and abilities and creates a clean iconMap
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');
const ICONS_DIR = path.join(ROOT_DIR, 'public', 'icons', 'itt');
const ICON_MAP_FILE = path.join(ROOT_DIR, 'src', 'features', 'ittweb', 'guides', 'utils', 'iconMap.ts');

const ITEMS_DIR = path.join(ROOT_DIR, 'src', 'features', 'ittweb', 'guides', 'data', 'items');
const ABILITIES_DIR = path.join(ROOT_DIR, 'src', 'features', 'ittweb', 'guides', 'data', 'abilities');

/**
 * Get all PNG files in a directory
 */
function getAllIconFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllIconFiles(fullPath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.png')) {
      files.push({
        filename: entry.name,
        basename: path.basename(entry.name, '.png').toLowerCase(),
        category: path.relative(ICONS_DIR, dir).split(path.sep)[0] || 'items'
      });
    }
  }
  
  return files;
}

/**
 * Parse JavaScript string literal (handles escaped quotes)
 */
function parseJSString(str) {
  // Remove surrounding quotes
  if ((str.startsWith("'") && str.endsWith("'")) || (str.startsWith('"') && str.endsWith('"'))) {
    str = str.slice(1, -1);
  }
  // Unescape escaped quotes and backslashes
  return str.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\');
}

/**
 * Escape string for use in JavaScript/TypeScript single-quoted string
 */
function escapeForJS(str) {
  // Escape backslashes first, then single quotes
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

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
function generateIconMap(items, abilities, allIcons) {
  const itemIcons = allIcons.filter(icon => icon.category === 'items');
  const abilityIcons = allIcons.filter(icon => icon.category === 'abilities');
  
  // Build item mappings
  const itemMappings = {};
  for (const item of items) {
    const icon = findIconForName(item.name, item.iconPath, itemIcons) || 
                 findIconForName(item.name, item.iconPath, allIcons);
    if (icon) {
      itemMappings[item.name] = icon;
    }
  }
  
  // Build ability mappings
  const abilityMappings = {};
  for (const ability of abilities) {
    const icon = findIconForName(ability.name, ability.iconPath, abilityIcons) || 
                 findIconForName(ability.name, ability.iconPath, allIcons);
    if (icon) {
      abilityMappings[ability.name] = icon;
    }
  }
  
  // Generate TypeScript content
  const itemsEntries = Object.entries(itemMappings)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `    '${escapeForJS(key)}': '${value}'`)
    .join(',\n');
  
  const abilitiesEntries = Object.entries(abilityMappings)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `    '${escapeForJS(key)}': '${value}'`)
    .join(',\n');
  
  return `import { ITTIconCategory } from './iconUtils';

export type IconMap = {
  abilities: Record<string, string>;
  items: Record<string, string>;
  buildings: Record<string, string>;
  trolls: Record<string, string>;
};

// Central, explicit mapping (display name/id -> icon filename without path, with extension)
export const ICON_MAP: IconMap = {
  abilities: {
${abilitiesEntries || '    // No mappings yet'}
  },
  items: {
${itemsEntries || '    // No mappings yet'}
  },
  buildings: {},
  trolls: {},
};

export function resolveExplicitIcon(category: ITTIconCategory, key: string): string | undefined {
  // First, check the requested category
  const table = ICON_MAP[category];
  const filename = table[key];
  
  if (!filename) {
    // If not found in requested category, search all categories
    const allCategories: ITTIconCategory[] = ['abilities', 'items', 'buildings', 'trolls'];
    for (const cat of allCategories) {
      const catTable = ICON_MAP[cat];
      const foundFilename = catTable[key];
      if (foundFilename) {
        // Found the mapping, now determine which directory the file is in
        return findIconPath(foundFilename);
      }
    }
    return undefined;
  }
  
  // Found in requested category, determine which directory the file is actually in
  return findIconPath(filename);
}

/**
 * Finds the actual directory path for an icon filename.
 * Since icons can be shared across categories, we check which category
 * has this filename mapped and prefer items directory for shared icons.
 */
function findIconPath(filename: string): string {
  const allCategories: ITTIconCategory[] = ['items', 'abilities', 'buildings', 'trolls'];
  
  // Check each category to see if this filename is mapped there
  // Priority: items first (most shared icons are there), then others
  for (const cat of allCategories) {
    const catTable = ICON_MAP[cat];
    if (Object.values(catTable).includes(filename)) {
      return \`/icons/itt/\${cat}/\${filename}\`;
    }
  }
  
  // Fallback: if somehow not found, try items directory (most common)
  return \`/icons/itt/items/\${filename}\`;
}


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
  
  // Generate iconMap
  console.log('🔗 Generating icon mappings...');
  const iconMapContent = generateIconMap(items, abilities, allIcons);
  
  // Write to file
  console.log('💾 Writing iconMap.ts...');
  fs.writeFileSync(ICON_MAP_FILE, iconMapContent);
  
  // Count mappings
  const itemCount = (iconMapContent.match(/'[^']+': '[^']+'/g) || []).length;
  const abilityCount = (iconMapContent.match(/abilities: \{[\s\S]*?\}/)[0].match(/'[^']+': '[^']+'/g) || []).length;
  const itemsCount = (iconMapContent.match(/items: \{[\s\S]*?\}/)[0].match(/'[^']+': '[^']+'/g) || []).length;
  
  console.log(`✅ Generated iconMap.ts`);
  console.log(`\n📊 Summary:`);
  console.log(`   Items mapped: ${itemsCount}`);
  console.log(`   Abilities mapped: ${abilityCount}`);
}

main();


