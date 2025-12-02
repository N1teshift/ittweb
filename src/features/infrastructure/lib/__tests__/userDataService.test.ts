jest.mock('firebase/firestore', () => {
  const mockGetDoc = jest.fn();
  return {
    mockGetDoc,
    getDoc: (...args: unknown[]) => mockGetDoc(...args),
    collection: jest.fn(),
    doc: jest.fn(),
    addDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    setDoc: jest.fn(),
    query: jest.fn(),
    orderBy: jest.fn(),
    where: jest.fn(),
    limit: jest.fn(),
    serverTimestamp: jest.fn(() => new Date('2020-01-01T00:00:00Z')),
    Timestamp: {
      now: jest.fn(() => ({ toDate: () => new Date('2020-01-01T00:00:00Z') })),
      fromDate: jest.fn((date: Date) => ({ toDate: () => date })),
    },
  };
});

jest.mock('@/features/infrastructure/api/firebase', () => ({
  getFirestoreInstance: jest.fn(() => ({})),
}));

jest.mock('@/features/infrastructure/api/firebase/admin', () => ({
  getFirestoreAdmin: jest.fn(() => ({ collection: jest.fn() })),
  isServerSide: jest.fn(() => false),
  getAdminTimestamp: jest.fn(() => ({
    now: jest.fn(() => ({ toDate: () => new Date('2020-01-01T00:00:00Z') })),
    fromDate: jest.fn((date: Date) => ({ toDate: () => date })),
  })),
}));

jest.mock('@/features/infrastructure/logging', () => ({
  createComponentLogger: jest.fn(() => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() })),
  logError: jest.fn(),
}));

const { mockGetDoc } = jest.requireMock('firebase/firestore');
import { getUserDataByDiscordId } from '../userDataService';

describe('userDataService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when user data is not found', async () => {
    mockGetDoc.mockResolvedValue({ exists: () => false });

    const result = await getUserDataByDiscordId('unknown');
    expect(result).toBeNull();
  });
});


