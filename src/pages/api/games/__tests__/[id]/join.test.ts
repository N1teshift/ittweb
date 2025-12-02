import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../[id]/join';

// Mock dependencies
const mockJoinGame = jest.fn();
const mockInfo = jest.fn();
const mockError = jest.fn();
const mockWarn = jest.fn();
const mockDebug = jest.fn();

jest.mock('@/features/modules/game-management/games/lib/gameService', () => ({
  joinGame: (...args: unknown[]) => mockJoinGame(...args),
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

describe('POST /api/games/[id]/join', () => {
  const createRequest = (id: string): NextApiRequest => ({
    method: 'POST',
    query: { id },
    body: null,
    url: `/api/games/${id}/join`,
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
    mockJoinGame.mockResolvedValue(undefined);
  });

  it('joins game successfully', async () => {
    // Arrange
    const req = createRequest('game-123');
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockJoinGame).toHaveBeenCalledWith('game-123', 'discord123', 'Test User');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { success: true },
    });
  });

  it('requires authentication', async () => {
    // Arrange
    mockGetServerSession.mockResolvedValue(null);
    const req = createRequest('game-123');
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
    expect(mockJoinGame).not.toHaveBeenCalled();
  });

  it('requires discordId in session', async () => {
    // Arrange
    mockGetServerSession.mockResolvedValue({
      user: { name: 'Test User' },
      // No discordId
    });
    const req = createRequest('game-123');
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('Discord ID and name are required'),
      })
    );
    expect(mockJoinGame).not.toHaveBeenCalled();
  });

  it('requires user name in session', async () => {
    // Arrange
    mockGetServerSession.mockResolvedValue({
      discordId: 'discord123',
      // No user.name
    });
    const req = createRequest('game-123');
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('Discord ID and name are required'),
      })
    );
    expect(mockJoinGame).not.toHaveBeenCalled();
  });

  it('handles error when game not found', async () => {
    // Arrange
    const error = new Error('Game not found');
    mockJoinGame.mockRejectedValue(error);
    const req = createRequest('non-existent');
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('Game not found'),
      })
    );
  });

  it('handles error when joining non-scheduled game', async () => {
    // Arrange
    const error = new Error('Can only join scheduled games');
    mockJoinGame.mockRejectedValue(error);
    const req = createRequest('game-123');
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('Can only join scheduled games'),
      })
    );
  });

  it('handles error when user is already a participant', async () => {
    // Arrange
    const error = new Error('User is already a participant');
    mockJoinGame.mockRejectedValue(error);
    const req = createRequest('game-123');
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('already a participant'),
      })
    );
  });

  it('handles generic errors from joinGame', async () => {
    // Arrange
    const error = new Error('Database error');
    mockJoinGame.mockRejectedValue(error);
    const req = createRequest('game-123');
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
      query: { id: 'game-123' },
      body: null,
      url: '/api/games/game-123/join',
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
      query: { id: 'game-123' },
      body: null,
      url: '/api/games/game-123/join',
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
      query: { id: 'game-123' },
      body: null,
      url: '/api/games/game-123/join',
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

