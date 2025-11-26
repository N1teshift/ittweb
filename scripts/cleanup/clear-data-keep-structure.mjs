/**
 * Clear all data while preserving skeleton structure
 * This keeps the file structure, types, exports, and utility functions
 * but removes all actual data entries
 * 
 * Usage: node scripts/clear-data-keep-structure.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..', '..');
const DATA_DIR = path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'data');

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

function writeText(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

/**
 * Clear items data - keep structure
 */
function clearItemsData() {
  const itemsDir = path.join(DATA_DIR, 'items');
  const itemFiles = [
    { file: 'scrolls.ts', constName: 'SCROLL_ITEMS' },
    { file: 'weapons.ts', constName: 'WEAPON_ITEMS' },
    { file: 'armor.ts', constName: 'ARMOR_ITEMS' },
    { file: 'potions.ts', constName: 'POTION_ITEMS' },
    { file: 'raw-materials.ts', constName: 'RAW_MATERIAL_ITEMS' },
    { file: 'buildings.ts', constName: 'BUILDINGS_ITEMS' },
    { file: 'unknown.ts', constName: 'UNKNOWN_ITEMS' },
  ];
  
  for (const { file: filename, constName: defaultConstName } of itemFiles) {
    const filePath = path.join(itemsDir, filename);
    
    // If file doesn't exist, create it with empty structure
    const content = fs.existsSync(filePath) ? readText(filePath) : '';
    
    // Extract constant name from file, or use default
    const constMatch = content.match(/export\s+const\s+([A-Z_]+)\s*:/);
    const constName = constMatch ? constMatch[1] : defaultConstName;
    
    // Generate empty array structure
    const newContent = `import type { ItemData } from '@/types/items';\n\n` +
      `export const ${constName}: ItemData[] = [\n];\n`;
    
    writeText(filePath, newContent);
    console.log(`  Cleared ${filename}`);
  }
}

/**
 * Clear abilities data - keep structure
 */
function clearAbilitiesData() {
  const abilitiesDir = path.join(DATA_DIR, 'abilities');
  const abilityFiles = [
    'basic.ts',
    'beastmaster.ts',
    'gatherer.ts',
    'hunter.ts',
    'item.ts',
    'mage.ts',
    'priest.ts',
    'scout.ts',
    'thief.ts',
    'unknown.ts',
  ];
  
  for (const filename of abilityFiles) {
    const filePath = path.join(abilitiesDir, filename);
    if (!fs.existsSync(filePath)) continue;
    
    const content = readText(filePath);
    
    // Extract constant name
    const constMatch = content.match(/export\s+const\s+([A-Z_]+)\s*:/);
    if (!constMatch) continue;
    
    const constName = constMatch[1];
    
    // Check if it imports AbilityData type
    const hasTypeImport = content.includes("import type { AbilityData }");
    const typeImport = hasTypeImport ? "import type { AbilityData } from './types';\n\n" : "";
    
    // Generate empty array structure
    const newContent = typeImport +
      `export const ${constName}: AbilityData[] = [\n];\n`;
    
    writeText(filePath, newContent);
    console.log(`  Cleared ${filename}`);
  }
}

/**
 * Clear units data - keep structure
 */
function clearUnitsData() {
  const unitsDir = path.join(DATA_DIR, 'units');
  const unitFiles = ['classes.ts', 'derivedClasses.ts'];
  
  for (const filename of unitFiles) {
    const filePath = path.join(unitsDir, filename);
    if (!fs.existsSync(filePath)) continue;
    
    const content = readText(filePath);
    
    // Extract type and constant names
    const typeMatch = content.match(/export\s+type\s+(\w+)\s*=/);
    const constMatch = content.match(/export\s+const\s+([A-Z_]+)\s*:/);
    
    if (filename === 'classes.ts') {
      // Keep the type definition, clear the array
      const typeDef = typeMatch ? content.substring(0, content.indexOf('export const')) : '';
      const constName = constMatch ? constMatch[1] : 'BASE_TROLL_CLASSES';
      
      const newContent = typeDef +
        `export const ${constName}: TrollClassData[] = [\n];\n`;
      
      writeText(filePath, newContent);
      console.log(`  Cleared ${filename}`);
    } else if (filename === 'derivedClasses.ts') {
      // Similar for derived classes
      const typeDef = typeMatch ? content.substring(0, content.indexOf('export const')) : '';
      const constName = constMatch ? constMatch[1] : 'DERIVED_TROLL_CLASSES';
      
      const newContent = typeDef +
        `export const ${constName}: TrollClassData[] = [\n];\n`;
      
      writeText(filePath, newContent);
      console.log(`  Cleared ${filename}`);
    }
  }
}

/**
 * Clear buildings data - keep structure
 */
function clearBuildingsData() {
  const buildingsFile = path.join(DATA_DIR, 'buildings', 'index.ts');
  
  if (!fs.existsSync(buildingsFile)) return;
  
  const content = readText(buildingsFile);
  
  // Extract type and constant
  const typeMatch = content.match(/export\s+type\s+(\w+)\s*=\s*\{[\s\S]*?\};/);
  const constMatch = content.match(/export\s+const\s+(\w+)\s*:/);
  const funcMatch = content.match(/export\s+function\s+(\w+)\([^)]*\)[^{]*\{[\s\S]*?\n\}/g);
  
  const typeDef = typeMatch ? typeMatch[0] + '\n\n' : '';
  const constName = constMatch ? constMatch[1] : 'BUILDINGS';
  const functions = funcMatch ? '\n\n' + funcMatch.join('\n\n') : '';
  
  const newContent = typeDef +
    `export const ${constName}: BuildingData[] = [\n];` +
    functions + '\n';
  
  writeText(buildingsFile, newContent);
  console.log(`  Cleared buildings/index.ts`);
}

function main() {
  console.log('Clearing data while preserving structure...\n');
  
  console.log('Clearing items data...');
  clearItemsData();
  console.log('');
  
  console.log('Clearing abilities data...');
  clearAbilitiesData();
  console.log('');
  
  console.log('Clearing units data...');
  clearUnitsData();
  console.log('');
  
  console.log('Clearing buildings data...');
  clearBuildingsData();
  console.log('');
  
  console.log('Done! All data cleared, structure preserved.');
  console.log('\nNote: Index files and utility functions are preserved.');
  console.log('You can now re-extract data with precision.');
}

main();

