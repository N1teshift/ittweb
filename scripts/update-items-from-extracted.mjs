/**
 * Automatically update TypeScript item files from extracted JSON data
 * 
 * Usage: node scripts/update-items-from-extracted.mjs
 * 
 * This script:
 * 1. Reads the extracted items JSON
 * 2. Matches items to existing TypeScript files by name/codeId
 * 3. Updates names and descriptions while preserving structure
 * 4. Writes updated TypeScript files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');
const EXTRACTED_JSON = path.join(ROOT_DIR, 'external', 'island_troll_tribes', 'items_extracted.json');
const ITEMS_DIR = path.join(ROOT_DIR, 'src', 'features', 'ittweb', 'guides', 'data', 'items');

// Map of category files
const CATEGORY_FILES = {
  'scrolls': 'scrolls.ts',
  'weapons': 'weapons.ts',
  'armor': 'armor.ts',
  'potions': 'potions.ts',
  'raw-materials': 'raw-materials.ts',
  'buildings': 'buildings.ts',
  'unknown': 'unknown.ts',
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

/**
 * Convert codeId like "ITEM_SCROLL_HASTE" to id like "scroll-haste"
 */
function codeIdToId(codeId) {
  return codeId
    .replace(/^ITEM_/, '')
    .toLowerCase()
    .replace(/_/g, '-');
}

/**
 * Normalize a name for matching (remove "of", lowercase, etc.)
 */
function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/\s+of\s+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract items from a TypeScript file
 */
