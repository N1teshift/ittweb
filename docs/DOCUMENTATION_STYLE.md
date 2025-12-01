# Documentation Style Guide

**This is the single source of truth for documentation preferences and standards.**

## Core Principles

1. **Minimal**: Keep files concise and focused
2. **Complete**: Cover all essential information for current use (not historical completeness)
3. **Actionable**: Explains how something works (architecture, design decisions, patterns, standards)
4. **Useful**: Helps standardize how things work in the project; enables following standards/patterns
5. **Maintainable**: Easy to update as codebase evolves
6. **No Duplication**: Reference existing docs rather than repeating
7. **Consolidated**: Merge redundant documentation, reduce bloat

## File Size

- **Guideline**: Keep files concise and focused; split into multiple files if a document becomes difficult to navigate or maintain
- **Consider splitting when**: Documentation covers multiple distinct topics, becomes hard to scan, or is difficult to update
- **Longer files are acceptable**: When content is cohesive and splitting would reduce clarity (e.g., comprehensive guides, reference documents, schemas, plans)

## Writing Style

### Structure
- **Clear Headings**: Use proper heading hierarchy (##, ###, ####)
- **Examples First**: Show code examples before explaining
- **Scannable**: Use lists, tables, and code blocks for clarity
- **Links**: Link to related documentation

### Content
- **Concise**: Get to the point quickly
- **Complete**: Cover all essential information for current use
- **Explanatory**: Focus on how things work, not just what to do
- **Code Examples**: Include working code examples when demonstrating patterns
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
- **Completed sections**: Convert completed checklists/task lists to summaries of what was accomplished

## Documentation File Purposes

### Standards Documentation (Crucial - Keep Updated)
Standards documentation defines how things should work in the project. These documents must be kept current and accurate.

**Examples**:
- `ERROR_HANDLING.md` - Error handling patterns and standards
- `VALIDATION.md` - Validation standards
- `FIRESTORE_CRUD.md` - Firestore CRUD patterns
- `DOCUMENTATION_STYLE.md` - This file
- Scripts folder standards
- Any document that enforces project-wide patterns

**Naming**: Use simple, descriptive names (e.g., `ERROR_HANDLING.md`, not `ERROR_HANDLING_STANDARDS.md`)

### Research/Analysis Documentation (Archive and Summarize)
One-time investigations, explorations, completed plans, and analysis documents.

**Location**: `docs/research/`

**Examples**:
- Completed refactoring plans
- Data exploration documents
- Implementation summaries (after implementation is complete)
- Performance analysis reports
- Code audits

**Lifecycle**: Archive in `docs/research/` and periodically summarize key findings. User initiates summaries when needed.

### Planning Documents (Reference, Not Tasks)
- `DOCUMENTATION_PLAN.md` - Strategy and approach
- `DOCUMENTATION_AUDIT.md` - Inventory of what exists
- `KNOWN_ISSUES.md` - Technical debt tracking
- Implementation plans - Feature planning


## Documentation Lifecycle

See [Documentation Lifecycle Guide](./documentation-lifecycle.md) for complete lifecycle management:
- When and how to update documentation
- When documentation becomes obsolete
- Consolidation guidelines and process

## Related Documentation

- [Documentation Lifecycle](./documentation-lifecycle.md) - Lifecycle management and consolidation
- [Documentation Index](./README.md) - Navigation to all documentation

