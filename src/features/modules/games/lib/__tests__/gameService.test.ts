jest.mock('firebase/firestore', () => {
  const mockGetDoc = jest.fn();
  const mockGetDocs = jest.fn();
  return {
    mockGetDoc,
    mockGetDocs,
    getDoc: (...args: unknown[]) => mockGetDoc(...args),
    getDocs: (...args: unknown[]) => mockGetDocs(...args),
    collection: jest.fn(),
    doc: jest.fn(),
    addDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    query: jest.fn(),
    orderBy: jest.fn(),
    where: jest.fn(),
    limit: jest.fn(),
    Timestamp: {
      now: jest.fn(() => ({ toDate: () => new Date('2020-01-01T00:00:00Z') })),
      fromDate: jest.fn((date: Date) => ({ toDate: () => date })),
    },
  };
});

jest.mock('@/features/infrastructure/api/firebase', () => ({
  getFirestoreInstance: jest.fn(() => ({})),
}));

const mockIsServerSide = jest.fn(() => false);

jest.mock('@/features/infrastructure/api/firebase/admin', () => ({
  getFirestoreAdmin: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        collection: jest.fn(() => ({ get: jest.fn() })),
      })),
    })),
  })),
  isServerSide: mockIsServerSide,
  getAdminTimestamp: jest.fn(() => ({
    now: jest.fn(() => ({ toDate: () => new Date('2020-01-01T00:00:00Z') })),
    fromDate: jest.fn((date: Date) => ({ toDate: () => date })),
  })),
}));

jest.mock('@/features/infrastructure/logging', () => ({
  createComponentLogger: jest.fn(() => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() })),
  logError: jest.fn(),
}));

const { mockGetDoc, mockGetDocs } = jest.requireMock('firebase/firestore');
import { isServerSide } from '@/features/infrastructure/api/firebase/admin';
import * as gameService from '../gameService';

describe('gameService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const mockFn = isServerSide as unknown as jest.Mock | undefined;
    mockFn?.mockReturnValue?.(false);
  });

  describe('createCompletedGame', () => {
    it('throws when required fields are missing', async () => {
      await expect(gameService.createCompletedGame({
        gameId: undefined as unknown as number,
        datetime: undefined as unknown as string,
        players: [],
        duration: 0,
        gamename: 'Test',
        map: 'Map',
        creatorName: 'Creator',
        ownername: 'Owner',
      })).rejects.toThrow('Invalid game data');
    });
  });

  describe('getGameById', () => {
    it('returns null when the game does not exist', async () => {
      mockGetDoc.mockResolvedValue({ exists: () => false });
      mockGetDocs.mockResolvedValue({ empty: true, docs: [], forEach: () => undefined });

      const game = await gameService.getGameById('missing');
      expect(game).toBeNull();
    });
  });
});
