# Logging Inconsistency Analysis

**Date**: 2025-01-15  
**Issue**: Inconsistent use of console.log/warn/error instead of infrastructure logging system

## Summary

Your project has a well-designed infrastructure logging system at `src/features/infrastructure/logging/logger.ts`, but **41 instances** of direct `console.log/warn/error` calls were found across **15 source files** (excluding the logger implementation itself and documentation files).

## What is the Infrastructure Logging System?

Your project has a centralized logging system that provides:

### 1. **Structured Logging**
- Consistent log format with prefixes: `[DEBUG]`, `[INFO]`, `[WARN]`, `[ERROR]`
- Component-based logging with `createComponentLogger(componentName, methodName?)`
- Structured metadata support for better log analysis

### 2. **Log Level Management**
- Environment-based log levels (development vs production)
- Configurable via `LOG_LEVEL` and `ENABLE_DEBUG_LOGS` environment variables
- Automatic filtering based on log level

### 3. **Log Throttling/Deduplication**
- Prevents log spam from repetitive messages
- Throttles info and warn logs after 3 occurrences within 5 seconds
- Never throttles errors (always shown)

### 4. **Error Tracking Integration**
- `logError()` function automatically sends errors to error tracking (Sentry)
- Error categorization (VALIDATION, NETWORK, DATABASE, etc.)
- Contextual metadata for better debugging

### 5. **Component-Specific Loggers**
```typescript
const logger = createComponentLogger('MyComponent', 'handleClick');
logger.info('Button clicked', { userId: 123 });
// Output: [INFO] [MyComponent:handleClick] Button clicked { userId: 123 }
```

## Why This Matters

### Problems with Direct Console Usage:

1. **No Log Level Control**: Direct console calls always execute, even in production
2. **No Throttling**: Can flood logs with repetitive messages
3. **Inconsistent Format**: No standardized prefixes or structure
4. **No Error Tracking**: Errors aren't automatically sent to monitoring systems
5. **No Context**: Missing component/operation context for debugging
6. **Hard to Filter**: Can't easily filter or search logs by component/operation

### Benefits of Infrastructure Logger:

1. **Production Safety**: Logs respect environment settings
2. **Better Debugging**: Component context makes logs easier to trace
3. **Error Monitoring**: Automatic integration with error tracking
4. **Performance**: Throttling prevents log spam
5. **Consistency**: Standardized format across the application

## Current State Analysis

### Files with Console Usage (41 instances across 15 files):

#### **Error Handling Paths** (Most Critical):
- `src/pages/index.tsx` - 1 console.error in error handler
- `src/pages/settings.tsx` - 1 console.error in getServerSideProps
- `src/pages/entries/[id].tsx` - 4 console.error in various error handlers
- `src/features/infrastructure/components/DataCollectionNotice.tsx` - 4 console.error in error handlers
- `src/features/infrastructure/monitoring/errorTracking.ts` - 7 console.error (fallback when Sentry fails)

#### **Debug/Info Logging**:
- `src/features/modules/games/lib/replayParser.ts` - 3 console.log (investigation/debugging)
- `src/features/modules/archives/components/GameLinkedArchiveEntry.tsx` - 1 console.log (debug)

#### **Warnings**:
- `src/pages/api/icons/list.ts` - 2 console.warn
- `src/features/modules/map-analyzer/components/TerrainVisualizer.tsx` - 1 console.warn

#### **Special Cases**:
- `src/pages/_app.tsx` - 4 console.error/warn (intentional override for development)
- `src/features/infrastructure/logging/logger.ts` - 4 console calls (intentional - this IS the logger)
- `src/features/modules/archives/README.md` - 2 console.log (documentation examples)

## Examples of Inconsistent Usage

### ❌ Current (Direct Console):
```typescript
// src/pages/index.tsx:114
catch (err) {
  console.error('Failed to schedule game:', err);
  throw err;
}

// src/pages/settings.tsx:567
catch (error) {
  console.error('Failed to fetch user data:', error);
  return { props: { userData: null } };
}
```

### ✅ Should Be (Infrastructure Logger):
```typescript
import { logError } from '@/features/infrastructure/logging';

// src/pages/index.tsx
catch (err) {
  logError(err as Error, 'Failed to schedule game', {
    component: 'HomePage',
    operation: 'handleScheduleSubmit',
  });
  throw err;
}

// src/pages/settings.tsx
catch (error) {
  logError(error as Error, 'Failed to fetch user data', {
    component: 'SettingsPage',
    operation: 'getServerSideProps',
  });
  return { props: { userData: null } };
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

## Migration Priority

### High Priority (Error Handling):
1. `src/pages/index.tsx` - User-facing error
2. `src/pages/settings.tsx` - Server-side error
3. `src/pages/entries/[id].tsx` - Multiple error handlers
4. `src/features/infrastructure/components/DataCollectionNotice.tsx` - Error handlers

### Medium Priority (Debug/Info):
5. `src/features/modules/games/lib/replayParser.ts` - Debug logging (though some may be intentional for investigation)
6. `src/features/modules/archives/components/GameLinkedArchiveEntry.tsx` - Debug log

### Low Priority (Warnings):
7. `src/pages/api/icons/list.ts` - Non-critical warnings
8. `src/features/modules/map-analyzer/components/TerrainVisualizer.tsx` - Warning

### Exclude (Intentional):
- `src/pages/_app.tsx` - Console override for development (intentional)
- `src/features/infrastructure/logging/logger.ts` - This IS the logger implementation
- `src/features/infrastructure/monitoring/errorTracking.ts` - Fallback when Sentry fails (may be intentional)
- Documentation files (README.md examples)

## Recommendations

1. **Migrate error handlers first** - These are most critical for production monitoring
2. **Use `logError()` for all error cases** - Provides automatic error tracking integration
3. **Use `createComponentLogger()` for component logging** - Provides context
4. **Replace debug console.log with logger.debug()** - Respects log levels
5. **Consider keeping some console.log in replayParser.ts** - If they're temporary investigation logs, but add eslint-disable comments with explanation

## Next Steps

Would you like me to:
1. Create a migration plan with specific file-by-file changes?
2. Start migrating the high-priority error handlers?
3. Create a linting rule to prevent future console usage?

