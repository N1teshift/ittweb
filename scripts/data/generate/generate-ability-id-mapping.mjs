/**
 * Generate mapping from raw ability IDs (like "AMi1", "AM35") to ability slugs
 * 
 * This script creates a mapping file that connects raw Warcraft 3 ability object IDs
 * (stored in items) to the slugified ability IDs used in the generated TypeScript files.
 * 
 * Usage: node scripts/data/generate-ability-id-mapping.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadJson, slugify } from '../lib/utils.mjs';
import { TMP_RAW_DIR } from '../lib/paths.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..', '..');

const ABILITIES_FILE = path.join(TMP_RAW_DIR, 'abilities.json');
const OUTPUT_FILE = path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'data', 'items', 'abilityIdMapper.ts');

/**
 * Extract first 4 characters from ability ID (raw ID format)
 */
function getRawAbilityId(fullId) {
  if (!fullId || typeof fullId !== 'string') return null;
  // Full ID format is like "AMi1:AItg" - we want "AMi1"
  const parts = fullId.split(':');
  if (parts.length > 0 && parts[0].length >= 4) {
    return parts[0].substring(0, 4);
  }
  return parts[0] || null;
}

/**
 * Main function
 */
function main() {
  console.log('🔗 Generating ability ID mapping...\n');
  
  const abilitiesData = loadJson(ABILITIES_FILE);
  if (!abilitiesData || !abilitiesData.abilities) {
    console.error('❌ No abilities data found');
    console.error(`   Looking for: ${ABILITIES_FILE}`);
    process.exit(1);
  }
  
  const rawIdToSlugMap = {};
  let mappedCount = 0;
  let duplicateRawIds = new Set();
  
  console.log(`  Processing ${abilitiesData.abilities.length} abilities...`);
  
  for (const ability of abilitiesData.abilities) {
    if (!ability.id || !ability.name) continue;
    
    const rawId = getRawAbilityId(ability.id);
    if (!rawId || rawId.length < 4) continue;
    
    // Create slug from ability name
    const abilitySlug = slugify(ability.name);
    if (!abilitySlug) continue;
    
    // Map raw ID to slug (keep first mapping if duplicate raw IDs exist)
    if (!rawIdToSlugMap[rawId]) {
      rawIdToSlugMap[rawId] = abilitySlug;
      mappedCount++;
    } else if (rawIdToSlugMap[rawId] !== abilitySlug) {
      // Track duplicates for logging
      duplicateRawIds.add(rawId);
    }
  }
  
  if (duplicateRawIds.size > 0) {
    console.log(`  ⚠️  Found ${duplicateRawIds.size} duplicate raw IDs (using first mapping)`);
  }
  
  // Generate TypeScript file
  const mappingsEntries = Object.entries(rawIdToSlugMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([rawId, slug]) => `  '${rawId}': '${slug}',`)
    .join('\n');
  
  const content = `/**
 * Maps raw Warcraft 3 ability object IDs (like "AMi1", "AM35") to ability slugs/IDs
 * 
 * This mapping is automatically generated from extracted ability data.
 * The raw IDs are the first 4 characters of full ability IDs stored in items.
 * 
 * Generated: ${new Date().toISOString()}
 * Total mappings: ${mappedCount}
 */

// Map of raw ability ID (first 4 chars) -> ability slug
export const RAW_ABILITY_ID_TO_SLUG: Record<string, string> = {
${mappingsEntries}
};

/**
 * Get ability slug from raw ability ID
 */
export function getAbilitySlugFromRawId(rawId: string): string | null {
  return RAW_ABILITY_ID_TO_SLUG[rawId] || null;
}

/**
 * Find ability slug by searching abilities for a raw ID pattern
 * This is a fallback when direct mapping isn't available
 */
export function findAbilitySlugByRawId(rawId: string, abilities: Array<{ id: string; name: string }>): string | null {
  // First try direct mapping
  const direct = getAbilitySlugFromRawId(rawId);
  if (direct) return direct;
  
  // Try to find by matching raw ID in ability ID or name
  const lowerRawId = rawId.toLowerCase();
  
  for (const ability of abilities) {
    // Check if ability ID contains the raw ID
    if (ability.id.toLowerCase().includes(lowerRawId) || lowerRawId.includes(ability.id.toLowerCase())) {
      return ability.id;
    }
    // Check if ability name might relate to the raw ID
    if (ability.name.toLowerCase().includes(rawId.toLowerCase())) {
      return ability.id;
    }
  }
  
  return null;
}
`;
  
  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(OUTPUT_FILE, content, 'utf-8');
  console.log(`✅ Generated ability ID mapping to: ${path.relative(ROOT_DIR, OUTPUT_FILE)}`);
  console.log(`   Total mappings: ${mappedCount}`);
}

// Run main if this script is executed directly
if (import.meta.url.endsWith('generate-ability-id-mapping.mjs')) {
  main();
}

export { main as generateAbilityIdMapping };

