/**
 * Extract ability codes from item descriptions and tooltips
 * 
 * This script parses ability reference codes like <AIs3,DataC1> from item descriptions
 * and finds missing abilities in the mapping.
 * 
 * Usage: node scripts/data/extract-ability-codes-from-items.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadJson, slugify } from '../lib/utils.mjs';
import { TMP_RAW_DIR } from '../lib/paths.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..', '..');

const ITEMS_FILE = path.join(TMP_RAW_DIR, 'items.json');
const ABILITIES_FILE = path.join(TMP_RAW_DIR, 'abilities.json');
const ABILITY_ID_MAPPER_FILE = path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'data', 'items', 'abilityIdMapper.ts');

/**
 * Extract ability codes from text (pattern: <XXXX,DataXX>)
 */
function extractAbilityCodes(text) {
  if (!text || typeof text !== 'string') return [];
  
  // Pattern: <4-char ability ID,Data field>
  const pattern = /<([A-Za-z0-9!{}|~$]{4}),[^>]+>/g;
  const codes = [];
  let match;
  
  while ((match = pattern.exec(text)) !== null) {
    const abilityId = match[1];
    if (abilityId && abilityId.length === 4) {
      codes.push(abilityId);
    }
  }
  
  return [...new Set(codes)]; // Remove duplicates
}

/**
 * Extract first 4 characters from ability ID (raw ID format)
 */
function getRawAbilityId(fullId) {
  if (!fullId || typeof fullId !== 'string') return null;
  const parts = fullId.split(':');
  if (parts.length > 0 && parts[0].length >= 4) {
    return parts[0].substring(0, 4);
  }
  return parts[0] || null;
}

/**
 * Load existing ability ID mapping
 */
