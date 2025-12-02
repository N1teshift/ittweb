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
    addDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    query: jest.fn(),
    orderBy: jest.fn(),
    where: jest.fn(),
    limit: jest.fn(),
    Timestamp: {
      now: jest.fn(() => ({ toDate: () => new Date('2020-01-01T00:00:00Z') })),
      fromDate: jest.fn((date: Date) => ({ toDate: () => date })),
    },
  };
});

jest.mock('@/features/infrastructure/api/firebase', () => ({
  getFirestoreInstance: jest.fn(() => ({})),
}));

const mockIsServerSide = jest.fn(() => false);

jest.mock('@/features/infrastructure/api/firebase/admin', () => ({
  getFirestoreAdmin: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        collection: jest.fn(() => ({ get: jest.fn() })),
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

jest.mock('../eloCalculator', () => ({
  updateEloScores: jest.fn(),
}));

const mockGetGames = jest.fn();
jest.mock('../gameService.read', () => ({
  getGames: (...args: unknown[]) => mockGetGames(...args),
}));

const { mockGetDoc, mockGetDocs } = jest.requireMock('firebase/firestore');
const { collection, doc, addDoc, updateDoc, deleteDoc, query, orderBy, where, limit, Timestamp } = jest.requireMock('firebase/firestore');
const { getFirestoreInstance } = jest.requireMock('@/features/infrastructure/api/firebase');
const { getFirestoreAdmin, isServerSide } = jest.requireMock('@/features/infrastructure/api/firebase/admin');
const { updateEloScores } = jest.requireMock('../eloCalculator');

import * as gameService from '../gameService';

describe('gameService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default to server-side for most tests
    const mockFn = isServerSide as unknown as jest.Mock | undefined;
    mockFn?.mockReturnValue?.(true);
  });

  describe('createCompletedGame', () => {
    it('throws when required fields are missing', async () => {
      await expect(gameService.createCompletedGame({
        gameId: undefined as unknown as number,
        datetime: undefined as unknown as string,
        players: [],
        duration: 0,
        gamename: 'Test',
        map: 'Map',
        creatorName: 'Creator',
        ownername: 'Owner',
      })).rejects.toThrow('Invalid game data');
    });

    it('throws when players array has less than 2 players', async () => {
      await expect(gameService.createCompletedGame({
        gameId: 1,
        datetime: '2024-01-01T00:00:00Z',
        players: [{ name: 'Player1', pid: 0, flag: 'winner' }],
        duration: 1000,
        gamename: 'Test',
        map: 'Map',
        creatorName: 'Creator',
        ownername: 'Owner',
      })).rejects.toThrow('Invalid game data');
    });

    it('throws when duplicate gameId exists', async () => {
      // Arrange
      (isServerSide as jest.Mock).mockReturnValue(true);
      mockGetGames.mockResolvedValue({ 
        games: [{
          id: 'existing-game',
          gameId: 1,
          gameState: 'completed',
          datetime: Timestamp.now(),
          isDeleted: false,
          createdAt: Timestamp.now(),
        }] 
      });

      // Act & Assert
      await expect(gameService.createCompletedGame({
        gameId: 1,
        datetime: '2024-01-01T00:00:00Z',
        players: [
          { name: 'Player1', pid: 0, flag: 'winner' },
          { name: 'Player2', pid: 1, flag: 'loser' },
        ],
        duration: 1000,
        gamename: 'Test',
        map: 'Map',
        creatorName: 'Creator',
        ownername: 'Owner',
      })).rejects.toThrow('already exists');
    });

    it('creates a completed game successfully', async () => {
      // Arrange - Ensure server-side mode for this test
      (isServerSide as jest.Mock).mockReturnValue(true);
      mockGetGames.mockResolvedValue({ games: [] });
      
      const mockGameRef = { id: 'game-123', collection: jest.fn() };
      const mockPlayersCollection = { add: jest.fn().mockResolvedValue({}) };
      mockGameRef.collection.mockReturnValue(mockPlayersCollection);
      
      // Mock Firebase Admin collection().add() chain
      const mockAdd = jest.fn().mockResolvedValue(mockGameRef);
      const mockCollection = jest.fn().mockReturnValue({ add: mockAdd });
      (getFirestoreAdmin as jest.Mock).mockReturnValue({ collection: mockCollection });
      
      (updateEloScores as jest.Mock).mockResolvedValue(undefined);

      // Act
      const result = await gameService.createCompletedGame({
        gameId: 1,
        datetime: '2024-01-01T00:00:00Z',
        players: [
          { name: 'Player1', pid: 0, flag: 'winner' },
          { name: 'Player2', pid: 1, flag: 'loser' },
        ],
        duration: 1000,
        gamename: 'Test Game',
        map: 'Test Map',
        creatorName: 'Creator',
        ownername: 'Owner',
      });

      // Assert
      expect(result).toBe('game-123');
      expect(mockAdd).toHaveBeenCalled();
      expect(updateEloScores).toHaveBeenCalledWith('game-123');
    });
  });

  describe('createScheduledGame', () => {
    it('creates a scheduled game successfully', async () => {
      // Arrange
      const mockGameRef = { id: 'scheduled-game-123' };
      (addDoc as jest.Mock).mockResolvedValue(mockGameRef);

      // Act
      const result = await gameService.createScheduledGame({
        creatorName: 'Creator',
        scheduledDateTime: '2024-01-01T12:00:00Z',
        timezone: 'UTC',
        teamSize: '1v1',
        gameType: 'elo',
        modes: [],
      });

      // Assert
      expect(result).toBe('scheduled-game-123');
      expect(addDoc).toHaveBeenCalled();
    });

    it('generates next gameId when not provided', async () => {
      // Arrange - Ensure server-side mode for this test
      (isServerSide as jest.Mock).mockReturnValue(true);
      
      // Mock Firebase Admin query chain for getNextGameId: collection().orderBy().limit().get()
      const mockQueryGet = jest.fn().mockResolvedValue({
        empty: false,
        forEach: (fn: (doc: unknown) => void) => {
          fn({ data: () => ({ gameId: 5 }) });
        },
      });
      const mockQueryLimit = jest.fn().mockReturnValue({ get: mockQueryGet });
      const mockQueryOrderBy = jest.fn().mockReturnValue({ limit: mockQueryLimit });
      const mockCollectionQuery = jest.fn().mockReturnValue({ orderBy: mockQueryOrderBy });
      
      // Mock Firebase Admin collection().add() for createScheduledGame
      const mockGameRef = { id: 'scheduled-game-123' };
      const mockAdd = jest.fn().mockResolvedValue(mockGameRef);
      const mockCollectionAdd = jest.fn().mockReturnValue({ add: mockAdd });
      
      // Mock getFirestoreAdmin to return collection that supports both query and add
      (getFirestoreAdmin as jest.Mock).mockReturnValue({ 
        collection: jest.fn().mockImplementation((collectionName: string) => {
          if (collectionName === 'games') {
            // Return mock that supports both query (for getNextGameId) and add (for createScheduledGame)
            return {
              orderBy: mockQueryOrderBy,
              add: mockAdd,
            };
          }
          return { add: mockAdd };
        }),
      });

      // Act
      await gameService.createScheduledGame({
        creatorName: 'Creator',
        scheduledDateTime: '2024-01-01T12:00:00Z',
        timezone: 'UTC',
        teamSize: '1v1',
        gameType: 'elo',
        modes: [],
      });

      // Assert
      expect(mockAdd).toHaveBeenCalled();
      const callArgs = mockAdd.mock.calls[0][0];
      expect(callArgs.gameId).toBe(6);
    });
  });

  describe('getGameById', () => {
    it('returns null when the game does not exist', async () => {
      // Arrange
      mockGetDoc.mockResolvedValue({ exists: () => false });
      mockGetDocs.mockResolvedValue({ empty: true, docs: [], forEach: () => undefined });

      // Act
      const game = await gameService.getGameById('missing');

      // Assert
      expect(game).toBeNull();
    });

    it('returns game with players when game exists', async () => {
      // Arrange
      const mockGameData = {
        gameId: 1,
        gameState: 'completed',
        datetime: Timestamp.fromDate(new Date('2024-01-01T00:00:00Z')),
        duration: 1000,
        gamename: 'Test Game',
        map: 'Test Map',
        creatorName: 'Creator',
        ownername: 'Owner',
        playerNames: ['Player1', 'Player2'],
        playerCount: 2,
        verified: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isDeleted: false,
      };
      const mockPlayers = [
        { id: 'p1', data: () => ({ gameId: 'game-123', name: 'Player1', pid: 0, flag: 'winner', createdAt: Timestamp.now() }) },
        { id: 'p2', data: () => ({ gameId: 'game-123', name: 'Player2', pid: 1, flag: 'loser', createdAt: Timestamp.now() }) },
      ];
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        id: 'game-123',
        data: () => mockGameData,
      });
      mockGetDocs.mockResolvedValue({
        forEach: (fn: (doc: unknown) => void) => mockPlayers.forEach(fn),
      });

      // Act
      const game = await gameService.getGameById('game-123');

      // Assert
      expect(game).not.toBeNull();
      expect(game?.gameId).toBe(1);
      expect(game?.players).toHaveLength(2);
      expect(game?.players[0].name).toBe('Player1');
    });
  });

  describe('getGames', () => {
    beforeEach(() => {
      (isServerSide as jest.Mock).mockReturnValue(true);
    });

    it('returns games filtered by gameState', async () => {
      // Arrange - Mock Firebase Admin query chain: collection().where().where().orderBy().limit().get()
      const mockDocs = [
        { id: 'g1', data: () => ({ gameId: 1, gameState: 'completed', datetime: Timestamp.now(), isDeleted: false, createdAt: Timestamp.now() }) },
        { id: 'g2', data: () => ({ gameId: 2, gameState: 'completed', datetime: Timestamp.now(), isDeleted: false, createdAt: Timestamp.now() }) },
      ];
      const mockQueryGet = jest.fn().mockResolvedValue({
        empty: false,
        forEach: (fn: (doc: { id: string; data: () => Record<string, unknown> }) => void) => {
          mockDocs.forEach(doc => fn(doc));
        },
      });
      const mockQueryLimit = jest.fn().mockReturnValue({ get: mockQueryGet });
      const mockQueryOrderBy = jest.fn().mockReturnValue({ limit: mockQueryLimit });
      const mockQueryWhere2 = jest.fn().mockReturnValue({ orderBy: mockQueryOrderBy });
      const mockQueryWhere1 = jest.fn().mockReturnValue({ where: mockQueryWhere2 });
      const mockCollection = jest.fn().mockReturnValue({ where: mockQueryWhere1 });
      (getFirestoreAdmin as jest.Mock).mockReturnValue({ collection: mockCollection });

      // Act
      const result = await gameService.getGames({ gameState: 'completed', limit: 20 });

      // Assert
      expect(result.games).toHaveLength(2);
      expect(result.games.every(g => g.gameState === 'completed')).toBe(true);
    });

    it('filters games by category', async () => {
      // Arrange - Mock Firebase Admin query chain with category filter
      const mockDocs = [
        { id: 'g1', data: () => ({ gameId: 1, gameState: 'completed', category: 'ranked', datetime: Timestamp.now(), isDeleted: false, createdAt: Timestamp.now() }) },
      ];
      const mockQueryGet = jest.fn().mockResolvedValue({
        empty: false,
        forEach: (fn: (doc: { id: string; data: () => Record<string, unknown> }) => void) => {
          mockDocs.forEach(doc => fn(doc));
        },
      });
      const mockQueryLimit = jest.fn().mockReturnValue({ get: mockQueryGet });
      const mockQueryOrderBy = jest.fn().mockReturnValue({ limit: mockQueryLimit });
      const mockQueryWhere3 = jest.fn().mockReturnValue({ orderBy: mockQueryOrderBy });
      const mockQueryWhere2 = jest.fn().mockReturnValue({ where: mockQueryWhere3 });
      const mockQueryWhere1 = jest.fn().mockReturnValue({ where: mockQueryWhere2 });
      const mockCollection = jest.fn().mockReturnValue({ where: mockQueryWhere1 });
      (getFirestoreAdmin as jest.Mock).mockReturnValue({ collection: mockCollection });

      // Act
      const result = await gameService.getGames({ gameState: 'completed', category: 'ranked', limit: 20 });

      // Assert
      expect(result.games).toHaveLength(1);
      expect(result.games[0].category).toBe('ranked');
    });

    it('filters games by gameId', async () => {
      // Arrange - Mock Firebase Admin query chain with gameId filter
      const mockDocs = [
        { id: 'g1', data: () => ({ gameId: 42, gameState: 'completed', datetime: Timestamp.now(), isDeleted: false, createdAt: Timestamp.now() }) },
      ];
      const mockQueryGet = jest.fn().mockResolvedValue({
        empty: false,
        forEach: (fn: (doc: { id: string; data: () => Record<string, unknown> }) => void) => {
          mockDocs.forEach(doc => fn(doc));
        },
      });
      const mockQueryLimit = jest.fn().mockReturnValue({ get: mockQueryGet });
      const mockQueryOrderBy = jest.fn().mockReturnValue({ limit: mockQueryLimit });
      const mockQueryWhere2 = jest.fn().mockReturnValue({ orderBy: mockQueryOrderBy });
      const mockQueryWhere1 = jest.fn().mockReturnValue({ where: mockQueryWhere2 });
      const mockCollection = jest.fn().mockReturnValue({ where: mockQueryWhere1 });
      (getFirestoreAdmin as jest.Mock).mockReturnValue({ collection: mockCollection });

      // Act
      const result = await gameService.getGames({ gameId: 42, limit: 20 });

      // Assert
      expect(result.games).toHaveLength(1);
      expect(result.games[0].gameId).toBe(42);
    });

    it('respects limit parameter', async () => {
      // Arrange - Mock Firebase Admin query chain
      const mockDocs = Array.from({ length: 5 }, (_, i) => ({
        id: `g${i}`,
        data: () => ({ gameId: i, gameState: 'completed', datetime: Timestamp.now(), isDeleted: false, createdAt: Timestamp.now() }),
      }));
      const mockQueryGet = jest.fn().mockResolvedValue({
        empty: false,
        forEach: (fn: (doc: { id: string; data: () => Record<string, unknown> }) => void) => {
          mockDocs.forEach(doc => fn(doc));
        },
      });
      const mockQueryLimit = jest.fn().mockReturnValue({ get: mockQueryGet });
      const mockQueryOrderBy = jest.fn().mockReturnValue({ limit: mockQueryLimit });
      const mockQueryWhere2 = jest.fn().mockReturnValue({ orderBy: mockQueryOrderBy });
      const mockQueryWhere1 = jest.fn().mockReturnValue({ where: mockQueryWhere2 });
      const mockCollection = jest.fn().mockReturnValue({ where: mockQueryWhere1 });
      (getFirestoreAdmin as jest.Mock).mockReturnValue({ collection: mockCollection });

      // Act
      const result = await gameService.getGames({ gameState: 'completed', limit: 5 });

      // Assert
      expect(result.games).toHaveLength(5);
    });
  });

  describe('updateGame', () => {
    beforeEach(() => {
      (isServerSide as jest.Mock).mockReturnValue(true);
    });

    it('updates game successfully', async () => {
      // Arrange - Mock Firebase Admin update chain: collection().doc().update()
      const mockUpdate = jest.fn().mockResolvedValue(undefined);
      const mockDoc = jest.fn().mockReturnValue({ update: mockUpdate });
      const mockCollection = jest.fn().mockReturnValue({ doc: mockDoc });
      (getFirestoreAdmin as jest.Mock).mockReturnValue({ collection: mockCollection });
      (updateEloScores as jest.Mock).mockResolvedValue(undefined);

      // Act
      await gameService.updateGame('game-123', {
        duration: 2000,
        verified: true,
      });

      // Assert
      expect(mockDoc).toHaveBeenCalledWith('game-123');
      expect(mockUpdate).toHaveBeenCalled();
    });

    it('recalculates ELO when players are updated', async () => {
      // Arrange - Mock Firebase Admin update chain: collection().doc().update()
      const mockUpdate = jest.fn().mockResolvedValue(undefined);
      const mockDoc = jest.fn().mockReturnValue({ update: mockUpdate });
      const mockCollection = jest.fn().mockReturnValue({ doc: mockDoc });
      (getFirestoreAdmin as jest.Mock).mockReturnValue({ collection: mockCollection });
      (updateEloScores as jest.Mock).mockResolvedValue(undefined);

      // Act
      await gameService.updateGame('game-123', {
        players: [
          { name: 'Player1', pid: 0, flag: 'winner' },
          { name: 'Player2', pid: 1, flag: 'loser' },
        ],
      } as Parameters<typeof gameService.updateGame>[1]);

      // Assert
      expect(updateEloScores).toHaveBeenCalledWith('game-123');
    });
  });

  describe('deleteGame', () => {
    it('deletes game and all players', async () => {
      // Arrange
      const mockPlayers = [
        { id: 'p1', ref: { delete: jest.fn() } },
        { id: 'p2', ref: { delete: jest.fn() } },
      ];
      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: mockPlayers,
        forEach: (fn: (doc: unknown) => void) => mockPlayers.forEach(fn),
      });
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);

      // Act
      await gameService.deleteGame('game-123');

      // Assert
      expect(deleteDoc).toHaveBeenCalled();
    });
  });

  describe('joinGame', () => {
    it('adds participant to scheduled game', async () => {
      // Arrange
      const mockGameData = {
        gameState: 'scheduled',
        participants: [],
      };
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockGameData,
      });
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      // Act
      await gameService.joinGame('game-123', 'discord-123', 'Player Name');

      // Assert
      expect(updateDoc).toHaveBeenCalled();
      const updateCall = (updateDoc as jest.Mock).mock.calls[0][1];
      expect(updateCall.participants).toHaveLength(1);
      expect(updateCall.participants[0].discordId).toBe('discord-123');
    });

    it('throws error when joining non-scheduled game', async () => {
      // Arrange
      const mockGameData = {
        gameState: 'completed',
        participants: [],
      };
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockGameData,
      });

      // Act & Assert
      await expect(gameService.joinGame('game-123', 'discord-123', 'Player Name'))
        .rejects.toThrow('Can only join scheduled games');
    });

    it('throws error when user is already a participant', async () => {
      // Arrange
      const mockGameData = {
        gameState: 'scheduled',
        participants: [{ discordId: 'discord-123', name: 'Player Name', joinedAt: '2024-01-01T00:00:00Z' }],
      };
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockGameData,
      });

      // Act & Assert
      await expect(gameService.joinGame('game-123', 'discord-123', 'Player Name'))
        .rejects.toThrow('already a participant');
    });
  });

  describe('leaveGame', () => {
    it('removes participant from scheduled game', async () => {
      // Arrange
      const mockGameData = {
        gameState: 'scheduled',
        participants: [
          { discordId: 'discord-123', name: 'Player Name', joinedAt: '2024-01-01T00:00:00Z' },
          { discordId: 'discord-456', name: 'Other Player', joinedAt: '2024-01-01T00:00:00Z' },
        ],
      };
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockGameData,
      });
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      // Act
      await gameService.leaveGame('game-123', 'discord-123');

      // Assert
      expect(updateDoc).toHaveBeenCalled();
      const updateCall = (updateDoc as jest.Mock).mock.calls[0][1];
      expect(updateCall.participants).toHaveLength(1);
      expect(updateCall.participants[0].discordId).toBe('discord-456');
    });
  });
});

