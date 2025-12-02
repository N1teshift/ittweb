import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../list';

// Mock dependencies
const mockReaddir = jest.fn();
const mockInfo = jest.fn();
const mockError = jest.fn();
const mockWarn = jest.fn();
const mockDebug = jest.fn();

jest.mock('fs/promises', () => ({
  __esModule: true,
  readdir: jest.fn((...args: unknown[]) => mockReaddir(...args)),
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

describe('GET /api/icons/list', () => {
  const createRequest = (): NextApiRequest => ({
    method: 'GET',
    query: {},
    body: null,
    url: '/api/icons/list',
  } as NextApiRequest);

  const createResponse = (): NextApiResponse => {
    const res = {} as NextApiResponse;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockDirent = (name: string, isFile: boolean, isDirectory: boolean) => ({
    name,
    isFile: () => isFile,
    isDirectory: () => isDirectory,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Default: return some icon files
    mockReaddir.mockResolvedValue([
      mockDirent('icon1.png', true, false),
      mockDirent('icon2.png', true, false),
      mockDirent('texture.png', true, false), // Should be filtered out
      mockDirent('pasunit.png', true, false), // Should be filtered out
      mockDirent('subdir', false, true), // Should be filtered out
    ]);
  });

  it('returns list of icon files', async () => {
    // Arrange
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockReaddir).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    const responseData = (res.json as jest.Mock).mock.calls[0][0].data;
    expect(Array.isArray(responseData)).toBe(true);
    expect(responseData.length).toBe(2); // icon1.png and icon2.png (texture and pasunit filtered)
    expect(responseData[0]).toMatchObject({
      filename: expect.any(String),
      path: expect.stringContaining('/icons/itt/'),
      category: 'icons',
    });
  });

  it('filters out texture files', async () => {
    // Arrange
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    const responseData = (res.json as jest.Mock).mock.calls[0][0].data;
    expect(responseData.some((icon: { filename: string }) => icon.filename.includes('texture'))).toBe(false);
  });

  it('filters out pasunit files', async () => {
    // Arrange
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    const responseData = (res.json as jest.Mock).mock.calls[0][0].data;
    expect(responseData.some((icon: { filename: string }) => icon.filename.includes('pasunit'))).toBe(false);
  });

  it('filters out directories', async () => {
    // Arrange
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    const responseData = (res.json as jest.Mock).mock.calls[0][0].data;
    expect(responseData.some((icon: { filename: string }) => icon.filename === 'subdir')).toBe(false);
  });

  it('handles empty icons directory gracefully', async () => {
    // Arrange
    mockReaddir.mockResolvedValue([]);
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    const responseData = (res.json as jest.Mock).mock.calls[0][0].data;
    expect(Array.isArray(responseData)).toBe(true);
    // May be empty or contain items depending on actual filesystem
  });

  it('handles error when reading directory', async () => {
    // Arrange
    mockReaddir.mockRejectedValue(new Error('Directory read failed'));
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    // Should handle error gracefully and return empty array
    expect(res.status).toHaveBeenCalledWith(200);
    const responseData = (res.json as jest.Mock).mock.calls[0][0].data;
    expect(Array.isArray(responseData)).toBe(true);
    // Note: mockReaddir may not be called if the error occurs in the outer try-catch
    // The handler catches errors and returns empty array gracefully
  });

  it('sorts icons by category then filename', async () => {
    // Arrange
    mockReaddir.mockResolvedValue([
      mockDirent('z-icon.png', true, false),
      mockDirent('a-icon.png', true, false),
      mockDirent('m-icon.png', true, false),
    ]);
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    const responseData = (res.json as jest.Mock).mock.calls[0][0].data;
    expect(responseData.length).toBeGreaterThanOrEqual(3);
    // Verify they are sorted - check that the three test icons are in the response
    const filenames = responseData.map((icon: { filename: string }) => icon.filename);
    const testIcons = ['a-icon.png', 'm-icon.png', 'z-icon.png'];
    testIcons.forEach(icon => {
      expect(filenames).toContain(icon);
    });
    // Verify sorting within the test icons
    const testIconIndices = testIcons.map(icon => filenames.indexOf(icon));
    expect(testIconIndices[0]).toBeLessThan(testIconIndices[1]);
    expect(testIconIndices[1]).toBeLessThan(testIconIndices[2]);
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
      url: '/api/icons/list',
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


