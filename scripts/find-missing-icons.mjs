import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

// Directories
const ittIconsDir = resolve(projectRoot, 'public/icons/itt');
const itemsDir = resolve(projectRoot, 'src/features/modules/guides/data/items');
const abilitiesDir = resolve(projectRoot, 'src/features/modules/guides/data/abilities');
const unitsFile = resolve(projectRoot, 'src/features/modules/guides/data/units/allUnits.ts');

// Get all existing icon files (case-insensitive lookup)
function getExistingIcons() {
  const icons = new Map(); // lowercase -> actual filename
  if (!existsSync(ittIconsDir)) return icons;
  
  const files = readdirSync(ittIconsDir);
  for (const file of files) {
    if (file.toLowerCase().endsWith('.png')) {
      icons.set(file.toLowerCase(), file);
    }
  }
  return icons;
}

// Parse JavaScript string literal
function parseJSString(str) {
  if ((str.startsWith("'") && str.endsWith("'")) || (str.startsWith('"') && str.endsWith('"'))) {
    str = str.slice(1, -1);
  }
  return str.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\');
}

// Extract entities with their iconPath from TypeScript files
function extractEntitiesFromTS(content, type) {
  const entities = [];
  const arrayMatches = content.matchAll(/export const \w+[^=]*=\s*\[([\s\S]*?)\];/g);
  
  for (const arrayMatch of arrayMatches) {
    const arrayContent = arrayMatch[1];
    const objectMatches = arrayContent.matchAll(/\{([\s\S]*?)\}(?=\s*,|\s*$)/g);
    
    for (const match of objectMatches) {
      const objContent = match[1];
      
      const idMatch = objContent.match(/id:\s*(['"])((?:\\.|(?!\1).)*)\1/);
      if (!idMatch) continue;
      const id = parseJSString(idMatch[0].match(/id:\s*(['"].*?['"])/)[1]);
      
      const nameMatch = objContent.match(/name:\s*(['"])((?:\\.|(?!\1).)*)\1/);
      if (!nameMatch) continue;
      const name = parseJSString(nameMatch[0].match(/name:\s*(['"].*?['"])/)[1]);
      
      const iconMatch = objContent.match(/iconPath:\s*(['"])((?:\\.|(?!\1).)*)\1/);
      const iconPath = iconMatch ? parseJSString(iconMatch[0].match(/iconPath:\s*(['"].*?['"])/)[1]) : null;
      
      entities.push({ id, name, iconPath, type });
    }
  }
  
  return entities;
}

// Read all items
function readItems() {
  const items = [];
  if (!existsSync(itemsDir)) return items;
  
  const files = readdirSync(itemsDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');
  for (const file of files) {
    const content = readFileSync(resolve(itemsDir, file), 'utf-8');
    items.push(...extractEntitiesFromTS(content, 'item'));
  }
  return items;
}

// Read all abilities
function readAbilities() {
  const abilities = [];
  if (!existsSync(abilitiesDir)) return abilities;
  
  const files = readdirSync(abilitiesDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');
  for (const file of files) {
    const content = readFileSync(resolve(abilitiesDir, file), 'utf-8');
    abilities.push(...extractEntitiesFromTS(content, 'ability'));
  }
  return abilities;
}

// Read all units
function readUnits() {
  if (!existsSync(unitsFile)) return [];
  const content = readFileSync(unitsFile, 'utf-8');
  return extractEntitiesFromTS(content, 'unit');
}

// Convert WC3 icon path to filename
function getIconFilename(iconPath) {
  if (!iconPath) return null;
  // WC3 paths like "ReplaceableTextures\\CommandButtons\\BTNAcorn.blp"
  let filename = basename(iconPath.replace(/\\/g, '/'));
  // Replace .blp with .png
  filename = filename.replace(/\.blp$/i, '.png');
  return filename;
}

// Main
const existingIcons = getExistingIcons();
console.log(`📁 Found ${existingIcons.size} icons in public/icons/itt\n`);

// Gather all entities
const items = readItems();
const abilities = readAbilities();
const units = readUnits();
const allEntities = [...items, ...abilities, ...units];

console.log(`📦 Found ${items.length} items`);
console.log(`✨ Found ${abilities.length} abilities`);
console.log(`👤 Found ${units.length} units`);
console.log(`📊 Total: ${allEntities.length} entities\n`);

// Find missing icons
const missingIcons = new Map(); // iconFilename -> { entities, originalPath }

for (const entity of allEntities) {
  if (!entity.iconPath) continue;
  
  const iconFilename = getIconFilename(entity.iconPath);
  if (!iconFilename) continue;
  
  // Check if icon exists (case-insensitive)
  if (!existingIcons.has(iconFilename.toLowerCase())) {
    if (!missingIcons.has(iconFilename.toLowerCase())) {
      missingIcons.set(iconFilename.toLowerCase(), {
        filename: iconFilename,
        originalPath: entity.iconPath,
        entities: []
      });
    }
    missingIcons.get(iconFilename.toLowerCase()).entities.push({
      type: entity.type,
      id: entity.id,
      name: entity.name
    });
  }
}

// Sort by filename
const sortedMissing = Array.from(missingIcons.values()).sort((a, b) => 
  a.filename.localeCompare(b.filename)
);

console.log('=== MISSING ICONS REPORT ===');
console.log(`Missing icon files: ${sortedMissing.length}\n`);

if (sortedMissing.length > 0) {
  console.log('Detailed list:\n');
  for (const icon of sortedMissing) {
    console.log(`  ${icon.filename}`);
    console.log(`    Original path: ${icon.originalPath}`);
    const entitySummary = icon.entities.slice(0, 3)
      .map(e => `${e.type}: "${e.name}"`)
      .join(', ');
    const moreCount = icon.entities.length > 3 ? ` (+${icon.entities.length - 3} more)` : '';
    console.log(`    Used by: ${entitySummary}${moreCount}\n`);
  }
  
  console.log('\n=== SIMPLE LIST (copy-paste friendly) ===\n');
  for (const icon of sortedMissing) {
    console.log(icon.filename);
  }
  
  // Group by WC3 folder
  console.log('\n\n=== GROUPED BY WC3 FOLDER ===\n');
  const byFolder = new Map();
  for (const icon of sortedMissing) {
    const folder = dirname(icon.originalPath.replace(/\\/g, '/')).split('/').pop() || 'Unknown';
    if (!byFolder.has(folder)) byFolder.set(folder, []);
    byFolder.get(folder).push(icon.filename);
  }
  for (const [folder, icons] of byFolder) {
    console.log(`${folder}:`);
    for (const icon of icons) {
      console.log(`  ${icon}`);
    }
    console.log();
  }
} else {
  console.log('All referenced icons exist! 🎉');
}

