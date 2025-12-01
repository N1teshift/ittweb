# Documentation File Categorization

Analysis of all root-level `.md` files in `docs/` folder.

## Current Files (20 total)

### 1. Getting Started / Setup (2 files)
**Purpose**: Help new developers get started

- `ENVIRONMENT_SETUP.md` - Firebase, Discord OAuth, local dev setup
- `TROUBLESHOOTING.md` - Common issues and solutions

**Proposed Location**: `docs/getting-started/`

---

### 2. Development Guides (6 files)
**Purpose**: How to develop features, follow patterns, use components

- `DEVELOPMENT.md` - How to add features, API routes, conventions
- `ARCHITECTURE.md` - System architecture and design patterns
- `CODE_COOKBOOK.md` - Common code patterns and recipes
- `COMPONENT_LIBRARY.md` - Shared UI components usage
- `API_CLIENT_USAGE.md` - Using APIs from client-side code
- `CONTRIBUTING.md` - Development standards and contribution process

**Proposed Location**: `docs/development/`

---

### 3. Reference / Best Practices (4 files)
**Purpose**: Reference guides for specific topics

- `SECURITY.md` - Security best practices and guidelines
- `PERFORMANCE.md` - Performance optimization strategies
- `ERROR_HANDLING.md` - Error handling patterns and best practices
- `KNOWN_ISSUES.md` - Technical debt, migration status, known issues

**Proposed Location**: `docs/reference/` or keep in root?

**Note**: These are often referenced from other docs. Could stay in root for easy access, or move to `reference/` for better organization.

---

### 4. Meta / Analysis / Cleanup (7 files)
**Purpose**: Analysis documents, cleanup plans, documentation about documentation

- `DOCUMENTATION_CLEANUP_PLAN.md` - Cleanup planning document
- `DOCUMENTATION_CLEANUP_SUMMARY.md` - Summary of cleanup work
- `DOCUMENTATION_STYLE.md` - Documentation writing standards ⚠️ (might keep in root)
- `GITHUB_CLEANUP_PLAN.md` - GitHub cleanup planning
- `ROOT_DIRECTORY_CLEANUP.md` - Root directory cleanup planning
- `ERROR_HANDLING_DOCUMENTATION_ANALYSIS.md` - Analysis of error handling docs
- `archive/LOGGING_INCONSISTENCY_ANALYSIS.md` - Historical analysis (archived)

**Proposed Location**: `docs/archive/analysis/`

**Note**: `DOCUMENTATION_STYLE.md` might be useful to keep accessible. Could stay in root or move to `reference/`.

---

### 5. Root Files (1 file)
**Purpose**: Entry point

- `README.md` - Documentation index (stays in root)

---

## Proposed Organization

### Option A: Three Main Folders

```
docs/
├── README.md
├── DOCUMENTATION_STYLE.md (keep in root for easy access)
│
├── getting-started/
│   ├── setup.md (ENVIRONMENT_SETUP.md)
│   └── troubleshooting.md (TROUBLESHOOTING.md)
│
├── development/
│   ├── development-guide.md (DEVELOPMENT.md)
│   ├── architecture.md (ARCHITECTURE.md)
│   ├── code-patterns.md (CODE_COOKBOOK.md)
│   ├── components.md (COMPONENT_LIBRARY.md)
│   ├── api-client.md (API_CLIENT_USAGE.md)
│   └── contributing.md (CONTRIBUTING.md)
│
├── reference/
│   ├── security.md (SECURITY.md)
│   ├── performance.md (PERFORMANCE.md)
│   ├── error-handling.md (ERROR_HANDLING.md)
│   └── known-issues.md (KNOWN_ISSUES.md)
│
└── archive/
    └── analysis/
        ├── documentation-cleanup-plan.md
        ├── documentation-cleanup-summary.md
        ├── github-cleanup-plan.md
        ├── root-directory-cleanup.md
        ├── error-handling-documentation-analysis.md
        └── logging-inconsistency-analysis.md
```

**Result**: 2 files in root (README + DOCUMENTATION_STYLE)

---

### Option B: Keep Reference in Root

```
docs/
├── README.md
├── DOCUMENTATION_STYLE.md
│
├── getting-started/
│   ├── setup.md
│   └── troubleshooting.md
│
├── development/
│   ├── development-guide.md
│   ├── architecture.md
│   ├── code-patterns.md
│   ├── components.md
│   ├── api-client.md
│   └── contributing.md
│
├── SECURITY.md (keep in root)
├── PERFORMANCE.md (keep in root)
├── ERROR_HANDLING.md (keep in root)
├── KNOWN_ISSUES.md (keep in root)
│
└── archive/
    └── analysis/
        └── [analysis files]
```

**Result**: 6 files in root (README + DOCUMENTATION_STYLE + 4 reference files)

**Rationale**: Reference files are often linked from other docs, so keeping them in root makes links simpler.

---

### Option C: Minimal Root (Everything Organized)

```
docs/
├── README.md
│
├── getting-started/
│   ├── setup.md
│   └── troubleshooting.md
│
├── development/
│   ├── development-guide.md
│   ├── architecture.md
│   ├── code-patterns.md
│   ├── components.md
│   ├── api-client.md
│   └── contributing.md
│
├── reference/
│   ├── security.md
│   ├── performance.md
│   ├── error-handling.md
│   ├── known-issues.md
│   └── documentation-style.md
│
└── archive/
    └── analysis/
        └── [analysis files]
```

**Result**: 1 file in root (README only)

---

## Recommendation

**Option B** - Keep reference files in root because:
1. They're frequently linked from other documentation
2. They're reference material that developers might search for directly
3. 6 files in root is still manageable
4. Clear separation: getting-started/ and development/ for guides, root for reference

**Alternative**: If you prefer minimal root, go with **Option C** and update all links.

---

## File Renaming Convention

When moving files, consider renaming to kebab-case for consistency:
- `ENVIRONMENT_SETUP.md` → `getting-started/setup.md`
- `DEVELOPMENT.md` → `development/development-guide.md`
- `CODE_COOKBOOK.md` → `development/code-patterns.md`
- etc.

This makes URLs cleaner and follows common conventions.

---

## Next Steps

1. Choose an option (A, B, or C)
2. Create folders
3. Move files
4. Update all internal links
5. Update root README.md

