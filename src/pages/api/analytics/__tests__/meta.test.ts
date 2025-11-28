import type { NextApiRequest } from 'next';
import { createMockRequest, createMockResponse } from '../../../../../test-utils/mockNext';
import handlerMeta from '../meta';

jest.mock('@/features/modules/analytics/lib/analyticsService', () => ({
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

const analyticsService = jest.requireMock('@/features/modules/analytics/lib/analyticsService');

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
    expect(json).toHaveBeenCalledWith(mockData);
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
    expect(responseData).toHaveProperty('activity');
    expect(responseData).toHaveProperty('gameLength');
    expect(responseData).toHaveProperty('playerActivity');
    expect(responseData).toHaveProperty('classSelection');
    expect(responseData).toHaveProperty('classWinRates');
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
    expect(responseData.activity).toEqual([]);
    expect(responseData.gameLength).toEqual([]);
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

