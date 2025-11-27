/**
 * Extract category mappings from ts_data backup files
 * 
 * This script reads the backup TypeScript files in ts_data/ and extracts
 * the category mappings (item/ability name -> category) to a JSON file.
 * This allows the master generation script to use these mappings without
 * directly referencing the backup files.
 * 
 * Usage: node scripts/data/extract-category-mappings.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..', '..');
const BACKUP_TS_DATA_DIR = path.join(ROOT_DIR, 'data', 'island_troll_tribes', 'ts_data');
const OUTPUT_FILE = path.join(ROOT_DIR, 'data', 'island_troll_tribes', 'category-mappings.json');

/**
 * Generate slug from name
 */
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
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
 * Extract item category mappings from backup files
 */
function extractItemCategoryMappings() {
  const categoryMap = new Map();
  const backupItemsDir = path.join(BACKUP_TS_DATA_DIR, 'items');
  
  if (!fs.existsSync(backupItemsDir)) {
    console.warn('⚠️  Backup items directory not found');
    return categoryMap;
  }
  
  const categoryFiles = {
    'weapons': 'weapons.ts',
    'armor': 'armor.ts',
    'potions': 'potions.ts',
    'scrolls': 'scrolls.ts',
    'raw-materials': 'raw-materials.ts',
    'buildings': 'buildings.ts',
    // Exclude 'unknown.ts' - we don't want to map items to unknown from backup
  };
  
  for (const [category, fileName] of Object.entries(categoryFiles)) {
    const filePath = path.join(backupItemsDir, fileName);
    if (!fs.existsSync(filePath)) continue;
    
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      
      let currentId = null;
      let currentName = null;
      
      for (const line of lines) {
        // Match id: 'item-id',
        const idMatch = line.match(/id:\s*['"]([^'"]+)['"]/);
        if (idMatch) {
          currentId = idMatch[1];
        }
        
        // Match name: 'Item Name',
        const nameMatch = line.match(/name:\s*['"]([^'"]+)['"]/);
        if (nameMatch) {
          currentName = parseJSString(nameMatch[0].match(/name:\s*(['"].*?['"])/)[1]).trim();
        }
        
        // When we have both ID and name, store the mapping
        if (currentId && currentName) {
          categoryMap.set(currentId, category);
          categoryMap.set(currentName.toLowerCase().trim(), category);
          categoryMap.set(slugify(currentName), category);
          const slugifiedId = slugify(currentId);
          if (slugifiedId !== slugify(currentName)) {
            categoryMap.set(slugifiedId, category);
          }
          // Reset for next item
          currentId = null;
          currentName = null;
        }
      }
    } catch (error) {
      console.warn(`⚠️  Error reading ${fileName}: ${error.message}`);
    }
  }
  
  return categoryMap;
}

/**
 * Extract ability category mappings from backup files
 */
function extractAbilityCategoryMappings() {
  const categoryMap = new Map();
  const backupAbilitiesDir = path.join(BACKUP_TS_DATA_DIR, 'abilities');
  
  if (!fs.existsSync(backupAbilitiesDir)) {
    console.warn('⚠️  Backup abilities directory not found');
    return categoryMap;
  }
  
  const categoryFiles = {
    'basic': 'basic.ts',
    'hunter': 'hunter.ts',
    'beastmaster': 'beastmaster.ts',
    'mage': 'mage.ts',
    'priest': 'priest.ts',
    'thief': 'thief.ts',
    'scout': 'scout.ts',
    'gatherer': 'gatherer.ts',
    'building': 'building.ts',
    // Exclude 'item.ts' and 'unknown.ts' - we don't want to map abilities to these from backup
  };
  
  for (const [category, fileName] of Object.entries(categoryFiles)) {
    const filePath = path.join(backupAbilitiesDir, fileName);
    if (!fs.existsSync(filePath)) continue;
    
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      
      let currentId = null;
      
      for (const line of lines) {
        // Match id: 'ability-id',
        const idMatch = line.match(/id:\s*['"]([^'"]+)['"]/);
        if (idMatch) {
          currentId = idMatch[1];
          if (currentId) {
            categoryMap.set(currentId, category);
            // Also store slugified version
            const slugifiedId = slugify(currentId);
            if (slugifiedId !== currentId) {
              categoryMap.set(slugifiedId, category);
            }
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️  Error reading ${fileName}: ${error.message}`);
    }
  }
  
  return categoryMap;
}

/**
 * Main function
 */
function main() {
  console.log('📚 Extracting category mappings from ts_data backup files...\n');
  
  // Extract mappings
  const itemMappings = extractItemCategoryMappings();
  const abilityMappings = extractAbilityCategoryMappings();
  
  // Convert Maps to plain objects for JSON serialization
  const mappings = {
    items: Object.fromEntries(itemMappings),
    abilities: Object.fromEntries(abilityMappings),
    generatedAt: new Date().toISOString(),
    source: 'ts_data backup files'
  };
  
  // Write to JSON file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(mappings, null, 2), 'utf-8');
  
  console.log(`✅ Extracted ${itemMappings.size} item category mappings`);
  console.log(`✅ Extracted ${abilityMappings.size} ability category mappings`);
  console.log(`\n💾 Saved to: ${path.relative(ROOT_DIR, OUTPUT_FILE)}\n`);
}

main();



