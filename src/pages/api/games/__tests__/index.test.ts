import type { NextApiRequest, NextApiResponse } from 'next';
// Import server-side mocks FIRST before handler
import '../../../../../__tests__/helpers/mockUserDataService.server';
import {
  mockGetUserDataByDiscordIdServer,
  setIsServerSide,
} from '../../../../../__tests__/helpers/mockUserDataService.server';
import handler from '../index';

// Mock dependencies
const mockGetGames = jest.fn();
const mockCreateScheduledGame = jest.fn();
const mockCreateCompletedGame = jest.fn();
const mockIsAdmin = jest.fn();
const mockInfo = jest.fn();
const mockError = jest.fn();
const mockWarn = jest.fn();
const mockDebug = jest.fn();

jest.mock('@/features/modules/game-management/games/lib/gameService', () => ({
  getGames: (...args: unknown[]) => mockGetGames(...args),
  createScheduledGame: (...args: unknown[]) => mockCreateScheduledGame(...args),
  createCompletedGame: (...args: unknown[]) => mockCreateCompletedGame(...args),
}));

jest.mock('@/features/infrastructure/utils/userRoleUtils', () => ({
  isAdmin: (...args: unknown[]) => mockIsAdmin(...args),
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

describe('GET /api/games', () => {
  const createRequest = (query: Record<string, string> = {}): NextApiRequest => ({
    method: 'GET',
    query,
    body: null,
    url: '/api/games',
  } as NextApiRequest);

  const createResponse = (): NextApiResponse => {
    const res = {} as NextApiResponse;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetGames.mockResolvedValue({ games: [], total: 0 });
  });

  it('returns list of games without filters', async () => {
    // Arrange
    const games = [
      { id: 'game1', gameId: 1, gameState: 'completed' },
      { id: 'game2', gameId: 2, gameState: 'completed' },
    ];
    mockGetGames.mockResolvedValue({ games, total: 2 });
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockGetGames).toHaveBeenCalledWith({
      gameState: undefined,
      startDate: undefined,
      endDate: undefined,
      category: undefined,
      player: undefined,
      ally: undefined,
      enemy: undefined,
      teamFormat: undefined,
      gameId: undefined,
      page: undefined,
      limit: undefined,
      cursor: undefined,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { games, total: 2 },
    });
  });

  it('filters games by gameState', async () => {
    // Arrange
    const req = createRequest({ gameState: 'scheduled' });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockGetGames).toHaveBeenCalledWith(
      expect.objectContaining({ gameState: 'scheduled' })
    );
  });

  it('filters games by category', async () => {
    // Arrange
    const req = createRequest({ category: '1v1' });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockGetGames).toHaveBeenCalledWith(
      expect.objectContaining({ category: '1v1' })
    );
  });

  it('filters games by player', async () => {
    // Arrange
    const req = createRequest({ player: 'PlayerName' });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockGetGames).toHaveBeenCalledWith(
      expect.objectContaining({ player: 'PlayerName' })
    );
  });

  it('filters games by date range', async () => {
    // Arrange
    const req = createRequest({
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockGetGames).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      })
    );
  });

  it('filters games by ally and enemy', async () => {
    // Arrange
    const req = createRequest({
      ally: 'AllyName',
      enemy: 'EnemyName',
    });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockGetGames).toHaveBeenCalledWith(
      expect.objectContaining({
        ally: 'AllyName',
        enemy: 'EnemyName',
      })
    );
  });

  it('filters games by teamFormat', async () => {
    // Arrange
    const req = createRequest({ teamFormat: '2v2' });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockGetGames).toHaveBeenCalledWith(
      expect.objectContaining({ teamFormat: '2v2' })
    );
  });

  it('filters games by gameId', async () => {
    // Arrange
    const req = createRequest({ gameId: '123' });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockGetGames).toHaveBeenCalledWith(
      expect.objectContaining({ gameId: 123 })
    );
  });

  it('handles pagination with page and limit', async () => {
    // Arrange
    const req = createRequest({ page: '2', limit: '10' });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockGetGames).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, limit: 10 })
    );
  });

  it('handles cursor-based pagination', async () => {
    // Arrange
    const req = createRequest({ cursor: 'cursor123' });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockGetGames).toHaveBeenCalledWith(
      expect.objectContaining({ cursor: 'cursor123' })
    );
  });

  it('handles multiple filters together', async () => {
    // Arrange
    const req = createRequest({
      gameState: 'completed',
      category: '1v1',
      player: 'PlayerName',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      page: '1',
      limit: '20',
    });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockGetGames).toHaveBeenCalledWith({
      gameState: 'completed',
      category: '1v1',
      player: 'PlayerName',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      ally: undefined,
      enemy: undefined,
      teamFormat: undefined,
      gameId: undefined,
      page: 1,
      limit: 20,
      cursor: undefined,
    });
  });

  it('handles errors from getGames', async () => {
    // Arrange
    const error = new Error('Database error');
    mockGetGames.mockRejectedValue(error);
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
});

