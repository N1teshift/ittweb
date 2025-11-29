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

