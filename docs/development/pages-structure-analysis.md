# Pages Directory Structure Analysis

> Date: 2025-12-04

## Executive Summary

This document provides a comprehensive analysis of the `src/pages/` directory structure, identifying patterns, inconsistencies, and opportunities for improvement. The analysis reveals three distinct page implementation patterns, several structural issues, and recommendations for better organization.

## Current Structure Overview

### Root Level Pages
- **Infrastructure**: `_app.tsx`, `_document.tsx`, `meta.tsx`
- **Static/Info**: `privacy.tsx`, `download.tsx`, `development.tsx`
- **Feature Pages**: `index.tsx`, `settings.tsx`, `archives.tsx`
- **Feature Directories**: `players/`, `games/`, `posts/`, `entries/`, `tools/`, `guides/`, `standings/`, `classes/`, `analytics/`, `scheduled-games/`
- **API Routes**: `api/` (well organized)
- **Test Pages**: `test/` (shouldn't be in pages)

## 1. Page Implementation Patterns

### Pattern A: Thin Wrappers (5-15 lines)
**Purpose**: Minimal page components that delegate to feature components

**Examples**:
- `meta.tsx` (14 lines)
- `archives.tsx` (16 lines)
- `players/index.tsx` (20 lines)
- `classes/index.tsx` (16 lines)
- `classes/[className].tsx` (16 lines)

**Characteristics**:
- Import feature component
- Wrap with `ErrorBoundary`
- Pass `pageNamespaces` prop
- Minimal logic

**Assessment**: ✅ Good pattern - pages act as routing layer

### Pattern B: Medium Pages (30-100 lines)
**Purpose**: Pages with some page-level logic but mostly feature components

**Examples**:
- `games/index.tsx` (30 lines) - Filter state management
- `standings/index.tsx` (31 lines) - Category state
- `tools/index.tsx` (73 lines) - Navigation/listing page
- `guides/index.tsx` (77 lines) - Navigation/listing page

**Characteristics**:
- Some local state management
- Feature component composition
- Basic routing/navigation logic

**Assessment**: ✅ Acceptable - appropriate level of page logic

### Pattern C: Heavy Pages (200+ lines)
**Purpose**: Pages with significant business logic and state management

**Examples**:
- `settings.tsx` (582 lines) ⚠️ **TOO LARGE**
- `games/[id].tsx` (367 lines) ⚠️ **Complex**
- `entries/[id].tsx` (327 lines) ⚠️ **Complex**
- `posts/[slug].tsx` (212 lines) ⚠️ **Complex**
- `index.tsx` (218 lines) ⚠️ **Complex**
- `analytics/classes/index.tsx` (175 lines) ⚠️ **Complex**

**Characteristics**:
- Extensive state management
- Multiple API calls
- Complex form handling
- Permission checks
- Modal/dialog management

**Assessment**: ❌ Needs refactoring - logic should be extracted to hooks/components

## 2. Feature-to-Page Mapping Issues

### Mismatched Locations

| Page Location | Feature Location | Issue | Recommendation |
|--------------|------------------|-------|----------------|
| `meta.tsx` (root) | `analytics-group/meta` | Page at root, feature in analytics | Move to `analytics/meta.tsx` |
| `archives.tsx` (root) | `community/archives` | Page at root, feature in community | Move to `community/archives.tsx` |
| `scheduled-games/[id]/` | `game-management/scheduled-games` | Empty directory | Create page or remove directory |
| `test/create-game.tsx` | N/A | Legacy redirect in pages | Remove or move outside pages |

### Confusing Separation

**Problem**: Two different `classes/` directories with different purposes:
- `analytics/classes/` - Analytics/statistics pages
- `classes/` - Content/guide pages

**Impact**: Developers may confuse which directory to use

**Recommendation**: Consider renaming `analytics/classes/` to `analytics/class-stats/` for clarity

## 3. Data Fetching Inconsistencies

### getStaticProps Usage

**Correct Usage** (Static content):
- `guides/` - Static guide content
- `download.tsx` - Static download page
- `development.tsx` - Static info page
- `privacy.tsx` - Static policy page

**Questionable Usage**:
- `tools/` - May need dynamic data
- `players/compare.tsx` - Uses getStaticProps but may need dynamic data

### getServerSideProps Usage

**Correct Usage** (Auth-required or dynamic):
- `settings.tsx` - User data, requires auth
- `posts/[slug].tsx` - Dynamic post content, permissions
- `posts/edit/[id].tsx` - Requires auth, permissions
- `posts/new.tsx` - Requires auth
- `entries/[id].tsx` - Dynamic entry content, permissions
- `games/[id].tsx` - Dynamic game data

### Client-Side Fetching

**Issue**: `analytics/classes/index.tsx` uses `useEffect` for data fetching

**Problems**:
- No SSR benefits
- Slower initial load
- No error handling during SSR
- SEO concerns

**Recommendation**: Convert to `getServerSideProps` or use SWR with proper SSR setup

## 4. Code Quality Issues

### Missing Patterns

**Inconsistent ErrorBoundary Usage**:
- Some pages use it: `meta.tsx`, `archives.tsx`, `players/index.tsx`
- Others don't: `settings.tsx`, `download.tsx`, `development.tsx`

**Recommendation**: Standardize - all pages should wrap content in `ErrorBoundary`

**Inconsistent i18n Setup**:
- Some pages define `pageNamespaces` and use `getStaticPropsWithTranslations`
- Others don't set up i18n at all
- Pattern varies even within same feature area

**Recommendation**: Create shared page wrapper or utility for consistent i18n setup

### Large Files Needing Refactoring

#### `settings.tsx` (582 lines)

**Current Structure**:
- User profile display
- Account deletion dialog
- Admin tools (3 separate dialogs)
- Serialization logic
- Permission checks

**Proposed Split**:
```
user/settings/
├── index.tsx                    # Main page (100-150 lines)
├── components/
│   ├── UserProfile.tsx          # Profile display
│   ├── DeleteAccountDialog.tsx  # Account deletion
│   ├── AdminTools.tsx           # Admin section
│   ├── WipeTestDataDialog.tsx   # Admin dialog
│   └── WipeEntriesDialog.tsx   # Admin dialog
└── utils/
    └── serializeUserData.ts     # Serialization helpers
```

#### `games/[id].tsx` (367 lines)

**Issues**:
- Join/leave/edit/delete logic in page component
- Multiple state variables
- Complex permission checks

**Recommendation**: Extract to custom hooks:
- `useGameActions.ts` - Join/leave/edit/delete
- `useGamePermissions.ts` - Permission checks
- `useGameState.ts` - State management

#### `entries/[id].tsx` (327 lines)

**Issues**:
- MDX rendering logic mixed with page logic
- Delete dialog inline
- Complex serialization

**Recommendation**: Extract MDX rendering to component, move dialog to separate component

#### `index.tsx` (218 lines)

**Issues**:
- Entry form modal handling
- Schedule form modal handling
- Timeline ref management

**Recommendation**: Extract modal management to custom hooks

## 5. Routing and Structure Issues

### Empty/Broken Routes

**`scheduled-games/[id]/` Directory**:
- Directory exists but no page file
- Feature exists: `game-management/scheduled-games`
- Other pages reference scheduled games functionality

**Action Required**: 
- Create `scheduled-games/[id].tsx` page, OR
- Remove empty directory if not needed

**`test/create-game.tsx`**:
- Legacy redirect page
- Redirects to `/scheduled-games` (but no page exists there)
- Should not be in `pages/` directory

**Action Required**: Remove or move to appropriate location

### Inconsistent Organization

**Well-Organized**:
- `players/` - Dedicated directory with index and dynamic routes
- `games/` - Dedicated directory with index and dynamic routes
- `posts/` - Dedicated directory with nested routes

**Poorly-Organized**:
- `archives.tsx` - Single file at root, should be in `community/`
- `meta.tsx` - Single file at root, should be in `analytics/`
- `settings.tsx` - Single file at root, should be in `user/`

## 6. Proposed Improved Structure

```
pages/
├── _app.tsx, _document.tsx          # Next.js special files
├── index.tsx                         # Home (extract modals to hooks)
│
├── user/                             # User account pages
│   └── settings/
│       ├── index.tsx                 # Main settings (split from 582 lines)
│       ├── components/              # Settings dialogs
│       └── utils/                    # Serialization helpers
│
├── community/                        # Community features
│   ├── archives.tsx                  # Move from root
│   ├── players/
│   │   ├── index.tsx
│   │   ├── [name].tsx
│   │   └── compare.tsx
│   ├── standings/
│   │   └── index.tsx
│   └── posts/
│       ├── [slug].tsx
│       ├── new.tsx
│       └── edit/
│           └── [id].tsx
│
├── games/                            # Game management
│   ├── index.tsx
│   ├── [id].tsx                      # Extract logic to hooks
│   └── scheduled/                    # Move scheduled-games here
│       └── [id].tsx                  # Create missing page
│
├── content/                          # Content/guides
│   ├── guides/
│   │   ├── index.tsx
│   │   ├── abilities/
│   │   ├── items/
│   │   ├── units/
│   │   ├── classes/
│   │   ├── subclasses/
│   │   ├── supers/
│   │   └── troll-classes.tsx
│   ├── classes/                      # Content classes
│   │   ├── index.tsx
│   │   └── [className].tsx
│   └── entries/
│       └── [id].tsx
│
├── analytics/                        # Analytics/statistics
│   ├── meta.tsx                      # Move from root
│   └── class-stats/                  # Rename from classes/
│       ├── index.tsx
│       └── [className].tsx
│
├── static/                           # Static/info pages
│   ├── privacy.tsx
│   ├── download.tsx
│   └── development.tsx
│
├── tools/                            # Keep as-is
│   ├── index.tsx
│   ├── duel-simulator.tsx
│   ├── map-analyzer.tsx
│   └── icon-mapper.tsx
│
└── api/                              # API routes (well organized)
    └── [existing structure]
```

## 7. Priority Fixes

### Critical Priority

1. **Split `settings.tsx`** (582 lines)
   - Extract dialogs to components
   - Extract serialization to utils
   - Target: Main file < 200 lines

2. **Remove `test/create-game.tsx`**
   - Legacy redirect, shouldn't be in pages
   - Move redirect logic elsewhere or remove entirely

3. **Fix `scheduled-games/[id]/`**
   - Create missing page file, OR
   - Remove empty directory

4. **Move `archives.tsx`**
   - From root to `community/archives.tsx`
   - Aligns with feature location

5. **Move `meta.tsx`**
   - From root to `analytics/meta.tsx`
   - Aligns with feature location

### High Priority

6. **Extract logic from `games/[id].tsx`**
   - Create `useGameActions` hook
   - Create `useGamePermissions` hook
   - Reduce page to < 150 lines

7. **Standardize `ErrorBoundary` usage**
   - All pages should wrap content
   - Create page wrapper component if needed

8. **Standardize i18n setup**
   - Consistent `pageNamespaces` usage
   - Shared utility or wrapper

9. **Fix data fetching in `analytics/classes/index.tsx`**
   - Convert `useEffect` fetching to SSR
   - Use `getServerSideProps` or SWR with SSR

### Medium Priority

10. **Group static pages**
    - Move to `static/` directory
    - Better organization

11. **Rename `analytics/classes/`**
    - To `analytics/class-stats/`
    - Avoid confusion with `content/classes/`

12. **Extract modals from `index.tsx`**
    - Create hooks for modal management
    - Reduce page complexity

## 8. Implementation Guidelines

### Page Component Best Practices

1. **Keep pages thin** - Delegate to feature components
2. **Extract complex logic** - Use custom hooks
3. **Standardize patterns** - ErrorBoundary, i18n, data fetching
4. **File size limit** - Target < 200 lines per file
5. **Consistent structure** - Follow feature organization

### Data Fetching Guidelines

- **Static content** → `getStaticProps`
- **Auth-required** → `getServerSideProps`
- **Dynamic data** → `getServerSideProps` or SWR with SSR
- **Avoid** → Client-side `useEffect` fetching for initial data

### File Organization Guidelines

- **Feature pages** → Match feature directory structure
- **Static pages** → Group in `static/` directory
- **User pages** → Group in `user/` directory
- **Community pages** → Group in `community/` directory

## 9. Migration Strategy

### Phase 1: Critical Fixes (Week 1)
1. Split `settings.tsx`
2. Remove `test/create-game.tsx`
3. Fix `scheduled-games/[id]/` issue
4. Move `archives.tsx` and `meta.tsx`

### Phase 2: Refactoring (Week 2)
5. Extract logic from `games/[id].tsx`
6. Standardize ErrorBoundary usage
7. Standardize i18n setup
8. Fix analytics data fetching

### Phase 3: Organization (Week 3)
9. Group static pages
10. Rename analytics classes directory
11. Extract modals from index.tsx
12. Final cleanup and documentation

## 10. Success Metrics

- ✅ All page files < 200 lines
- ✅ All pages use ErrorBoundary consistently
- ✅ All pages have consistent i18n setup
- ✅ No empty directories in pages/
- ✅ Page structure aligns with feature structure
- ✅ All data fetching uses appropriate method (SSR/SSG)
- ✅ No legacy/test files in pages/

## Related Documentation

- [Features Structure](./FEATURES_STRUCTURE.md)
- [Code Patterns](./patterns/)
- [API Route Patterns](./patterns/api-route-patterns.md)
- [Architecture](./architecture.md)

