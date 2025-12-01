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

### When to Update
- When adding new features
- When changing APIs
- When refactoring code
- When fixing bugs that affect usage
- **When consolidating**: Merge redundant docs, remove duplicates
- **Standards docs**: Must be kept current to maintain project consistency

### How to Update
1. Update the relevant documentation file
2. Keep examples current
3. Update links if files moved
4. Convert completed checklists to summaries of accomplishments

### When Documentation Becomes Obsolete

**Delete if**:
- All content is outdated and no longer useful
- Historical record is not needed
- Information is better captured elsewhere

**Archive to `docs/research/` if**:
- Document contains analysis or exploration that might be referenced
- Completed plans/audits that document what was done
- One-time investigations that provide context

**Update/Refactor if**:
- Partially outdated but contains useful information
- Delete outdated parts, keep useful parts
- Consider merging useful parts from multiple partially outdated docs into one useful document

### Usefulness Test

When reviewing documentation, ask:
- **"Does this help someone follow a standard/pattern?"**
- **"Does this explain how the system works?"**
- **"Would I reference this while working on a task?"**
- **"Does this help standardize how things work in the project?"**

If the answer is "no" to all questions, the documentation should be deleted or archived.

### When to Consolidate

Look for consolidation opportunities when:
- **Duplicate content**: Same information appears in multiple files
- **Overlapping topics**: Multiple files cover similar subjects
- **Scattered information**: Related content is spread across many files
- **Excessive detail**: Documentation is overly verbose
- **Outdated content**: Documentation for removed/deprecated features
- **Small files**: Multiple small files that could be merged
- **Redundant examples**: Same code example repeated
- **Partially outdated docs**: Multiple docs with some useful, some outdated content - merge the useful parts

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
- Keep consolidated files focused and maintainable
- Use links for related but separate topics
- Document consolidation in task notes

## Related Documentation

- [Documentation Plan](./DOCUMENTATION_PLAN.md) - Strategy and templates
- [Documentation Audit](./DOCUMENTATION_AUDIT.md) - What needs documentation

