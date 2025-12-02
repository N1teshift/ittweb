---
title: Test Validation Tools Reference
description: Complete reference for all test validation tools
date: 2025-12-02
---

# Test Validation Tools Reference

This document provides a complete reference for all test validation tools implemented to ensure tests actually test what they claim to test.

## Table of Contents

- [Quick Start](#quick-start)
- [Core Validation Tools](#core-validation-tools)
- [Advanced Analysis Tools](#advanced-analysis-tools)
- [CI/CD Integration](#cicd-integration)
- [Configuration Files](#configuration-files)
- [Troubleshooting](#troubleshooting)

## Quick Start

```bash
# Install dependencies (if not already done)
npm install

# Run full validation suite
npm run test:validate

# Quick validation (skip slow mutation testing)
npm run test:validate:quick

# CI validation with strict checks
npm run test:validate:ci
```

## Core Validation Tools

### 1. Test Validation Script (`test:validate`)

**Purpose**: Comprehensive test validation combining multiple techniques.

**What it does**:
- Runs unit tests with coverage
- Analyzes coverage quality and thresholds
- Validates test file structure
- Runs test quality linting
- Optional: mutation testing and E2E tests

**Usage**:
```bash
npm run test:validate          # Full validation
npm run test:validate:quick    # Skip mutation testing
npm run test:validate:ci       # Strict CI mode
```

**Output**: Detailed report with pass/fail status for each validation step.

### 2. Coverage Analysis (`analyze:coverage`)

**Purpose**: Deep analysis of test coverage beyond basic percentages.

**What it does**:
- Parses LCOV coverage data
- Identifies files with low coverage
- Lists uncovered lines, branches, and functions
- Provides specific recommendations
- Validates coverage thresholds

**Usage**:
```bash
npm run test:coverage              # Generate coverage data
npm run analyze:coverage           # Analyze coverage
npm run analyze:coverage:detailed  # Include worst files
npm run analyze:coverage -- --file=path/to/file.ts  # Specific file
```

**Output**: Coverage quality report with actionable recommendations.

### 3. Mutation Testing (`test:mutation`)

**Purpose**: Verify tests would fail if code changes (prevents false positives).

**What it does**:
- Makes small changes (mutations) to code
- Runs tests to see if they detect changes
- Reports mutation score and survived mutants
- Identifies weak tests that don't validate behavior

**Usage**:
```bash
npm run test:mutation       # Full mutation testing
npm run test:mutation:ci    # CI-optimized (faster, less verbose)
```

**Configuration**: `stryker.conf.json`

### 4. Test Quality Linting (`lint:test`)

**Purpose**: Catch common test anti-patterns and quality issues.

**What it does**:
- Validates test naming conventions
- Ensures mocks are properly verified
- Prevents empty or meaningless tests
- Checks for `.only` usage that hides tests

**Rules**:
- `no-only-tests`: Prevents `.only` in test files
- `no-empty-test`: Ensures tests have assertions
- `no-mock-without-assert`: Verifies mock usage
- `meaningful-assertions`: Checks assertion quality
- `test-naming-convention`: Validates test names

**Usage**:
```bash
npm run lint:test
```

**Configuration**: `config/eslint.test.config.js`

## Advanced Analysis Tools

### Test Categorization Scripts

**Purpose**: Run specific types of tests with appropriate validation.

```bash
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:api           # API route tests
npm run test:components    # Component tests
```

### Individual Analysis Scripts

```bash
# Coverage analysis for specific areas
npm run analyze:coverage -- --file=src/features/auth/
npm run analyze:coverage -- --detailed

# Test quality checks
npm run lint:test

# Replay analysis (existing)
npm run analyze:replay
```

## CI/CD Integration

### Automated Validation Pipeline

The CI pipeline runs these steps in order:

1. **Unit Tests** (`npm test`) - Fast feedback
2. **Coverage Generation** (`npm run test:coverage`) - Quality metrics
3. **Coverage Analysis** (`npm run analyze:coverage`) - Threshold validation
4. **Test Quality Linting** (`npm run lint:test`) - Code quality
5. **Mutation Testing** (`npm run test:mutation:ci`) - Deep validation (optional)

### CI Configuration Example

```yaml
# .github/workflows/test-validation.yml
name: Test Validation
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:validate:ci
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: coverage-report
          path: coverage/
```

### Validation Results

The CI validation provides:
- ✅ **Pass/Fail Status** - Overall validation result
- 📊 **Coverage Reports** - Detailed HTML reports
- 🧬 **Mutation Scores** - Quality metrics
- 🚨 **Quality Violations** - Issues requiring fixes
- 📋 **Validation Report** - Summary of all checks

## Configuration Files

### Stryker Configuration (`stryker.conf.json`)

```json
{
  "$schema": "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",
  "packageManager": "npm",
  "reporters": ["html", "clear-text", "progress"],
  "testRunner": "jest",
  "jest": {
    "configFile": "config/jest.config.cjs",
    "enableFindRelatedTests": true
  },
  "coverageAnalysis": "perTest",
  "mutate": [
    "src/**/*.{js,ts,jsx,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{js,jsx,ts,tsx}",
    "!src/**/__tests__/**",
    "!src/pages/**"
  ],
  "thresholds": {
    "high": 80,
    "low": 60,
    "break": 50
  }
}
```

### ESLint Test Configuration (`config/eslint.test.config.js`)

```javascript
module.exports = {
  extends: ['next/core-web-vitals'],
  plugins: ['test-quality'],
  overrides: [
    {
      files: ['**/__tests__/**/*.ts', '**/__tests__/**/*.tsx', '**/*.test.ts', '**/*.test.tsx'],
      rules: {
        'test-quality/no-only-tests': 'error',
        'test-quality/no-empty-test': 'warn',
        'test-quality/no-mock-without-assert': 'warn',
        'test-quality/meaningful-assertions': 'warn',
        'test-quality/test-naming-convention': 'warn'
      }
    }
  ]
};
```

### Jest Configuration Updates (`config/jest.config.cjs`)

```javascript
const config = {
  // ... existing config
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
  // Test categorization
  testNamePattern: process.env.TEST_CATEGORY || '.*',
  // ... rest of config
};
```

## Package.json Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testNamePattern=\"(unit|Unit)\" --coverage",
    "test:integration": "jest --testNamePattern=\"(integration|Integration)\" --coverage",
    "test:api": "jest --testPathPattern=\"__tests__/infrastructure/api\"",
    "test:components": "jest --testPathPattern=\"__tests__/modules\"",
    "test:mutation": "stryker run",
    "test:mutation:ci": "stryker run --reporters json,dots",
    "test:validate": "node scripts/test-validation.js",
    "test:validate:quick": "node scripts/test-validation.js --quick",
    "test:validate:ci": "node scripts/test-validation.js --ci",
    "analyze:coverage": "node scripts/analyze-coverage.js",
    "analyze:coverage:detailed": "node scripts/analyze-coverage.js --detailed",
    "lint:test": "eslint --config config/eslint.test.config.js \"**/__tests__/**/*.{ts,tsx}\" \"**/*.{test,spec}.{ts,tsx}\""
  }
}
```

## Troubleshooting

### Common Issues

#### 1. **ES Module Errors**
```
ReferenceError: require is not defined in ES module scope
```
**Solution**: All scripts use ES modules. Ensure package.json has `"type": "module"`.

#### 2. **Coverage Data Not Found**
```
❌ Coverage data not found. Run "npm run test:coverage" first.
```
**Solution**: Generate coverage data before analysis:
```bash
npm run test:coverage
npm run analyze:coverage
```

#### 3. **Mutation Testing Timeout**
**Solution**: Increase timeout in Stryker config or run on fewer files:
```bash
npx stryker run --mutate src/specific/file.ts
```

#### 4. **Test Quality Linting Not Working**
**Solution**: Ensure ESLint test config is loaded:
```bash
npm run lint:test
```

### Performance Optimization

#### For Large Codebases
- Use `test:validate:quick` for faster feedback
- Run mutation testing on specific files only
- Parallelize test execution in CI

#### CI Optimization
```yaml
# Run fast checks first
- run: npm run test:validate:quick
# Then slow mutation testing (only on main branch)
- run: npm run test:mutation:ci
  if: github.ref == 'refs/heads/main'
```

### Debugging Validation

```bash
# Debug specific test file
npx jest src/myFile.test.ts --verbose

# Debug mutation on specific file
npx stryker run --mutate src/myFile.ts --reporters clear-text

# Debug coverage for specific file
npm run analyze:coverage -- --file=src/myFile.ts

# Debug linting
npx eslint --config config/eslint.test.config.js src/myFile.test.ts
```

## File Structure

```
├── scripts/
│   ├── test-validation.js          # Main validation orchestrator
│   ├── analyze-coverage.js         # Coverage analysis tool
│   └── eslint-plugin-test-quality.js # Test quality ESLint plugin
├── config/
│   ├── jest.config.cjs            # Jest configuration
│   ├── eslint.test.config.js      # Test-specific ESLint config
│   └── stryker.conf.json          # Mutation testing config
├── docs/
│   ├── development/
│   │   └── test-validation.md     # User guide
│   └── shared/
│       └── test-validation-tools.md # This reference
└── coverage/                      # Generated coverage reports
    ├── lcov-report/
    ├── coverage-final.json
    └── stryker/                   # Mutation testing reports
```

## Integration with Development Workflow

### Pre-commit Hooks

Add to `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint:test
npm run test:validate:quick
```

### IDE Integration

#### VS Code Settings
```json
{
  "eslint.options": {
    "configFile": "config/eslint.test.config.js"
  },
  "jest.pathToConfig": "config/jest.config.cjs"
}
```

#### Test Coverage in IDE
- Install "Coverage Gutters" extension
- Configure to read `coverage/lcov.info`
- Shows uncovered lines directly in editor

### Team Workflow

1. **Local Development**: Run `npm run test:validate:quick` frequently
2. **Before PR**: Run full `npm run test:validate`
3. **CI Pipeline**: Automatic validation on push/PR
4. **Code Review**: Check validation reports
5. **Release**: Ensure mutation score > 80%

## Metrics and KPIs

### Quality Metrics

- **Coverage Thresholds**: Statements > 80%, Branches > 75%, Functions > 80%
- **Mutation Score**: Target > 80% (industry standard)
- **Test Quality Violations**: Target 0
- **Test Execution Time**: < 5 minutes for unit tests

### Tracking Progress

```bash
# Generate quality report
npm run test:validate > quality-report.txt

# Track coverage trends
npm run analyze:coverage -- --json > coverage-trends.json

# Monitor mutation scores
npm run test:mutation:ci -- --json > mutation-results.json
```

## Contributing

### Adding New Validation Rules

1. **ESLint Rules**: Add to `scripts/eslint-plugin-test-quality.js`
2. **Validation Steps**: Add to `scripts/test-validation.js`
3. **New Scripts**: Update `package.json` scripts
4. **Documentation**: Update this reference and user guide

### Testing the Validation Tools

```bash
# Test validation scripts
npm run test:validate:quick

# Test individual tools
npm run analyze:coverage
npm run lint:test
npm run test:mutation:ci
```

## Related Documentation

- [Test Validation Guide](../development/test-validation.md) - User-focused guide
- [Testing Patterns](./testing-patterns.md) - Best practices
- [CI/CD Setup](./ci-cd-setup.md) - Pipeline configuration
- [Code Quality](./code-quality.md) - General quality standards