function parseTypeScriptItems(filePath, category) {
  const content = readText(filePath);
  const items = [];
  
  // Match item objects in the array - handle multiline format
  // Pattern: { id: '...', name: '...', category: '...', description: '...', ... }
  // Use a more flexible regex that handles whitespace and newlines
  const itemRegex = /\{\s*id:\s*['"]([^'"]+)['"]\s*,\s*name:\s*['"]([^'"]+)['"]\s*,\s*category:\s*['"]([^'"]+)['"]\s*,\s*description:\s*['"]([^'"]*)['"]/gs;
  
  let match;
  while ((match = itemRegex.exec(content)) !== null) {
    // Find the full object (from { to })
    let braceCount = 0;
    let objectStart = match.index;
    let objectEnd = objectStart;
    let inString = false;
    let stringChar = null;
    
    for (let i = objectStart; i < content.length; i++) {
      const char = content[i];
      const prevChar = i > 0 ? content[i - 1] : '';
      
      if (!inString && (char === '"' || char === "'")) {
        inString = true;
        stringChar = char;
      } else if (inString && char === stringChar && prevChar !== '\\') {
        inString = false;
        stringChar = null;
      } else if (!inString) {
        if (char === '{') braceCount++;
        if (char === '}') {
          braceCount--;
          if (braceCount === 0) {
            objectEnd = i + 1;
            break;
          }
        }
      }
    }
    
    if (objectEnd > objectStart) {
      const fullObject = content.substring(objectStart, objectEnd);
      
      items.push({
        id: match[1],
        name: match[2],
        category: match[3],
        description: match[4],
        originalMatch: fullObject,
        startIndex: objectStart,
        endIndex: objectEnd,
        nameStart: match.index + match[0].indexOf(`name: '${match[2]}'`) || match.index + match[0].indexOf(`name: "${match[2]}"`),
        nameEnd: -1,
        descStart: match.index + match[0].indexOf(`description: '${match[4]}'`) || match.index + match[0].indexOf(`description: "${match[4]}"`),
        descEnd: -1,
      });
    }
  }
  
  return { items, content };
}

/**
 * Update items in TypeScript content
 */
function updateItemsInContent(content, itemsToUpdate) {
  let updatedContent = content;
  let offset = 0;
  
  // Sort by position (reverse order to maintain indices)
  const sorted = [...itemsToUpdate].sort((a, b) => b.startIndex - a.startIndex);
  
  for (const update of sorted) {
    const { startIndex, endIndex, originalMatch, newName, newDescription, tsItem } = update;
    
    // Escape single quotes in strings
    const escapedName = newName.replace(/'/g, "\\'").replace(/\n/g, '\\n');
    const escapedDesc = newDescription.replace(/'/g, "\\'").replace(/\n/g, '\\n');
    
    // Rebuild the object completely to avoid regex issues
    const id = tsItem.id;
    const category = tsItem.category;
    const subcategory = tsItem.subcategory ? `,\n    subcategory: '${tsItem.subcategory}'` : '';
    
    // Build new object
    const updated = `{
    id: '${id}',
    name: '${escapedName}',
    category: '${category}',${subcategory}
    description: '${escapedDesc}',
  }`;
    
    const originalLength = endIndex - startIndex;
    updatedContent = updatedContent.substring(0, startIndex + offset) + 
                     updated + 
                     updatedContent.substring(endIndex + offset);
    
    offset += updated.length - originalLength;
  }
  
  return updatedContent;
}

/**
 * Match extracted items to TypeScript items
 */
function matchItems(extractedItems, tsItems) {
  const matches = [];
  const usedExtracted = new Set();
  
  for (const tsItem of tsItems) {
    let bestMatch = null;
    let bestScore = 0;
    
    for (const extracted of extractedItems) {
      if (usedExtracted.has(extracted.codeId)) continue;
      
      // Try multiple matching strategies
      let score = 0;
      
      // Exact ID match (codeId -> id conversion)
      const extractedId = codeIdToId(extracted.codeId);
      if (extractedId === tsItem.id) {
        score = 100;
      }
      // Normalized name match
      else if (normalizeName(extracted.name) === normalizeName(tsItem.name)) {
        score = 80;
      }
      // Partial name match
      else if (normalizeName(extracted.name).includes(normalizeName(tsItem.name)) ||
               normalizeName(tsItem.name).includes(normalizeName(extracted.name))) {
        score = 50;
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = extracted;
      }
    }
    
    if (bestMatch && bestScore >= 50) {
      matches.push({
        tsItem,
        extracted: bestMatch,
        score: bestScore,
      });
      usedExtracted.add(bestMatch.codeId);
    }
  }
  
  return matches;
}

function main() {
  console.log('Updating TypeScript item files from extracted data...\n');
  
  // Load extracted items
  if (!fs.existsSync(EXTRACTED_JSON)) {
    console.error(`Error: Extracted JSON not found at ${EXTRACTED_JSON}`);
    console.error('Please run: node scripts/extract-item-data.mjs first');
    process.exit(1);
  }
  
  const extractedData = JSON.parse(readText(EXTRACTED_JSON));
  const extractedItems = extractedData.items || [];
  
  console.log(`Loaded ${extractedItems.length} extracted items\n`);
  
  // Process each category file
  let totalUpdated = 0;
  
  for (const [category, filename] of Object.entries(CATEGORY_FILES)) {
    const filePath = path.join(ITEMS_DIR, filename);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`Warning: File not found: ${filePath}`);
      continue;
    }
    
    console.log(`Processing ${filename}...`);
    
    // Parse existing items
    const { items: tsItems, content } = parseTypeScriptItems(filePath, category);
    
    if (tsItems.length === 0) {
      console.log(`  No items found in ${filename}`);
      continue;
    }
    
    // Filter extracted items by category (heuristic)
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
      } else if (category === 'raw-materials') {
        return name.includes('hide') || name.includes('bone') || name.includes('herb') ||
               name.includes('seed') || name.includes('flint') || name.includes('stick') ||
               name.includes('stone') || name.includes('water') || name.includes('wind');
      }
      return false;
    });
    
    // Match items
    const matches = matchItems(categoryExtracted, tsItems);
    
    if (matches.length === 0) {
      console.log(`  No matches found for ${filename}`);
      continue;
    }
    
    console.log(`  Found ${matches.length} matches`);
    
    // Prepare updates
    const itemsToUpdate = matches.map(match => ({
      startIndex: match.tsItem.startIndex,
      endIndex: match.tsItem.endIndex || (match.tsItem.startIndex + match.tsItem.originalMatch.length),
      originalMatch: match.tsItem.originalMatch,
      tsItem: match.tsItem,
      newName: match.extracted.name,
      newDescription: match.extracted.tooltip || match.extracted.name + ' extracted from game source.',
    }));
    
    // Update content
    const updatedContent = updateItemsInContent(content, itemsToUpdate);
    
    // Write back
    writeText(filePath, updatedContent);
    
    console.log(`  Updated ${itemsToUpdate.length} items in ${filename}`);
    totalUpdated += itemsToUpdate.length;
    
    // Show what was updated
    for (const match of matches.slice(0, 5)) {
      console.log(`    - ${match.tsItem.name} -> ${match.extracted.name}`);
    }
    if (matches.length > 5) {
      console.log(`    ... and ${matches.length - 5} more`);
    }
    console.log('');
  }
  
  console.log(`\nDone! Updated ${totalUpdated} items across all files.`);
}

main();

