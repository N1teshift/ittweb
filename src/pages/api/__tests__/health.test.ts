import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../health';

// Mock dependencies
const mockGetFirestoreAdmin = jest.fn();

jest.mock('@/features/infrastructure/api/firebase/admin', () => ({
  getFirestoreAdmin: () => mockGetFirestoreAdmin(),
}));

describe('GET /api/health', () => {
  const createRequest = (): NextApiRequest => ({
    method: 'GET',
    query: {},
    body: null,
    url: '/api/health',
  } as NextApiRequest);

  const createResponse = (): NextApiResponse => {
    const res = {} as NextApiResponse;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    return res;
  };

  let mockCollection: { limit: jest.Mock };
  let mockQuery: { get: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery = {
      get: jest.fn().mockResolvedValue({}),
    };
    mockCollection = {
      limit: jest.fn().mockReturnValue(mockQuery),
    };
    const mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    };
    mockGetFirestoreAdmin.mockReturnValue(mockDb);
  });

  it('returns healthy status when database is accessible', async () => {
    // Arrange
    mockQuery.get.mockResolvedValue({});
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockGetFirestoreAdmin).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'ok',
      timestamp: expect.any(String),
      checks: {
        database: 'ok',
      },
    });
  });

  it('returns error status when database is not accessible', async () => {
    // Arrange
    mockQuery.get.mockRejectedValue(new Error('Database connection failed'));
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      timestamp: expect.any(String),
      checks: {
        database: 'error',
      },
    });
  });

  it('includes timestamp in response', async () => {
    // Arrange
    mockQuery.get.mockResolvedValue({});
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    const responseCall = (res.json as jest.Mock).mock.calls[0][0];
    expect(responseCall.timestamp).toBeDefined();
    expect(typeof responseCall.timestamp).toBe('string');
    // Verify it's a valid ISO date string
    expect(() => new Date(responseCall.timestamp)).not.toThrow();
  });

  it('rejects POST method', async () => {
    // Arrange
    const req = {
      method: 'POST',
      query: {},
      body: null,
      url: '/api/health',
    } as NextApiRequest;
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Method not allowed',
    });
  });

  it('rejects PUT method', async () => {
    // Arrange
    const req = {
      method: 'PUT',
      query: {},
      body: null,
      url: '/api/health',
    } as NextApiRequest;
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Method not allowed',
    });
  });

  it('rejects DELETE method', async () => {
    // Arrange
    const req = {
      method: 'DELETE',
      query: {},
      body: null,
      url: '/api/health',
    } as NextApiRequest;
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Method not allowed',
    });
  });
});

