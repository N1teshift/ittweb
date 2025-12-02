require("@testing-library/jest-dom");

jest.mock("next/router", () => ({
  useRouter() {
    return {
      route: "/",
      pathname: "/",
      query: {},
      asPath: "/",
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
      isLocaleDomain: false,
    };
  },
}));

jest.mock("next-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      language: "en",
      changeLanguage: jest.fn(),
    },
  }),
  Trans: ({ children }) => children,
}));

jest.mock("@/features/infrastructure/api/firebase", () => ({
  __esModule: true,
  getFirestoreInstance: jest.fn(() => ({})),
  getStorageInstance: jest.fn(() => ({})),
}));

jest.mock("@/features/infrastructure/api/firebase/firebaseClient", () => ({
  __esModule: true,
  initializeFirebaseApp: jest.fn(),
  getFirestoreInstance: jest.fn(() => ({})),
  getStorageInstance: jest.fn(() => ({})),
  getAnalyticsInstance: jest.fn(() => ({})),
}));

jest.mock("@/features/infrastructure/api/firebase/admin", () => ({
  __esModule: true,
  getFirestoreAdmin: jest.fn(() => ({ collection: jest.fn(() => ({ doc: jest.fn(() => ({ get: jest.fn(), collection: jest.fn(() => ({ get: jest.fn() })) })) })) })),
  isServerSide: jest.fn(() => false),
  getAdminTimestamp: jest.fn(() => ({
    now: jest.fn(() => ({ toDate: () => new Date("2020-01-01T00:00:00Z") })),
    fromDate: jest.fn((date) => ({ toDate: () => date })),
  })),
}));

jest.mock("@/features/infrastructure/logging", () => ({
  __esModule: true,
  createComponentLogger: jest.fn(() => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() })),
  logError: jest.fn(),
}));

// Mock NextAuth to prevent jose ESM import issues
jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn(),
  getServerSession: jest.fn(),
}));

jest.mock('next-auth/next', () => ({
  __esModule: true,
  getServerSession: jest.fn(),
}));

if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};

// Polyfill TextEncoder/TextDecoder for node test environment
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = require('util').TextDecoder;
}








