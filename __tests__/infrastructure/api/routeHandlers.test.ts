import type { NextApiRequest, NextApiResponse } from 'next';

const mockInfo = jest.fn();
const mockError = jest.fn();
const mockWarn = jest.fn();
const mockDebug = jest.fn();

jest.mock('@/features/infrastructure/logging', () => ({
  createComponentLogger: () => ({
    info: mockInfo,
    error: mockError,
    warn: mockWarn,
    debug: mockDebug
  })
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

    expect(mockDebug).toHaveBeenCalledWith('Authentication verified');
  });

  it('logs request lifecycle when logging is enabled', async () => {
    const { createApiHandler } = await import('@/features/infrastructure/api/routeHandlers');
    const handler = createApiHandler(async () => 'ok', { logRequests: true });
    const res = createResponse();

    await handler({ method: 'GET', url: '/log', body: null, query: {} } as NextApiRequest, res);

    expect(mockInfo).toHaveBeenCalledTimes(2);
    expect(mockInfo).toHaveBeenCalledWith('API request received', expect.objectContaining({ method: 'GET', url: '/log' }));
    expect(mockInfo).toHaveBeenCalledWith('API request completed successfully', expect.objectContaining({ method: 'GET', url: '/log' }));
  });

  it('skips request logging when disabled', async () => {
    const { createApiHandler } = await import('@/features/infrastructure/api/routeHandlers');
    const handler = createApiHandler(async () => 'ok', { logRequests: false });
    const res = createResponse();

    await handler({ method: 'GET', url: '/nolog', body: null, query: {} } as NextApiRequest, res);

    expect(mockInfo).not.toHaveBeenCalled();
  });

  it('formats errors and masks message in production', async () => {
    process.env.NODE_ENV = 'production';
    const { createApiHandler } = await import('@/features/infrastructure/api/routeHandlers');
    const handler = createApiHandler(async () => {
      throw new Error('boom');
    });
    const res = createResponse();

    await handler({ method: 'GET', url: '/error', body: null, query: {} } as NextApiRequest, res);

    expect(mockError).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Internal server error' });
  });
});
