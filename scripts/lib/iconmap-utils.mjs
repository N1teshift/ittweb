/**
 * IconMap utilities
 * 
 * Shared functions for parsing and generating iconMap.ts
 */

import fs from 'fs';
import { PATHS } from './constants.mjs';
import { getCache, setCache, clearCacheEntry } from './cache.mjs';
import { CONFIG } from './config.mjs';
import { safeReadFile, safeWriteFile } from './errors.mjs';

/**
 * Parse iconMap.ts content and extract all mappings (cached)
 * @param {string} content - File content (if not provided, reads from file)
 * @param {boolean} useCache - Whether to use cache (default: true)
 * @returns {Object} - Parsed icon map
 */
export function parseIconMap(content = null, useCache = true) {
  const iconMapFile = PATHS.ICON_MAP_FILE;
  const cacheKey = `iconMap_${iconMapFile}`;
  
  if (content === null) {
    if (useCache) {
      const cached = getCache(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }
    
    if (!fs.existsSync(iconMapFile)) {
      const emptyMap = { abilities: {}, items: {}, buildings: {}, trolls: {}, units: {} };
      if (useCache) {
        setCache(cacheKey, emptyMap, CONFIG.CACHE.PARSED_DATA_TTL);
      }
      return emptyMap;
    }
    content = safeReadFile(iconMapFile);
  }
  
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
  
  if (content === null && useCache) {
    setCache(cacheKey, iconMap, CONFIG.CACHE.PARSED_DATA_TTL);
  }
  
  return iconMap;
}

/**
 * Escape string for use in JavaScript/TypeScript single-quoted string
 * @param {string} str - String to escape
 * @returns {string} - Escaped string
 */
export function escapeForJS(str) {
  if (!str) return '';
  // Escape backslashes first, then single quotes
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

/**
 * Generate iconMap.ts content
 * @param {Object} iconMap - Icon map object
 * @returns {string} - Generated TypeScript content
 */
export function generateIconMap(iconMap) {
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
        const escapedKey = escapeForJS(key);
        const escapedValue = escapeForJS(value);
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

/**
 * Update iconMap.ts file with new mappings
 * @param {Object} newMappings - New mappings to add
 */
export function updateIconMap(newMappings) {
  const existingMap = parseIconMap();
  
  // Merge new mappings
  for (const [category, mappings] of Object.entries(newMappings)) {
    if (existingMap[category]) {
      Object.assign(existingMap[category], mappings);
    }
  }
  
  // Read existing file to preserve structure
  let content = '';
  if (fs.existsSync(PATHS.ICON_MAP_FILE)) {
    content = fs.readFileSync(PATHS.ICON_MAP_FILE, 'utf-8');
  }
  
  // Generate new content
  const newContent = generateIconMap(existingMap);
  
  // Preserve helper functions if they exist
  let finalContent = newContent;
  if (content.includes('export function resolveExplicitIcon')) {
    // Keep the helper functions from original file
    const helperFunctions = content.split('};\n').slice(1).join('};\n');
    finalContent = newContent + helperFunctions;
  }
  
  safeWriteFile(PATHS.ICON_MAP_FILE, finalContent);
  
  // Clear cache after update
  clearCacheEntry(`iconMap_${PATHS.ICON_MAP_FILE}`);
}

