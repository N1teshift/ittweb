/**
 * Category mapping for items and abilities
 *
 * Maps extracted items and abilities to their categories using the curated
 * scripts/data/category-mappings.json file. When an entry is missing we fall
 * back to the "unknown" bucket so the UI can still render the data.
 */

import fs from 'fs';
import path from 'path';
import { slugify } from '../lib/utils.mjs';
import { ROOT_DIR } from '../lib/paths.mjs';

const CATEGORY_MAPPINGS_FILE = path.join(ROOT_DIR, 'scripts', 'data', 'config', 'category-mappings.json');

/**
 * Build item category mapping from extracted metadata and category-mappings.json
 * Priority: 1) Extracted metadata from war3map.j, 2) category-mappings.json
 */
function buildItemCategoryMap() {
  const categoryMap = new Map();
  const itemNameMap = new Map(); // Maps item IDs/constants to canonical names
  
  // First, try to load from extracted metadata (from source code)
  const metadataFile = path.join(ROOT_DIR, 'tmp', 'work-data', 'metadata', 'items.json');
  if (fs.existsSync(metadataFile)) {
    try {
      const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf-8'));
      if (metadata.itemIdToNameMap) {
        for (const [key, name] of Object.entries(metadata.itemIdToNameMap)) {
          itemNameMap.set(key.toLowerCase(), name);
        }
        console.log(`📚 Loaded ${itemNameMap.size} item ID mappings from extracted metadata`);
      }
    } catch (error) {
      console.warn(`⚠️  Error reading items metadata: ${error.message}`);
    }
  }
  
  // Then, load from category-mappings.json
  if (!fs.existsSync(CATEGORY_MAPPINGS_FILE)) {
    console.warn('⚠️  category-mappings.json not found, item categorization will default to unknown');
    return { categoryMap, itemNameMap };
  }
  
  try {
    const mappingsData = JSON.parse(fs.readFileSync(CATEGORY_MAPPINGS_FILE, 'utf-8'));
    if (mappingsData.items) {
      for (const [key, category] of Object.entries(mappingsData.items)) {
        categoryMap.set(key.toLowerCase(), category);
      }
    }
    console.log(`📚 Loaded ${categoryMap.size} item category mappings from category-mappings.json`);
  } catch (error) {
    console.warn(`⚠️  Error reading category-mappings.json: ${error.message}`);
  }
  
  return { categoryMap, itemNameMap };
}

// Build item category map once at module load
const { categoryMap: ITEM_CATEGORY_MAP, itemNameMap: ITEM_NAME_MAP } = buildItemCategoryMap();

/**
 * Map item to category using backup reference data
 */
export function mapItemCategory(item) {
  // Check for explicit category in item metadata first
  if (item.category) {
    const category = item.category.toLowerCase();
    const validCategories = ['raw-materials', 'weapons', 'armor', 'potions', 'scrolls', 'buildings', 'unknown'];
    if (validCategories.includes(category)) {
      return { category: category };
    }
  }
  
  // Use backup reference data for smart categorization
  const itemName = (item.name || '').trim();
  const itemId = item.id ? slugify(item.id) : null;
  const slugifiedName = itemName ? slugify(itemName) : null;
  
  if (itemName || itemId) {
    const lowerName = itemName?.toLowerCase().trim();
    
    // Try to find canonical name from extracted metadata first
    let canonicalName = lowerName;
    if (itemId) {
      const mappedName = ITEM_NAME_MAP.get(itemId.toLowerCase()) || 
                        ITEM_NAME_MAP.get(itemId);
      if (mappedName) {
        canonicalName = mappedName;
      }
    }
    
    // Try multiple lookup strategies
    const category = ITEM_CATEGORY_MAP.get(canonicalName) ||
                     ITEM_CATEGORY_MAP.get(lowerName) || 
                     ITEM_CATEGORY_MAP.get(slugifiedName) ||
                     ITEM_CATEGORY_MAP.get(itemId) ||
                     ITEM_CATEGORY_MAP.get(itemId?.toLowerCase());
    if (category) {
      return { category: category };
    }
  }
  
  return { category: 'unknown' };
}

