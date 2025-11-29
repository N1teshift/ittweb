const mockIsServerSide = jest.fn();
const mockGetFirestoreAdmin = jest.fn();
const mockGetFirestoreInstance = jest.fn();
const mockDoc = jest.fn();
const mockGetDoc = jest.fn();
const mockCollection = jest.fn();
const mockGetDocs = jest.fn();

jest.mock('@/features/infrastructure/utils/serverUtils', () => ({
  isServerSide: (...args: unknown[]) => mockIsServerSide(...args),
}));

jest.mock('@/features/infrastructure/api/firebase/firebaseClient', () => ({
  getFirestoreInstance: (...args: unknown[]) => mockGetFirestoreInstance(...args),
}));

jest.mock('@/features/infrastructure/api/firebase/admin', () => ({
  getFirestoreAdmin: (...args: unknown[]) => mockGetFirestoreAdmin(...args),
}));

jest.mock('firebase/firestore', () => ({
  doc: (...args: unknown[]) => mockDoc(...args),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
  collection: (...args: unknown[]) => mockCollection(...args),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
}));

describe('firestoreHelpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mocks to default state
    mockIsServerSide.mockReturnValue(false);
    mockGetFirestoreAdmin.mockReturnValue({});
    mockGetFirestoreInstance.mockReturnValue({});
    mockDoc.mockReturnValue({});
    mockGetDoc.mockResolvedValue({ exists: () => false });
    mockCollection.mockReturnValue({});
    mockGetDocs.mockResolvedValue({ forEach: jest.fn() });
  });

  describe('withFirestore', () => {
    it('executes server function when on server side', async () => {
      // Arrange
      mockIsServerSide.mockReturnValue(true);
      const mockAdminDb = { collection: jest.fn() };
      mockGetFirestoreAdmin.mockReturnValue(mockAdminDb);
      const serverFn = jest.fn(async () => 'server-result');
      const clientFn = jest.fn();

      // Act
      const { withFirestore } = await import('@/features/infrastructure/api/firebase/firestoreHelpers');
      const result = await withFirestore(serverFn, clientFn);

      // Assert
      expect(result).toBe('server-result');
      expect(serverFn).toHaveBeenCalledWith(mockAdminDb);
      expect(clientFn).not.toHaveBeenCalled();
    });

    it('executes client function when on client side', async () => {
      // Arrange
      mockIsServerSide.mockReturnValue(false);
      const mockClientDb = { collection: jest.fn() };
      mockGetFirestoreInstance.mockReturnValue(mockClientDb);
      const serverFn = jest.fn();
      const clientFn = jest.fn(async () => 'client-result');

      // Act
      const { withFirestore } = await import('@/features/infrastructure/api/firebase/firestoreHelpers');
      const result = await withFirestore(serverFn, clientFn);

      // Assert
      expect(result).toBe('client-result');
      expect(clientFn).toHaveBeenCalledWith(mockClientDb);
      expect(serverFn).not.toHaveBeenCalled();
    });
  });

  describe('getDocument', () => {
    it('gets document using admin SDK on server side', async () => {
      // Arrange
      mockIsServerSide.mockReturnValue(true);
      const mockDocData = {
        exists: true,
        data: () => ({ field: 'value' }),
        id: 'doc-123',
      };
      const mockCollectionObj = {
        doc: jest.fn(() => ({
          get: jest.fn().mockResolvedValue(mockDocData),
        })),
      };
      const mockAdminDb = {
        collection: jest.fn(() => mockCollectionObj),
      };
      mockGetFirestoreAdmin.mockReturnValue(mockAdminDb);

      // Act
      const { getDocument } = await import('@/features/infrastructure/api/firebase/firestoreHelpers');
      const result = await getDocument('test-collection', 'doc-123');

      // Assert
      expect(result).not.toBeNull();
      expect(result?.exists).toBe(true);
      expect(result?.id).toBe('doc-123');
      expect(result?.data()).toEqual({ field: 'value' });
    });

    it('returns null when document does not exist (server side)', async () => {
      // Arrange
      mockIsServerSide.mockReturnValue(true);
      const mockDocData = {
        exists: false,
      };
      const mockCollectionObj = {
        doc: jest.fn(() => ({
          get: jest.fn().mockResolvedValue(mockDocData),
        })),
      };
      const mockAdminDb = {
        collection: jest.fn(() => mockCollectionObj),
      };
      mockGetFirestoreAdmin.mockReturnValue(mockAdminDb);

      // Act
      const { getDocument } = await import('@/features/infrastructure/api/firebase/firestoreHelpers');
      const result = await getDocument('test-collection', 'missing-doc');

      // Assert
      expect(result).toBeNull();
    });

    it('gets document using client SDK on client side', async () => {
      // Arrange
      mockIsServerSide.mockReturnValue(false);
      const mockDocRef = { id: 'doc-123' };
      const mockDocSnap = {
        exists: () => true,
        data: () => ({ field: 'value' }),
        id: 'doc-123',
      };
      mockDoc.mockReturnValue(mockDocRef);
      mockGetDoc.mockResolvedValue(mockDocSnap);
      const mockClientDb = {};
      mockGetFirestoreInstance.mockReturnValue(mockClientDb);

      // Act
      const { getDocument } = await import('@/features/infrastructure/api/firebase/firestoreHelpers');
      const result = await getDocument('test-collection', 'doc-123');

      // Assert
      expect(result).not.toBeNull();
      expect(result?.exists).toBe(true);
      expect(result?.id).toBe('doc-123');
      expect(result?.data()).toEqual({ field: 'value' });
    });

    it('returns null when document does not exist (client side)', async () => {
      // Arrange
      mockIsServerSide.mockReturnValue(false);
      const mockDocRef = { id: 'missing-doc' };
      const mockDocSnap = {
        exists: () => false,
        id: 'missing-doc',
      };
      mockDoc.mockReturnValue(mockDocRef);
      mockGetDoc.mockResolvedValue(mockDocSnap);
      const mockClientDb = {};
      mockGetFirestoreInstance.mockReturnValue(mockClientDb);

      // Act
      const { getDocument } = await import('@/features/infrastructure/api/firebase/firestoreHelpers');
      const result = await getDocument('test-collection', 'missing-doc');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getCollectionSnapshot', () => {
    it('gets collection snapshot using admin SDK on server side', async () => {
      // Arrange
      mockIsServerSide.mockReturnValue(true);
      const mockDocs = [
        { id: 'doc1', data: () => ({ field1: 'value1' }) },
        { id: 'doc2', data: () => ({ field2: 'value2' }) },
      ];
      const mockSnapshot = {
        forEach: (fn: (doc: unknown) => void) => {
          mockDocs.forEach(fn);
        },
      };
      const mockCollectionObj = {
        get: jest.fn().mockResolvedValue(mockSnapshot),
      };
      const mockAdminDb = {
        collection: jest.fn(() => mockCollectionObj),
      };
      mockGetFirestoreAdmin.mockReturnValue(mockAdminDb);

      // Act
      const { getCollectionSnapshot } = await import('@/features/infrastructure/api/firebase/firestoreHelpers');
      const result = await getCollectionSnapshot('test-collection');

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('doc1');
      expect(result[0].data()).toEqual({ field1: 'value1' });
      expect(result[1].id).toBe('doc2');
      expect(result[1].data()).toEqual({ field2: 'value2' });
    });

    it('returns empty array for empty collection (server side)', async () => {
      // Arrange
      mockIsServerSide.mockReturnValue(true);
      const mockSnapshot = {
        forEach: jest.fn(),
      };
      const mockCollectionObj = {
        get: jest.fn().mockResolvedValue(mockSnapshot),
      };
      const mockAdminDb = {
        collection: jest.fn(() => mockCollectionObj),
      };
      mockGetFirestoreAdmin.mockReturnValue(mockAdminDb);

      // Act
      const { getCollectionSnapshot } = await import('@/features/infrastructure/api/firebase/firestoreHelpers');
      const result = await getCollectionSnapshot('empty-collection');

      // Assert
      expect(result).toEqual([]);
    });

    it('gets collection snapshot using client SDK on client side', async () => {
      // Arrange
      mockIsServerSide.mockReturnValue(false);
      const mockDocs = [
        { id: 'doc1', data: () => ({ field1: 'value1' }) },
        { id: 'doc2', data: () => ({ field2: 'value2' }) },
      ];
      const mockCollectionRef = {};
      const mockSnapshot = {
        forEach: (fn: (doc: unknown) => void) => mockDocs.forEach(fn),
      };
      mockCollection.mockReturnValue(mockCollectionRef);
      mockGetDocs.mockResolvedValue(mockSnapshot);
      const mockClientDb = {};
      mockGetFirestoreInstance.mockReturnValue(mockClientDb);

      // Act
      const { getCollectionSnapshot } = await import('@/features/infrastructure/api/firebase/firestoreHelpers');
      const result = await getCollectionSnapshot('test-collection');

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('doc1');
      expect(result[0].data()).toEqual({ field1: 'value1' });
      expect(result[1].id).toBe('doc2');
      expect(result[1].data()).toEqual({ field2: 'value2' });
    });

    it('returns empty array for empty collection (client side)', async () => {
      // Arrange
      mockIsServerSide.mockReturnValue(false);
      const mockCollectionRef = {};
      const mockSnapshot = {
        forEach: jest.fn(),
      };
      mockCollection.mockReturnValue(mockCollectionRef);
      mockGetDocs.mockResolvedValue(mockSnapshot);
      const mockClientDb = {};
      mockGetFirestoreInstance.mockReturnValue(mockClientDb);

      // Act
      const { getCollectionSnapshot } = await import('@/features/infrastructure/api/firebase/firestoreHelpers');
      const result = await getCollectionSnapshot('empty-collection');

      // Assert
      expect(result).toEqual([]);
    });
  });
});

