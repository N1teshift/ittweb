/**
 * Migrate existing iconPath/iconSrc values to ICON_MAP
 * 
 * This script:
 * 1. Reads all items, abilities, units, and classes
 * 2. Finds entities with iconPath/iconSrc in their data
 * 3. Verifies the icon files exist
 * 4. Adds mappings to ICON_MAP
 * 5. Optionally removes iconPath/iconSrc from data files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..', '..');

// Paths
const ICONS_DIR = path.join(ROOT_DIR, 'public', 'icons', 'itt');
const ICON_MAP_FILE = path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'utils', 'iconMap.ts');
const ITEMS_DIR = path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'data', 'items');
const ABILITIES_DIR = path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'data', 'abilities');
const UNITS_FILE = path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'data', 'units', 'allUnits.ts');
const CLASSES_FILE = path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'data', 'units', 'classes.ts');
const DERIVED_CLASSES_FILE = path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'data', 'units', 'derivedClasses.ts');

/**
 * Get all icon files
 */
function getAllIconFiles() {
  const icons = new Map();
  const categories = ['abilities', 'items', 'buildings', 'trolls', 'units', 'base', 'unclassified'];
  
  for (const category of categories) {
    const categoryDir = path.join(ICONS_DIR, category);
    if (fs.existsSync(categoryDir)) {
      const files = fs.readdirSync(categoryDir);
      for (const file of files) {
        if (file.endsWith('.png')) {
          icons.set(file.toLowerCase(), { category, filename: file });
        }
      }
      
      // Check subdirectories
      const subdirs = fs.readdirSync(categoryDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      for (const subdir of subdirs) {
        const subdirPath = path.join(categoryDir, subdir);
        const subFiles = fs.readdirSync(subdirPath);
        for (const file of subFiles) {
          if (file.endsWith('.png')) {
            icons.set(file.toLowerCase(), { category, filename: file });
          }
        }
      }
    }
  }
  
  return icons;
}

/**
 * Find icon file by path
 */
function findIconFile(iconPath, allIcons) {
  if (!iconPath) return null;
  
  // Extract just the filename
  const filename = path.basename(iconPath);
  const lowerFilename = filename.toLowerCase();
  
  // Direct match
  if (allIcons.has(lowerFilename)) {
    return allIcons.get(lowerFilename);
  }
  
  // Try without extension
  const nameWithoutExt = path.parse(filename).name;
  for (const [key, value] of allIcons.entries()) {
    if (key.startsWith(nameWithoutExt.toLowerCase())) {
      return value;
    }
  }
  
  return null;
}

/**
 * Read items from TypeScript files
 */
function readItemsFromTS() {
  const items = [];
  const itemFiles = [
    'armor.ts', 'weapons.ts', 'potions.ts', 'raw-materials.ts',
    'scrolls.ts', 'buildings.ts', 'unknown.ts'
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
        
        if (iconPath) {
          items.push({
            id: match[1],
            name: match[2],
            iconPath: iconPath,
            file: file
          });
        }
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
    'basic.ts', 'beastmaster.ts', 'gatherer.ts', 'hunter.ts',
    'item.ts', 'mage.ts', 'priest.ts', 'scout.ts', 'thief.ts', 'unknown.ts'
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
        
        if (iconPath) {
          abilities.push({
            id: match[1],
            name: match[2],
            iconPath: iconPath,
            file: file
          });
        }
      }
    }
  }
  
  return abilities;
}

/**
 * Read units from TypeScript file
 */
function readUnitsFromTS() {
  const content = fs.readFileSync(UNITS_FILE, 'utf-8');
  const match = content.match(/export const ALL_UNITS[^=]*=\s*\[([\s\S]*?)\];/);
  if (!match) return [];
  
  const units = [];
  const unitMatches = match[1].matchAll(/\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)'([\s\S]*?)\},?\s*(?=\{|$)/g);
  
  for (const match of unitMatches) {
    const unitContent = match[0];
    const iconMatch = unitContent.match(/iconPath:\s*'([^']+)'/);
    const iconPath = iconMatch ? iconMatch[1] : null;
    
    if (iconPath) {
      units.push({
        id: match[1],
        name: match[2],
        iconPath: iconPath
      });
    }
  }
  
  return units;
}

