import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../[id]';

// Mock dependencies
const mockGetGameById = jest.fn();
const mockUpdateGame = jest.fn();
const mockDeleteGame = jest.fn();
const mockCheckResourceOwnership = jest.fn();
const mockInfo = jest.fn();
const mockError = jest.fn();
const mockWarn = jest.fn();
const mockDebug = jest.fn();

jest.mock('@/features/modules/game-management/games/lib/gameService', () => ({
  getGameById: (...args: unknown[]) => mockGetGameById(...args),
  updateGame: (...args: unknown[]) => mockUpdateGame(...args),
  deleteGame: (...args: unknown[]) => mockDeleteGame(...args),
}));

jest.mock('@/features/infrastructure/api', () => {
  const actual = jest.requireActual('@/features/infrastructure/api');
  return {
    ...actual,
    checkResourceOwnership: (...args: unknown[]) => mockCheckResourceOwnership(...args),
  };
});

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

describe('GET /api/games/[id]', () => {
  const createRequest = (id: string): NextApiRequest => ({
    method: 'GET',
    query: { id },
    body: null,
    url: `/api/games/${id}`,
  } as unknown as NextApiRequest);

  const createResponse = (): NextApiResponse => {
    const res = {} as NextApiResponse;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns game by ID', async () => {
    // Arrange
    const game = {
      id: 'game-123',
      gameId: 123,
      gameState: 'completed',
      datetime: new Date().toISOString(),
    };
    mockGetGameById.mockResolvedValue(game);
    const req = createRequest('game-123');
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockGetGameById).toHaveBeenCalledWith('game-123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: game,
    });
  });

  it('returns 500 when game not found', async () => {
    // Arrange
    mockGetGameById.mockResolvedValue(null);
    const req = createRequest('non-existent');
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockGetGameById).toHaveBeenCalledWith('non-existent');
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('Game not found'),
      })
    );
  });

  it('does not require authentication', async () => {
    // Arrange
    mockGetServerSession.mockResolvedValue(null);
    const game = { id: 'game-123', gameId: 123 };
    mockGetGameById.mockResolvedValue(game);
    const req = createRequest('game-123');
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: game,
    });
  });

  it('handles errors from getGameById', async () => {
    // Arrange
    const error = new Error('Database error');
    mockGetGameById.mockRejectedValue(error);
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
});

