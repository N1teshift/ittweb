import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Paths
const ICONS_DIR = path.join(ROOT_DIR, 'public', 'icons', 'itt');
const ICON_MAP_FILE = path.join(ROOT_DIR, 'src', 'features', 'ittweb', 'guides', 'utils', 'iconMap.ts');
const ITEMS_FILE = path.join(ROOT_DIR, 'src', 'features', 'ittweb', 'guides', 'data', 'items', 'index.ts');
const ABILITIES_FILE = path.join(ROOT_DIR, 'src', 'features', 'ittweb', 'guides', 'data', 'abilities', 'index.ts');
const UNITS_FILE = path.join(ROOT_DIR, 'src', 'features', 'ittweb', 'guides', 'data', 'units', 'allUnits.ts');
const CLASSES_FILE = path.join(ROOT_DIR, 'src', 'features', 'ittweb', 'guides', 'data', 'units', 'classes.ts');
const DERIVED_CLASSES_FILE = path.join(ROOT_DIR, 'src', 'features', 'ittweb', 'guides', 'data', 'units', 'derivedClasses.ts');

/**
 * Get all icon files from directories
 */
function getAllIconFiles(dir) {
  const icons = [];
  const categories = ['abilities', 'items', 'buildings', 'trolls', 'units', 'base', 'unclassified'];
  
  for (const category of categories) {
    const categoryDir = path.join(dir, category);
    if (fs.existsSync(categoryDir)) {
      const files = fs.readdirSync(categoryDir);
      for (const file of files) {
        if (file.endsWith('.png')) {
          icons.push({
            category,
            filename: file,
            path: path.join(categoryDir, file),
          });
        }
      }
      
      // Check for subdirectories (like enabled/)
      const subdirs = fs.readdirSync(categoryDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      for (const subdir of subdirs) {
        const subdirPath = path.join(categoryDir, subdir);
        const subFiles = fs.readdirSync(subdirPath);
        for (const file of subFiles) {
          if (file.endsWith('.png')) {
            icons.push({
              category,
              filename: file,
              path: path.join(subdirPath, file),
            });
          }
        }
      }
    }
  }
  
  return icons;
}

/**
 * Read items from TypeScript file
 */
function readItemsFromTS() {
  const content = fs.readFileSync(ITEMS_FILE, 'utf-8');
  // Extract ITEMS_DATA array
  const match = content.match(/export const ITEMS_DATA[^=]*=\s*\[([\s\S]*?)\];/);
  if (!match) return [];
  
  // Simple parsing - count items by looking for object patterns
  const items = [];
  const itemPattern = /\{[^}]*name:\s*['"]([^'"]+)['"][^}]*\}/g;
  let m;
  while ((m = itemPattern.exec(match[1])) !== null) {
    const itemContent = m[0];
    const nameMatch = itemContent.match(/name:\s*['"]([^'"]+)['"]/);
    const iconPathMatch = itemContent.match(/iconPath:\s*['"]([^'"]+)['"]/);
    items.push({
      name: nameMatch ? nameMatch[1] : 'Unknown',
      iconPath: iconPathMatch ? iconPathMatch[1] : undefined,
    });
  }
  
  return items;
}

/**
 * Read abilities from TypeScript file
 */
