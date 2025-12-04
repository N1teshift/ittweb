# Infrastructure Utils

> Date: 2025-12-03

Utility functions for infrastructure-level operations. This directory contains organized utility modules for common operations across the application.

## Structure

This directory is organized into subfolders by functionality:

- **`time/`** - Timestamp and date/time utilities
- **`server/`** - Server-side detection and utilities
- **`object/`** - Object manipulation utilities
- **`service/`** - Service operation wrappers and helpers
- **`accessibility/`** - Accessibility helper functions

## Usage

All utilities are exported from the main `index.ts` file, so you can import them directly:

```typescript
import { timestampToIso, removeUndefined } from '@/features/infrastructure/utils';
```

Or import from specific subfolders if you prefer:

```typescript
import { timestampToIso } from '@/features/infrastructure/utils/time/timestampUtils';
```

## Modules

### Time Utilities (`time/`)

Timestamp and date/time conversion utilities for Firestore.

- `timestampToIso()` - Convert Firestore timestamps to ISO strings
- `createTimestampFactory()` - Create timestamp factory for current environment
- `createTimestampFactoryAsync()` - Async version that ensures admin factory is initialized
- `createClientTimestampFactory()` - Create factory using Client SDK
- `createAdminTimestampFactoryAsync()` - Create factory using Admin SDK (server-side only)

### Server Utilities (`server/`)

Server-side detection utilities.

- `isServerSide()` - Check if code is running on the server
- `isClientSide()` - Check if code is running on the client

### Object Utilities (`object/`)

Object manipulation utilities.

- `removeUndefined()` - Remove undefined values from objects (Firestore doesn't allow undefined)

### Service Utilities (`service/`)

Service operation wrappers for consistent error handling.

- `withServiceOperation()` - Wrap async service operations with error handling
- `withServiceOperationSync()` - Wrap synchronous service operations
- `withServiceOperationNullable()` - Wrap operations that may return null

### Accessibility Utilities (`accessibility/`)

Accessibility helper functions for ARIA labels, keyboard navigation, and screen reader support.

## Best Practices

1. **Use the index exports**: Import from `@/features/infrastructure/utils` when possible for better maintainability
2. **Prefer async timestamp factories**: Use `createTimestampFactoryAsync()` in server-side code
3. **Use service operation wrappers**: Wrap service operations with `withServiceOperation()` for consistent error handling
4. **Avoid direct imports**: Prefer importing from the main index unless you need a specific submodule

## Testing

Test files are located alongside their corresponding utility files in `__tests__/` subdirectories within each module folder.
