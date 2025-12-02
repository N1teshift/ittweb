import type { NextApiRequest } from 'next';
import { TextDecoder, TextEncoder } from 'util';

// Import server-side mocks FIRST before handlers
import '../helpers/mockUserDataService.server';
import { setIsServerSide } from '../helpers/mockUserDataService.server';

// Polyfill missing encoders for some dependencies
if (!(global as any).TextEncoder) {
  (global as any).TextEncoder = TextEncoder;
}

if (!(global as any).TextDecoder) {
  (global as any).TextDecoder = TextDecoder as unknown as typeof global.TextDecoder;
}
import handlerGamesIndex from '@/pages/api/games/index';
import handlerGamesById from '@/pages/api/games/[id]';
import handlerGameJoin from '@/pages/api/games/[id]/join';
import handlerGameLeave from '@/pages/api/games/[id]/leave';
import handlerGameUploadReplay from '@/pages/api/games/[id]/upload-replay';
import handlerPlayersIndex from '@/pages/api/players/index';
import handlerPlayerByName from '@/pages/api/players/[name]';
import handlerPlayerSearch from '@/pages/api/players/search';
import handlerPlayerCompare from '@/pages/api/players/compare';
import handlerPostsIndex from '@/pages/api/posts/index';
import handlerPostsById from '@/pages/api/posts/[id]';
import handlerEntriesIndex from '@/pages/api/entries/index';
import handlerEntryById from '@/pages/api/entries/[id]';
import handlerStandings from '@/pages/api/standings/index';
import handlerAnalyticsActivity from '@/pages/api/analytics/activity';
import handlerAnalyticsEloHistory from '@/pages/api/analytics/elo-history';
import handlerAnalyticsMeta from '@/pages/api/analytics/meta';
import handlerAnalyticsWinRate from '@/pages/api/analytics/win-rate';
import handlerClassesIndex from '@/pages/api/classes/index';
import handlerClassByName from '@/pages/api/classes/[className]';
import handlerItemsIndex from '@/pages/api/items/index';
import handlerIconsList from '@/pages/api/icons/list';
import handlerAcceptDataNotice from '@/pages/api/user/accept-data-notice';
import handlerDataNoticeStatus from '@/pages/api/user/data-notice-status';
import handlerUserDelete from '@/pages/api/user/delete';
import handlerAdminWipe from '@/pages/api/admin/wipe-test-data';
import handlerRevalidate from '@/pages/api/revalidate';
import { createMockRequest, createMockResponse } from '@/test-utils/mockNext';

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/features/infrastructure/lib/userDataService', () => ({
  getUserDataByDiscordId: jest.fn(),
  updateDataCollectionNoticeAcceptance: jest.fn(),
  getDataNoticeStatus: jest.fn(),
  deleteUserData: jest.fn(),
}));

jest.mock('@/features/infrastructure/utils/userRoleUtils', () => ({
  isAdmin: jest.fn(() => false),
}));

jest.mock('@/features/modules/game-management/games/lib/gameService', () => ({
  getGames: jest.fn(),
  createScheduledGame: jest.fn(),
  createCompletedGame: jest.fn(),
  getGameById: jest.fn(),
  updateGame: jest.fn(),
  deleteGame: jest.fn(),
}));

jest.mock('@/features/modules/community/players/lib/playerService', () => ({
  getAllPlayers: jest.fn(),
  getPlayerStats: jest.fn(),
  searchPlayers: jest.fn(),
  comparePlayers: jest.fn(),
}));

jest.mock('@/features/modules/content/blog/lib/postService', () => ({
  getAllPosts: jest.fn(),
  getPostById: jest.fn(),
  updatePost: jest.fn(),
  deletePost: jest.fn(),
  createPost: jest.fn(),
}));

jest.mock('@/features/modules/scheduled-games/lib/scheduledGameService', () => ({
  getAllScheduledGames: jest.fn(),
  createScheduledGame: jest.fn(),
  getScheduledGameById: jest.fn(),
  updateScheduledGame: jest.fn(),
  deleteScheduledGame: jest.fn(),
  joinScheduledGame: jest.fn(),
  leaveScheduledGame: jest.fn(),
}));

