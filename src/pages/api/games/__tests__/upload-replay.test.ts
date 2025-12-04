import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../upload-replay';
import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import { randomUUID } from 'crypto';

// Mock dependencies
const mockCreateCompletedGame = jest.fn();
const mockGetGames = jest.fn();
const mockUpdateEloScores = jest.fn();
const mockParseReplayFile = jest.fn();
const mockInfo = jest.fn();
const mockError = jest.fn();
const mockWarn = jest.fn();
const mockDebug = jest.fn();

jest.mock('@/features/modules/game-management/games/lib/gameService', () => ({
  createCompletedGame: (...args: unknown[]) => mockCreateCompletedGame(...args),
  getGames: (...args: unknown[]) => mockGetGames(...args),
  updateEloScores: (...args: unknown[]) => mockUpdateEloScores(...args),
}));

jest.mock('@/features/modules/game-management/lib/mechanics', () => ({
  parseReplayFile: (...args: unknown[]) => mockParseReplayFile(...args),
}));

const mockGetStorageAdmin = jest.fn();
const mockGetStorageBucketName = jest.fn();
const mockGetFirestoreAdmin = jest.fn();
const mockGetAdminTimestamp = jest.fn();

// Mock firebase-admin/storage to prevent real Cloud Storage library import
jest.mock('firebase-admin/storage', () => ({
  getStorage: jest.fn(() => ({
    bucket: jest.fn(() => ({
      file: jest.fn(() => ({
        save: jest.fn(),
      })),
    })),
  })),
}));

jest.mock('@/features/infrastructure/api/firebase/admin', () => {
  const mockStorageAdminFn = jest.fn();
  const mockStorageBucketNameFn = jest.fn();
  const mockFirestoreAdminFn = jest.fn();
  const mockAdminTimestampFn = jest.fn();
  return {
    getFirestoreAdmin: (...args: unknown[]) => mockFirestoreAdminFn(...args),
    getAdminTimestamp: (...args: unknown[]) => mockAdminTimestampFn(...args),
    getStorageAdmin: (...args: unknown[]) => mockStorageAdminFn(...args),
    getStorageBucketName: (...args: unknown[]) => mockStorageBucketNameFn(...args),
    isServerSide: jest.fn(() => true),
    // Export the mock functions so they can be accessed in tests
    __mockStorageAdmin: mockStorageAdminFn,
    __mockStorageBucketName: mockStorageBucketNameFn,
    __mockFirestoreAdmin: mockFirestoreAdminFn,
    __mockAdminTimestamp: mockAdminTimestampFn,
  };
});

jest.mock('@/features/infrastructure/logging', () => ({
  createComponentLogger: jest.fn(() => ({
    info: mockInfo,
    error: mockError,
    warn: mockWarn,
    debug: mockDebug,
  })),
}));

jest.mock('formidable', () => ({
  IncomingForm: jest.fn(),
}));

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    unlink: jest.fn(),
  },
}));

jest.mock('crypto', () => ({
  randomUUID: jest.fn(),
  randomBytes: jest.fn((size: number) => Buffer.alloc(size, 0)),
}));

