/**
 * Validation utilities for API request validation
 */

/**
 * Validate that a value is a non-empty string
 */
export function validateString(
  value: unknown,
  fieldName: string,
  minLength: number = 1,
  maxLength?: number
): string | string | null {
  if (typeof value !== 'string') {
    return `${fieldName} must be a string`;
  }
  
  const trimmed = value.trim();
  if (trimmed.length < minLength) {
    return `${fieldName} must be at least ${minLength} character(s)`;
  }
  
  if (maxLength && trimmed.length > maxLength) {
    return `${fieldName} must be at most ${maxLength} characters`;
  }
  
  return trimmed; // Return the validated string value (not null)
}

/**
 * Validate that a value is a valid integer
 */
export function validateInt(
  value: unknown,
  fieldName: string,
  min?: number,
  max?: number
): number | string | null {
  if (typeof value === 'number') {
    if (!Number.isInteger(value)) {
      return `${fieldName} must be an integer`;
    }
    if (min !== undefined && value < min) {
      return `${fieldName} must be at least ${min}`;
    }
    if (max !== undefined && value > max) {
      return `${fieldName} must be at most ${max}`;
    }
    return value;
  }
  
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      return `${fieldName} must be a valid integer`;
    }
    if (min !== undefined && parsed < min) {
      return `${fieldName} must be at least ${min}`;
    }
    if (max !== undefined && parsed > max) {
      return `${fieldName} must be at most ${max}`;
    }
    return parsed;
  }
  
  return null;
}

/**
 * Validate that a value is a valid date string or Date object
 */
export function validateDate(
  value: unknown,
  fieldName: string
): Date | null {
  if (value instanceof Date) {
    if (isNaN(value.getTime())) {
      return null;
    }
    return value;
  }
  
  if (typeof value === 'string') {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date;
  }
  
  return null;
}

/**
 * Validate that a value is one of the allowed values
 */
export function validateEnum<T extends string>(
  value: unknown,
  fieldName: string,
  allowedValues: readonly T[]
): T | string | null {
  if (typeof value !== 'string') {
    return null;
  }
  
  if (!allowedValues.includes(value as T)) {
    return `${fieldName} must be one of: ${allowedValues.join(', ')}`;
  }
  
  return value as T;
}

/**
 * Validate that a value is a boolean
 */
export function validateBoolean(value: unknown, fieldName: string): boolean | null {
  if (typeof value === 'boolean') {
    return value;
  }
  
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  
  return null;
}

/**
 * Validate that a value is an array
 */
export function validateArray<T>(
  value: unknown,
  fieldName: string,
  itemValidator?: (item: unknown, index: number) => T | string | null,
  minLength?: number,
  maxLength?: number
): T[] | string | null {
  if (!Array.isArray(value)) {
    return `${fieldName} must be an array`;
  }
  
  if (minLength !== undefined && value.length < minLength) {
    return `${fieldName} must have at least ${minLength} item(s)`;
  }
  
  if (maxLength !== undefined && value.length > maxLength) {
    return `${fieldName} must have at most ${maxLength} item(s)`;
  }
  
  if (itemValidator) {
    const errors: string[] = [];
    const validated: T[] = [];
    
    for (let i = 0; i < value.length; i++) {
      const result = itemValidator(value[i], i);
      if (typeof result === 'string') {
        errors.push(`Item ${i}: ${result}`);
      } else if (result === null) {
        errors.push(`Item ${i}: invalid`);
      } else {
        validated.push(result);
      }
    }
    
    if (errors.length > 0) {
      return `${fieldName} validation errors: ${errors.join('; ')}`;
    }
    
    return validated;
  }
  
  return value as T[];
}

/**
 * Validate that required fields are present in an object
 */
export function validateRequiredFields(
  obj: unknown,
  requiredFields: string[]
): string | null {
  if (typeof obj !== 'object' || obj === null) {
    return 'Request body must be an object';
  }
  
  const body = obj as Record<string, unknown>;
  const missing: string[] = [];
  
  for (const field of requiredFields) {
    if (!(field in body) || body[field] === undefined || body[field] === null) {
      missing.push(field);
    }
  }
  
  if (missing.length > 0) {
    return `Missing required fields: ${missing.join(', ')}`;
  }
  
  return null;
}

