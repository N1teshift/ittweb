import type { NextApiRequest } from 'next';
import { createMockRequest, createMockResponse } from '../../../../../test-utils/mockNext';
import handlerWinRate from '../win-rate';

jest.mock('@/features/modules/analytics/lib/analyticsService', () => ({
  getWinRateData: jest.fn(),
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

const { getWinRateData } = jest.requireMock('@/features/modules/analytics/lib/analyticsService');

const runHandler = async (req: NextApiRequest) => {
  const { res, status, json } = createMockResponse();
  await handlerWinRate(req, res);
  return { status, json };
};

describe('GET /api/analytics/win-rate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return win rate data', async () => {
    // Arrange
    const mockData = { wins: 10, losses: 5, draws: 2 };
    (getWinRateData as jest.Mock).mockResolvedValue(mockData);
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

  it('should filter by player name', async () => {
    // Arrange
    (getWinRateData as jest.Mock).mockResolvedValue({ wins: 0, losses: 0, draws: 0 });
    const req = createMockRequest({
      method: 'GET',
      query: { playerName: 'TestPlayer' },
    });

    // Act
    await runHandler(req);

    // Assert
    expect(getWinRateData).toHaveBeenCalledWith(
      'TestPlayer',
      undefined,
      undefined,
      undefined
    );
  });

  it('should filter by category', async () => {
    // Arrange
    (getWinRateData as jest.Mock).mockResolvedValue({ wins: 0, losses: 0, draws: 0 });
    const req = createMockRequest({
      method: 'GET',
      query: { category: 'category1' },
    });

    // Act
    await runHandler(req);

    // Assert
    expect(getWinRateData).toHaveBeenCalledWith(
      undefined,
      'category1',
      undefined,
      undefined
    );
  });

  it('should filter by date range', async () => {
    // Arrange
    (getWinRateData as jest.Mock).mockResolvedValue({ wins: 0, losses: 0, draws: 0 });
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
    expect(getWinRateData).toHaveBeenCalledWith(
      undefined,
      undefined,
      '2024-01-01',
      '2024-01-31'
    );
  });

  it('should handle multiple filters', async () => {
    // Arrange
    (getWinRateData as jest.Mock).mockResolvedValue({ wins: 0, losses: 0, draws: 0 });
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
    expect(getWinRateData).toHaveBeenCalledWith(
      'Player1',
      'category1',
      '2024-01-01',
      '2024-01-31'
    );
  });

  it('should handle no games', async () => {
    // Arrange
    (getWinRateData as jest.Mock).mockResolvedValue({ wins: 0, losses: 0, draws: 0 });
    const req = createMockRequest({
      method: 'GET',
      query: {},
    });

    // Act
    const { status, json } = await runHandler(req);

    // Assert
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ wins: 0, losses: 0, draws: 0 });
  });

  it('should handle invalid filters', async () => {
    // Arrange
    (getWinRateData as jest.Mock).mockResolvedValue({ wins: 0, losses: 0, draws: 0 });
    const req = createMockRequest({
      method: 'GET',
      query: {
        playerName: '',
        category: 'invalid',
      },
    });

    // Act
    const { status } = await runHandler(req);

    // Assert
    expect(status).toHaveBeenCalledWith(200);
  });

  it('should handle no matches', async () => {
    // Arrange
    (getWinRateData as jest.Mock).mockResolvedValue({ wins: 0, losses: 0, draws: 0 });
    const req = createMockRequest({
      method: 'GET',
      query: {
        playerName: 'NonExistentPlayer',
        category: 'NonExistentCategory',
      },
    });

    // Act
    const { status, json } = await runHandler(req);

    // Assert
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ wins: 0, losses: 0, draws: 0 });
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

