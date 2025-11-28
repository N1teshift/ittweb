const mockInitializeApp = jest.fn();
const mockGetApps = jest.fn();
const mockGetFirestore = jest.fn();
const mockGetStorage = jest.fn();
const mockGetAnalytics = jest.fn();
const mockIsSupported = jest.fn();

jest.mock('firebase/app', () => ({
  initializeApp: (...args: any[]) => mockInitializeApp(...args),
  getApps: (...args: any[]) => mockGetApps(...args)
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: (...args: any[]) => mockGetFirestore(...args)
}));

jest.mock('firebase/storage', () => ({
  getStorage: (...args: any[]) => mockGetStorage(...args)
}));

jest.mock('firebase/analytics', () => ({
  getAnalytics: (...args: any[]) => mockGetAnalytics(...args),
  isSupported: (...args: any[]) => mockIsSupported(...args)
}));

describe('firebase client', () => {
  const originalEnv = process.env;
  const originalWindow = global.window;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_FIREBASE_API_KEY: 'key',
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'domain',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'project',
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'bucket',
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: 'sender',
      NEXT_PUBLIC_FIREBASE_APP_ID: 'app'
    };
    // @ts-expect-error allow overriding window
    delete (global as any).window;
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterAll(() => {
    process.env = originalEnv;
    global.window = originalWindow;
  });

  const importModule = async () =>
    import('@/features/infrastructure/api/firebase/firebaseClient');

  it('initializes firebase app with config when not previously initialized', async () => {
    mockGetApps.mockReturnValue([]);
    const createdApp = { name: 'app' } as unknown;
    mockInitializeApp.mockReturnValue(createdApp);

    const { initializeFirebaseApp } = await importModule();
    const app = initializeFirebaseApp();

    expect(app).toBe(createdApp);
    expect(mockInitializeApp).toHaveBeenCalledWith({
      apiKey: 'key',
      authDomain: 'domain',
      projectId: 'project',
      storageBucket: 'bucket',
      messagingSenderId: 'sender',
      appId: 'app'
    });
  });

  it('reuses existing firebase app instance', async () => {
    const existingApp = { name: 'existing' } as unknown;
    mockGetApps.mockReturnValue([existingApp]);

    const { initializeFirebaseApp } = await importModule();
    const app = initializeFirebaseApp();

    expect(app).toBe(existingApp);
    expect(mockInitializeApp).not.toHaveBeenCalled();
  });

  it('throws when configuration is missing required fields', async () => {
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = '';
    mockGetApps.mockReturnValue([]);

    const { initializeFirebaseApp } = await import('@/features/infrastructure/api/firebase/firebaseClient');

    expect(() => initializeFirebaseApp()).toThrow('Firebase configuration error: Firebase config missing');
  });

  it('returns singleton firestore instance', async () => {
    mockGetApps.mockReturnValue([]);
    mockInitializeApp.mockReturnValue({});
    const firestore = { brand: 'firestore' } as unknown;
    mockGetFirestore.mockReturnValue(firestore);

    const { getFirestoreInstance } = await importModule();

    const first = getFirestoreInstance();
    const second = getFirestoreInstance();

    expect(first).toBe(firestore);
    expect(second).toBe(firestore);
    expect(mockGetFirestore).toHaveBeenCalledTimes(1);
  });

  it('returns singleton storage instance', async () => {
    mockGetApps.mockReturnValue([]);
    mockInitializeApp.mockReturnValue({});
    const storage = { brand: 'storage' } as unknown;
    mockGetStorage.mockReturnValue(storage);

    const { getStorageInstance } = await importModule();

    const first = getStorageInstance();
    const second = getStorageInstance();

    expect(first).toBe(storage);
    expect(second).toBe(storage);
    expect(mockGetStorage).toHaveBeenCalledTimes(1);
  });

  it('returns null analytics instance on server', async () => {
    // @ts-expect-error simulate server environment
    (global as any).window = undefined;
    const { getAnalyticsInstance } = await importModule();
    const analytics = await getAnalyticsInstance();

    expect(analytics).toBeNull();
  });

  it('initializes analytics only when supported', async () => {
    (global as any).window = {} as Window;
    mockGetApps.mockReturnValue([]);
    mockInitializeApp.mockReturnValue({});
    mockIsSupported.mockResolvedValue(true);
    const analyticsInstance = { brand: 'analytics' } as unknown;
    mockGetAnalytics.mockReturnValue(analyticsInstance);

    const { getAnalyticsInstance } = await importModule();
    const analytics = await getAnalyticsInstance();

    expect(mockIsSupported).toHaveBeenCalled();
    expect(mockGetAnalytics).toHaveBeenCalled();
    expect(analytics).toBe(analyticsInstance);
  });

  it('swallows analytics initialization errors and returns null', async () => {
    (global as any).window = {} as Window;
    mockIsSupported.mockRejectedValue(new Error('unsupported'));

    const { getAnalyticsInstance } = await importModule();
    const analytics = await getAnalyticsInstance();

    expect(analytics).toBeNull();
  });
});
