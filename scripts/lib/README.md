# Scripts Library - Shared Utilities

This directory contains shared utilities used across all scripts for modularity, efficiency, and maintainability.

## Modules

### `constants.mjs`
Centralized path and configuration constants.
- `PATHS` - All file and directory paths
- `ICON_CATEGORIES` - Valid icon categories
- `ITEM_FILES` - List of item data files
- `ABILITY_FILES` - List of ability data files

### `logger.mjs`
Centralized logging with levels and optional file output.
```javascript
import { info, warn, error, createLogger } from './lib/logger.mjs';

// Set log level
setLogLevel('debug'); // 'error', 'warn', 'info', 'debug'

// Use logger
info('Processing items...');
warn('Missing icon found', { item: 'Sword' });
error('Failed to parse file', { file: 'items.ts' });

// Create scoped logger
const logger = createLogger('IconMapper');
logger.info('Starting mapping...');
```

### `errors.mjs`
Error handling with custom error classes and safe file operations.
```javascript
import { FileError, ParseError, ValidationError, handleError, safeReadFile, safeWriteFile } from './lib/errors.mjs';

// Custom errors
throw new FileError('File not found', '/path/to/file');
throw new ParseError('Invalid JSON', 'data.json');
throw new ValidationError('Invalid name', 'name', value);

// Error handling
try {
  // ... code ...
} catch (error) {
  handleError(error, 'Context description', () => {
    // Recovery function
    return defaultValue;
  });
}

// Safe file operations
const content = safeReadFile('/path/to/file', 'default content');
safeWriteFile('/path/to/file', content);
```

### `cache.mjs`
In-memory caching for expensive operations.
```javascript
import { getCache, setCache, clearCache, cacheFunction } from './lib/cache.mjs';

// Manual caching
const cached = getCache('myKey');
if (cached === null) {
  const result = expensiveOperation();
  setCache('myKey', result);
}

// Function caching
const cachedFn = cacheFunction(expensiveFunction, (args) => `key_${args[0]}`, 60000);
const result = cachedFn('arg1', 'arg2');
```

### `config.mjs`
Configuration constants for thresholds, limits, and behavior.
```javascript
import { CONFIG, getConfig } from './lib/config.mjs';

// Access config
const minSimilarity = CONFIG.FUZZY_MATCH.MIN_SIMILARITY;
const maxResults = CONFIG.FUZZY_MATCH.MAX_RESULTS;

// Or use getConfig
const threshold = getConfig('FUZZY_MATCH.MIN_SIMILARITY', 0.5);
```

### `validation.mjs`
Input validation and sanitization.
```javascript
import { validateName, validateId, validateIconFilename, sanitizeForPath } from './lib/validation.mjs';

// Validate inputs
const name = validateName(itemName, 'itemName');
const id = validateId(itemId);
const filename = validateIconFilename('icon.png');

// Sanitize
const safePath = sanitizeForPath('My Item Name!');
```

### `icon-utils.mjs`
Icon file operations (cached and optimized).
- `getAllIconFiles(iconsDir, useCache)` - Get all icon files (cached)
- `extractIconFilename(iconPath)` - Extract filename from path
- `findIconFile(iconPath, allIcons)` - Find icon file (case-insensitive)
- `normalize(str)` - Normalize string for matching
- `suggestIconFilename(name)` - Generate suggested filename
- `findFuzzyMatch(iconPath, allFilenames, maxResults, minSimilarity)` - Fuzzy matching

### `iconmap-utils.mjs`
IconMap parsing and generation (cached).
- `parseIconMap(content, useCache)` - Parse iconMap.ts (cached)
- `generateIconMap(iconMap)` - Generate iconMap.ts content
- `updateIconMap(newMappings)` - Update iconMap.ts file
- `escapeForJS(str)` - Escape string for JS/TS

### `data-readers.mjs`
TypeScript data file readers.
- `readItemsFromTS(itemsDir)` - Read items from TS files
- `readAbilitiesFromTS(abilitiesDir)` - Read abilities from TS files
- `readUnitsFromTS(unitsFile)` - Read units from TS file
- `readBaseClassesFromTS()` - Read base classes
- `readDerivedClassesFromTS()` - Read derived classes
- `readClassesFromTS()` - Read all classes (base + derived)

## Benefits for Testing & Targeted Corrections

### 1. **Modularity**
Each utility is self-contained and can be tested independently. Functions accept parameters, making them easy to mock and test.

### 2. **Caching**
Expensive operations (file reading, parsing) are cached, reducing redundant work during testing.

### 3. **Error Handling**
Custom error classes provide context, making it easy to identify and fix specific issues.

### 4. **Logging**
Structured logging helps identify where issues occur during testing.

### 5. **Configuration**
All thresholds and limits are centralized, making it easy to adjust behavior for testing.

### 6. **Validation**
Input validation catches issues early, preventing cascading errors.

## Usage Example

```javascript
import { getAllIconFiles } from '../lib/icon-utils.mjs';
import { readItemsFromTS } from '../lib/data-readers.mjs';
import { parseIconMap } from '../lib/iconmap-utils.mjs';
import { CONFIG } from '../lib/config.mjs';
import { createLogger } from '../lib/logger.mjs';
import { handleError } from '../lib/errors.mjs';

const logger = createLogger('MyScript');

try {
  // Load data (cached automatically)
  const { icons } = getAllIconFiles();
  const items = readItemsFromTS();
  const iconMap = parseIconMap();
  
  // Process with configurable thresholds
  const matches = findFuzzyMatch(
    item.iconPath,
    allFilenames,
    CONFIG.FUZZY_MATCH.MAX_RESULTS,
    CONFIG.FUZZY_MATCH.MIN_SIMILARITY
  );
  
  logger.info('Processing complete', { items: items.length });
} catch (error) {
  handleError(error, 'MyScript', () => {
    logger.warn('Using fallback');
    return defaultValue;
  });
}
```

## Testing Strategy

1. **Unit Tests**: Test each utility function independently
2. **Integration Tests**: Test combinations of utilities
3. **Mocking**: Use dependency injection for file operations
4. **Cache Clearing**: Clear cache between tests for consistency
5. **Error Scenarios**: Test error handling paths

## Performance Optimizations

- **Caching**: File reads and parsing are cached (5-15 min TTL)
- **Lazy Loading**: Icons are only loaded when needed
- **Efficient Regex**: Compiled regex patterns where possible
- **Map Lookups**: O(1) lookups for icon files

## Future Enhancements

- Add TypeScript type definitions
- Add unit test suite
- Add performance profiling
- Add metrics collection
- Add configuration file support



