/**
 * Automatically update TypeScript item files from extracted JSON data
 * Version 2: Regenerates files completely instead of in-place replacement
 * 
 * Usage: node scripts/update-items-from-extracted-v2.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');
const EXTRACTED_JSON = path.join(ROOT_DIR, 'external', 'island_troll_tribes', 'items_extracted.json');
const ITEMS_DIR = path.join(ROOT_DIR, 'src', 'features', 'ittweb', 'guides', 'data', 'items');

const CATEGORY_FILES = {
  'scrolls': 'scrolls.ts',
  'weapons': 'weapons.ts',
  'armor': 'armor.ts',
  'tools': 'tools.ts',
  'potions': 'potions.ts',
  'raw-materials': 'raw-materials.ts',
};

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

function codeIdToId(codeId) {
  return codeId
    .replace(/^ITEM_/, '')
    .toLowerCase()
    .replace(/_/g, '-');
}

function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/\s+of\s+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parse TypeScript items from file
 */
function parseTypeScriptItems(content) {
  const items = [];
  const itemRegex = /\{\s*id:\s*['"]([^'"]+)['"]\s*,\s*name:\s*['"]([^'"]+)['"]\s*,\s*category:\s*['"]([^'"]+)['"]\s*(?:,\s*subcategory:\s*['"]([^'"]+)['"])?\s*,\s*description:\s*['"]([^'"]*)['"]/gs;
  
  let match;
  while ((match = itemRegex.exec(content)) !== null) {
    items.push({
      id: match[1],
      name: match[2],
      category: match[3],
      subcategory: match[4],
      description: match[5],
    });
  }
  
  return items;
}

/**
 * Generate TypeScript file content
 */
function generateTypeScriptFile(items, category, originalConstName) {
  // Use original constant name if provided, otherwise generate one
  const constName = originalConstName || category.toUpperCase().replace(/-/g, '_') + '_ITEMS';
  
  let content = `import type { ItemData } from '@/types/items';\n\n`;
  content += `export const ${constName}: ItemData[] = [\n`;
  
  for (const item of items) {
    content += `  {\n`;
    content += `    id: '${item.id}',\n`;
    content += `    name: '${item.name.replace(/'/g, "\\'")}',\n`;
    content += `    category: '${item.category}',\n`;
    if (item.subcategory) {
      content += `    subcategory: '${item.subcategory}',\n`;
    }
    content += `    description: '${item.description.replace(/'/g, "\\'")}',\n`;
    content += `  },\n`;
  }
  
  content += `];\n`;
  return content;
}

function matchItems(extractedItems, tsItems) {
  const matches = new Map();
  const usedExtracted = new Set();
  
  for (const tsItem of tsItems) {
    let bestMatch = null;
    let bestScore = 0;
    
    for (const extracted of extractedItems) {
      if (usedExtracted.has(extracted.codeId)) continue;
      
      let score = 0;
      const extractedId = codeIdToId(extracted.codeId);
      
      if (extractedId === tsItem.id) {
        score = 100;
      } else if (normalizeName(extracted.name) === normalizeName(tsItem.name)) {
        score = 80;
      } else if (normalizeName(extracted.name).includes(normalizeName(tsItem.name)) ||
                 normalizeName(tsItem.name).includes(normalizeName(extracted.name))) {
        score = 50;
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = extracted;
      }
    }
    
    if (bestMatch && bestScore >= 50) {
      matches.set(tsItem.id, {
        tsItem,
        extracted: bestMatch,
      });
      usedExtracted.add(bestMatch.codeId);
    }
  }
  
  return matches;
}

function main() {
  console.log('Updating TypeScript item files from extracted data...\n');
  
  if (!fs.existsSync(EXTRACTED_JSON)) {
    console.error(`Error: Extracted JSON not found at ${EXTRACTED_JSON}`);
    console.error('Please run: node scripts/extract-item-data.mjs first');
    process.exit(1);
  }
  
  const extractedData = JSON.parse(readText(EXTRACTED_JSON));
  const extractedItems = extractedData.items || [];
  
  console.log(`Loaded ${extractedItems.length} extracted items\n`);
  
  let totalUpdated = 0;
  
  for (const [category, filename] of Object.entries(CATEGORY_FILES)) {
    const filePath = path.join(ITEMS_DIR, filename);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`Warning: File not found: ${filePath}`);
      continue;
    }
    
    console.log(`Processing ${filename}...`);
    
    const content = readText(filePath);
    
    // Extract original constant name - look for pattern like "export const SCROLL_ITEMS"
    const constMatch = content.match(/export\s+const\s+([A-Z_]+ITEMS?)\s*:/);
    const originalConstName = constMatch ? constMatch[1] : null;
    
    const tsItems = parseTypeScriptItems(content);
    
    if (tsItems.length === 0) {
      console.log(`  No items found in ${filename}`);
      continue;
    }
    
    // Filter extracted items by category
    const categoryExtracted = extractedItems.filter(item => {
      const name = item.name?.toLowerCase() || '';
      const codeId = item.codeId?.toLowerCase() || '';
      
      if (category === 'scrolls') {
        return name.includes('scroll') || codeId.includes('scroll');
      } else if (category === 'weapons') {
        return name.includes('axe') || name.includes('spear') || name.includes('staff') || 
               name.includes('sword') || name.includes('bow') || name.includes('blade');
      } else if (category === 'armor') {
        return name.includes('coat') || name.includes('boot') || name.includes('glove') || 
               name.includes('armor') || name.includes('shield') || name.includes('cloak');
      } else if (category === 'potions') {
        return name.includes('potion') || name.includes('essence') || name.includes('salve');
      } else if (category === 'tools') {
        return name.includes('net') || name.includes('trap') || name.includes('kit') ||
               name.includes('rod') || name.includes('wand');
      } else if (category === 'raw-materials') {
        return name.includes('hide') || name.includes('bone') || name.includes('herb') ||
               name.includes('seed') || name.includes('flint') || name.includes('stick') ||
               name.includes('stone') || name.includes('water') || name.includes('wind');
      }
      return false;
    });
    
    const matches = matchItems(categoryExtracted, tsItems);
    
    if (matches.size === 0) {
      console.log(`  No matches found for ${filename}`);
      continue;
    }
    
    console.log(`  Found ${matches.size} matches`);
    
    // Update items
    const updatedItems = tsItems.map(tsItem => {
      const match = matches.get(tsItem.id);
      if (match) {
        return {
          ...tsItem,
          name: match.extracted.name,
          description: match.extracted.tooltip || match.extracted.name + ' extracted from game source.',
        };
      }
      return tsItem;
    });
    
    // Generate new file content
    const newContent = generateTypeScriptFile(updatedItems, category, originalConstName);
    
    // Write back
    writeText(filePath, newContent);
    
    console.log(`  Updated ${matches.size} items in ${filename}`);
    totalUpdated += matches.size;
    
    // Show what was updated
    for (const [id, match] of Array.from(matches.entries()).slice(0, 5)) {
      console.log(`    - ${match.tsItem.name} -> ${match.extracted.name}`);
    }
    if (matches.size > 5) {
      console.log(`    ... and ${matches.size - 5} more`);
    }
    console.log('');
  }
  
  console.log(`\nDone! Updated ${totalUpdated} items across all files.`);
}

main();

