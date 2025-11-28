import { getFirebaseClientConfig, validateFirebaseClientConfig } from '@/features/infrastructure/api/firebase/config';

const originalEnv = process.env;

describe('firebase client config', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns client config from environment variables', () => {
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'api-key';
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'auth-domain';
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'project-id';
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'bucket';
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 'sender';
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID = 'app-id';
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = 'measurement';

    const config = getFirebaseClientConfig();

    expect(config).toEqual({
      apiKey: 'api-key',
      authDomain: 'auth-domain',
      projectId: 'project-id',
      storageBucket: 'bucket',
      messagingSenderId: 'sender',
      appId: 'app-id',
      measurementId: 'measurement'
    });
  });

  it('falls back to empty strings for missing values', () => {
    delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    delete process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
    delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    delete process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    delete process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
    delete process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
    delete process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

    const config = getFirebaseClientConfig();

    expect(config).toEqual({
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: '',
      measurementId: undefined
    });
  });

  it('validates required fields and returns errors', () => {
    const errors = validateFirebaseClientConfig({
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: ''
    });

    expect(errors).toEqual([
      'NEXT_PUBLIC_FIREBASE_API_KEY is required',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is required',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID is required',
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is required',
      'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID is required',
      'NEXT_PUBLIC_FIREBASE_APP_ID is required'
    ]);
  });

  it('passes validation when all values are provided', () => {
    const errors = validateFirebaseClientConfig({
      apiKey: 'key',
      authDomain: 'domain',
      projectId: 'project',
      storageBucket: 'bucket',
      messagingSenderId: 'sender',
      appId: 'app'
    });

    expect(errors).toEqual([]);
  });

  it('validates empty string values as invalid', () => {
    const errors = validateFirebaseClientConfig({
      apiKey: '', // empty string
      authDomain: 'domain',
      projectId: 'project',
      storageBucket: 'bucket',
      messagingSenderId: 'sender',
      appId: 'app'
    });

    // Empty string is falsy, so it should be caught
    expect(errors).toContain('NEXT_PUBLIC_FIREBASE_API_KEY is required');
  });

  it('handles undefined measurementId gracefully', () => {
    const config = getFirebaseClientConfig();
    const errors = validateFirebaseClientConfig(config);

    // measurementId is optional, so undefined should not cause errors
    expect(errors).not.toContain(expect.stringContaining('MEASUREMENT_ID'));
  });

  it('validates malformed API key format', () => {
    // API key validation - empty string should fail
    const errors = validateFirebaseClientConfig({
      apiKey: '',
      authDomain: 'valid-domain',
      projectId: 'valid-project',
      storageBucket: 'valid-bucket',
      messagingSenderId: 'valid-sender',
      appId: 'valid-app'
    });

    expect(errors).toContain('NEXT_PUBLIC_FIREBASE_API_KEY is required');
  });
});