jest.mock('@/features/modules/game-management/entries/lib/entryService', () => ({
  getAllEntries: jest.fn(),
  createEntry: jest.fn(),
  getEntryById: jest.fn(),
  updateEntry: jest.fn(),
  deleteEntry: jest.fn(),
}));

jest.mock('@/features/modules/community/standings/lib/standingsService', () => ({
  getStandings: jest.fn(),
}));

jest.mock('@/features/modules/analytics-group/analytics/lib/analyticsService', () => ({
  getActivityData: jest.fn(),
  getEloHistory: jest.fn(),
  getMetaStats: jest.fn(),
  getWinRateData: jest.fn(),
  getClassStats: jest.fn(),
  getGameLengthData: jest.fn(),
  getPlayerActivityData: jest.fn(),
  getClassSelectionData: jest.fn(),
  getClassWinRateData: jest.fn(),
}));

jest.mock('fs/promises', () => ({
  readdir: jest.fn(),
}));

jest.mock('@/features/infrastructure/api/firebase/admin', () => ({
  getFirestoreAdmin: jest.fn(() => ({
    listCollections: jest.fn().mockResolvedValue([]),
  })),
  getStorageAdmin: jest.fn(() => ({
    bucket: jest.fn(() => ({
      getFiles: jest.fn().mockResolvedValue([[]]),
    })),
  })),
  getStorageBucketName: jest.fn(() => undefined),
}));

jest.mock('@/pages/api/auth/[...nextauth]', () => ({
  authOptions: {},
}));

jest.mock('@/features/infrastructure/logging', () => ({
  createComponentLogger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
  }),
  logError: jest.fn(),
}));

const { getServerSession } = jest.requireMock('next-auth/next');
const gameService = jest.requireMock('@/features/modules/game-management/games/lib/gameService');
const playerService = jest.requireMock('@/features/modules/community/players/lib/playerService');
const postService = jest.requireMock('@/features/modules/content/blog/lib/postService');
const scheduledService = jest.requireMock('@/features/modules/scheduled-games/lib/scheduledGameService');
const entryService = jest.requireMock('@/features/modules/entries/lib/entryService');
const standingsService = jest.requireMock('@/features/modules/community/standings/lib/standingsService');
const analyticsService = jest.requireMock('@/features/modules/analytics-group/analytics/lib/analyticsService');
const userDataService = jest.requireMock('@/features/infrastructure/lib/userDataService');
const { isAdmin } = jest.requireMock('@/features/infrastructure/utils/userRoleUtils');
const { readdir } = jest.requireMock('fs/promises');

const mockSession = { user: { name: 'Test User' }, discordId: '123' };

const runHandler = async (handler: Function, req: NextApiRequest) => {
  const { res, status, json, revalidate } = createMockResponse();
  await handler(req, res);
  return { status, json, revalidate };
};

beforeEach(() => {
  jest.clearAllMocks();
  setIsServerSide(true);
});

