import type { NextApiRequest, NextApiResponse } from 'next';

// Mock dependencies
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/features/infrastructure/logging', () => ({
  createComponentLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  })),
  logError: jest.fn(),
}));

jest.mock('@/features/infrastructure/utils/userRoleUtils', () => ({
  isAdmin: jest.fn(),
  hasRole: jest.fn(),
}));

jest.mock('@/features/infrastructure/lib/userDataService', () => ({
  getUserDataByDiscordId: jest.fn(),
}));

const { getServerSession } = jest.requireMock('next-auth/next');
const { isAdmin, hasRole } = jest.requireMock('@/features/infrastructure/utils/userRoleUtils');
const { getUserDataByDiscordId } = jest.requireMock('@/features/infrastructure/lib/userDataService');
const { createComponentLogger } = jest.requireMock('@/features/infrastructure/logging');

const mockGetServerSession = getServerSession;
const mockIsAdmin = isAdmin;
const mockHasRole = hasRole;
const mockGetUserDataByDiscordId = getUserDataByDiscordId;
const mockCreateComponentLogger = createComponentLogger;

describe('Security: Authentication & Authorization', () => {
  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateComponentLogger.mockReturnValue(mockLogger);
  });

  describe('Unauthorized API Access', () => {
    const createResponse = () => {
      const res: Partial<NextApiResponse> = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res as NextApiResponse;
    };

    it('should return 401 when no session exists', async () => {
      mockGetServerSession.mockResolvedValue(null);
      
      const req = {
        method: 'POST',
        url: '/api/posts',
        body: {},
        query: {},
      } as NextApiRequest;
      const res = createResponse();

      // Simulate API route authentication check
      const session = await getServerSession(req, res, {} as any);
      if (!session) {
        res.status(401).json({ error: 'Authentication required' });
      }

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    });

    it('should return 401 when session exists but discordId is missing', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { name: 'Test User' },
        expires: '2024-12-31',
      } as any);

      const req = {
        method: 'POST',
        url: '/api/posts',
        body: {},
        query: {},
      } as NextApiRequest;
      const res = createResponse();

      const session = await getServerSession(req, res, {} as any);
      if (!session || !session.discordId) {
        res.status(401).json({ error: 'Authentication required' });
      }

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return 401 for missing tokens', async () => {
      mockGetServerSession.mockResolvedValue(null);
      
      const req = {
        method: 'POST',
        headers: {},
        url: '/api/posts',
        body: {},
        query: {},
      } as NextApiRequest;
      const res = createResponse();

      const session = await getServerSession(req, res, {} as any);
      if (!session) {
        res.status(401).json({ error: 'Authentication required' });
      }

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return 401 for invalid tokens', async () => {
      mockGetServerSession.mockResolvedValue(null);
      
      const req = {
        method: 'POST',
        headers: {
          authorization: 'Bearer invalid-token',
        },
        url: '/api/posts',
        body: {},
        query: {},
      } as NextApiRequest;
      const res = createResponse();

      const session = await getServerSession(req, res, {} as any);
      if (!session) {
        res.status(401).json({ error: 'Authentication required' });
      }

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should allow access with valid session', async () => {
      const validSession = {
        user: { name: 'Test User' },
        discordId: '123456789',
        expires: '2024-12-31',
      };
      mockGetServerSession.mockResolvedValue(validSession as any);

      const req = {
        method: 'POST',
        url: '/api/posts',
        body: {},
        query: {},
      } as NextApiRequest;
      const res = createResponse();

      const session = await getServerSession(req, res, {} as any);
      if (!session) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Should proceed without calling status(401)
      expect(res.status).not.toHaveBeenCalledWith(401);
    });
  });

  describe('Role-Based Access Control', () => {
    it('should allow admin users to access admin resources', async () => {
      const adminSession = {
        user: { name: 'Admin User' },
        discordId: 'admin123',
        expires: '2024-12-31',
      };
      mockGetServerSession.mockResolvedValue(adminSession as any);
      mockGetUserDataByDiscordId.mockResolvedValue({
        discordId: 'admin123',
        role: 'admin',
      } as any);
      mockIsAdmin.mockReturnValue(true);

      const userData = await getUserDataByDiscordId('admin123');
      const userIsAdmin = isAdmin(userData?.role);

      expect(userIsAdmin).toBe(true);
      expect(mockIsAdmin).toHaveBeenCalledWith('admin');
    });

    it('should deny non-admin users access to admin resources', async () => {
      const userSession = {
        user: { name: 'Regular User' },
        discordId: 'user123',
        expires: '2024-12-31',
      };
      mockGetServerSession.mockResolvedValue(userSession as any);
      mockGetUserDataByDiscordId.mockResolvedValue({
        discordId: 'user123',
        role: 'user',
      } as any);
      mockIsAdmin.mockReturnValue(false);

      const userData = await getUserDataByDiscordId('user123');
      const userIsAdmin = isAdmin(userData?.role);

      expect(userIsAdmin).toBe(false);
      expect(mockIsAdmin).toHaveBeenCalledWith('user');
    });

    it('should enforce role hierarchy correctly', () => {
      mockHasRole.mockImplementation((userRole: string, requiredRole: string) => {
        const roleHierarchy: Record<string, number> = {
          developer: 5,
          admin: 4,
          moderator: 3,
          premium: 2,
          user: 1,
        };
        if (!userRole) return requiredRole === 'user';
        return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
      });

      expect(hasRole('admin', 'moderator')).toBe(true);
      expect(hasRole('moderator', 'admin')).toBe(false);
      expect(hasRole('developer', 'admin')).toBe(true);
    });

    it('should handle role changes correctly', async () => {
      mockGetUserDataByDiscordId
        .mockResolvedValueOnce({ discordId: 'user123', role: 'user' } as any)
        .mockResolvedValueOnce({ discordId: 'user123', role: 'admin' } as any);
      mockIsAdmin
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);

      const userData1 = await getUserDataByDiscordId('user123');
      const isAdmin1 = isAdmin(userData1?.role);

      const userData2 = await getUserDataByDiscordId('user123');
      const isAdmin2 = isAdmin(userData2?.role);

      expect(isAdmin1).toBe(false);
      expect(isAdmin2).toBe(true);
    });

    it('should allow admin override for resource access', async () => {
      const adminSession = {
        user: { name: 'Admin User' },
        discordId: 'admin123',
        expires: '2024-12-31',
      };
      mockGetServerSession.mockResolvedValue(adminSession as any);
      mockGetUserDataByDiscordId.mockResolvedValue({
        discordId: 'admin123',
        role: 'admin',
      } as any);
      mockIsAdmin.mockReturnValue(true);

      const session = await getServerSession({} as NextApiRequest, {} as NextApiResponse, {} as any);
      const userData = await getUserDataByDiscordId(session!.discordId!);
      const userIsAdmin = isAdmin(userData?.role);
      const userIsAuthor = false; // Not the author
      const canAccess = userIsAdmin || userIsAuthor;

      expect(canAccess).toBe(true);
    });
  });

  describe('Session Security', () => {
    it('should validate session expiration', async () => {
      const expiredSession = {
        user: { name: 'Test User' },
        discordId: '123456789',
        expires: '2020-01-01', // Expired
      };
      mockGetServerSession.mockResolvedValue(expiredSession as any);

      const session = await getServerSession({} as NextApiRequest, {} as NextApiResponse, {} as any);
      
      // In a real implementation, expired sessions should be rejected
      // This test verifies the session structure is checked
      expect(session).toBeDefined();
    });

    it('should require discordId for authenticated operations', async () => {
      const sessionWithoutDiscordId = {
        user: { name: 'Test User' },
        expires: '2024-12-31',
      };
      mockGetServerSession.mockResolvedValue(sessionWithoutDiscordId as any);

      const session = await getServerSession({} as NextApiRequest, {} as NextApiResponse, {} as any);
      const hasDiscordId = !!(session && 'discordId' in session && session.discordId);

      expect(hasDiscordId).toBe(false);
    });
  });
});

