# Troubleshooting Guide

Common issues and solutions.

## Environment & Setup Issues

### Firebase Not Initializing

**Symptoms**: Console errors about Firebase, "Firebase: No Firebase App '[DEFAULT]' has been created"

**Solutions**:
1. Check all `NEXT_PUBLIC_FIREBASE_*` environment variables are set
2. Verify `.env.local` file exists in project root
3. Restart dev server after changing environment variables
4. Check Firebase project is active in Firebase Console
5. Verify no typos in variable names

**Debug**:
```typescript
// Check config is loaded
import { getFirebaseClientConfig } from '@/features/infrastructure/api/firebase/config';
console.log(getFirebaseClientConfig());
```

### Authentication Not Working

**Symptoms**: Login redirects fail, "OAuth error", session not persisting

**Solutions**:
1. Verify `NEXTAUTH_SECRET` is set and valid
2. Check `NEXTAUTH_URL` matches your dev URL exactly
3. Verify Discord redirect URI matches: `http://localhost:3000/api/auth/callback/discord`
4. Check Discord client ID/secret are correct
5. Clear browser cookies and try again
6. Check Discord application has correct scopes enabled

**Debug**:
- Check browser console for NextAuth errors
- Check server console for authentication logs
- Verify Discord OAuth settings in Discord Developer Portal

### Firestore Permission Denied

**Symptoms**: "Missing or insufficient permissions" errors

**Solutions**:
1. Check Firestore security rules allow the operation
2. Verify user is authenticated (for write operations)
3. Check Firebase Admin is initialized (for server-side operations)
4. Review Firestore rules in Firebase Console
5. Verify service account has correct permissions

**Common Rule Issues**:
```javascript
// Allow public read, authenticated write
allow read: if true;
allow write: if request.auth != null;

// Server-only writes (for playerStats, etc.)
allow write: if false;  // Only server can write
```

### Service Account Key Issues

**Symptoms**: "Failed to initialize Firebase Admin", authentication errors

**Solutions**:
1. Verify JSON is valid and properly escaped in `.env.local`
2. Check service account has correct permissions
3. Verify project ID matches in key and env vars
4. Try regenerating service account key
5. For production, consider using Application Default Credentials

**Format Check**:
```bash
# Service account key should be a single-line JSON string
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
```

## Development Issues

### TypeScript Errors

**Symptoms**: Type errors, compilation failures

**Solutions**:
1. Run `npm run type-check` to see all errors
2. Check types match Firestore schema exactly
3. Verify imports are correct
4. Check for missing type definitions
5. Restart TypeScript server in IDE

**Common Issues**:
- Missing type imports
- Incorrect Firestore field names (check schema docs)
- Type mismatches between client/server code

### Build Failures

**Symptoms**: `npm run build` fails

**Solutions**:
1. Fix all TypeScript errors first
2. Check for missing environment variables
3. Verify all imports are correct
4. Check for circular dependencies
5. Clear `.next` folder and rebuild: `rm -rf .next && npm run build`

### Module Not Found

**Symptoms**: "Cannot find module" errors

**Solutions**:
1. Check import paths are correct (use `@/` alias)
2. Verify file exists at path
3. Check `tsconfig.json` paths configuration
4. Restart dev server
5. Clear node_modules and reinstall: `rm -rf node_modules && npm install`

## Runtime Issues

### API Returns 500 Error

**Symptoms**: API routes return 500, server errors

**Solutions**:
1. Check server console for error messages
2. Verify Firebase is properly configured
3. Check all required fields are provided in request
4. Verify authentication if required
5. Check Firestore rules allow the operation
6. Review error logs with `logError()` context

**Debug**:
```typescript
// Add logging in API route
const logger = createComponentLogger('api/my-route');
logger.error('Error details', error, { context });
```

### Pages Show Loading Forever

**Symptoms**: Components stuck in loading state

**Solutions**:
1. Check browser console for errors
2. Verify API endpoints are working (test with curl/Postman)
3. Check Firestore connection
4. Verify hooks are handling errors correctly
5. Check network tab for failed requests

**Debug**:
```typescript
// Add error handling in hooks
const { data, error, loading } = useMyData();
if (error) console.error('Hook error:', error);
```

### ELO Not Updating

**Symptoms**: ELO scores don't change after games

**Solutions**:
1. Check browser console for errors
2. Verify Firestore rules allow writes to `playerStats`
3. Check that players array has at least 2 players
4. Verify ELO calculation service is called
5. Check `updateEloScores()` is executed after game creation

**Debug**:
- Check game creation logs
- Verify ELO calculator is imported and used
- Check playerStats collection in Firestore

### Data Not Appearing

**Symptoms**: Lists are empty, data doesn't show

**Solutions**:
1. Verify data exists in Firestore (check Firebase Console)
2. Check Firestore rules allow reads
3. Verify queries are correct (filters, pagination)
4. Check for soft-deleted items (`isDeleted: true`)
5. Verify API routes return data correctly

**Debug**:
```typescript
// Test API directly
fetch('/api/games').then(r => r.json()).then(console.log);
```

## Performance Issues

### Slow Page Loads

**Symptoms**: Pages take long to load

