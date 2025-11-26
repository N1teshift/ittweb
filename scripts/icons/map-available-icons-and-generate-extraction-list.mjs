/**
 * Map Available Icons and Generate Extraction List
 * 
 * This script:
 * 1. Maps entities whose iconPath points to existing icon files
 * 2. Generates a detailed list of icons that need extraction
 * 3. Organizes by priority (items with iconPath > abilities > units > classes)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..', '..');

const ICONS_DIR = path.join(ROOT_DIR, 'public', 'icons', 'itt');
const ICON_MAP_FILE = path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'utils', 'iconMap.ts');
const ITEMS_DIR = path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'data', 'items');
const ABILITIES_DIR = path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'data', 'abilities');
const UNITS_FILE = path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'data', 'units', 'allUnits.ts');
const CLASSES_FILE = path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'data', 'units', 'classes.ts');
const DERIVED_CLASSES_FILE = path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'data', 'units', 'derivedClasses.ts');

/**
 * Get all icon files (case-insensitive)
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
          const lowerKey = file.toLowerCase();
          if (!icons.has(lowerKey)) {
            icons.set(lowerKey, { category, filename: file });
          }
        }
      }
      
      const subdirs = fs.readdirSync(categoryDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      for (const subdir of subdirs) {
        const subdirPath = path.join(categoryDir, subdir);
        const subFiles = fs.readdirSync(subdirPath);
        for (const file of subFiles) {
          if (file.endsWith('.png')) {
            const lowerKey = file.toLowerCase();
            if (!icons.has(lowerKey)) {
              icons.set(lowerKey, { category, filename: file });
            }
          }
        }
      }
    }
  }
  
  return icons;
}

/**
 * Extract filename from path
 */
function extractIconFilename(iconPath) {
  if (!iconPath) return null;
  const pathParts = iconPath.split(/[/\\]/);
  return pathParts[pathParts.length - 1];
}

/**
 * Find icon file (case-insensitive)
 */
