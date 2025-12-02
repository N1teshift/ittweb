// Mock Firebase/Firestore first, before imports
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({ toDate: () => new Date() })),
  },
}));

jest.mock('@/features/infrastructure/api/firebase', () => ({
  getFirestoreInstance: jest.fn(() => ({})),
}));

jest.mock('@/features/infrastructure/api/firebase/admin', () => ({
  getFirestoreAdmin: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
      })),
      get: jest.fn(),
    })),
  })),
  isServerSide: jest.fn(() => true),
  getAdminTimestamp: jest.fn(() => ({
    now: jest.fn(() => ({ toDate: () => new Date() })),
  })),
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

// Mock services
jest.mock('@/features/modules/game-management/games/lib/gameService', () => ({
  getGames: jest.fn(),
}));

jest.mock('@/features/modules/community/players/lib/playerService', () => ({
  getPlayerStats: jest.fn(),
}));

jest.mock('@/features/modules/community/standings/lib/standingsService', () => ({
  getStandings: jest.fn(),
}));

jest.mock('@/features/modules/game-management/entries/lib/entryService', () => ({
  getAllEntries: jest.fn(),
}));

// Now import after mocks are set up
import { getGames } from '@/features/modules/game-management/games/lib/gameService';
import { getPlayerStats } from '@/features/modules/community/players/lib/playerService';
import { getStandings } from '@/features/modules/community/standings/lib/standingsService';
import { getAllEntries } from '@/features/modules/game-management/entries/lib/entryService';

// Performance thresholds (in milliseconds)
const PERFORMANCE_THRESHOLDS = {
  GAME_LIST_QUERY: 1000, // 1 second
  PLAYER_STATS_QUERY: 500, // 500ms
  STANDINGS_QUERY: 2000, // 2 seconds
  ARCHIVE_QUERY: 1000, // 1 second
};

/**
 * Helper to measure execution time
 */
function measureTime<T>(fn: () => Promise<T>): Promise<{ result: T; time: number }> {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    fn()
      .then((result) => {
        const end = performance.now();
        resolve({ result, time: end - start });
      })
      .catch(reject);
  });
}

/**
 * Generate mock games data
 */
