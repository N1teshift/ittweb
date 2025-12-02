module.exports = {
  extends: ['next/core-web-vitals'],
  plugins: ['test-quality'],
  overrides: [
    {
      files: ['**/__tests__/**/*.ts', '**/__tests__/**/*.tsx', '**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      rules: {
        // Test quality rules
        'test-quality/no-only-tests': 'error',
        'test-quality/no-empty-test': 'warn',
        'test-quality/no-mock-without-assert': 'warn',
        'test-quality/meaningful-assertions': 'warn',
        'test-quality/test-naming-convention': 'warn',

        // Relax some rules for tests
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        'react/jsx-key': 'off',

        // Allow console in tests
        'no-console': 'off',

        // Allow magic numbers in tests (for mock data)
        'no-magic-numbers': 'off'
      }
    }
  ]
};
