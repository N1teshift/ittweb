import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Load all icon filenames
function loadIcons() {
  const itemsDir = join(rootDir, 'public', 'icons', 'itt', 'items');
  const abilitiesDir = join(rootDir, 'public', 'icons', 'itt', 'abilities');
  
  const itemIcons = readdirSync(itemsDir)
    .filter(f => f.endsWith('.png'))
    .map(f => f.toLowerCase());
  
  const abilityIcons = readdirSync(abilitiesDir)
    .filter(f => f.endsWith('.png'))
    .map(f => f.toLowerCase());
  
  // Combine and deduplicate
  const allIcons = [...new Set([...itemIcons, ...abilityIcons])];
  
  return { itemIcons, abilityIcons, allIcons };
}

// Normalize strings for matching
function normalize(str) {
  return str
    .toLowerCase()
    .replace(/[|]/g, '')
    .replace(/cff[0-9a-fA-F]{6}/g, '') // Remove color codes
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

// Extract key words from a name for matching
function extractKeywords(name) {
  const normalized = normalize(name);
  // Split on common separators and get meaningful words
  const words = normalized
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/[\s\-_]+/)
    .filter(w => w.length > 2);
  return words;
}

// Find best matching icon
function findBestMatch(name, icons, category = 'items') {
  const normalizedName = normalize(name);
  const keywords = extractKeywords(name);
  
  // Direct match
  for (const icon of icons) {
    const iconBase = icon.replace('.png', '').toLowerCase();
    if (normalizedName.includes(iconBase) || iconBase.includes(normalizedName)) {
      return icon;
    }
  }
  
  // Keyword matching
  let bestMatch = null;
  let bestScore = 0;
  
  for (const icon of icons) {
    const iconBase = icon.replace('.png', '').toLowerCase();
    let score = 0;
    
    for (const keyword of keywords) {
      if (iconBase.includes(keyword) || keyword.includes(iconBase)) {
        score += keyword.length;
      }
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = icon;
    }
  }
  
  return bestMatch;
}

// Load items data
function loadItems() {
  const itemsIndex = readFileSync(
    join(rootDir, 'src', 'features', 'ittweb', 'guides', 'data', 'items', 'index.ts'),
    'utf-8'
  );
  
  // We need to import and evaluate the items
  // For now, let's read the individual files
  const itemFiles = [
    'raw-materials.ts',
    'weapons.ts',
    'armor.ts',
    'potions.ts',
    'scrolls.ts',
    'buildings.ts',
    'unknown.ts'
  ];
  
  const allItems = [];
  
  for (const file of itemFiles) {
    try {
      const content = readFileSync(
        join(rootDir, 'src', 'features', 'ittweb', 'guides', 'data', 'items', file),
        'utf-8'
      );
      
      // Extract item definitions using regex (simple approach)
      const itemMatches = content.matchAll(/name:\s*['"]([^'"]+)['"]/g);
      const iconMatches = content.matchAll(/iconPath:\s*['"]([^'"]+)['"]/g);
      
      // More sophisticated: extract full item objects
      const itemBlocks = content.match(/\{[^}]*id:\s*['"]([^'"]+)['"][^}]*name:\s*['"]([^'"]+)['"][^}]*\}/gs);
      
      if (itemBlocks) {
        for (const block of itemBlocks) {
          const idMatch = block.match(/id:\s*['"]([^'"]+)['"]/);
          const nameMatch = block.match(/name:\s*['"]([^'"]+)['"]/);
          const iconMatch = block.match(/iconPath:\s*['"]([^'"]+)['"]/);
          
          if (idMatch && nameMatch) {
            allItems.push({
              id: idMatch[1],
              name: nameMatch[1],
              iconPath: iconMatch ? iconMatch[1] : null
            });
          }
        }
      }
    } catch (err) {
      console.warn(`Could not read ${file}:`, err.message);
    }
  }
  
  return allItems;
}