const VALID_ABILITY_CATEGORIES = new Set([
  'basic', 'hunter', 'beastmaster', 'mage', 'priest', 'thief', 'scout', 'gatherer',
  'item', 'building', 'bonushandler', 'buff', 'auradummy', 'unknown',
]);

// Troll class categories that map directly to class slugs
const TROLL_CLASS_CATEGORIES = new Set([
  'hunter', 'beastmaster', 'mage', 'priest', 'thief', 'scout', 'gatherer',
]);

function normalizeAbilityCategory(rawCategory) {
  if (!rawCategory) return 'unknown';
  const lowered = rawCategory.toLowerCase();
  if (lowered === 'subclass' || lowered === 'superclass') {
    return 'unknown';
  }
  return VALID_ABILITY_CATEGORIES.has(lowered) ? lowered : 'unknown';
}

/**
 * Get class requirement from category if it's a troll class category
 */
function getClassRequirementFromCategory(category) {
  const normalized = normalizeAbilityCategory(category);
  return TROLL_CLASS_CATEGORIES.has(normalized) ? normalized : undefined;
}

/**
 * Build ability category mapping from extracted metadata and category-mappings.json
 * Priority: 1) Extracted metadata from war3map.j + Wurst source, 2) category-mappings.json
 */
function buildAbilityCategoryMap() {
  const categoryMap = new Map();
  
  // First, try to load from extracted metadata (most accurate, from source code)
  const metadataFile = path.join(ROOT_DIR, 'tmp', 'work-data', 'metadata', 'abilities.json');
  if (fs.existsSync(metadataFile)) {
    try {
      const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf-8'));
      if (metadata.abilityCategoryMap) {
        for (const [key, category] of Object.entries(metadata.abilityCategoryMap)) {
          categoryMap.set(key.toLowerCase(), category);
        }
        console.log(`📚 Loaded ${categoryMap.size} ability category mappings from extracted metadata`);
      }
    } catch (error) {
      console.warn(`⚠️  Error reading abilities metadata: ${error.message}`);
    }
  }
  
  // Then, load from category-mappings.json as fallback/override
  if (fs.existsSync(CATEGORY_MAPPINGS_FILE)) {
    try {
      const mappingsData = JSON.parse(fs.readFileSync(CATEGORY_MAPPINGS_FILE, 'utf-8'));
      if (mappingsData.abilities) {
        for (const [key, category] of Object.entries(mappingsData.abilities)) {
          // Override with manual mappings if they exist
          categoryMap.set(key.toLowerCase(), category);
        }
        if (Object.keys(mappingsData.abilities).length > 0) {
          console.log(`📚 Loaded ${Object.keys(mappingsData.abilities).length} ability category mappings from category-mappings.json`);
        }
      }
    } catch (error) {
      console.warn(`⚠️  Error reading category-mappings.json: ${error.message}`);
    }
  }
  
  if (categoryMap.size === 0) {
    console.warn('⚠️  No ability category mappings found, ability categorization will default to unknown');
  }
  
  return categoryMap;
}

// Build ability category map
const ABILITY_CATEGORY_MAP = buildAbilityCategoryMap();

const missingAbilityCategorySlugs = new Set();

/**
 * Helper function to check if a pattern matches either the name or slug
 * Handles both space-separated (name) and hyphen-separated (slug) formats
 */
function matchesPattern(name, slug, pattern) {
  const namePattern = pattern;
  const slugPattern = pattern.replace(/\s+/g, '-');
  return name.includes(namePattern) || slug.includes(slugPattern);
}

/**
 * Helper function to check if a pattern starts with a given prefix
 */
function startsWithPattern(name, slug, prefix) {
  const namePrefix = prefix;
  const slugPrefix = prefix.replace(/\s+/g, '-');
  return name.startsWith(namePrefix) || slug.startsWith(slugPrefix);
}

/**
 * Check if text contains stat bonuses (Strength +X, Agility +X, etc.)
 */
