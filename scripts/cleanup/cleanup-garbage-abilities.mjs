/**
 * Clean up garbage/internal abilities from the TypeScript database
 * Removes abilities with names that look like internal IDs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..', '..');
const ABILITIES_DIR = path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'data', 'abilities');

/**
 * Check if an ability name looks like an internal/garbage identifier
 */
function isGarbageAbilityName(name) {
  if (!name || name.length < 2) return true;
  
  const trimmed = name.trim();
  
  // Very short names (1-2 chars) are likely garbage
  if (trimmed.length <= 2) return true;
  
  // Names with colons and letters/numbers (internal IDs like "AMha:Aro1", "$wsl:ANcl", "AM02:Sca1")
  // Pattern: starts with uppercase letters, optionally followed by lowercase/numbers, then colon/pipe
  if (/^[A-Z]{2,}[A-Za-z0-9]*[:|][A-Za-z0-9]/.test(trimmed)) return true;
  
  // Names starting with $ followed by lowercase (internal refs like "$wsl:ANcl")
  if (/^\$[a-z]/.test(trimmed)) return true;
  
  // All caps with numbers and special chars, very short (like "AM02", "AM7|")
  if (/^[A-Z0-9|:]{2,6}$/.test(trimmed) && trimmed.length <= 6) return true;
  
  // Single character or just numbers
  if (/^[0-9]$/.test(trimmed)) return true;
  
  return false;
}

/**
 * Parse and filter abilities from a TypeScript file
 */
function parseAndFilterAbilities(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Extract the constant name
  const constMatch = content.match(/export const (\w+_ABILITIES)/);
  if (!constMatch) {
    console.warn(`  ⚠️  Could not find constant name in ${path.basename(filePath)}`);
    return null;
  }
  
  const constName = constMatch[1];
  
  // Extract all ability objects
  const arrayMatch = content.match(/export const \w+_ABILITIES[^=]*=\s*\[([\s\S]*?)\];/);
  if (!arrayMatch) {
    console.warn(`  ⚠️  Could not find abilities array in ${path.basename(filePath)}`);
    return null;
  }
  
  const arrayContent = arrayMatch[1];
  const abilityMatches = arrayContent.matchAll(/\{([\s\S]*?)\}(?=\s*,|\s*$)/g);
  
  const abilities = [];
  let removedCount = 0;
  
  for (const match of abilityMatches) {
    const objContent = match[1];
    
    // Extract name
    const nameMatch = objContent.match(/name:\s*(['"])((?:\\.|(?!\1).)*)\1/);
    if (!nameMatch) continue;
    
    const name = nameMatch[2].replace(/\\(.)/g, '$1'); // Unescape
    
    // Check if it's garbage
    if (isGarbageAbilityName(name)) {
      removedCount++;
      continue;
    }
    
    // Keep the ability - preserve the full object
    abilities.push(match[0]);
  }
  
  if (removedCount > 0) {
    console.log(`  ✅ Removed ${removedCount} garbage abilities from ${path.basename(filePath)}`);
  }
  
  return {
    constName,
    abilities,
    removedCount
  };
}

/**
 * Write filtered abilities back to file
 */
function writeFilteredAbilities(filePath, constName, abilities) {
  const hasTypeImport = fs.readFileSync(filePath, 'utf-8').includes("import type { AbilityData }");
  const typeImport = hasTypeImport ? "import type { AbilityData } from './types';\n\n" : "";
  
  const content = typeImport +
    `export const ${constName}: AbilityData[] = [\n` +
    abilities.map(ability => '  ' + ability).join(',\n') +
    '\n];\n';
  
  fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * Main cleanup function
 */
function main() {
  console.log('🧹 Cleaning up garbage abilities from database...\n');
  
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
  
  let totalRemoved = 0;
  
  for (const filename of abilityFiles) {
    const filePath = path.join(ABILITIES_DIR, filename);
    if (!fs.existsSync(filePath)) {
      console.log(`  ⏭️  Skipping ${filename} (not found)`);
      continue;
    }
    
    const result = parseAndFilterAbilities(filePath);
    if (!result) continue;
    
    if (result.removedCount > 0) {
      writeFilteredAbilities(filePath, result.constName, result.abilities);
      totalRemoved += result.removedCount;
    } else {
      console.log(`  ✓ ${filename} (no garbage found)`);
    }
  }
  
  console.log(`\n✅ Cleanup complete! Removed ${totalRemoved} garbage abilities total.`);
}

main();

