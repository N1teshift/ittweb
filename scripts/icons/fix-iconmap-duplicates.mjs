/**
 * Fix duplicate ICON_MAP declarations and duplicate keys
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..', '..');

const ICON_MAP_FILE = path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'utils', 'iconMap.ts');

function parseIconMap(content) {
  const iconMap = {
    abilities: {},
    items: {},
    buildings: {},
    trolls: {},
    units: {},
  };
  
  const categories = ['abilities', 'items', 'buildings', 'trolls', 'units'];
  
  for (const category of categories) {
    // Match category blocks, handling nested braces
    const categoryRegex = new RegExp(`${category}:\\s*\\{([\\s\\S]*?)\\}(?=\\s*[,}])`, 'g');
    let match;
    while ((match = categoryRegex.exec(content)) !== null) {
      const categoryContent = match[1];
      // Extract all key-value pairs
      const entryRegex = /'((?:[^'\\]|\\.)+)':\s*'((?:[^'\\]|\\.)+)'/g;
      let entryMatch;
      while ((entryMatch = entryRegex.exec(categoryContent)) !== null) {
        const key = entryMatch[1].replace(/\\'/g, "'").replace(/\\\\/g, "\\");
        const value = entryMatch[2].replace(/\\'/g, "'").replace(/\\\\/g, "\\");
        // Keep first occurrence if duplicate
        if (!iconMap[category][key]) {
          iconMap[category][key] = value;
        }
      }
    }
  }
  
  return iconMap;
}

function generateIconMap(iconMap) {
  const categories = ['abilities', 'items', 'buildings', 'trolls', 'units'];
  let content = `import { ITTIconCategory } from './iconUtils';

export type IconMap = {
  abilities: Record<string, string>;
  items: Record<string, string>;
  buildings: Record<string, string>;
  trolls: Record<string, string>;
  units: Record<string, string>;
};

// Central, explicit mapping (display name/id -> icon filename without path, with extension)
export const ICON_MAP: IconMap = {
`;
  
  for (const category of categories) {
    content += `  ${category}: {\n`;
    const entries = Object.entries(iconMap[category])
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => {
        // Properly escape: backslashes first, then quotes
        const escapedKey = key.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        const escapedValue = value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        return `    '${escapedKey}': '${escapedValue}'`;
      })
      .join(',\n');
    content += entries;
    content += '\n  },\n';
  }
  
  content += `};

export function resolveExplicitIcon(category: ITTIconCategory, key: string): string | undefined {
  // First, check the requested category
  const table = ICON_MAP[category];
  const filename = table[key];
  
  if (!filename) {
    // If not found in requested category, search all categories
    const allCategories: ITTIconCategory[] = ['abilities', 'items', 'buildings', 'trolls', 'units'];
    for (const cat of allCategories) {
      const catTable = ICON_MAP[cat];
      const foundFilename = catTable[key];
      if (foundFilename) {
        // Found the mapping, now determine which directory the file is in
        return findIconPath(foundFilename);
      }
    }
    return undefined;
  }
  
  // Found in requested category, determine which directory the file is actually in
  return findIconPath(filename);
}

/**
 * Finds the actual directory path for an icon filename.
 * Since icons can be shared across categories, we check which category
 * has this filename mapped and prefer items directory for shared icons.
 */
function findIconPath(filename: string): string {
  const allCategories: ITTIconCategory[] = ['items', 'abilities', 'buildings', 'trolls', 'units'];
  
  // Check each category to see if this filename is mapped there
  // Priority: items first (most shared icons are there), then others
  for (const cat of allCategories) {
    const catTable = ICON_MAP[cat];
    if (Object.values(catTable).includes(filename)) {
      return \`/icons/itt/\${cat}/\${filename}\`;
    }
  }
  
  // Fallback: if somehow not found, try items directory (most common)
  return \`/icons/itt/items/\${filename}\`;
}

`;
  
  return content;
}

function main() {
  console.log('🔧 Fixing duplicate ICON_MAP declarations and keys...\n');
  
  const content = fs.readFileSync(ICON_MAP_FILE, 'utf-8');
  
  // Parse all mappings (will merge duplicates, keeping first occurrence)
  console.log('📖 Parsing icon mappings...');
  const iconMap = parseIconMap(content);
  
  const totalMappings = Object.values(iconMap).reduce((sum, cat) => sum + Object.keys(cat).length, 0);
  console.log(`   Found ${totalMappings} total mappings`);
  console.log(`   Abilities: ${Object.keys(iconMap.abilities).length}`);
  console.log(`   Items: ${Object.keys(iconMap.items).length}`);
  console.log(`   Buildings: ${Object.keys(iconMap.buildings).length}`);
  console.log(`   Trolls: ${Object.keys(iconMap.trolls).length}`);
  console.log(`   Units: ${Object.keys(iconMap.units).length}`);
  
  // Generate clean file
  console.log('\n💾 Generating clean iconMap.ts...');
  const newContent = generateIconMap(iconMap);
  
  fs.writeFileSync(ICON_MAP_FILE, newContent, 'utf-8');
  
  console.log('✅ Fixed iconMap.ts');
  console.log('   - Removed duplicate ICON_MAP declaration');
  console.log('   - Removed duplicate keys (kept first occurrence)');
  console.log('   - Properly formatted and escaped all entries\n');
}

main();

