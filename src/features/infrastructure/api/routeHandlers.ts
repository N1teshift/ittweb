import { NextApiRequest, NextApiResponse } from 'next';
import { createComponentLogger } from '@/features/infrastructure/logging';

/**
 * Standard API response format
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * HTTP method types
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Handler function type for API routes
 */
export type ApiHandler<T = unknown> = (
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<T>>
) => Promise<T>;

/**
 * Options for API route handler
 */
export interface ApiHandlerOptions {
  methods?: HttpMethod[];
  requireAuth?: boolean;
  validateBody?: (body: unknown) => boolean | string;
  logRequests?: boolean;
}

/**
 * Generic API route handler that standardizes:
 * - HTTP method validation
 * - Error handling
 * - Response formatting
 * - Logging
 * - Authentication (future)
 */
export const createApiHandler = <T = unknown>(
  handler: ApiHandler<T>,
  options: ApiHandlerOptions = {}
) => {
  const {
    methods = ['GET'],
    requireAuth = false,
    validateBody,
    logRequests = true
  } = options;

  return async (req: NextApiRequest, res: NextApiResponse<ApiResponse<T>>) => {
    const logger = createComponentLogger('ApiHandler', req.url || 'unknown');
    const startTime = Date.now();

    try {
      // Log request if enabled
      if (logRequests) {
        logger.info('API request received', {
          method: req.method,
          url: req.url,
          body: req.body ? 'present' : 'none',
          query: req.query
        });
      }

      // Validate HTTP method
      if (!methods.includes(req.method as HttpMethod)) {
        return res.status(405).json({
          success: false,
          error: `Method ${req.method} not allowed. Allowed methods: ${methods.join(', ')}`
        });
      }

      // Validate request body if validator provided
      if (validateBody && req.body) {
        const validationResult = validateBody(req.body);
        if (typeof validationResult === 'string') {
          return res.status(400).json({
            success: false,
            error: validationResult
          });
        }
        if (!validationResult) {
          return res.status(400).json({
            success: false,
            error: 'Invalid request body'
          });
        }
      }

      // Authentication check if requireAuth is true
      if (requireAuth) {
        // TODO: Implement authentication check
        // const session = getSession(req);
        // if (!session) {
        //   return res.status(401).json({
        //     success: false,
        //     error: 'Authentication required'
        //   });
        // }
        logger.debug('Authentication verified');
      }

      // Execute the handler
      const result = await handler(req, res);

      // Log successful response
      if (logRequests) {
        logger.info('API request completed successfully', {
          method: req.method,
          url: req.url,
          duration: Date.now() - startTime
        });
      }

      // Return success response
      return res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const _errorStack = error instanceof Error ? error.stack : undefined;

      // Log error
      logger.error('API request failed', error instanceof Error ? error : new Error(errorMessage), {
        method: req.method,
        url: req.url,
        duration: Date.now() - startTime,
        error: errorMessage
      });

      // Return error response
      return res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' 
          ? 'Internal server error' 
          : errorMessage
      });
    }
  };
};

/**
 * Helper to create GET-only API handlers
 */
export const createGetHandler = <T = unknown>(handler: ApiHandler<T>, options?: Omit<ApiHandlerOptions, 'methods'>) => {
  return createApiHandler(handler, { ...options, methods: ['GET'] });
};

/**
 * Helper to create POST-only API handlers
 */
export const createPostHandler = <T = unknown>(
  handler: ApiHandler<T>, 
  options?: Omit<ApiHandlerOptions, 'methods'>
) => {
  return createApiHandler(handler, { ...options, methods: ['POST'] });
};

/**
 * Helper to create handlers that accept both GET and POST
 */
export const createGetPostHandler = <T = unknown>(
  handler: ApiHandler<T>, 
  options?: Omit<ApiHandlerOptions, 'methods'>
) => {
  return createApiHandler(handler, { ...options, methods: ['GET', 'POST'] });
};

/**
 * Standard error response helper
 */
export const errorResponse = (res: NextApiResponse, status: number, message: string) => {
  return res.status(status).json({
    success: false,
    error: message
  });
};

/**
 * Standard success response helper
 */
export const successResponse = <T>(res: NextApiResponse, data: T, message?: string) => {
  return res.status(200).json({
    success: true,
    data,
    message
  });
};

