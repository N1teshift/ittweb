---
title: Test Validation Guide
description: Ensuring your tests actually test what they claim to test
date: 2025-12-02
---

# Test Validation Guide

This guide explains how to ensure your tests actually test what they claim to test. We've implemented multiple validation methods to catch common testing anti-patterns and ensure test quality.

## Overview

Testing is only valuable if tests actually validate the behavior they claim to test. This guide covers multiple techniques to ensure test quality:

- **Code Coverage Analysis** - Ensure sufficient code is tested
- **Mutation Testing** - Verify tests fail when code changes
- **Test Quality Linting** - Catch common test anti-patterns
- **Test Categorization** - Organize tests by type and validation level
- **Automated Validation** - CI/CD integration for consistent quality

## Quick Start

```bash
# Run full test validation (recommended)
npm run test:validate

# Quick validation (skips slow mutation testing)
npm run test:validate:quick

# CI mode with strict validation
npm run test:validate:ci
```

## Test Quality Analysis

### Common Test Anti-Patterns

Our validation tools catch these common issues:

#### 1. **Tests That Only Check Existence**
```javascript
// ❌ BAD: Only checks that something exists
it('should work', () => {
  const result = myFunction();
  expect(result).toBeDefined();
});

// ✅ GOOD: Checks specific behavior
it('should return user data', () => {
  const result = myFunction();
  expect(result).toEqual({
    id: 1,
    name: 'John',
    email: 'john@example.com'
  });
});
```

#### 2. **Mock Verification Without Behavior Validation**
```javascript
// ❌ BAD: Creates mock but doesn't verify behavior
it('should call API', () => {
  const mockApi = jest.fn();
  myFunction(mockApi);
  // No assertion on the mock!
});

// ✅ GOOD: Verifies both call and behavior
it('should call API with correct parameters', () => {
  const mockApi = jest.fn().mockResolvedValue({ success: true });
  const result = await myFunction(mockApi);

  expect(mockApi).toHaveBeenCalledWith('expected-param');
  expect(result).toBe(true);
});
```

#### 3. **Meaningless Test Names**
```javascript
// ❌ BAD: Not descriptive
it('test', () => { /* ... */ });
it('works', () => { /* ... */ });
it('handles case', () => { /* ... */ });

// ✅ GOOD: Clear intent
it('should return user profile when authenticated', () => { /* ... */ });
it('should throw error for invalid email format', () => { /* ... */ });
```

## Code Coverage Analysis

### Running Coverage Analysis

```bash
# Generate coverage report
npm run test:coverage

# Analyze coverage quality
npm run analyze:coverage

# Detailed analysis with worst files
npm run analyze:coverage:detailed

# Analyze specific file
npm run analyze:coverage -- --file=src/features/myFeature.ts
```

### Coverage Thresholds

| Metric | Threshold | Description |
|--------|-----------|-------------|
| Statements | 80% | Executable statements covered |
| Branches | 75% | Conditional branches tested |
| Functions | 80% | Functions called during tests |
| Lines | 80% | Lines of code executed |

### Understanding Coverage Reports

The coverage analyzer provides:
- **Files with low coverage** - Prioritize these for additional tests
- **Uncovered lines/branches** - Specific areas needing tests
- **Coverage trends** - Track improvements over time

## Mutation Testing

Mutation testing verifies that tests would fail if the code changes. It works by:

