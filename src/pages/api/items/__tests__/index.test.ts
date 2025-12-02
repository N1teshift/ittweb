import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../index';

// Mock dependencies
const mockInfo = jest.fn();
const mockError = jest.fn();
const mockWarn = jest.fn();
const mockDebug = jest.fn();

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

// Note: ITEMS_DATA is imported directly, so we test with real data
// The tests verify the filtering logic works correctly

describe('GET /api/items', () => {
  const createRequest = (query: Record<string, string> = {}): NextApiRequest => ({
    method: 'GET',
    query,
    body: null,
    url: '/api/items',
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
  });

  it('returns all items without filters', async () => {
    // Arrange
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    const responseData = (res.json as jest.Mock).mock.calls[0][0].data;
    expect(Array.isArray(responseData.items)).toBe(true);
    expect(responseData.meta.total).toBeGreaterThan(0);
    expect(responseData.meta.count).toBe(responseData.items.length);
  });

  it('filters items by category', async () => {
    // Arrange
    const req = createRequest({ category: 'weapons' });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    const responseData = (res.json as jest.Mock).mock.calls[0][0].data;
    expect(responseData.items.length).toBeGreaterThan(0);
    expect(responseData.items.every((item: { category: string }) => item.category === 'weapons')).toBe(true);
    expect(responseData.meta.category).toBe('weapons');
    expect(responseData.meta.count).toBe(responseData.items.length);
  });

  it('filters items by search query', async () => {
    // Arrange
    const req = createRequest({ q: 'sword' });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    const responseData = (res.json as jest.Mock).mock.calls[0][0].data;
    // If ITEMS_DATA is empty or has no items matching 'sword', the result may be empty
    // So we check that the query parameter is set correctly instead
    expect(responseData.meta.query).toBe('sword');
    // If items are found, verify they match the search
    if (responseData.items.length > 0) {
      expect(responseData.items.some((item: { name: string }) => item.name.toLowerCase().includes('sword'))).toBe(true);
    }
  });

  it('filters items by category and search query together', async () => {
    // Arrange
    const req = createRequest({ category: 'armor', q: 'shield' });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    const responseData = (res.json as jest.Mock).mock.calls[0][0].data;
    expect(responseData.items.length).toBeGreaterThanOrEqual(0);
    if (responseData.items.length > 0) {
      expect(responseData.items.every((item: { category: string }) => item.category === 'armor')).toBe(true);
    }
    expect(responseData.meta.category).toBe('armor');
    expect(responseData.meta.query).toBe('shield');
  });

  it('handles invalid category (returns undefined)', async () => {
    // Arrange
    const req = createRequest({ category: 'invalid-category' });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    const responseData = (res.json as jest.Mock).mock.calls[0][0].data;
    expect(responseData.meta.category).toBeUndefined();
    expect(responseData.items.length).toBeGreaterThan(0); // All items returned
  });

  it('handles empty search query', async () => {
    // Arrange
    const req = createRequest({ q: '' });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    const responseData = (res.json as jest.Mock).mock.calls[0][0].data;
    expect(responseData.meta.query).toBeUndefined();
    expect(responseData.items.length).toBeGreaterThan(0);
  });

  it('normalizes category to lowercase', async () => {
    // Arrange
    const req = createRequest({ category: 'WEAPONS' });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    const responseData = (res.json as jest.Mock).mock.calls[0][0].data;
    expect(responseData.meta.category).toBe('weapons');
  });

  it('does not require authentication', async () => {
    // Arrange
    mockGetServerSession.mockResolvedValue(null);
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('sets cache control headers', async () => {
    // Arrange
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      expect.stringContaining('max-age=3600')
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      expect.stringContaining('public')
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      expect.stringContaining('must-revalidate')
    );
  });

  it('rejects POST method', async () => {
    // Arrange
    const req = {
      method: 'POST',
      query: {},
      body: null,
      url: '/api/items',
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


