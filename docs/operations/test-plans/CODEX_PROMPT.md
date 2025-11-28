# Codex Agent Prompt for Test Creation

Copy and paste this prompt to Codex agents when assigning test creation tasks:

---

## Task: Create Jest Tests for ITT Web Project

I need you to create comprehensive Jest tests based on the test plan files located in `docs/operations/test-plans/`. 

### Context

This is a Next.js/React project (ITT Web) that uses:
- **Firebase/Firestore** for database
- **NextAuth** for authentication
- **TypeScript** throughout
- **Jest** and **React Testing Library** for testing
- **MDX** for blog posts

### Your Task

1. **Check for existing tests first** - Some tests already exist! Check `TEST_STATUS.md` in the test-plans folder to see what's already done
2. **Read the assigned test plan file** from `docs/operations/test-plans/` (I will specify which file)
3. **Review existing test patterns** - Look at similar existing test files to understand the project's testing style
4. **Create Jest test files** for all test items in that plan that don't already exist
5. **Follow the project's testing conventions** (see below)
6. **Place tests in appropriate locations** based on the test type

### Test Plan Structure

Each test plan file contains tests organized by:
- **Service Layer Tests** → Unit tests in `src/features/modules/[module]/lib/__tests__/` (preferred) or next to source file
- **API Route Tests** → Integration tests in `src/pages/api/[route]/__tests__/`
- **Component Tests** → Component tests in `src/features/modules/[module]/components/__tests__/`
- **Hook Tests** → Hook tests in `src/features/modules/[module]/hooks/__tests__/`
- **Utility Tests** → Utility tests in `src/features/[path]/utils/__tests__/` (preferred) or next to source file
- **Infrastructure Tests** → Can be in `__tests__/infrastructure/` (root level) or co-located

**Note**: The project currently uses mixed patterns. Prefer `__tests__/` subdirectories for new tests, but existing tests may be next to source files. See `TEST_STATUS.md` for details.

### Test Format from Plans

Each test item in the plan follows this format:
```markdown
- [ ] Test name
  - **What**: What to test
  - **Expected**: Expected outcome/assertion
  - **Edge cases**: Edge cases to consider
```

### Critical Requirements

1. **Error Handling**: All error handling MUST use the infrastructure logging system. Import and use:
   ```typescript
   import { logError, logAndThrow, createComponentLogger } from '@/features/infrastructure/logging';
   ```

2. **File Size**: Keep test files under 200 lines when possible. Split large test suites into multiple files if needed.

3. **Testing Libraries**:
   - Use `@testing-library/react` for component tests
   - Use `@testing-library/user-event` for user interactions
   - Use `@testing-library/jest-dom` for DOM matchers
   - Mock Firebase/Firestore for unit tests
   - Use MSW (Mock Service Worker) for API mocking in integration tests

4. **Test Structure**: Follow AAA pattern (Arrange, Act, Assert):
   ```typescript
   describe('FeatureName', () => {
     describe('functionName', () => {
       it('should do something', () => {
         // Arrange
         const input = 'test';
         
         // Act
         const result = functionName(input);
         
         // Assert
         expect(result).toBe('expected');
       });
     });
   });
   ```

5. **Mocking Strategy**:
   - **Firebase/Firestore**: Mock using `jest.mock()` for unit tests
   - **API Routes**: Use MSW handlers for integration tests
   - **Next.js**: Mock `next/router`, `next/link` as needed
   - **NextAuth**: Mock session data for authenticated tests

6. **Test Naming**:
   - Unit tests: `[module].test.ts` or `[module].spec.ts`
   - Component tests: `[ComponentName].test.tsx`
   - Integration tests: `[feature].integration.test.ts`
   - Hook tests: `use[HookName].test.ts`

### Example Test File Structure

```typescript
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { functionToTest } from '../path/to/module';
import { logError } from '@/features/infrastructure/logging';

// Mock dependencies
jest.mock('@/features/infrastructure/logging');

describe('ModuleName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('functionToTest', () => {
    it('should handle normal case', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = functionToTest(input);
      
      // Assert
      expect(result).toBe('expected');
    });

    it('should handle edge case', () => {
      // Test edge case from plan
    });
  });
});
```

### Component Test Example

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from '../ComponentName';

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    render(<ComponentName />);
    
    await user.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText('Result')).toBeInTheDocument();
    });
  });
});
```

### API Route Test Example

```typescript
import { createMocks } from 'node-mocks-http';
import handler from '../api/route';

describe('API Route', () => {
  it('should handle GET request', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({ /* expected */ });
  });
});
```

### Important Notes

- **Check Existing Tests First**: Review `docs/operations/test-plans/TEST_STATUS.md` to see what tests already exist. Don't recreate existing tests!
- **Follow Existing Patterns**: Look at similar existing test files to understand the project's testing style. Note: Tests may be in `__tests__/` subdirectories OR next to source files - both are acceptable. See `TEST_STATUS.md` for current patterns.
- **Prefer `__tests__/` subdirectories**: For new tests, use `__tests__/` subdirectories (e.g., `src/features/modules/games/lib/__tests__/gameService.test.ts`) rather than placing tests next to source files
- **Test Isolation**: Each test should be independent and not rely on other tests
- **Cleanup**: Use `beforeEach`/`afterEach` to clean up state
- **Async Handling**: Properly handle async operations with `await` and `waitFor`
- **Error Scenarios**: Test both success and error paths
- **Edge Cases**: Include edge cases mentioned in the test plan
- **Type Safety**: Maintain TypeScript types in tests
- **Jest Config**: The project uses Next.js Jest config with path aliases (`@/`, `@/features/`, etc.) - use these in imports

### What I Will Provide

I will specify which test plan file you should work on, for example:
- "Create tests from `infrastructure-tests.md`"
- "Create tests from `games-tests.md`"
- etc.

### Deliverables

For each test plan file, create:
1. All test files in appropriate directories
2. Test files that cover all test items in the plan
3. Tests that follow the "What", "Expected", and "Edge cases" from the plan
4. Proper mocking and setup
5. Clear, descriptive test names

### Questions to Ask

If you encounter:
- Unclear requirements in the test plan
- Missing dependencies or imports
- Ambiguous file paths
- Conflicting patterns in existing codebase

Please ask for clarification before proceeding.

---

**Ready to start?** I will now specify which test plan file to work on.