function hasStatWithPlus(text) {
  return /(strength|agility|intelligence|all\s*stats).*[\+\d]|[\+\d].*(strength|agility|intelligence|all\s*stats)/i.test(text);
}

/**
 * Pattern-based category detection based on ability names
 * Uses actual data patterns, not heuristics
 * Patterns are checked in order of specificity (most specific first)
 */
function detectCategoryFromPatterns(slug, name) {
  const lowerSlug = slug.toLowerCase();
  const lowerName = (name || '').toLowerCase();
  const searchText = `${lowerSlug} ${lowerName}`;
  
  // AuraDummy abilities - all abilities starting with "Aura Dummy:"
  if (startsWithPattern(lowerName, lowerSlug, 'aura dummy:') || startsWithPattern(lowerName, lowerSlug, 'aura-dummy:')) {
    return 'auradummy';
  }
  
  // BonusHandler abilities - all abilities starting with "BonusHandler"
  if (startsWithPattern(lowerName, lowerSlug, 'bonushandler')) {
    return 'bonushandler';
  }
  
  // Building abilities - Quick make (most specific building pattern)
  if (startsWithPattern(lowerName, lowerSlug, 'quick make') || lowerSlug.startsWith('qm-')) {
    return 'building';
  }
  
  // Gatherer abilities - "Find" + resource name
  if (startsWithPattern(lowerName, lowerSlug, 'find ')) {
    return 'gatherer';
  }
  
  // Item abilities - Scroll of X, Restore X, Full Heal
  if (startsWithPattern(lowerName, lowerSlug, 'scroll of') ||
      startsWithPattern(lowerName, lowerSlug, 'restore') ||
      lowerName === 'full heal' || lowerSlug === 'full-heal') {
    return 'item';
  }
  
  // Item abilities - Potions (specific potion names)
  if (matchesPattern(lowerName, lowerSlug, 'anti-magic potion') ||
      matchesPattern(lowerName, lowerSlug, 'disease potion') ||
      matchesPattern(lowerName, lowerSlug, "drunk's potion") ||
      matchesPattern(lowerName, lowerSlug, "drunks potion") ||
      matchesPattern(lowerName, lowerSlug, 'fervor potion') ||
      matchesPattern(lowerName, lowerSlug, 'omnicure potion')) {
    return 'item';
  }
  
  // Building abilities - Pack Up, Mud Hut Resilience, Melt X
  if (matchesPattern(lowerName, lowerSlug, 'pack up') ||
      matchesPattern(lowerName, lowerSlug, 'mud hut') ||
      matchesPattern(lowerName, lowerSlug, 'resilience')) {
    return 'building';
  }
  
  // Building abilities - Melt a River Root, Melt a Native Herb, etc.
  if (startsWithPattern(lowerName, lowerSlug, 'melt ')) {
    if (matchesPattern(lowerName, lowerSlug, 'river root') ||
        matchesPattern(lowerName, lowerSlug, 'native herb') ||
        matchesPattern(lowerName, lowerSlug, 'exotic herb') ||
        matchesPattern(lowerName, lowerSlug, 'everything')) {
      return 'building';
    }
  }
  
  // Scout abilities - Chain Reveal, Bird of Prey, Bring Down, Eagle Sight, Dream Vision, Advanced Scout Radar
  if (matchesPattern(lowerName, lowerSlug, 'reveal') ||
      matchesPattern(lowerName, lowerSlug, 'bird of prey') ||
      matchesPattern(lowerName, lowerSlug, 'bring down') ||
      matchesPattern(lowerName, lowerSlug, 'eagle sight') ||
      matchesPattern(lowerName, lowerSlug, 'dream vision') ||
      matchesPattern(lowerName, lowerSlug, 'advanced scout radar')) {
    return 'scout';
  }
  
  // Mage abilities - Firebolt, Metronome, Reduce Food, Flame Spray, Depress, Summon X Rune
  if (matchesPattern(lowerName, lowerSlug, 'firebolt') ||
      matchesPattern(lowerName, lowerSlug, 'metronome') ||
      matchesPattern(lowerName, lowerSlug, 'reduce food') ||
      matchesPattern(lowerName, lowerSlug, 'flame spray') ||
      matchesPattern(lowerName, lowerSlug, 'depress') ||
      (lowerName.includes('summon') && (lowerName.includes('rune') || lowerSlug.includes('rune')))) {
    return 'mage';
  }
  
  // Priest abilities - comprehensive list
  if (matchesPattern(lowerName, lowerSlug, 'angelic elemental') ||
      matchesPattern(lowerName, lowerSlug, 'lightning shield') ||
      matchesPattern(lowerName, lowerSlug, 'spirit link') ||
      matchesPattern(lowerName, lowerSlug, 'self preservation') ||
      matchesPattern(lowerName, lowerSlug, 'open light gate') ||
      matchesPattern(lowerName, lowerSlug, 'maximum fervor') ||
      matchesPattern(lowerName, lowerSlug, 'anti-magic shield') ||
      matchesPattern(lowerName, lowerSlug, 'healing wave') ||
      matchesPattern(lowerName, lowerSlug, 'magic mist') ||
      matchesPattern(lowerName, lowerSlug, 'ranged heal') ||
      matchesPattern(lowerName, lowerSlug, 'pump up') ||
      matchesPattern(lowerName, lowerSlug, 'anchor soul') ||
      matchesPattern(lowerName, lowerSlug, 'anti-magic shell') ||
      matchesPattern(lowerName, lowerSlug, 'replenish energy') ||
      matchesPattern(lowerName, lowerSlug, 'reincarnation') ||
      matchesPattern(lowerName, lowerSlug, 'priest inherited spells') ||
      matchesPattern(lowerName, lowerSlug, 'replenish health') ||
      (lowerName.includes('mix ') && (lowerName.includes('energy') || lowerName.includes('heat') || lowerName.includes('health'))) ||
      lowerSlug.includes('mix-energy') || lowerSlug.includes('mix-heat') || lowerSlug.includes('mix-health')) {
    return 'priest';
  }
  
  // Gatherer abilities - Gatherer Salves, Recipe: X Salve, Item Warp
  if (matchesPattern(lowerName, lowerSlug, 'gatherer salves') ||
      matchesPattern(lowerName, lowerSlug, 'item warp') ||
      (lowerName.startsWith('recipe:') && lowerName.includes('salve')) ||
      (lowerSlug.startsWith('recipe-') && lowerSlug.includes('salve'))) {
    return 'gatherer';
  }
  
  // Beastmaster abilities - comprehensive list
  if (matchesPattern(lowerName, lowerSlug, 'friend of the hive') ||
      matchesPattern(lowerName, lowerSlug, 'release pet') ||
      matchesPattern(lowerName, lowerSlug, 'omivore') ||
      matchesPattern(lowerName, lowerSlug, 'omnivore') ||
      matchesPattern(lowerName, lowerSlug, 'voracious bear') ||
      matchesPattern(lowerName, lowerSlug, 'hibernate') ||
      matchesPattern(lowerName, lowerSlug, 'pet sleep') ||
      matchesPattern(lowerName, lowerSlug, 'grow pet') ||
      matchesPattern(lowerName, lowerSlug, 'tame pet') ||
      matchesPattern(lowerName, lowerSlug, 'wolf life steal')) {
    return 'beastmaster';
  }
  
  // Beastmaster abilities - Transform with animal names
  if (matchesPattern(lowerName, lowerSlug, 'transform')) {
    if (searchText.includes('wolf') || searchText.includes('bear') || 
        searchText.includes('panther') || searchText.includes('tiger')) {
      return 'beastmaster';
    }
  }
  
  // Basic abilities - Collect Meat, Cook Meat, Cook and collect Meat
  if (matchesPattern(lowerName, lowerSlug, 'collect meat') ||
      matchesPattern(lowerName, lowerSlug, 'cook meat') ||
      matchesPattern(lowerName, lowerSlug, 'cook and collect meat')) {
    return 'basic';
  }
  
  // Buff abilities - Armor Bonus +X, Strength +X, Agility +X, Intelligence +X, All Stats +X, etc.
  if (matchesPattern(lowerName, lowerSlug, 'armor bonus') ||
      matchesPattern(lowerName, lowerSlug, 'movement speed bonus') ||
      matchesPattern(lowerName, lowerSlug, 'attack speed increase') ||
      matchesPattern(lowerName, lowerSlug, 'attack speed reduction') ||
      matchesPattern(lowerName, lowerSlug, 'attack damage bonus') ||
      hasStatWithPlus(lowerName) || hasStatWithPlus(lowerSlug)) {
    return 'buff';
  }
  
  // Hunter abilities - Sniff
  if (matchesPattern(lowerName, lowerSlug, 'sniff')) {
    return 'hunter';
  }
  
  return null;
}

