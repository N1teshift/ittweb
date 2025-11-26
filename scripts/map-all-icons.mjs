/**
 * Map ALL items and abilities to icons by intelligent name matching
 * 
 * This script:
 * 1. Reads all items and abilities from TypeScript files
 * 2. For items/abilities without iconPath, tries to find matching icons by name
 * 3. Updates iconMap.ts with new mappings
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
 * Normalize string for matching
 */
function normalize(str) {
  return str
    .toLowerCase()
    .replace(/[|]/g, '')
    .replace(/cff[0-9a-fA-F]{6}/gi, '') // Remove color codes
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Extract keywords from name
 */
function extractKeywords(name) {
  const normalized = normalize(name);
  // Split on common separators
  const words = normalized
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/[\s\-_]+/)
    .filter(w => w.length > 2);
  return words;
}

/**
 * Find best matching icon by name similarity
 */
function findBestIconMatch(name, icons) {
  const normalizedName = normalize(name);
  const keywords = extractKeywords(name);
  
  if (keywords.length === 0) return null;
  
  let bestMatch = null;
  let bestScore = 0;
  
  for (const icon of icons) {
    const iconBase = icon.basename;
    let score = 0;
    
    // Exact match gets highest score
    if (iconBase === normalizedName) {
      return icon;
    }
    
    // Check if all keywords are in icon name
    let allKeywordsMatch = true;
    let keywordScore = 0;
    for (const keyword of keywords) {
      if (iconBase.includes(keyword)) {
        keywordScore += keyword.length;
      } else {
        allKeywordsMatch = false;
      }
    }
    
    if (allKeywordsMatch && keywords.length > 0) {
      score = keywordScore * 10; // High score for all keywords matching
    } else {
      // Partial match - count matching keywords
      for (const keyword of keywords) {
        if (iconBase.includes(keyword) || keyword.includes(iconBase)) {
          score += keyword.length;
        }
      }
    }
    
    // Bonus for longer matches
    if (iconBase.includes(normalizedName) || normalizedName.includes(iconBase)) {
      score += 50;
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = icon;
    }
  }
  
  // Only return if score is meaningful
  return bestScore > 5 ? bestMatch : null;
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
      const itemMatches = arrayContent.matchAll(/\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)'([\s\S]*?)\},?\s*(?=\{|$)/g);
      
      for (const match of itemMatches) {
        const itemContent = match[0];
        const iconMatch = itemContent.match(/iconPath:\s*'([^']+)'/);
        const iconPath = iconMatch ? iconMatch[1] : null;
        
        items.push({
          id: match[1],
          name: match[2].replace(/\\'/g, "'"), // Unescape quotes
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
    const arrayMatches = content.matchAll(/export const \w+_ABILITIES[^=]*=\s*\[([\s\S]*?)\];/g);
    
    for (const arrayMatch of arrayMatches) {
      const arrayContent = arrayMatch[1];
      const abilityMatches = arrayContent.matchAll(/\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)'([\s\S]*?)\},?\s*(?=\{|$)/g);
      
      for (const match of abilityMatches) {
        const abilityContent = match[0];
        const iconMatch = abilityContent.match(/iconPath:\s*'([^']+)'/);
        const iconPath = iconMatch ? iconMatch[1] : null;
        
        abilities.push({
          id: match[1],
          name: match[2].replace(/\\'/g, "'"), // Unescape quotes
          iconPath: iconPath
        });
      }
    }
  }
  
  return abilities;
}

/**
 * Read existing iconMap to avoid duplicates
 */
function readExistingIconMap() {
  const content = fs.readFileSync(ICON_MAP_FILE, 'utf-8');
  const itemsMatch = content.match(/items:\s*\{([\s\S]*?)\},/);
  const abilitiesMatch = content.match(/abilities:\s*\{([\s\S]*?)\},/);
  
  const existingItems = new Set();
  const existingAbilities = new Set();
  
  if (itemsMatch) {
    const itemsContent = itemsMatch[1];
    const itemEntries = itemsContent.matchAll(/'([^']+)':\s*'([^']+)'/g);
    for (const match of itemEntries) {
      existingItems.add(match[1]);
    }
  }
  
  if (abilitiesMatch) {
    const abilitiesContent = abilitiesMatch[1];
    const abilityEntries = abilitiesContent.matchAll(/'([^']+)':\s*'([^']+)'/g);
    for (const match of abilityEntries) {
      existingAbilities.add(match[1]);
    }
  }
  
  return { existingItems, existingAbilities };
}

/**
 * Update iconMap.ts with new mappings
 */
function updateIconMap(newItemMappings, newAbilityMappings) {
  let content = fs.readFileSync(ICON_MAP_FILE, 'utf-8');
  
  // Find the items and abilities sections
  const itemsMatch = content.match(/(items:\s*\{)([\s\S]*?)(\},)/);
  const abilitiesMatch = content.match(/(abilities:\s*\{)([\s\S]*?)(\},)/);
  
  if (!itemsMatch || !abilitiesMatch) {
    console.error('Could not find items or abilities sections in iconMap.ts');
    return;
  }
  
  // Build new content - properly escape single quotes
  const itemsEntries = Object.entries(newItemMappings)
    .map(([key, value]) => `    '${key.replace(/'/g, "\\'")}': '${value}'`)
    .join(',\n');
  
  const abilitiesEntries = Object.entries(newAbilityMappings)
    .map(([key, value]) => `    '${key.replace(/'/g, "\\'")}': '${value}'`)
    .join(',\n');
  
  // Update items section
  const itemsContent = itemsMatch[2].trim();
  const newItemsContent = itemsContent 
    ? `${itemsContent},\n${itemsEntries}`
    : itemsEntries;
  content = content.replace(itemsMatch[0], `${itemsMatch[1]}\n${newItemsContent}\n${itemsMatch[3]}`);
  
  // Update abilities section
  const abilitiesContent = abilitiesMatch[2].trim();
  const newAbilitiesContent = abilitiesContent
    ? `${abilitiesContent},\n${abilitiesEntries}`
    : abilitiesEntries;
  content = content.replace(abilitiesMatch[0], `${abilitiesMatch[1]}\n${newAbilitiesContent}\n${abilitiesMatch[3]}`);
  
  fs.writeFileSync(ICON_MAP_FILE, content);
  console.log(`✅ Updated ${ICON_MAP_FILE}`);
}

function main() {
  console.log('🔍 Mapping ALL items and abilities to icons...\n');
  
  // Get all icon files
  console.log('📁 Scanning icon directories...');
  const allIcons = getAllIconFiles(ICONS_DIR);
  const itemIcons = allIcons.filter(icon => icon.category === 'items');
  const abilityIcons = allIcons.filter(icon => icon.category === 'abilities');
  console.log(`   Found ${allIcons.length} total icons (${itemIcons.length} items, ${abilityIcons.length} abilities)\n`);
  
  // Read items and abilities
  console.log('📦 Reading items from TypeScript files...');
  const items = readItemsFromTS();
  console.log(`   Found ${items.length} items\n`);
  
  console.log('✨ Reading abilities from TypeScript files...');
  const abilities = readAbilitiesFromTS();
  console.log(`   Found ${abilities.length} abilities\n`);
  
  // Read existing mappings
  const { existingItems, existingAbilities } = readExistingIconMap();
  console.log(`   Existing mappings: ${existingItems.size} items, ${existingAbilities.size} abilities\n`);
  
  // Find items without icons
  const itemsWithoutIcons = items.filter(item => !item.iconPath && !existingItems.has(item.name));
  const abilitiesWithoutIcons = abilities.filter(ability => !ability.iconPath && !existingAbilities.has(ability.name));
  
  console.log(`🔗 Finding icon matches...`);
  console.log(`   Items needing icons: ${itemsWithoutIcons.length}`);
  console.log(`   Abilities needing icons: ${abilitiesWithoutIcons.length}\n`);
  
  // Map items
  const newItemMappings = {};
  let itemsMatched = 0;
  
  for (const item of itemsWithoutIcons) {
    // Try items directory first, then all icons
    const match = findBestIconMatch(item.name, itemIcons) || findBestIconMatch(item.name, allIcons);
    if (match) {
      newItemMappings[item.name] = match.filename;
      itemsMatched++;
    }
  }
  
  // Map abilities
  const newAbilityMappings = {};
  let abilitiesMatched = 0;
  
  for (const ability of abilitiesWithoutIcons) {
    // Try abilities directory first, then all icons
    const match = findBestIconMatch(ability.name, abilityIcons) || findBestIconMatch(ability.name, allIcons);
    if (match) {
      newAbilityMappings[ability.name] = match.filename;
      abilitiesMatched++;
    }
  }
  
  console.log(`✅ Found ${itemsMatched} new item mappings`);
  console.log(`✅ Found ${abilitiesMatched} new ability mappings\n`);
  
  if (Object.keys(newItemMappings).length > 0 || Object.keys(newAbilityMappings).length > 0) {
    // Show sample mappings
    if (Object.keys(newItemMappings).length > 0) {
      console.log('Sample item mappings:');
      Object.entries(newItemMappings).slice(0, 10).forEach(([name, icon]) => {
        console.log(`   ${name} -> ${icon}`);
      });
      if (Object.keys(newItemMappings).length > 10) {
        console.log(`   ... and ${Object.keys(newItemMappings).length - 10} more`);
      }
      console.log();
    }
    
    if (Object.keys(newAbilityMappings).length > 0) {
      console.log('Sample ability mappings:');
      Object.entries(newAbilityMappings).slice(0, 10).forEach(([name, icon]) => {
        console.log(`   ${name} -> ${icon}`);
      });
      if (Object.keys(newAbilityMappings).length > 10) {
        console.log(`   ... and ${Object.keys(newAbilityMappings).length - 10} more`);
      }
      console.log();
    }
    
    // Update iconMap.ts
    console.log('💾 Updating iconMap.ts...');
    updateIconMap(newItemMappings, newAbilityMappings);
  } else {
    console.log('No new mappings to add.');
  }
  
  console.log('\n✅ Icon mapping complete!');
  console.log(`\n📊 Summary:`);
  console.log(`   Items mapped: ${itemsMatched} new mappings`);
  console.log(`   Abilities mapped: ${abilitiesMatched} new mappings`);
  console.log(`   Items still needing icons: ${itemsWithoutIcons.length - itemsMatched}`);
  console.log(`   Abilities still needing icons: ${abilitiesWithoutIcons.length - abilitiesMatched}`);
}

main();

