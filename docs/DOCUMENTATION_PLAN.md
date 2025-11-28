# Documentation Plan: Minimal Documentation Strategy

## What "Proper Minimal Documentation" Means

**Minimal documentation** means:
- **Concise**: Only essential information, no verbose explanations
- **Complete**: Covers all features, modules, APIs, and systems
- **Actionable**: Helps developers understand and use the codebase quickly
- **Maintainable**: Easy to update as the codebase evolves

## Current Documentation Status

### ✅ Well Documented
- **Schemas**: `docs/schemas/firestore-collections.md` - Complete Firestore schema definitions
- **Product Overview**: `docs/product/` - Status, summary, improvements, user roles
- **Operations**: `docs/operations/` - Testing guides, test plans
- **Systems**: `docs/systems/` - Game stats, replay parser implementation plans
- **Scripts**: `scripts/README.md` - Data pipeline documentation

### ⚠️ Partially Documented
- **API Routes**: Some routes documented in test plans, but no centralized API reference
- **Feature Modules**: Individual modules lack README files explaining their purpose and usage
- **Infrastructure**: Core infrastructure (auth, logging, Firebase) lacks usage documentation
- **Shared Utilities**: Utility functions lack usage examples

### ❌ Missing Documentation
- **Module READMEs**: Each feature module needs a brief README
- **API Reference**: Centralized API endpoint documentation
- **Component Library**: Shared components usage guide
- **Hooks Documentation**: Custom hooks usage and examples
- **Development Workflow**: How to add new features, run scripts, etc.

## Documentation Structure Plan

### 1. Root Level Documentation
```
├── README.md (✅ exists, needs update)
├── CONTRIBUTING.md (❌ missing)
├── ARCHITECTURE.md (❌ missing - high-level overview)
└── API.md (❌ missing - API reference)
```

### 2. Module-Level Documentation
Each feature module should have:
```
src/features/modules/[module]/
├── README.md (❌ missing for most modules)
│   - Purpose
│   - Key exports
│   - Usage examples
│   - Related API routes
```

**Modules needing READMEs:**
- `analytics/` - Analytics service and chart components
- `archives/` - Archive entry management
- `blog/` - Blog post system
- `classes/` - Class information pages
- `entries/` - Entry form system
- `games/` - Game statistics and management
- `guides/` - Game guides and data
- `map-analyzer/` - Map visualization tools
- `meta/` - Analytics dashboard
- `players/` - Player statistics and profiles
- `scheduled-games/` - Scheduled game management
- `standings/` - Leaderboards
- `tools/` - Utility tools (icon mapper, etc.)

### 3. Infrastructure Documentation
```
src/features/infrastructure/
├── README.md (❌ missing)
│   - Auth system
│   - Firebase setup
│   - Logging system
│   - API route handlers
│   - Shared UI components
```

### 4. Shared Documentation
```
src/features/shared/
├── README.md (❌ missing)
│   - Shared components (Layout, Header, Footer, etc.)
│   - Shared hooks
│   - Shared utilities
│   - User data service
```

### 5. API Documentation
```
docs/api/
├── README.md (❌ missing - API index)
├── games.md (❌ missing)
├── players.md (❌ missing)
├── archives.md (❌ missing)
├── scheduled-games.md (❌ missing)
├── analytics.md (❌ missing)
└── ... (one file per API namespace)
```

## Minimal Documentation Template

### Module README Template
```markdown
# [Module Name]

**Purpose**: Brief one-line description

## Exports

### Components
- `ComponentName` - Brief description

### Hooks
- `useHookName` - Brief description

### Services
- `serviceName` - Brief description

### Types
- `TypeName` - Brief description

## Usage

```typescript
// Minimal example
```

## API Routes

- `GET /api/[route]` - Description
- `POST /api/[route]` - Description

## Related Documentation

- [Link to relevant docs]
```

### API Route Documentation Template
```markdown
# [Route Name] API

## Endpoints

### `GET /api/[route]`
**Description**: One-line description

**Query Parameters**:
- `param` (string, optional) - Description

**Response**:
```typescript
{
  // Example response
}
```

### `POST /api/[route]`
**Description**: One-line description

**Request Body**:
```typescript
{
  // Example request
}
```

**Response**:
```typescript
{
  // Example response
}
```
```

## Implementation Priority

### Phase 1: Critical (Start Here)
1. **Root README.md** - Update with current project state
2. **API.md** - Centralized API reference
3. **Module READMEs** for core features:
   - `games/`
   - `players/`
   - `archives/`
   - `scheduled-games/`

### Phase 2: Important
4. **Infrastructure README** - Auth, Firebase, logging
5. **Shared README** - Shared components and utilities
6. **Module READMEs** for remaining features:
   - `analytics/`
   - `blog/`
   - `standings/`
   - `guides/`
   - `map-analyzer/`
   - `tools/`

### Phase 3: Nice to Have
7. **ARCHITECTURE.md** - High-level system architecture
8. **CONTRIBUTING.md** - Development workflow
9. **Component library docs** - Detailed component usage

## Documentation Principles

1. **Keep it minimal**: One page per module/API namespace
2. **Code examples**: Include at least one usage example
3. **Link to code**: Reference actual files when helpful
4. **Update with code**: Documentation should live next to code
5. **No duplication**: Reference existing docs rather than repeating

## Next Steps

1. **Audit existing code**: Identify all modules, APIs, and utilities
2. **Create templates**: Standardize documentation format
3. **Generate initial docs**: Create minimal READMEs for each module
4. **Create API reference**: Document all API endpoints
5. **Update root docs**: Refresh README.md and create missing root docs