function readAbilitiesFromTS() {
  const content = fs.readFileSync(ABILITIES_FILE, 'utf-8');
  const match = content.match(/export const ABILITIES[^=]*=\s*\[([\s\S]*?)\];/);
  if (!match) return [];
  
  const abilities = [];
  const abilityPattern = /\{[^}]*name:\s*['"]([^'"]+)['"][^}]*\}/g;
  let m;
  while ((m = abilityPattern.exec(match[1])) !== null) {
    const abilityContent = m[0];
    const nameMatch = abilityContent.match(/name:\s*['"]([^'"]+)['"]/);
    const iconPathMatch = abilityContent.match(/iconPath:\s*['"]([^'"]+)['"]/);
    abilities.push({
      name: nameMatch ? nameMatch[1] : 'Unknown',
      iconPath: iconPathMatch ? iconPathMatch[1] : undefined,
    });
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
  const unitPattern = /\{[^}]*name:\s*['"]([^'"]+)['"][^}]*\}/g;
  let m;
  while ((m = unitPattern.exec(match[1])) !== null) {
    const unitContent = m[0];
    const nameMatch = unitContent.match(/name:\s*['"]([^'"]+)['"]/);
    const iconPathMatch = unitContent.match(/iconPath:\s*['"]([^'"]+)['"]/);
    units.push({
      name: nameMatch ? nameMatch[1] : 'Unknown',
      iconPath: iconPathMatch ? iconPathMatch[1] : undefined,
    });
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
  const classPattern = /\{[^}]*name:\s*['"]([^'"]+)['"][^}]*\}/g;
  let m;
  while ((m = classPattern.exec(match[1])) !== null) {
    const classContent = m[0];
    const nameMatch = classContent.match(/name:\s*['"]([^'"]+)['"]/);
    const iconSrcMatch = classContent.match(/iconSrc:\s*['"]([^'"]+)['"]/);
    classes.push({
      name: nameMatch ? nameMatch[1] : 'Unknown',
      iconSrc: iconSrcMatch ? iconSrcMatch[1] : undefined,
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
  const classPattern = /\{[^}]*name:\s*['"]([^'"]+)['"][^}]*\}/g;
  let m;
  while ((m = classPattern.exec(match[1])) !== null) {
    const classContent = m[0];
    const nameMatch = classContent.match(/name:\s*['"]([^'"]+)['"]/);
    const iconSrcMatch = classContent.match(/iconSrc:\s*['"]([^'"]+)['"]/);
    classes.push({
      name: nameMatch ? nameMatch[1] : 'Unknown',
      iconSrc: iconSrcMatch ? iconSrcMatch[1] : undefined,
    });
  }
  
  return classes;
}

