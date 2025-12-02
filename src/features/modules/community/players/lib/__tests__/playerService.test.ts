jest.mock('firebase/firestore', () => {
  const mockGetDoc = jest.fn();
  const mockGetDocs = jest.fn();
  return {
    mockGetDoc,
    mockGetDocs,
    getDoc: (...args: unknown[]) => mockGetDoc(...args),
    getDocs: (...args: unknown[]) => mockGetDocs(...args),
    collection: jest.fn(),
    doc: jest.fn(),
    setDoc: jest.fn(),
    addDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    query: jest.fn(),
    orderBy: jest.fn(),
    where: jest.fn(),
    limit: jest.fn(),
    Timestamp: {
      now: jest.fn(() => ({ toDate: () => new Date('2020-01-01T00:00:00Z'), toMillis: () => 1577836800000 })),
      fromDate: jest.fn((date: Date) => ({ toDate: () => date, toMillis: () => date.getTime() })),
    },
  };
});

const mockIsServerSide = jest.fn(() => false);

jest.mock('@/features/infrastructure/api/firebase', () => ({
  getFirestoreInstance: jest.fn(() => ({})),
}));

jest.mock('@/features/infrastructure/api/firebase/admin', () => ({
  getFirestoreAdmin: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
      })),
    })),
  })),
  isServerSide: mockIsServerSide,
  getAdminTimestamp: jest.fn(() => ({
    now: jest.fn(() => ({ toDate: () => new Date('2020-01-01T00:00:00Z') })),
    fromDate: jest.fn((date: Date) => ({ toDate: () => date })),
  })),
}));

jest.mock('@/features/infrastructure/logging', () => ({
  createComponentLogger: jest.fn(() => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() })),
  logError: jest.fn(),
}));

jest.mock('@/features/modules/game-management/games/lib/gameService', () => ({
  getGames: jest.fn(),
  getGameById: jest.fn(),
}));

jest.mock('@/features/modules/community/standings/lib/playerCategoryStatsService', () => ({
  upsertPlayerCategoryStats: jest.fn(),
}));

const { mockGetDoc, mockGetDocs } = jest.requireMock('firebase/firestore');
const { doc, getDoc, getDocs, setDoc, updateDoc, collection, query, where, orderBy, Timestamp } = jest.requireMock('firebase/firestore');
const { getFirestoreInstance } = jest.requireMock('@/features/infrastructure/api/firebase');
const { getFirestoreAdmin, isServerSide } = jest.requireMock('@/features/infrastructure/api/firebase/admin');
const { getGames, getGameById } = jest.requireMock('@/features/modules/game-management/games/lib/gameService');
const { upsertPlayerCategoryStats } = jest.requireMock('@/features/modules/community/standings/lib/playerCategoryStatsService');

import { getPlayerStats, normalizePlayerName, updatePlayerStats, getAllPlayers, searchPlayers, comparePlayers } from '../playerService';

