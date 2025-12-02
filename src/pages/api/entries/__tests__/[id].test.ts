import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../[id]';

// Mock dependencies
const mockGetEntryById = jest.fn();
const mockUpdateEntry = jest.fn();
const mockDeleteEntry = jest.fn();
const mockInfo = jest.fn();
const mockError = jest.fn();
const mockWarn = jest.fn();
const mockDebug = jest.fn();

jest.mock('@/features/modules/game-management/entries/lib/entryService', () => ({
  getEntryById: (...args: unknown[]) => mockGetEntryById(...args),
  updateEntry: (...args: unknown[]) => mockUpdateEntry(...args),
  deleteEntry: (...args: unknown[]) => mockDeleteEntry(...args),
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

describe('GET /api/entries/[id]', () => {
  const createRequest = (id: string): NextApiRequest => ({
    method: 'GET',
    query: { id },
    body: null,
    url: `/api/entries/${id}`,
  } as NextApiRequest);

  const createResponse = (): NextApiResponse => {
    const res = {} as NextApiResponse;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockEntry = {
    id: 'entry-123',
    title: 'Test Entry',
    content: 'Test content',
    contentType: 'post' as const,
    date: '2024-01-15',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetEntryById.mockResolvedValue(mockEntry);
  });

  it('returns entry by ID', async () => {
    // Arrange
    const req = createRequest('entry-123');
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockGetEntryById).toHaveBeenCalledWith('entry-123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockEntry,
    });
  });

  it('returns 500 when entry not found', async () => {
    // Arrange
    mockGetEntryById.mockResolvedValue(null);
    const req = createRequest('non-existent');
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Entry not found',
      })
    );
  });

  it('handles error when ID is missing', async () => {
    // Arrange
    const req = {
      method: 'GET',
      query: {}, // No id
      body: null,
      url: '/api/entries/',
    } as NextApiRequest;
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Entry ID is required',
      })
    );
    expect(mockGetEntryById).not.toHaveBeenCalled();
  });

  it('does not require authentication', async () => {
    // Arrange
    mockGetServerSession.mockResolvedValue(null);
    const req = createRequest('entry-123');
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockEntry,
    });
  });

  it('handles error from getEntryById', async () => {
    // Arrange
    const error = new Error('Database error');
    mockGetEntryById.mockRejectedValue(error);
    const req = createRequest('entry-123');
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

describe('PUT /api/entries/[id]', () => {
  const createRequest = (id: string, body: unknown): NextApiRequest => ({
    method: 'PUT',
    query: { id },
    body,
    url: `/api/entries/${id}`,
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
    mockGetServerSession.mockResolvedValue(mockSession);
    mockUpdateEntry.mockResolvedValue(undefined);
  });

  it('updates entry successfully', async () => {
    // Arrange
    const updates = { title: 'Updated Title' };
    const req = createRequest('entry-123', updates);
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockUpdateEntry).toHaveBeenCalledWith('entry-123', updates);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { success: true },
    });
  });

  it('requires authentication', async () => {
    // Arrange
    mockGetServerSession.mockResolvedValue(null);
    const req = createRequest('entry-123', { title: 'Updated Title' });
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
    expect(mockUpdateEntry).not.toHaveBeenCalled();
  });

  it('handles error from updateEntry', async () => {
    // Arrange
    const error = new Error('Database error');
    mockUpdateEntry.mockRejectedValue(error);
    const req = createRequest('entry-123', { title: 'Updated Title' });
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

describe('PATCH /api/entries/[id]', () => {
  const createRequest = (id: string, body: unknown): NextApiRequest => ({
    method: 'PATCH',
    query: { id },
    body,
    url: `/api/entries/${id}`,
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
    mockGetServerSession.mockResolvedValue(mockSession);
    mockUpdateEntry.mockResolvedValue(undefined);
  });

  it('updates entry successfully (same as PUT)', async () => {
    // Arrange
    const updates = { title: 'Updated Title' };
    const req = createRequest('entry-123', updates);
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockUpdateEntry).toHaveBeenCalledWith('entry-123', updates);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { success: true },
    });
  });
});

describe('DELETE /api/entries/[id]', () => {
  const createRequest = (id: string): NextApiRequest => ({
    method: 'DELETE',
    query: { id },
    body: null,
    url: `/api/entries/${id}`,
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
    mockGetServerSession.mockResolvedValue(mockSession);
    mockDeleteEntry.mockResolvedValue(undefined);
  });

  it('deletes entry successfully', async () => {
    // Arrange
    const req = createRequest('entry-123');
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockDeleteEntry).toHaveBeenCalledWith('entry-123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { success: true },
    });
  });

  it('requires authentication', async () => {
    // Arrange
    mockGetServerSession.mockResolvedValue(null);
    const req = createRequest('entry-123');
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
    expect(mockDeleteEntry).not.toHaveBeenCalled();
  });

  it('handles error from deleteEntry', async () => {
    // Arrange
    const error = new Error('Database error');
    mockDeleteEntry.mockRejectedValue(error);
    const req = createRequest('entry-123');
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

describe('Method validation', () => {
  const createResponse = (): NextApiResponse => {
    const res = {} as NextApiResponse;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    return res;
  };

  it('rejects POST method', async () => {
    // Arrange
    const req = {
      method: 'POST',
      query: { id: 'entry-123' },
      body: null,
      url: '/api/entries/entry-123',
    } as NextApiRequest;
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('Method POST not allowed'),
      })
    );
  });
});

