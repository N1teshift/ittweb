// Mock dependencies first, before imports
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/features/modules/game-management/games/lib/gameService', () => ({
  getGames: jest.fn(),
}));

jest.mock('@/features/modules/community/players/lib/playerService', () => ({
  getAllPlayers: jest.fn(),
}));

jest.mock('@/features/modules/community/standings/lib/standingsService', () => ({
  getStandings: jest.fn(),
}));

jest.mock('@/features/modules/analytics-group/analytics/lib/analyticsService', () => ({
  getActivityData: jest.fn(),
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

jest.mock('@/pages/api/auth/[...nextauth]', () => ({
  default: jest.fn(),
  authOptions: {},
}));

// Now import after mocks are set up
import type { NextApiRequest } from 'next';
import { createMockRequest, createMockResponse } from '@/test-utils/mockNext';
import handlerGamesIndex from '@/pages/api/games/index';
import handlerPlayersIndex from '@/pages/api/players/index';
import handlerStandings from '@/pages/api/standings/index';
import handlerAnalyticsActivity from '@/pages/api/analytics/activity';

const { getGames } = jest.requireMock('@/features/modules/game-management/games/lib/gameService');
const { getAllPlayers } = jest.requireMock('@/features/modules/community/players/lib/playerService');
const { getStandings } = jest.requireMock('@/features/modules/community/standings/lib/standingsService');
const { getActivityData } = jest.requireMock('@/features/modules/analytics-group/analytics/lib/analyticsService');

// Performance thresholds (in milliseconds)
const PERFORMANCE_THRESHOLDS = {
  API_RESPONSE_TIME: 500, // 500ms
  CONCURRENT_REQUESTS: 2000, // 2 seconds for multiple requests
  ERROR_RECOVERY: 1000, // 1 second
};

/**
 * Helper to measure API response time
 */
async function measureApiResponseTime(
  handler: (req: NextApiRequest, res: any) => Promise<void>,
  req: NextApiRequest
): Promise<number> {
  const start = performance.now();
  const { res } = createMockResponse();
  await handler(req, res);
  const end = performance.now();
  return end - start;
}

describe('API Response Performance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('API Response Times', () => {
    it('should respond to API requests within acceptable time limits', async () => {
      // Arrange
      const mockGames = Array.from({ length: 100 }, (_, i) => ({
        id: `game-${i}`,
        gameId: i + 1,
        datetime: new Date().toISOString(),
      }));

      (getGames as jest.Mock).mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return { games: mockGames, total: mockGames.length };
      });

      const req = createMockRequest({
        method: 'GET',
        query: { limit: '100' },
      });

      // Act
      const responseTime = await measureApiResponseTime(handlerGamesIndex, req);

      // Assert
      expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.API_RESPONSE_TIME);
    });

    it('should handle complex queries efficiently', async () => {
      // Arrange
      (getGames as jest.Mock).mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return {
          games: Array.from({ length: 500 }, (_, i) => ({
            id: `game-${i}`,
            gameId: i + 1,
            datetime: new Date().toISOString(),
          })),
          total: 500,
        };
      });

      const req = createMockRequest({
        method: 'GET',
        query: {
          player: 'TestPlayer',
          category: 'category1',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          limit: '500',
        },
      });

      // Act
      const responseTime = await measureApiResponseTime(handlerGamesIndex, req);

      // Assert
      expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.API_RESPONSE_TIME * 2);
    });

    it('should handle large payloads efficiently', async () => {
      // Arrange
      const largePayload = Array.from({ length: 1000 }, (_, i) => ({
        id: `game-${i}`,
        gameId: i + 1,
        datetime: new Date().toISOString(),
        players: Array.from({ length: 10 }, (_, j) => ({
          name: `Player${j}`,
          flag: 'winner' as const,
        })),
      }));

      (getGames as jest.Mock).mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return { games: largePayload, total: largePayload.length };
      });

      const req = createMockRequest({
        method: 'GET',
        query: { limit: '1000' },
      });

      // Act
      const responseTime = await measureApiResponseTime(handlerGamesIndex, req);

      // Assert
      expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.API_RESPONSE_TIME * 3);
    });
  });

  describe('API Concurrent Request Handling', () => {
    it('should handle concurrent requests without degradation', async () => {
      // Arrange
      (getGames as jest.Mock).mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return { games: [], total: 0 };
      });

      const requests = Array.from({ length: 10 }, () =>
        createMockRequest({
          method: 'GET',
          query: { limit: '100' },
        })
      );

      // Act
      const start = performance.now();
      const promises = requests.map((req) => measureApiResponseTime(handlerGamesIndex, req));
      await Promise.all(promises);
      const end = performance.now();
      const totalTime = end - start;

      // Assert
      expect(totalTime).toBeLessThan(PERFORMANCE_THRESHOLDS.CONCURRENT_REQUESTS);
    });

    it('should handle many concurrent requests efficiently', async () => {
      // Arrange
      (getAllPlayers as jest.Mock).mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 30));
        return Array.from({ length: 100 }, (_, i) => ({
          id: `player-${i}`,
          name: `Player${i}`,
        }));
      });

      const requests = Array.from({ length: 50 }, () =>
        createMockRequest({
          method: 'GET',
          query: {},
        })
      );

      // Act
      const start = performance.now();
      const promises = requests.map((req) => measureApiResponseTime(handlerPlayersIndex, req));
      await Promise.all(promises);
      const end = performance.now();
      const totalTime = end - start;

      // Assert
      // Should handle 50 concurrent requests in reasonable time
      expect(totalTime).toBeLessThan(PERFORMANCE_THRESHOLDS.CONCURRENT_REQUESTS * 2);
    });

    it('should handle mixed concurrent requests efficiently', async () => {
      // Arrange
      (getGames as jest.Mock).mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return { games: [], total: 0 };
      });

      (getStandings as jest.Mock).mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return { standings: [], total: 0 };
      });

      (getActivityData as jest.Mock).mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 75));
        return [];
      });

      const gameRequests = Array.from({ length: 5 }, () =>
        createMockRequest({ method: 'GET', query: {} })
      );
      const standingsRequests = Array.from({ length: 5 }, () =>
        createMockRequest({ method: 'GET', query: {} })
      );
      const analyticsRequests = Array.from({ length: 5 }, () =>
        createMockRequest({ method: 'GET', query: {} })
      );

      // Act
      const start = performance.now();
      const promises = [
        ...gameRequests.map((req) => measureApiResponseTime(handlerGamesIndex, req)),
        ...standingsRequests.map((req) => measureApiResponseTime(handlerStandings, req)),
        ...analyticsRequests.map((req) => measureApiResponseTime(handlerAnalyticsActivity, req)),
      ];
      await Promise.all(promises);
      const end = performance.now();
      const totalTime = end - start;

      // Assert
      expect(totalTime).toBeLessThan(PERFORMANCE_THRESHOLDS.CONCURRENT_REQUESTS * 2);
    });
  });

  describe('API Error Recovery', () => {
    it('should recover from errors quickly', async () => {
      // Arrange
      (getGames as jest.Mock)
        .mockRejectedValueOnce(new Error('Database error'))
        .mockResolvedValueOnce({ games: [], total: 0 });

      const req = createMockRequest({
        method: 'GET',
        query: {},
      });

      // Act - First request fails
      const errorTime = await measureApiResponseTime(handlerGamesIndex, req);

      // Second request succeeds
      const recoveryTime = await measureApiResponseTime(handlerGamesIndex, req);

      // Assert
      expect(errorTime).toBeLessThan(PERFORMANCE_THRESHOLDS.ERROR_RECOVERY);
      expect(recoveryTime).toBeLessThan(PERFORMANCE_THRESHOLDS.API_RESPONSE_TIME);
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      (getGames as jest.Mock).mockRejectedValue(new Error('Connection timeout'));

      const req = createMockRequest({
        method: 'GET',
        query: {},
      });

      // Act
      const errorTime = await measureApiResponseTime(handlerGamesIndex, req);

      // Assert
      expect(errorTime).toBeLessThan(PERFORMANCE_THRESHOLDS.ERROR_RECOVERY);
    });

    it('should handle network errors gracefully', async () => {
      // Arrange
      (getStandings as jest.Mock).mockRejectedValue(new Error('Network error'));

      const req = createMockRequest({
        method: 'GET',
        query: {},
      });

      // Act
      const errorTime = await measureApiResponseTime(handlerStandings, req);

      // Assert
      expect(errorTime).toBeLessThan(PERFORMANCE_THRESHOLDS.ERROR_RECOVERY);
    });

    it('should recover from timeout errors quickly', async () => {
      // Arrange
      (getActivityData as jest.Mock)
        .mockImplementationOnce(async () => {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return [];
        })
        .mockResolvedValueOnce([]);

      const req = createMockRequest({
        method: 'GET',
        query: {},
      });

      // Act - First request times out (simulated)
      const timeoutTime = await measureApiResponseTime(handlerAnalyticsActivity, req);

      // Second request succeeds
      const recoveryTime = await measureApiResponseTime(handlerAnalyticsActivity, req);

      // Assert
      expect(recoveryTime).toBeLessThan(PERFORMANCE_THRESHOLDS.API_RESPONSE_TIME);
    });
  });
});

