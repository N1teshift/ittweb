# Workflow System Decoupling Proposal

**Date**: 2025-01-15  
**Proposed By**: Workflow Manager Agent  
**Status**: Proposal

## Problem Statement

The agent workflow system is currently located in `docs/workflow/`, which means:
1. It's included in the GitHub repository
2. Project documentation references the workflow system
3. The workflow system is visible to anyone viewing the project
4. Documentation is not agnostic to agent-based maintenance

## Goal

1. **Decouple** workflow system from `docs/` folder
2. **Exclude** workflow system from GitHub (via .gitignore)
3. **Make documentation agnostic** - project docs should not reference agents or workflow system
4. **Maintain functionality** - workflow system continues to work for agents

## Current State

### Workflow System Location
- `docs/workflow/` - Contains all workflow system files
- Referenced in `docs/README.md` (lines 28-33)
- Referenced in `docs/DOCUMENTATION_PLAN.md` (line 3)

### Files to Move
```
docs/workflow/
├── README.md
├── agent-tasks.md
├── completed-tasks.md
├── communication-protocol.md
├── AGENT_WORKSPACES.md
├── QUICK_START.md
├── agent-roles/ (12 role files)
└── progress/ (all agent workspaces and status files)
```

## Proposed Solution

### Option 1: Root-Level Hidden Directory (Recommended)
**Location**: `.workflow/` (at project root)

**Benefits**:
- Clearly separated from project code/docs
- Hidden directory (starts with `.`) indicates internal tooling
- Easy to exclude in .gitignore
- Doesn't clutter root directory

**Structure**:
```
.workflow/
├── README.md
├── agent-tasks.md
├── completed-tasks.md
├── communication-protocol.md
├── AGENT_WORKSPACES.md
├── QUICK_START.md
├── agent-roles/
└── progress/
```

### Option 2: Root-Level Visible Directory
**Location**: `workflow/` (at project root)

**Benefits**:
- Visible and clear
- Easy to find
- Still separate from docs/

**Drawbacks**:
- More visible in project structure
- Might be confused with project code

### Option 3: Local-Only Directory
**Location**: `.local/workflow/` or `local/workflow/`

**Benefits**:
- Clearly indicates local-only
- Can have other local tooling in same parent

## Recommended: Option 1 (`.workflow/`)

## Migration Plan

### Phase 1: Preparation
1. Create `.workflow/` directory structure
2. Update .gitignore to exclude `.workflow/`
3. Document migration plan

### Phase 2: Move Files
1. Move all files from `docs/workflow/` to `.workflow/`
2. Update internal references in workflow files
3. Verify all files moved correctly

### Phase 3: Update References
1. Remove workflow references from `docs/README.md`
2. Remove workflow references from `docs/DOCUMENTATION_PLAN.md`
3. Update any other project docs that reference workflow
4. Update agent role files with new paths

### Phase 4: Clean Up
1. Remove empty `docs/workflow/` directory
2. Verify .gitignore is working
3. Test that agents can still access workflow system

## Detailed Steps

### Step 1: Create .gitignore Entry
```gitignore
# Agent workflow system (local only, not in repository)
.workflow/
```

### Step 2: Move Directory Structure
```bash
# Create new structure
mkdir -p .workflow/agent-roles
mkdir -p .workflow/progress

# Move files (example - actual commands will move all files)
mv docs/workflow/* .workflow/
```

### Step 3: Update Internal References
Files that reference `docs/workflow/` need updating:
- Agent role files (update work area paths)
- Workflow README.md (update directory structure)
- Communication protocol (if it references paths)
- Agent workspace READMEs (if they reference paths)

### Step 4: Update Project Documentation
Files to update:
- `docs/README.md` - Remove workflow section (lines 28-33)
- `docs/DOCUMENTATION_PLAN.md` - Remove reference to `docs/workflow/agent-tasks.md` (line 3)

### Step 5: Update Agent Role Files
All agent role files reference `docs/workflow/` - need to update to `.workflow/`:
- Work areas sections
- File path references
- Workspace locations

## Files That Need Path Updates

### Agent Role Files (12 files)
All files in `agent-roles/` have sections like:
```markdown
### Primary Locations
- `docs/workflow/` - Main workflow directory
```

Need to change to:
```markdown
### Primary Locations
- `.workflow/` - Main workflow directory
```

### Workflow System Files
- `README.md` - Directory structure diagram
- `AGENT_WORKSPACES.md` - Workspace paths
- `communication-protocol.md` - File references
- `QUICK_START.md` - Path references

### Agent Workspace READMEs
- All workspace READMEs in `progress/[agent-name]/README.md`
- Status files that reference paths

## Verification Checklist

- [ ] `.workflow/` directory created
- [ ] All files moved from `docs/workflow/` to `.workflow/`
- [ ] `.gitignore` updated to exclude `.workflow/`
- [ ] Internal references updated in workflow files
- [ ] Project documentation cleaned of workflow references
- [ ] Agent role files updated with new paths
- [ ] Empty `docs/workflow/` directory removed
- [ ] Test: Agent can access workflow system
- [ ] Test: Git ignores `.workflow/` directory
- [ ] Test: Project docs don't reference workflow

## Benefits After Migration

1. **Clean Separation**: Workflow system completely separate from project
2. **Git Agnostic**: Workflow system not in repository
3. **Documentation Agnostic**: Project docs don't mention agents
4. **Maintainability**: Easier to manage workflow system independently
5. **Privacy**: Workflow system stays local/private

## Risks and Mitigation

### Risk: Agents Can't Find Workflow System
**Mitigation**: Update all agent role files with new paths before migration

### Risk: Broken Internal References
**Mitigation**: Search and replace all `docs/workflow/` references to `.workflow/`

### Risk: Git Still Tracks Files
**Mitigation**: Verify .gitignore, may need to remove from git cache: `git rm -r --cached .workflow/`

## Rollback Plan

If migration causes issues:
1. Move files back to `docs/workflow/`
2. Revert .gitignore changes
3. Restore project documentation references
4. Update agent role files back to old paths

## Timeline

- **Phase 1**: 30 minutes (preparation)
- **Phase 2**: 15 minutes (move files)
- **Phase 3**: 30 minutes (update references)
- **Phase 4**: 15 minutes (cleanup and verification)
- **Total**: ~90 minutes

## Next Steps

1. Get approval for migration plan
2. Execute Phase 1 (preparation)
3. Execute Phase 2 (move files)
4. Execute Phase 3 (update references)
5. Execute Phase 4 (cleanup)
6. Verify everything works
7. Document completion