function loadExistingMapping() {
  if (!fs.existsSync(ABILITY_ID_MAPPER_FILE)) {
    return {};
  }
  
  const content = fs.readFileSync(ABILITY_ID_MAPPER_FILE, 'utf-8');
  
  // Find the mapping object content - it spans multiple lines
  const startMarker = 'export const RAW_ABILITY_ID_TO_SLUG: Record<string, string> = {';
  const startIdx = content.indexOf(startMarker);
  if (startIdx === -1) return {};
  
  // Find the closing brace for the object
  let braceCount = 0;
  let inString = false;
  let escapeNext = false;
  let endIdx = startIdx + startMarker.length;
  
  for (let i = endIdx; i < content.length; i++) {
    const char = content[i];
    
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    
    if (char === '\\') {
      escapeNext = true;
      continue;
    }
    
    if (char === "'" || char === '"') {
      inString = !inString;
      continue;
    }
    
    if (inString) continue;
    
    if (char === '{') braceCount++;
    if (char === '}') {
      if (braceCount === 0) {
        endIdx = i;
        break;
      }
      braceCount--;
    }
  }
  
  const entriesContent = content.substring(startIdx + startMarker.length, endIdx);
  
  // Parse entries like: 'AMi1': 'iron-axe-damage-bonus',
  const mapping = {};
  const entryPattern = /'([^']+)':\s*'([^']+)'/g;
  let entryMatch;
  
  while ((entryMatch = entryPattern.exec(entriesContent)) !== null) {
    mapping[entryMatch[1]] = entryMatch[2];
  }
  
  return mapping;
}

/**
 * Main function
 */
function main() {
  console.log('🔍 Extracting ability codes from item descriptions...\n');
  
  // Load items data
  const itemsData = loadJson(ITEMS_FILE);
  if (!itemsData || !itemsData.items) {
    console.error('❌ No items data found');
    console.error(`   Looking for: ${ITEMS_FILE}`);
    process.exit(1);
  }
  
  // Load abilities data
  const abilitiesData = loadJson(ABILITIES_FILE);
  if (!abilitiesData || !abilitiesData.abilities) {
    console.error('❌ No abilities data found');
    console.error(`   Looking for: ${ABILITIES_FILE}`);
    process.exit(1);
  }
  
  // Load existing mapping
  const existingMapping = loadExistingMapping();
  console.log(`  Loaded ${Object.keys(existingMapping).length} existing mappings\n`);
  
  // Extract all ability codes from item descriptions and tooltips
  const foundCodes = new Set();
  const codeToItems = new Map(); // Track which items reference each code
  
  console.log(`  Scanning ${itemsData.items.length} items...`);
  
  for (const item of itemsData.items) {
    const texts = [item.description, item.tooltip].filter(Boolean);
    
    for (const text of texts) {
      const codes = extractAbilityCodes(text);
      for (const code of codes) {
        foundCodes.add(code);
        if (!codeToItems.has(code)) {
          codeToItems.set(code, []);
        }
        codeToItems.get(code).push(item.name || item.id);
      }
    }
  }
  
  console.log(`  Found ${foundCodes.size} unique ability codes in item descriptions\n`);
  
  // Create a map of raw ability ID -> ability data
  const abilityByRawId = new Map();
  for (const ability of abilitiesData.abilities) {
    if (!ability.id || !ability.name) continue;
    const rawId = getRawAbilityId(ability.id);
    if (!rawId || rawId.length < 4) continue;
    
    // Store the first ability we find for each raw ID
    if (!abilityByRawId.has(rawId)) {
      abilityByRawId.set(rawId, ability);
    }
  }
  
  console.log(`  Indexed ${abilityByRawId.size} abilities by raw ID\n`);
  
  // Find missing mappings
  const missingMappings = [];
  const foundMappings = [];
  
  for (const code of foundCodes) {
    if (existingMapping[code]) {
      // Already mapped
      continue;
    }
    
    const ability = abilityByRawId.get(code);
    if (ability) {
      const abilitySlug = slugify(ability.name);
      if (abilitySlug) {
        foundMappings.push({
          code,
          name: ability.name,
          slug: abilitySlug,
          items: codeToItems.get(code) || []
        });
      }
    } else {
      missingMappings.push({
        code,
        items: codeToItems.get(code) || []
      });
    }
  }
  
  // Report findings
  console.log(`✅ Found ${foundMappings.length} new mappings to add:`);
  for (const mapping of foundMappings.slice(0, 10)) {
    console.log(`   ${mapping.code} → ${mapping.slug} (${mapping.name})`);
    if (mapping.items.length > 0) {
      console.log(`      Used in: ${mapping.items.slice(0, 3).join(', ')}${mapping.items.length > 3 ? '...' : ''}`);
    }
  }
  if (foundMappings.length > 10) {
    console.log(`   ... and ${foundMappings.length - 10} more`);
  }
  
  if (missingMappings.length > 0) {
    console.log(`\n⚠️  Found ${missingMappings.length} codes without matching abilities:`);
    for (const missing of missingMappings.slice(0, 10)) {
      console.log(`   ${missing.code}`);
      if (missing.items.length > 0) {
        console.log(`      Used in: ${missing.items.slice(0, 3).join(', ')}${missing.items.length > 3 ? '...' : ''}`);
      }
    }
    if (missingMappings.length > 10) {
      console.log(`   ... and ${missingMappings.length - 10} more`);
    }
  }
  
  // Update the mapping file if we found new mappings
  if (foundMappings.length > 0) {
    console.log(`\n📝 Adding ${foundMappings.length} new mappings to abilityIdMapper.ts...`);
    
    // Add new mappings to existing ones
    const updatedMapping = { ...existingMapping };
    for (const mapping of foundMappings) {
      if (!updatedMapping[mapping.code]) {
        updatedMapping[mapping.code] = mapping.slug;
      }
    }
    
    // Generate TypeScript file content
    const mappingsEntries = Object.entries(updatedMapping)
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
 * Total mappings: ${Object.keys(updatedMapping).length}
 * 
 * Note: Some mappings were discovered by parsing ability codes from item descriptions.
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
    
    // Write updated file
    const outputDir = path.dirname(ABILITY_ID_MAPPER_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(ABILITY_ID_MAPPER_FILE, content, 'utf-8');
    console.log(`✅ Updated abilityIdMapper.ts with ${foundMappings.length} new mappings`);
  } else {
    console.log(`\n✅ No new mappings found - all ability codes are already mapped`);
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total codes found in items: ${foundCodes.size}`);
  console.log(`   Already mapped: ${foundCodes.size - foundMappings.length - missingMappings.length}`);
  console.log(`   New mappings added: ${foundMappings.length}`);
  console.log(`   Missing abilities: ${missingMappings.length}`);
}

if (import.meta.url.endsWith('extract-ability-codes-from-items.mjs')) {
  main();
}

export { main as extractAbilityCodesFromItems };

