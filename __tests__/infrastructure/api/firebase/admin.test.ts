import type { App } from 'firebase-admin/app';

type Firestore = { __brand: 'firestore' };
type Storage = { __brand: 'storage' };

const mockInitializeApp = jest.fn<App, any>();
const mockGetApps = jest.fn<ReturnType<typeof Array>, any>();
const mockCert = jest.fn();
const mockGetFirestore = jest.fn<Firestore, any>();
const mockGetStorage = jest.fn<Storage, any>();

jest.mock('firebase-admin/app', () => ({
  initializeApp: (...args: any[]) => mockInitializeApp(...args),
  getApps: (...args: any[]) => mockGetApps(...args),
  cert: (...args: any[]) => mockCert(...args)
}));

jest.mock('firebase-admin/firestore', () => ({
  getFirestore: (...args: any[]) => mockGetFirestore(...args),
  Timestamp: { now: jest.fn() }
}));

jest.mock('firebase-admin/storage', () => ({
  getStorage: (...args: any[]) => mockGetStorage(...args)
}));

describe('firebase admin', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  const importModule = async () =>
    import('@/features/infrastructure/api/firebase/admin');

  it('returns existing initialized app when available', async () => {
    const existingApp = { name: 'existing' } as unknown as App;
    mockGetApps.mockReturnValue([existingApp]);

    const { initializeFirebaseAdmin } = await importModule();
    const app = initializeFirebaseAdmin();

    expect(app).toBe(existingApp);
    expect(mockInitializeApp).not.toHaveBeenCalled();
  });

  it('initializes with service account credentials when provided', async () => {
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY = JSON.stringify({ project_id: 'pid' });
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'pid';
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'custom-bucket';
    mockCert.mockReturnValue('cert');
    mockGetApps.mockReturnValue([]);
    const initializedApp = { name: 'admin-app' } as unknown as App;
    mockInitializeApp.mockReturnValue(initializedApp);

    const { initializeFirebaseAdmin } = await importModule();
    const app = initializeFirebaseAdmin();

    expect(mockInitializeApp).toHaveBeenCalledWith({
      credential: 'cert',
      projectId: 'pid',
      storageBucket: 'custom-bucket'
    });
    expect(mockCert).toHaveBeenCalledWith({ project_id: 'pid' });
    expect(app).toBe(initializedApp);
  });

  it('falls back to application default credentials when no service account is present', async () => {
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'pid';
    mockGetApps.mockReturnValue([]);
    const initializedApp = { name: 'default-app' } as unknown as App;
    mockInitializeApp.mockReturnValue(initializedApp);

    const { initializeFirebaseAdmin } = await importModule();
    const app = initializeFirebaseAdmin();

    expect(mockInitializeApp).toHaveBeenCalledWith({
      projectId: 'pid',
      storageBucket: 'pid.appspot.com'
    });
    expect(app).toBe(initializedApp);
  });

  it('throws a descriptive error when initialization fails', async () => {
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'pid';
    mockGetApps.mockReturnValue([]);
    mockInitializeApp.mockImplementation(() => {
      throw new Error('boom');
    });

    const { initializeFirebaseAdmin } = await importModule();

    expect(() => initializeFirebaseAdmin()).toThrow(
      'Firebase Admin initialization failed: boom. Please set FIREBASE_SERVICE_ACCOUNT_KEY or use Application Default Credentials.'
    );
  });

  it('returns singleton firestore admin instance', async () => {
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'pid';
    mockGetApps.mockReturnValue([]);
    mockInitializeApp.mockReturnValue({} as App);
    const firestoreInstance = { brand: 'firestore' } as unknown as Firestore;
    mockGetFirestore.mockReturnValue(firestoreInstance);

    const { getFirestoreAdmin } = await importModule();

    const first = getFirestoreAdmin();
    const second = getFirestoreAdmin();

    expect(first).toBe(firestoreInstance);
    expect(second).toBe(firestoreInstance);
    expect(mockGetFirestore).toHaveBeenCalledTimes(1);
  });

  it('returns singleton storage admin instance', async () => {
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'pid';
    mockGetApps.mockReturnValue([]);
    mockInitializeApp.mockReturnValue({} as App);
    const storageInstance = { brand: 'storage' } as unknown as Storage;
    mockGetStorage.mockReturnValue(storageInstance);

    const { getStorageAdmin } = await importModule();

    const first = getStorageAdmin();
    const second = getStorageAdmin();

    expect(first).toBe(storageInstance);
    expect(second).toBe(storageInstance);
    expect(mockGetStorage).toHaveBeenCalledTimes(1);
  });

  it('computes storage bucket name from environment or project id', async () => {
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'pid';
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'custom';

    const { getStorageBucketName } = await importModule();
    expect(getStorageBucketName()).toBe('custom');

    delete process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    jest.resetModules();
    const { getStorageBucketName: getBucket } = await importModule();
    expect(getBucket()).toBe('pid.appspot.com');
  });

  it('detects server side environment', async () => {
    const { isServerSide } = await importModule();

    // In Jest/Node environment, window should be undefined, so should return true
    // But if window is defined in the test environment, it will return false
    const result = isServerSide();
    expect(typeof result).toBe('boolean');
    // The actual value depends on the test environment, but it should be consistent
    expect(result).toBe(typeof window === 'undefined');
  });

  it('handles missing service account key gracefully', async () => {
    delete process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'pid';
    mockGetApps.mockReturnValue([]);
    const initializedApp = { name: 'fallback-app' } as unknown as App;
    mockInitializeApp.mockReturnValue(initializedApp);

    const { initializeFirebaseAdmin } = await importModule();
    const app = initializeFirebaseAdmin();

    // Should fall back to Application Default Credentials
    expect(mockInitializeApp).toHaveBeenCalledWith({
      projectId: 'pid',
      storageBucket: 'pid.appspot.com'
    });
    expect(app).toBe(initializedApp);
  });

  it('handles invalid service account JSON', async () => {
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY = 'invalid-json';
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'pid';
    mockGetApps.mockReturnValue([]);
    const initializedApp = { name: 'fallback-app' } as unknown as App;
    mockInitializeApp.mockReturnValue(initializedApp);
    mockCert.mockImplementation(() => {
      throw new Error('Invalid credentials');
    });

    const { initializeFirebaseAdmin } = await importModule();
    const app = initializeFirebaseAdmin();

    // Should catch error and fall back to Application Default Credentials
    expect(mockInitializeApp).toHaveBeenCalledWith({
      projectId: 'pid',
      storageBucket: 'pid.appspot.com'
    });
    expect(app).toBe(initializedApp);
  });

  it('handles concurrent getFirestoreAdmin calls', async () => {
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'pid';
    mockGetApps.mockReturnValue([]);
    mockInitializeApp.mockReturnValue({} as App);
    const firestoreInstance = { brand: 'firestore' } as unknown as Firestore;
    mockGetFirestore.mockReturnValue(firestoreInstance);

    const { getFirestoreAdmin } = await importModule();

    // Simulate concurrent calls
    const [first, second, third] = await Promise.all([
      Promise.resolve(getFirestoreAdmin()),
      Promise.resolve(getFirestoreAdmin()),
      Promise.resolve(getFirestoreAdmin())
    ]);

    expect(first).toBe(firestoreInstance);
    expect(second).toBe(firestoreInstance);
    expect(third).toBe(firestoreInstance);
    expect(mockGetFirestore).toHaveBeenCalledTimes(1);
  });
});