/**
 * Look up ability category - uses extracted metadata and category-mappings.json
 * Tries multiple variations of the slug to find a match
 */
export function mapAbilityCategory(slug, abilityName = null) {
  if (!slug) {
    return { category: 'unknown' };
  }
  
  const lowerSlug = slug.toLowerCase();
  
  // First, try pattern-based detection from ability name
  const patternCategory = detectCategoryFromPatterns(lowerSlug, abilityName);
  if (patternCategory) {
    const normalizedCategory = normalizeAbilityCategory(patternCategory);
    return {
      category: normalizedCategory,
      classRequirement: getClassRequirementFromCategory(normalizedCategory),
    };
  }
  
  // Try exact match
  let mappedCategory = ABILITY_CATEGORY_MAP.get(lowerSlug);
  if (mappedCategory) {
    const normalizedCategory = normalizeAbilityCategory(mappedCategory);
    return {
      category: normalizedCategory,
      classRequirement: getClassRequirementFromCategory(normalizedCategory),
    };
  }
  
  // Try without 'ability-' prefix if present
  if (lowerSlug.startsWith('ability-')) {
    const withoutPrefix = lowerSlug.replace(/^ability-/, '');
    mappedCategory = ABILITY_CATEGORY_MAP.get(withoutPrefix);
    if (mappedCategory) {
      const normalizedCategory = normalizeAbilityCategory(mappedCategory);
      return {
        category: normalizedCategory,
        classRequirement: getClassRequirementFromCategory(normalizedCategory),
      };
    }
  }
  
  // Try with 'ability-' prefix if not present
  if (!lowerSlug.startsWith('ability-')) {
    const withPrefix = `ability-${lowerSlug}`;
    mappedCategory = ABILITY_CATEGORY_MAP.get(withPrefix);
    if (mappedCategory) {
      const normalizedCategory = normalizeAbilityCategory(mappedCategory);
      return {
        category: normalizedCategory,
        classRequirement: getClassRequirementFromCategory(normalizedCategory),
      };
    }
  }
  
  // Try matching partial names (for abilities with variations)
  for (const [key, category] of ABILITY_CATEGORY_MAP.entries()) {
    if (lowerSlug.includes(key) || key.includes(lowerSlug)) {
      const normalizedCategory = normalizeAbilityCategory(category);
      return {
        category: normalizedCategory,
        classRequirement: getClassRequirementFromCategory(normalizedCategory),
      };
    }
  }
  
  missingAbilityCategorySlugs.add(slug);
  return { category: 'unknown', classRequirement: undefined };
}

/**
 * Check if an ability name looks like an internal/garbage identifier
 */
export function isGarbageAbilityName(name) {
  if (!name || name.length < 2) return true;
  
  const trimmed = name.trim();
  if (trimmed.length <= 2) return true;
  if (/^[A-Z]{2,}[A-Za-z0-9]*[:|][A-Za-z0-9]/.test(trimmed)) return true;
  if (/^\$[a-z]/.test(trimmed)) return true;
  if (/^[A-Z0-9|:]{2,6}$/.test(trimmed) && trimmed.length <= 6) return true;
  if (/^[0-9]$/.test(trimmed)) return true;
  
  return false;
}

/**
 * Get missing ability category slugs for reporting
 */
export function getMissingAbilityCategorySlugs() {
  return Array.from(missingAbilityCategorySlugs);
}

