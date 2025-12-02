// Script to analyze entities and icon mappings
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the icon map manually by parsing the file
const iconMapPath = path.join(__dirname, 'src/features/modules/guides/data/iconMap.ts');
const iconMapContent = fs.readFileSync(iconMapPath, 'utf8');

// Parse the ICON_MAP manually
const ICON_MAP = {
  abilities: {},
  items: {},
  buildings: {},
  trolls: {},
  units: {}
};

// Extract abilities section
const abilitiesMatch = iconMapContent.match(/abilities: \{\s*([^}]+)\s*\}/);
if (abilitiesMatch) {
  const abilitiesStr = abilitiesMatch[1];
  const lines = abilitiesStr.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//'));
  lines.forEach(line => {
    const match = line.match(/['"]([^'"]+)['"]:\s*['"]([^'"]+\.png)['"]/);
    if (match) {
      ICON_MAP.abilities[match[1]] = match[2];
    }
  });
}

// Extract items section
const itemsMatch = iconMapContent.match(/items: \{\s*([^}]+)\s*\}/);
if (itemsMatch) {
  const itemsStr = itemsMatch[1];
  const lines = itemsStr.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//'));
  lines.forEach(line => {
    const match = line.match(/['"]([^'"]+)['"]:\s*['"]([^'"]+\.png)['"]/);
    if (match) {
      ICON_MAP.items[match[1]] = match[2];
    }
  });
}

// Extract buildings section
const buildingsMatch = iconMapContent.match(/buildings: \{\s*([^}]+)\s*\}/);
if (buildingsMatch) {
  const buildingsStr = buildingsMatch[1];
  const lines = buildingsStr.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//'));
  lines.forEach(line => {
    const match = line.match(/['"]([^'"]+)['"]:\s*['"]([^'"]+\.png)['"]/);
    if (match) {
      ICON_MAP.buildings[match[1]] = match[2];
    }
  });
}

// Extract trolls section
const trollsMatch = iconMapContent.match(/trolls: \{\s*([^}]+)\s*\}/);
if (trollsMatch) {
  const trollsStr = trollsMatch[1];
  const lines = trollsStr.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//'));
  lines.forEach(line => {
    const match = line.match(/['"]([^'"]+)['"]:\s*['"]([^'"]+\.png)['"]/);
    if (match) {
      ICON_MAP.trolls[match[1]] = match[2];
    }
  });
}

// Extract units section
const unitsMatch = iconMapContent.match(/units: \{\s*([^}]+)\s*\}/);
if (unitsMatch) {
  const unitsStr = unitsMatch[1];
  const lines = unitsStr.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//'));
  lines.forEach(line => {
    const match = line.match(/['"]([^'"]+)['"]:\s*['"]([^'"]+\.png)['"]/);
    if (match) {
      ICON_MAP.units[match[1]] = match[2];
    }
  });
}

// Load available icons
const iconsDir = path.join(__dirname, 'public/icons/itt');
const availableIcons = new Set();

try {
  const files = fs.readdirSync(iconsDir);
  files.forEach(file => {
    if (file.endsWith('.png')) {
      availableIcons.add(file);
    }
  });
} catch (error) {
  console.error('Error reading icons directory:', error);
}

// Load abilities - try a different approach by checking individual files
const abilitiesDir = path.join(__dirname, 'src/features/modules/guides/data/abilities');
const abilityNames = [];

// Read all ability files
const abilityFiles = [
  'basic.ts', 'beastmaster.ts', 'gatherer.ts', 'hunter.ts', 'item.ts',
  'mage.ts', 'priest.ts', 'scout.ts', 'thief.ts', 'building.ts',
  'bonushandler.ts', 'buff.ts', 'auradummy.ts', 'unknown.ts'
];

