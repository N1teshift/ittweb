# Server/Client Code Split Progress

## Completed ✅

1. **analyticsCache.ts** - Split into:
   - `analyticsCache.ts` - Types and utilities (client-safe)
   - `analyticsCache.server.ts` - Server-only cache functions
   - All imports updated

## In Progress 🔄

### Game Services (src/features/modules/game-management/games/lib/)
- [ ] gameService.create.ts → gameService.create.server.ts
- [ ] gameService.update.ts → gameService.update.server.ts  
- [ ] gameService.delete.ts → gameService.delete.server.ts
- [ ] gameService.read.ts → gameService.read.server.ts
- [ ] gameService.participation.ts → gameService.participation.server.ts
- [ ] gameService.utils.ts → gameService.utils.server.ts

### Scheduled Game Services (src/features/modules/game-management/scheduled-games/lib/)
- [ ] scheduledGameService.create.ts → scheduledGameService.create.server.ts
- [ ] scheduledGameService.update.ts → scheduledGameService.update.server.ts
- [ ] scheduledGameService.delete.ts → scheduledGameService.delete.server.ts
- [ ] scheduledGameService.read.ts → scheduledGameService.read.server.ts
- [ ] scheduledGameService.participation.ts → scheduledGameService.participation.server.ts
- [ ] scheduledGameService.utils.ts → scheduledGameService.utils.server.ts

### Entry Services (src/features/modules/game-management/entries/lib/)
- [x] entryService.server.ts (already exists)
- [ ] entryService.ts - Clean up, ensure client-only

### Player Services (src/features/modules/community/players/lib/)
- [ ] playerService.read.ts → playerService.read.server.ts
- [ ] playerService.update.ts → playerService.update.server.ts

### Post Services (src/features/modules/content/blog/lib/)
- [ ] postService.ts → postService.server.ts

### Standings Services (src/features/modules/community/standings/lib/)
- [ ] playerCategoryStatsService.ts → playerCategoryStatsService.server.ts
- [ ] standingsService.ts → standingsService.server.ts

### Infrastructure Utilities
- [ ] firestoreCrudService.ts - Evaluate if needs split
- [ ] firestoreHelpers.ts - Evaluate if needs split
- [ ] queryWithIndexFallback.ts - Evaluate if needs split

## Strategy

Since these services are **only used in API routes** (server-side):
1. Create `.server.ts` versions with server-only logic (remove `isServerSide()` checks, use only admin SDK)
2. Create minimal `.ts` client stubs that throw helpful errors
3. Update `gameService.ts` and other index files to export from `.server` versions
4. Update all imports in API routes

## Notes

- All game service functions are currently hybrid (check `isServerSide()`)
- They're only imported in API routes, so server-only versions are safe
- Client stubs will prevent accidental client-side usage

