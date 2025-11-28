export const mockAddDoc = jest.fn();
export const mockGetDoc = jest.fn();
export const mockGetDocs = jest.fn();
export const mockUpdateDoc = jest.fn();
export const mockDeleteDoc = jest.fn();
export const mockSetDoc = jest.fn();
export const mockCollection = jest.fn();
export const mockDoc = jest.fn();
export const mockQuery = jest.fn();
export const mockOrderBy = jest.fn();
export const mockWhere = jest.fn();
export const mockLimit = jest.fn();

export const Timestamp = {
  now: jest.fn(() => ({ toDate: () => new Date('2020-01-01T00:00:00Z') })),
  fromDate: jest.fn((date: Date) => ({ toDate: () => date })),
};

export const collection = (...args: unknown[]) => mockCollection(...args);
export const addDoc = (...args: unknown[]) => mockAddDoc(...args);
export const getDocs = (...args: unknown[]) => mockGetDocs(...args);
export const getDoc = (...args: unknown[]) => mockGetDoc(...args);
export const updateDoc = (...args: unknown[]) => mockUpdateDoc(...args);
export const deleteDoc = (...args: unknown[]) => mockDeleteDoc(...args);
export const setDoc = (...args: unknown[]) => mockSetDoc(...args);
export const doc = (...args: unknown[]) => mockDoc(...args);
export const query = (...args: unknown[]) => mockQuery(...args);
export const orderBy = (...args: unknown[]) => mockOrderBy(...args);
export const where = (...args: unknown[]) => mockWhere(...args);
export const limit = (...args: unknown[]) => mockLimit(...args);
export const serverTimestamp = jest.fn(() => new Date('2020-01-01T00:00:00Z'));
