import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../[className]';

// Mock dependencies
const mockGetClassStats = jest.fn();
const mockInfo = jest.fn();
const mockError = jest.fn();
const mockWarn = jest.fn();
const mockDebug = jest.fn();

jest.mock('@/features/modules/analytics-group/analytics/lib/analyticsService', () => ({
  getClassStats: (...args: unknown[]) => mockGetClassStats(...args),
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

describe('GET /api/classes/[className]', () => {
  const createRequest = (className: string, query: Record<string, string> = {}): NextApiRequest => ({
    method: 'GET',
    query: { className, ...query },
    body: null,
    url: `/api/classes/${className}`,
  } as NextApiRequest);

  const createResponse = (): NextApiResponse => {
    const res = {} as NextApiResponse;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockClassStats = [
    { id: 'warrior', name: 'Warrior', gamesPlayed: 100 },
    { id: 'mage', name: 'Mage', gamesPlayed: 80 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetClassStats.mockResolvedValue(mockClassStats);
  });

  it('returns class statistics by className', async () => {
    // Arrange
    const req = createRequest('warrior');
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockGetClassStats).toHaveBeenCalledWith(undefined);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockClassStats[0],
    });
  });

  it('handles case-insensitive className matching', async () => {
    // Arrange
    const req = createRequest('WARRIOR'); // Uppercase
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockClassStats[0],
    });
  });

  it('applies category filter', async () => {
    // Arrange
    const req = createRequest('warrior', { category: '4v4' });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockGetClassStats).toHaveBeenCalledWith('4v4');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns 500 when className is missing', async () => {
    // Arrange
    const req = {
      method: 'GET',
      query: {}, // No className
      body: null,
      url: '/api/classes/',
    } as NextApiRequest;
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Class name is required',
      })
    );
  });

  it('returns 500 when class not found', async () => {
    // Arrange
    const req = createRequest('non-existent');
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining("Class 'non-existent' not found"),
      })
    );
  });

  it('handles error from getClassStats', async () => {
    // Arrange
    const error = new Error('Database error');
    mockGetClassStats.mockRejectedValue(error);
    const req = createRequest('warrior');
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
    const req = createRequest('warrior');
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockClassStats[0],
    });
  });

  it('sets cache control headers', async () => {
    // Arrange
    const req = createRequest('warrior');
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      expect.stringContaining('max-age=300')
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      expect.stringContaining('public')
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      expect.stringContaining('must-revalidate')
    );
  });

  it('rejects POST method', async () => {
    // Arrange
    const req = {
      method: 'POST',
      query: { className: 'warrior' },
      body: null,
      url: '/api/classes/warrior',
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
});

