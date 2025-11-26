/**
 * Extract and Organize Missing Icons
 * 
 * This script:
 * 1. Identifies entities missing icons
 * 2. Suggests icon filenames based on entity names
 * 3. Provides extraction guidance
 * 4. Organizes icons into proper directories
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
const EXTRACTED_DIR = path.join(ROOT_DIR, 'data', 'island_troll_tribes', 'extracted_from_w3x');

/**
 * Get all icon files
 */
function getAllIconFiles() {
  const icons = new Set();
  const categories = ['abilities', 'items', 'buildings', 'trolls', 'units', 'base', 'unclassified'];
  
  for (const category of categories) {
    const categoryDir = path.join(ICONS_DIR, category);
    if (fs.existsSync(categoryDir)) {
      const files = fs.readdirSync(categoryDir);
      for (const file of files) {
        if (file.endsWith('.png')) {
          icons.add(file.toLowerCase());
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
            icons.add(file.toLowerCase());
          }
        }
      }
    }
  }
  
  return icons;
}

/**
 * Generate suggested icon filename from name
 */
function suggestIconFilename(name) {
  // Remove color codes
  let clean = name.replace(/\|c[0-9A-Fa-f]{8}/g, '').replace(/\|r/g, '').trim();
  
  // Convert to BTN format
  clean = clean.replace(/[^a-zA-Z0-9]/g, '');
  clean = clean.charAt(0).toUpperCase() + clean.slice(1);
  
  // Common prefixes
  if (!clean.startsWith('BTN') && !clean.startsWith('ATC') && !clean.startsWith('PAS')) {
    clean = 'BTN' + clean;
  }
  
  return clean + '.png';
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
        items.push({
          id: match[1],
          name: match[2]
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
        abilities.push({
          id: match[1],
          name: match[2]
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
    units.push({
      id: match[1],
      name: match[2]
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
 * Parse ICON_MAP
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
 * Check if extracted data has icon info
 */
function checkExtractedData() {
  const extractedAbilities = path.join(EXTRACTED_DIR, 'abilities.json');
  const extractedItems = path.join(EXTRACTED_DIR, 'items.json');
  const extractedUnits = path.join(EXTRACTED_DIR, 'units.json');
  
  const hasAbilities = fs.existsSync(extractedAbilities);
  const hasItems = fs.existsSync(extractedItems);
  const hasUnits = fs.existsSync(extractedUnits);
  
  return { hasAbilities, hasItems, hasUnits };
}

function main() {
  console.log('🔍 Analyzing Missing Icons\n');
  console.log('='.repeat(70));
  
  // Get all icons
  console.log('\n📁 Loading existing icons...');
  const allIcons = getAllIconFiles();
  console.log(`   Found ${allIcons.size} icon files`);
  
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
  
  // Read icon map
  console.log('\n🗺️  Reading icon mappings...');
  const iconMap = parseIconMap();
  
  // Find missing icons
  console.log('\n🔍 Finding missing icons...');
  
  const missingItems = items.filter(item => !iconMap.items[item.name]);
  const missingAbilities = abilities.filter(ability => !iconMap.abilities[ability.name]);
  const missingUnits = units.filter(unit => !iconMap.units[unit.name]);
  const missingClasses = [...classes, ...derivedClasses].filter(cls => !iconMap.trolls[cls.name]);
  
  console.log(`   Missing items: ${missingItems.length}`);
  console.log(`   Missing abilities: ${missingAbilities.length}`);
  console.log(`   Missing units: ${missingUnits.length}`);
  console.log(`   Missing classes: ${missingClasses.length}`);
  
  // Check extracted data
  console.log('\n📂 Checking extracted data...');
  const extracted = checkExtractedData();
  console.log(`   Extracted abilities: ${extracted.hasAbilities ? '✅' : '❌'}`);
  console.log(`   Extracted items: ${extracted.hasItems ? '✅' : '❌'}`);
  console.log(`   Extracted units: ${extracted.hasUnits ? '✅' : '❌'}`);
  
  // Generate suggestions
  console.log('\n💡 Icon Extraction Suggestions\n');
  console.log('-'.repeat(70));
  
  if (missingItems.length > 0) {
    console.log(`\n📦 Items (${missingItems.length} missing):`);
    console.log('   Suggested icon filenames (first 20):');
    missingItems.slice(0, 20).forEach(item => {
      const suggested = suggestIconFilename(item.name);
      console.log(`   - ${item.name} -> ${suggested}`);
    });
    if (missingItems.length > 20) {
      console.log(`   ... and ${missingItems.length - 20} more`);
    }
  }
  
  if (missingAbilities.length > 0) {
    console.log(`\n✨ Abilities (${missingAbilities.length} missing):`);
    console.log('   Suggested icon filenames (first 20):');
    missingAbilities.slice(0, 20).forEach(ability => {
      const suggested = suggestIconFilename(ability.name);
      console.log(`   - ${ability.name} -> ${suggested}`);
    });
    if (missingAbilities.length > 20) {
      console.log(`   ... and ${missingAbilities.length - 20} more`);
    }
  }
  
  if (missingUnits.length > 0) {
    console.log(`\n👤 Units (${missingUnits.length} missing):`);
    console.log('   Suggested icon filenames (first 20):');
    missingUnits.slice(0, 20).forEach(unit => {
      const suggested = suggestIconFilename(unit.name);
      console.log(`   - ${unit.name} -> ${suggested}`);
    });
    if (missingUnits.length > 20) {
      console.log(`   ... and ${missingUnits.length - 20} more`);
    }
  }
  
  if (missingClasses.length > 0) {
    console.log(`\n🎭 Classes (${missingClasses.length} missing):`);
    console.log('   Suggested icon filenames:');
    missingClasses.forEach(cls => {
      const suggested = suggestIconFilename(cls.name);
      console.log(`   - ${cls.name} -> ${suggested}`);
    });
  }
  
  // Extraction instructions
  console.log('\n📋 Extraction Instructions\n');
  console.log('-'.repeat(70));
  console.log(`
1. Extract icons from game files (.w3x):
   - Use MPQ Editor or similar tool
   - Look in: ReplaceableTextures/CommandButtons/
   - Extract .blp files and convert to .png

2. Organize icons:
   - Items -> public/icons/itt/items/
   - Abilities -> public/icons/itt/abilities/
   - Units -> public/icons/itt/units/
   - Classes -> public/icons/itt/trolls/

3. After extraction:
   - Run: node scripts/migrate-iconpaths-to-iconmap.mjs
   - Run: node scripts/analyze-icon-mapping-comprehensive.mjs

4. Check extracted JSON files:
   - data/island_troll_tribes/extracted_from_w3x/abilities.json
   - data/island_troll_tribes/extracted_from_w3x/items.json
   - data/island_troll_tribes/extracted_from_w3x/units.json
   These may contain icon path information.
  `);
  
  // Generate report file
  const reportPath = path.join(ROOT_DIR, 'MISSING_ICONS_REPORT.md');
  let report = '# Missing Icons Report\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;
  report += `## Summary\n\n`;
  report += `- Missing Items: ${missingItems.length}\n`;
  report += `- Missing Abilities: ${missingAbilities.length}\n`;
  report += `- Missing Units: ${missingUnits.length}\n`;
  report += `- Missing Classes: ${missingClasses.length}\n\n`;
  
  if (missingItems.length > 0) {
    report += `## Missing Items\n\n`;
    missingItems.forEach(item => {
      report += `- ${item.name} (suggested: ${suggestIconFilename(item.name)})\n`;
    });
    report += '\n';
  }
  
  if (missingAbilities.length > 0) {
    report += `## Missing Abilities\n\n`;
    missingAbilities.forEach(ability => {
      report += `- ${ability.name} (suggested: ${suggestIconFilename(ability.name)})\n`;
    });
    report += '\n';
  }
  
  if (missingUnits.length > 0) {
    report += `## Missing Units\n\n`;
    missingUnits.forEach(unit => {
      report += `- ${unit.name} (suggested: ${suggestIconFilename(unit.name)})\n`;
    });
    report += '\n';
  }
  
  if (missingClasses.length > 0) {
    report += `## Missing Classes\n\n`;
    missingClasses.forEach(cls => {
      report += `- ${cls.name} (suggested: ${suggestIconFilename(cls.name)})\n`;
    });
    report += '\n';
  }
  
  fs.writeFileSync(reportPath, report, 'utf-8');
  console.log(`\n📄 Report saved to: ${reportPath}`);
  
  console.log('\n✅ Analysis complete!\n');
}

main();

