/**
 * Validation utilities
 * 
 * Input validation and sanitization functions
 */

import { ValidationError } from './errors.mjs';
import { CONFIG } from './config.mjs';

/**
 * Validate entity name
 */
export function validateName(name, fieldName = 'name') {
  if (!name || typeof name !== 'string') {
    throw new ValidationError(`${fieldName} must be a non-empty string`, fieldName, name);
  }
  
  if (name.length > CONFIG.VALIDATION.MAX_NAME_LENGTH) {
    throw new ValidationError(
      `${fieldName} exceeds maximum length of ${CONFIG.VALIDATION.MAX_NAME_LENGTH}`,
      fieldName,
      name
    );
  }
  
  return name.trim();
}

/**
 * Validate entity ID
 */
export function validateId(id, fieldName = 'id') {
  if (!id || typeof id !== 'string') {
    throw new ValidationError(`${fieldName} must be a non-empty string`, fieldName, id);
  }
  
  if (id.length > CONFIG.VALIDATION.MAX_ID_LENGTH) {
    throw new ValidationError(
      `${fieldName} exceeds maximum length of ${CONFIG.VALIDATION.MAX_ID_LENGTH}`,
      fieldName,
      id
    );
  }
  
  return id.trim();
}

/**
 * Validate file path
 */
export function validatePath(filePath, fieldName = 'path') {
  if (!filePath || typeof filePath !== 'string') {
    throw new ValidationError(`${fieldName} must be a non-empty string`, fieldName, filePath);
  }
  
  if (filePath.length > CONFIG.VALIDATION.MAX_PATH_LENGTH) {
    throw new ValidationError(
      `${fieldName} exceeds maximum length of ${CONFIG.VALIDATION.MAX_PATH_LENGTH}`,
      fieldName,
      filePath
    );
  }
  
  return filePath.trim();
}

/**
 * Validate icon filename
 */
export function validateIconFilename(filename) {
  if (!filename || typeof filename !== 'string') {
    throw new ValidationError('Icon filename must be a non-empty string', 'filename', filename);
  }
  
  if (!filename.toLowerCase().endsWith('.png')) {
    throw new ValidationError('Icon filename must end with .png', 'filename', filename);
  }
  
  // Check for invalid characters
  if (/[<>:"|?*]/.test(filename)) {
    throw new ValidationError('Icon filename contains invalid characters', 'filename', filename);
  }
  
  return filename;
}

/**
 * Validate category
 */
export function validateCategory(category, validCategories) {
  if (!category || typeof category !== 'string') {
    throw new ValidationError('Category must be a non-empty string', 'category', category);
  }
  
  if (!validCategories.includes(category)) {
    throw new ValidationError(
      `Category must be one of: ${validCategories.join(', ')}`,
      'category',
      category
    );
  }
  
  return category;
}

/**
 * Sanitize string for use in file paths
 */
export function sanitizeForPath(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/[<>:"|?*\x00-\x1f]/g, '') // Remove invalid filename characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}



