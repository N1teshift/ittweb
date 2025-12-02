# Firestore Indexes History

**Date**: 2025-12-02  
**Summary**: Historical Firestore index documentation and setup guides

## Overview

This document summarizes historical Firestore index documentation that was consolidated into the current `docs/database/indexes.md` file.

## Historical Documentation

### Original Files (Consolidated)

The following files were consolidated into `docs/database/indexes.md`:

1. **FIRESTORE_INDEXES.md** - Complete reference of all required indexes
2. **FIRESTORE_INDEXES_INVENTORY.md** - Current status and priority actions
3. **FIRESTORE_INDEXES_SETUP_GUIDE.md** - Step-by-step creation instructions
4. **FIRESTORE_INDEXES_EXPLAINED.md** - Detailed explanation of how indexes work
5. **PERFORMANCE_ISSUE_MISSING_INDEXES.md** - Performance issues and solutions

**Total**: ~1,200 lines consolidated into ~400 lines

## Key Concepts

### Why Indexes Are Needed

Firestore requires composite indexes when queries use:
- Multiple `where` clauses on different fields
- A `where` clause combined with `orderBy` on a different field
- Multiple `orderBy` clauses

Without proper indexes, queries will fail or use inefficient fallback logic.

### Index Requirements

**Key Concept**: Each index supports a specific query pattern. Different query patterns (different filter/sort combinations) need different indexes. Firestore can't reuse one index for multiple different patterns - the index fields must match your query exactly.

## Index Categories

### Games Collection Indexes

**Query Patterns**:
- Scheduled games ordered by date
- Completed games with date range and category filters
- All games ordered by creation date

**Indexes Required**:
- `isDeleted` + `gameState` + `scheduledDateTime`
- `isDeleted` + `gameState` + `datetime` + `category`
- `isDeleted` + `createdAt`

### Players Collection Indexes

**Query Patterns**:
- Player statistics queries
- ELO history queries
- Activity data queries

**Indexes Required**:
- Various composite indexes for player queries
- Date range filtering indexes
- Category-based filtering indexes

### Standings Collection Indexes

**Query Patterns**:
- Leaderboard queries with category filters
- Ranking calculations
- Pagination support

**Indexes Required**:
- Category-based leaderboard indexes
- ELO-based sorting indexes

## Performance Issues

### Missing Indexes

**Symptoms**:
- Queries fail with index errors
- Fallback logic removes `orderBy` and fetches more documents
- In-memory sorting (inefficient)

**Solutions**:
- Create required composite indexes
- Monitor query performance
- Update indexes when query patterns change

## Consolidation

### Before Consolidation

- 5 separate files
- ~1,200 lines total
- Some redundancy
- Harder to navigate

### After Consolidation

- 1 consolidated file: `docs/database/indexes.md`
- ~400 lines
- More scannable format
- All essential information in one place
- 67% reduction in documentation size

## Current State

All Firestore index documentation is now in:
- **Current documentation**: `docs/database/indexes.md`
- **Database schemas**: `docs/database/schemas.md`

## Related Documentation

- Current index documentation: `docs/database/indexes.md`
- Performance guide: `docs/PERFORMANCE.md`
- Database schemas: `docs/database/schemas.md`

