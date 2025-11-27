# Data Generation Scripts - Refactoring Plan

## Summary of Optimizations Needed

### 1. Code Duplication ✅ FIXED
- **Issue**: Multiple scripts duplicate utility functions (`slugify`, `loadJson`, `writeJson`, etc.)
- **Solution**: Created `utils.mjs` shared utilities file
- **Status**: ✅ Created - needs to be integrated into scripts

### 2. Unused Code
- **Issue**: 
  - `MAP_FILE` constant in `extract-from-w3x.mjs` (line 30) is never used
  - Placeholder functions that return empty arrays (`extractRecipesFromJASS`, `extractRecipesFromItems`)
- **Solution**: Remove unused constants, either implement or remove placeholder functions

### 3. Inconsistent Error Handling
- **Issue**: Some scripts use try/catch, others use null checks, inconsistent error messages
- **Solution**: Standardize error handling patterns

### 4. Performance Optimizations
- **Issue**: 
  - Multiple file reads could be batched
  - Some regex operations could be cached
  - Large string operations in `convert-extracted-to-typescript.mjs`
- **Solution**: Optimize hot paths

### 5. Code Organization
- **Issue**: `convert-extracted-to-typescript.mjs` is 1656 lines - very long
- **Solution**: Consider splitting into smaller modules if beneficial

### 6. Type Safety
- **Issue**: No input validation on parsed JSON structures
- **Solution**: Add basic validation for expected data shapes

## Priority Refactoring Tasks

### High Priority ✅
1. **Integrate shared utilities** - Replace duplicate functions with imports from `utils.mjs`
2. **Remove unused code** - Clean up `MAP_FILE` and placeholder functions

### Medium Priority
3. **Improve error handling** - Add consistent error handling across scripts
4. **Add input validation** - Validate JSON structures after loading

### Low Priority
5. **Performance optimizations** - Only if generation time becomes an issue
6. **Split large files** - Only if maintainability becomes a problem

## Files to Refactor

1. ✅ `utils.mjs` - Created
2. `extract-metadata.mjs` - Small, good candidate for refactoring first
3. `extract-from-w3x.mjs` - Medium complexity
4. `regenerate-iconmap.mjs` - Medium complexity
5. `convert-extracted-to-typescript.mjs` - Large, complex
6. `generate-from-work.mjs` - Simple orchestrator, minimal changes needed

## Implementation Notes

- All scripts use ES modules - maintain compatibility
- Scripts must remain standalone (can import from utils.mjs)
- Keep backward compatibility with existing data structures
- Test after each refactoring step

