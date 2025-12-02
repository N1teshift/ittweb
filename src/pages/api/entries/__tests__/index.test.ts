import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../index';

// Mock dependencies
const mockGetAllEntries = jest.fn();
const mockCreateEntry = jest.fn();
const mockInfo = jest.fn();
const mockError = jest.fn();
const mockWarn = jest.fn();
const mockDebug = jest.fn();

jest.mock('@/features/modules/game-management/entries/lib/entryService', () => ({
  getAllEntries: (...args: unknown[]) => mockGetAllEntries(...args),
  createEntry: (...args: unknown[]) => mockCreateEntry(...args),
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

describe('GET /api/entries', () => {
  const createRequest = (query: Record<string, string> = {}): NextApiRequest => ({
    method: 'GET',
    query,
    body: null,
    url: '/api/entries',
  } as NextApiRequest);

  const createResponse = (): NextApiResponse => {
    const res = {} as NextApiResponse;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockEntries = [
    { id: 'entry1', title: 'Entry 1', contentType: 'post' },
    { id: 'entry2', title: 'Entry 2', contentType: 'memory' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAllEntries.mockResolvedValue(mockEntries);
  });

  it('returns list of entries without filter', async () => {
    // Arrange
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockGetAllEntries).toHaveBeenCalledWith(undefined);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockEntries,
    });
  });

  it('filters entries by contentType post', async () => {
    // Arrange
    const req = createRequest({ contentType: 'post' });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockGetAllEntries).toHaveBeenCalledWith('post');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('filters entries by contentType memory', async () => {
    // Arrange
    const req = createRequest({ contentType: 'memory' });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockGetAllEntries).toHaveBeenCalledWith('memory');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('handles empty entries list', async () => {
    // Arrange
    mockGetAllEntries.mockResolvedValue([]);
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [],
    });
  });

  it('handles error from getAllEntries', async () => {
    // Arrange
    const error = new Error('Database error');
    mockGetAllEntries.mockRejectedValue(error);
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

  it('does not require authentication for GET', async () => {
    // Arrange
    mockGetServerSession.mockResolvedValue(null);
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockEntries,
    });
  });
});

describe('POST /api/entries', () => {
  const createRequest = (body: unknown): NextApiRequest => ({
    method: 'POST',
    query: {},
    body,
    url: '/api/entries',
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

  const validEntryData = {
    title: 'Test Entry',
    content: 'Test content',
    contentType: 'post' as const,
    date: '2024-01-15',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue(mockSession);
    mockCreateEntry.mockResolvedValue('created-entry-id');
  });

  it('creates entry successfully', async () => {
    // Arrange
    const req = createRequest(validEntryData);
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockCreateEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Entry',
        content: 'Test content',
        contentType: 'post',
        date: '2024-01-15',
        creatorName: 'Test User',
        createdByDiscordId: 'discord123',
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { id: 'created-entry-id' },
    });
  });

  it('requires authentication', async () => {
    // Arrange
    mockGetServerSession.mockResolvedValue(null);
    const req = createRequest(validEntryData);
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('Authentication required'),
      })
    );
    expect(mockCreateEntry).not.toHaveBeenCalled();
  });

  it('uses custom creatorName if provided', async () => {
    // Arrange
    const req = createRequest({
      ...validEntryData,
      creatorName: 'Custom Creator',
    });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockCreateEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        creatorName: 'Custom Creator',
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('defaults to session user name if creatorName not provided', async () => {
    // Arrange
    const req = createRequest(validEntryData);
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockCreateEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        creatorName: 'Test User',
      })
    );
  });

  it('defaults to Unknown if no user name in session', async () => {
    // Arrange
    mockGetServerSession.mockResolvedValue({
      discordId: 'discord123',
      // No user.name
    });
    const req = createRequest(validEntryData);
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockCreateEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        creatorName: 'Unknown',
      })
    );
  });

  it('uses custom createdByDiscordId if provided', async () => {
    // Arrange
    const req = createRequest({
      ...validEntryData,
      createdByDiscordId: 'custom-discord-id',
    });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockCreateEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        createdByDiscordId: 'custom-discord-id',
      })
    );
  });

  it('defaults to session discordId if createdByDiscordId not provided', async () => {
    // Arrange
    const req = createRequest(validEntryData);
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockCreateEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        createdByDiscordId: 'discord123',
      })
    );
  });

  it('validates required fields', async () => {
    // Arrange
    const req = createRequest({
      // Missing required fields
      title: 'Test Entry',
    });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('required'),
      })
    );
    expect(mockCreateEntry).not.toHaveBeenCalled();
  });

  it('validates contentType enum', async () => {
    // Arrange
    const req = createRequest({
      ...validEntryData,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      contentType: 'invalid' as any,
    });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('contentType'),
      })
    );
    expect(mockCreateEntry).not.toHaveBeenCalled();
  });

  it('accepts contentType post', async () => {
    // Arrange
    const req = createRequest({
      ...validEntryData,
      contentType: 'post',
    });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockCreateEntry).toHaveBeenCalled();
  });

  it('accepts contentType memory', async () => {
    // Arrange
    const req = createRequest({
      ...validEntryData,
      contentType: 'memory',
    });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockCreateEntry).toHaveBeenCalled();
  });

  it('validates title is not empty', async () => {
    // Arrange
    const req = createRequest({
      ...validEntryData,
      title: '',
    });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('title'),
      })
    );
    expect(mockCreateEntry).not.toHaveBeenCalled();
  });

  it('handles error from createEntry', async () => {
    // Arrange
    const error = new Error('Database error');
    mockCreateEntry.mockRejectedValue(error);
    const req = createRequest(validEntryData);
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

  it('rejects PUT method', async () => {
    // Arrange
    const req = {
      method: 'PUT',
      query: {},
      body: validEntryData,
      url: '/api/entries',
    } as NextApiRequest;
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('Method PUT not allowed'),
      })
    );
  });

  it('rejects DELETE method', async () => {
    // Arrange
    const req = {
      method: 'DELETE',
      query: {},
      body: null,
      url: '/api/entries',
    } as NextApiRequest;
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('Method DELETE not allowed'),
      })
    );
  });
});


