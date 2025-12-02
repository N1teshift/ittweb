import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../index';

// Mock dependencies
const mockGetStandings = jest.fn();
const mockInfo = jest.fn();
const mockError = jest.fn();
const mockWarn = jest.fn();
const mockDebug = jest.fn();

jest.mock('@/features/modules/community/standings/lib/standingsService', () => ({
  getStandings: (...args: unknown[]) => mockGetStandings(...args),
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

describe('GET /api/standings', () => {
  const createRequest = (query: Record<string, string> = {}): NextApiRequest => ({
    method: 'GET',
    query,
    body: null,
    url: '/api/standings',
  } as NextApiRequest);

  const createResponse = (): NextApiResponse => {
    const res = {} as NextApiResponse;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockStandings = {
    players: [
      { name: 'Player1', elo: 1600, wins: 15, losses: 3 },
      { name: 'Player2', elo: 1500, wins: 10, losses: 5 },
    ],
    total: 2,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetStandings.mockResolvedValue(mockStandings);
  });

  it('returns standings without filters', async () => {
    // Arrange
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockGetStandings).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockStandings,
    });
  });

  it('applies category filter', async () => {
    // Arrange
    const req = createRequest({ category: '4v4' });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockGetStandings).toHaveBeenCalledWith(
      expect.objectContaining({
        category: '4v4',
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('applies minGames filter', async () => {
    // Arrange
    const req = createRequest({ minGames: '10' });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockGetStandings).toHaveBeenCalledWith(
      expect.objectContaining({
        minGames: 10,
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('applies page filter', async () => {
    // Arrange
    const req = createRequest({ page: '2' });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockGetStandings).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2,
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('applies limit filter', async () => {
    // Arrange
    const req = createRequest({ limit: '50' });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockGetStandings).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: 50,
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('applies all filters together', async () => {
    // Arrange
    const req = createRequest({
      category: '4v4',
      minGames: '10',
      page: '2',
      limit: '50',
    });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockGetStandings).toHaveBeenCalledWith({
      category: '4v4',
      minGames: 10,
      page: 2,
      limit: 50,
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('handles invalid numeric parameters (NaN)', async () => {
    // Arrange
    const req = createRequest({ minGames: 'invalid' });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    // parseInt('invalid', 10) returns NaN, which should be handled
    expect(mockGetStandings).toHaveBeenCalledWith(
      expect.objectContaining({
        minGames: NaN,
      })
    );
    // The service should handle NaN, but if it doesn't, we'll get an error
  });

  it('handles empty standings', async () => {
    // Arrange
    mockGetStandings.mockResolvedValue({ players: [], total: 0 });
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { players: [], total: 0 },
    });
  });

  it('handles error from getStandings', async () => {
    // Arrange
    const error = new Error('Database error');
    mockGetStandings.mockRejectedValue(error);
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

  it('does not require authentication', async () => {
    // Arrange
    mockGetServerSession.mockResolvedValue(null);
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockStandings,
    });
  });

  it('rejects POST method', async () => {
    // Arrange
    const req = {
      method: 'POST',
      query: {},
      body: null,
      url: '/api/standings',
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
      query: {},
      body: null,
      url: '/api/standings',
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
      query: {},
      body: null,
      url: '/api/standings',
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


