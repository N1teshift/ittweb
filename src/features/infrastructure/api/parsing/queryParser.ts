import type { NextApiRequest } from 'next';

/**
 * Parse a query parameter as a string
 * Returns the first value if it's an array, or the value itself
 */
export function parseQueryString(
  req: NextApiRequest,
  key: string,
  defaultValue?: string
): string | undefined {
  const value = req.query[key];
  if (!value) return defaultValue;
  
  if (Array.isArray(value)) {
    return value[0] || defaultValue;
  }
  
  return value || defaultValue;
}

/**
 * Parse a query parameter as a required string
 * Throws error if not present
 */
export function parseRequiredQueryString(
  req: NextApiRequest,
  key: string
): string {
  const value = parseQueryString(req, key);
  if (!value) {
    throw new Error(`${key} query parameter is required`);
  }
  return value;
}

/**
 * Parse a query parameter as an integer
 */
export function parseQueryInt(
  req: NextApiRequest,
  key: string,
  defaultValue?: number
): number | undefined {
  const value = req.query[key];
  if (!value) return defaultValue;
  
  const str = Array.isArray(value) ? value[0] : value;
  const parsed = parseInt(str, 10);
  
  if (isNaN(parsed)) {
    return defaultValue;
  }
  
  return parsed;
}

/**
 * Parse a query parameter as a required integer
 * Throws error if not present or invalid
 */
export function parseRequiredQueryInt(
  req: NextApiRequest,
  key: string
): number {
  const value = parseQueryInt(req, key);
  if (value === undefined) {
    throw new Error(`${key} query parameter is required and must be a valid integer`);
  }
  return value;
}

/**
 * Parse a query parameter as a boolean
 */
export function parseQueryBoolean(
  req: NextApiRequest,
  key: string,
  defaultValue?: boolean
): boolean | undefined {
  const value = req.query[key];
  if (value === undefined) return defaultValue;
  
  const str = Array.isArray(value) ? value[0] : value;
  
  if (str === 'true' || str === '1') return true;
  if (str === 'false' || str === '0') return false;
  
  return defaultValue;
}

/**
 * Parse a query parameter as a date
 */
export function parseQueryDate(
  req: NextApiRequest,
  key: string,
  defaultValue?: Date
): Date | undefined {
  const value = req.query[key];
  if (!value) return defaultValue;
  
  const str = Array.isArray(value) ? value[0] : value;
  const date = new Date(str);
  
  if (isNaN(date.getTime())) {
    return defaultValue;
  }
  
  return date;
}

/**
 * Parse a query parameter as an enum value
 */
export function parseQueryEnum<T extends string>(
  req: NextApiRequest,
  key: string,
  allowedValues: readonly T[],
  defaultValue?: T
): T | undefined {
  const value = parseQueryString(req, key);
  if (!value) return defaultValue;
  
  if (allowedValues.includes(value as T)) {
    return value as T;
  }
  
  return defaultValue;
}

/**
 * Parse comma-separated values from a query parameter
 */
export function parseQueryArray(
  req: NextApiRequest,
  key: string,
  defaultValue?: string[]
): string[] | undefined {
  const value = req.query[key];
  if (!value) return defaultValue;
  
  if (Array.isArray(value)) {
    return value;
  }
  
  // Split by comma and trim each value
  return value.split(',').map(v => v.trim()).filter(v => v.length > 0);
}

/**
 * Parse pagination parameters (page and limit)
 */
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export function parsePagination(
  req: NextApiRequest,
  defaultLimit: number = 20,
  maxLimit: number = 100
): PaginationParams {
  const page = parseQueryInt(req, 'page', 1) || 1;
  const limit = Math.min(
    parseQueryInt(req, 'limit', defaultLimit) || defaultLimit,
    maxLimit
  );
  
  return {
    page: Math.max(1, page),
    limit,
    offset: (page - 1) * limit
  };
}