// Load abilities data
function loadAbilities() {
  const abilityFiles = [
    'basic.ts',
    'hunter.ts',
    'beastmaster.ts',
    'mage.ts',
    'priest.ts',
    'thief.ts',
    'scout.ts',
    'gatherer.ts',
    'item.ts',
    'building.ts',
    'unknown.ts'
  ];
  
  const allAbilities = [];
  
  for (const file of abilityFiles) {
    try {
      const content = readFileSync(
        join(rootDir, 'src', 'features', 'ittweb', 'guides', 'data', 'abilities', file),
        'utf-8'
      );
      
      const itemBlocks = content.match(/\{[^}]*id:\s*['"]([^'"]+)['"][^}]*name:\s*['"]([^'"]+)['"][^}]*\}/gs);
      
      if (itemBlocks) {
        for (const block of itemBlocks) {
          const idMatch = block.match(/id:\s*['"]([^'"]+)['"]/);
          const nameMatch = block.match(/name:\s*['"]([^'"]+)['"]/);
          const iconMatch = block.match(/iconPath:\s*['"]([^'"]+)['"]/);
          
          if (idMatch && nameMatch) {
            allAbilities.push({
              id: idMatch[1],
              name: nameMatch[1],
              iconPath: iconMatch ? iconMatch[1] : null
            });
          }
        }
      }
    } catch (err) {
      console.warn(`Could not read ${file}:`, err.message);
    }
  }
  
  return allAbilities;
}

// Main execution
const { itemIcons, abilityIcons, allIcons } = loadIcons();
const items = loadItems();
const abilities = loadAbilities();

console.log(`Loaded ${items.length} items, ${abilities.length} abilities`);
console.log(`Available icons: ${allIcons.length} total (${itemIcons.length} items, ${abilityIcons.length} abilities)`);

// Find items without icons
const itemsWithoutIcons = items.filter(item => !item.iconPath);
const abilitiesWithoutIcons = abilities.filter(ability => !ability.iconPath);

console.log(`\nItems without icons: ${itemsWithoutIcons.length}`);
console.log(`Abilities without icons: ${abilitiesWithoutIcons.length}`);

// Generate mappings
const itemMappings = {};
const abilityMappings = {};

for (const item of itemsWithoutIcons) {
  const match = findBestMatch(item.name, allIcons, 'items');
  if (match) {
    // Find the original case filename
    const originalIcon = allIcons.find(icon => icon.toLowerCase() === match.toLowerCase()) || match;
    itemMappings[item.name] = originalIcon;
  }
}

for (const ability of abilitiesWithoutIcons) {
  const match = findBestMatch(ability.name, allIcons, 'abilities');
  if (match) {
    const originalIcon = allIcons.find(icon => icon.toLowerCase() === match.toLowerCase()) || match;
    abilityMappings[ability.name] = originalIcon;
  }
}

console.log(`\nGenerated ${Object.keys(itemMappings).length} item mappings`);
console.log(`Generated ${Object.keys(abilityMappings).length} ability mappings`);

// Read current iconMap
const iconMapPath = join(rootDir, 'src', 'features', 'ittweb', 'guides', 'utils', 'iconMap.ts');
const currentIconMap = readFileSync(iconMapPath, 'utf-8');

// Extract existing mappings
const existingItemMatches = currentIconMap.match(/items:\s*\{([^}]+)\}/s);
const existingAbilityMatches = currentIconMap.match(/abilities:\s*\{([^}]+)\}/s);

// Generate new mappings output
let newItemMappings = '';
let newAbilityMappings = '';

for (const [name, icon] of Object.entries(itemMappings)) {
  const escapedName = name.replace(/'/g, "\\'");
  newItemMappings += `    '${escapedName}': '${icon}',\n`;
}

for (const [name, icon] of Object.entries(abilityMappings)) {
  const escapedName = name.replace(/'/g, "\\'");
  newAbilityMappings += `    '${escapedName}': '${icon}',\n`;
}

// Write report
const reportPath = join(rootDir, 'icon-mapping-report.txt');
const report = `
Icon Mapping Report
===================

Items without icons: ${itemsWithoutIcons.length}
Abilities without icons: ${abilitiesWithoutIcons.length}

Generated Item Mappings (${Object.keys(itemMappings).length}):
${Object.entries(itemMappings).map(([name, icon]) => `  ${name} -> ${icon}`).join('\n')}

Generated Ability Mappings (${Object.keys(abilityMappings).length}):
${Object.entries(abilityMappings).map(([name, icon]) => `  ${name} -> ${icon}`).join('\n')}
`;

writeFileSync(reportPath, report);
console.log(`\nReport written to ${reportPath}`);

// Show sample mappings
console.log('\nSample item mappings:');
Object.entries(itemMappings).slice(0, 10).forEach(([name, icon]) => {
  console.log(`  ${name} -> ${icon}`);
});

console.log('\nSample ability mappings:');
Object.entries(abilityMappings).slice(0, 10).forEach(([name, icon]) => {
  console.log(`  ${name} -> ${icon}`);
});

console.log('\nTo update iconMap.ts, you can manually add these mappings or run an update script.');


