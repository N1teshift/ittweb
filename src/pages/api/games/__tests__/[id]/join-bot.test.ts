import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../[id]/join-bot';

// Mock dependencies
const mockJoinGame = jest.fn();
const mockGetUserDataByDiscordIdServer = jest.fn();
const mockInfo = jest.fn();
const mockError = jest.fn();
const mockWarn = jest.fn();

jest.mock('@/features/modules/game-management/games/lib/gameService.participation', () => ({
  joinGame: (...args: unknown[]) => mockJoinGame(...args),
}));

jest.mock('@/features/infrastructure/lib/userDataService.server', () => ({
  getUserDataByDiscordIdServer: (...args: unknown[]) => mockGetUserDataByDiscordIdServer(...args),
}));

jest.mock('@/features/infrastructure/logging', () => ({
  createComponentLogger: jest.fn(() => ({
    info: mockInfo,
    error: mockError,
    warn: mockWarn,
  })),
}));

describe('POST /api/games/[id]/join-bot', () => {
  const createRequest = (id: string, body?: any, headers?: any): NextApiRequest => ({
    method: 'POST',
    query: { id },
    body,
    headers: headers || {},
    url: `/api/games/${id}/join-bot`,
  } as NextApiRequest);

  const createResponse = (): NextApiResponse => {
    const res = {} as NextApiResponse;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockUser = { id: 'user1', discordId: '123456789012345678' };

  beforeEach(() => {
    jest.clearAllMocks();
    // Set up environment
    process.env.BOT_API_KEY = 'test-bot-key';
  });

  afterEach(() => {
    delete process.env.BOT_API_KEY;
  });

  describe('Method validation', () => {
    it('should return 405 for non-POST methods', async () => {
      const req = createRequest('game1');
      req.method = 'GET';
      const res = createResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
    });
  });

  describe('Bot API key validation', () => {
    it('should return 401 for missing API key', async () => {
      const req = createRequest('game1', { discordId: '123456789012345678', displayName: 'Test User' });
      const res = createResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid bot API key' });
      expect(mockWarn).toHaveBeenCalledWith('Invalid or missing bot API key');
    });

    it('should return 401 for invalid API key', async () => {
      const req = createRequest('game1', { discordId: '123456789012345678', displayName: 'Test User' }, {
        'x-bot-api-key': 'invalid-key'
      });
      const res = createResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid bot API key' });
      expect(mockWarn).toHaveBeenCalledWith('Invalid or missing bot API key');
    });
  });

  describe('Request validation', () => {
    it('should return 400 for missing gameId', async () => {
      const req = createRequest('', { discordId: '123456789012345678', displayName: 'Test User' }, {
        'x-bot-api-key': 'test-bot-key'
      });
      const res = createResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing required fields: gameId, discordId, displayName' });
    });

    it('should return 400 for missing discordId', async () => {
      const req = createRequest('game1', { displayName: 'Test User' }, {
        'x-bot-api-key': 'test-bot-key'
      });
      const res = createResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing required fields: gameId, discordId, displayName' });
    });

    it('should return 400 for missing displayName', async () => {
      const req = createRequest('game1', { discordId: '123456789012345678' }, {
        'x-bot-api-key': 'test-bot-key'
      });
      const res = createResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing required fields: gameId, discordId, displayName' });
    });
  });

  describe('User validation', () => {
    it('should return 404 when Discord user is not found in system', async () => {
      mockGetUserDataByDiscordIdServer.mockResolvedValue(null);

      const req = createRequest('game1', { discordId: '123456789012345678', displayName: 'Test User' }, {
        'x-bot-api-key': 'test-bot-key'
      });
      const res = createResponse();

      await handler(req, res);

      expect(mockGetUserDataByDiscordIdServer).toHaveBeenCalledWith('123456789012345678');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found. Please visit the website first to create your account.' });
      expect(mockWarn).toHaveBeenCalledWith('Discord user not found in system', { discordId: '123456789012345678' });
    });
  });

  describe('Successful join', () => {
    beforeEach(() => {
      mockGetUserDataByDiscordIdServer.mockResolvedValue(mockUser);
      mockJoinGame.mockResolvedValue(undefined);
    });

    it('should successfully join a game', async () => {
      const req = createRequest('game1', { discordId: '123456789012345678', displayName: 'Test User' }, {
        'x-bot-api-key': 'test-bot-key'
      });
      const res = createResponse();

      await handler(req, res);

      expect(mockGetUserDataByDiscordIdServer).toHaveBeenCalledWith('123456789012345678');
      expect(mockJoinGame).toHaveBeenCalledWith('game1', '123456789012345678', 'Test User');
      expect(mockInfo).toHaveBeenCalledWith('Bot successfully joined game', { gameId: 'game1', discordId: '123456789012345678' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });
  });

  describe('Error handling', () => {
    beforeEach(() => {
      mockGetUserDataByDiscordIdServer.mockResolvedValue(mockUser);
    });

    it('should handle "already a participant" error', async () => {
      mockJoinGame.mockRejectedValue(new Error('User is already a participant'));

      const req = createRequest('game1', { discordId: '123456789012345678', displayName: 'Test User' }, {
        'x-bot-api-key': 'test-bot-key'
      });
      const res = createResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: 'User is already a participant in this game' });
      expect(mockError).toHaveBeenCalled();
    });

    it('should handle "game not found" error', async () => {
      mockJoinGame.mockRejectedValue(new Error('Game not found'));

      const req = createRequest('game1', { discordId: '123456789012345678', displayName: 'Test User' }, {
        'x-bot-api-key': 'test-bot-key'
      });
      const res = createResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Game not found' });
    });

    it('should handle "can only join scheduled games" error', async () => {
      mockJoinGame.mockRejectedValue(new Error('Can only join scheduled games'));

      const req = createRequest('game1', { discordId: '123456789012345678', displayName: 'Test User' }, {
        'x-bot-api-key': 'test-bot-key'
      });
      const res = createResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Can only join scheduled games' });
    });

    it('should handle unexpected errors with 500 status', async () => {
      mockJoinGame.mockRejectedValue(new Error('Unexpected error'));

      const req = createRequest('game1', { discordId: '123456789012345678', displayName: 'Test User' }, {
        'x-bot-api-key': 'test-bot-key'
      });
      const res = createResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
      expect(mockError).toHaveBeenCalled();
    });
  });
});
