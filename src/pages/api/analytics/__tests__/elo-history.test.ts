import type { NextApiRequest, NextApiResponse } from 'next';
import { createMockRequest, createMockResponse } from '../../../../test-utils/mockNext';
import type { ApiResponse } from '@/features/infrastructure/api';

// Mock routeHandlers BEFORE importing handler to prevent NextAuth/jose import
jest.mock('@/features/infrastructure/api', () => ({
  createApiHandler: <T,>(handler: (req: NextApiRequest, res: NextApiResponse<ApiResponse<T>>, context?: { session: unknown }) => Promise<T>, options?: { methods?: string[] }) => {
    return async (req: NextApiRequest, res: NextApiResponse<ApiResponse<T>>) => {
      // Check allowed methods from options
      const allowedMethods = options?.methods || ['GET'];
      if (req.method && !allowedMethods.includes(req.method)) {
        return res.status(405).json({
          success: false,
          error: `Method ${req.method} not allowed. Allowed methods: ${allowedMethods.join(', ')}`,
        });
      }
      try {
        const result = await handler(req, res, { session: null });
        res.status(200).json({ success: true, data: result });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, error: errorMessage });
      }
    };
  },
  createGetHandler: <T,>(handler: (req: NextApiRequest, res: NextApiResponse<ApiResponse<T>>, context?: { session: unknown }) => Promise<T>, options?: { methods?: string[] }) => {
    return jest.requireMock<typeof import('@/features/infrastructure/api')>('@/features/infrastructure/api').createApiHandler(handler, { ...options, methods: ['GET'] });
  },
}));

jest.mock('@/features/modules/analytics-group/analytics/lib/analyticsService', () => ({
  getEloHistory: jest.fn(),
}));

jest.mock('@/features/infrastructure/logging', () => ({
  createComponentLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  })),
  logError: jest.fn(),
}));

import handlerEloHistory from '../elo-history';

const { getEloHistory } = jest.requireMock('@/features/modules/analytics-group/analytics/lib/analyticsService');

const runHandler = async (req: NextApiRequest) => {
  const { res, status, json } = createMockResponse();
  await handlerEloHistory(req, res);
  return { status, json };
};

describe('GET /api/analytics/elo-history', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return ELO history data', async () => {
    // Arrange
    const mockData = [
      { date: '2024-01-01', elo: 1000 },
      { date: '2024-01-02', elo: 1010 },
    ];
    (getEloHistory as jest.Mock).mockResolvedValue(mockData);
    const req = createMockRequest({
      method: 'GET',
      query: {
        playerName: 'TestPlayer',
        category: 'category1',
      },
    });

    // Act
    const { status, json } = await runHandler(req);

    // Assert
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ success: true, data: mockData });
  });

  it('should filter by player', async () => {
    // Arrange
    (getEloHistory as jest.Mock).mockResolvedValue([]);
    const req = createMockRequest({
      method: 'GET',
      query: {
        playerName: 'Player1',
        category: 'category1',
      },
    });

    // Act
    await runHandler(req);

    // Assert
    expect(getEloHistory).toHaveBeenCalledWith(
      'Player1',
      'category1',
      undefined,
      undefined
    );
  });

  it('should filter by category', async () => {
    // Arrange
    (getEloHistory as jest.Mock).mockResolvedValue([]);
    const req = createMockRequest({
      method: 'GET',
      query: {
        playerName: 'Player1',
        category: 'category2',
      },
    });

    // Act
    await runHandler(req);

    // Assert
    expect(getEloHistory).toHaveBeenCalledWith(
      'Player1',
      'category2',
      undefined,
      undefined
    );
  });

  it('should filter by date range', async () => {
    // Arrange
    (getEloHistory as jest.Mock).mockResolvedValue([]);
    const req = createMockRequest({
      method: 'GET',
      query: {
        playerName: 'Player1',
        category: 'category1',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      },
    });

    // Act
    await runHandler(req);

    // Assert
    expect(getEloHistory).toHaveBeenCalledWith(
      'Player1',
      'category1',
      '2024-01-01',
      '2024-01-31'
    );
  });

  it('should handle no history', async () => {
    // Arrange
    (getEloHistory as jest.Mock).mockResolvedValue([]);
    const req = createMockRequest({
      method: 'GET',
      query: {
        playerName: 'Player1',
        category: 'category1',
      },
    });

    // Act
    const { status, json } = await runHandler(req);

    // Assert
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ success: true, data: [] });
  });

  it('should handle many data points', async () => {
    // Arrange
    const largeData = Array.from({ length: 1000 }, (_, i) => ({
      date: `2024-01-${String(i + 1).padStart(2, '0')}`,
      elo: 1000 + i,
    }));
    (getEloHistory as jest.Mock).mockResolvedValue(largeData);
    const req = createMockRequest({
      method: 'GET',
      query: {
        playerName: 'Player1',
        category: 'category1',
      },
    });

    // Act
    const { status, json } = await runHandler(req);

    // Assert
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ success: true, data: largeData });
  });

  it('should require playerName and category', async () => {
    // Arrange
    const req = createMockRequest({
      method: 'GET',
      query: {},
    });

    // Act
    const { status } = await runHandler(req);

    // Assert
    expect(status).toHaveBeenCalledWith(500);
  });

  it('should handle missing player', async () => {
    // Arrange
    const req = createMockRequest({
      method: 'GET',
      query: {
        category: 'category1',
      },
    });

    // Act
    const { status } = await runHandler(req);

    // Assert
    expect(status).toHaveBeenCalledWith(500);
  });

  it('should reject non-GET methods', async () => {
    // Arrange
    const req = createMockRequest({
      method: 'POST',
      query: {
        playerName: 'Player1',
        category: 'category1',
      },
    });

    // Act
    const { status } = await runHandler(req);

    // Assert
    expect(status).toHaveBeenCalledWith(405);
  });
});


