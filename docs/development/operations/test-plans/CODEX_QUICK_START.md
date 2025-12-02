# Quick Start Guide for Codex Agents

## Step 1: Copy the Main Prompt

Copy the entire content from `CODEX_PROMPT.md` and paste it to your Codex agent.

## Step 2: Specify Which Test Plan to Work On

After pasting the main prompt, add one of these lines:

### Available Test Plans:

**Core Infrastructure:**
- `Create tests from infrastructure-tests.md`
- `Create tests from utilities-tests.md`

**Feature Modules:**
- `Create tests from games-tests.md`
- `Create tests from players-tests.md`
- `Create tests from blog-tests.md`
- `Create tests from archives-tests.md`
- `Create tests from scheduled-games-tests.md`
- `Create tests from standings-tests.md`
- `Create tests from analytics-tests.md`
- `Create tests from guides-tests.md`

**Tools & Utilities:**
- `Create tests from map-analyzer-tests.md`
- `Create tests from tools-tests.md`

**Integration & E2E:**
- `Create tests from integration-tests.md`
- `Create tests from e2e-tests.md`

**Quality & Performance:**
- `Create tests from performance-tests.md`
- `Create tests from edge-cases-tests.md`
- ~~`Create tests from security-tests.md`~~ - ✅ Complete
- `Create tests from accessibility-tests.md`
- `Create tests from snapshot-tests.md`
- `Create tests from migration-tests.md`

## Example Full Prompt:

```
[Paste CODEX_PROMPT.md content here]

---

Create tests from games-tests.md
```

## Tips:

1. **Start with smaller files** like `utilities-tests.md` or `tools-tests.md` to establish patterns
2. **Work on one file at a time** - each test plan file is self-contained
3. **Review generated tests** before moving to the next file
4. **Check for existing test patterns** in the codebase first

