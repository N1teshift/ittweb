# Agent Communication Protocol

This document defines how agents communicate and coordinate work in the ITT Web project.

## Core Principles

1. **No Direct Agent-to-Agent Communication**: All coordination happens through you (the orchestrator) or shared documentation
2. **Documentation as Communication**: Agents write documentation, update task lists, and leave notes
3. **Transparency**: All work and status visible in shared files
4. **Asynchronous**: Agents work independently, updating shared resources

## Communication Channels

### 1. Task List (`agent-tasks.md`)

**Primary communication channel** for task assignment and completion.

**How to Use**:
- **Orchestrator**: Add tasks to agent sections
- **Agents**: 
  - Mark tasks complete with `- [x]`
  - Add new tasks you discover (with context)
  - Update your status line
  - Add notes in your section

**Example**:
```markdown
### Test Agent
**Status**: Working | **Current Task**: Create tests for gameService

- [x] Create unit tests for gameService.createGame
  - **Completed**: 2024-01-15
  - **Files**: `__tests__/gameService.test.ts`
- [ ] Create integration tests for /api/games POST endpoint
  - **Context**: Need to test authentication flow
  - **Priority**: High
```

### 2. Status Reports (`progress/agent-status/`)

Each agent maintains a status file with:
- Current work
- Blockers
- Completed items
- Next steps

**Update Frequency**: After completing significant work or when blocked

**Format**:
```markdown
# Test Agent Status

**Last Updated**: 2024-01-15

## Current Work
- Creating tests for gameService module
- Estimated completion: 2 hours

## Blockers
- None

## Recently Completed
- ✅ Created test utilities for Firebase mocking
- ✅ Set up test structure for games module

## Next Steps
- Complete gameService tests
- Move to playerService tests
```

### 3. Documentation

Agents write documentation as they work:
- Code comments explaining decisions
- README updates
- API documentation
- Architecture notes

**Principle**: If you write code, document it. If you change behavior, update docs.

### 4. Code Comments

For complex logic or decisions:
```typescript
// NOTE: This validation follows Firestore schema requirements
// See docs/schemas/firestore-collections.md for field definitions
```

### 5. Review Requests

Quality Control Agent reviews code by:
- Reading files directly
- Checking task completions
- Leaving review notes in:
  - Task list (Quality Control Agent section)
  - Code comments
  - Separate review document if extensive

## Communication Patterns

### Task Assignment Flow

```
Orchestrator → agent-tasks.md → Agent reads → Agent works → Agent updates → Orchestrator reviews
```

### Discovery Flow

```
Agent discovers issue → Agent adds task → Agent notes in status → Orchestrator reviews → Orchestrator assigns
```

### Review Flow

```
Agent completes work → Agent marks task complete → Quality Control Agent reviews → Quality Control Agent notes issues → Agent fixes → Repeat
```

### Blocker Flow

```
Agent encounters blocker → Agent updates status → Agent notes in task list → Orchestrator sees → Orchestrator resolves or reassigns
```

## Status Updates

### When to Update Status

**Agents should update status when**:
- Starting a new task
- Completing a task
- Encountering a blocker
- Discovering new work needed
- Making significant progress (every 2-4 hours of work)

### Status Values

- **Idle**: No current task assigned
- **Working**: Actively working on a task
- **Blocked**: Waiting on something (dependency, clarification, etc.)
- **Reviewing**: Reviewing work (Quality Control Agent)
- **Documenting**: Writing documentation

## Task Priority

Agents should understand task priority:

- **High**: Critical path, blocking other work, security issues
- **Medium**: Important but not blocking
- **Low**: Nice to have, can wait

Agents work on high priority tasks first unless instructed otherwise.

## Coordination Scenarios

### Scenario 1: Agent Needs Information from Another Agent

**Process**:
1. Agent adds a note in their section of `agent-tasks.md`
2. Agent updates status to "Blocked"
3. Orchestrator sees the note
4. Orchestrator either:
   - Provides the information
   - Assigns task to the other agent
   - Coordinates between agents

**Example**:
```markdown
### API/Database Agent Notes
- Need Firestore schema clarification for new field - waiting on orchestrator
```

### Scenario 2: Agent Discovers Related Work

**Process**:
1. Agent adds new task to their section
2. Agent notes it in their status
3. Orchestrator reviews and may reassign or prioritize

**Example**:
```markdown
### UI/Component Agent
- [ ] Fix accessibility issue in GameCard component
  - **Discovered**: While working on GameList
  - **Priority**: Medium
```

### Scenario 3: Quality Control Finds Issues

**Process**:
1. Quality Control Agent reviews code
2. Quality Control Agent adds review task with findings
3. Original agent sees the review
4. Original agent fixes issues
5. Quality Control Agent verifies fixes

**Example**:
```markdown
### Quality Control Agent
- [ ] Review: gameService.ts
  - **Issues Found**:
    - Missing error handling in createGame function
    - Type safety issue with optional field
  - **Priority**: High
```

## Best Practices

### For Agents

1. **Update Frequently**: Don't wait until task is 100% complete
2. **Be Specific**: Include file paths, line numbers, context
3. **Link Related Work**: Reference goals, other tasks, related files
4. **Document Decisions**: Explain why you made certain choices
5. **Ask for Help**: If blocked for >30 minutes, update status

### For Orchestrator

1. **Review Regularly**: Check task list and status files daily
2. **Prioritize Clearly**: Mark high priority tasks
3. **Resolve Blockers**: Address blockers quickly
4. **Balance Workload**: Ensure agents aren't idle
5. **Provide Context**: Include relevant context when assigning tasks

## Escalation

If an agent encounters:
- **Critical Bug**: Add to task list with High priority, note in status
- **Security Issue**: Assign to Security Agent immediately
- **Blocking Issue**: Update status, note clearly in task list
- **Unclear Requirements**: Ask orchestrator for clarification

## Examples

### Good Communication

```markdown
### Test Agent
**Status**: Working | **Current Task**: Create tests for archiveService

- [x] Created test structure for archiveService
  - **Completed**: 2024-01-15 14:30
  - **Files**: `src/features/modules/archives/lib/__tests__/archiveService.test.ts`
  - **Coverage**: createArchive, getArchive functions
- [ ] Add tests for updateArchive function
  - **Context**: Need to test validation logic
  - **Priority**: High
```

### Poor Communication

```markdown
### Test Agent
- [x] Did some tests
```

## Related Documentation

- [Agent Tasks](./agent-tasks.md) - Task management
- [Agent Roles](./agent-roles/) - Individual agent responsibilities
- [Progress Goals](./progress/goals.md) - Goal tracking