abilityFiles.forEach(file => {
  try {
    const filePath = path.join(abilitiesDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const nameMatches = content.match(/name:\s*['"]([^'"]+)['"]/g);
    if (nameMatches) {
      nameMatches.forEach(match => {
        const name = match.match(/name:\s*['"]([^'"]+)['"]/)[1];
        abilityNames.push(name);
      });
    }
  } catch (error) {
    // Skip files that don't exist
  }
});

// Load troll classes
const classesPath = path.join(__dirname, 'src/features/modules/guides/data/units/classes.ts');
const classesContent = fs.readFileSync(classesPath, 'utf8');

const baseClassNames = [];
const baseNameMatches = classesContent.match(/name:\s*['"]([^'"]+)['"]/g);
if (baseNameMatches) {
  baseNameMatches.forEach(match => {
    const name = match.match(/name:\s*['"]([^'"]+)['"]/)[1];
    baseClassNames.push(name);
  });
}

// Load derived classes
const derivedClassesPath = path.join(__dirname, 'src/features/modules/guides/data/units/derivedClasses.ts');
const derivedClassesContent = fs.readFileSync(derivedClassesPath, 'utf8');

const derivedClassNames = [];
const derivedNameMatches = derivedClassesContent.match(/name:\s*['"]([^'"]+)['"]/g);
if (derivedNameMatches) {
  derivedNameMatches.forEach(match => {
    const name = match.match(/name:\s*['"]([^'"]+)['"]/)[1];
    derivedClassNames.push(name);
  });
}

// For items, we'll need to check the API or look at the types
// For now, let's use what's mapped in the iconMap

console.log('=== ENTITIES WITHOUT ICON MAPPINGS ===\n');

// Check abilities
const mappedAbilities = new Set(Object.keys(ICON_MAP.abilities));
const unmappedAbilities = abilityNames.filter(name => !mappedAbilities.has(name));
console.log('Unmapped Abilities:');
unmappedAbilities.forEach(name => console.log(`- ${name}`));
console.log(`Total unmapped abilities: ${unmappedAbilities.length}/${abilityNames.length}\n`);

// Check trolls (from trolls mapping)
const mappedTrolls = new Set(Object.keys(ICON_MAP.trolls));
const allTrollNames = [...baseClassNames, ...derivedClassNames];
const unmappedTrolls = allTrollNames.filter(name => !mappedTrolls.has(name));
console.log('Unmapped Trolls (trolls category):');
unmappedTrolls.forEach(name => console.log(`- ${name}`));
console.log(`Total unmapped trolls: ${unmappedTrolls.length}/${allTrollNames.length}\n`);

// Check units (from units mapping)
const mappedUnits = new Set(Object.keys(ICON_MAP.units));
const unmappedUnits = allTrollNames.filter(name => !mappedUnits.has(name));
console.log('Unmapped Units (units category):');
unmappedUnits.forEach(name => console.log(`- ${name}`));
console.log(`Total unmapped units: ${unmappedUnits.length}/${allTrollNames.length}\n`);

// Check items and buildings from mappings (since we can't easily load the API data)
const mappedItems = new Set(Object.keys(ICON_MAP.items));
const mappedBuildings = new Set(Object.keys(ICON_MAP.buildings));
// We can't easily get the full list of items without the API, so we'll focus on what's already mapped

console.log('=== ENTITIES WITH MAPPINGS BUT MISSING ICONS ===\n');

// Check abilities
console.log('Abilities with missing icons:');
Object.entries(ICON_MAP.abilities).forEach(([name, icon]) => {
  if (!availableIcons.has(icon)) {
    console.log(`- "${name}" -> ${icon}`);
  }
});

// Check items
console.log('\nItems with missing icons:');
Object.entries(ICON_MAP.items).forEach(([name, icon]) => {
  if (!availableIcons.has(icon)) {
    console.log(`- "${name}" -> ${icon}`);
  }
});

// Check buildings
console.log('\nBuildings with missing icons:');
Object.entries(ICON_MAP.buildings).forEach(([name, icon]) => {
  if (!availableIcons.has(icon)) {
    console.log(`- "${name}" -> ${icon}`);
  }
});

// Check trolls/units
console.log('\nTrolls with missing icons:');
Object.entries(ICON_MAP.trolls).forEach(([name, icon]) => {
  if (!availableIcons.has(icon)) {
    console.log(`- "${name}" -> ${icon}`);
  }
});

// Check units
console.log('\nUnits with missing icons:');
Object.entries(ICON_MAP.units).forEach(([name, icon]) => {
  if (!availableIcons.has(icon)) {
    console.log(`- "${name}" -> ${icon}`);
  }
});

console.log('\n=== SUMMARY ===');
console.log(`Available icons: ${availableIcons.size}`);
console.log(`Mapped abilities: ${Object.keys(ICON_MAP.abilities).length}`);
console.log(`Mapped items: ${Object.keys(ICON_MAP.items).length}`);
console.log(`Mapped buildings: ${Object.keys(ICON_MAP.buildings).length}`);
console.log(`Mapped trolls: ${Object.keys(ICON_MAP.trolls).length}`);
console.log(`Mapped units: ${Object.keys(ICON_MAP.units).length}`);
