# Infrastructure vs Modules Architecture

> Date: 2025-12-04

## Overview

This project follows a **Layered Architecture** pattern (also known as Clean Architecture or Hexagonal Architecture) that separates generic, reusable infrastructure code from project-specific business logic.

## Architecture Pattern

### Infrastructure Layer (`src/features/infrastructure/`)

**Purpose**: Generic, reusable code that can be extracted to a separate package/library.

**Characteristics**:
- ✅ Framework-aware but domain-agnostic
- ✅ No business logic dependencies
- ✅ Reusable across different projects
- ✅ Well-documented and tested
- ✅ Can be "drag and drop" to other projects

**Contains**:
- Generic UI components (Button, Card, LoadingScreen)
- Framework utilities (Firebase helpers, API handlers)
- Cross-cutting concerns (logging, monitoring, error tracking)
- Pure utilities (object manipulation, time formatting)
- Generic hooks (data fetching, translation)

**Should NOT contain**:
- ❌ Business logic
- ❌ Domain-specific types
- ❌ Project-specific components (e.g., GameCardSkeleton)
- ❌ Hardcoded project values (e.g., Discord invite URLs)
- ❌ Project-specific schemas

### Modules Layer (`src/features/modules/`)

**Purpose**: Project-specific business logic and domain implementations.

**Characteristics**:
- ✅ Contains business/domain logic
- ✅ Depends on infrastructure, not vice versa
- ✅ Project-specific to ITT Web application
- ✅ Uses infrastructure utilities

**Contains**:
- Domain modules (games, players, archives, analytics)
- Business services (archiveService, playerService)
- Domain-specific components (PlayerCard, GameDetailsSection)
- Project-specific types and schemas
- Business logic implementations

## Dependency Rules

### ✅ Allowed Dependencies

```
Modules → Infrastructure (✅ Good)
```

Modules can import from infrastructure:
```typescript
import { logError } from '@/features/infrastructure/logging';
import { Button, Card } from '@/features/infrastructure/components';
import { getFirestoreInstance } from '@/features/infrastructure/api/firebase';
```

### ❌ Forbidden Dependencies

```
Infrastructure → Modules (❌ Never)
```

Infrastructure should NEVER import from modules:
```typescript
// ❌ BAD - Infrastructure importing from modules
import { GameService } from '@/features/modules/game-management/games';
```

## Decision Criteria

### When to put code in Infrastructure

Ask yourself:
1. **Can this be used in another project?** → Infrastructure
2. **Is this framework-aware but domain-agnostic?** → Infrastructure
3. **Does this have no business logic?** → Infrastructure
4. **Is this a pure utility function?** → Infrastructure

**Examples**:
- ✅ `utils/object/objectUtils.ts` - Pure object manipulation
- ✅ `api/firebase/firestoreHelpers.ts` - Generic Firestore utilities
- ✅ `components/containers/Card.tsx` - Generic card component
- ✅ `logging/logger.ts` - Generic logging system

### When to put code in Modules

Ask yourself:
1. **Is this specific to ITT Web?** → Modules
2. **Does this contain business logic?** → Modules
3. **Does this depend on domain types?** → Modules
4. **Is this a project-specific component?** → Modules

**Examples**:
- ✅ `modules/community/archives/services/archiveService.ts` - ITT-specific archive logic
- ✅ `modules/game-management/games/lib/gameService.ts` - Game business logic
- ✅ `modules/shared/components/skeletons/GameCardSkeleton.tsx` - ITT-specific skeleton
- ✅ `modules/content/blog/lib/schemas.ts` - Project-specific schemas

## Structure

```
src/features/
├── infrastructure/          # Generic, reusable code
│   ├── api/                 # API utilities (handlers, validation)
│   ├── components/          # Generic UI components
│   ├── hooks/               # Generic React hooks
│   ├── lib/                 # Generic libraries (cache, context)
│   ├── logging/             # Logging system
│   ├── monitoring/          # Error tracking, performance
│   └── utils/               # Pure utility functions
│
└── modules/                 # Project-specific business logic
    ├── analytics-group/     # Analytics domain
    ├── community/          # Community features (archives, players)
    ├── content/            # Content management (blog, guides)
    ├── game-management/    # Game domain logic
    └── shared/             # Shared across modules (but still project-specific)
```

## Migration Guidelines

When moving code from infrastructure to modules:

1. **Identify project-specific code** in infrastructure
2. **Determine target module** (or create new one)
3. **Move files** to appropriate location
4. **Update imports** across codebase
5. **Update exports** in index files
6. **Update tests** and documentation
7. **Verify build** passes

## Related Patterns

This architecture is inspired by:
- **Clean Architecture** (Infrastructure = outer layer)
- **Hexagonal Architecture** (Infrastructure = adapters)
- **Onion Architecture** (Infrastructure = outer rings)
- **Layered Architecture** (Infrastructure = foundation layer)

## Benefits

1. **Reusability**: Infrastructure can be extracted to a package
2. **Testability**: Infrastructure can be tested independently
3. **Maintainability**: Clear boundaries and responsibilities
4. **Scalability**: Easy to add new modules
5. **Team Clarity**: Clear ownership and structure

## Examples

### ✅ Good: Infrastructure Component

```typescript
// infrastructure/components/containers/Card.tsx
export function Card({ children, variant, className }: CardProps) {
  // Generic card component - no business logic
  return <div className={...}>{children}</div>;
}
```

### ✅ Good: Module Using Infrastructure

```typescript
// modules/community/players/components/PlayerCard.tsx
import { Card } from '@/features/infrastructure/components';

export function PlayerCard({ player }: { player: Player }) {
  // Uses generic Card, adds business logic
  return (
    <Card variant="medieval">
      <h3>{player.name}</h3>
      <p>ELO: {player.elo}</p>
    </Card>
  );
}
```

### ❌ Bad: Infrastructure with Business Logic

```typescript
// ❌ infrastructure/components/skeletons/GameCardSkeleton.tsx
// This is ITT-specific, should be in modules/shared/components/skeletons/
```

### ❌ Bad: Infrastructure Importing from Modules

```typescript
// ❌ infrastructure/utils/user/userRoleUtils.ts
import { UserRole } from '@/types/userData'; // Depends on project types
// Should be in modules/community/users/utils/
```

## Further Reading

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Layered Architecture Pattern](https://www.oreilly.com/library/view/software-architecture-patterns/9781491971437/ch01.html)

