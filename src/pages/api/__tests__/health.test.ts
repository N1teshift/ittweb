import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../health';

// Create mock functions outside jest.mock so they can be referenced
const mockGet = jest.fn();
const mockLimit = jest.fn();
const mockCollection = jest.fn();

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

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Set up the mock chain: collection() -> limit() -> get() -> Promise.resolve({})
    mockGet.mockResolvedValue({});
    mockLimit.mockReturnValue({ get: mockGet });
    mockCollection.mockReturnValue({ limit: mockLimit });
    
    // Override the global mock from jest.setup.cjs by replacing the entire function
    const adminModule = jest.requireMock('@/features/infrastructure/api/firebase/admin');
    // Replace the function entirely, not just mockReturnValue
    adminModule.getFirestoreAdmin = jest.fn().mockReturnValue({ 
      collection: mockCollection 
    });
  });

  it('returns healthy status when database is accessible', async () => {
    // Arrange
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert - verify the mock was called
    const adminModule = jest.requireMock('@/features/infrastructure/api/firebase/admin');
    expect(adminModule.getFirestoreAdmin).toHaveBeenCalled();
    expect(mockCollection).toHaveBeenCalledWith('games');
    expect(mockLimit).toHaveBeenCalledWith(1);
    expect(mockGet).toHaveBeenCalled();
    
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
    mockGet.mockRejectedValue(new Error('Database connection failed'));
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
