# Architecture Overview

High-level system architecture and design patterns.

## System Overview

ITT Web is a Next.js application for Island Troll Tribes game statistics, community features, and content management.

## Technology Stack

- **Framework**: Next.js 15.0.3 (React 18)
- **Language**: TypeScript (strict mode)
- **Database**: Firebase Firestore
- **Authentication**: NextAuth.js (Discord OAuth)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Testing**: Jest + React Testing Library
- **Internationalization**: next-i18next

## Architecture Layers

### 1. Presentation Layer

**Location**: `src/pages/`, `src/features/modules/*/components/`

- Next.js pages (routing)
- React components
- UI components (`src/features/infrastructure/shared/components/ui/`)
- Shared layout components

**Pattern**: Feature-based component organization

### 2. Business Logic Layer

**Location**: `src/features/modules/*/lib/`

- Service functions (CRUD operations)
- Business logic (ELO calculations, statistics)
- Data transformations
- Validation logic

**Pattern**: Service layer pattern - all data operations go through services

### 3. Data Access Layer

**Location**: `src/features/infrastructure/api/firebase/`

- Firebase Admin SDK (server-side)
- Firebase Client SDK (client-side)
- Firestore operations
- Storage operations

**Pattern**: Infrastructure abstraction - Firebase details hidden behind infrastructure layer

### 4. API Layer

**Location**: `src/pages/api/`

- Next.js API routes
- Request/response handling
- Authentication checks
- Error handling

**Pattern**: RESTful API with standardized handlers (`createApiHandler`)

## Data Flow

### Client-Side Flow

```
User Action
  ↓
React Component
  ↓
Custom Hook (useGames, usePlayerStats, etc.)
  ↓
API Route (/api/games, /api/players, etc.)
  ↓
Service Layer (gameService, playerService)
  ↓
Firebase Client SDK (client-side) OR
Firebase Admin SDK (server-side)
  ↓
Firestore Database
```

### Server-Side Flow

```
API Request
  ↓
API Route Handler
  ↓
Authentication Check (NextAuth)
  ↓
Service Layer
  ↓
Firebase Admin SDK
  ↓
Firestore Database
  ↓
Response
```

## Module Structure

Each feature module follows this structure:

```
src/features/modules/[module]/
├── README.md          # Documentation
├── index.ts          # Barrel exports
├── components/       # React components
│   ├── ComponentName.tsx
│   └── index.ts
├── hooks/           # Custom React hooks
│   ├── useHookName.ts
│   └── index.ts
├── lib/             # Service layer
│   ├── [module]Service.ts
│   └── index.ts
└── types/           # TypeScript types
    └── index.ts
```

## Infrastructure Components

### Authentication

**Location**: `src/features/infrastructure/auth/`, `src/pages/api/auth/`

- NextAuth.js configuration
- Discord OAuth provider
- Session management
- JWT token handling

### Logging

**Location**: `src/features/infrastructure/logging/`, `src/features/shared/utils/loggerUtils.ts`

- Component-specific loggers
- Error categorization
- Environment-aware logging levels
- Console-based (development) / structured (production)

### Firebase

**Location**: `src/features/infrastructure/api/firebase/`

- **Client**: Browser-side Firebase operations
- **Admin**: Server-side Firebase operations
- **Config**: Environment-based configuration

### API Handlers

**Location**: `src/features/infrastructure/api/routeHandlers.ts`

- Standardized API route handler (`createApiHandler`)
- Method validation
- Error handling
- Response formatting
- Authentication integration

## Shared Features

### Components

**Location**: `src/features/shared/components/`

- Layout wrapper
- Header/Navigation
- Footer
- PageHero
- Data collection notice

### Services

**Location**: `src/features/shared/lib/`

- `userDataService` - User data operations
- `archiveService` - Archive entry operations
- `getStaticProps` - Next.js static props utilities

### Utilities

**Location**: `src/features/shared/utils/`

- `loggerUtils` - Error logging utilities
- `userRoleUtils` - Role checking (admin, moderator, etc.)

## Database Schema

### Collections

- `games` - Game records
- `games/{gameId}/players` - Players in a game (subcollection)
- `playerStats` - Player statistics
- `scheduledGames` - Scheduled game events
- `archiveEntries` - Archive entries (replays, clips)
- `posts` - Blog posts
- `userData` - User account data

**Schema Documentation**: [Firestore Collections Schema](./schemas/firestore-collections.md)

### Design Principles

- **Standardized Fields**: All collections use `creatorName`, `createdByDiscordId`, `createdAt`, `updatedAt`
- **Soft Deletes**: Optional `isDeleted`, `deletedAt` fields
- **Links**: Use `linkedGameDocumentId`, `linkedArchiveDocumentId` for relationships
- **No Migrations**: Schema is fixed - no backward compatibility code

## Security Architecture

### Authentication

- NextAuth.js handles OAuth flow
- JWT tokens for session management
- Server-side session validation

### Authorization

- Role-based access control (admin, moderator, user)
- API route-level authentication checks
- Firestore security rules

### Data Validation

- TypeScript types for compile-time safety
- Runtime validation in services
- Firestore rules for database-level security

## Error Handling

### Pattern

1. **Service Layer**: Catch errors, log with context
2. **API Layer**: Handle errors, return appropriate status codes
3. **Component Layer**: Display user-friendly error messages

### Logging

- All errors logged with `logError()` or `logAndThrow()`
- Error categorization (VALIDATION, NETWORK, DATABASE, etc.)
- Component and operation context included

## Performance Considerations

### Client-Side

- React component optimization
- Code splitting (Next.js automatic)
- Image optimization (Next.js Image component)
- Lazy loading for charts and heavy components

### Server-Side

- API route optimization
- Firestore query optimization (indexes, pagination)
- Caching strategies (Next.js ISR, API caching)

### Database

- Firestore composite indexes for complex queries
- Pagination for large datasets
- Efficient data structures

## Testing Architecture

### Unit Tests

- Service layer functions
- Utility functions
- Component logic

### Integration Tests

- API routes
- Service + Firebase integration
- Component + API integration

### E2E Tests

- Critical user flows
- Authentication flows
- Data creation flows

**Test Documentation**: [Testing Guide](./operations/testing-guide.md)

## Deployment Architecture

### Build Process

1. TypeScript compilation
2. Next.js build (pages, API routes, static assets)
3. Bundle optimization
4. Static generation (where applicable)

### Hosting

- **Recommended**: Vercel (Next.js optimized)
- **Alternatives**: Netlify, AWS Amplify, self-hosted

### Environment Configuration

- Environment variables for configuration
- Separate Firebase projects for dev/prod (recommended)
- Firebase App Check for production security

## Related Documentation

- [Development Guide](./DEVELOPMENT.md)
- [Module Documentation](../src/features/modules/README.md)
- [API Reference](./api/README.md)
- [Firestore Schemas](./schemas/firestore-collections.md)