describe('Games API', () => {
  test('GET /api/games returns games with filters', async () => {
    gameService.getGames.mockResolvedValue({
      games: [{ id: '1' }],
      total: 1,
      page: 1,
      limit: 10,
    });
    const req = createMockRequest({
      method: 'GET',
      query: { gameId: '5', limit: '10' },
    });

    const { status, json } = await runHandler(handlerGamesIndex, req);

    expect(gameService.getGames).toHaveBeenCalledWith(expect.objectContaining({ gameId: 5, limit: 10 }));
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      success: true,
      data: {
        games: [{ id: '1' }],
        total: 1,
        page: 1,
        limit: 10,
      },
    });
  });

  test('POST /api/games requires auth for scheduled game', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    const req = createMockRequest({ method: 'POST', body: {} });

    const { status, json } = await runHandler(handlerGamesIndex, req);

    // createApiHandler catches errors and returns 500 with error message
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('Authentication required'),
      })
    );
  });

  test('POST /api/games validates scheduled game fields', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    const req = createMockRequest({
      method: 'POST',
      body: { gameState: 'scheduled', scheduledDateTime: '', timezone: '', teamSize: undefined, gameType: '' },
    });

    const { status, json } = await runHandler(handlerGamesIndex, req);

    // createApiHandler catches errors and returns 500 with error message
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('Missing required fields'),
      })
    );
  });

  test('POST /api/games rejects past scheduled date for non-admin', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    userDataService.getUserDataByDiscordId.mockResolvedValue({ role: 'user' });
    (isAdmin as jest.Mock).mockReturnValue(false);
    const pastDate = new Date(Date.now() - 60_000).toISOString();
    const req = createMockRequest({
      method: 'POST',
      body: { gameState: 'scheduled', scheduledDateTime: pastDate, timezone: 'UTC', teamSize: '2v2', gameType: 'team' },
    });

    const { status, json } = await runHandler(handlerGamesIndex, req);

    // createApiHandler catches errors and returns 500 with error message
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('Scheduled date must be in the future'),
      })
    );
  });

  test('POST /api/games creates completed game', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    gameService.createCompletedGame.mockResolvedValue('new-id');
    const req = createMockRequest({
      method: 'POST',
      body: {
        gameState: 'completed',
        gameId: 10,
        datetime: '2024-01-01T00:00:00Z',
        players: [
          { name: 'A', flag: 'winner', pid: 1 },
          { name: 'B', flag: 'loser', pid: 2 },
        ],
      },
    });

    const { status, json } = await runHandler(handlerGamesIndex, req);

    expect(gameService.createCompletedGame).toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ success: true, data: { id: 'new-id' } });
  });

  test('POST /api/games creates scheduled game successfully', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    gameService.createScheduledGame.mockResolvedValue('scheduled-id');
    const futureDate = new Date(Date.now() + 60_000).toISOString();
    const req = createMockRequest({
      method: 'POST',
      body: {
        gameState: 'scheduled',
        scheduledDateTime: futureDate,
        timezone: 'UTC',
        teamSize: '2v2',
        gameType: 'team',
      },
    });

    const { status, json } = await runHandler(handlerGamesIndex, req);

    expect(gameService.createScheduledGame).toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ success: true, data: { id: 'scheduled-id' } });
  });

  test('POST /api/games validates completed game player data', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    const req = createMockRequest({
      method: 'POST',
      body: {
        gameState: 'completed',
        gameId: 10,
        datetime: '2024-01-01T00:00:00Z',
        players: [
          { name: 'A', flag: 'invalid', pid: 1 }, // Invalid flag
          { name: 'B', flag: 'loser', pid: 2 },
        ],
      },
    });

    const { status, json } = await runHandler(handlerGamesIndex, req);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('Invalid player flag'),
      })
    );
  });

  test('POST /api/games validates completed game has at least 2 players', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    const req = createMockRequest({
      method: 'POST',
      body: {
        gameState: 'completed',
        gameId: 10,
        datetime: '2024-01-01T00:00:00Z',
        players: [{ name: 'A', flag: 'winner', pid: 1 }], // Only 1 player
      },
    });

    const { status, json } = await runHandler(handlerGamesIndex, req);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('at least 2 players'),
      })
    );
  });

  test('POST /api/games allows admin to create past scheduled date', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    userDataService.getUserDataByDiscordId.mockResolvedValue({ role: 'admin' });
    (isAdmin as jest.Mock).mockReturnValue(true);
    gameService.createScheduledGame.mockResolvedValue('admin-scheduled-id');
    const pastDate = new Date(Date.now() - 60_000).toISOString();
    const req = createMockRequest({
      method: 'POST',
      body: {
        gameState: 'scheduled',
        scheduledDateTime: pastDate,
        timezone: 'UTC',
        teamSize: '2v2',
        gameType: 'team',
      },
    });

    const { status, json } = await runHandler(handlerGamesIndex, req);

    expect(gameService.createScheduledGame).toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ success: true, data: { id: 'admin-scheduled-id' } });
  });

  test('POST /api/games adds creator as participant when requested', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    gameService.createScheduledGame.mockResolvedValue('scheduled-id');
    const futureDate = new Date(Date.now() + 60_000).toISOString();
    const req = createMockRequest({
      method: 'POST',
      body: {
        gameState: 'scheduled',
        scheduledDateTime: futureDate,
        timezone: 'UTC',
        teamSize: '2v2',
        gameType: 'team',
        addCreatorToParticipants: true,
      },
    });

    await runHandler(handlerGamesIndex, req);

    expect(gameService.createScheduledGame).toHaveBeenCalledWith(
      expect.objectContaining({
        participants: expect.arrayContaining([
          expect.objectContaining({
            discordId: '123',
            name: 'Test User',
          }),
        ]),
      })
    );
  });

  test('GET /api/games handles complex filters', async () => {
    gameService.getGames.mockResolvedValue({
      games: [{ id: '1' }],
      total: 1,
      page: 1,
      limit: 10,
    });
    const req = createMockRequest({
      method: 'GET',
      query: {
        gameState: 'completed',
        category: '1v1',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        player: 'TestPlayer',
        page: '2',
        limit: '20',
      },
    });

    const { status, json } = await runHandler(handlerGamesIndex, req);

    expect(gameService.getGames).toHaveBeenCalledWith(
      expect.objectContaining({
        gameState: 'completed',
        category: '1v1',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        player: 'TestPlayer',
        page: 2,
        limit: 20,
      })
    );
    expect(status).toHaveBeenCalledWith(200);
  });

  test('GET /api/games/[id] returns game by id', async () => {
    gameService.getGameById.mockResolvedValue({ id: 'abc' });
    const req = createMockRequest({ method: 'GET', query: { id: 'abc' } });

    const { status, json } = await runHandler(handlerGamesById, req);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ success: true, data: { id: 'abc' } });
  });

  test('DELETE /api/games/[id] deletes game', async () => {
    const req = createMockRequest({ method: 'DELETE', query: { id: 'abc' } });

    const { status } = await runHandler(handlerGamesById, req);

    expect(gameService.deleteGame).toHaveBeenCalledWith('abc');
    expect(status).toHaveBeenCalledWith(200);
  });
});

