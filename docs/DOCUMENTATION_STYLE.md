# Documentation Style Guide

**This is the single source of truth for documentation preferences and standards.**

## Core Principles

1. **Minimal**: Keep files under 200 lines when possible
2. **Complete**: Cover all features, modules, APIs, and systems
3. **Actionable**: Include working code examples
4. **Maintainable**: Easy to update as codebase evolves
5. **No Duplication**: Reference existing docs rather than repeating
6. **Consolidated**: Merge redundant documentation, reduce bloat

## File Size

- **Target**: Under 200 lines per file
- **Maximum**: Split into multiple files if exceeding 200 lines
- **Exception**: Reference documents (schemas, plans) can be longer if needed

## Writing Style

### Structure
- **Clear Headings**: Use proper heading hierarchy (##, ###, ####)
- **Examples First**: Show code examples before explaining
- **Scannable**: Use lists, tables, and code blocks for clarity
- **Links**: Link to related documentation

### Content
- **Concise**: Get to the point quickly
- **Complete**: Cover all essential information
- **Code Examples**: Always include working code examples
- **Type Safety**: Show TypeScript types in examples

## Markdown Format

### Code Blocks
- Use language tags: ` ```typescript`, ` ```bash`, etc.
- Include at least one working example
- Show imports when relevant

### Lists
- Use bullet points for features/items
- Use numbered lists for steps

### Tables
- Use tables for structured data (API parameters, properties, etc.)
- Keep tables simple and scannable

## Documentation Types

### Module READMEs
**Location**: `src/features/modules/[module]/README.md`

**Required Sections**:
- Purpose (one-line description)
- Exports (components, hooks, services, types)
- Usage (code example)
- API Routes (if applicable)
- Related Documentation (links)

**Template**: See `docs/DOCUMENTATION_PLAN.md` for template

### API Documentation
**Location**: `docs/api/[namespace].md`

**Required Sections**:
- Endpoint URLs and methods
- Request/response formats (TypeScript examples)
- Authentication requirements
- Error responses
- Example requests

**Template**: See `docs/DOCUMENTATION_PLAN.md` for template

### Architecture Documentation
**Location**: `docs/ARCHITECTURE.md`

**Content**:
- System overview
- Design patterns
- Data flow
- Module structure

### Development Guides
**Location**: `docs/DEVELOPMENT.md`, `docs/CONTRIBUTING.md`

**Content**:
- How to add features
- How to add API routes
- Common patterns
- Troubleshooting

## Code Examples

### Always Include
- Import statements
- Type definitions
- Working examples
- Error handling (when relevant)

### Example Format
```typescript
// Good: Shows the pattern
import { createGame } from '@/features/modules/games/lib/gameService';

const gameId = await createGame({
  name: 'My Game',
  // ... other fields
});
```

## Links and Cross-References

- Link to related documentation
- Use relative paths: `[Link Text](./path/to/doc.md)`
- Link to code files when helpful: `src/features/modules/games/lib/gameService.ts`
- Keep links up-to-date

## Task Management


- **DO NOT** create task lists in other documentation files
- **DO** use planning documents for strategy, not tasks


## Documentation File Purposes

### Planning Documents (Reference, Not Tasks)
- `DOCUMENTATION_PLAN.md` - Strategy and approach
- `DOCUMENTATION_AUDIT.md` - Inventory of what exists
- `KNOWN_ISSUES.md` - Technical debt tracking
- Implementation plans - Feature planning


## Updating Documentation

### When to Update
- When adding new features
- When changing APIs
- When refactoring code
- When fixing bugs that affect usage
- **When consolidating**: Merge redundant docs, remove duplicates

### How to Update
1. Update the relevant documentation file
2. Keep examples current
3. Update links if files moved
4. Mark tasks complete when done

### When to Consolidate

Look for consolidation opportunities when:
- **Duplicate content**: Same information appears in multiple files
- **Overlapping topics**: Multiple files cover similar subjects
- **Scattered information**: Related content is spread across many files
- **Excessive detail**: Documentation is overly verbose
- **Outdated content**: Documentation for removed/deprecated features
- **Small files**: Multiple small files that could be merged
- **Redundant examples**: Same code example repeated

### How to Consolidate

1. **Identify redundancy**: Find duplicate or overlapping content
2. **Choose target**: Select the best location for consolidated content
3. **Merge intelligently**: Combine content, preserving all essential information
4. **Update links**: Fix all cross-references to point to consolidated location
5. **Remove duplicates**: Delete redundant files after consolidation
6. **Update index**: Update `docs/README.md` and other indexes
7. **Verify**: Ensure no information was lost and all links work

**Consolidation Guidelines**:
- Preserve all unique information
- Maintain clear structure and navigation
- Keep consolidated files under 200 lines when possible
- Use links for related but separate topics
- Document consolidation in task notes

## Related Documentation

- [Documentation Plan](./DOCUMENTATION_PLAN.md) - Strategy and templates
- [Documentation Audit](./DOCUMENTATION_AUDIT.md) - What needs documentation

