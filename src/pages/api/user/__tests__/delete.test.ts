import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../delete';

// Mock dependencies
const mockDeleteUserData = jest.fn();
const mockInfo = jest.fn();
const mockError = jest.fn();
const mockWarn = jest.fn();
const mockDebug = jest.fn();

jest.mock('@/features/infrastructure/lib/userDataService', () => ({
  deleteUserData: (...args: unknown[]) => mockDeleteUserData(...args),
}));

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

describe('POST /api/user/delete', () => {
  const createRequest = (): NextApiRequest => ({
    method: 'POST',
    query: {},
    body: null,
    url: '/api/user/delete',
  } as NextApiRequest);

  const createResponse = (): NextApiResponse => {
    const res = {} as NextApiResponse;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
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
    mockDeleteUserData.mockResolvedValue(undefined);
  });

  it('deletes user account successfully', async () => {
    // Arrange
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockDeleteUserData).toHaveBeenCalledWith('discord123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: {
        success: true,
        message: 'Account deleted successfully',
      },
    });
  });

  it('requires authentication', async () => {
    // Arrange
    mockGetServerSession.mockResolvedValue(null);
    const req = createRequest();
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
    expect(mockDeleteUserData).not.toHaveBeenCalled();
  });

  it('handles missing discordId in session', async () => {
    // Arrange
    mockGetServerSession.mockResolvedValue({
      user: { name: 'Test User' },
      // No discordId
    });
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    // The handler uses session.discordId || '', so it will call with empty string
    expect(mockDeleteUserData).toHaveBeenCalledWith('');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('handles error from deleteUserData', async () => {
    // Arrange
    const error = new Error('Database error');
    mockDeleteUserData.mockRejectedValue(error);
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('Database error'),
      })
    );
  });

  it('rejects GET method', async () => {
    // Arrange
    const req = {
      method: 'GET',
      query: {},
      body: null,
      url: '/api/user/delete',
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
      body: null,
      url: '/api/user/delete',
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
      url: '/api/user/delete',
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

