import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../index';

// Mock dependencies
const mockGetAllPosts = jest.fn();
const mockCreatePost = jest.fn();
const mockInfo = jest.fn();
const mockError = jest.fn();
const mockWarn = jest.fn();
const mockDebug = jest.fn();

jest.mock('@/features/modules/content/blog/lib/postService', () => ({
  getAllPosts: (...args: unknown[]) => mockGetAllPosts(...args),
  createPost: (...args: unknown[]) => mockCreatePost(...args),
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

describe('GET /api/posts', () => {
  const createRequest = (query: Record<string, string> = {}): NextApiRequest => ({
    method: 'GET',
    query,
    body: null,
    url: '/api/posts',
  } as NextApiRequest);

  const createResponse = (): NextApiResponse => {
    const res = {} as NextApiResponse;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockPosts = [
    { id: 'post1', title: 'Post 1', slug: 'post-1', published: true },
    { id: 'post2', title: 'Post 2', slug: 'post-2', published: true },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAllPosts.mockResolvedValue(mockPosts);
  });

  it('returns list of published posts by default', async () => {
    // Arrange
    const req = createRequest();
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockGetAllPosts).toHaveBeenCalledWith(false);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockPosts,
    });
  });

  it('includes unpublished posts when includeUnpublished is true', async () => {
    // Arrange
    const req = createRequest({ includeUnpublished: 'true' });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockGetAllPosts).toHaveBeenCalledWith(true);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('excludes unpublished posts when includeUnpublished is false', async () => {
    // Arrange
    const req = createRequest({ includeUnpublished: 'false' });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockGetAllPosts).toHaveBeenCalledWith(false);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('handles empty posts list', async () => {
    // Arrange
    mockGetAllPosts.mockResolvedValue([]);
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

  it('handles error from getAllPosts', async () => {
    // Arrange
    const error = new Error('Database error');
    mockGetAllPosts.mockRejectedValue(error);
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
      data: mockPosts,
    });
  });
});

describe('POST /api/posts', () => {
  const createRequest = (body: unknown): NextApiRequest => ({
    method: 'POST',
    query: {},
    body,
    url: '/api/posts',
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

  const validPostData = {
    title: 'Test Post',
    content: 'Test content',
    slug: 'test-post',
    date: '2024-01-15',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue(mockSession);
    mockCreatePost.mockResolvedValue('created-post-id');
  });

  it('creates post successfully', async () => {
    // Arrange
    const req = createRequest(validPostData);
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockCreatePost).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Post',
        content: 'Test content',
        slug: 'test-post',
        date: '2024-01-15',
        creatorName: 'Test User',
        createdByDiscordId: 'discord123',
        published: true,
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { id: 'created-post-id' },
    });
  });

  it('requires authentication', async () => {
    // Arrange
    mockGetServerSession.mockResolvedValue(null);
    const req = createRequest(validPostData);
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    // createGetPostHandler wraps errors in 500 status
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('Authentication required'),
      })
    );
    expect(mockCreatePost).not.toHaveBeenCalled();
  });

  it('uses custom creatorName if provided', async () => {
    // Arrange
    const req = createRequest({
      ...validPostData,
      creatorName: 'Custom Creator',
    });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockCreatePost).toHaveBeenCalledWith(
      expect.objectContaining({
        creatorName: 'Custom Creator',
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('defaults to session user name if creatorName not provided', async () => {
    // Arrange
    const req = createRequest(validPostData);
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockCreatePost).toHaveBeenCalledWith(
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
    const req = createRequest(validPostData);
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockCreatePost).toHaveBeenCalledWith(
      expect.objectContaining({
        creatorName: 'Unknown',
      })
    );
  });

  it('defaults published to true if not provided', async () => {
    // Arrange
    const req = createRequest(validPostData);
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockCreatePost).toHaveBeenCalledWith(
      expect.objectContaining({
        published: true,
      })
    );
  });

  it('respects published field when provided', async () => {
    // Arrange
    const req = createRequest({
      ...validPostData,
      published: false,
    });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(mockCreatePost).toHaveBeenCalledWith(
      expect.objectContaining({
        published: false,
      })
    );
  });

  it('validates required fields', async () => {
    // Arrange
    const req = createRequest({
      // Missing required fields
      title: 'Test Post',
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
    expect(mockCreatePost).not.toHaveBeenCalled();
  });

  it('validates title is not empty', async () => {
    // Arrange
    const req = createRequest({
      ...validPostData,
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
    expect(mockCreatePost).not.toHaveBeenCalled();
  });

  it('validates slug is not empty', async () => {
    // Arrange
    const req = createRequest({
      ...validPostData,
      slug: '',
    });
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('slug'),
      })
    );
    expect(mockCreatePost).not.toHaveBeenCalled();
  });

  it('handles error from createPost', async () => {
    // Arrange
    const error = new Error('Database error');
    mockCreatePost.mockRejectedValue(error);
    const req = createRequest(validPostData);
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
      body: validPostData,
      url: '/api/posts',
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
      url: '/api/posts',
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


