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
  getActivityData: jest.fn(),
  getGameLengthData: jest.fn(),
  getPlayerActivityData: jest.fn(),
  getClassSelectionData: jest.fn(),
  getClassWinRateData: jest.fn(),
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

import handlerMeta from '../meta';

const analyticsService = jest.requireMock('@/features/modules/analytics-group/analytics/lib/analyticsService');

const runHandler = async (req: NextApiRequest) => {
  const { res, status, json } = createMockResponse();
  await handlerMeta(req, res);
  return { status, json };
};

describe('GET /api/analytics/meta', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return meta statistics', async () => {
    // Arrange
    const mockData = {
      activity: [{ date: '2024-01-01', games: 5 }],
      gameLength: [{ date: '2024-01-01', averageDuration: 30 }],
      playerActivity: [{ date: '2024-01-01', players: 10 }],
      classSelection: [{ className: 'warrior', count: 5 }],
      classWinRates: [{ className: 'warrior', winRate: 50 }],
    };
    (analyticsService.getActivityData as jest.Mock).mockResolvedValue(mockData.activity);
    (analyticsService.getGameLengthData as jest.Mock).mockResolvedValue(mockData.gameLength);
    (analyticsService.getPlayerActivityData as jest.Mock).mockResolvedValue(mockData.playerActivity);
    (analyticsService.getClassSelectionData as jest.Mock).mockResolvedValue(mockData.classSelection);
    (analyticsService.getClassWinRateData as jest.Mock).mockResolvedValue(mockData.classWinRates);

    const req = createMockRequest({
      method: 'GET',
      query: {},
    });

    // Act
    const { status, json } = await runHandler(req);

    // Assert
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ success: true, data: mockData });
  });

  it('should aggregate data correctly', async () => {
    // Arrange
    (analyticsService.getActivityData as jest.Mock).mockResolvedValue([]);
    (analyticsService.getGameLengthData as jest.Mock).mockResolvedValue([]);
    (analyticsService.getPlayerActivityData as jest.Mock).mockResolvedValue([]);
    (analyticsService.getClassSelectionData as jest.Mock).mockResolvedValue([]);
    (analyticsService.getClassWinRateData as jest.Mock).mockResolvedValue([]);

    const req = createMockRequest({
      method: 'GET',
      query: {},
    });

    // Act
    const { status, json } = await runHandler(req);

    // Assert
    expect(status).toHaveBeenCalledWith(200);
    const responseData = (json as jest.Mock).mock.calls[0][0];
    expect(responseData).toHaveProperty('success', true);
    expect(responseData).toHaveProperty('data');
    expect(responseData.data).toHaveProperty('activity');
    expect(responseData.data).toHaveProperty('gameLength');
    expect(responseData.data).toHaveProperty('playerActivity');
    expect(responseData.data).toHaveProperty('classSelection');
    expect(responseData.data).toHaveProperty('classWinRates');
  });

  it('should handle empty database', async () => {
    // Arrange
    (analyticsService.getActivityData as jest.Mock).mockResolvedValue([]);
    (analyticsService.getGameLengthData as jest.Mock).mockResolvedValue([]);
    (analyticsService.getPlayerActivityData as jest.Mock).mockResolvedValue([]);
    (analyticsService.getClassSelectionData as jest.Mock).mockResolvedValue([]);
    (analyticsService.getClassWinRateData as jest.Mock).mockResolvedValue([]);

    const req = createMockRequest({
      method: 'GET',
      query: {},
    });

    // Act
    const { status, json } = await runHandler(req);

    // Assert
    expect(status).toHaveBeenCalledWith(200);
    const responseData = (json as jest.Mock).mock.calls[0][0];
    expect(responseData.data.activity).toEqual([]);
    expect(responseData.data.gameLength).toEqual([]);
  });

  it('should filter by category', async () => {
    // Arrange
    (analyticsService.getActivityData as jest.Mock).mockResolvedValue([]);
    (analyticsService.getGameLengthData as jest.Mock).mockResolvedValue([]);
    (analyticsService.getPlayerActivityData as jest.Mock).mockResolvedValue([]);
    (analyticsService.getClassSelectionData as jest.Mock).mockResolvedValue([]);
    (analyticsService.getClassWinRateData as jest.Mock).mockResolvedValue([]);

    const req = createMockRequest({
      method: 'GET',
      query: { category: 'category1' },
    });

    // Act
    await runHandler(req);

    // Assert
    expect(analyticsService.getActivityData).toHaveBeenCalledWith(
      undefined,
      undefined,
      undefined,
      'category1'
    );
    expect(analyticsService.getGameLengthData).toHaveBeenCalledWith(
      'category1',
      undefined,
      undefined,
      undefined
    );
  });

  it('should filter by date range', async () => {
    // Arrange
    (analyticsService.getActivityData as jest.Mock).mockResolvedValue([]);
    (analyticsService.getGameLengthData as jest.Mock).mockResolvedValue([]);
    (analyticsService.getPlayerActivityData as jest.Mock).mockResolvedValue([]);
    (analyticsService.getClassSelectionData as jest.Mock).mockResolvedValue([]);
    (analyticsService.getClassWinRateData as jest.Mock).mockResolvedValue([]);

    const req = createMockRequest({
      method: 'GET',
      query: {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      },
    });

    // Act
    await runHandler(req);

    // Assert
    expect(analyticsService.getActivityData).toHaveBeenCalledWith(
      undefined,
      '2024-01-01',
      '2024-01-31',
      undefined
    );
  });

  it('should filter by team format', async () => {
    // Arrange
    (analyticsService.getActivityData as jest.Mock).mockResolvedValue([]);
    (analyticsService.getGameLengthData as jest.Mock).mockResolvedValue([]);
    (analyticsService.getPlayerActivityData as jest.Mock).mockResolvedValue([]);
    (analyticsService.getClassSelectionData as jest.Mock).mockResolvedValue([]);
    (analyticsService.getClassWinRateData as jest.Mock).mockResolvedValue([]);

    const req = createMockRequest({
      method: 'GET',
      query: { teamFormat: '1v1' },
    });

    // Act
    await runHandler(req);

    // Assert
    expect(analyticsService.getGameLengthData).toHaveBeenCalledWith(
      undefined,
      undefined,
      undefined,
      '1v1'
    );
  });

  it('should handle missing fields', async () => {
    // Arrange
    (analyticsService.getActivityData as jest.Mock).mockResolvedValue([]);
    (analyticsService.getGameLengthData as jest.Mock).mockResolvedValue([]);
    (analyticsService.getPlayerActivityData as jest.Mock).mockResolvedValue([]);
    (analyticsService.getClassSelectionData as jest.Mock).mockResolvedValue([]);
    (analyticsService.getClassWinRateData as jest.Mock).mockResolvedValue([]);

    const req = createMockRequest({
      method: 'GET',
      query: {},
    });

    // Act
    const { status } = await runHandler(req);

    // Assert
    expect(status).toHaveBeenCalledWith(200);
  });

  it('should reject non-GET methods', async () => {
    // Arrange
    const req = createMockRequest({
      method: 'POST',
      query: {},
    });

    // Act
    const { status } = await runHandler(req);

    // Assert
    expect(status).toHaveBeenCalledWith(405);
  });
});