describe('Players API', () => {
  test('GET /api/players returns limited list', async () => {
    playerService.getAllPlayers.mockResolvedValue([{ name: 'Player1' }]);
    const req = createMockRequest({ method: 'GET', query: { limit: '50' } });

    const { status, json } = await runHandler(handlerPlayersIndex, req);

    expect(playerService.getAllPlayers).toHaveBeenCalledWith(50);
    expect(json).toHaveBeenCalledWith({ success: true, data: [{ name: 'Player1' }] });
    expect(status).toHaveBeenCalledWith(200);
  });

  test('GET /api/players/[name] returns player stats', async () => {
    playerService.getPlayerStats.mockResolvedValue({ name: 'Test' });
    const req = createMockRequest({ method: 'GET', query: { name: 'Test' } });

    const { json } = await runHandler(handlerPlayerByName, req);

    expect(json).toHaveBeenCalledWith({ success: true, data: { name: 'Test' } });
  });

  test('GET /api/players/[name] requires name parameter', async () => {
    const req = createMockRequest({ method: 'GET', query: {} }); // No name

    const { status, json } = await runHandler(handlerPlayerByName, req);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('Player name is required'),
      })
    );
  });

  test('GET /api/players/[name] returns 500 when player not found', async () => {
    playerService.getPlayerStats.mockResolvedValue(null);
    const req = createMockRequest({ method: 'GET', query: { name: 'NonExistent' } });

    const { status, json } = await runHandler(handlerPlayerByName, req);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('Player not found'),
      })
    );
  });

  test('GET /api/players/[name] handles filters correctly', async () => {
    playerService.getPlayerStats.mockResolvedValue({
      name: 'Test',
      categories: { '1v1': { games: 10 } },
    });
    const req = createMockRequest({
      method: 'GET',
      query: {
        name: 'Test',
        category: '1v1',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        includeGames: 'true',
      },
    });

    const { json } = await runHandler(handlerPlayerByName, req);

    expect(playerService.getPlayerStats).toHaveBeenCalledWith('Test', {
      category: '1v1',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      includeGames: true,
    });
    expect(json).toHaveBeenCalledWith({
      success: true,
      data: {
        name: 'Test',
        categories: { '1v1': { games: 10 } },
      },
    });
  });

  test('GET /api/players/search returns empty when query too short', async () => {
    const req = createMockRequest({ method: 'GET', query: { q: 'a' } });

    const { json } = await runHandler(handlerPlayerSearch, req);

    expect(json).toHaveBeenCalledWith({ success: true, data: [] });
    expect(playerService.searchPlayers).not.toHaveBeenCalled();
  });

  test('GET /api/players/compare validates player names', async () => {
    const req = createMockRequest({ method: 'GET', query: { names: 'one' } });

    const { status } = await runHandler(handlerPlayerCompare, req);

    expect(status).toHaveBeenCalledWith(500);
  });
});