1. Making small changes (mutations) to your code
2. Running tests to see if they detect the changes
3. Reporting mutations that "survived" (tests didn't fail)

### Running Mutation Tests

```bash
# Run mutation testing
npm run test:mutation

# CI mode (faster, less verbose)
npm run test:mutation:ci
```

### Interpreting Results

- **Killed mutants**: Tests correctly detected the change ✅
- **Survived mutants**: Tests didn't catch the change ❌ - add better tests
- **Mutation score**: Percentage of mutants killed

### Example Mutation

```javascript
// Original code
function add(a, b) {
  return a + b;
}

// Test
expect(add(2, 3)).toBe(5);

// Mutations tested:
// - return a - b; (would this test fail?)
// - return a * b; (would this test fail?)
// - return 0; (would this test fail?)
```

## Test Quality Linting

### Running Test Linting

```bash
# Lint test files for quality issues
npm run lint:test
```

### Linting Rules

#### `no-only-tests`
Prevents `.only` in test files which can hide other failing tests.

```javascript
// ❌ BAD
describe.only('My tests', () => {
  it.only('should work', () => { /* ... */ });
});

// ✅ GOOD
describe('My tests', () => {
  it('should work', () => { /* ... */ });
});
```

#### `no-empty-test`
Ensures test functions have meaningful assertions.

```javascript
// ❌ BAD
it('should validate input', () => {
  // No assertions!
});

// ✅ GOOD
it('should validate input', () => {
  const result = validateInput('test');
  expect(result.isValid).toBe(true);
});
```

#### `no-mock-without-assert`
Ensures mock functions are verified with assertions.

```javascript
// ❌ BAD
it('should call service', () => {
  const mockService = jest.fn();
  myFunction(mockService);
  // Mock created but not verified
});

// ✅ GOOD
it('should call service', () => {
  const mockService = jest.fn();
  myFunction(mockService);
  expect(mockService).toHaveBeenCalledWith('expected-arg');
});
```

#### `meaningful-assertions`
Ensures assertions are specific and meaningful.

```javascript
// ❌ BAD
it('should return something', () => {
  const result = myFunction();
  expect(result).toBeDefined(); // Too vague
});

// ✅ GOOD
it('should return user object', () => {
  const result = myFunction();
  expect(result).toEqual({
    id: 123,
    name: 'John Doe',
    role: 'admin'
  });
});
```

#### `test-naming-convention`
Ensures test names are descriptive.

```javascript
// ❌ BAD
it('test', () => { /* ... */ });
it('works', () => { /* ... */ });

// ✅ GOOD
it('should create user account', () => { /* ... */ });
it('should validate email format', () => { /* ... */ });
```

## Test Categorization

### Test Types

We categorize tests by their scope and purpose:

#### Unit Tests (`test:unit`)
- Test individual functions/classes in isolation
- Fast execution, no external dependencies
- Focus on business logic

```bash
npm run test:unit
```

#### Integration Tests (`test:integration`)
- Test component interactions
- May include external dependencies (mocks)
- Verify data flow between components

```bash
npm run test:integration
```

#### API Tests (`test:api`)
- Test API routes and handlers
- Include middleware validation
- Verify request/response formats

```bash
npm run test:api
```

#### Component Tests (`test:components`)
- Test React components
- Include rendering and user interactions
- Verify UI behavior

```bash
npm run test:components
```

### Organizing Tests by Category

```javascript
// Unit test - pure logic
describe('calculateTotal (unit)', () => {
  it('should sum array of numbers', () => {
    expect(calculateTotal([1, 2, 3])).toBe(6);
  });
});

// Integration test - component interaction
describe('ShoppingCart (integration)', () => {
  it('should update total when items change', () => {
    // Tests multiple components working together
  });
});
```

## CI/CD Integration

### Automated Validation Pipeline

The CI pipeline runs multiple validation steps:

1. **Unit Tests** - Fast feedback
2. **Integration Tests** - Component validation
3. **Coverage Analysis** - Quality metrics
4. **Test Quality Linting** - Code quality
5. **Mutation Testing** (optional) - Deep validation

### CI Configuration

```yaml
# Example GitHub Actions workflow
name: Test Validation
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:validate:ci
```

### Validation Results

The CI validation provides:
- **Test results** - Pass/fail status
- **Coverage reports** - Uploaded as artifacts
- **Mutation scores** - Quality metrics
- **Quality violations** - Issues to fix

## Best Practices

### Writing Quality Tests

1. **Test Behavior, Not Implementation**
   ```javascript
   // ❌ Testing implementation
   it('should call fetch with correct URL', () => {
     expect(fetch).toHaveBeenCalledWith('/api/users');
   });

   // ✅ Testing behavior
   it('should return user data', () => {
     const user = await getUser();
     expect(user).toHaveProperty('name');
   });
   ```

2. **Use Descriptive Names**
   ```javascript
   // ❌ Vague
   it('should handle error', () => { /* ... */ });

   // ✅ Specific
   it('should return 404 for non-existent user', () => { /* ... */ });
   ```

3. **Test Edge Cases**
   ```javascript
   it('should handle empty input', () => {
     expect(processInput('')).toBe(null);
   });

   it('should handle null input', () => {
     expect(processInput(null)).toThrow('Invalid input');
   });
   ```

4. **Avoid Test Interdependencies**
   ```javascript
   // ❌ Tests depend on each other
   let userId;
   it('should create user', () => {
     userId = createUser();
   });
   it('should get user', () => {
     const user = getUser(userId); // Depends on previous test
   });

   // ✅ Independent tests
   it('should create user', () => {
     const userId = createUser();
     expect(userId).toBeDefined();
   });
   it('should get user', () => {
     const userId = 'known-id';
     const user = getUser(userId);
     expect(user).toBeDefined();
   });
   ```

### Test Maintenance

1. **Keep Tests DRY** - Extract common setup/teardown
2. **Review Coverage Regularly** - Address low coverage areas
3. **Update Tests with Code Changes** - Tests should evolve with code
4. **Use Test Data Builders** - For complex test data

```javascript
// Test data builder pattern
function buildUser(overrides = {}) {
  return {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    ...overrides
  };
}

// Usage
it('should update user email', () => {
  const user = buildUser({ email: 'old@example.com' });
  const updated = updateUser(user, { email: 'new@example.com' });
  expect(updated.email).toBe('new@example.com');
});
```

## Troubleshooting

### Common Issues

#### Tests Pass But Coverage Is Low
- Tests might not be executing the right code paths
- Check if mocks are preventing real code execution
- Review conditional logic that might be skipped

#### Mutation Testing Shows Survived Mutants
- Tests are too implementation-specific
- Add more behavioral assertions
- Consider edge cases not covered

#### Linting Shows Quality Issues
- Review test naming conventions
- Ensure all mocks are verified
- Add more specific assertions

### Debugging Test Validation

```bash
# Run specific test file with coverage
npx jest src/myFile.test.ts --coverage

# Run mutation testing on specific file
npx stryker run --mutate src/myFile.ts

# Analyze specific file coverage
npm run analyze:coverage -- --file=src/myFile.ts
```

## Conclusion

Ensuring tests actually test what they claim requires multiple validation approaches:

- **Coverage analysis** ensures sufficient code is tested
- **Mutation testing** verifies tests detect code changes
- **Quality linting** catches common anti-patterns
- **Categorization** organizes tests by validation level
- **CI integration** ensures consistent quality

Use these tools together for comprehensive test validation. Start with coverage analysis and quality linting for quick wins, then add mutation testing for deeper validation.

## Related Documentation

- [Testing Guide](./testing.md) - General testing practices
- [API Testing](./api-testing.md) - API-specific testing patterns
- [Component Testing](./component-testing.md) - React component testing
