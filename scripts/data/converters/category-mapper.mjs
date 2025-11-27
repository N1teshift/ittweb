/**
 * Category mapping for items and abilities
 *
 * Maps extracted items and abilities to their categories using the curated
 * scripts/data/category-mappings.json file. When an entry is missing we fall
 * back to the "unknown" bucket so the UI can still render the data.
 */

import fs from 'fs';
import path from 'path';
import { slugify } from '../utils.mjs';
import { ROOT_DIR } from '../paths.mjs';

const CATEGORY_MAPPINGS_FILE = path.join(ROOT_DIR, 'scripts', 'data', 'category-mappings.json');

/**
 * Build item category mapping from extracted category-mappings.json file
 * Falls back to parsing ts_data if JSON file doesn't exist
 */
function buildItemCategoryMap() {
  const categoryMap = new Map();
  
  if (!fs.existsSync(CATEGORY_MAPPINGS_FILE)) {
    console.warn('⚠️  category-mappings.json not found, item categorization will default to unknown');
    return categoryMap;
  }
  
  try {
    const mappingsData = JSON.parse(fs.readFileSync(CATEGORY_MAPPINGS_FILE, 'utf-8'));
    if (mappingsData.items) {
      for (const [key, category] of Object.entries(mappingsData.items)) {
        categoryMap.set(key, category);
      }
    }
    console.log(`📚 Loaded ${categoryMap.size} item category mappings from category-mappings.json`);
  } catch (error) {
    console.warn(`⚠️  Error reading category-mappings.json: ${error.message}`);
  }
  
  return categoryMap;
}

// Build item category map once at module load
const ITEM_CATEGORY_MAP = buildItemCategoryMap();

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
    const category = ITEM_CATEGORY_MAP.get(lowerName) || 
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
  'item', 'building', 'unknown',
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
 * Build ability category mapping from extracted category-mappings.json file
 * Falls back to parsing ts_data if JSON file doesn't exist
 */
function buildAbilityCategoryMap() {
  const categoryMap = new Map();
  
  if (!fs.existsSync(CATEGORY_MAPPINGS_FILE)) {
    console.warn('⚠️  category-mappings.json not found, ability categorization will default to unknown');
    return categoryMap;
  }
  
  try {
    const mappingsData = JSON.parse(fs.readFileSync(CATEGORY_MAPPINGS_FILE, 'utf-8'));
    if (mappingsData.abilities) {
      for (const [key, category] of Object.entries(mappingsData.abilities)) {
        categoryMap.set(key, category);
      }
    }
    console.log(`📚 Loaded ${categoryMap.size} ability category mappings from category-mappings.json`);
  } catch (error) {
    console.warn(`⚠️  Error reading category-mappings.json: ${error.message}`);
  }
  
  return categoryMap;
}

// Build ability category map from backup
const ABILITY_CATEGORY_MAP = buildAbilityCategoryMap();

const missingAbilityCategorySlugs = new Set();

/**
 * Look up ability category - prioritize backup reference, then metadata
 */
export function mapAbilityCategory(slug) {
  const mappedCategory = ABILITY_CATEGORY_MAP.get(slug);
  if (mappedCategory) {
    return {
      category: normalizeAbilityCategory(mappedCategory),
      classRequirement: undefined,
    };
  }
  
  missingAbilityCategorySlugs.add(slug);
  return { category: 'unknown' };
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