const mockGetServerSession = jest.fn();
jest.mock('next-auth/next', () => ({
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));

jest.mock('@/pages/api/auth/[...nextauth]', () => ({
  authOptions: {},
}));

describe('POST /api/games/upload-replay', () => {
  const createRequest = (): NextApiRequest => ({
    method: 'POST',
    query: {},
    body: null,
    url: '/api/games/upload-replay',
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

  const mockParsedReplay = {
    gameData: {
      gameId: 123,
      datetime: '2024-01-15T12:00:00Z',
      duration: 1800,
      gamename: 'Test Game',
      map: 'Test Map',
      creatorName: 'Creator',
      ownername: 'Creator',
      category: '4v4',
      players: [
        { name: 'Player1', pid: 0, team: 1, result: 'win', elo: 1500 },
        { name: 'Player2', pid: 1, team: 1, result: 'win', elo: 1500 },
      ],
    },
    w3mmd: { raw: [], lookup: {} },
  };

  const mockFormParse = jest.fn();
  const mockFile = {
    filepath: '/tmp/mock-file.w3g',
    originalFilename: 'replay.w3g',
    mimetype: 'application/octet-stream',
  };

  const mockBucket = {
    file: jest.fn(),
    name: 'test-bucket',
  };

  const mockFileRef = {
    save: jest.fn(),
  };

  const mockCollection = {
    doc: jest.fn(),
  };

  const mockDocRef = {
    update: jest.fn(),
  };

  const mockTimestamp = {
    fromDate: jest.fn((date: Date) => ({ seconds: Math.floor(date.getTime() / 1000) })),
    now: jest.fn(() => ({ seconds: Math.floor(Date.now() / 1000) })),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup session mock
    mockGetServerSession.mockResolvedValue(mockSession);

    // Setup games mock
    mockGetGames.mockResolvedValue({ games: [], cursor: null });
    mockCreateCompletedGame.mockResolvedValue('created-game-id');
    mockUpdateEloScores.mockResolvedValue(undefined);

    // Setup replay parser mock
    mockParseReplayFile.mockResolvedValue(mockParsedReplay);

    // Setup formidable mock
    (IncomingForm as jest.Mock).mockImplementation(() => ({
      parse: mockFormParse,
    }));

    mockFormParse.mockImplementation((req, callback) => {
      callback(null, {}, { replay: mockFile });
    });

    // Setup file system mock
    (fs.readFile as jest.Mock).mockResolvedValue(Buffer.from('mock file content'));
    (fs.unlink as jest.Mock).mockResolvedValue(undefined);

    // Setup crypto mock
    (randomUUID as jest.Mock).mockReturnValue('mock-uuid-token');

    // Setup Firebase Storage mock
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const adminModule = require('@/features/infrastructure/api/firebase/admin') as any;
    adminModule.__mockStorageBucketName.mockReturnValue('test-bucket');
    const mockStorage = {
      bucket: jest.fn(() => mockBucket),
    };
    adminModule.__mockStorageAdmin.mockReturnValue(mockStorage);
    mockBucket.file.mockReturnValue(mockFileRef);
    mockFileRef.save.mockResolvedValue(undefined);

    // Setup Firestore mock
    adminModule.__mockFirestoreAdmin.mockReturnValue(mockCollection);
    mockCollection.doc.mockReturnValue(mockDocRef);
    mockDocRef.update.mockResolvedValue(undefined);

    // Setup timestamp mock
    adminModule.__mockAdminTimestamp.mockReturnValue(mockTimestamp);
  });

  it('uploads replay and creates completed game', async () => {
    // Arrange
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockFormParse).toHaveBeenCalled();
    expect(fs.readFile).toHaveBeenCalledWith('/tmp/mock-file.w3g');
    expect(mockParseReplayFile).toHaveBeenCalled();
    expect(mockGetGames).toHaveBeenCalledWith({ gameId: 123, limit: 1 });
    expect(mockCreateCompletedGame).toHaveBeenCalled();
    expect(mockBucket.file).toHaveBeenCalledWith('games/created-game-id/replay.w3g');
    expect(mockFileRef.save).toHaveBeenCalled();
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({
        replayUrl: expect.stringContaining('firebasestorage.googleapis.com'),
        replayFileName: 'replay.w3g',
      })
    );
    expect(mockUpdateEloScores).toHaveBeenCalledWith('created-game-id');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          id: 'created-game-id',
          gameId: 123,
          message: 'Replay uploaded and game created successfully',
        }),
      })
    );
  });

  it('requires authentication', async () => {
    // Arrange
    mockGetServerSession.mockResolvedValue(null);
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Authentication required',
      })
    );
    expect(mockCreateCompletedGame).not.toHaveBeenCalled();
  });

  it('requires discordId in session', async () => {
    // Arrange
    mockGetServerSession.mockResolvedValue({
      user: { name: 'Test User' },
      // No discordId
    });
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('Discord ID is required'),
      })
    );
  });

  it('handles error when replay file is missing', async () => {
    // Arrange
    mockFormParse.mockImplementation((req, callback) => {
      callback(null, {}, {}); // No replay file
    });
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('Replay file is required'),
      })
    );
  });

  it('handles error when form parsing fails', async () => {
    // Arrange
    const parseError = new Error('Form parsing failed');
    mockFormParse.mockImplementation((req, callback) => {
      callback(parseError, {}, {});
    });
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('Form parsing failed'),
      })
    );
  });

  it('handles error when replay parsing fails and no gameData provided', async () => {
    // Arrange
    const parseError = new Error('Replay parsing failed');
    mockParseReplayFile.mockRejectedValue(parseError);
    mockFormParse.mockImplementation((req, callback) => {
      callback(null, {}, { replay: mockFile }); // No gameData field
    });
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('Replay parsing failed'),
      })
    );
    expect(mockError).toHaveBeenCalledWith(
      'Replay parsing failed',
      parseError,
      expect.objectContaining({
        scheduledGameId: undefined,
      })
    );
  });

  it('uses manual gameData when replay parsing fails', async () => {
    // Arrange
    const parseError = new Error('Replay parsing failed');
    mockParseReplayFile.mockRejectedValue(parseError);
    const manualGameData = {
      gameId: 456,
      datetime: '2024-01-15T12:00:00Z',
      duration: 1800,
      gamename: 'Manual Game',
      map: 'Manual Map',
      creatorName: 'Creator',
      ownername: 'Creator',
      category: '4v4',
      players: [
        { name: 'Player1', pid: 0, team: 1, result: 'win' },
        { name: 'Player2', pid: 1, team: 1, result: 'win' },
      ],
    };
    mockFormParse.mockImplementation((req, callback) => {
      callback(null, { gameData: JSON.stringify(manualGameData) }, { replay: mockFile });
    });
    mockGetGames.mockResolvedValue({ games: [], cursor: null });
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockError).toHaveBeenCalledWith(
      'Replay parsing failed',
      parseError,
      expect.objectContaining({
        scheduledGameId: undefined,
      })
    );
    expect(mockCreateCompletedGame).toHaveBeenCalledWith(
      expect.objectContaining({
        gameId: 456,
        gamename: 'Manual Game',
        map: 'Manual Map',
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('handles error when manual gameData is missing required fields', async () => {
    // Arrange
    const parseError = new Error('Replay parsing failed');
    mockParseReplayFile.mockRejectedValue(parseError);
    const invalidGameData = {
      // Missing gameId, datetime, players
      gamename: 'Invalid Game',
    };
    mockFormParse.mockImplementation((req, callback) => {
      callback(null, { gameData: JSON.stringify(invalidGameData) }, { replay: mockFile });
    });
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('gameId, datetime, and players are required'),
      })
    );
  });

  it('handles error when manual gameData is invalid JSON', async () => {
    // Arrange
    const parseError = new Error('Replay parsing failed');
    mockParseReplayFile.mockRejectedValue(parseError);
    mockFormParse.mockImplementation((req, callback) => {
      callback(null, { gameData: 'invalid json' }, { replay: mockFile });
    });
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('invalid gameData JSON'),
      })
    );
  });

  it('handles error when game with same gameId already exists (scheduled)', async () => {
    // Arrange
    mockGetGames.mockResolvedValue({
      games: [{
        id: 'existing-game-id',
        gameId: 123,
        gameState: 'scheduled',
      }],
      cursor: null,
    });
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('A scheduled game with gameId 123 already exists'),
      })
    );
    expect(mockCreateCompletedGame).not.toHaveBeenCalled();
  });

  it('handles error when game with same gameId already exists (completed)', async () => {
    // Arrange
    mockGetGames.mockResolvedValue({
      games: [{
        id: 'existing-game-id',
        gameId: 123,
        gameState: 'completed',
      }],
      cursor: null,
    });
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('A completed game with gameId 123 already exists'),
      })
    );
    expect(mockCreateCompletedGame).not.toHaveBeenCalled();
  });

  it('handles optional scheduledGameId field', async () => {
    // Arrange
    mockFormParse.mockImplementation((req, callback) => {
      callback(null, { scheduledGameId: '789' }, { replay: mockFile });
    });
    mockParseReplayFile.mockResolvedValue({
      ...mockParsedReplay,
      gameData: {
        ...mockParsedReplay.gameData,
        gameId: 789,
      },
    });
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockParseReplayFile).toHaveBeenCalledWith(
      expect.any(Buffer),
      expect.objectContaining({
        scheduledGameId: 789,
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('handles error when ELO update fails (logs but does not fail request)', async () => {
    // Arrange
    const eloError = new Error('ELO update failed');
    // Override the default resolved mock from beforeEach to reject
    mockUpdateEloScores.mockReset();
    mockUpdateEloScores.mockRejectedValue(eloError);
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    // Check that the handler succeeded despite ELO update failure
    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockUpdateEloScores).toHaveBeenCalledWith('created-game-id');
    expect(mockWarn).toHaveBeenCalledWith(
      'Failed to update ELO scores',
      expect.objectContaining({
        gameId: 'created-game-id',
        error: 'ELO update failed',
      })
    );
  });

  it('removes temporary file after upload', async () => {
    // Arrange
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(fs.unlink).toHaveBeenCalledWith('/tmp/mock-file.w3g');
  });

  it('rejects GET method', async () => {
    // Arrange
    const req = {
      method: 'GET',
      query: {},
      body: null,
      url: '/api/games/upload-replay',
    } as NextApiRequest;
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Method GET not allowed. Allowed methods: POST',
      })
    );
  });

  it('rejects PUT method', async () => {
    // Arrange
    const req = {
      method: 'PUT',
      query: {},
      body: null,
      url: '/api/games/upload-replay',
    } as NextApiRequest;
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Method PUT not allowed. Allowed methods: POST',
      })
    );
  });

  it('rejects DELETE method', async () => {
    // Arrange
    const req = {
      method: 'DELETE',
      query: {},
      body: null,
      url: '/api/games/upload-replay',
    } as NextApiRequest;
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Method DELETE not allowed. Allowed methods: POST',
      })
    );
  });
});