describe('playerService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const mockFn = isServerSide as unknown as jest.Mock | undefined;
    mockFn?.mockReturnValue?.(false);
  });

  describe('normalizePlayerName', () => {
    it('normalizes player names by trimming and lowercasing', () => {
      expect(normalizePlayerName('  Alice ')).toBe('alice');
      expect(normalizePlayerName('BoB')).toBe('bob');
    });

    it('handles empty strings', () => {
      expect(normalizePlayerName('')).toBe('');
      expect(normalizePlayerName('   ')).toBe('');
    });

    it('handles special characters', () => {
      expect(normalizePlayerName('Player_123')).toBe('player_123');
      expect(normalizePlayerName('Player-Name')).toBe('player-name');
    });
  });

  describe('getPlayerStats', () => {
    it('returns null when player stats are missing', async () => {
      // Arrange
      mockGetDoc.mockResolvedValue({ exists: () => false });

      // Act
      const result = await getPlayerStats('unknown');

      // Assert
      expect(result).toBeNull();
    });

    it('returns player stats when player exists', async () => {
      // Arrange
      const mockPlayerData = {
        name: 'TestPlayer',
        categories: {
          '1v1': {
            wins: 5,
            losses: 3,
            draws: 1,
            score: 1050,
            games: 9,
          },
        },
        lastPlayed: Timestamp.now(),
        firstPlayed: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        id: 'testplayer',
        data: () => mockPlayerData,
      });

      // Act
      const result = await getPlayerStats('TestPlayer');

      // Assert
      expect(result).not.toBeNull();
      expect(result?.name).toBe('TestPlayer');
      expect(result?.totalGames).toBe(9);
      expect(result?.categories['1v1']).toBeDefined();
    });

    it('includes recent games when includeGames filter is true', async () => {
      // Arrange
      const mockPlayerData = {
        name: 'TestPlayer',
        categories: {},
        lastPlayed: Timestamp.now(),
        firstPlayed: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      const mockGames = {
        games: [
          { id: 'game1', gameId: 1 },
          { id: 'game2', gameId: 2 },
        ],
      };
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        id: 'testplayer',
        data: () => mockPlayerData,
      });
      (getGames as jest.Mock).mockResolvedValue(mockGames);

      // Act
      const result = await getPlayerStats('TestPlayer', { includeGames: true });

      // Assert
      expect(result?.recentGames).toBeDefined();
      expect(result?.recentGames).toHaveLength(2);
      expect(getGames).toHaveBeenCalledWith(
        expect.objectContaining({
          player: 'TestPlayer',
          limit: 10,
        })
      );
    });
  });

  describe('updatePlayerStats', () => {
    it('creates new player stats for new player', async () => {
      // Arrange
      const mockGame = {
        id: 'game-123',
        gameId: 1,
        category: '1v1',
        datetime: Timestamp.now(),
        players: [
          { name: 'Player1', pid: 0, flag: 'winner', elochange: 20, eloBefore: 1000, eloAfter: 1020, category: '1v1' },
          { name: 'Player2', pid: 1, flag: 'loser', elochange: -20, eloBefore: 1000, eloAfter: 980, category: '1v1' },
        ],
      };
      (getGameById as jest.Mock).mockResolvedValue(mockGame);
      mockGetDoc.mockResolvedValue({ exists: () => false });
      (setDoc as jest.Mock).mockResolvedValue(undefined);
      (upsertPlayerCategoryStats as jest.Mock).mockResolvedValue(undefined);

      // Act
      await updatePlayerStats('game-123');

      // Assert
      expect(setDoc).toHaveBeenCalled();
      expect(upsertPlayerCategoryStats).toHaveBeenCalled();
    });

    it('updates existing player stats', async () => {
      // Arrange
      const mockGame = {
        id: 'game-123',
        gameId: 1,
        category: '1v1',
        datetime: Timestamp.now(),
        players: [
          { name: 'Player1', pid: 0, flag: 'winner', elochange: 20, eloBefore: 1000, eloAfter: 1020, category: '1v1' },
        ],
      };
      const mockExistingStats = {
        name: 'Player1',
        categories: {
          '1v1': {
            wins: 5,
            losses: 3,
            draws: 0,
            score: 1000,
            games: 8,
          },
        },
        totalGames: 8,
      };
      (getGameById as jest.Mock).mockResolvedValue(mockGame);
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockExistingStats,
      });
      (updateDoc as jest.Mock).mockResolvedValue(undefined);
      (upsertPlayerCategoryStats as jest.Mock).mockResolvedValue(undefined);

      // Act
      await updatePlayerStats('game-123');

      // Assert
      expect(updateDoc).toHaveBeenCalled();
      const updateCall = (updateDoc as jest.Mock).mock.calls[0][1];
      expect(updateCall.categories['1v1'].wins).toBe(6);
      expect(updateCall.categories['1v1'].score).toBe(1020);
    });

    it('updates peak ELO when ELO increases', async () => {
      // Arrange
      const mockGame = {
        id: 'game-123',
        gameId: 1,
        category: '1v1',
        datetime: Timestamp.now(),
        players: [
          { name: 'Player1', pid: 0, flag: 'winner', elochange: 50, eloBefore: 1000, eloAfter: 1050, category: '1v1' },
        ],
      };
      const mockExistingStats = {
        name: 'Player1',
        categories: {
          '1v1': {
            wins: 5,
            losses: 3,
            score: 1000,
            peakElo: 1020,
            games: 8,
          },
        },
        totalGames: 8,
      };
      (getGameById as jest.Mock).mockResolvedValue(mockGame);
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockExistingStats,
      });
      (updateDoc as jest.Mock).mockResolvedValue(undefined);
      (upsertPlayerCategoryStats as jest.Mock).mockResolvedValue(undefined);

      // Act
      await updatePlayerStats('game-123');

      // Assert
      const updateCall = (updateDoc as jest.Mock).mock.calls[0][1];
      expect(updateCall.categories['1v1'].peakElo).toBe(1050);
    });

    it('handles draw games correctly', async () => {
      // Arrange
      const mockGame = {
        id: 'game-123',
        gameId: 1,
        category: '1v1',
        datetime: Timestamp.now(),
        players: [
          { name: 'Player1', pid: 0, flag: 'drawer', elochange: 0, eloBefore: 1000, eloAfter: 1000, category: '1v1' },
        ],
      };
      const mockExistingStats = {
        name: 'Player1',
        categories: {
          '1v1': {
            wins: 5,
            losses: 3,
            draws: 0,
            score: 1000,
            games: 8,
          },
        },
        totalGames: 8,
      };
      (getGameById as jest.Mock).mockResolvedValue(mockGame);
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockExistingStats,
      });
      (updateDoc as jest.Mock).mockResolvedValue(undefined);
      (upsertPlayerCategoryStats as jest.Mock).mockResolvedValue(undefined);

      // Act
      await updatePlayerStats('game-123');

      // Assert
      const updateCall = (updateDoc as jest.Mock).mock.calls[0][1];
      expect(updateCall.categories['1v1'].draws).toBe(1);
    });

    it('returns early when game not found', async () => {
      // Arrange
      (getGameById as jest.Mock).mockResolvedValue(null);

      // Act
      await updatePlayerStats('missing-game');

      // Assert
      expect(mockGetDoc).not.toHaveBeenCalled();
    });
  });

  describe('getAllPlayers', () => {
    it('returns all players with limit', async () => {
      // Arrange
      const mockPlayers = [
        { id: 'p1', data: () => ({ name: 'Player1', categories: {}, createdAt: Timestamp.now(), updatedAt: Timestamp.now() }) },
        { id: 'p2', data: () => ({ name: 'Player2', categories: {}, createdAt: Timestamp.now(), updatedAt: Timestamp.now() }) },
      ];
      mockGetDocs.mockResolvedValue({
        docs: mockPlayers,
        forEach: (fn: (doc: unknown) => void) => mockPlayers.forEach(fn),
        empty: false,
      });

      // Act
      const result = await getAllPlayers(10);

      // Assert
      expect(result.players).toHaveLength(2);
      expect(result.players[0].name).toBe('Player1');
      expect(result.hasMore).toBe(false);
    });

    it('respects limit parameter', async () => {
      // Arrange
      // Create 6 players (limit 5 + 1) to test hasMore logic
      const mockPlayers = Array.from({ length: 6 }, (_, i) => ({
        id: `p${i}`,
        data: () => ({ name: `Player${i}`, categories: {}, createdAt: Timestamp.now(), updatedAt: Timestamp.now() }),
      }));
      mockGetDocs.mockResolvedValue({
        docs: mockPlayers,
        forEach: (fn: (doc: unknown) => void) => mockPlayers.forEach(fn),
        empty: false,
      });

      // Act
      const result = await getAllPlayers(5);

      // Assert
      expect(result.players).toHaveLength(5);
      // hasMore should be true because we fetched 6 docs (limit 5 + 1) and 6 > 5
      expect(result.hasMore).toBe(true);
    });
  });

  describe('searchPlayers', () => {
    it('returns empty array for queries shorter than 2 characters', async () => {
      // Act
      const result1 = await searchPlayers('a');
      const result2 = await searchPlayers('');

      // Assert
      expect(result1).toEqual([]);
      expect(result2).toEqual([]);
    });

    it('searches players by name', async () => {
      // Arrange
      const mockPlayers = [
        { id: 'p1', data: () => ({ name: 'Alice' }) },
        { id: 'p2', data: () => ({ name: 'AliceSmith' }) },
      ];
      mockGetDocs.mockResolvedValue({
        docs: mockPlayers,
        forEach: (fn: (doc: unknown) => void) => mockPlayers.forEach(fn),
        empty: false,
      });

      // Act
      const result = await searchPlayers('alice');

      // Assert
      expect(result).toContain('Alice');
      expect(result).toContain('AliceSmith');
    });

    it('is case-insensitive', async () => {
      // Arrange
      const mockPlayers = [
        { id: 'p1', data: () => ({ name: 'Alice' }) },
      ];
      mockGetDocs.mockResolvedValue({
        docs: mockPlayers,
        forEach: (fn: (doc: unknown) => void) => mockPlayers.forEach(fn),
        empty: false,
      });

      // Act
      const result = await searchPlayers('ALICE');

      // Assert
      expect(result).toContain('Alice');
    });

    it('returns empty array on error', async () => {
      // Arrange
      mockGetDocs.mockRejectedValue(new Error('Search failed'));

      // Act
      const result = await searchPlayers('test');

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('comparePlayers', () => {
    it('compares multiple players', async () => {
      // Arrange
      const mockPlayer1 = {
        id: 'player1',
        name: 'Player1',
        categories: { '1v1': { wins: 5, losses: 3, score: 1050, games: 8 } },
        totalGames: 8,
      };
      const mockPlayer2 = {
        id: 'player2',
        name: 'Player2',
        categories: { '1v1': { wins: 3, losses: 5, score: 950, games: 8 } },
        totalGames: 8,
      };
      (getPlayerStats as jest.Mock)
        .mockResolvedValueOnce(mockPlayer1)
        .mockResolvedValueOnce(mockPlayer2);
      (getGames as jest.Mock).mockResolvedValue({ games: [] });
      (getGameById as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await comparePlayers(['Player1', 'Player2']);

      // Assert
      expect(result.players).toHaveLength(2);
      expect(result.headToHead).toBeDefined();
      expect(result.eloComparison).toBeDefined();
    });

    it('calculates head-to-head records', async () => {
      // Arrange
      const mockPlayer1 = {
        id: 'player1',
        name: 'player1',
        categories: {},
        totalGames: 0,
      };
      const mockPlayer2 = {
        id: 'player2',
        name: 'player2',
        categories: {},
        totalGames: 0,
      };
      const mockGame = {
        id: 'game-123',
        players: [
          { name: 'player1', flag: 'winner' },
          { name: 'player2', flag: 'loser' },
        ],
      };
      (getPlayerStats as jest.Mock)
        .mockResolvedValueOnce(mockPlayer1)
        .mockResolvedValueOnce(mockPlayer2);
      (getGames as jest.Mock).mockResolvedValue({
        games: [{ id: 'game-123' }],
      });
      (getGameById as jest.Mock).mockResolvedValue(mockGame);

      // Act
      // Use lowercase names to match normalized names used in head-to-head calculation
      const result = await comparePlayers(['player1', 'player2']);

      // Assert
      // Head-to-head structure is initialized and updated
      expect(result.headToHead['player1']).toBeDefined();
      expect(result.headToHead['player1']['player2']).toBeDefined();
      expect(result.headToHead['player1']['player2'].wins).toBe(1);
      expect(result.headToHead['player2']['player1'].losses).toBe(1);
    });
  });
});

