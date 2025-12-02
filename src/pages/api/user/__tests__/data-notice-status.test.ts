import type { NextApiRequest, NextApiResponse } from 'next';
// Import server-side mocks FIRST before handler
import '../../../../../__tests__/helpers/mockUserDataService.server';
import {
  mockGetUserDataByDiscordIdServer,
  setIsServerSide,
} from '../../../../../__tests__/helpers/mockUserDataService.server';
import handler from '../data-notice-status';

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

describe('GET /api/user/data-notice-status', () => {
  const createRequest = (): NextApiRequest => ({
    method: 'GET',
    query: {},
    body: null,
    url: '/api/user/data-notice-status',
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
    setIsServerSide(true); // Enable server-side mode
    mockGetServerSession.mockResolvedValue(mockSession);
  });

  it('returns accepted status when user has accepted notice', async () => {
    // Arrange
    mockGetUserDataByDiscordIdServer.mockResolvedValue({
      dataCollectionNoticeAccepted: true,
    });
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockGetUserDataByDiscordIdServer).toHaveBeenCalledWith('discord123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { accepted: true },
    });
  });

  it('returns not accepted status when user has not accepted notice', async () => {
    // Arrange
    mockGetUserDataByDiscordIdServer.mockResolvedValue({
      dataCollectionNoticeAccepted: false,
    });
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { accepted: false },
    });
  });

  it('returns not accepted status when userData is null', async () => {
    // Arrange
    mockGetUserDataByDiscordIdServer.mockResolvedValue(null);
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { accepted: false },
    });
  });

  it('returns not accepted status when dataCollectionNoticeAccepted is undefined', async () => {
    // Arrange
    mockGetUserDataByDiscordIdServer.mockResolvedValue({
      // No dataCollectionNoticeAccepted field
    });
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { accepted: false },
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
    expect(mockGetUserDataByDiscordIdServer).not.toHaveBeenCalled();
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
    expect(mockGetUserDataByDiscordIdServer).toHaveBeenCalledWith('');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('handles error from getUserDataByDiscordId', async () => {
    // Arrange
    const error = new Error('Database error');
    mockGetUserDataByDiscordIdServer.mockRejectedValue(error);
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

  it('rejects POST method', async () => {
    // Arrange
    const req = {
      method: 'POST',
      query: {},
      body: null,
      url: '/api/user/data-notice-status',
    } as NextApiRequest;
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Method POST not allowed. Allowed methods: GET',
      })
    );
  });

  it('rejects PUT method', async () => {
    // Arrange
    const req = {
      method: 'PUT',
      query: {},
      body: null,
      url: '/api/user/data-notice-status',
    } as NextApiRequest;
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Method PUT not allowed. Allowed methods: GET',
      })
    );
  });

  it('rejects DELETE method', async () => {
    // Arrange
    const req = {
      method: 'DELETE',
      query: {},
      body: null,
      url: '/api/user/data-notice-status',
    } as NextApiRequest;
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Method DELETE not allowed. Allowed methods: GET',
      })
    );
  });
});