describe('Posts API', () => {
  test('GET /api/posts filters unpublished', async () => {
    postService.getAllPosts.mockResolvedValue([{ id: '1' }]);
    const req = createMockRequest({ method: 'GET', query: { includeUnpublished: 'true' } });

    const { status, json } = await runHandler(handlerPostsIndex, req);

    expect(postService.getAllPosts).toHaveBeenCalledWith(true);
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ success: true, data: [{ id: '1' }] });
  });

  test('POST /api/posts requires authentication', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    const req = createMockRequest({ method: 'POST', body: {} });

    const { status, json } = await runHandler(handlerPostsIndex, req);

    // createApiHandler returns 401 for requireAuth: true
    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Authentication required',
      })
    );
  });

  test('GET /api/posts/[id] returns post', async () => {
    postService.getPostById.mockResolvedValue({ id: 'xyz' });
    const req = createMockRequest({ method: 'GET', query: { id: 'xyz' } });

    const { json } = await runHandler(handlerPostsById, req);

    expect(json).toHaveBeenCalledWith({ success: true, data: { id: 'xyz' } });
  });
});

// TODO: Update scheduled games tests to use unified /api/games routes
// Scheduled games routes were migrated to /api/games routes
// These tests need to be updated to use the new unified games API
describe.skip('Scheduled Games API', () => {
  // Scheduled games functionality now handled through /api/games routes
  // Tests need to be updated to reflect new route structure
});

describe('Archives API', () => {
  test('GET /api/entries returns archives', async () => {
    entryService.getAllEntries.mockResolvedValue(['a']);
    const req = createMockRequest({ method: 'GET' });
    const { json } = await runHandler(handlerEntriesIndex, req);

    expect(json).toHaveBeenCalledWith({ success: true, data: ['a'] });
  });

  test('GET /api/entries filters by contentType', async () => {
    entryService.getAllEntries.mockResolvedValue([{ id: '1', contentType: 'post' }]);
    const req = createMockRequest({ method: 'GET', query: { contentType: 'post' } });
    const { json } = await runHandler(handlerEntriesIndex, req);

    expect(entryService.getAllEntries).toHaveBeenCalledWith('post');
    expect(json).toHaveBeenCalledWith({ success: true, data: [{ id: '1', contentType: 'post' }] });
  });

  test('POST /api/entries requires authentication', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    const req = createMockRequest({
      method: 'POST',
      body: {
        title: 'Test Entry',
        content: 'Test content',
        contentType: 'post',
        date: '2024-01-01',
      },
    });

    const { status, json } = await runHandler(handlerEntriesIndex, req);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('Authentication required'),
      })
    );
  });

  test('POST /api/entries validates required fields', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    const req = createMockRequest({
      method: 'POST',
      body: {
        title: 'Test Entry',
        // Missing: content, contentType, date
      },
    });

    const { status, json } = await runHandler(handlerEntriesIndex, req);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('Missing required fields'),
      })
    );
  });

  test('POST /api/entries validates contentType enum', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    const req = createMockRequest({
      method: 'POST',
      body: {
        title: 'Test Entry',
        content: 'Test content',
        contentType: 'invalid', // Invalid enum value
        date: '2024-01-01',
      },
    });

    const { status, json } = await runHandler(handlerEntriesIndex, req);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('contentType must be one of'),
      })
    );
  });

  test('POST /api/entries validates title is not empty', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    const req = createMockRequest({
      method: 'POST',
      body: {
        title: '', // Empty title
        content: 'Test content',
        contentType: 'post',
        date: '2024-01-01',
      },
    });

    const { status, json } = await runHandler(handlerEntriesIndex, req);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('title'),
      })
    );
  });

  test('POST /api/entries creates entry successfully', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    entryService.createEntry.mockResolvedValue('new-entry-id');
    const req = createMockRequest({
      method: 'POST',
      body: {
        title: 'Test Entry',
        content: 'Test content',
        contentType: 'post',
        date: '2024-01-01',
      },
    });

    const { status, json } = await runHandler(handlerEntriesIndex, req);

    expect(entryService.createEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Entry',
        content: 'Test content',
        contentType: 'post',
        date: '2024-01-01',
        creatorName: 'Test User',
        createdByDiscordId: '123',
      })
    );
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ success: true, data: { id: 'new-entry-id' } });
  });

  test('PUT /api/entries/[id] updates archive', async () => {
    const req = createMockRequest({ method: 'PUT', query: { id: '1' }, body: { title: 'New' } });
    const { status } = await runHandler(handlerEntryById, req);

    expect(entryService.updateEntry).toHaveBeenCalledWith('1', { title: 'New' });
    expect(status).toHaveBeenCalledWith(200);
  });
});

