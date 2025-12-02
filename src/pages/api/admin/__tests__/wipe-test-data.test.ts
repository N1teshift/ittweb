import type { NextApiRequest, NextApiResponse } from 'next';
// Import server-side mocks FIRST before handler
import '../../../../../__tests__/helpers/mockUserDataService.server';
import {
  mockGetUserDataByDiscordIdServer,
  setIsServerSide,
} from '../../../../../__tests__/helpers/mockUserDataService.server';
import handler from '../wipe-test-data';

// Mock dependencies
const mockGetFirestoreAdmin = jest.fn();
const mockGetStorageAdmin = jest.fn();
const mockGetStorageBucketName = jest.fn();
const mockInfo = jest.fn();
const mockError = jest.fn();
const mockWarn = jest.fn();
const mockDebug = jest.fn();

jest.mock('@/features/infrastructure/api/firebase/admin', () => ({
  getFirestoreAdmin: jest.fn(() => mockGetFirestoreAdmin()),
  getStorageAdmin: jest.fn(() => mockGetStorageAdmin()),
  getStorageBucketName: jest.fn(() => mockGetStorageBucketName()),
  isServerSide: jest.fn(() => true),
  getAdminTimestamp: jest.fn(() => ({
    now: jest.fn(() => ({ toDate: () => new Date("2020-01-01T00:00:00Z") })),
    fromDate: jest.fn((date: Date) => ({ toDate: () => date })),
  })),
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

// userDataService.server is already mocked via the helper import

const mockIsAdmin = jest.fn();
jest.mock('@/features/infrastructure/utils/userRoleUtils', () => ({
  isAdmin: (...args: unknown[]) => mockIsAdmin(...args),
}));

describe('POST /api/admin/wipe-test-data', () => {
  const createRequest = (): NextApiRequest => ({
    method: 'POST',
    query: {},
    body: null,
    url: '/api/admin/wipe-test-data',
  } as NextApiRequest);

  const createResponse = (): NextApiResponse => {
    const res = {} as NextApiResponse;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockSession = {
    user: { name: 'Admin User' },
    discordId: 'admin-discord-id',
    expires: '2024-12-31',
  };

  const mockCollection = {
    id: 'games',
    get: jest.fn(),
  };

  const mockDoc = {
    ref: {
      delete: jest.fn(),
      listCollections: jest.fn(),
    },
    id: 'doc-123',
  };

  const mockSubcollection = {
    id: 'players',
    get: jest.fn(),
  };

  const mockSubDoc = {
    ref: {
      delete: jest.fn(),
    },
    id: 'subdoc-123',
  };

  const mockBucket = {
    getFiles: jest.fn(),
  };

  const mockFile = {
    name: 'test-file.w3g',
    delete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setIsServerSide(true); // Enable server-side mode
    mockGetServerSession.mockResolvedValue(mockSession);
    mockGetUserDataByDiscordIdServer.mockResolvedValue({ role: 'admin' });
    mockIsAdmin.mockReturnValue(true);

    // Setup Firestore mocks
    const mockSnapshot = {
      forEach: jest.fn((callback) => {
        callback(mockDoc);
      }),
    };
    const mockSubSnapshot = {
      docs: [mockSubDoc],
    };
    const mockAdminDb = {
      listCollections: jest.fn().mockResolvedValue([mockCollection]),
    };
    mockGetFirestoreAdmin.mockReturnValue(mockAdminDb);
    mockCollection.get.mockResolvedValue(mockSnapshot);
    mockDoc.ref.listCollections.mockResolvedValue([mockSubcollection]);
    mockSubcollection.get.mockResolvedValue(mockSubSnapshot);
    mockDoc.ref.delete.mockResolvedValue(undefined);
    mockSubDoc.ref.delete.mockResolvedValue(undefined);

    // Setup Storage mocks
    mockGetStorageBucketName.mockReturnValue('test-bucket');
    mockGetStorageAdmin.mockReturnValue({
      bucket: jest.fn(() => mockBucket),
    });
    mockBucket.getFiles.mockResolvedValue([[mockFile]]);
    mockFile.delete.mockResolvedValue(undefined);
  });

  it('wipes test data successfully', async () => {
    // Arrange
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockCollection.get).toHaveBeenCalled();
    expect(mockDoc.ref.delete).toHaveBeenCalled();
    expect(mockSubDoc.ref.delete).toHaveBeenCalled();
    expect(mockFile.delete).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          success: true,
          message: 'Test data wiped successfully',
          deletedCounts: expect.objectContaining({
            games: 1,
            'games.players': 1,
            storageFiles: 1,
          }),
        }),
      })
    );
  });

  it('requires admin authentication', async () => {
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
  });

  it('requires admin role', async () => {
    // Arrange
    mockGetUserDataByDiscordIdServer.mockResolvedValue({ role: 'user' });
    mockIsAdmin.mockReturnValue(false);
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('admin'),
      })
    );
  });

  it('skips userData collection', async () => {
    // Arrange
    const userDataCollection = { id: 'userData' };
    const mockAdminDb = {
      listCollections: jest.fn().mockResolvedValue([mockCollection, userDataCollection]),
    };
    mockGetFirestoreAdmin.mockReturnValue(mockAdminDb);
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    // userData collection should not be deleted
    expect(mockCollection.get).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('handles collections without documents', async () => {
    // Arrange
    mockCollection.get.mockResolvedValue({
      forEach: jest.fn(), // No documents
    });
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          deletedCounts: expect.objectContaining({
            games: 0,
          }),
        }),
      })
    );
  });

  it('handles empty storage bucket', async () => {
    // Arrange
    mockBucket.getFiles.mockResolvedValue([[]]);
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          deletedCounts: expect.objectContaining({
            storageFiles: 0,
          }),
        }),
      })
    );
  });

  it('handles error when deleting collection', async () => {
    // Arrange
    mockCollection.get.mockRejectedValue(new Error('Collection error'));
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    // Should continue and not fail the entire operation
    expect(mockWarn).toHaveBeenCalledWith(
      'Failed to delete collection',
      expect.objectContaining({
        collection: 'games',
        error: 'Collection error',
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('handles error when deleting storage files', async () => {
    // Arrange
    mockBucket.getFiles.mockRejectedValue(new Error('Storage error'));
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    // Should continue and not fail the entire operation
    expect(mockWarn).toHaveBeenCalledWith(
      'Failed to delete storage files',
      expect.objectContaining({
        error: 'Storage error',
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('handles error when deleting individual document', async () => {
    // Arrange
    mockDoc.ref.delete.mockRejectedValue(new Error('Document error'));
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    // Should continue and not fail the entire operation
    expect(mockWarn).toHaveBeenCalledWith(
      'Failed to delete document',
      expect.objectContaining({
        collection: 'games',
        docId: 'doc-123',
        error: 'Document error',
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('handles error when deleting storage file', async () => {
    // Arrange
    mockFile.delete.mockRejectedValue(new Error('File error'));
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    // Should continue and not fail the entire operation
    expect(mockWarn).toHaveBeenCalledWith(
      'Failed to delete storage file',
      expect.objectContaining({
        fileName: 'test-file.w3g',
        error: 'File error',
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('rejects GET method', async () => {
    // Arrange
    const req = {
      method: 'GET',
      query: {},
      body: null,
      url: '/api/admin/wipe-test-data',
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
      url: '/api/admin/wipe-test-data',
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
      url: '/api/admin/wipe-test-data',
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