describe('POST /api/games', () => {
  const createRequest = (
    body: Record<string, unknown>,
    session: unknown = null
  ): NextApiRequest => ({
    method: 'POST',
    query: {},
    body,
    url: '/api/games',
  } as NextApiRequest);

  const createResponse = (): NextApiResponse => {
    const res = {} as NextApiResponse;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockSession = {
    user: { name: 'Test User' },
    discordId: 'discord123',
    expires: '2024-12-31',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setIsServerSide(true); // Enable server-side mode
    mockGetServerSession.mockResolvedValue(mockSession);
    mockCreateScheduledGame.mockResolvedValue('game-id-123');
    mockCreateCompletedGame.mockResolvedValue('game-id-456');
    mockGetUserDataByDiscordIdServer.mockResolvedValue({ role: 'user' });
    mockIsAdmin.mockReturnValue(false);
  });

  describe('Authentication', () => {
    it('requires authentication for POST', async () => {
      // Arrange
      mockGetServerSession.mockResolvedValue(null);
      const req = createRequest({ gameState: 'completed' });
      const res = createResponse();

      // Act
      await handler(req, res);

      // Assert - createApiHandler catches errors and returns 500
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Authentication required'),
        })
      );
    });

    it('allows authenticated requests', async () => {
      // Arrange
      const req = createRequest({
        gameState: 'completed',
        gameId: 1,
        datetime: new Date().toISOString(),
        players: [
          { name: 'Player1', flag: 'winner', pid: 0 },
          { name: 'Player2', flag: 'loser', pid: 1 },
        ],
      });
      const res = createResponse();

      // Act
      await handler(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('Create Scheduled Game', () => {
    it('creates scheduled game with required fields', async () => {
      // Arrange
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const gameData = {
        gameState: 'scheduled',
        scheduledDateTime: futureDate.toISOString(),
        timezone: 'UTC',
        teamSize: '2v2',
        gameType: 'normal',
      };
      const req = createRequest(gameData);
      const res = createResponse();

      // Act
      await handler(req, res);

      // Assert
      expect(mockCreateScheduledGame).toHaveBeenCalledWith(
        expect.objectContaining({
          scheduledDateTime: gameData.scheduledDateTime,
          timezone: 'UTC',
          teamSize: '2v2',
          gameType: 'normal',
          creatorName: 'Test User',
          createdByDiscordId: 'discord123',
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { id: 'game-id-123' },
      });
    });

    it('validates required fields for scheduled game', async () => {
      // Arrange
      const req = createRequest({ gameState: 'scheduled' });
      const res = createResponse();

      // Act
      await handler(req, res);

      // Assert - validation fails and returns 400
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Missing required fields'),
        })
      );
    });

    it('rejects past scheduled dates for non-admin users', async () => {
      // Arrange
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const gameData = {
        gameState: 'scheduled',
        scheduledDateTime: pastDate.toISOString(),
        timezone: 'UTC',
        teamSize: '2v2',
        gameType: 'normal',
      };
      const req = createRequest(gameData);
      const res = createResponse();

      // Act
      await handler(req, res);

      // Assert - createApiHandler catches errors and returns 500
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Scheduled date must be in the future'),
        })
      );
    });

    it('allows past scheduled dates for admin users', async () => {
      // Arrange
      mockIsAdmin.mockReturnValue(true);
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const gameData = {
        gameState: 'scheduled',
        scheduledDateTime: pastDate.toISOString(),
        timezone: 'UTC',
        teamSize: '2v2',
        gameType: 'normal',
      };
      const req = createRequest(gameData);
      const res = createResponse();

      // Act
      await handler(req, res);

      // Assert
      expect(mockCreateScheduledGame).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('adds creator to participants when addCreatorToParticipants is true', async () => {
      // Arrange
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const gameData = {
        gameState: 'scheduled',
        scheduledDateTime: futureDate.toISOString(),
        timezone: 'UTC',
        teamSize: '2v2',
        gameType: 'normal',
        addCreatorToParticipants: true,
        participants: [],
      };
      const req = createRequest(gameData);
      const res = createResponse();

      // Act
      await handler(req, res);

      // Assert
      expect(mockCreateScheduledGame).toHaveBeenCalledWith(
        expect.objectContaining({
          participants: expect.arrayContaining([
            expect.objectContaining({
              discordId: 'discord123',
              name: 'Test User',
            }),
          ]),
        })
      );
    });

    it('does not add creator when addCreatorToParticipants is false', async () => {
      // Arrange
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const gameData = {
        gameState: 'scheduled',
        scheduledDateTime: futureDate.toISOString(),
        timezone: 'UTC',
        teamSize: '2v2',
        gameType: 'normal',
        addCreatorToParticipants: false,
        participants: [],
      };
      const req = createRequest(gameData);
      const res = createResponse();

      // Act
      await handler(req, res);

      // Assert
      expect(mockCreateScheduledGame).toHaveBeenCalledWith(
        expect.not.objectContaining({
          participants: expect.arrayContaining([
            expect.objectContaining({
              discordId: 'discord123',
            }),
          ]),
        })
      );
    });

    it('uses provided creatorName if available', async () => {
      // Arrange
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const gameData = {
        gameState: 'scheduled',
        scheduledDateTime: futureDate.toISOString(),
        timezone: 'UTC',
        teamSize: '2v2',
        gameType: 'normal',
        creatorName: 'Custom Creator',
      };
      const req = createRequest(gameData);
      const res = createResponse();

      // Act
      await handler(req, res);

      // Assert
      expect(mockCreateScheduledGame).toHaveBeenCalledWith(
        expect.objectContaining({
          creatorName: 'Custom Creator',
        })
      );
    });
  });

  describe('Create Completed Game', () => {
    it('creates completed game with required fields', async () => {
      // Arrange
      const gameData = {
        gameState: 'completed',
        gameId: 123,
        datetime: new Date().toISOString(),
        duration: 1800,
        gamename: 'Test Game',
        map: 'Test Map',
        players: [
          { name: 'Player1', flag: 'winner', pid: 0 },
          { name: 'Player2', flag: 'loser', pid: 1 },
        ],
      };
      const req = createRequest(gameData);
      const res = createResponse();

      // Act
      await handler(req, res);

      // Assert
      expect(mockCreateCompletedGame).toHaveBeenCalledWith(
        expect.objectContaining({
          gameId: 123,
          datetime: gameData.datetime,
          players: gameData.players,
          creatorName: 'Test User',
          createdByDiscordId: 'discord123',
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { id: 'game-id-456' },
      });
    });

    it('defaults to completed game when gameState is not provided', async () => {
      // Arrange
      const gameData = {
        gameId: 123,
        datetime: new Date().toISOString(),
        players: [
          { name: 'Player1', flag: 'winner', pid: 0 },
          { name: 'Player2', flag: 'loser', pid: 1 },
        ],
      };
      const req = createRequest(gameData);
      const res = createResponse();

      // Act
      await handler(req, res);

      // Assert
      expect(mockCreateCompletedGame).toHaveBeenCalled();
      expect(mockCreateScheduledGame).not.toHaveBeenCalled();
    });

    it('validates required fields for completed game', async () => {
      // Arrange
      const req = createRequest({ gameState: 'completed' });
      const res = createResponse();

      // Act
      await handler(req, res);

      // Assert - validation fails and returns 400
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Missing required fields'),
        })
      );
    });

    it('validates minimum 2 players for completed game', async () => {
      // Arrange
      const gameData = {
        gameState: 'completed',
        gameId: 123,
        datetime: new Date().toISOString(),
        duration: 1800,
        gamename: 'Test Game',
        map: 'Test Map',
        players: [{ name: 'Player1', flag: 'winner', pid: 0 }],
      };
      const req = createRequest(gameData);
      const res = createResponse();

      // Act
      await handler(req, res);

      // Assert - validation fails and returns 400
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('at least 2 players'),
        })
      );
    });

    it('validates player data structure', async () => {
      // Arrange
      const gameData = {
        gameState: 'completed',
        gameId: 123,
        datetime: new Date().toISOString(),
        duration: 1800,
        gamename: 'Test Game',
        map: 'Test Map',
        players: [
          { name: 'Player1', flag: 'winner' }, // Missing pid
          { name: 'Player2', flag: 'loser', pid: 1 },
        ],
      };
      const req = createRequest(gameData);
      const res = createResponse();

      // Act
      await handler(req, res);

      // Assert - validation fails and returns 400
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Invalid player data'),
        })
      );
    });

    it('validates player flag values', async () => {
      // Arrange
      const gameData = {
        gameState: 'completed',
        gameId: 123,
        datetime: new Date().toISOString(),
        duration: 1800,
        gamename: 'Test Game',
        map: 'Test Map',
        players: [
          { name: 'Player1', flag: 'invalid', pid: 0 },
          { name: 'Player2', flag: 'loser', pid: 1 },
        ],
      };
      const req = createRequest(gameData);
      const res = createResponse();

      // Act
      await handler(req, res);

      // Assert - validation fails and returns 400
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Invalid player flag'),
        })
      );
    });

    it('accepts valid player flags (winner, loser, drawer)', async () => {
      // Arrange
      const gameData = {
        gameState: 'completed',
        gameId: 123,
        datetime: new Date().toISOString(),
        duration: 1800,
        gamename: 'Test Game',
        map: 'Test Map',
        players: [
          { name: 'Player1', flag: 'winner', pid: 0 },
          { name: 'Player2', flag: 'loser', pid: 1 },
          { name: 'Player3', flag: 'drawer', pid: 2 },
        ],
      };
      const req = createRequest(gameData);
      const res = createResponse();

      // Act
      await handler(req, res);

      // Assert
      expect(mockCreateCompletedGame).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('uses provided creatorName if available', async () => {
      // Arrange
      const gameData = {
        gameState: 'completed',
        gameId: 123,
        datetime: new Date().toISOString(),
        duration: 1800,
        gamename: 'Test Game',
        map: 'Test Map',
        players: [
          { name: 'Player1', flag: 'winner', pid: 0 },
          { name: 'Player2', flag: 'loser', pid: 1 },
        ],
        creatorName: 'Custom Creator',
      };
      const req = createRequest(gameData);
      const res = createResponse();

      // Act
      await handler(req, res);

      // Assert
      expect(mockCreateCompletedGame).toHaveBeenCalledWith(
        expect.objectContaining({
          creatorName: 'Custom Creator',
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('handles errors from createScheduledGame', async () => {
      // Arrange
      const error = new Error('Failed to create scheduled game');
      mockCreateScheduledGame.mockRejectedValue(error);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const gameData = {
        gameState: 'scheduled',
        scheduledDateTime: futureDate.toISOString(),
        timezone: 'UTC',
        teamSize: '2v2',
        gameType: 'normal',
      };
      const req = createRequest(gameData);
      const res = createResponse();

      // Act
      await handler(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Failed to create scheduled game'),
        })
      );
    });

    it('handles errors from createCompletedGame', async () => {
      // Arrange
      const error = new Error('Failed to create completed game');
      mockCreateCompletedGame.mockRejectedValue(error);
      const gameData = {
        gameState: 'completed',
        gameId: 123,
        datetime: new Date().toISOString(),
        duration: 1800,
        gamename: 'Test Game',
        map: 'Test Map',
        players: [
          { name: 'Player1', flag: 'winner', pid: 0 },
          { name: 'Player2', flag: 'loser', pid: 1 },
        ],
      };
      const req = createRequest(gameData);
      const res = createResponse();

      // Act
      await handler(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Failed to create completed game'),
        })
      );
    });

    it('handles errors from getUserDataByDiscordId', async () => {
      // Arrange
      mockGetUserDataByDiscordIdServer.mockRejectedValue(new Error('User data error'));
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const gameData = {
        gameState: 'scheduled',
        scheduledDateTime: pastDate.toISOString(),
        timezone: 'UTC',
        teamSize: '2v2',
        gameType: 'normal',
      };
      const req = createRequest(gameData);
      const res = createResponse();

      // Act
      await handler(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('Method Not Allowed', () => {
    it('rejects unsupported HTTP methods', async () => {
      // Arrange
      const req = {
        method: 'PUT',
        query: {},
        body: null,
        url: '/api/games',
      } as NextApiRequest;
      const res = createResponse();

      // Act
      await handler(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Method PUT not allowed. Allowed methods: GET, POST',
        })
      );
    });
  });
});