/**
 * Parse ICON_MAP from TypeScript file
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
  
  // Extract abilities mappings
  const abilitiesMatch = content.match(/abilities:\s*\{([\s\S]*?)\}/);
  if (abilitiesMatch) {
    const entries = abilitiesMatch[1].matchAll(/'([^']+)':\s*'([^']+)'/g);
    for (const entry of entries) {
      iconMap.abilities[entry[1]] = entry[2];
    }
  }
  
  // Extract items mappings
  const itemsMatch = content.match(/items:\s*\{([\s\S]*?)\}/);
  if (itemsMatch) {
    const entries = itemsMatch[1].matchAll(/'([^']+)':\s*'([^']+)'/g);
    for (const entry of entries) {
      iconMap.items[entry[1]] = entry[2];
    }
  }
  
  // Extract buildings mappings
  const buildingsMatch = content.match(/buildings:\s*\{([\s\S]*?)\}/);
  if (buildingsMatch) {
    const entries = buildingsMatch[1].matchAll(/'([^']+)':\s*'([^']+)'/g);
    for (const entry of entries) {
      iconMap.buildings[entry[1]] = entry[2];
    }
  }
  
  // Extract trolls mappings
  const trollsMatch = content.match(/trolls:\s*\{([\s\S]*?)\}/);
  if (trollsMatch) {
    const entries = trollsMatch[1].matchAll(/'([^']+)':\s*'([^']+)'/g);
    for (const entry of entries) {
      iconMap.trolls[entry[1]] = entry[2];
    }
  }
  
  // Extract units mappings
  const unitsMatch = content.match(/units:\s*\{([\s\S]*?)\}/);
  if (unitsMatch) {
    const entries = unitsMatch[1].matchAll(/'([^']+)':\s*'([^']+)'/g);
    for (const entry of entries) {
      iconMap.units[entry[1]] = entry[2];
    }
  }
  
  return iconMap;
}

function main() {
  console.log('📊 Icon Mapping Analysis\n');
  console.log('='.repeat(60));
  
  // Get all icons
  console.log('\n📁 Scanning icon directories...');
  const allIcons = getAllIconFiles(ICONS_DIR);
  const iconsByCategory = {};
  for (const icon of allIcons) {
    if (!iconsByCategory[icon.category]) {
      iconsByCategory[icon.category] = [];
    }
    iconsByCategory[icon.category].push(icon.filename);
  }
  
  console.log(`   Total icons found: ${allIcons.length}`);
  for (const [category, files] of Object.entries(iconsByCategory)) {
    console.log(`   ${category}: ${files.length} icons`);
  }
  
  // Read data
  console.log('\n📦 Reading game data...');
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
  console.log(`   Abilities mapped: ${Object.keys(iconMap.abilities).length}`);
  console.log(`   Items mapped: ${Object.keys(iconMap.items).length}`);
  console.log(`   Buildings mapped: ${Object.keys(iconMap.buildings).length}`);
  console.log(`   Trolls mapped: ${Object.keys(iconMap.trolls).length}`);
  console.log(`   Units mapped: ${Object.keys(iconMap.units).length}`);
  
  // Analyze coverage
  console.log('\n📈 Coverage Analysis\n');
  console.log('-'.repeat(60));
  
  // Items
  const itemsWithIconPath = items.filter(i => i.iconPath).length;
  const itemsMapped = items.filter(i => iconMap.items[i.name]).length;
  console.log(`\nItems:`);
  console.log(`   Total: ${items.length}`);
  console.log(`   With iconPath in data: ${itemsWithIconPath} (${Math.round(itemsWithIconPath/items.length*100)}%)`);
  console.log(`   Mapped in ICON_MAP: ${itemsMapped} (${Math.round(itemsMapped/items.length*100)}%)`);
  console.log(`   Unmapped: ${items.length - itemsMapped} (${Math.round((items.length - itemsMapped)/items.length*100)}%)`);
  
  // Abilities
  const abilitiesWithIconPath = abilities.filter(a => a.iconPath).length;
  const abilitiesMapped = abilities.filter(a => iconMap.abilities[a.name]).length;
  console.log(`\nAbilities:`);
  console.log(`   Total: ${abilities.length}`);
  console.log(`   With iconPath in data: ${abilitiesWithIconPath} (${Math.round(abilitiesWithIconPath/abilities.length*100)}%)`);
  console.log(`   Mapped in ICON_MAP: ${abilitiesMapped} (${Math.round(abilitiesMapped/abilities.length*100)}%)`);
  console.log(`   Unmapped: ${abilities.length - abilitiesMapped} (${Math.round((abilities.length - abilitiesMapped)/abilities.length*100)}%)`);
  
  // Units
  const unitsWithIconPath = units.filter(u => u.iconPath).length;
  const unitsMapped = units.filter(u => iconMap.units[u.name]).length;
  console.log(`\nUnits:`);
  console.log(`   Total: ${units.length}`);
  console.log(`   With iconPath in data: ${unitsWithIconPath} (${Math.round(unitsWithIconPath/units.length*100)}%)`);
  console.log(`   Mapped in ICON_MAP: ${unitsMapped} (${Math.round(unitsMapped/units.length*100)}%)`);
  console.log(`   Unmapped: ${units.length - unitsMapped} (${Math.round((units.length - unitsMapped)/units.length*100)}%)`);
  
  // Classes
  const classesWithIconSrc = classes.filter(c => c.iconSrc).length;
  const classesMapped = classes.filter(c => iconMap.trolls[c.name]).length;
  console.log(`\nBase Classes:`);
  console.log(`   Total: ${classes.length}`);
  console.log(`   With iconSrc in data: ${classesWithIconSrc} (${Math.round(classesWithIconSrc/classes.length*100)}%)`);
  console.log(`   Mapped in ICON_MAP: ${classesMapped} (${Math.round(classesMapped/classes.length*100)}%)`);
  console.log(`   Unmapped: ${classes.length - classesMapped} (${Math.round((classes.length - classesMapped)/classes.length*100)}%)`);
  
  // Derived Classes
  const derivedWithIconSrc = derivedClasses.filter(c => c.iconSrc).length;
  const derivedMapped = derivedClasses.filter(c => iconMap.trolls[c.name]).length;
  console.log(`\nDerived Classes:`);
  console.log(`   Total: ${derivedClasses.length}`);
  console.log(`   With iconSrc in data: ${derivedWithIconSrc} (${Math.round(derivedWithIconSrc/derivedClasses.length*100)}%)`);
  console.log(`   Mapped in ICON_MAP: ${derivedMapped} (${Math.round(derivedMapped/derivedClasses.length*100)}%)`);
  console.log(`   Unmapped: ${derivedClasses.length - derivedMapped} (${Math.round((derivedClasses.length - derivedMapped)/derivedClasses.length*100)}%)`);
  
  // Show some unmapped examples
  console.log('\n🔍 Sample Unmapped Items (first 10):');
  const unmappedItems = items.filter(i => !iconMap.items[i.name]).slice(0, 10);
  unmappedItems.forEach(item => {
    console.log(`   - ${item.name}${item.iconPath ? ` (has iconPath: ${item.iconPath})` : ''}`);
  });
  
  console.log('\n🔍 Sample Unmapped Abilities (first 10):');
  const unmappedAbilities = abilities.filter(a => !iconMap.abilities[a.name]).slice(0, 10);
  unmappedAbilities.forEach(ability => {
    console.log(`   - ${ability.name}${ability.iconPath ? ` (has iconPath: ${ability.iconPath})` : ''}`);
  });
  
  console.log('\n✅ Analysis complete!\n');
}

main();

