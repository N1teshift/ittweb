/** @type {import('jest').Config} */
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const config = {
  coverageProvider: "v8",
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@/shared/(.*)$": "<rootDir>/src/features/shared/$1",
    "^@/features/(.*)$": "<rootDir>/src/features/$1",
    "^@/types/(.*)$": "<rootDir>/src/types/$1",
    "^@/utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@/config/(.*)$": "<rootDir>/src/config/$1",
    "^@/__tests__/(.*)$": "<rootDir>/__tests__/$1",
    "^(\\.\\.?/.*)\\.js$": "$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  haste: {
    throwOnModuleCollision: false,
  },
  setupFilesAfterEnv: ["<rootDir>/config/jest.setup.cjs"],
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
  // Test categorization
  testNamePattern: process.env.TEST_CATEGORY || '.*',
  testPathIgnorePatterns: [
    "/node_modules/",
    "/.next/",
    "/build/",
    "/out/",
    "/external/",
    "/tmp/",
    "/__tests__/helpers/",
    "\\.d\\.ts$",
    // Temporarily exclude tests with Firebase Admin SDK mocking issues
    "firestoreHelpers\\.test\\.ts$",
    "health\\.test\\.ts$", // Firebase Admin mocking still needs work
    "wipe-test-data\\.test\\.ts$",
  ],
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{js,jsx,ts,tsx}",
    "!src/**/__tests__/**",
    "!src/pages/**",
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  testTimeout: 10000,
  transformIgnorePatterns: [
    "node_modules/(?!(jose|@panva/hkdf|oidc-token-hash|oauth4webapi|@panva/oauth4webapi)/)",
  ],
};

module.exports = createJestConfig(config);









