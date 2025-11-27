/**
 * Find duplicate units in allUnits.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..', '..');
const UNITS_FILE = path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'data', 'units', 'allUnits.ts');

const content = fs.readFileSync(UNITS_FILE, 'utf-8');

// Parse units from the file
const units = [];
const unitMatches = content.matchAll(/\{\s*id:\s*['"]([^'"]+)['"],\s*name:\s*['"]([^'"]+)['"][\s\S]*?type:\s*['"]([^'"]+)['"]/g);

for (const match of unitMatches) {
  units.push({
    id: match[1],
    name: match[2],
    type: match[3],
  });
}

// Find duplicates by name
const nameMap = {};
const idMap = {};

units.forEach(unit => {
  if (!nameMap[unit.name]) nameMap[unit.name] = [];
  nameMap[unit.name].push(unit);
  
  if (!idMap[unit.id]) idMap[unit.id] = [];
  idMap[unit.id].push(unit);
});

const duplicateNames = Object.entries(nameMap).filter(([name, arr]) => arr.length > 1);
const duplicateIds = Object.entries(idMap).filter(([id, arr]) => arr.length > 1);

// Filter to trolls only
const trollDuplicateNames = duplicateNames.filter(([name, arr]) => arr.some(u => u.type === 'troll'));
const trollDuplicateIds = duplicateIds.filter(([id, arr]) => arr.some(u => u.type === 'troll'));

const trollUnits = units.filter(u => u.type === 'troll');

console.log(`Total troll units: ${trollUnits.length}`);
console.log(`Unique troll names: ${new Set(trollUnits.map(u => u.name)).size}`);
console.log(`Unique troll IDs: ${new Set(trollUnits.map(u => u.id)).size}\n`);

if (trollDuplicateNames.length > 0) {
  console.log(`Duplicate troll names (${trollDuplicateNames.length}):`);
  trollDuplicateNames.forEach(([name, arr]) => {
    const trolls = arr.filter(u => u.type === 'troll');
    if (trolls.length > 1) {
      console.log(`  "${name}" (${trolls.length} times)`);
      trolls.forEach(t => console.log(`    - ID: ${t.id}`));
    }
  });
}

if (trollDuplicateIds.length > 0) {
  console.log(`\nDuplicate troll IDs (${trollDuplicateIds.length}):`);
  trollDuplicateIds.forEach(([id, arr]) => {
    const trolls = arr.filter(u => u.type === 'troll');
    if (trolls.length > 1) {
      console.log(`  "${id}" (${trolls.length} times)`);
      trolls.forEach(t => console.log(`    - Name: ${t.name}`));
    }
  });
}

if (trollDuplicateNames.length === 0 && trollDuplicateIds.length === 0) {
  console.log('No duplicate trolls found!');
}