function findIconFile(iconPath, allIcons) {
  if (!iconPath) return null;
  const filename = extractIconFilename(iconPath);
  if (!filename) return null;
  const lowerKey = filename.toLowerCase();
  return allIcons.get(lowerKey) || null;
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
        
        items.push({
          id: match[1],
          name: match[2].replace(/\\$/, ''),
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
        
        abilities.push({
          id: match[1],
          name: match[2].replace(/\\$/, ''),
          iconPath: iconPath
        });
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
    
    units.push({
      id: match[1],
      name: match[2].replace(/\\$/, ''),
      iconPath: iconPath
    });
  }
  
  return units;
}

/**
 * Read classes from TypeScript files
 */
function readClassesFromTS() {
  const content = fs.readFileSync(CLASSES_FILE, 'utf-8');
  const match = content.match(/export const BASE_TROLL_CLASSES[^=]*=\s*\[([\s\S]*?)\];/);
  if (!match) return [];
  
  const classes = [];
  const classMatches = match[1].matchAll(/\{\s*slug:\s*'([^']+)',\s*name:\s*'([^']+)'([\s\S]*?)\},?\s*(?=\{|$)/g);
  
  for (const match of classMatches) {
    classes.push({
      slug: match[1],
      name: match[2]
    });
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
    classes.push({
      slug: match[1],
      name: match[2]
    });
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
    const categoryRegex = new RegExp(`${category}:\\s*\\{([\\s\\S]*?)\\}(?=\\s*[,}])`, 'm');
    const match = content.match(categoryRegex);
    if (match) {
      const categoryContent = match[1];
      const entryRegex = /'((?:[^'\\]|\\.)+)':\s*'((?:[^'\\]|\\.)+)'/g;
      let entryMatch;
      while ((entryMatch = entryRegex.exec(categoryContent)) !== null) {
        const key = entryMatch[1].replace(/\\'/g, "'").replace(/\\\\/g, "\\");
        const value = entryMatch[2].replace(/\\'/g, "'").replace(/\\\\/g, "\\");
        iconMap[category][key] = value;
      }
    }
  }
  
  return iconMap;
}

/**
 * Update ICON_MAP
 */
function updateIconMap(newMappings) {
  const content = fs.readFileSync(ICON_MAP_FILE, 'utf-8');
  const existingMap = parseIconMap();
  
  // Merge new mappings
  for (const [category, mappings] of Object.entries(newMappings)) {
    Object.assign(existingMap[category], mappings);
  }
  
  // Regenerate file
  const categories = ['abilities', 'items', 'buildings', 'trolls', 'units'];
  let newContent = content.split('export const ICON_MAP: IconMap = {')[0];
  newContent += 'export const ICON_MAP: IconMap = {\n';
  
  for (const category of categories) {
    newContent += `  ${category}: {\n`;
    const entries = Object.entries(existingMap[category])
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => {
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
  console.log('🗺️  Mapping Available Icons and Generating Extraction List\n');
  console.log('='.repeat(70));
  
  // Get all icons
  console.log('\n📁 Loading icon files...');
  const allIcons = getAllIconFiles();
  console.log(`   Found ${allIcons.size} unique icon files`);
  
  // Read entities
  console.log('\n📦 Reading entities...');
  const items = readItemsFromTS();
  const abilities = readAbilitiesFromTS();
  const units = readUnitsFromTS();
  const classes = readClassesFromTS();
  const derivedClasses = readDerivedClassesFromTS();
  
  console.log(`   Items: ${items.length}`);
  console.log(`   Abilities: ${abilities.length}`);
  console.log(`   Units: ${units.length}`);
  console.log(`   Base Classes: ${classes.length}`);
  console.log(`   Derived Classes: ${derivedClasses.length}`);
  
  // Read existing mappings
  const iconMap = parseIconMap();
  
  // Process entities
  console.log('\n🔍 Processing entities...\n');
  
  const newMappings = {
    abilities: {},
    items: {},
    units: {},
  };
  
  const needsExtraction = {
    items: [],
    abilities: [],
    units: [],
    classes: [],
  };
  
  // Process items
  let itemsMapped = 0;
  let itemsNeedExtraction = 0;
  for (const item of items) {
    if (iconMap.items[item.name]) continue; // Already mapped
    
    if (item.iconPath) {
      const iconFile = findIconFile(item.iconPath, allIcons);
      if (iconFile) {
        newMappings.items[item.name] = iconFile.filename;
        itemsMapped++;
      } else {
        needsExtraction.items.push({
          name: item.name,
          iconPath: item.iconPath,
          extractedFilename: extractIconFilename(item.iconPath)
        });
        itemsNeedExtraction++;
      }
    } else {
      needsExtraction.items.push({
        name: item.name,
        iconPath: null,
        extractedFilename: null
      });
      itemsNeedExtraction++;
    }
  }
  
  // Process abilities
  let abilitiesMapped = 0;
  let abilitiesNeedExtraction = 0;
  for (const ability of abilities) {
    if (iconMap.abilities[ability.name]) continue; // Already mapped
    
    if (ability.iconPath) {
      const iconFile = findIconFile(ability.iconPath, allIcons);
      if (iconFile) {
        newMappings.abilities[ability.name] = iconFile.filename;
        abilitiesMapped++;
      } else {
        needsExtraction.abilities.push({
          name: ability.name,
          iconPath: ability.iconPath,
          extractedFilename: extractIconFilename(ability.iconPath)
        });
        abilitiesNeedExtraction++;
      }
    } else {
      needsExtraction.abilities.push({
        name: ability.name,
        iconPath: null,
        extractedFilename: null
      });
      abilitiesNeedExtraction++;
    }
  }
  
  // Process units
  let unitsMapped = 0;
  let unitsNeedExtraction = 0;
  for (const unit of units) {
    if (iconMap.units[unit.name]) continue; // Already mapped
    
    if (unit.iconPath) {
      const iconFile = findIconFile(unit.iconPath, allIcons);
      if (iconFile) {
        newMappings.units[unit.name] = iconFile.filename;
        unitsMapped++;
      } else {
        needsExtraction.units.push({
          name: unit.name,
          iconPath: unit.iconPath,
          extractedFilename: extractIconFilename(unit.iconPath)
        });
        unitsNeedExtraction++;
      }
    } else {
      needsExtraction.units.push({
        name: unit.name,
        iconPath: null,
        extractedFilename: null
      });
      unitsNeedExtraction++;
    }
  }
  
  // Process classes (all need extraction)
  for (const cls of [...classes, ...derivedClasses]) {
    if (iconMap.trolls[cls.name]) continue;
    needsExtraction.classes.push({
      name: cls.name,
      slug: cls.slug,
      iconPath: null,
      extractedFilename: null
    });
  }
  
  // Report
  console.log('📊 Results\n');
  console.log('-'.repeat(70));
  console.log(`✅ Newly mapped:`);
  console.log(`   Items: ${itemsMapped}`);
  console.log(`   Abilities: ${abilitiesMapped}`);
  console.log(`   Units: ${unitsMapped}`);
  console.log(`   Total: ${itemsMapped + abilitiesMapped + unitsMapped}`);
  
  console.log(`\n❌ Need extraction:`);
  console.log(`   Items: ${itemsNeedExtraction}`);
  console.log(`   Abilities: ${abilitiesNeedExtraction}`);
  console.log(`   Units: ${unitsNeedExtraction}`);
  console.log(`   Classes: ${needsExtraction.classes.length}`);
  console.log(`   Total: ${itemsNeedExtraction + abilitiesNeedExtraction + unitsNeedExtraction + needsExtraction.classes.length}`);
  
  // Update ICON_MAP if we have new mappings
  const totalNewMappings = Object.keys(newMappings.items).length + 
                           Object.keys(newMappings.abilities).length + 
                           Object.keys(newMappings.units).length;
  
  if (totalNewMappings > 0) {
    console.log(`\n💾 Updating ICON_MAP with ${totalNewMappings} new mappings...`);
    updateIconMap(newMappings);
    console.log(`   ✅ Updated ${ICON_MAP_FILE}`);
  }
  
  // Generate extraction list
  const extractionListPath = path.join(ROOT_DIR, 'ICON_EXTRACTION_LIST.md');
  let extractionList = '# Icon Extraction List\n\n';
  extractionList += `Generated: ${new Date().toISOString()}\n\n`;
  extractionList += `## Summary\n\n`;
  extractionList += `- Items needing extraction: ${itemsNeedExtraction}\n`;
  extractionList += `- Abilities needing extraction: ${abilitiesNeedExtraction}\n`;
  extractionList += `- Units needing extraction: ${unitsNeedExtraction}\n`;
  extractionList += `- Classes needing extraction: ${needsExtraction.classes.length}\n`;
  extractionList += `- **Total: ${itemsNeedExtraction + abilitiesNeedExtraction + unitsNeedExtraction + needsExtraction.classes.length}**\n\n`;
  
  // Group by extracted filename for easier extraction
  const byFilename = new Map();
  
  for (const item of needsExtraction.items) {
    if (item.extractedFilename) {
      if (!byFilename.has(item.extractedFilename)) {
        byFilename.set(item.extractedFilename, []);
      }
      byFilename.get(item.extractedFilename).push({ category: 'items', name: item.name });
    }
  }
  
  for (const ability of needsExtraction.abilities) {
    if (ability.extractedFilename) {
      if (!byFilename.has(ability.extractedFilename)) {
        byFilename.set(ability.extractedFilename, []);
      }
      byFilename.get(ability.extractedFilename).push({ category: 'abilities', name: ability.name });
    }
  }
  
  for (const unit of needsExtraction.units) {
    if (unit.extractedFilename) {
      if (!byFilename.has(unit.extractedFilename)) {
        byFilename.set(unit.extractedFilename, []);
      }
      byFilename.get(unit.extractedFilename).push({ category: 'units', name: unit.name });
    }
  }
  
  extractionList += `## Icons to Extract (Grouped by Filename)\n\n`;
  extractionList += `**Total unique icon files needed: ${byFilename.size}**\n\n`;
  
  const sortedFilenames = Array.from(byFilename.entries()).sort(([a], [b]) => a.localeCompare(b));
  
  for (const [filename, entities] of sortedFilenames) {
    extractionList += `### ${filename}\n\n`;
    extractionList += `**Used by ${entities.length} entity/entities:**\n\n`;
    for (const entity of entities) {
      extractionList += `- ${entity.name} (${entity.category})\n`;
    }
    extractionList += '\n';
  }
  
  // Add classes
  if (needsExtraction.classes.length > 0) {
    extractionList += `## Classes Needing Icons\n\n`;
    extractionList += `All ${needsExtraction.classes.length} classes need icons extracted:\n\n`;
    for (const cls of needsExtraction.classes) {
      extractionList += `- ${cls.name} (slug: ${cls.slug})\n`;
    }
    extractionList += '\n';
  }
  
  // Add entities without iconPath
  const withoutIconPath = {
    items: needsExtraction.items.filter(i => !i.iconPath),
    abilities: needsExtraction.abilities.filter(a => !a.iconPath),
    units: needsExtraction.units.filter(u => !u.iconPath),
  };
  
  if (withoutIconPath.items.length > 0 || withoutIconPath.abilities.length > 0 || withoutIconPath.units.length > 0) {
    extractionList += `## Entities Without iconPath\n\n`;
    extractionList += `These entities don't have iconPath in their data and need icons identified:\n\n`;
    
    if (withoutIconPath.items.length > 0) {
      extractionList += `### Items (${withoutIconPath.items.length})\n\n`;
      for (const item of withoutIconPath.items.slice(0, 20)) {
        extractionList += `- ${item.name}\n`;
      }
      if (withoutIconPath.items.length > 20) {
        extractionList += `... and ${withoutIconPath.items.length - 20} more\n`;
      }
      extractionList += '\n';
    }
    
    if (withoutIconPath.abilities.length > 0) {
      extractionList += `### Abilities (${withoutIconPath.abilities.length})\n\n`;
      for (const ability of withoutIconPath.abilities.slice(0, 20)) {
        extractionList += `- ${ability.name}\n`;
      }
      if (withoutIconPath.abilities.length > 20) {
        extractionList += `... and ${withoutIconPath.abilities.length - 20} more\n`;
      }
      extractionList += '\n';
    }
    
    if (withoutIconPath.units.length > 0) {
      extractionList += `### Units (${withoutIconPath.units.length})\n\n`;
      for (const unit of withoutIconPath.units.slice(0, 20)) {
        extractionList += `- ${unit.name}\n`;
      }
      if (withoutIconPath.units.length > 20) {
        extractionList += `... and ${withoutIconPath.units.length - 20} more\n`;
      }
      extractionList += '\n';
    }
  }
  
  fs.writeFileSync(extractionListPath, extractionList, 'utf-8');
  console.log(`\n📄 Extraction list saved to: ${extractionListPath}`);
  
  console.log('\n✅ Complete!\n');
}

main();

