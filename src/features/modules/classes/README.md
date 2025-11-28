# Classes Module

**Purpose**: Class information pages displaying class details and statistics.

## Exports

### Components
- `ClassesPage` - List all classes page
- `ClassDetailPage` - Individual class detail page

## Usage

```typescript
import { ClassesPage, ClassDetailPage } from '@/features/modules/classes';

// Use in pages
<ClassesPage />
<ClassDetailPage className="mage" />
```

## API Routes

- `GET /api/classes` - List all classes
- `GET /api/classes/[className]` - Get class details

## Related Documentation

- [Guides Module](./guides/README.md) - Class data source
- [Classes Data](../../guides/data/units/classes.ts)