describe('Standings and Analytics API', () => {
  test('GET /api/standings returns leaderboard', async () => {
    standingsService.getStandings.mockResolvedValue([{ name: 'A' }]);
    const req = createMockRequest({ method: 'GET', query: { category: '1v1' } });
    const { json } = await runHandler(handlerStandings, req);

    expect(standingsService.getStandings).toHaveBeenCalledWith(expect.objectContaining({ category: '1v1' }));
    expect(json).toHaveBeenCalledWith({ success: true, data: [{ name: 'A' }] });
  });

  test('GET /api/analytics/activity returns data', async () => {
    analyticsService.getActivityData.mockResolvedValue({});
    const { json } = await runHandler(handlerAnalyticsActivity, createMockRequest({ method: 'GET' }));
    expect(json).toHaveBeenCalledWith({ success: true, data: {} });
  });

  test('GET /api/analytics/elo-history returns data', async () => {
    analyticsService.getEloHistory.mockResolvedValue([]);
    const { json } = await runHandler(handlerAnalyticsEloHistory, createMockRequest({ method: 'GET', query: { playerName: 'P', category: '1v1' } }));
    expect(json).toHaveBeenCalledWith({ success: true, data: [] });
  });

  test('GET /api/analytics/meta returns data', async () => {
    analyticsService.getActivityData.mockResolvedValue({ activity: true });
    analyticsService.getGameLengthData.mockResolvedValue({ length: true });
    analyticsService.getPlayerActivityData.mockResolvedValue({ players: true });
    analyticsService.getClassSelectionData.mockResolvedValue({ classSelection: true });
    analyticsService.getClassWinRateData.mockResolvedValue({ classWinRate: true });
    const { json } = await runHandler(handlerAnalyticsMeta, createMockRequest({ method: 'GET' }));
    expect(json).toHaveBeenCalledWith({
      success: true,
      data: {
        activity: { activity: true },
        gameLength: { length: true },
        playerActivity: { players: true },
        classSelection: { classSelection: true },
        classWinRates: { classWinRate: true },
      }
    });
  });

  test('GET /api/analytics/win-rate returns data', async () => {
    analyticsService.getWinRateData.mockResolvedValue({});
    const { json } = await runHandler(handlerAnalyticsWinRate, createMockRequest({ method: 'GET' }));
    expect(json).toHaveBeenCalledWith({ success: true, data: {} });
  });
});

