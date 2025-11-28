# Workflow System Decoupling Assessment

**Date**: 2025-01-15  
**Assessed By**: Workflow Manager Agent

## Current State: System is COUPLED

### ❌ Current Coupling Issues

1. **Location**: Workflow system is in `docs/workflow/` (part of project structure)
2. **GitHub**: Workflow system would be included in repository commits
3. **Documentation References**: Project docs reference the workflow system:
   - `docs/README.md` lines 28-33 - Entire "Workflow" section
   - `docs/DOCUMENTATION_PLAN.md` line 3 - References `docs/workflow/agent-tasks.md`
4. **Visibility**: Anyone viewing the project can see agent workflow system

### Current References to Workflow System

#### In Project Documentation:
1. **`docs/README.md`** (lines 28-33)
   ```markdown
   ## Workflow (`docs/workflow/`)
   - **`README.md`** – **Agent workflow system overview...**
   - **`agent-tasks.md`** – **Central task management file...**
   ```
   **Action Needed**: Remove entire "Workflow" section

2. **`docs/DOCUMENTATION_PLAN.md`** (line 3)
   ```markdown
   **⚠️ NOTE**: This is a **planning/strategy document**, not a task list. 
   For actionable tasks, see [`docs/workflow/agent-tasks.md`](./workflow/agent-tasks.md).
   ```
   **Action Needed**: Remove reference to workflow system

#### In Workflow System (Internal - OK to keep):
- All files in `docs/workflow/` reference each other (this is fine)
- Agent role files reference workflow paths (will update during migration)

## Solution: Decouple to `.workflow/`

### Proposed Structure
```
.workflow/                    # Hidden directory at project root
├── README.md
├── agent-tasks.md
├── completed-tasks.md
├── communication-protocol.md
├── AGENT_WORKSPACES.md
├── QUICK_START.md
├── agent-roles/
│   └── [12 role files]
└── progress/
    ├── goals.md
    ├── agent-status/
    └── [agent workspaces]
```

### Benefits
1. ✅ **Separated**: Completely separate from project code/docs
2. ✅ **Hidden**: `.` prefix indicates internal tooling
3. ✅ **Git-ignored**: Easy to exclude from repository
4. ✅ **Agnostic**: Project docs won't reference it
5. ✅ **Private**: Stays local, not shared publicly

## Migration Impact

### Files to Move
- All files in `docs/workflow/` → `.workflow/`
- ~50+ files total (including all agent workspaces)

### Files to Update
1. **Project Documentation** (2 files):
   - `docs/README.md` - Remove workflow section
   - `docs/DOCUMENTATION_PLAN.md` - Remove workflow reference

2. **Workflow System Files** (~15 files):
   - All agent role files (update paths from `docs/workflow/` to `.workflow/`)
   - Workflow README.md (update directory structure)
   - Communication protocol (if it references paths)
   - Agent workspace READMEs (if they reference paths)

### .gitignore Update
Add:
```gitignore
# Agent workflow system (local only, not in repository)
.workflow/
```

## Verification

After migration, verify:
- [ ] `.workflow/` exists and contains all files
- [ ] `docs/workflow/` is removed (or empty)
- [ ] `.gitignore` excludes `.workflow/`
- [ ] `docs/README.md` has no workflow references
- [ ] `docs/DOCUMENTATION_PLAN.md` has no workflow references
- [ ] Agent role files reference `.workflow/` not `docs/workflow/`
- [ ] Git status shows `.workflow/` is ignored
- [ ] Agents can still access workflow system

## Ready to Execute

Full migration plan available in:
- `docs/workflow/progress/workflow-manager-agent/proposals/workflow-system-decoupling.md`

**Estimated Time**: ~90 minutes  
**Risk Level**: Low (can rollback if needed)

