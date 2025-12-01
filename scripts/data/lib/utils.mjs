/**
 * Shared utilities for data generation scripts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

/**
 * Get the root directory of the project (2 levels up from scripts/data/)
 */
export function getRootDir() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  return path.join(__dirname, '..', '..');
}

/**
 * Load JSON file safely
 */
export function loadJson(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (error) {
    console.warn(`Error reading JSON file ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Write JSON file with formatting
 */
export function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Generate slug from name (lowercase, hyphenated)
 * Limits length to 100 characters to prevent filesystem path length issues
 * If truncated, appends a hash suffix to ensure uniqueness
 */
export function slugify(name) {
  if (!name) return '';
  const MAX_SLUG_LENGTH = 100;
  
  let slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  // If slug is too long, truncate and append hash for uniqueness
  if (slug.length > MAX_SLUG_LENGTH) {
    const hash = crypto.createHash('md5').update(slug).digest('hex').substring(0, 8);
    const truncated = slug.substring(0, MAX_SLUG_LENGTH - 9); // Leave room for '-' + 8 char hash
    slug = truncated.replace(/-+$/, '') + '-' + hash; // Remove trailing hyphens before adding hash
  }
  
  return slug;
}

/**
 * Strip Warcraft 3 color codes from text
 * Removes |cffRRGGBB, |r, and |n codes
 */
export function stripColorCodes(str) {
  if (!str) return '';
  return str.replace(/\|cff[0-9a-fA-F]{6}/g, '').replace(/\|r/g, '').replace(/\|n/g, ' ').trim();
}

/**
 * Escape string for TypeScript/JavaScript single-quoted strings
 */
export function escapeString(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')  // Escape backslashes first
    .replace(/'/g, "\\'")     // Escape single quotes
    .replace(/\n/g, '\\n')    // Escape newlines
    .replace(/\r/g, '\\r')    // Escape carriage returns
    .replace(/\t/g, '\\t');   // Escape tabs
}

/**
 * Convert Windows path to icon path format
 * Normalizes paths: removes all subdirectories, converts to lowercase, converts .blp to .png
 * Returns only the filename (e.g., "pasbtnelunesblessing.png")
 */
export function convertIconPath(iconPath) {
  if (!iconPath) return undefined;
  
  // Convert Windows backslashes to forward slashes
  let converted = iconPath.replace(/\\/g, '/');
  
  // Extract only the filename (remove all subdirectories)
  const filename = converted.split('/').pop();
  
  // Remove .blp extension and add .png, then convert to lowercase
  converted = filename.replace(/\.blp$/i, '.png').toLowerCase();
  
  return converted;
}

/**
 * Parse JavaScript string literal (handles escaped quotes)
 */
export function parseJSString(str) {
  if (!str) return '';
  // Remove surrounding quotes
  if ((str.startsWith("'") && str.endsWith("'")) || (str.startsWith('"') && str.endsWith('"'))) {
    str = str.slice(1, -1);
  }
  // Unescape escaped quotes and backslashes
  return str.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\');
}

/**
 * Ensure directory exists
 */
export function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Get field value from modifications array (common pattern in extraction)
 */
export function getField(modifications, fieldId, level = 0) {
  if (!Array.isArray(modifications)) return undefined;
  const field = modifications.find(m => m.id === fieldId && m.level === level);
  return field ? field.value : undefined;
}

/**
 * Get field value trying multiple levels (useful for abilities)
 */
export function getFieldFlexible(modifications, fieldId, preferLevel = 0) {
  if (!Array.isArray(modifications)) return '';
  // Try preferred level first
  let field = modifications.find(m => m.id === fieldId && m.level === preferLevel);
  // If not found, try level 0
  if (!field) {
    field = modifications.find(m => m.id === fieldId && m.level === 0);
  }
  // If still not found, try any level
  if (!field) {
    field = modifications.find(m => m.id === fieldId);
  }
  return field ? field.value : '';
}

// ============================================================================
// Error Handling Utilities
// ============================================================================

/**
 * Pipeline error class with context
 */
export class PipelineError extends Error {
  constructor(message, context = {}) {
    super(message);
    this.name = 'PipelineError';
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Throw an error with context (fail-fast pattern)
 */
export function throwError(message, context = {}) {
  throw new PipelineError(message, context);
}

/**
 * Log warning and continue (non-fatal)
 */
export function logWarning(message, context = {}) {
  const contextStr = Object.keys(context).length > 0 
    ? ` (${Object.entries(context).map(([k, v]) => `${k}: ${v}`).join(', ')})`
    : '';
  console.warn(`⚠️  ${message}${contextStr}`);
}

/**
 * Log error with context
 */
export function logError(message, error = null, context = {}) {
  const contextStr = Object.keys(context).length > 0 
    ? ` (${Object.entries(context).map(([k, v]) => `${k}: ${v}`).join(', ')})`
    : '';
  console.error(`❌ ${message}${contextStr}`);
  if (error) {
    console.error('   Error details:', error.message || error);
  }
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validate that data is an array
 */
export function validateArray(data, fieldName = 'data') {
  if (!Array.isArray(data)) {
    throwError(`Expected ${fieldName} to be an array, got ${typeof data}`, { fieldName, type: typeof data });
  }
  return true;
}

/**
 * Validate that data is an object
 */
export function validateObject(data, fieldName = 'data') {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throwError(`Expected ${fieldName} to be an object, got ${typeof data}`, { fieldName, type: typeof data });
  }
  return true;
}

/**
 * Validate that a file exists and is readable
 */
export function validateFileExists(filePath) {
  if (!fs.existsSync(filePath)) {
    throwError(`Required file not found: ${filePath}`, { filePath });
  }
  return true;
}

/**
 * Validate that a directory exists
 */
export function validateDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    throwError(`Required directory not found: ${dirPath}`, { dirPath });
  }
  const stats = fs.statSync(dirPath);
  if (!stats.isDirectory()) {
    throwError(`Path exists but is not a directory: ${dirPath}`, { dirPath });
  }
  return true;
}

/**
 * Load JSON file with validation
 * Returns null if file doesn't exist (allows optional files)
 * Throws error if file exists but is invalid JSON
 */
export function loadJsonSafe(filePath, required = false) {
  if (!fs.existsSync(filePath)) {
    if (required) {
      throwError(`Required JSON file not found: ${filePath}`, { filePath });
    }
    return null;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    return data;
  } catch (error) {
    throwError(`Failed to parse JSON file: ${filePath}`, { filePath, error: error.message });
  }
}

/**
 * Validate JSON structure has expected fields
 */
export function validateJsonStructure(data, expectedFields = [], fieldName = 'data') {
  validateObject(data, fieldName);
  
  for (const field of expectedFields) {
    if (!(field in data)) {
      logWarning(`Missing expected field '${field}' in ${fieldName}`, { fieldName, field });
    }
  }
  
  return true;
}

/**
 * Validate array items have required fields
 */
export function validateArrayItems(array, requiredFields = [], arrayName = 'array') {
  validateArray(array, arrayName);
  
  for (let i = 0; i < array.length; i++) {
    const item = array[i];
    for (const field of requiredFields) {
      if (!(field in item) || item[field] === undefined || item[field] === null) {
        logWarning(`Item at index ${i} missing required field '${field}' in ${arrayName}`, {
          arrayName,
          index: i,
          field
        });
      }
    }
  }
  
  return true;
}

// ============================================================================
// TypeScript File Reading Utilities
// ============================================================================

/**
 * Get all icon files from the icons directory
 * 
 * @param {string} iconsDir - Path to the icons directory
 * @param {string} format - 'map' (returns {iconMap, searchIndex}) or 'array' (returns array of file objects)
 * @returns {Object|Array} Icon files in the requested format
 */
export function getAllIconFiles(iconsDir, format = 'map') {
  if (!fs.existsSync(iconsDir)) {
    if (format === 'map') {
      return { iconMap: new Map(), searchIndex: new Map() };
    }
    return [];
  }

  const iconMap = new Map(); // lowercase filename -> actual filename
  const searchIndex = new Map(); // lowercase basename (no ext) -> array of actual filenames
  const files = [];

  const entries = fs.readdirSync(iconsDir, { withFileTypes: true });
  
  for (const entry of entries) {
    // Skip subdirectories (all icons should be flat now)
    if (entry.isDirectory()) {
      continue;
    }
    
    if (entry.isFile() && entry.name.toLowerCase().endsWith('.png')) {
      const lowerName = entry.name.toLowerCase();
      const basename = path.basename(lowerName, '.png');
      
      // Store the actual filename (preserving case)
      if (!iconMap.has(lowerName)) {
        iconMap.set(lowerName, entry.name);
      }
      
      // Build search index for fuzzy matching
      if (!searchIndex.has(basename)) {
        searchIndex.set(basename, []);
      }
      searchIndex.get(basename).push(entry.name);

      // Also build array format
      files.push({
        filename: entry.name,
        basename: basename,
        category: 'icons'
      });
    }
  }

  if (format === 'array') {
    return files;
  }
  
  return { iconMap, searchIndex };
}

/**
 * Parse a TypeScript object literal to extract id, name, and iconPath
 * 
 * @param {string} objContent - The content of a TypeScript object literal
 * @returns {Object|null} Object with id, name, and iconPath, or null if parsing fails
 */
function parseTypeScriptObject(objContent) {
  const idMatch = objContent.match(/id:\s*(['"])((?:\\.|(?!\1).)*)\1/);
  if (!idMatch) return null;
  const id = parseJSString(idMatch[0].match(/id:\s*(['"].*?['"])/)[1]);

  const nameMatch = objContent.match(/name:\s*(['"])((?:\\.|(?!\1).)*)\1/);
  if (!nameMatch) return null;
  const name = parseJSString(nameMatch[0].match(/name:\s*(['"].*?['"])/)[1]);

  const iconMatch = objContent.match(/iconPath:\s*(['"])((?:\\.|(?!\1).)*)\1/);
  const iconPath = iconMatch ? parseJSString(iconMatch[0].match(/iconPath:\s*(['"].*?['"])/)[1]) : null;

  return { id, name, iconPath };
}

/**
 * Read items from TypeScript files
 * 
 * @param {string} itemsDir - Directory containing item TypeScript files
 * @param {string[]} itemFiles - Array of item file names to read (defaults to all standard files)
 * @returns {Array} Array of items with id, name, and iconPath
 */
export function readItemsFromTS(itemsDir, itemFiles = null) {
  const items = [];
  
  const defaultItemFiles = [
    'armor.ts',
    'weapons.ts',
    'potions.ts',
    'raw-materials.ts',
    'scrolls.ts',
    'buildings.ts',
    'unknown.ts'
  ];
  
  const filesToRead = itemFiles || defaultItemFiles;
  
  for (const file of filesToRead) {
    const filePath = path.join(itemsDir, file);
    if (!fs.existsSync(filePath)) continue;
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const arrayMatches = content.matchAll(/export const \w+_ITEMS[^=]*=\s*\[([\s\S]*?)\];/g);
    
    for (const arrayMatch of arrayMatches) {
      const arrayContent = arrayMatch[1];
      const objectMatches = arrayContent.matchAll(/\{([\s\S]*?)\}(?=\s*,|\s*$)/g);
      
      for (const match of objectMatches) {
        const objContent = match[1];
        const parsed = parseTypeScriptObject(objContent);
        if (parsed) {
          items.push(parsed);
        }
      }
    }
  }
  
  return items;
}

/**
 * Read abilities from TypeScript files
 * 
 * @param {string} abilitiesDir - Directory containing ability TypeScript files
 * @param {string[]} abilityFiles - Array of ability file names to read (defaults to all standard files)
 * @returns {Array} Array of abilities with id, name, and iconPath
 */
export function readAbilitiesFromTS(abilitiesDir, abilityFiles = null) {
  const abilities = [];
  
  const defaultAbilityFiles = [
    'basic.ts',
    'beastmaster.ts',
    'gatherer.ts',
    'hunter.ts',
    'mage.ts',
    'priest.ts',
    'scout.ts',
    'thief.ts',
    'item.ts',
    'building.ts',
    'unknown.ts'
  ];
  
  const filesToRead = abilityFiles || defaultAbilityFiles;
  
  for (const file of filesToRead) {
    const filePath = path.join(abilitiesDir, file);
    if (!fs.existsSync(filePath)) continue;
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const arrayMatches = content.matchAll(/export const \w+_ABILITIES[^=]*=\s*\[([\s\S]*?)\];/g);
    
    for (const arrayMatch of arrayMatches) {
      const arrayContent = arrayMatch[1];
      const objectMatches = arrayContent.matchAll(/\{([\s\S]*?)\}(?=\s*,|\s*$)/g);
      
      for (const match of objectMatches) {
        const objContent = match[1];
        const parsed = parseTypeScriptObject(objContent);
        if (parsed) {
          abilities.push(parsed);
        }
      }
    }
  }
  
  return abilities;
}

/**
 * Read units from TypeScript files
 * 
 * @param {string} unitsFile - Path to the allUnits.ts file
 * @returns {Array} Array of units with id, name, and iconPath
 */
export function readUnitsFromTS(unitsFile) {
  const units = [];
  
  if (!fs.existsSync(unitsFile)) {
    return units;
  }
  
  const content = fs.readFileSync(unitsFile, 'utf-8');
  const arrayMatch = content.match(/export const ALL_UNITS[^=]*=\s*\[([\s\S]*?)\];/);
  if (!arrayMatch) {
    return units;
  }
  
  const arrayContent = arrayMatch[1];
  const objectMatches = arrayContent.matchAll(/\{([\s\S]*?)\}(?=\s*,|\s*$)/g);
  
  for (const match of objectMatches) {
    const objContent = match[1];
    const parsed = parseTypeScriptObject(objContent);
    if (parsed) {
      units.push(parsed);
    }
  }
  
  return units;
}

/**
 * Get list of TypeScript files in a directory (for scripts that need file paths)
 * 
 * @param {string} dir - Directory to search
 * @param {string[]} excludeFiles - Array of filenames to exclude (e.g., ['index.ts', 'types.ts'])
 * @returns {string[]} Array of full file paths
 */
export function getTypeScriptFiles(dir, excludeFiles = ['index.ts', 'types.ts']) {
  const files = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  function walkDirectory(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        walkDirectory(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.ts')) {
        const fileName = entry.name;
        const relativePath = path.relative(dir, fullPath);
        
        // Check if file should be excluded
        if (!excludeFiles.includes(fileName) && !relativePath.includes('abilityIdMapper')) {
          files.push(fullPath);
        }
      }
    }
  }
  
  walkDirectory(dir);
  return files;
}

