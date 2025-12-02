# Logging Analysis

**Date**: 2025-12-02  
**Summary**: Analysis of logging inconsistency issues and infrastructure logging system

## Overview

This document summarizes the analysis of inconsistent logging usage and the infrastructure logging system available in the project.

## Infrastructure Logging System

### Location

**File**: `src/features/infrastructure/logging/logger.ts`

### Features

#### 1. Structured Logging
- Consistent log format with prefixes: `[DEBUG]`, `[INFO]`, `[WARN]`, `[ERROR]`
- Component-based logging with `createComponentLogger(componentName, methodName?)`
- Structured metadata support for better log analysis

#### 2. Log Level Management
- Environment-based log levels (development vs production)
- Configurable via `LOG_LEVEL` and `ENABLE_DEBUG_LOGS` environment variables
- Automatic filtering based on log level

#### 3. Log Throttling/Deduplication
- Prevents log spam from repetitive messages
- Throttles info and warn logs after 3 occurrences within 5 seconds
- Never throttles errors (always shown)

#### 4. Error Tracking Integration
- `logError()` function automatically sends errors to error tracking (Sentry)
- Error categorization (VALIDATION, NETWORK, DATABASE, etc.)
- Contextual metadata for better debugging

#### 5. Component-Specific Loggers
```typescript
const logger = createComponentLogger('MyComponent', 'handleClick');
logger.info('Button clicked', { userId: 123 });
// Output: [INFO] [MyComponent:handleClick] Button clicked { userId: 123 }
```

## Analysis Results

### Current State

**41 instances** of direct `console.log/warn/error` calls found across **15 source files** (excluding the logger implementation itself and documentation files).

### Files with Console Usage

#### Error Handling Paths (Most Critical):
- `src/pages/index.tsx` - 1 console.error in error handler
- `src/pages/settings.tsx` - 1 console.error in getServerSideProps
- `src/pages/entries/[id].tsx` - 4 console.error in various error handlers
- `src/features/infrastructure/components/DataCollectionNotice.tsx` - 4 console.error in error handlers
- `src/features/infrastructure/monitoring/errorTracking.ts` - 7 console.error (fallback when Sentry fails)

#### Debug/Info Logging:
- `src/features/modules/games/lib/replayParser.ts` - 3 console.log (investigation/debugging)
- `src/features/modules/archives/components/GameLinkedArchiveEntry.tsx` - 1 console.log (debug)

#### Warnings:
- `src/pages/api/icons/list.ts` - 2 console.warn
- `src/features/modules/map-analyzer/components/TerrainVisualizer.tsx` - 1 console.warn

#### Special Cases:
- `src/pages/_app.tsx` - 4 console.error/warn (intentional override for development)
- `src/features/infrastructure/logging/logger.ts` - 4 console calls (intentional - this IS the logger)
- `src/features/modules/archives/README.md` - 2 console.log (documentation examples)

## Problems with Direct Console Usage

1. **No Log Level Control**: Direct console calls always execute, even in production
2. **No Throttling**: Can flood logs with repetitive messages
3. **Inconsistent Format**: No standardized prefixes or structure
4. **No Error Tracking**: Errors aren't automatically sent to monitoring systems
5. **No Context**: Missing component/operation context for debugging
6. **Hard to Filter**: Can't easily filter or search logs by component/operation

## Benefits of Infrastructure Logger

1. **Production Safety**: Logs respect environment settings
2. **Better Debugging**: Component context makes logs easier to trace
3. **Error Monitoring**: Automatic integration with error tracking
4. **Performance**: Throttling prevents log spam
5. **Consistency**: Standardized format across the application

## Migration Recommendations

### High Priority (Error Handling):
1. `src/pages/index.tsx` - User-facing error
2. `src/pages/settings.tsx` - Server-side error
3. `src/pages/entries/[id].tsx` - Multiple error handlers
4. `src/features/infrastructure/components/DataCollectionNotice.tsx` - Error handlers

### Medium Priority (Debug/Info):
5. `src/features/modules/games/lib/replayParser.ts` - Debug logging
6. `src/features/modules/archives/components/GameLinkedArchiveEntry.tsx` - Debug log

### Low Priority (Warnings):
7. `src/pages/api/icons/list.ts` - Non-critical warnings
8. `src/features/modules/map-analyzer/components/TerrainVisualizer.tsx` - Warning

### Exclude (Intentional):
- `src/pages/_app.tsx` - Console override for development (intentional)
- `src/features/infrastructure/logging/logger.ts` - This IS the logger implementation
- `src/features/infrastructure/monitoring/errorTracking.ts` - Fallback when Sentry fails (may be intentional)
- Documentation files (README.md examples)

## Migration Pattern

### For Error Handling:
```typescript
// ❌ Current
catch (err) {
  console.error('Failed to schedule game:', err);
  throw err;
}

// ✅ Should Be
import { logError } from '@/features/infrastructure/logging';
catch (err) {
  logError(err as Error, 'Failed to schedule game', {
    component: 'HomePage',
    operation: 'handleScheduleSubmit',
  });
  throw err;
}
```

### For Debug/Info Logging:
```typescript
// ❌ Current
console.log('[GameLinkedArchiveEntry] Leave button clicked', { gameId: game.id });

// ✅ Should Be
import { createComponentLogger } from '@/features/infrastructure/logging';
const logger = createComponentLogger('GameLinkedArchiveEntry');
logger.debug('Leave button clicked', { gameId: game.id });
```

## Current State

The infrastructure logging system is available and well-designed. Migration from direct console usage to the infrastructure logger would improve:
- Production log management
- Error tracking
- Debugging capabilities
- Log consistency

## Related Documentation

- Error handling: `docs/ERROR_HANDLING.md`
- Infrastructure: `src/features/infrastructure/README.md`

