/**
 * Validation helpers for common API patterns
 * 
 * These helpers provide reusable validation functions for common API request patterns,
 * reducing boilerplate and ensuring consistent validation across routes.
 */

import type { NextApiRequest } from 'next';
import {
  validateString,
  validateInt,
  validateEnum,
  validateDate,
  validateRequiredFields,
  validateArray,
  validateBoolean,
} from './validators';
import { parseQueryString, parseQueryInt } from './queryParser';

/**
 * Validation schema field definition
 */
export type ValidationField<T = unknown> = {
  name: string;
  required?: boolean;
  validator?: (value: unknown, fieldName: string) => T | string | null;
  defaultValue?: T;
};

/**
 * Validation result
 */
export type ValidationResult<T> = {
  valid: boolean;
  data?: T;
  errors?: string[];
};

/**
 * Validate an API request body against a schema
 * 
 * @example
 * ```typescript
 * const schema: ValidationField[] = [
 *   { name: 'title', required: true, validator: (v, n) => validateString(v, n, 1) },
 *   { name: 'contentType', required: true, validator: (v, n) => validateEnum(v, n, ['post', 'memory']) },
 *   { name: 'date', required: true, validator: (v, n) => validateDate(v, n) },
 * ];
 * 
 * const result = validateApiRequest(body, schema);
 * if (!result.valid) {
 *   return { error: result.errors?.join(', ') };
 * }
 * ```
 */
export function validateApiRequest<T extends Record<string, unknown>>(
  body: unknown,
  schema: ValidationField[]
): ValidationResult<T> {
  if (typeof body !== 'object' || body === null) {
    return {
      valid: false,
      errors: ['Request body must be an object'],
    };
  }

  const bodyObj = body as Record<string, unknown>;
  const errors: string[] = [];
  const validated: Record<string, unknown> = {};

  // Check required fields first
  const requiredFields = schema.filter(f => f.required).map(f => f.name);
  const requiredError = validateRequiredFields(bodyObj, requiredFields);
  if (requiredError) {
    return {
      valid: false,
      errors: [requiredError],
    };
  }

  // Validate each field in schema
  for (const field of schema) {
    const value = bodyObj[field.name];
    
    // Use default if value is missing and not required
    if (value === undefined || value === null) {
      if (field.defaultValue !== undefined) {
        validated[field.name] = field.defaultValue;
      }
      continue;
    }

    // Run validator if provided
    if (field.validator) {
      const result = field.validator(value, field.name);
      if (typeof result === 'string') {
        errors.push(result);
      } else if (result === null) {
        errors.push(`${field.name} is invalid`);
      } else {
        validated[field.name] = result;
      }
    } else {
      // No validator, just copy the value
      validated[field.name] = value;
    }
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
    };
  }

  return {
    valid: true,
    data: validated as T,
  };
}

/**
 * Validate pagination parameters from query string
 * 
 * @example
 * ```typescript
 * const pagination = validatePaginationParams(req, { defaultLimit: 20, maxLimit: 100 });
 * if (!pagination.valid) {
 *   return { error: pagination.errors?.join(', ') };
 * }
 * // Use pagination.data.page and pagination.data.limit
 * ```
 */
export function validatePaginationParams(
  req: NextApiRequest,
  options: {
    defaultPage?: number;
    defaultLimit?: number;
    minLimit?: number;
    maxLimit?: number;
  } = {}
): ValidationResult<{ page: number; limit: number }> {
  const {
    defaultPage = 1,
    defaultLimit = 20,
    minLimit = 1,
    maxLimit = 100,
  } = options;

  const pageStr = parseQueryString(req, 'page');
  const limitStr = parseQueryString(req, 'limit');

  const errors: string[] = [];

  // Validate page
  let page = defaultPage;
  if (pageStr !== undefined) {
    const pageResult = validateInt(pageStr, 'page', 1);
    if (typeof pageResult === 'string') {
      errors.push(pageResult);
    } else if (pageResult === null) {
      errors.push('page must be a valid integer');
    } else {
      page = pageResult;
    }
  }

  // Validate limit
  let limit = defaultLimit;
  if (limitStr !== undefined) {
    const limitResult = validateInt(limitStr, 'limit', minLimit, maxLimit);
    if (typeof limitResult === 'string') {
      errors.push(limitResult);
    } else if (limitResult === null) {
      errors.push('limit must be a valid integer');
    } else {
      limit = limitResult;
    }
  } else {
    // Apply max limit to default if provided
    if (defaultLimit > maxLimit) {
      limit = maxLimit;
    }
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
    };
  }

  return {
    valid: true,
    data: { page, limit },
  };
}

