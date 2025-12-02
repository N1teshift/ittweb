import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../[name]';

// Mock dependencies
const mockGetPlayerStats = jest.fn();
const mockInfo = jest.fn();
const mockError = jest.fn();
const mockWarn = jest.fn();
const mockDebug = jest.fn();

jest.mock('@/features/modules/community/players/lib/playerService', () => ({
  getPlayerStats: (...args: unknown[]) => mockGetPlayerStats(...args),
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

describe('GET /api/players/[name]', () => {
  const createRequest = (name: string, query: Record<string, string> = {}): NextApiRequest => ({
    method: 'GET',
    query: { name, ...query },
    body: null,
    url: `/api/players/${name}`,
  } as NextApiRequest);

  const createResponse = (): NextApiResponse => {
    const res = {} as NextApiResponse;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockPlayerStats = {
    name: 'TestPlayer',
    elo: 1500,
    wins: 10,
    losses: 5,
    draws: 2,
    peakElo: 1600,
    gamesPlayed: 17,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPlayerStats.mockResolvedValue(mockPlayerStats);
  });

  it('returns player statistics by name', async () => {
    // Arrange
    const req = createRequest('TestPlayer');
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockGetPlayerStats).toHaveBeenCalledWith('TestPlayer', expect.objectContaining({}));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockPlayerStats,
    });
  });

  it('handles player name normalization', async () => {
    // Arrange
    const req = createRequest('  TestPlayer  '); // With spaces
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    // The service should handle normalization, but we verify the call
    expect(mockGetPlayerStats).toHaveBeenCalledWith('  TestPlayer  ', expect.objectContaining({}));
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns 500 when player not found', async () => {
    // Arrange
    mockGetPlayerStats.mockResolvedValue(null);
    const req = createRequest('NonExistentPlayer');
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Player not found',
      })
    );
  });

  it('handles error when name is missing', async () => {
    // Arrange
    const req = {
      method: 'GET',
      query: {}, // No name
      body: null,
      url: '/api/players/',
    } as NextApiRequest;
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Player name is required',
      })
    );
    expect(mockGetPlayerStats).not.toHaveBeenCalled();
  });

  it('applies category filter', async () => {
    // Arrange
    const req = createRequest('TestPlayer', { category: '4v4' });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockGetPlayerStats).toHaveBeenCalledWith('TestPlayer', expect.objectContaining({
      category: '4v4',
    }));
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('applies date range filters', async () => {
    // Arrange
    const req = createRequest('TestPlayer', {
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockGetPlayerStats).toHaveBeenCalledWith('TestPlayer', expect.objectContaining({
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    }));
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('applies includeGames filter when true', async () => {
    // Arrange
    const req = createRequest('TestPlayer', { includeGames: 'true' });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockGetPlayerStats).toHaveBeenCalledWith('TestPlayer', {
      includeGames: true,
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('does not include games when includeGames is false or missing', async () => {
    // Arrange
    const req = createRequest('TestPlayer', { includeGames: 'false' });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockGetPlayerStats).toHaveBeenCalledWith('TestPlayer', expect.objectContaining({
      includeGames: false,
    }));
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('applies all filters together', async () => {
    // Arrange
    const req = createRequest('TestPlayer', {
      category: '4v4',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      includeGames: 'true',
    });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockGetPlayerStats).toHaveBeenCalledWith('TestPlayer', {
      category: '4v4',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      includeGames: true,
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('handles error from getPlayerStats', async () => {
    // Arrange
    const error = new Error('Database error');
    mockGetPlayerStats.mockRejectedValue(error);
    const req = createRequest('TestPlayer');
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

  it('does not require authentication', async () => {
    // Arrange
    mockGetServerSession.mockResolvedValue(null);
    const req = createRequest('TestPlayer');
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockPlayerStats,
    });
  });

  it('rejects POST method', async () => {
    // Arrange
    const req = {
      method: 'POST',
      query: { name: 'TestPlayer' },
      body: null,
      url: '/api/players/TestPlayer',
    } as NextApiRequest;
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('Method POST not allowed'),
      })
    );
  });

  it('rejects PUT method', async () => {
    // Arrange
    const req = {
      method: 'PUT',
      query: { name: 'TestPlayer' },
      body: null,
      url: '/api/players/TestPlayer',
    } as NextApiRequest;
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('Method PUT not allowed'),
      })
    );
  });

  it('rejects DELETE method', async () => {
    // Arrange
    const req = {
      method: 'DELETE',
      query: { name: 'TestPlayer' },
      body: null,
      url: '/api/players/TestPlayer',
    } as NextApiRequest;
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('Method DELETE not allowed'),
      })
    );
  });
});

