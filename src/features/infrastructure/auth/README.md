# Authentication Module

**Purpose**: User authentication and authorization infrastructure.

## Exports

### Components
- Authentication forms and UI components
- Login/logout buttons
- User profile displays

### Hooks
- Authentication state management
- User session hooks
- Permission checking hooks

### Services
- Firebase authentication integration
- OAuth providers (Discord, Google, Microsoft)
- Session management
- Token handling

### Types
- User authentication types
- Session data structures
- Permission types

### Configuration
- Authentication provider configuration
- Security settings

## Usage

```typescript
import { useAuth } from '@/features/infrastructure/auth/hooks';
import { LoginButton } from '@/features/infrastructure/auth/components';
import type { AuthUser } from '@/features/infrastructure/auth/types';
```

## Related Documentation

- [API Module](../api/README.md) - Authentication middleware
- [Firebase Documentation](https://firebase.google.com/docs/auth)
