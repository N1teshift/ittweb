# Classes Module

**Purpose**: Class information pages displaying class details and statistics.

## Exports

### Components
- `ClassesPage` - Main classes overview page listing all classes
- `ClassDetailPage` - Individual class detail page with statistics and information

### Hooks
- `useClassesData` - SWR-based hook for fetching classes data with caching
- `useClassData` - SWR-based hook for fetching individual class data with caching

### Types
- `ClassStats` - Class statistics and metadata (imported from analytics module)

## Usage

### Basic Component Usage

```typescript
import { ClassesPage, ClassDetailPage } from '@/features/modules/classes/components';

// Classes overview page
<ClassesPage />

// Individual class detail page
<ClassDetailPage className="mage" />
```

### Using Data Hooks

```typescript
import { useClassesData, useClassData } from '@/features/modules/classes/hooks';

// Fetch all classes with caching
const { classes, loading, error } = useClassesData();

// Fetch specific class data with caching
const { classData, loading, error } = useClassData('mage');
```

## API Routes

- `GET /api/classes` - List all classes with statistics
- `GET /api/classes/[className]` - Get detailed class statistics and information

## Related Documentation

- [Guides Module](./guides/README.md) - Class data source and game mechanics
- [Analytics Module](./analytics/README.md) - Class statistics and charts
- [Classes Data](../../guides/data/units/classes.ts) - Raw class data definitions