/**
 * Read classes from TypeScript file
 */
function readClassesFromTS() {
  const content = fs.readFileSync(CLASSES_FILE, 'utf-8');
  const match = content.match(/export const BASE_TROLL_CLASSES[^=]*=\s*\[([\s\S]*?)\];/);
  if (!match) return [];
  
  const classes = [];
  const classMatches = match[1].matchAll(/\{\s*slug:\s*'([^']+)',\s*name:\s*'([^']+)'([\s\S]*?)\},?\s*(?=\{|$)/g);
  
  for (const match of classMatches) {
    const classContent = match[0];
    const iconMatch = classContent.match(/iconSrc:\s*'([^']+)'/);
    const iconSrc = iconMatch ? iconMatch[1] : null;
    
    if (iconSrc) {
      classes.push({
        slug: match[1],
        name: match[2],
        iconSrc: iconSrc
      });
    }
  }
  
  return classes;
}

/**
 * Read derived classes from TypeScript file
 */
function readDerivedClassesFromTS() {
  const content = fs.readFileSync(DERIVED_CLASSES_FILE, 'utf-8');
  const match = content.match(/export const DERIVED_CLASSES[^=]*=\s*\[([\s\S]*?)\];/);
  if (!match) return [];
  
  const classes = [];
  const classMatches = match[1].matchAll(/\{\s*slug:\s*'([^']+)',\s*name:\s*'([^']+)'([\s\S]*?)\},?\s*(?=\{|$)/g);
  
  for (const match of classMatches) {
    const classContent = match[0];
    const iconMatch = classContent.match(/iconSrc:\s*'([^']+)'/);
    const iconSrc = iconMatch ? iconMatch[1] : null;
    
    if (iconSrc) {
      classes.push({
        slug: match[1],
        name: match[2],
        iconSrc: iconSrc
      });
    }
  }
  
  return classes;
}

/**
 * Parse existing ICON_MAP
 */
function parseIconMap() {
  const content = fs.readFileSync(ICON_MAP_FILE, 'utf-8');
  const iconMap = {
    abilities: {},
    items: {},
    buildings: {},
    trolls: {},
    units: {},
  };
  
  const categories = ['abilities', 'items', 'buildings', 'trolls', 'units'];
  for (const category of categories) {
    const regex = new RegExp(`${category}:\\s*\\{([\\s\\S]*?)\\}(?=,|\\})`, 'g');
    const match = content.match(regex);
    if (match) {
      const entries = match[0].matchAll(/'([^']+)':\\s*'([^']+)'/g);
      for (const entry of entries) {
        iconMap[category][entry[1]] = entry[2];
      }
    }
  }
  
  return iconMap;
}

/**
 * Update ICON_MAP file
 */
function updateIconMap(newMappings) {
  const content = fs.readFileSync(ICON_MAP_FILE, 'utf-8');
  
  // Build new mappings
  const categories = ['abilities', 'items', 'buildings', 'trolls', 'units'];
  const updatedMap = parseIconMap();
  
  // Add new mappings
  for (const [category, mappings] of Object.entries(newMappings)) {
    if (updatedMap[category]) {
      Object.assign(updatedMap[category], mappings);
    }
  }
  
  // Generate new content
  let newContent = content.split('export const ICON_MAP: IconMap = {')[0];
  newContent += 'export const ICON_MAP: IconMap = {\n';
  
  for (const category of categories) {
    newContent += `  ${category}: {\n`;
    const entries = Object.entries(updatedMap[category])
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => {
        // Properly escape: backslashes first, then quotes
        const escapedKey = key.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        const escapedValue = value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        return `    '${escapedKey}': '${escapedValue}'`;
      })
      .join(',\n');
    newContent += entries;
    newContent += '\n  },\n';
  }
  
  newContent += '};\n';
  newContent += content.split('};\n').slice(1).join('};\n');
  
  fs.writeFileSync(ICON_MAP_FILE, newContent, 'utf-8');
}

