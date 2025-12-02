# Documentation Lifecycle

Guidelines for managing documentation throughout its lifecycle.

## When to Update

- When adding new features
- When changing APIs
- When refactoring code
- When fixing bugs that affect usage
- **When consolidating**: Merge redundant docs, remove duplicates
- **Standards docs**: Must be kept current to maintain project consistency

## How to Update

1. Update the relevant documentation file
2. Keep examples current
3. Update links if files moved
4. Convert completed checklists to summaries of accomplishments

## When Documentation Becomes Obsolete

**Delete if**:
- All content is outdated and no longer useful
- Historical record is not needed
- Information is better captured elsewhere

**Archive to `docs/archive/` if**:
- Document contains analysis or exploration that might be referenced
- Completed plans/audits that document what was done
- One-time investigations that provide context

**Update/Refactor if**:
- Partially outdated but contains useful information
- Delete outdated parts, keep useful parts
- Consider merging useful parts from multiple partially outdated docs into one useful document

## Usefulness Test

When reviewing documentation, ask:
- **"Does this help someone follow a standard/pattern?"**
- **"Does this explain how the system works?"**
- **"Would I reference this while working on a task?"**
- **"Does this help standardize how things work in the project?"**

If the answer is "no" to all questions, the documentation should be deleted or archived.

## When to Consolidate

Look for consolidation opportunities when:
- **Duplicate content**: Same information appears in multiple files
- **Overlapping topics**: Multiple files cover similar subjects
- **Scattered information**: Related content is spread across many files
- **Excessive detail**: Documentation is overly verbose
- **Outdated content**: Documentation for removed/deprecated features
- **Small files**: Multiple small files that could be merged
- **Redundant examples**: Same code example repeated
- **Partially outdated docs**: Multiple docs with some useful, some outdated content - merge the useful parts

## How to Consolidate

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

- [Documentation Style Guide](./DOCUMENTATION_STYLE.md)
- [Documentation Index](./README.md)

