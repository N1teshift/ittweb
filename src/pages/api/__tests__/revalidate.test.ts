import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../revalidate';

// Mock dependencies
const mockInfo = jest.fn();
const mockError = jest.fn();
const mockWarn = jest.fn();
const mockDebug = jest.fn();

jest.mock('@/features/infrastructure/logging', () => ({
  createComponentLogger: jest.fn(() => ({
    info: mockInfo,
    error: mockError,
    warn: mockWarn,
    debug: mockDebug,
  })),
}));

const mockGetServerSession = jest.fn();
jest.mock('next-auth/next', () => ({
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));

jest.mock('@/pages/api/auth/[...nextauth]', () => ({
  authOptions: {},
}));

describe('POST /api/revalidate', () => {
  const createRequest = (body: unknown): NextApiRequest => ({
    method: 'POST',
    query: {},
    body,
    url: '/api/revalidate',
  } as NextApiRequest);

  const createResponse = (): NextApiResponse => {
    const res = {} as NextApiResponse;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    res.revalidate = jest.fn().mockResolvedValue(undefined);
    return res;
  };

  const mockSession = {
    user: { name: 'Test User' },
    discordId: 'discord123',
    expires: '2024-12-31',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue(mockSession);
  });

  it('revalidates path successfully', async () => {
    // Arrange
    const req = createRequest({ path: '/games' });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.revalidate).toHaveBeenCalledWith('/games');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: {
        revalidated: true,
        path: '/games',
      },
    });
  });

  it('requires authentication', async () => {
    // Arrange
    mockGetServerSession.mockResolvedValue(null);
    const req = createRequest({ path: '/games' });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Authentication required',
      })
    );
    expect(res.revalidate).not.toHaveBeenCalled();
  });

  it('validates path is required', async () => {
    // Arrange
    const req = createRequest({});
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('required'),
      })
    );
    expect(res.revalidate).not.toHaveBeenCalled();
  });

  it('validates path is a string', async () => {
    // Arrange
    const req = createRequest({ path: 123 });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('path'),
      })
    );
    expect(res.revalidate).not.toHaveBeenCalled();
  });

  it('validates path is not empty', async () => {
    // Arrange
    const req = createRequest({ path: '' });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('path'),
      })
    );
    expect(res.revalidate).not.toHaveBeenCalled();
  });

  it('handles error from res.revalidate', async () => {
    // Arrange
    const res = createResponse();
    (res.revalidate as jest.Mock).mockRejectedValue(new Error('Revalidation failed'));
    const req = createRequest({ path: '/games' });

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('Revalidation failed'),
      })
    );
  });

  it('rejects GET method', async () => {
    // Arrange
    const req = {
      method: 'GET',
      query: {},
      body: null,
      url: '/api/revalidate',
    } as NextApiRequest;
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Method GET not allowed. Allowed methods: POST',
      })
    );
  });

  it('rejects PUT method', async () => {
    // Arrange
    const req = {
      method: 'PUT',
      query: {},
      body: { path: '/games' },
      url: '/api/revalidate',
    } as NextApiRequest;
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Method PUT not allowed. Allowed methods: POST',
      })
    );
  });

  it('rejects DELETE method', async () => {
    // Arrange
    const req = {
      method: 'DELETE',
      query: {},
      body: null,
      url: '/api/revalidate',
    } as NextApiRequest;
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Method DELETE not allowed. Allowed methods: POST',
      })
    );
  });
});