describe('PUT /api/games/[id]', () => {
  const createRequest = (
    id: string,
    body: Record<string, unknown> = {},
    session: unknown = null
  ): NextApiRequest => ({
    method: 'PUT',
    query: { id },
    body,
    url: `/api/games/${id}`,
  } as unknown as NextApiRequest);

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

  const mockGame = {
    id: 'game-123',
    gameId: 123,
    gameState: 'completed',
    createdByDiscordId: 'discord123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue(mockSession);
    mockGetGameById.mockResolvedValue(mockGame);
    mockCheckResourceOwnership.mockResolvedValue(true);
    mockUpdateGame.mockResolvedValue(undefined);
  });

  it('updates game successfully', async () => {
    // Arrange
    const updates = { category: '1v1', map: 'New Map' };
    const req = createRequest('game-123', updates);
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockGetGameById).toHaveBeenCalledWith('game-123');
    expect(mockCheckResourceOwnership).toHaveBeenCalled();
    expect(mockUpdateGame).toHaveBeenCalledWith('game-123', updates);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: {},
    });
  });

  it('requires authentication', async () => {
    // Arrange
    mockGetServerSession.mockResolvedValue(null);
    const req = createRequest('game-123', { category: '1v1' });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('Authentication required'),
      })
    );
    expect(mockUpdateGame).not.toHaveBeenCalled();
  });

  it('requires discordId in session', async () => {
    // Arrange
    mockGetServerSession.mockResolvedValue({
      user: { name: 'Test User' },
      // No discordId
    });
    const req = createRequest('game-123', { category: '1v1' });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('Authentication required'),
      })
    );
    expect(mockUpdateGame).not.toHaveBeenCalled();
  });

  it('returns 500 when game not found', async () => {
    // Arrange
    mockGetGameById.mockResolvedValue(null);
    const req = createRequest('non-existent', { category: '1v1' });
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
    expect(mockUpdateGame).not.toHaveBeenCalled();
  });

  it('requires resource ownership', async () => {
    // Arrange
    mockCheckResourceOwnership.mockResolvedValue(false);
    const req = createRequest('game-123', { category: '1v1' });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockCheckResourceOwnership).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('You do not have permission to edit this game'),
      })
    );
    expect(mockUpdateGame).not.toHaveBeenCalled();
  });

  it('allows update when user owns the resource', async () => {
    // Arrange
    mockCheckResourceOwnership.mockResolvedValue(true);
    const updates = { category: '2v2' };
    const req = createRequest('game-123', updates);
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockUpdateGame).toHaveBeenCalledWith('game-123', updates);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('allows update when user is admin', async () => {
    // Arrange
    // Admin users should have access even if they don't own the resource
    const adminGame = {
      id: 'game-456',
      gameId: 456,
      createdByDiscordId: 'other-user',
    };
    mockGetGameById.mockResolvedValue(adminGame);
    mockCheckResourceOwnership.mockResolvedValue(true); // Admin check passes
    const updates = { category: '1v1' };
    const req = createRequest('game-456', updates);
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockUpdateGame).toHaveBeenCalledWith('game-456', updates);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('handles errors from updateGame', async () => {
    // Arrange
    const error = new Error('Update failed');
    mockUpdateGame.mockRejectedValue(error);
    const req = createRequest('game-123', { category: '1v1' });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('Update failed'),
      })
    );
  });

  it('handles errors from checkResourceOwnership', async () => {
    // Arrange
    const error = new Error('Ownership check failed');
    mockCheckResourceOwnership.mockRejectedValue(error);
    const req = createRequest('game-123', { category: '1v1' });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('DELETE /api/games/[id]', () => {
  const createRequest = (
    id: string,
    session: unknown = null
  ): NextApiRequest => ({
    method: 'DELETE',
    query: { id },
    body: null,
    url: `/api/games/${id}`,
  } as unknown as NextApiRequest);

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

  const mockGame = {
    id: 'game-123',
    gameId: 123,
    gameState: 'completed',
    createdByDiscordId: 'discord123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue(mockSession);
    mockGetGameById.mockResolvedValue(mockGame);
    mockCheckResourceOwnership.mockResolvedValue(true);
    mockDeleteGame.mockResolvedValue(undefined);
  });

  it('deletes game successfully', async () => {
    // Arrange
    const req = createRequest('game-123');
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockGetGameById).toHaveBeenCalledWith('game-123');
    expect(mockCheckResourceOwnership).toHaveBeenCalled();
    expect(mockDeleteGame).toHaveBeenCalledWith('game-123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: {},
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
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('Authentication required'),
      })
    );
    expect(mockDeleteGame).not.toHaveBeenCalled();
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
        error: expect.stringContaining('Authentication required'),
      })
    );
    expect(mockDeleteGame).not.toHaveBeenCalled();
  });

  it('returns 500 when game not found', async () => {
    // Arrange
    mockGetGameById.mockResolvedValue(null);
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
    expect(mockDeleteGame).not.toHaveBeenCalled();
  });

  it('requires resource ownership', async () => {
    // Arrange
    mockCheckResourceOwnership.mockResolvedValue(false);
    const req = createRequest('game-123');
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockCheckResourceOwnership).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('You do not have permission to delete this game'),
      })
    );
    expect(mockDeleteGame).not.toHaveBeenCalled();
  });

  it('allows delete when user owns the resource', async () => {
    // Arrange
    mockCheckResourceOwnership.mockResolvedValue(true);
    const req = createRequest('game-123');
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockDeleteGame).toHaveBeenCalledWith('game-123');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('allows delete when user is admin', async () => {
    // Arrange
    const adminGame = {
      id: 'game-456',
      gameId: 456,
      createdByDiscordId: 'other-user',
    };
    mockGetGameById.mockResolvedValue(adminGame);
    mockCheckResourceOwnership.mockResolvedValue(true); // Admin check passes
    const req = createRequest('game-456');
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockDeleteGame).toHaveBeenCalledWith('game-456');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('handles errors from deleteGame', async () => {
    // Arrange
    const error = new Error('Delete failed');
    mockDeleteGame.mockRejectedValue(error);
    const req = createRequest('game-123');
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('Delete failed'),
      })
    );
  });

  it('handles errors from checkResourceOwnership', async () => {
    // Arrange
    const error = new Error('Ownership check failed');
    mockCheckResourceOwnership.mockRejectedValue(error);
    const req = createRequest('game-123');
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('Method Not Allowed', () => {
  const createResponse = (): NextApiResponse => {
    const res = {} as NextApiResponse;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    return res;
  };

  it('rejects POST method', async () => {
    // Arrange
    const req = {
      method: 'POST',
      query: { id: 'game-123' },
      body: null,
      url: '/api/games/game-123',
    } as unknown as NextApiRequest;
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Method POST not allowed. Allowed methods: GET, PUT, DELETE',
      })
    );
  });

  it('rejects PATCH method', async () => {
    // Arrange
    const req = {
      method: 'PATCH',
      query: { id: 'game-123' },
      body: null,
      url: '/api/games/game-123',
    } as unknown as NextApiRequest;
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Method PATCH not allowed. Allowed methods: GET, PUT, DELETE',
      })
    );
  });
});

