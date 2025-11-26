/**
 * Fix Icon Mapping Issues
 * 
 * This script:
 * 1. Fixes case sensitivity issues in icon filenames
 * 2. Handles path-based icon references (ReplaceableTextures/...)
 * 3. Identifies missing icons that need extraction
 * 4. Provides detailed report
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ICON_CATEGORIES } from '../lib/constants.mjs';

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
 * Get all icon files with case-insensitive lookup
 */
function getAllIconFiles() {
  const icons = new Map(); // lowercase filename -> { category, filename }
  const categories = ICON_CATEGORIES;
  
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
      
      // Check subdirectories
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
  
  // Handle full paths like "ReplaceableTextures/PassiveButtons/PASBTNElunesBlessing.png"
  const pathParts = iconPath.split(/[/\\]/);
  const filename = pathParts[pathParts.length - 1];
  
  return filename;
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
          name: match[2].replace(/\\$/, ''), // Remove trailing backslash
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
          name: match[2].replace(/\\$/, ''), // Remove trailing backslash
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
      name: match[2].replace(/\\$/, ''), // Remove trailing backslash
      iconPath: iconPath
    });
  }
  
  return units;
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

function main() {
  console.log('🔧 Fixing Icon Mapping Issues\n');
  console.log('='.repeat(70));
  
  // Get all icons
  console.log('\n📁 Loading icon files...');
  const allIcons = getAllIconFiles();
  console.log(`   Found ${allIcons.size} unique icon files (case-insensitive)`);
  
  // Read entities
  console.log('\n📦 Reading entities...');
  const items = readItemsFromTS();
  const abilities = readAbilitiesFromTS();
  const units = readUnitsFromTS();
  
  console.log(`   Items: ${items.length}`);
  console.log(`   Abilities: ${abilities.length}`);
  console.log(`   Units: ${units.length}`);
  
  // Read existing icon map
  console.log('\n🗺️  Reading existing mappings...');
  const iconMap = parseIconMap();
  
  // Analyze and fix
  console.log('\n🔍 Analyzing issues...\n');
  
  const issues = {
    caseSensitivity: [],
    pathBased: [],
    missingIcons: [],
    canBeMapped: [],
  };
  
  // Check items
  console.log('📦 Checking items...');
  for (const item of items) {
    if (iconMap.items[item.name]) continue; // Already mapped
    
    if (item.iconPath) {
      const iconFile = findIconFile(item.iconPath, allIcons);
      if (iconFile) {
        // Can be mapped!
        issues.canBeMapped.push({
          category: 'items',
          name: item.name,
          iconPath: item.iconPath,
          foundIcon: iconFile.filename
        });
      } else {
        // Check if it's a path-based reference
        if (item.iconPath.includes('/') || item.iconPath.includes('\\')) {
          issues.pathBased.push({
            category: 'items',
            name: item.name,
            iconPath: item.iconPath,
            extractedFilename: extractIconFilename(item.iconPath)
          });
        } else {
          // Missing icon
          issues.missingIcons.push({
            category: 'items',
            name: item.name,
            iconPath: item.iconPath
          });
        }
      }
    } else {
      issues.missingIcons.push({
        category: 'items',
        name: item.name,
        iconPath: null
      });
    }
  }
  
  // Check abilities
  console.log('✨ Checking abilities...');
  for (const ability of abilities) {
    if (iconMap.abilities[ability.name]) continue; // Already mapped
    
    if (ability.iconPath) {
      const iconFile = findIconFile(ability.iconPath, allIcons);
      if (iconFile) {
        issues.canBeMapped.push({
          category: 'abilities',
          name: ability.name,
          iconPath: ability.iconPath,
          foundIcon: iconFile.filename
        });
      } else {
        if (ability.iconPath.includes('/') || ability.iconPath.includes('\\')) {
          issues.pathBased.push({
            category: 'abilities',
            name: ability.name,
            iconPath: ability.iconPath,
            extractedFilename: extractIconFilename(ability.iconPath)
          });
        } else {
          issues.missingIcons.push({
            category: 'abilities',
            name: ability.name,
            iconPath: ability.iconPath
          });
        }
      }
    } else {
      issues.missingIcons.push({
        category: 'abilities',
        name: ability.name,
        iconPath: null
      });
    }
  }
  
  // Check units
  console.log('👤 Checking units...');
  for (const unit of units) {
    if (iconMap.units[unit.name]) continue; // Already mapped
    
    if (unit.iconPath) {
      const iconFile = findIconFile(unit.iconPath, allIcons);
      if (iconFile) {
        issues.canBeMapped.push({
          category: 'units',
          name: unit.name,
          iconPath: unit.iconPath,
          foundIcon: iconFile.filename
        });
      } else {
        if (unit.iconPath.includes('/') || unit.iconPath.includes('\\')) {
          issues.pathBased.push({
            category: 'units',
            name: unit.name,
            iconPath: unit.iconPath,
            extractedFilename: extractIconFilename(unit.iconPath)
          });
        } else {
          issues.missingIcons.push({
            category: 'units',
            name: unit.name,
            iconPath: unit.iconPath
          });
        }
      }
    } else {
      issues.missingIcons.push({
        category: 'units',
        name: unit.name,
        iconPath: null
      });
    }
  }
  
  // Report
  console.log('\n📊 Issue Summary\n');
  console.log('-'.repeat(70));
  console.log(`✅ Can be mapped immediately: ${issues.canBeMapped.length}`);
  console.log(`   Items: ${issues.canBeMapped.filter(i => i.category === 'items').length}`);
  console.log(`   Abilities: ${issues.canBeMapped.filter(i => i.category === 'abilities').length}`);
  console.log(`   Units: ${issues.canBeMapped.filter(i => i.category === 'units').length}`);
  
  console.log(`\n📂 Path-based references: ${issues.pathBased.length}`);
  console.log(`   (Icons with full paths - need extraction or mapping)`);
  
  console.log(`\n❌ Missing icons: ${issues.missingIcons.length}`);
  console.log(`   Items: ${issues.missingIcons.filter(i => i.category === 'items').length}`);
  console.log(`   Abilities: ${issues.missingIcons.filter(i => i.category === 'abilities').length}`);
  console.log(`   Units: ${issues.missingIcons.filter(i => i.category === 'units').length}`);
  
  // Auto-map the ones we can
  if (issues.canBeMapped.length > 0) {
    console.log('\n💾 Auto-mapping entities with found icons...');
    const newMappings = {
      abilities: {},
      items: {},
      units: {},
    };
    
    for (const item of issues.canBeMapped) {
      const iconFile = findIconFile(item.iconPath, allIcons);
      if (iconFile) {
        newMappings[item.category][item.name] = iconFile.filename;
      }
    }
    
    // Update iconMap
    const content = fs.readFileSync(ICON_MAP_FILE, 'utf-8');
    const updatedMap = parseIconMap();
    
    // Merge new mappings
    for (const [category, mappings] of Object.entries(newMappings)) {
      Object.assign(updatedMap[category], mappings);
    }
    
    // Regenerate file
    const categories = ['abilities', 'items', 'buildings', 'trolls', 'units'];
    let newContent = content.split('export const ICON_MAP: IconMap = {')[0];
    newContent += 'export const ICON_MAP: IconMap = {\n';
    
    for (const category of categories) {
      newContent += `  ${category}: {\n`;
      const entries = Object.entries(updatedMap[category])
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
    console.log(`   ✅ Mapped ${issues.canBeMapped.length} entities`);
  }
  
  // Generate detailed report
  const reportPath = path.join(ROOT_DIR, 'ICON_MAPPING_ISSUES_REPORT.md');
  let report = '# Icon Mapping Issues Report\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;
  
  report += `## Summary\n\n`;
  report += `- Can be mapped: ${issues.canBeMapped.length}\n`;
  report += `- Path-based references: ${issues.pathBased.length}\n`;
  report += `- Missing icons: ${issues.missingIcons.length}\n\n`;
  
  if (issues.pathBased.length > 0) {
    report += `## Path-Based Icon References\n\n`;
    report += `These entities have icon paths that need to be extracted or mapped:\n\n`;
    for (const item of issues.pathBased.slice(0, 50)) {
      report += `- **${item.name}** (${item.category})\n`;
      report += `  - Path: \`${item.iconPath}\`\n`;
      report += `  - Extracted filename: \`${item.extractedFilename}\`\n\n`;
    }
    if (issues.pathBased.length > 50) {
      report += `... and ${issues.pathBased.length - 50} more\n\n`;
    }
  }
  
  if (issues.missingIcons.length > 0) {
    report += `## Missing Icons\n\n`;
    report += `These entities need icons to be extracted:\n\n`;
    const byCategory = {};
    for (const item of issues.missingIcons) {
      if (!byCategory[item.category]) {
        byCategory[item.category] = [];
      }
      byCategory[item.category].push(item);
    }
    
    for (const [category, items] of Object.entries(byCategory)) {
      report += `### ${category}\n\n`;
      for (const item of items.slice(0, 30)) {
        report += `- ${item.name}${item.iconPath ? ` (expected: ${item.iconPath})` : ''}\n`;
      }
      if (items.length > 30) {
        report += `... and ${items.length - 30} more\n`;
      }
      report += '\n';
    }
  }
  
  fs.writeFileSync(reportPath, report, 'utf-8');
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  console.log('\n✅ Analysis complete!\n');
}

main();