**Solutions**:
1. Check network tab for slow requests
2. Optimize Firestore queries (add indexes)
3. Implement pagination for large lists
4. Use Next.js Image component for images
5. Check bundle size with `ANALYZE=true npm run build`

### Slow API Responses

**Symptoms**: API routes are slow

**Solutions**:
1. Optimize Firestore queries (use indexes, limit results)
2. Check for N+1 query problems
3. Implement caching where appropriate
4. Review service layer for inefficiencies
5. Check Firebase quota/limits

### Memory Issues

**Symptoms**: Browser/Node.js memory errors

**Solutions**:
1. Check for memory leaks in components (unsubscribe from listeners)
2. Limit data fetched at once (pagination)
3. Use React.memo for expensive components
4. Check for circular references
5. Review large data structures

## Testing Issues

### Tests Failing

**Symptoms**: Jest tests fail

**Solutions**:
1. Check test setup files are correct
2. Verify mocks are properly configured
3. Check Firebase mocks in `__mocks__/`
4. Clear Jest cache: `npm test -- --clearCache`
5. Check for async/await issues in tests

### Mock Issues

**Symptoms**: Mocks not working, Firebase errors in tests

**Solutions**:
1. Verify mocks are in `__mocks__/` directory
2. Check mock file names match module names
3. Ensure mocks are imported before modules
4. Review `jest.setup.cjs` for global mocks

## Data Issues

### Invalid Data Format

**Symptoms**: Data validation errors, type mismatches

**Solutions**:
1. Check data matches Firestore schema exactly
2. Verify field names use standardized names (see schema docs)
3. Check timestamp formats (Firestore Timestamp vs string)
4. Validate data before saving
5. Review validation functions

### Duplicate Data

**Symptoms**: Duplicate entries, data conflicts

**Solutions**:
1. Check for duplicate prevention logic
2. Verify unique constraints in Firestore
3. Check for race conditions in creation logic
4. Review transaction usage for atomic operations

### Missing Data

**Symptoms**: Expected data not found

**Solutions**:
1. Check soft-delete flags (`isDeleted: true`)
2. Verify queries include all necessary filters
3. Check Firestore indexes are created
4. Review query logic for edge cases
5. Check data was actually created (Firebase Console)

## Getting Help

### Debug Checklist

1. ✅ Check browser console for errors
2. ✅ Check server console for errors
3. ✅ Verify environment variables are set
4. ✅ Check Firestore rules
5. ✅ Verify authentication status
6. ✅ Test API routes directly (curl/Postman)
7. ✅ Check Firebase Console for data
8. ✅ Review error logs with context

### Useful Commands

```bash
# Type check
npm run type-check

# Build check
npm run build:check

# Test
npm test

# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules && npm install
```

### Logging

All errors should be logged with context:

```typescript
logError(error, 'Operation failed', {
  component: 'myComponent',
  operation: 'create',
  userId: user.id,
  // ... other context
});
```

Check logs for these details when debugging.

## Browser Console Issues

### Third-Party Script Errors (Suppressed in Development)

**Symptoms**: Console shows errors/warnings from third-party scripts:
- `Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at https://googleads.g.doubleclick.net/pagead/id`
- `Cookie "__Secure-YEC" has been rejected because it is in a cross-site context`

**Explanation**: 
These errors are **harmless** and don't affect functionality. They occur because:
- YouTube embeds try to load Google Ads tracking scripts
- Browser security policies block cross-site tracking cookies
- Third-party tracking scripts are blocked by CSP or browser settings

**Solutions** (Already Implemented):

1. **Privacy-Enhanced YouTube Embeds**: 
   - YouTube embeds use `youtube-nocookie.com` domain (privacy-enhanced mode)
   - Tracking parameters are disabled (`enablejsapi=0`, `rel=0`, etc.)
   - This reduces tracking attempts and associated errors

2. **Console Error Filtering** (Development Only):
   - Known third-party errors are automatically filtered in development
   - Production logs remain unfiltered for debugging
   - Filtered errors/warnings include:
     - Google Ads CORS errors (`googleads.g.doubleclick.net`)
     - YouTube cookie warnings (`__Secure-YEC`, `LAST_RESULT_ENTRY_KEY`)
     - Feature Policy warnings (deprecated API, harmless)
     - CSP warnings about unknown directives (`require-trusted-types-for`)
     - YouTube third-party context warnings (expected behavior)
     - "Unreachable code after return statement" from minified YouTube scripts

3. **CSP Headers**:
   - Content Security Policy explicitly blocks unwanted tracking domains
   - `googleads.g.doubleclick.net` is not in allowed connect-src
   - This prevents tracking scripts from loading

**Note**: These errors are expected behavior when blocking third-party tracking. The suppression is for developer experience only - functionality is not affected.

**To See All Errors**:
- Production builds show all errors (filtering is development-only)
- Check browser DevTools Network tab for blocked requests
- Review CSP violations in browser console if needed

## Related Documentation

- [Environment Setup](./setup.md)
- [Development Guide](../development/development-guide.md)
- [Testing Guide](./operations/testing-guide.md)
- [Firestore Schemas](./database/schemas.md)


