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

const mockIsServerSide = jest.fn(() => false);

jest.mock('@/features/infrastructure/api/firebase', () => ({
  getFirestoreInstance: jest.fn(() => ({})),
}));

jest.mock('@/features/infrastructure/api/firebase/admin', () => ({
  getFirestoreAdmin: jest.fn(() => ({ collection: jest.fn() })),
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

const { mockGetDoc } = jest.requireMock('firebase/firestore');
const { isServerSide } = jest.requireMock('@/features/infrastructure/api/firebase/admin');
import { getEntryById } from '../entryService';

describe('entryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (isServerSide as jest.Mock).mockReturnValue(false);
  });

  it('returns null when entry is not found', async () => {
    mockGetDoc.mockResolvedValue({ exists: () => false });

    const entry = await getEntryById('missing');
    expect(entry).toBeNull();
  });
});

