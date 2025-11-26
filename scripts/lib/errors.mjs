/**
 * Error handling utilities
 * 
 * Custom error classes and error handling helpers
 */

import fs from 'fs';
import path from 'path';
import * as loggerModule from './logger.mjs';

/**
 * Custom error for file operations
 */
export class FileError extends Error {
  constructor(message, filePath, cause = null) {
    super(message);
    this.name = 'FileError';
    this.filePath = filePath;
    this.cause = cause;
  }
}

/**
 * Custom error for parsing operations
 */
export class ParseError extends Error {
  constructor(message, source, cause = null) {
    super(message);
    this.name = 'ParseError';
    this.source = source;
    this.cause = cause;
  }
}

/**
 * Custom error for validation
 */
export class ValidationError extends Error {
  constructor(message, field, value) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
  }
}

/**
 * Handle error with logging and optional recovery
 */
export function handleError(error, context = '', recover = null) {
  if (error instanceof FileError) {
    loggerModule.error(`${context}: File error`, {
      message: error.message,
      filePath: error.filePath,
      cause: error.cause?.message,
    });
  } else if (error instanceof ParseError) {
    loggerModule.error(`${context}: Parse error`, {
      message: error.message,
      source: error.source,
      cause: error.cause?.message,
    });
  } else if (error instanceof ValidationError) {
    loggerModule.error(`${context}: Validation error`, {
      message: error.message,
      field: error.field,
      value: error.value,
    });
  } else {
    loggerModule.error(`${context}: Unexpected error`, {
      message: error.message,
      stack: error.stack,
    });
  }
  
  if (recover && typeof recover === 'function') {
    try {
      return recover(error);
    } catch (recoveryError) {
      loggerModule.error('Recovery function failed', recoveryError);
      throw recoveryError;
    }
  }
  
  throw error;
}

/**
 * Safe file read with error handling
 */
export function safeReadFile(filePath, defaultValue = null) {
  try {
    if (!fs.existsSync(filePath)) {
      if (defaultValue !== null) {
        return defaultValue;
      }
      throw new FileError(`File not found: ${filePath}`, filePath);
    }
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    if (error instanceof FileError) {
      throw error;
    }
    throw new FileError(`Failed to read file: ${filePath}`, filePath, error);
  }
}

/**
 * Safe file write with error handling
 */
export function safeWriteFile(filePath, content) {
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  } catch (error) {
    throw new FileError(`Failed to write file: ${filePath}`, filePath, error);
  }
}

