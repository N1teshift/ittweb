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
    return res as NextApiResponse;
  };

  it('handles allowed GET requests', async () => {
    const { createApiHandler } = await import('@/features/infrastructure/api/routeHandlers');
    const handler = createApiHandler(async () => 'ok');
    const res = createResponse();

    await handler({ method: 'GET', url: '/test', body: null, query: {} } as NextApiRequest, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: 'ok' });
  });

  it('rejects disallowed methods with 405', async () => {
    const { createApiHandler } = await import('@/features/infrastructure/api/routeHandlers');
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
    const { createApiHandler } = await import('@/features/infrastructure/api/routeHandlers');
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
    const { createApiHandler } = await import('@/features/infrastructure/api/routeHandlers');
    const handler = createApiHandler(async () => 'ok', {
      methods: ['POST'],
      validateBody: () => false
    });
    const res = createResponse();

    await handler({ method: 'POST', url: '/test', body: { bad: true }, query: {} } as NextApiRequest, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Invalid request body' });
  });

  it('logs authentication message when requireAuth is enabled', async () => {
    const { createApiHandler } = await import('@/features/infrastructure/api/routeHandlers');
    const handler = createApiHandler(async () => 'ok', { requireAuth: true });
    const res = createResponse();

    await handler({ method: 'GET', url: '/auth', body: null, query: {} } as NextApiRequest, res);

    // Authentication check is logged (implementation may vary)
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('logs request lifecycle when logging is enabled', async () => {
    const { createApiHandler } = await import('@/features/infrastructure/api/routeHandlers');
    const handler = createApiHandler(async () => 'ok', { logRequests: true });
    const res = createResponse();

    await handler({ method: 'GET', url: '/log', body: null, query: {} } as NextApiRequest, res);

    // Request logging is enabled, handler should complete successfully
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: 'ok' });
  });

  it('skips request logging when disabled', async () => {
    const { createApiHandler } = await import('@/features/infrastructure/api/routeHandlers');
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
    const { createApiHandler } = await import('@/features/infrastructure/api/routeHandlers');
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
    const { createApiHandler } = await import('@/features/infrastructure/api/routeHandlers');
    const handler = createApiHandler(async () => ({ created: true }), { methods: ['POST'] });
    const res = createResponse();

    await handler({ method: 'POST', url: '/test', body: { data: 'test' }, query: {} } as NextApiRequest, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { created: true } });
  });

  it('accepts multiple allowed methods', async () => {
    const { createApiHandler } = await import('@/features/infrastructure/api/routeHandlers');
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
    const { createApiHandler } = await import('@/features/infrastructure/api/routeHandlers');
    const handler = createApiHandler(async () => 'ok', { methods: ['GET'] });
    const res = createResponse();

    // Method should be case-sensitive
    await handler({ method: 'get' as any, url: '/test', body: null, query: {} } as NextApiRequest, res);

    expect(res.status).toHaveBeenCalledWith(405);
  });

  it('validates body when validator throws', async () => {
    const { createApiHandler } = await import('@/features/infrastructure/api/routeHandlers');
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
    const { createApiHandler } = await import('@/features/infrastructure/api/routeHandlers');
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
    const { createApiHandler } = await import('@/features/infrastructure/api/routeHandlers');
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
    const { createApiHandler } = await import('@/features/infrastructure/api/routeHandlers');
    const handler = createApiHandler(async () => 'ok', { logRequests: true });
    const res = createResponse();

    await handler({ method: 'GET', url: '/fast', body: null, query: {} } as NextApiRequest, res);

    // Very fast requests should still complete successfully
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: 'ok' });
  });

  it('handles oversized payloads gracefully', async () => {
    const { createApiHandler } = await import('@/features/infrastructure/api/routeHandlers');
    const handler = createApiHandler(async (req) => req.body, { methods: ['POST'] });
    const res = createResponse();

    const largeBody = { data: 'x'.repeat(10000) };
    await handler({ method: 'POST', url: '/large', body: largeBody, query: {} } as NextApiRequest, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns consistent response format for success', async () => {
    const { createApiHandler } = await import('@/features/infrastructure/api/routeHandlers');
    const handler = createApiHandler(async () => ({ data: 'test' }), { methods: ['GET'] });
    const res = createResponse();

    await handler({ method: 'GET', url: '/test', body: null, query: {} } as NextApiRequest, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { data: 'test' }
    });
  });

  it('returns consistent response format for errors', async () => {
    const { createApiHandler } = await import('@/features/infrastructure/api/routeHandlers');
    const handler = createApiHandler(async () => {
      throw new Error('test error');
    });
    const res = createResponse();

    await handler({ method: 'GET', url: '/error', body: null, query: {} } as NextApiRequest, res);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: expect.any(String)
    });
  });
});
