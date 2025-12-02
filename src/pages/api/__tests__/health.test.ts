import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../health';

import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../health';

// Create a mock for getFirestoreAdmin that we can control
const mockGetFirestoreAdmin = jest.fn();

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
    jest.clearAllMocks();

    // Override the global mock for this specific test
    jest.doMock('@/features/infrastructure/api/firebase/admin', () => ({
      getFirestoreAdmin: mockGetFirestoreAdmin,
      isServerSide: jest.fn(() => false),
      getAdminTimestamp: jest.fn(() => ({
        now: jest.fn(() => ({ toDate: () => new Date('2020-01-01T00:00:00Z') })),
        fromDate: jest.fn((date: Date) => ({ toDate: () => date })),
      })),
    }));

    // Set up default mock behavior
    const mockCollection = jest.fn().mockReturnValue({
      limit: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({})
      })
    });

    mockGetFirestoreAdmin.mockReturnValue({
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
    expect(mockGetFirestoreAdmin).toHaveBeenCalled();
    expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store, no-cache, must-revalidate, private');
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
    const mockCollection = jest.fn().mockReturnValue({
      limit: jest.fn().mockReturnValue({
        get: jest.fn().mockRejectedValue(new Error('Database connection failed'))
      })
    });
    mockGetFirestoreAdmin.mockReturnValue({
      collection: mockCollection
    });

    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockGetFirestoreAdmin).toHaveBeenCalled();
    expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store, no-cache, must-revalidate, private');
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

