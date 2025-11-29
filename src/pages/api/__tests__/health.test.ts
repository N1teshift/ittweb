import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../health';

// Mock dependencies - define the structure inline
jest.mock('@/features/infrastructure/api/firebase/admin', () => {
  const mockQueryGet = jest.fn().mockResolvedValue({});
  const mockCollectionLimit = jest.fn().mockReturnValue({ get: mockQueryGet });
  const mockDbCollection = jest.fn().mockReturnValue({ limit: mockCollectionLimit });
  const mockGetFirestoreAdmin = jest.fn().mockReturnValue({ collection: mockDbCollection });

  return {
    getFirestoreAdmin: mockGetFirestoreAdmin,
    isServerSide: jest.fn(() => true),
    getAdminTimestamp: jest.fn(() => ({
      now: jest.fn(() => ({ toDate: () => new Date("2020-01-01T00:00:00Z") })),
      fromDate: jest.fn((date: Date) => ({ toDate: () => date })),
    })),
  };
});

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
    // Reset the mock implementations - don't clear all mocks as it breaks the chain
    const adminModule = jest.requireMock('@/features/infrastructure/api/firebase/admin');
    const mockQueryGet = jest.fn().mockResolvedValue({});
    const mockCollectionLimit = jest.fn().mockReturnValue({ get: mockQueryGet });
    const mockDbCollection = jest.fn().mockReturnValue({ limit: mockCollectionLimit });
    adminModule.getFirestoreAdmin.mockReset();
    adminModule.getFirestoreAdmin.mockReturnValue({ collection: mockDbCollection });
  });

  it('returns healthy status when database is accessible', async () => {
    // Arrange
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
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
    const adminModule = jest.requireMock('@/features/infrastructure/api/firebase/admin');
    const mockQueryGet = jest.fn().mockRejectedValue(new Error('Database connection failed'));
    const mockCollectionLimit = jest.fn().mockReturnValue({ get: mockQueryGet });
    const mockDbCollection = jest.fn().mockReturnValue({ limit: mockCollectionLimit });
    adminModule.getFirestoreAdmin.mockReturnValue({ collection: mockDbCollection });
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
