# Content Module

**Purpose**: Content management for blog posts, class information, and game guides.

## Sub-modules

### blog/
Blog post management and display.

**Exports**:
- Components for blog post rendering and lists
- Utilities for markdown processing
- Types for blog post data

### classes/
Game class information, abilities, items, and units data.

**Exports**:
- Components for class displays, icons, and stats
- Data: abilities, items, units
- Hooks for loading class data
- Utilities for icon mapping and item lookups

### guides/
Game guides and tutorials.

**Exports**:
- Components for guide rendering and navigation
- Utilities for guide processing
- Types for guide data structures

## Usage

```typescript
import { ClassIcon } from '@/features/modules/content/classes';
import { BlogPost } from '@/features/modules/content/blog';
import { GuideCard } from '@/features/modules/content/guides';
```

## Related Documentation

- [Classes Sub-module](./classes/README.md)
- [Guides Sub-module](./guides/README.md)
