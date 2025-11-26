/**
 * Icon file utilities
 * 
 * Shared functions for working with icon files
 */

import fs from 'fs';
import path from 'path';
import { PATHS, ICON_CATEGORIES } from './constants.mjs';
import { cacheFunction, getCache, setCache } from './cache.mjs';
import { CONFIG } from './config.mjs';

/**
 * Get all icon files with metadata (cached)
 * @param {string} iconsDir - Directory to scan (defaults to PATHS.ICONS_DIR)
 * @param {boolean} useCache - Whether to use cache (default: true)
 * @returns {{icons: Map<string, {category: string, filename: string, fullPath: string}>, allFilenames: string[]}}
 */
export function getAllIconFiles(iconsDir = PATHS.ICONS_DIR, useCache = true) {
  const cacheKey = `iconFiles_${iconsDir}`;
  
  if (useCache) {
    const cached = getCache(cacheKey);
    if (cached !== null) {
      return cached;
    }
  }
  
  const icons = new Map(); // lowercase -> { category, filename, fullPath }
  const allFilenames = []; // For fuzzy matching
  
  for (const category of ICON_CATEGORIES) {
    const categoryDir = path.join(iconsDir, category);
    if (fs.existsSync(categoryDir)) {
      scanDirectory(categoryDir, category, icons, allFilenames, iconsDir);
    }
  }
  
  const result = { icons, allFilenames };
  
  if (useCache) {
    setCache(cacheKey, result, CONFIG.CACHE.ICON_FILES_TTL);
  }
  
  return result;
}

/**
 * Recursively scan directory for PNG files
 */
function scanDirectory(dir, category, icons, allFilenames, baseDir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      scanDirectory(fullPath, category, icons, allFilenames, baseDir);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.png')) {
      const lowerKey = entry.name.toLowerCase();
      if (!icons.has(lowerKey)) {
        icons.set(lowerKey, {
          category,
          filename: entry.name,
          fullPath: fullPath
        });
      }
      allFilenames.push(entry.name);
    }
  }
}

/**
 * Extract filename from icon path
 * @param {string} iconPath - Full path or just filename
 * @returns {string|null} - Just the filename
 */
export function extractIconFilename(iconPath) {
  if (!iconPath) return null;
  const pathParts = iconPath.split(/[/\\]/);
  return pathParts[pathParts.length - 1];
}

/**
 * Find icon file (case-insensitive)
 * @param {string} iconPath - Icon path to search for
 * @param {Map} allIcons - Map of all available icons
 * @returns {{category: string, filename: string, fullPath: string}|null}
 */
export function findIconFile(iconPath, allIcons) {
  if (!iconPath || !allIcons) return null;
  
  const filename = extractIconFilename(iconPath);
  if (!filename) return null;
  
  const lowerKey = filename.toLowerCase();
  return allIcons.get(lowerKey) || null;
}

/**
 * Normalize string for matching (removes color codes, special chars)
 * @param {string} str - String to normalize
 * @returns {string} - Normalized string
 */
export function normalize(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/\|c[0-9A-Fa-f]{8}/g, '') // Remove color codes
    .replace(/\|r/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Generate suggested icon filename from entity name
 * @param {string} name - Entity name
 * @returns {string} - Suggested filename
 */
export function suggestIconFilename(name) {
  let clean = name.replace(/\|c[0-9A-Fa-f]{8}/g, '').replace(/\|r/g, '').trim();
  clean = clean.replace(/[^a-zA-Z0-9]/g, '');
  clean = clean.charAt(0).toUpperCase() + clean.slice(1);
  
  if (!clean.startsWith('BTN') && !clean.startsWith('ATC') && !clean.startsWith('PAS')) {
    clean = 'BTN' + clean;
  }
  
  return clean + '.png';
}

/**
 * Fuzzy match - find similar filenames
 * @param {string} iconPath - Target icon path
 * @param {string[]} allFilenames - All available filenames
 * @param {number} maxResults - Maximum number of results (default from config)
 * @param {number} minSimilarity - Minimum similarity threshold (default from config)
 * @returns {Array<{filename: string, similarity: number}>}
 */
export function findFuzzyMatch(
  iconPath, 
  allFilenames, 
  maxResults = CONFIG.FUZZY_MATCH.MAX_RESULTS,
  minSimilarity = CONFIG.FUZZY_MATCH.MIN_SIMILARITY
) {
  const target = extractIconFilename(iconPath);
  if (!target) return [];
  
  const targetLower = target.toLowerCase();
  const prefixPattern = new RegExp(`^(${CONFIG.FUZZY_MATCH.PREFIXES_TO_STRIP.join('|')})`, 'i');
  const targetBase = targetLower.replace(/\.png$/, '').replace(prefixPattern, '');
  
  const matches = [];
  
  for (const filename of allFilenames) {
    const fileLower = filename.toLowerCase();
    const fileBase = fileLower.replace(/\.png$/, '').replace(prefixPattern, '');
    
    // Check if base names are similar
    if (fileBase.includes(targetBase) || targetBase.includes(fileBase)) {
      const similarity = Math.min(fileBase.length, targetBase.length) / Math.max(fileBase.length, targetBase.length);
      if (similarity >= minSimilarity) {
        matches.push({ filename, similarity });
      }
    }
  }
  
  return matches.sort((a, b) => b.similarity - a.similarity).slice(0, maxResults);
}

