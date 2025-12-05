import { createComponentLogger } from './logger';

/**
 * Common API error types
 */
export enum ApiErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  RATE_LIMIT = 'RATE_LIMIT',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  VALIDATION = 'VALIDATION',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Standardized API error interface
 */
export interface ApiError {
  type: ApiErrorType;
  message: string;
  statusCode?: number;
  service: string;
  endpoint?: string;
  originalError?: Error;
  retryable: boolean;
}

/**
 * Create a standardized API error
 */
export function createApiError(
  type: ApiErrorType,
  message: string,
  service: string,
  options: {
    statusCode?: number;
    endpoint?: string;
    originalError?: Error;
    retryable?: boolean;
  } = {}
): ApiError {
  return {
    type,
    message,
    service,
    retryable: options.retryable ?? isRetryableError(type, options.statusCode),
    ...options,
  };
}

/**
 * Determine if an error is retryable based on type and status code
 */
function isRetryableError(type: ApiErrorType, statusCode?: number): boolean {
  switch (type) {
    case ApiErrorType.NETWORK:
    case ApiErrorType.RATE_LIMIT:
    case ApiErrorType.SERVER_ERROR:
      return true;
    case ApiErrorType.QUOTA_EXCEEDED:
      return false;
    default:
      // For unknown types, retry on 5xx errors
      return statusCode ? statusCode >= 500 && statusCode < 600 : false;
  }
}

/**
 * Type guard for axios-like errors
 */
export function isAxiosError(err: unknown): err is { response?: { status: number; data: unknown } } {
  return typeof err === 'object' && err !== null && 'response' in err;
}

/**
 * Type guard for Error objects
 */
export function isError(err: unknown): err is Error {
  return err instanceof Error;
}

/**
 * Create a component logger for error handling
 */
export function createErrorLogger(service: string) {
  return createComponentLogger('ApiErrorHandler', service);
}
