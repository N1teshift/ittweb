# Root Directory Cleanup Plan

**Purpose**: Reduce clutter in root directory while maintaining functionality.

## Analysis of Root Files

### ✅ Must Stay at Root (Framework/Tool Requirements)

These files are **required** by tools/frameworks at the root level:

1. **`package.json`** & **`package-lock.json`** - npm requires these at root
2. **`tsconfig.json`** - TypeScript expects this at root (extends `config/tsconfig.base.json`)
3. **`next.config.ts`** - Next.js expects this at root (wrapper for `config/next.config.ts`)
4. **`next-i18next.config.ts`** - next-i18next expects this at root (wrapper)
5. **`tailwind.config.ts`** - Tailwind expects this at root (wrapper)
6. **`postcss.config.mjs`** - PostCSS expects this at root
7. **`jest.config.cjs`** & **`jest.setup.cjs`** - Jest expects these at root
8. **`next-env.d.ts`** - Next.js auto-generated TypeScript definitions
9. **`.eslintrc.json`** & **`.eslintignore`** - ESLint expects these at root
10. **`.gitignore`** - Git expects this at root
11. **`README.md`** - GitHub displays this on repository page
12. **`LICENSE`** - GitHub detects license at root
13. **`CONTRIBUTING.md`** - GitHub detects contributing guide at root
14. **`.env.example`** - Convention to keep at root for visibility
15. **`.gitleaks.toml`** - Security tool expects this at root
16. **`vercel.json`** - Vercel expects this at root

### 📦 Can Be Moved

1. **`check-missing.js`** - Utility script, can move to `scripts/`
   - Not referenced in package.json scripts
   - Only used manually for checking missing icons
   - Can safely move to `scripts/check-missing-icons.js` (rename for clarity)

### 🗑️ Should Not Exist (Build Artifacts)

1. **`tsconfig.tsbuildinfo`** - TypeScript build cache
   - Already in `.gitignore` but might exist locally
   - Should be deleted if present (git will ignore it)

---

## Recommended Actions

### Action 1: Move `check-missing.js` to `scripts/` (Low Risk)

**Benefits:**
- Reduces root clutter by 1 file
- Better organization (all utility scripts together)
- More descriptive name possible

**Steps:**
1. ✅ Move `check-missing.js` → `scripts/check-missing-icons.js` (completed)
2. ✅ Updated paths to work from scripts/ directory (completed)
3. ✅ Note: Not used in npm scripts, so no package.json update needed

### Action 2: Delete `tsconfig.tsbuildinfo` if it exists

**Note:** This file is build artifact and shouldn't be committed (already in `.gitignore`).

---

## Files That Cannot Be Moved (Why)

### Config Files at Root

Many tools require config files at the project root:

- **Next.js**: `next.config.ts` must be at root
- **TypeScript**: `tsconfig.json` must be at root (though it can extend files elsewhere)
- **Tailwind**: `tailwind.config.ts` must be at root
- **PostCSS**: `postcss.config.mjs` must be at root
- **Jest**: `jest.config.cjs` must be at root
- **ESLint**: `.eslintrc.json` must be at root

**Current Solution**: You already have a good pattern:
- Real configs live in `config/` directory
- Root has thin wrappers that re-export from `config/`
- This keeps organization while meeting tool requirements

### GitHub Files

- **`README.md`** - GitHub shows this on the repository homepage
- **`LICENSE`** - GitHub detects license when at root
- **`CONTRIBUTING.md`** - GitHub shows "Contributing" button when at root

---

## Result After Cleanup

**Root directory will have:**
- Essential config files (required by tools) - **16 files**
- Utility scripts - **0 files** (all in `scripts/`)
- Documentation - **3 files** (README, LICENSE, CONTRIBUTING)
- **Total: ~19 files** (down from ~20)

This is actually quite reasonable for a Next.js/TypeScript project. Most professional repositories have similar file counts at root.

---

## Alternative: Create a `.config/` Directory?

**Note**: Some projects move configs to `.config/`, but:
- Many tools don't support this (Next.js, Tailwind, etc.)
- Your current pattern (wrappers at root, real configs in `config/`) is actually better
- Keeps tool compatibility while organizing code

**Recommendation**: Keep current structure.

