import type { NextApiRequest } from 'next';
import { TextDecoder, TextEncoder } from 'util';

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
import { createMockRequest, createMockResponse } from '../../test-utils/mockNext';

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

jest.mock('@/features/modules/games/lib/gameService', () => ({
  getGames: jest.fn(),
  createScheduledGame: jest.fn(),
  createCompletedGame: jest.fn(),
  getGameById: jest.fn(),
  updateGame: jest.fn(),
  deleteGame: jest.fn(),
}));

jest.mock('@/features/modules/players/lib/playerService', () => ({
  getAllPlayers: jest.fn(),
  getPlayerStats: jest.fn(),
  searchPlayers: jest.fn(),
  comparePlayers: jest.fn(),
}));

jest.mock('@/features/modules/blog/lib/postService', () => ({
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

jest.mock('@/features/modules/entries/lib/entryService', () => ({
  getAllEntries: jest.fn(),
  createEntry: jest.fn(),
  getEntryById: jest.fn(),
  updateEntry: jest.fn(),
  deleteEntry: jest.fn(),
}));

jest.mock('@/features/modules/standings/lib/standingsService', () => ({
  getStandings: jest.fn(),
}));

jest.mock('@/features/modules/analytics/lib/analyticsService', () => ({
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
const gameService = jest.requireMock('@/features/modules/games/lib/gameService');
const playerService = jest.requireMock('@/features/modules/players/lib/playerService');
const postService = jest.requireMock('@/features/modules/blog/lib/postService');
const scheduledService = jest.requireMock('@/features/modules/scheduled-games/lib/scheduledGameService');
const entryService = jest.requireMock('@/features/modules/entries/lib/entryService');
const standingsService = jest.requireMock('@/features/modules/standings/lib/standingsService');
const analyticsService = jest.requireMock('@/features/modules/analytics/lib/analyticsService');
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
});

describe('Games API', () => {
  test('GET /api/games returns games with filters', async () => {
    gameService.getGames.mockResolvedValue([{ id: '1' }]);
    const req = createMockRequest({
      method: 'GET',
      query: { gameId: '5', limit: '10' },
    });

    const { status, json } = await runHandler(handlerGamesIndex, req);

    expect(gameService.getGames).toHaveBeenCalledWith(expect.objectContaining({ gameId: 5, limit: 10 }));
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith([{ id: '1' }]);
  });

  test('POST /api/games requires auth for scheduled game', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    const req = createMockRequest({ method: 'POST', body: {} });

    const { status, json } = await runHandler(handlerGamesIndex, req);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({ error: 'Authentication required' });
  });

  test('POST /api/games validates scheduled game fields', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    const req = createMockRequest({
      method: 'POST',
      body: { gameState: 'scheduled', scheduledDateTime: '', timezone: '', teamSize: undefined, gameType: '' },
    });

    const { status, json } = await runHandler(handlerGamesIndex, req);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      error: 'Missing required fields: scheduledDateTime, timezone, teamSize, and gameType are required'
    });
  });

  test('POST /api/games rejects past scheduled date for non-admin', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    userDataService.getUserDataByDiscordId.mockResolvedValue({ role: 'user' });
    (isAdmin as jest.Mock).mockReturnValue(false);
    const pastDate = new Date(Date.now() - 60_000).toISOString();
    const req = createMockRequest({
      method: 'POST',
      body: { gameState: 'scheduled', scheduledDateTime: pastDate, timezone: 'UTC', teamSize: 2, gameType: 'team' },
    });

    const { status } = await runHandler(handlerGamesIndex, req);

    expect(status).toHaveBeenCalledWith(400);
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
    expect(status).toHaveBeenCalledWith(201);
    expect(json).toHaveBeenCalledWith({ id: 'new-id', success: true });
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
    expect(json).toHaveBeenCalledWith([{ id: '1' }]);
  });

  test('POST /api/posts requires authentication', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    const req = createMockRequest({ method: 'POST', body: {} });

    const { status } = await runHandler(handlerPostsIndex, req);

    expect(status).toHaveBeenCalledWith(401);
  });

  test('GET /api/posts/[id] returns post', async () => {
    postService.getPostById.mockResolvedValue({ id: 'xyz' });
    const req = createMockRequest({ method: 'GET', query: { id: 'xyz' } });

    const { json } = await runHandler(handlerPostsById, req);

    expect(json).toHaveBeenCalledWith({ id: 'xyz' });
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

    expect(json).toHaveBeenCalledWith(['a']);
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
    expect(Array.isArray(payload)).toBe(true);
    expect(payload[0]).toHaveProperty('filename');
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

    expect(json).toHaveBeenCalledWith({ accepted: true });
  });

  test('DELETE /api/user/delete removes account', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    userDataService.deleteUserData.mockResolvedValue(true);
    const req = createMockRequest({ method: 'POST' });

    const { json } = await runHandler(handlerUserDelete, req);

    expect(userDataService.deleteUserData).toHaveBeenCalledWith(mockSession.discordId);
    expect(json).toHaveBeenCalledWith({ success: true, message: 'Account deleted successfully' });
  });
});

describe('Admin API', () => {
  test('POST /api/admin/wipe-test-data requires admin session', async () => {
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true, configurable: true });
    // Restore after test if needed
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    userDataService.getUserDataByDiscordId.mockResolvedValue({ role: 'admin' });
    (isAdmin as jest.Mock).mockReturnValue(true);
    const req = createMockRequest({ method: 'POST' });

    const { json, status } = await runHandler(handlerAdminWipe, req);

    expect(userDataService.getUserDataByDiscordId).toHaveBeenCalledWith('123');
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
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
