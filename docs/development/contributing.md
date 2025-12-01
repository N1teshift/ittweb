# Contributing Guide

Development standards and contribution process.

## Development Standards

### Code Style

- **TypeScript**: Strict mode enabled, all code must type-check
- **File Size**: Keep files under 200 lines when possible
- **Naming**: Use descriptive names, follow existing patterns
- **Formatting**: Use Prettier (recommended), follow ESLint rules

### File Organization

- **Modules**: Feature-based organization in `src/features/modules/`
- **Components**: Co-located with feature modules
- **Services**: Business logic in `lib/` directories
- **Types**: TypeScript types in `types/` directories
- **Tests**: Next to source files or in `__tests__/` subdirectories

### Error Handling

**Always use infrastructure logging for error handling:**

```typescript
import { logError, logAndThrow } from '@/features/infrastructure/logging';

try {
  // operation
} catch (error) {
  logError(error as Error, 'Operation failed', {
    component: 'myComponent',
    operation: 'myOperation',
  });
  throw error; // or handle gracefully
}
```

**See [Error Handling Guide](./ERROR_HANDLING.md) for complete patterns and best practices.**

### Documentation

- **Module README**: Create `README.md` in each new module
- **API Documentation**: Add to `docs/api/` when adding API routes
- **Code Comments**: Add comments for complex logic
- **Type Definitions**: Document complex types
- **Style Guide**: Follow `docs/DOCUMENTATION_STYLE.md` for all documentation

## Git Workflow

### Branch Naming

- `feature/` - New features (e.g., `feature/player-comparison`)
- `fix/` - Bug fixes (e.g., `fix/elo-calculation`)
- `docs/` - Documentation updates (e.g., `docs/api-reference`)
- `refactor/` - Code refactoring (e.g., `refactor/service-layer`)

### Commit Messages

Follow conventional commits format:

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Code refactoring
- `test` - Tests
- `chore` - Maintenance

**Examples:**
```
feat(games): add game filtering by category

fix(players): correct ELO calculation for teams

docs(api): add games API documentation

refactor(services): extract timestamp utility
```

### Pull Request Process

1. **Create Branch**: From `main`, create feature branch
2. **Make Changes**: Follow development standards
3. **Write Tests**: Add tests for new features
4. **Update Documentation**: Update relevant docs
5. **Create PR**: Include description of changes
6. **Code Review**: Address review feedback
7. **Merge**: After approval, squash and merge

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
Specify the type of change: Bug fix, New feature, Documentation update, or Refactoring

## Testing
- Tests added/updated for new functionality
- Manual testing completed to verify changes work as expected

## Pre-Submission Checklist
Before submitting your PR, ensure:
- Code follows style guidelines
- Self-review completed
- Documentation updated if needed
- No new warnings/errors introduced
```

## Testing Requirements

### Unit Tests

- **Service functions**: Test all service layer functions
- **Utilities**: Test utility functions
- **Components**: Test component logic (not rendering)

**Location**: Next to source files or in `__tests__/` subdirectories

**Example**:
```typescript
// lib/myService.test.ts
import { describe, it, expect } from '@jest/globals';
import { myFunction } from './myService';

describe('myService', () => {
  describe('myFunction', () => {
    it('should handle normal case', () => {
      const result = myFunction('input');
      expect(result).toBe('expected');
    });
  });
});
```

### Integration Tests

- **API Routes**: Test API endpoints
- **Service + Firebase**: Test service integration
- **Component + API**: Test component data fetching

### Test Coverage

- Aim for >80% coverage on new code
- Critical paths should have 100% coverage
- Use `npm run test:coverage` to check

## Code Review Guidelines

### For Authors

- **Small PRs**: Keep PRs focused and small
- **Clear Description**: Explain what and why
- **Self-Review**: Review your own code first
- **Test Coverage**: Include tests for new code
- **Documentation**: Update relevant docs

### For Reviewers

- **Be Constructive**: Provide helpful feedback
- **Check Standards**: Verify code follows standards
- **Test Functionality**: Test the changes locally
- **Approve Promptly**: Don't block on minor issues

### Review Guidelines

When reviewing code, verify:
- Code follows style guidelines
- Error handling uses the logging infrastructure (`@/features/infrastructure/logging`)
- Tests are included and pass
- Documentation is updated if needed
- No security issues introduced
- Performance considerations addressed

## Adding New Features

### 1. Plan

- Review existing similar features
- Check Firestore schema requirements
- Plan module structure

### 2. Implement

- Create module structure (see [Development Guide](./development-guide.md))
- Implement service layer
- Create components and hooks
- Add API routes
- Write tests

### 3. Document

- Create module README
- Add API documentation
- Update relevant guides

### 4. Test

- Write unit tests
- Write integration tests
- Manual testing
- Check test coverage

## Adding API Routes

### 1. Create Route

- Use `createApiHandler` when possible
- Follow existing patterns
- Add authentication checks
- Handle errors properly

### 2. Document

- Add to `docs/api/[namespace].md`
- Include request/response examples
- Document authentication requirements

### 3. Test

- Test all HTTP methods
- Test error cases
- Test authentication
- Test validation

## Security Guidelines

### Authentication

- Always check authentication for write operations
- Use `getServerSession` for server-side checks
- Verify user permissions for admin operations

### Input Validation

**📘 See [Zod Validation Migration Guide](./operations/zod-validation-migration.md) for validation patterns.**

- **Use Zod schemas** for all API request body validation
- Validate all user input using `zodValidator()` with route handlers
- Sanitize data before storing (see [Security Guide](./SECURITY.md))
- Use TypeScript types for compile-time safety
- Check Firestore rules for database-level security

### Error Messages

- Don't expose sensitive information
- Use generic messages in production
- Log detailed errors server-side only

## Performance Guidelines

### Database Queries

- Use indexes for complex queries
- Limit result sets (pagination)
- Avoid N+1 queries
- Cache when appropriate

### Components

- Use React.memo for expensive components
- Lazy load heavy components
- Optimize re-renders
- Use proper keys in lists

### Bundle Size

- Import only what you need
- Use dynamic imports for large dependencies
- Check bundle size with `ANALYZE=true npm run build`

## Questions?

- Check [Documentation Index](../README.md)
- Review [Development Guide](./development-guide.md)
- Ask in code review comments

## Related Documentation

- [Development Guide](./development-guide.md)
- [Code Patterns](./code-patterns.md)
- [Architecture Overview](./architecture.md)
- [Testing Guide](./operations/testing-guide.md)

