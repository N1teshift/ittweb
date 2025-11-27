/**
 * Category mapping for items and abilities
 * 
 * Maps extracted items and abilities to their categories using:
 * 1. category-mappings.json (primary source)
 * 2. ts_data backup files (fallback)
 * 3. Metadata files (for abilities)
 */

import fs from 'fs';
import path from 'path';
import { getRootDir, loadJson, slugify } from '../utils.mjs';

const ROOT_DIR = getRootDir();
const BACKUP_TS_DATA_DIR = path.join(ROOT_DIR, 'data', 'island_troll_tribes', 'ts_data');
const CATEGORY_MAPPINGS_FILE = path.join(ROOT_DIR, 'scripts', 'data', 'category-mappings.json');
const ABILITIES_META_FILE = path.join(ROOT_DIR, 'data', 'island_troll_tribes', 'abilities.json');
const FORCE_UNKNOWN_ABILITY_CATEGORIES = false;

/**
 * Build item category mapping from extracted category-mappings.json file
 * Falls back to parsing ts_data if JSON file doesn't exist
 */
function buildItemCategoryMap() {
  const categoryMap = new Map();
  
  // First, try to load from category-mappings.json
  if (fs.existsSync(CATEGORY_MAPPINGS_FILE)) {
    try {
      const mappingsData = JSON.parse(fs.readFileSync(CATEGORY_MAPPINGS_FILE, 'utf-8'));
      if (mappingsData.items) {
        for (const [key, category] of Object.entries(mappingsData.items)) {
          categoryMap.set(key, category);
        }
        console.log(`📚 Loaded ${categoryMap.size} item category mappings from category-mappings.json`);
        return categoryMap;
      }
    } catch (error) {
      console.warn(`⚠️  Error reading category-mappings.json: ${error.message}, falling back to ts_data`);
    }
  }
  
  // Fallback: parse from ts_data backup files (for backward compatibility)
  const backupItemsDir = path.join(BACKUP_TS_DATA_DIR, 'items');
  
  if (!fs.existsSync(backupItemsDir)) {
    console.warn('⚠️  Backup items directory not found, item categorization will default to unknown');
    return categoryMap;
  }
  
  const categoryFiles = {
    'weapons': 'weapons.ts',
    'armor': 'armor.ts',
    'potions': 'potions.ts',
    'scrolls': 'scrolls.ts',
    'raw-materials': 'raw-materials.ts',
    'buildings': 'buildings.ts',
  };
  
  for (const [category, fileName] of Object.entries(categoryFiles)) {
    const filePath = path.join(backupItemsDir, fileName);
    if (!fs.existsSync(filePath)) continue;
    
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      
      let currentId = null;
      let currentName = null;
      
      for (const line of lines) {
        const idMatch = line.match(/id:\s*['"]([^'"]+)['"]/);
        if (idMatch) {
          currentId = idMatch[1];
        }
        
        const nameMatch = line.match(/name:\s*['"]([^'"]+)['"]/);
        if (nameMatch) {
          currentName = nameMatch[1].trim();
        }
        
        if (currentId && currentName) {
          categoryMap.set(currentId, category);
          categoryMap.set(currentName.toLowerCase().trim(), category);
          categoryMap.set(slugify(currentName), category);
          const slugifiedId = slugify(currentId);
          if (slugifiedId !== slugify(currentName)) {
            categoryMap.set(slugifiedId, category);
          }
          currentId = null;
          currentName = null;
        }
      }
    } catch (error) {
      console.warn(`⚠️  Error reading ${fileName}: ${error.message}`);
    }
  }
  
  console.log(`📚 Loaded ${categoryMap.size} item category mappings from backup data`);
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
  
  if (fs.existsSync(CATEGORY_MAPPINGS_FILE)) {
    try {
      const mappingsData = JSON.parse(fs.readFileSync(CATEGORY_MAPPINGS_FILE, 'utf-8'));
      if (mappingsData.abilities) {
        for (const [key, category] of Object.entries(mappingsData.abilities)) {
          categoryMap.set(key, category);
        }
        console.log(`📚 Loaded ${categoryMap.size} ability category mappings from category-mappings.json`);
        return categoryMap;
      }
    } catch (error) {
      console.warn(`⚠️  Error reading category-mappings.json: ${error.message}, falling back to ts_data`);
    }
  }
  
  // Fallback: parse from ts_data backup files
  const backupAbilitiesDir = path.join(BACKUP_TS_DATA_DIR, 'abilities');
  
  if (!fs.existsSync(backupAbilitiesDir)) {
    console.warn('⚠️  Backup abilities directory not found, ability categorization will use metadata or default to unknown');
    return categoryMap;
  }
  
  const categoryFiles = {
    'basic': 'basic.ts',
    'hunter': 'hunter.ts',
    'beastmaster': 'beastmaster.ts',
    'mage': 'mage.ts',
    'priest': 'priest.ts',
    'thief': 'thief.ts',
    'scout': 'scout.ts',
    'gatherer': 'gatherer.ts',
    'building': 'building.ts',
  };
  
  for (const [category, fileName] of Object.entries(categoryFiles)) {
    const filePath = path.join(backupAbilitiesDir, fileName);
    if (!fs.existsSync(filePath)) continue;
    
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      
      for (const line of lines) {
        const idMatch = line.match(/id:\s*['"]([^'"]+)['"]/);
        if (idMatch) {
          const currentId = idMatch[1];
          if (currentId) {
            categoryMap.set(currentId, category);
            const slugifiedId = slugify(currentId);
            if (slugifiedId !== currentId) {
              categoryMap.set(slugifiedId, category);
            }
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️  Error reading ${fileName}: ${error.message}`);
    }
  }
  
  console.log(`📚 Loaded ${categoryMap.size} ability category mappings from backup data`);
  return categoryMap;
}

// Build ability category map from backup
const ABILITY_CATEGORY_MAP = buildAbilityCategoryMap();

// Load metadata as fallback
const abilityMetadata = FORCE_UNKNOWN_ABILITY_CATEGORIES ? null : loadJson(ABILITIES_META_FILE);
const ABILITY_METADATA_MAP = new Map();
if (abilityMetadata?.abilities) {
  for (const abilityMeta of abilityMetadata.abilities) {
    const slug = abilityMeta.id || slugify(abilityMeta.name || '');
    if (!slug) continue;
    ABILITY_METADATA_MAP.set(slug, abilityMeta);
  }
}

const missingAbilityCategorySlugs = new Set();

/**
 * Look up ability category - prioritize backup reference, then metadata
 */
export function mapAbilityCategory(slug) {
  const backupCategory = ABILITY_CATEGORY_MAP.get(slug);
  if (backupCategory) {
    return {
      category: normalizeAbilityCategory(backupCategory),
      classRequirement: undefined
    };
  }
  
  const meta = ABILITY_METADATA_MAP.get(slug);
  if (meta) {
    const metaCategory = normalizeAbilityCategory(meta.category);
    if (metaCategory !== 'item') {
      return {
        category: metaCategory,
        classRequirement: meta.classRequirement
      };
    }
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