function main() {
  console.log('🔄 Migrating iconPath/iconSrc to ICON_MAP\n');
  console.log('='.repeat(70));
  
  // Get all icons
  console.log('\n📁 Loading icon files...');
  const allIcons = getAllIconFiles();
  console.log(`   Found ${allIcons.size} icon files`);
  
  // Read entities
  console.log('\n📦 Reading entities...');
  const items = readItemsFromTS();
  const abilities = readAbilitiesFromTS();
  const units = readUnitsFromTS();
  const classes = readClassesFromTS();
  const derivedClasses = readDerivedClassesFromTS();
  
  console.log(`   Items with iconPath: ${items.length}`);
  console.log(`   Abilities with iconPath: ${abilities.length}`);
  console.log(`   Units with iconPath: ${units.length}`);
  console.log(`   Classes with iconSrc: ${classes.length}`);
  console.log(`   Derived classes with iconSrc: ${derivedClasses.length}`);
  
  // Process mappings
  console.log('\n🔗 Processing mappings...');
  const newMappings = {
    abilities: {},
    items: {},
    buildings: {},
    trolls: {},
    units: {},
  };
  
  let itemsMapped = 0;
  let itemsNotFound = 0;
  for (const item of items) {
    const iconFile = findIconFile(item.iconPath, allIcons);
    if (iconFile) {
      newMappings.items[item.name] = iconFile.filename;
      itemsMapped++;
    } else {
      itemsNotFound++;
      console.log(`   ⚠️  Item icon not found: ${item.name} -> ${item.iconPath}`);
    }
  }
  
  let abilitiesMapped = 0;
  let abilitiesNotFound = 0;
  for (const ability of abilities) {
    const iconFile = findIconFile(ability.iconPath, allIcons);
    if (iconFile) {
      newMappings.abilities[ability.name] = iconFile.filename;
      abilitiesMapped++;
    } else {
      abilitiesNotFound++;
      console.log(`   ⚠️  Ability icon not found: ${ability.name} -> ${ability.iconPath}`);
    }
  }
  
  let unitsMapped = 0;
  let unitsNotFound = 0;
  for (const unit of units) {
    const iconFile = findIconFile(unit.iconPath, allIcons);
    if (iconFile) {
      newMappings.units[unit.name] = iconFile.filename;
      unitsMapped++;
    } else {
      unitsNotFound++;
      console.log(`   ⚠️  Unit icon not found: ${unit.name} -> ${unit.iconPath}`);
    }
  }
  
  let classesMapped = 0;
  let classesNotFound = 0;
  for (const cls of [...classes, ...derivedClasses]) {
    const iconFile = findIconFile(cls.iconSrc, allIcons);
    if (iconFile) {
      newMappings.trolls[cls.name] = iconFile.filename;
      classesMapped++;
    } else {
      classesNotFound++;
      if (cls.iconSrc) {
        console.log(`   ⚠️  Class icon not found: ${cls.name} -> ${cls.iconSrc}`);
      }
    }
  }
  
  console.log(`\n✅ Mapped:`);
  console.log(`   Items: ${itemsMapped}`);
  console.log(`   Abilities: ${abilitiesMapped}`);
  console.log(`   Units: ${unitsMapped}`);
  console.log(`   Classes: ${classesMapped}`);
  
  if (itemsNotFound + abilitiesNotFound + unitsNotFound + classesNotFound > 0) {
    console.log(`\n⚠️  Not found:`);
    console.log(`   Items: ${itemsNotFound}`);
    console.log(`   Abilities: ${abilitiesNotFound}`);
    console.log(`   Units: ${unitsNotFound}`);
    console.log(`   Classes: ${classesNotFound}`);
  }
  
  // Update ICON_MAP
  console.log('\n💾 Updating ICON_MAP...');
  updateIconMap(newMappings);
  console.log(`   ✅ Updated ${ICON_MAP_FILE}`);
  
  console.log('\n✅ Migration complete!\n');
}

main();

