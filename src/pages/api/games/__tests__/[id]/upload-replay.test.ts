import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../[id]/upload-replay';
import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import { randomUUID } from 'crypto';

// Mock dependencies
const mockGetGameById = jest.fn();
const mockUpdateEloScores = jest.fn();
const mockParseReplayFile = jest.fn();
const mockInfo = jest.fn();
const mockError = jest.fn();
const mockWarn = jest.fn();
const mockDebug = jest.fn();

jest.mock('@/features/modules/game-management/games/lib/gameService', () => ({
  getGameById: (...args: unknown[]) => mockGetGameById(...args),
  updateEloScores: (...args: unknown[]) => mockUpdateEloScores(...args),
}));

jest.mock('@/features/modules/game-management/lib/mechanics', () => ({
  parseReplayFile: (...args: unknown[]) => mockParseReplayFile(...args),
}));

jest.mock('@/features/infrastructure/api/firebase/admin', () => ({
  getFirestoreAdmin: jest.fn(),
  getAdminTimestamp: jest.fn(),
  getStorageAdmin: jest.fn(),
  getStorageBucketName: jest.fn(),
}));

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

describe('POST /api/games/[id]/upload-replay', () => {
  const createRequest = (id: string): NextApiRequest => ({
    method: 'POST',
    query: { id },
    body: null,
    url: `/api/games/${id}/upload-replay`,
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

  const mockScheduledGame = {
    gameId: 123,
    gameState: 'scheduled',
    teamSize: '4v4',
    scheduledDateTime: '2024-01-15T12:00:00Z',
    creatorName: 'Creator',
    createdByDiscordId: 'discord123',
    participants: [
      { discordId: 'discord123', name: 'Test User', joinedAt: '2024-01-01T00:00:00Z' },
    ],
  };

  const mockParsedReplay = {
    gameData: {
      datetime: '2024-01-15T12:00:00Z',
      duration: 1800,
      gamename: 'Test Game',
      map: 'Test Map',
      ownername: 'Creator',
      category: '4v4',
      players: [
        { name: 'Player1', pid: 0, team: 1, result: 'win', elo: 1500 },
        { name: 'Player2', pid: 1, team: 1, result: 'win', elo: 1500 },
      ],
    },
  };

  const mockFormParse = jest.fn();
  const mockFile = {
    filepath: '/tmp/mock-file.w3g',
    originalFilename: 'replay.w3g',
    mimetype: 'application/octet-stream',
  };

  const mockBucket = {
    file: jest.fn(),
  };

  const mockFileRef = {
    save: jest.fn(),
  };

  const mockCollection = {
    doc: jest.fn(),
    collection: jest.fn(),
    get: jest.fn(),
  };

  const mockDocRef = {
    update: jest.fn(),
    collection: jest.fn(),
  };

  const mockPlayersCollection = {
    get: jest.fn(),
    add: jest.fn(),
  };

  const mockPlayersSnapshot = {
    docs: [],
  };

  const mockTimestamp = {
    fromDate: jest.fn((date: Date) => ({ seconds: Math.floor(date.getTime() / 1000) })),
    now: jest.fn(() => ({ seconds: Math.floor(Date.now() / 1000) })),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup session mock
    mockGetServerSession.mockResolvedValue(mockSession);

    // Setup game mock
    mockGetGameById.mockResolvedValue(mockScheduledGame);
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
    const { getStorageAdmin, getStorageBucketName } = require('@/features/infrastructure/api/firebase/admin');
    getStorageBucketName.mockReturnValue('test-bucket');
    const mockStorage = {
      bucket: jest.fn((name?: string) => {
        if (name) {
          mockBucket.name = name;
        } else {
          mockBucket.name = 'test-bucket';
        }
        return mockBucket;
      }),
    };
    getStorageAdmin.mockReturnValue(mockStorage);
    mockBucket.file.mockReturnValue(mockFileRef);
    mockFileRef.save.mockResolvedValue(undefined);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mockBucket as any).name = 'test-bucket';

    // Setup Firestore mock
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getFirestoreAdmin, getAdminTimestamp } = require('@/features/infrastructure/api/firebase/admin');
    getFirestoreAdmin.mockReturnValue(mockCollection);
    mockCollection.doc.mockReturnValue(mockDocRef);
    mockDocRef.update.mockResolvedValue(undefined);
    mockDocRef.collection.mockReturnValue(mockPlayersCollection);
    mockPlayersCollection.get.mockResolvedValue(mockPlayersSnapshot);
    mockPlayersCollection.add.mockResolvedValue({ id: 'player-id' });

    // Setup timestamp mock
    getAdminTimestamp.mockReturnValue(mockTimestamp);
  });

  it('uploads replay and converts scheduled game to completed', async () => {
    // Arrange
    const req = createRequest('game-123');
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockGetGameById).toHaveBeenCalledWith('game-123');
    expect(mockFormParse).toHaveBeenCalled();
    expect(fs.readFile).toHaveBeenCalledWith('/tmp/mock-file.w3g');
    expect(mockBucket.file).toHaveBeenCalledWith('games/game-123/replay.w3g');
    expect(mockFileRef.save).toHaveBeenCalled();
    expect(mockParseReplayFile).toHaveBeenCalled();
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({
        gameState: 'completed',
        replayUrl: expect.stringContaining('firebasestorage.googleapis.com'),
        replayFileName: 'replay.w3g',
      })
    );
    expect(mockUpdateEloScores).toHaveBeenCalledWith('game-123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          gameId: 'game-123',
          message: 'Replay uploaded and game completed successfully',
        }),
      })
    );
  });

  it('requires authentication', async () => {
    // Arrange
    mockGetServerSession.mockResolvedValue(null);
    const req = createRequest('game-123');
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
    expect(mockGetGameById).not.toHaveBeenCalled();
  });

  it('requires discordId in session', async () => {
    // Arrange
    mockGetServerSession.mockResolvedValue({
      user: { name: 'Test User' },
      // No discordId
    });
    const req = createRequest('game-123');
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

  it('handles error when game not found', async () => {
    // Arrange
    mockGetGameById.mockResolvedValue(null);
    const req = createRequest('non-existent');
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Game not found',
      })
    );
  });

  it('handles error when game is not scheduled', async () => {
    // Arrange
    mockGetGameById.mockResolvedValue({
      ...mockScheduledGame,
      gameState: 'completed',
    });
    const req = createRequest('game-123');
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Can only upload replay for scheduled games',
      })
    );
  });

  it('handles error when replay file is missing', async () => {
    // Arrange
    mockFormParse.mockImplementation((req, callback) => {
      callback(null, {}, {}); // No replay file
    });
    const req = createRequest('game-123');
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
    const req = createRequest('game-123');
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
    const req = createRequest('game-123');
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
    expect(mockWarn).toHaveBeenCalledWith(
      'Replay parsing failed',
      expect.objectContaining({
        gameId: 'game-123',
        error: 'Replay parsing failed',
      })
    );
  });

  it('uses manual gameData when replay parsing fails', async () => {
    // Arrange
    const parseError = new Error('Replay parsing failed');
    mockParseReplayFile.mockRejectedValue(parseError);
    const manualGameData = {
      datetime: '2024-01-15T12:00:00Z',
      duration: 1800,
      gamename: 'Manual Game',
      map: 'Manual Map',
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
    const req = createRequest('game-123');
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockWarn).toHaveBeenCalledWith(
      'Replay parsing failed',
      expect.objectContaining({
        gameId: 'game-123',
      })
    );
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({
        gamename: 'Manual Game',
        map: 'Manual Map',
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('handles error when manual gameData is invalid JSON', async () => {
    // Arrange
    const parseError = new Error('Replay parsing failed');
    mockParseReplayFile.mockRejectedValue(parseError);
    mockFormParse.mockImplementation((req, callback) => {
      callback(null, { gameData: 'invalid json' }, { replay: mockFile });
    });
    const req = createRequest('game-123');
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

  it('handles error when game data has less than 2 players', async () => {
    // Arrange
    mockParseReplayFile.mockResolvedValue({
      gameData: {
        ...mockParsedReplay.gameData,
        players: [{ name: 'Player1', pid: 0, team: 1, result: 'win' }], // Only 1 player
      },
    });
    const req = createRequest('game-123');
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('at least 2 players are required'),
      })
    );
  });

  it('handles error when ELO update fails (logs but does not fail request)', async () => {
    // Arrange
    const eloError = new Error('ELO update failed');
    // Ensure mockUpdateEloScores is reset and set to reject
    mockUpdateEloScores.mockReset();
    mockUpdateEloScores.mockRejectedValue(eloError);
    const req = createRequest('game-123');
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockUpdateEloScores).toHaveBeenCalledWith('game-123');
    expect(mockWarn).toHaveBeenCalledWith(
      'Failed to update ELO scores',
      expect.objectContaining({
        gameId: 'game-123',
        error: 'ELO update failed',
      })
    );
    // Request should still succeed
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('clears existing players subcollection before adding new players', async () => {
    // Arrange
    const existingPlayerDoc = {
      ref: { delete: jest.fn().mockResolvedValue(undefined) },
    };
    mockPlayersSnapshot.docs = [existingPlayerDoc];
    const req = createRequest('game-123');
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockPlayersCollection.get).toHaveBeenCalled();
    expect(existingPlayerDoc.ref.delete).toHaveBeenCalled();
    expect(mockPlayersCollection.add).toHaveBeenCalledTimes(2); // 2 players
  });

  it('removes temporary file after upload', async () => {
    // Arrange
    const req = createRequest('game-123');
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
      query: { id: 'game-123' },
      body: null,
      url: '/api/games/game-123/upload-replay',
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
      query: { id: 'game-123' },
      body: null,
      url: '/api/games/game-123/upload-replay',
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
      query: { id: 'game-123' },
      body: null,
      url: '/api/games/game-123/upload-replay',
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

