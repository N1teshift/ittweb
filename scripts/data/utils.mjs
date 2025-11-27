/**
 * Shared utilities for data generation scripts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
 */
export function slugify(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
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
 * Normalizes paths and converts .blp to .png
 */
export function convertIconPath(iconPath) {
  if (!iconPath) return undefined;
  
  // Convert Windows backslashes to forward slashes
  let converted = iconPath.replace(/\\/g, '/');
  
  // Remove "ReplaceableTextures/CommandButtons/" prefix if present
  converted = converted.replace(/^ReplaceableTextures\/CommandButtons\//i, '');
  
  // Remove .blp extension and add .png
  converted = converted.replace(/\.blp$/i, '.png');
  
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

