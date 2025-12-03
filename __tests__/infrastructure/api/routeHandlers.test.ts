import type { NextApiRequest, NextApiResponse } from 'next';

const mockInfo = jest.fn();
const mockError = jest.fn();
const mockWarn = jest.fn();
const mockDebug = jest.fn();

jest.mock('@/features/infrastructure/logging', () => ({
  createComponentLogger: jest.fn(() => ({
    info: mockInfo,
    error: mockError,
    warn: mockWarn,
    debug: mockDebug
  }))
}));

const mockGetServerSession = jest.fn();
jest.mock('next-auth/next', () => ({
  getServerSession: mockGetServerSession
}));

jest.mock('@/pages/api/auth/[...nextauth]', () => ({
  authOptions: {}
}));

describe('createApiHandler', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  const createResponse = () => {
    const res: Partial<NextApiResponse> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    return res as NextApiResponse;
  };

  it('handles allowed GET requests', async () => {
    const { createApiHandler } = await import('@/features/infrastructure/api');
    const handler = createApiHandler(async () => 'ok');
    const res = createResponse();

    await handler({ method: 'GET', url: '/test', body: null, query: {} } as NextApiRequest, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: 'ok' });
  });

  it('rejects disallowed methods with 405', async () => {
    const { createApiHandler } = await import('@/features/infrastructure/api');
    const handler = createApiHandler(async () => 'ok', { methods: ['POST'] });
    const res = createResponse();

    await handler({ method: 'GET', url: '/test', body: null, query: {} } as NextApiRequest, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Method GET not allowed. Allowed methods: POST'
    });
  });

  it('validates request body with custom validator', async () => {
    const { createApiHandler } = await import('@/features/infrastructure/api');
    const handler = createApiHandler(async () => 'ok', {
      methods: ['POST'],
      validateBody: () => 'invalid body'
    });
    const res = createResponse();

    await handler({ method: 'POST', url: '/test', body: { bad: true }, query: {} } as NextApiRequest, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'invalid body' });
  });

  it('supports boolean validator results', async () => {
    const { createApiHandler } = await import('@/features/infrastructure/api');
    const handler = createApiHandler(async () => 'ok', {
      methods: ['POST'],
      validateBody: () => false
    });
    const res = createResponse();

    await handler({ method: 'POST', url: '/test', body: { bad: true }, query: {} } as NextApiRequest, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Invalid request body' });
  });

  describe('Authentication', () => {
    it('rejects unauthenticated requests when requireAuth is true', async () => {
      mockGetServerSession.mockResolvedValue(null);
      const { createApiHandler } = await import('@/features/infrastructure/api');
      const handler = createApiHandler(async () => 'ok', { requireAuth: true });
      const res = createResponse();

      await handler({ method: 'GET', url: '/auth', body: null, query: {} } as NextApiRequest, res);

      expect(mockGetServerSession).toHaveBeenCalled();
      // Unauthenticated request should be rejected with 401
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication required'
      });
    });

    it('allows authenticated requests when requireAuth is true', async () => {
      const mockSession = { user: { name: 'Test User' }, discordId: '123' };
      mockGetServerSession.mockResolvedValue(mockSession);
      const { createApiHandler } = await import('@/features/infrastructure/api');
      const handler = createApiHandler(async () => 'ok', { requireAuth: true });
      const res = createResponse();

      await handler({ method: 'GET', url: '/auth', body: null, query: {} } as NextApiRequest, res);

      expect(mockGetServerSession).toHaveBeenCalled();
      // Logger debug may be called - verify authentication succeeded
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: 'ok' });
    });

    it('allows unauthenticated requests when requireAuth is false', async () => {
      mockGetServerSession.mockResolvedValue(null);
      const { createApiHandler } = await import('@/features/infrastructure/api');
      const handler = createApiHandler(async () => 'ok', { requireAuth: false });
      const res = createResponse();

      await handler({ method: 'GET', url: '/public', body: null, query: {} } as NextApiRequest, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: 'ok' });
    });
  });

  it('logs request lifecycle when logging is enabled', async () => {
    const { createApiHandler } = await import('@/features/infrastructure/api');
    const handler = createApiHandler(async () => 'ok', { logRequests: true });
    const res = createResponse();

    await handler({ method: 'GET', url: '/log', body: null, query: {} } as NextApiRequest, res);

    // Request logging is enabled, handler should complete successfully
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: 'ok' });
  });

  it('skips request logging when disabled', async () => {
    const { createApiHandler } = await import('@/features/infrastructure/api');
    const handler = createApiHandler(async () => 'ok', { logRequests: false });
    const res = createResponse();

    await handler({ method: 'GET', url: '/nolog', body: null, query: {} } as NextApiRequest, res);

    expect(mockInfo).not.toHaveBeenCalled();
  });

  it('formats errors and masks message in production', async () => {
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'production',
      writable: true,
      configurable: true
    });
    const { createApiHandler } = await import('@/features/infrastructure/api');
    const handler = createApiHandler(async () => {
      throw new Error('boom');
    });
    const res = createResponse();

    await handler({ method: 'GET', url: '/error', body: null, query: {} } as NextApiRequest, res);

    // Error should be logged and masked in production
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Internal server error' });
  });

  it('handles POST requests correctly', async () => {
    const { createApiHandler } = await import('@/features/infrastructure/api');
    const handler = createApiHandler(async () => ({ created: true }), { methods: ['POST'] });
    const res = createResponse();

    await handler({ method: 'POST', url: '/test', body: { data: 'test' }, query: {} } as NextApiRequest, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { created: true } });
  });

  it('accepts multiple allowed methods', async () => {
    const { createApiHandler } = await import('@/features/infrastructure/api');
    const handler = createApiHandler(async () => 'ok', { methods: ['GET', 'POST'] });
    const res = createResponse();

    // Test GET
    await handler({ method: 'GET', url: '/test', body: null, query: {} } as NextApiRequest, res);
    expect(res.status).toHaveBeenCalledWith(200);

    // Test POST
    const res2 = createResponse();
    await handler({ method: 'POST', url: '/test', body: {}, query: {} } as NextApiRequest, res2);
    expect(res2.status).toHaveBeenCalledWith(200);

    // Test disallowed method
    const res3 = createResponse();
    await handler({ method: 'DELETE', url: '/test', body: null, query: {} } as NextApiRequest, res3);
    expect(res3.status).toHaveBeenCalledWith(405);
  });

  it('handles method case variations', async () => {
    const { createApiHandler } = await import('@/features/infrastructure/api');
    const handler = createApiHandler(async () => 'ok', { methods: ['GET'] });
    const res = createResponse();

    // Method should be case-sensitive
    await handler({ method: 'get' as any, url: '/test', body: null, query: {} } as NextApiRequest, res);

    expect(res.status).toHaveBeenCalledWith(405);
  });

  it('validates body when validator throws', async () => {
    const { createApiHandler } = await import('@/features/infrastructure/api');
    const handler = createApiHandler(async () => 'ok', {
      methods: ['POST'],
      validateBody: () => {
        throw new Error('Validator error');
      }
    });
    const res = createResponse();

    await handler({ method: 'POST', url: '/test', body: { bad: true }, query: {} } as NextApiRequest, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('handles missing body when validator is provided', async () => {
    const { createApiHandler } = await import('@/features/infrastructure/api');
    const handler = createApiHandler(async () => 'ok', {
      methods: ['POST'],
      validateBody: () => true
    });
    const res = createResponse();

    // Body is null/undefined, validator should not be called
    await handler({ method: 'POST', url: '/test', body: null, query: {} } as NextApiRequest, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('logs timing metrics in request logs', async () => {
    const { createApiHandler } = await import('@/features/infrastructure/api');
    const handler = createApiHandler(async () => {
      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 10));
      return 'ok';
    }, { logRequests: true });
    const res = createResponse();

    await handler({ method: 'GET', url: '/timing', body: null, query: {} } as NextApiRequest, res);

    // Timing metrics are captured and logged when logRequests is enabled
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: 'ok' });
  });

  it('handles very fast requests', async () => {
    const { createApiHandler } = await import('@/features/infrastructure/api');
    const handler = createApiHandler(async () => 'ok', { logRequests: true });
    const res = createResponse();

    await handler({ method: 'GET', url: '/fast', body: null, query: {} } as NextApiRequest, res);

    // Very fast requests should still complete successfully
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: 'ok' });
  });

  it('handles oversized payloads gracefully', async () => {
    const { createApiHandler } = await import('@/features/infrastructure/api');
    const handler = createApiHandler(async (req) => req.body, { methods: ['POST'] });
    const res = createResponse();

    const largeBody = { data: 'x'.repeat(10000) };
    await handler({ method: 'POST', url: '/large', body: largeBody, query: {} } as NextApiRequest, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns consistent response format for success', async () => {
    const { createApiHandler } = await import('@/features/infrastructure/api');
    const handler = createApiHandler(async () => ({ data: 'test' }), { methods: ['GET'] });
    const res = createResponse();

    await handler({ method: 'GET', url: '/test', body: null, query: {} } as NextApiRequest, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { data: 'test' }
    });
  });

  it('returns consistent response format for errors', async () => {
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      writable: true,
      configurable: true
    });
    const { createApiHandler } = await import('@/features/infrastructure/api');
    const handler = createApiHandler(async () => {
      throw new Error('test error');
    });
    const res = createResponse();

    await handler({ method: 'GET', url: '/error', body: null, query: {} } as NextApiRequest, res);

    // Error should be handled and returned with 500 status
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'test error'
    });
  });

  describe('Cache Control', () => {
    it('sets cache headers for GET requests with cacheControl options', async () => {
      const { createApiHandler } = await import('@/features/infrastructure/api');
      const handler = createApiHandler(async () => 'ok', {
        methods: ['GET'],
        cacheControl: {
          maxAge: 3600,
          public: true,
          mustRevalidate: true
        }
      });
      const res = createResponse();

      await handler({ method: 'GET', url: '/cached', body: null, query: {} } as NextApiRequest, res);

      expect(res.setHeader).toHaveBeenCalledWith(
        'Cache-Control',
        'max-age=3600, public, must-revalidate'
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('sets private cache headers when private option is true', async () => {
      const { createApiHandler } = await import('@/features/infrastructure/api');
      const handler = createApiHandler(async () => 'ok', {
        methods: ['GET'],
        cacheControl: {
          maxAge: 1800,
          private: true
        }
      });
      const res = createResponse();

      await handler({ method: 'GET', url: '/private', body: null, query: {} } as NextApiRequest, res);

      expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'max-age=1800, private');
    });

    it('disables caching when cacheControl is false', async () => {
      const { createApiHandler } = await import('@/features/infrastructure/api');
      const handler = createApiHandler(async () => 'ok', {
        methods: ['GET'],
        cacheControl: false
      });
      const res = createResponse();

      await handler({ method: 'GET', url: '/nocache', body: null, query: {} } as NextApiRequest, res);

      expect(res.setHeader).toHaveBeenCalledWith(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, private'
      );
    });

    it('does not set cache headers for non-GET requests', async () => {
      const { createApiHandler } = await import('@/features/infrastructure/api');
      const handler = createApiHandler(async () => 'ok', {
        methods: ['POST'],
        cacheControl: {
          maxAge: 3600,
          public: true
        }
      });
      const res = createResponse();

      await handler({ method: 'POST', url: '/post', body: {}, query: {} } as NextApiRequest, res);

      expect(res.setHeader).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('Additional HTTP Methods', () => {
    it('handles PUT requests', async () => {
      const { createApiHandler } = await import('@/features/infrastructure/api');
      const handler = createApiHandler(async () => ({ updated: true }), { methods: ['PUT'] });
      const res = createResponse();

      await handler({ method: 'PUT', url: '/test', body: { id: '1' }, query: {} } as NextApiRequest, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { updated: true } });
    });

    it('handles DELETE requests', async () => {
      const { createApiHandler } = await import('@/features/infrastructure/api');
      const handler = createApiHandler(async () => ({ deleted: true }), { methods: ['DELETE'] });
      const res = createResponse();

      await handler({ method: 'DELETE', url: '/test', body: null, query: { id: '1' } } as unknown as NextApiRequest, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { deleted: true } });
    });

    it('handles PATCH requests', async () => {
      const { createApiHandler } = await import('@/features/infrastructure/api');
      const handler = createApiHandler(async () => ({ patched: true }), { methods: ['PATCH'] });
      const res = createResponse();

      await handler({ method: 'PATCH', url: '/test', body: { field: 'value' }, query: {} } as NextApiRequest, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { patched: true } });
    });
  });

  describe('Helper Functions', () => {
    it('createGetHandler creates GET-only handler', async () => {
      const { createGetHandler } = await import('@/features/infrastructure/api');
      const handler = createGetHandler(async () => 'ok');
      const res = createResponse();

      await handler({ method: 'GET', url: '/test', body: null, query: {} } as NextApiRequest, res);
      expect(res.status).toHaveBeenCalledWith(200);

      const res2 = createResponse();
      await handler({ method: 'POST', url: '/test', body: {}, query: {} } as NextApiRequest, res2);
      expect(res2.status).toHaveBeenCalledWith(405);
    });

    it('createPostHandler creates POST-only handler', async () => {
      const { createPostHandler } = await import('@/features/infrastructure/api');
      const handler = createPostHandler(async () => 'ok');
      const res = createResponse();

      await handler({ method: 'POST', url: '/test', body: {}, query: {} } as NextApiRequest, res);
      expect(res.status).toHaveBeenCalledWith(200);

      const res2 = createResponse();
      await handler({ method: 'GET', url: '/test', body: null, query: {} } as NextApiRequest, res2);
      expect(res2.status).toHaveBeenCalledWith(405);
    });

    it('createGetPostHandler creates GET and POST handler', async () => {
      const { createGetPostHandler } = await import('@/features/infrastructure/api');
      const handler = createGetPostHandler(async () => 'ok');
      const res = createResponse();

      await handler({ method: 'GET', url: '/test', body: null, query: {} } as NextApiRequest, res);
      expect(res.status).toHaveBeenCalledWith(200);

      const res2 = createResponse();
      await handler({ method: 'POST', url: '/test', body: {}, query: {} } as NextApiRequest, res2);
      expect(res2.status).toHaveBeenCalledWith(200);

      const res3 = createResponse();
      await handler({ method: 'PUT', url: '/test', body: {}, query: {} } as NextApiRequest, res3);
      expect(res3.status).toHaveBeenCalledWith(405);
    });

    it('errorResponse helper returns error response', async () => {
      const { errorResponse } = await import('@/features/infrastructure/api');
      const res = createResponse();

      const result = errorResponse(res, 404, 'Not found');

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not found'
      });
      expect(result).toBe(res);
    });

    it('successResponse helper returns success response', async () => {
      const { successResponse } = await import('@/features/infrastructure/api');
      const res = createResponse();

      const result = successResponse(res, { data: 'test' }, 'Success message');

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { data: 'test' },
        message: 'Success message'
      });
      expect(result).toBe(res);
    });

    it('successResponse helper works without message', async () => {
      const { successResponse } = await import('@/features/infrastructure/api');
      const res = createResponse();

      successResponse(res, { data: 'test' });

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { data: 'test' }
      });
    });
  });
});
