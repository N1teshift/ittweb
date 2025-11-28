# Shared Features

**Purpose**: Shared components, hooks, utilities, and services used across the application.

## Exports

### Components (`components/`)
- `Layout` - Main application layout wrapper
- `Header` - Site header/navigation
- `Footer` - Site footer
- `PageHero` - Hero section for pages
- `DataCollectionNotice` - GDPR/data collection notice
- `DiscordButton` - Discord link button
- `GitHubButton` - GitHub link button

### Hooks (`hooks/`)
- `useFallbackTranslation` - Translation fallback handling

### Services (`lib/`)
- `userDataService` - User data CRUD operations
- `archiveService` - Archive entry service (shared with archives module)
- `getStaticProps` - Next.js static props utilities
- `TranslationNamespaceContext` - i18n namespace context

### Utils (`utils/`)
- `loggerUtils` - Error logging utilities (use `logError`, `logAndThrow`, `createComponentLogger`)
- `userRoleUtils` - User role checking utilities (`isAdmin`, `isModerator`, etc.)

## Usage

### Components
```typescript
import { Layout, Header, Footer } from '@/features/shared';

<Layout>
  <Header />
  {/* page content */}
  <Footer />
</Layout>
```

### Services
```typescript
import { getUserDataByDiscordId } from '@/features/shared/lib/userDataService';
import { isAdmin } from '@/features/shared/utils/userRoleUtils';

const userData = await getUserDataByDiscordId('discord-id');
const admin = isAdmin(userData?.role);
```

### Error Logging
```typescript
import { logError, logAndThrow } from '@/features/shared/utils/loggerUtils';

try {
  // operation
} catch (error) {
  logError(error, 'Operation failed', { component: 'my-component' });
}

// Or throw after logging
logAndThrow(error, 'Operation failed', { component: 'my-component' });
```

## Related Documentation

- [Infrastructure](../infrastructure/README.md)
- [Error Handling Guide](../../../docs/operations/testing-guide.md)

