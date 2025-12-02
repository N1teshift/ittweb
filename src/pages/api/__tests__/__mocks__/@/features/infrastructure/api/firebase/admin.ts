export const getFirestoreAdmin = jest.fn();
export const isServerSide = jest.fn(() => false);
export const getAdminTimestamp = jest.fn(() => ({
  now: jest.fn(() => ({ toDate: () => new Date('2020-01-01T00:00:00Z') })),
  fromDate: jest.fn((date: Date) => ({ toDate: () => date })),
}));

