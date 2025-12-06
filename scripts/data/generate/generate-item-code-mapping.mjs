/**
 * Generate mapping from raw item codes (like "IM2o", "IM1y") to item slugs
 * 
 * This script creates a mapping that connects raw Warcraft 3 item object IDs
 * (from replay data) to the item slugs used in the TypeScript files.
 * 
 * Usage: node scripts/data/generate/generate-item-code-mapping.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadJson, slugify, stripColorCodes } from '../lib/utils.mjs';
import { TMP_RAW_DIR, ROOT_DIR } from '../lib/paths.mjs';

const ITEMS_JSON_FILE = path.join(TMP_RAW_DIR, 'items.json');
const ITEMS_TS_DIR = path.join(ROOT_DIR, 'src', 'features', 'modules', 'content', 'guides', 'data', 'items');
const REPLAY_ITEM_UTILS_FILE = path.join(ITEMS_TS_DIR, 'replayItemUtils.ts');

/**
 * Extract first 4 characters from item ID (raw code format)
 */
function getRawItemCode(fullId) {
  if (!fullId || typeof fullId !== 'string') return null;
  // Full ID format is like "IM2o:bspd" - we want "IM2o"
  const parts = fullId.split(':');
  if (parts.length > 0 && parts[0].length >= 4) {
    return parts[0].substring(0, 4);
  }
  return parts[0] || null;
}

/**
 * Normalize item name for matching (lowercase, strip color codes, trim)
 */
function normalizeItemName(name) {
  if (!name) return '';
  return stripColorCodes(name)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Parse TypeScript item files to extract items with their slugs and names
 */
function parseTypeScriptItems() {
  const itemFiles = [
    'raw-materials.ts',
    'weapons.ts',
    'armor.ts',
    'potions.ts',
    'scrolls.ts',
    'buildings.ts',
    'unknown.ts',
  ];

  const items = [];
  
  for (const fileName of itemFiles) {
    const filePath = path.join(ITEMS_TS_DIR, fileName);
    if (!fs.existsSync(filePath)) {
      console.warn(`  ⚠️  File not found: ${filePath}`);
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Extract item objects using regex
    // Look for patterns like: { id: 'slug', name: 'Name', ... }
    // Handle both single-line and multi-line formats
    const itemPattern = /{\s*id:\s*['"]([^'"]+)['"][^}]*?name:\s*['"]([^'"]+)['"]/gs;
    let match;
    
    while ((match = itemPattern.exec(content)) !== null) {
      const slug = match[1];
      const name = match[2];
      items.push({ slug, name, normalizedName: normalizeItemName(name) });
    }
  }

  return items;
}

/**
 * Main function
 */
async function main() {
  console.log('🔗 Generating item code to slug mapping...\n');
  
  // Load items from JSON
  const itemsData = loadJson(ITEMS_JSON_FILE);
  if (!itemsData || !itemsData.items) {
    console.error('❌ No items data found');
    console.error(`   Looking for: ${ITEMS_JSON_FILE}`);
    console.error('   Run the extraction script first: node scripts/data/extract/extract-from-w3x.mjs');
    process.exit(1);
  }

  // Parse TypeScript items
  console.log('  Reading TypeScript item files...');
  const tsItems = parseTypeScriptItems();
  console.log(`  Found ${tsItems.length} items in TypeScript files`);

  // Create a map of normalized name -> slug for quick lookup
  const nameToSlugMap = new Map();
  for (const item of tsItems) {
    const normalized = item.normalizedName;
    // If multiple items have the same normalized name, prefer the one that matches slug
    if (!nameToSlugMap.has(normalized) || item.slug === normalized.replace(/\s+/g, '-')) {
      nameToSlugMap.set(normalized, item.slug);
    }
  }

  // Build mapping from raw codes to slugs
  const rawCodeToSlugMap = {};
  let mappedCount = 0;
  let unmatchedCount = 0;
  let duplicateRawCodes = new Set();
  const unmatchedItems = [];

  console.log(`\n  Processing ${itemsData.items.length} items from JSON...`);

  for (const item of itemsData.items) {
    if (!item.id || !item.name) continue;
    
    const rawCode = getRawItemCode(item.id);
    if (!rawCode || rawCode.length < 4) continue;
    
    const normalizedName = normalizeItemName(item.name);
    if (!normalizedName) continue;

    // Try to find matching slug by normalized name
    const slug = nameToSlugMap.get(normalizedName);
    
    if (slug) {
      // Map raw code to slug (keep first mapping if duplicate raw codes exist)
      if (!rawCodeToSlugMap[rawCode]) {
        rawCodeToSlugMap[rawCode] = slug;
        mappedCount++;
      } else if (rawCodeToSlugMap[rawCode] !== slug) {
        // Track duplicates for logging
        duplicateRawCodes.add(rawCode);
      }
    } else {
      unmatchedCount++;
      if (unmatchedItems.length < 20) {
        unmatchedItems.push({ rawCode, name: item.name, normalizedName });
      }
    }
  }

  if (duplicateRawCodes.size > 0) {
    console.log(`  ⚠️  Found ${duplicateRawCodes.size} duplicate raw codes (using first mapping)`);
  }

  if (unmatchedCount > 0) {
    console.log(`  ⚠️  Could not match ${unmatchedCount} items`);
    if (unmatchedItems.length > 0) {
      console.log(`  Sample unmatched items:`);
      unmatchedItems.slice(0, 5).forEach(item => {
        console.log(`    - ${item.rawCode}: "${item.name}" (normalized: "${item.normalizedName}")`);
      });
    }
  }

  // Read existing file to preserve the structure
  let existingContent = '';
  if (fs.existsSync(REPLAY_ITEM_UTILS_FILE)) {
    existingContent = fs.readFileSync(REPLAY_ITEM_UTILS_FILE, 'utf-8');
  }

  // Generate the mapping entries
  const mappingsEntries = Object.entries(rawCodeToSlugMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([rawCode, slug]) => `    '${rawCode}': '${slug}',`)
    .join('\n');

  // Replace the RAW_ITEM_CODE_TO_SLUG constant in the file
  const mappingStart = 'const RAW_ITEM_CODE_TO_SLUG: Record<string, string> = {';
  const mappingEnd = '};';
  
  let newContent;
  if (existingContent.includes(mappingStart)) {
    // Find and replace the existing mapping
    const startIndex = existingContent.indexOf(mappingStart);
    const endIndex = existingContent.indexOf(mappingEnd, startIndex);
    
    if (endIndex !== -1) {
      const before = existingContent.substring(0, startIndex + mappingStart.length);
      const after = existingContent.substring(endIndex);
      newContent = before + '\n' + mappingsEntries + '\n' + after;
    } else {
      console.error('❌ Could not find end of RAW_ITEM_CODE_TO_SLUG mapping');
      process.exit(1);
    }
  } else {
    console.error('❌ Could not find RAW_ITEM_CODE_TO_SLUG mapping in file');
    process.exit(1);
  }

  // Write the updated file
  fs.writeFileSync(REPLAY_ITEM_UTILS_FILE, newContent, 'utf-8');
  
  console.log(`\n✅ Updated item code mapping in: ${path.relative(ROOT_DIR, REPLAY_ITEM_UTILS_FILE)}`);
  console.log(`   Total mappings: ${mappedCount}`);
  console.log(`   Unmatched items: ${unmatchedCount}`);
}

export { main as generateItemCodeMapping };

// Always run main when script is executed directly
// This works because Node.js sets import.meta.url to the current file when run directly
main().catch(err => {
  console.error('Error running script:', err);
  process.exit(1);
});