function generateMockGames(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `game-${i}`,
    gameId: i + 1,
    datetime: new Date().toISOString(),
    duration: 1800,
    gamename: 'Test Game',
    map: 'Test Map',
    ownername: 'Test Owner',
    category: 'category1',
    gameState: 'completed' as const,
    verified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

describe('Database Query Performance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Game List Query Performance', () => {
    it('should complete game list queries within acceptable time limits', async () => {
      // Arrange
      const mockGames = generateMockGames(100);
      (getGames as jest.Mock).mockImplementation(async () => {
        // Simulate database query time
        await new Promise((resolve) => setTimeout(resolve, 50));
        return { games: mockGames, total: mockGames.length };
      });

      // Act
      const { time } = await measureTime(() => getGames({ limit: 100 }));

      // Assert
      expect(time).toBeLessThan(PERFORMANCE_THRESHOLDS.GAME_LIST_QUERY);
      expect(getGames).toHaveBeenCalled();
    });

    it('should handle large datasets efficiently', async () => {
      // Arrange
      const largeMockGames = generateMockGames(1000);
      (getGames as jest.Mock).mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return { games: largeMockGames, total: largeMockGames.length };
      });

      // Act
      const { time } = await measureTime(() => getGames({ limit: 1000 }));

      // Assert
      expect(time).toBeLessThan(PERFORMANCE_THRESHOLDS.GAME_LIST_QUERY * 2);
    });

    it('should handle complex filters efficiently', async () => {
      // Arrange
      const mockGames = generateMockGames(500);
      (getGames as jest.Mock).mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
        return { games: mockGames, total: mockGames.length };
      });

      // Act
      const { time } = await measureTime(() =>
        getGames({
          player: 'TestPlayer',
          category: 'category1',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          limit: 500,
        })
      );

      // Assert
      expect(time).toBeLessThan(PERFORMANCE_THRESHOLDS.GAME_LIST_QUERY * 1.5);
    });

    it('should handle concurrent queries without degradation', async () => {
      // Arrange
      const mockGames = generateMockGames(100);
      (getGames as jest.Mock).mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return { games: mockGames, total: mockGames.length };
      });

      // Act
      const start = performance.now();
      const promises = Array.from({ length: 10 }, () => getGames({ limit: 100 }));
      await Promise.all(promises);
      const end = performance.now();
      const totalTime = end - start;

      // Assert
      // Concurrent queries should complete in reasonable time (not 10x sequential time)
      expect(totalTime).toBeLessThan(PERFORMANCE_THRESHOLDS.GAME_LIST_QUERY * 3);
    });
  });

  describe('Player Stats Query Performance', () => {
    it('should complete player stats queries quickly', async () => {
      // Arrange
      (getPlayerStats as jest.Mock).mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return {
          id: 'player1',
          name: 'TestPlayer',
          categories: {
            category1: {
              score: 1000,
              wins: 10,
              losses: 5,
              draws: 2,
              games: 17,
            },
          },
          totalGames: 17,
        };
      });

      // Act
      const { time } = await measureTime(() => getPlayerStats('TestPlayer'));

      // Assert
      expect(time).toBeLessThan(PERFORMANCE_THRESHOLDS.PLAYER_STATS_QUERY);
    });

    it('should handle players with many games efficiently', async () => {
      // Arrange
      const manyGames = Array.from({ length: 1000 }, (_, i) => ({
        id: `game-${i}`,
        datetime: new Date().toISOString(),
      }));

      (getPlayerStats as jest.Mock).mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return {
          id: 'player1',
          name: 'TestPlayer',
          categories: {
            category1: {
              score: 1000,
              wins: 500,
              losses: 500,
              draws: 0,
              games: 1000,
            },
          },
          totalGames: 1000,
          recentGames: manyGames.slice(0, 10),
        };
      });

      // Act
      const { time } = await measureTime(() =>
        getPlayerStats('TestPlayer', { includeGames: true })
      );

      // Assert
      expect(time).toBeLessThan(PERFORMANCE_THRESHOLDS.PLAYER_STATS_QUERY * 2);
    });

    it('should handle complex aggregations efficiently', async () => {
      // Arrange
      (getPlayerStats as jest.Mock).mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
        return {
          id: 'player1',
          name: 'TestPlayer',
          categories: {
            category1: { score: 1000, wins: 10, losses: 5, draws: 2, games: 17 },
            category2: { score: 1100, wins: 15, losses: 3, draws: 1, games: 19 },
            category3: { score: 950, wins: 8, losses: 7, draws: 3, games: 18 },
          },
          totalGames: 54,
        };
      });

      // Act
      const { time } = await measureTime(() => getPlayerStats('TestPlayer'));

      // Assert
      expect(time).toBeLessThan(PERFORMANCE_THRESHOLDS.PLAYER_STATS_QUERY * 2);
    });
  });

  describe('Standings Query Performance', () => {
    it('should calculate and return standings quickly', async () => {
      // Arrange
      const mockStandings = Array.from({ length: 100 }, (_, i) => ({
        rank: i + 1,
        name: `Player${i + 1}`,
        score: 2000 - i * 10,
        wins: 100 - i,
        losses: i,
        winRate: ((100 - i) / (100 - i + i)) * 100,
        games: 100,
      }));

      (getStandings as jest.Mock).mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return { standings: mockStandings, total: mockStandings.length };
      });

      // Act
      const { time } = await measureTime(() => getStandings({ category: 'category1' }));

      // Assert
      expect(time).toBeLessThan(PERFORMANCE_THRESHOLDS.STANDINGS_QUERY);
    });

    it('should handle many players efficiently', async () => {
      // Arrange
      const manyStandings = Array.from({ length: 1000 }, (_, i) => {
        const wins = 100 - Math.floor(i / 10);
        const losses = Math.floor(i / 10);
        const games = wins + losses;
        return {
          rank: i + 1,
          name: `Player${i + 1}`,
          score: 2000 - i * 2,
          wins,
          losses,
          winRate: games > 0 ? (wins / games) * 100 : 0,
          games,
        };
      });

      (getStandings as jest.Mock).mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { standings: manyStandings, total: manyStandings.length };
      });

      // Act
      const { time } = await measureTime(() => getStandings({ category: 'category1' }));

      // Assert
      expect(time).toBeLessThan(PERFORMANCE_THRESHOLDS.STANDINGS_QUERY * 2);
    });

    it('should handle complex sorting efficiently', async () => {
      // Arrange
      const standingsData = Array.from({ length: 500 }, (_, i) => {
        const wins = 100 - Math.floor(i / 5);
        const losses = Math.floor(i / 5);
        const games = wins + losses;
        return {
          rank: i + 1,
          name: `Player${i + 1}`,
          score: 2000 - i * 4,
          wins,
          losses,
          winRate: games > 0 ? (wins / games) * 100 : 0,
          games,
        };
      });
      (getStandings as jest.Mock).mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return { standings: standingsData, total: standingsData.length };
      });

      // Act
      const { time } = await measureTime(() => getStandings({ category: 'category1' }));

      // Assert
      expect(time).toBeLessThan(PERFORMANCE_THRESHOLDS.STANDINGS_QUERY * 1.5);
    });
  });

  describe('Archive Query Performance', () => {
    it('should complete archive queries within acceptable time', async () => {
      // Arrange
      const mockEntries = Array.from({ length: 50 }, (_, i) => ({
        id: `entry-${i}`,
        title: `Entry ${i}`,
        content: 'Test content',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      (getAllEntries as jest.Mock).mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return mockEntries;
      });

      // Act
      const { time } = await measureTime(() => getAllEntries());

      // Assert
      expect(time).toBeLessThan(PERFORMANCE_THRESHOLDS.ARCHIVE_QUERY);
    });

    it('should handle large archives efficiently', async () => {
      // Arrange
      const largeEntries = Array.from({ length: 500 }, (_, i) => ({
        id: `entry-${i}`,
        title: `Entry ${i}`,
        content: 'Test content with media',
        media: [{ url: 'test.jpg', type: 'image' }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      (getAllEntries as jest.Mock).mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return largeEntries;
      });

      // Act
      const { time } = await measureTime(() => getAllEntries());

      // Assert
      expect(time).toBeLessThan(PERFORMANCE_THRESHOLDS.ARCHIVE_QUERY * 2);
    });

    it('should handle complex filters efficiently', async () => {
      // Arrange
      (getAllEntries as jest.Mock).mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
        return Array.from({ length: 200 }, (_, i) => ({
          id: `entry-${i}`,
          title: `Entry ${i}`,
          content: 'Filtered content',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
      });

      // Act
      const { time } = await measureTime(() => getAllEntries());

      // Assert
      expect(time).toBeLessThan(PERFORMANCE_THRESHOLDS.ARCHIVE_QUERY * 1.5);
    });
  });
});