/**
 * Validate date range parameters from query string
 * 
 * @example
 * ```typescript
 * const dateRange = validateDateRange(req, 'startDate', 'endDate');
 * if (!dateRange.valid) {
 *   return { error: dateRange.errors?.join(', ') };
 * }
 * // Use dateRange.data.startDate and dateRange.data.endDate
 * ```
 */
export function validateDateRange(
  req: NextApiRequest,
  startDateField: string = 'startDate',
  endDateField: string = 'endDate'
): ValidationResult<{ startDate?: Date; endDate?: Date }> {
  const startDateStr = parseQueryString(req, startDateField);
  const endDateStr = parseQueryString(req, endDateField);

  const errors: string[] = [];
  const result: { startDate?: Date; endDate?: Date } = {};

  // Validate start date
  if (startDateStr !== undefined) {
    const startDate = validateDate(startDateStr, startDateField);
    if (startDate === null) {
      errors.push(`${startDateField} must be a valid date`);
    } else {
      result.startDate = startDate;
    }
  }

  // Validate end date
  if (endDateStr !== undefined) {
    const endDate = validateDate(endDateStr, endDateField);
    if (endDate === null) {
      errors.push(`${endDateField} must be a valid date`);
    } else {
      result.endDate = endDate;
    }
  }

  // Validate that start date is before end date
  if (result.startDate && result.endDate) {
    if (result.startDate > result.endDate) {
      errors.push(`${startDateField} must be before ${endDateField}`);
    }
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
    };
  }

  return {
    valid: true,
    data: result,
  };
}

/**
 * Validate enum field with proper error handling
 * This is a convenience wrapper around validateEnum that handles the common pattern
 * of checking for null or invalid enum values.
 * 
 * @example
 * ```typescript
 * const contentType = validateEnumField(body.contentType, 'contentType', ['post', 'memory']);
 * if (typeof contentType === 'string' && contentType.startsWith('contentType')) {
 *   return { error: contentType }; // It's an error message
 * }
 * // contentType is now 'post' | 'memory'
 * ```
 */
export function validateEnumField<T extends string>(
  value: unknown,
  fieldName: string,
  allowedValues: readonly T[]
): T | string {
  const result = validateEnum(value, fieldName, allowedValues);
  
  // validateEnum returns the value when valid, error string when invalid, or null when not a string
  if (result === null) {
    return `${fieldName} must be a string`;
  }
  
  if (typeof result === 'string' && !allowedValues.includes(result as T)) {
    return result; // It's an error message
  }
  
  return result as T;
}

/**
 * Create a validator function for a string field
 */
export function createStringValidator(
  minLength: number = 1,
  maxLength?: number
): (value: unknown, fieldName: string) => string | string | null {
  return (value: unknown, fieldName: string) => validateString(value, fieldName, minLength, maxLength);
}

/**
 * Create a validator function for an integer field
 */
export function createIntValidator(
  min?: number,
  max?: number
): (value: unknown, fieldName: string) => number | string | null {
  return (value: unknown, fieldName: string) => validateInt(value, fieldName, min, max);
}

/**
 * Create a validator function for an enum field
 */
export function createEnumValidator<T extends string>(
  allowedValues: readonly T[]
): (value: unknown, fieldName: string) => T | string | null {
  return (value: unknown, fieldName: string) => validateEnum(value, fieldName, allowedValues);
}

/**
 * Create a validator function for a date field
 */
export function createDateValidator(): (value: unknown, fieldName: string) => Date | null {
  return (value: unknown, fieldName: string) => validateDate(value, fieldName);
}

/**
 * Create a validator function for a boolean field
 */
export function createBooleanValidator(): (value: unknown, fieldName: string) => boolean | null {
  return (value: unknown, fieldName: string) => validateBoolean(value, fieldName);
}

/**
 * Create a validator function for an array field
 */
export function createArrayValidator<T>(
  itemValidator?: (item: unknown, index: number) => T | string | null,
  minLength?: number,
  maxLength?: number
): (value: unknown, fieldName: string) => T[] | string | null {
  return (value: unknown, fieldName: string) => validateArray(value, fieldName, itemValidator, minLength, maxLength);
}