describe('Lookup APIs', () => {
  test('GET /api/classes returns class stats', async () => {
    analyticsService.getClassStats = jest.fn().mockResolvedValue([{ id: 'paladin' }]);
    const { json } = await runHandler(handlerClassesIndex, createMockRequest({ method: 'GET' }));
    expect(json).toHaveBeenCalledWith({ success: true, data: [{ id: 'paladin' }] });
  });

  test('GET /api/classes/[className] returns class details', async () => {
    analyticsService.getClassStats = jest.fn().mockResolvedValue([{ id: 'priestess' }]);
    const req = createMockRequest({ method: 'GET', query: { className: 'Priestess' } });
    const { json } = await runHandler(handlerClassByName, req);
    expect(json).toHaveBeenCalledWith({ success: true, data: { id: 'priestess' } });
  });

  test('GET /api/items returns items', async () => {
    const { json } = await runHandler(handlerItemsIndex, createMockRequest({ method: 'GET' }));
    expect(json).toHaveBeenCalled();
  });

  test('GET /api/icons/list returns icons', async () => {
    const { json } = await runHandler(handlerIconsList, createMockRequest({ method: 'GET' }));
    const payload = json.mock.calls[0][0];
    // Response is wrapped in { success: true, data: [...] }
    expect(payload).toHaveProperty('success', true);
    expect(payload).toHaveProperty('data');
    expect(Array.isArray(payload.data)).toBe(true);
    if (payload.data.length > 0) {
      expect(payload.data[0]).toHaveProperty('filename');
    }
  });
});

describe('User API', () => {
  test('POST /api/user/accept-data-notice requires auth', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    const req = createMockRequest({ method: 'POST' });

    const { status } = await runHandler(handlerAcceptDataNotice, req);

    expect(status).toHaveBeenCalledWith(401);
  });

  test('GET /api/user/data-notice-status returns status', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    userDataService.getUserDataByDiscordId.mockResolvedValue({ dataCollectionNoticeAccepted: true });
    const req = createMockRequest({ method: 'GET' });

    const { json } = await runHandler(handlerDataNoticeStatus, req);

    expect(json).toHaveBeenCalledWith({ success: true, data: { accepted: true } });
  });

  test('DELETE /api/user/delete removes account', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    userDataService.deleteUserData.mockResolvedValue(true);
    const req = createMockRequest({ method: 'POST' });

    const { json } = await runHandler(handlerUserDelete, req);

    expect(userDataService.deleteUserData).toHaveBeenCalledWith(mockSession.discordId);
    expect(json).toHaveBeenCalledWith({
      success: true,
      data: { message: 'Account deleted successfully' },
    });
  });
});

describe('Admin API', () => {
  test('POST /api/admin/wipe-test-data requires admin session', async () => {
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true, configurable: true });
    
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    userDataService.getUserDataByDiscordId.mockResolvedValue({ role: 'admin' });
    (isAdmin as jest.Mock).mockReturnValue(true);
    
    // Mock Firebase admin to prevent actual Firebase calls
    const { getFirestoreAdmin } = jest.requireMock('@/features/infrastructure/api/firebase/admin');
    getFirestoreAdmin.mockReturnValue({
      listCollections: jest.fn().mockResolvedValue([]),
    });
    
    const req = createMockRequest({ method: 'POST' });

    const { json, status } = await runHandler(handlerAdminWipe, req);

    expect(userDataService.getUserDataByDiscordId).toHaveBeenCalledWith('123');
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    
    // Restore env
    Object.defineProperty(process.env, 'NODE_ENV', { value: originalEnv, writable: true, configurable: true });
  });
});

describe('Revalidate API', () => {
  test('POST /api/revalidate requires auth', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    const req = createMockRequest({ method: 'POST', body: { path: '/test' } });

    const { status } = await runHandler(handlerRevalidate, req);

    expect(status).toHaveBeenCalledWith(401);
  });

  test('POST /api/revalidate triggers revalidation', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    const req = createMockRequest({ method: 'POST', body: { path: '/page' } });

    const { status, revalidate } = await runHandler(handlerRevalidate, req);

    expect(revalidate).toHaveBeenCalledWith('/page');
    expect(status).toHaveBeenCalledWith(200);
  });
});
