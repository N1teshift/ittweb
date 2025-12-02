import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../compare';

// Mock dependencies
const mockComparePlayers = jest.fn();
const mockInfo = jest.fn();
const mockError = jest.fn();
const mockWarn = jest.fn();
const mockDebug = jest.fn();

jest.mock('@/features/modules/community/players/lib/playerService', () => ({
  comparePlayers: (...args: unknown[]) => mockComparePlayers(...args),
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

describe('GET /api/players/compare', () => {
  const createRequest = (query: Record<string, string> = {}): NextApiRequest => ({
    method: 'GET',
    query,
    body: null,
    url: '/api/players/compare',
  } as NextApiRequest);

  const createResponse = (): NextApiResponse => {
    const res = {} as NextApiResponse;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockComparisonResult = {
    players: [
      { name: 'Player1', elo: 1500, wins: 10, losses: 5 },
      { name: 'Player2', elo: 1600, wins: 15, losses: 3 },
    ],
    headToHead: {
      Player1: {
        Player2: { wins: 2, losses: 3 },
      },
      Player2: {
        Player1: { wins: 3, losses: 2 },
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockComparePlayers.mockResolvedValue(mockComparisonResult);
  });

  it('compares multiple players by comma-separated names', async () => {
    // Arrange
    const req = createRequest({ names: 'Player1,Player2' });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockComparePlayers).toHaveBeenCalledWith(
      ['Player1', 'Player2'],
      expect.objectContaining({})
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockComparisonResult,
    });
  });

  it('trims whitespace from player names', async () => {
    // Arrange
    const req = createRequest({ names: '  Player1  ,  Player2  ' });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockComparePlayers).toHaveBeenCalledWith(
      ['Player1', 'Player2'],
      expect.objectContaining({})
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('filters out empty names after trimming', async () => {
    // Arrange
    const req = createRequest({ names: 'Player1,,Player2,  ,Player3' });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockComparePlayers).toHaveBeenCalledWith(
      ['Player1', 'Player2', 'Player3'],
      expect.objectContaining({})
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('handles error when names parameter is missing', async () => {
    // Arrange
    const req = createRequest(); // No names parameter
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('Player names are required'),
      })
    );
    expect(mockComparePlayers).not.toHaveBeenCalled();
  });

  it('handles error when only one player name provided', async () => {
    // Arrange
    const req = createRequest({ names: 'Player1' });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('At least 2 player names are required'),
      })
    );
    expect(mockComparePlayers).not.toHaveBeenCalled();
  });

  it('handles error when all names are empty after trimming', async () => {
    // Arrange
    const req = createRequest({ names: '  ,  ,  ' });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('At least 2 player names are required'),
      })
    );
    expect(mockComparePlayers).not.toHaveBeenCalled();
  });

  it('applies category filter', async () => {
    // Arrange
    const req = createRequest({ names: 'Player1,Player2', category: '4v4' });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockComparePlayers).toHaveBeenCalledWith(
      ['Player1', 'Player2'],
      expect.objectContaining({
        category: '4v4',
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('applies date range filters', async () => {
    // Arrange
    const req = createRequest({
      names: 'Player1,Player2',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockComparePlayers).toHaveBeenCalledWith(
      ['Player1', 'Player2'],
      expect.objectContaining({
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('applies all filters together', async () => {
    // Arrange
    const req = createRequest({
      names: 'Player1,Player2,Player3',
      category: '4v4',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockComparePlayers).toHaveBeenCalledWith(
      ['Player1', 'Player2', 'Player3'],
      expect.objectContaining({
        category: '4v4',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('handles error from comparePlayers', async () => {
    // Arrange
    const error = new Error('Database error');
    mockComparePlayers.mockRejectedValue(error);
    const req = createRequest({ names: 'Player1,Player2' });
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
    const req = createRequest({ names: 'Player1,Player2' });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockComparisonResult,
    });
  });

  it('rejects POST method', async () => {
    // Arrange
    const req = {
      method: 'POST',
      query: { names: 'Player1,Player2' },
      body: null,
      url: '/api/players/compare',
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
      query: { names: 'Player1,Player2' },
      body: null,
      url: '/api/players/compare',
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
      query: { names: 'Player1,Player2' },
      body: null,
      url: '/api/players/compare',
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


