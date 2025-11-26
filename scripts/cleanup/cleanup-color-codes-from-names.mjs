/**
 * Clean up color codes from ability and item names in the TypeScript database
 * Strips Warcraft 3 color codes (|cffRRGGBB, |r, |n) from names
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..', '..');
const ABILITIES_DIR = path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'data', 'abilities');
const ITEMS_DIR = path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'data', 'items');

/**
 * Strip Warcraft 3 color codes from text
 */
function stripColorCodes(str) {
  if (!str) return '';
  return str.replace(/\|cff[0-9a-fA-F]{6}/g, '').replace(/\|r/g, '').replace(/\|n/g, ' ').trim();
}

/**
 * Clean color codes from a TypeScript file
 */
function cleanColorCodesFromFile(filePath, isAbility = true) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Extract constant name
  const constMatch = content.match(/export const (\w+)/);
  if (!constMatch) {
    console.warn(`  ⚠️  Could not find constant name in ${path.basename(filePath)}`);
    return 0;
  }
  
  const constName = constMatch[1];
  const typeName = isAbility ? 'AbilityData' : 'ItemData';
  
  // Find all name fields and clean them
  let cleanedContent = content;
  let cleanedCount = 0;
  
  // Match name: '...' patterns, handling escaped quotes
  const nameRegex = /name:\s*(['"])((?:\\.|(?!\1).)*)\1/g;
  let match;
  
  while ((match = nameRegex.exec(content)) !== null) {
    const fullMatch = match[0];
    const quote = match[1];
    const nameValue = match[2].replace(/\\(.)/g, '$1'); // Unescape
    
    // Check if it contains color codes
    if (nameValue.includes('|cff') || nameValue.includes('|r') || nameValue.includes('|n')) {
      const cleanedName = stripColorCodes(nameValue);
      const escapedCleaned = cleanedName.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      const newMatch = `name: ${quote}${escapedCleaned}${quote}`;
      
      cleanedContent = cleanedContent.replace(fullMatch, newMatch);
      cleanedCount++;
    }
  }
  
  if (cleanedCount > 0) {
    fs.writeFileSync(filePath, cleanedContent, 'utf-8');
    console.log(`  ✅ Cleaned ${cleanedCount} names in ${path.basename(filePath)}`);
  }
  
  return cleanedCount;
}

/**
 * Main cleanup function
 */
function main() {
  console.log('🧹 Cleaning color codes from names...\n');
  
  // Clean abilities
  console.log('Cleaning abilities...');
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
    'unknown.ts',
  ];
  
  let totalAbilitiesCleaned = 0;
  for (const filename of abilityFiles) {
    const filePath = path.join(ABILITIES_DIR, filename);
    if (!fs.existsSync(filePath)) continue;
    totalAbilitiesCleaned += cleanColorCodesFromFile(filePath, true);
  }
  
  // Clean items
  console.log('\nCleaning items...');
  const itemFiles = [
    'raw-materials.ts',
    'weapons.ts',
    'armor.ts',
    'potions.ts',
    'scrolls.ts',
    'buildings.ts',
    'unknown.ts',
  ];
  
  let totalItemsCleaned = 0;
  for (const filename of itemFiles) {
    const filePath = path.join(ITEMS_DIR, filename);
    if (!fs.existsSync(filePath)) continue;
    totalItemsCleaned += cleanColorCodesFromFile(filePath, false);
  }
  
  console.log(`\n✅ Cleanup complete!`);
  console.log(`  Cleaned ${totalAbilitiesCleaned} ability names`);
  console.log(`  Cleaned ${totalItemsCleaned} item names`);
}

main();

