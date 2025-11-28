# Agent Task Management

**Last Updated**: [Update this when tasks change]

This is the central task management file. All agents read and update this file to coordinate work.

## How to Use This File

- **Orchestrator (You)**: Add tasks to agent sections, review completed work
- **Agents**: Mark tasks complete, add new tasks you discover, update status
- **Format**: Use checkboxes `- [ ]` for pending, `- [x]` for completed
- **Priority**: Tasks at the top of each section are higher priority

---

## Active Goals

Link tasks to goals in `progress/goals.md` using `[Goal: Goal Name]`

- [ ] **[Goal Name]**: Description | Progress: 0% | Target: [Date]
- [ ] **[Goal Name]**: Description | Progress: 0% | Target: [Date]

---

## Task Queue by Agent

### Test Agent
**Status**: [Idle/Working/Blocked] | **Current Task**: [Task name or "None"]

- [ ] Task description
  - **Context**: Additional details
  - **Goal**: [Link to goal if applicable]
  - **Priority**: High/Medium/Low

### Documentation Agent
**Status**: [Idle/Working/Blocked] | **Current Task**: [Task name or "None"]

- [ ] Task description
  - **Context**: Additional details
  - **Goal**: [Link to goal if applicable]
  - **Priority**: High/Medium/Low

### UI/Component Agent
**Status**: [Idle/Working/Blocked] | **Current Task**: [Task name or "None"]

- [ ] Task description
  - **Context**: Additional details
  - **Goal**: [Link to goal if applicable]
  - **Priority**: High/Medium/Low

### API/Database Agent
**Status**: [Idle/Working/Blocked] | **Current Task**: [Task name or "None"]

- [ ] Task description
  - **Context**: Additional details
  - **Goal**: [Link to goal if applicable]
  - **Priority**: High/Medium/Low

### Quality Control Agent
**Status**: [Idle/Working/Blocked] | **Current Task**: [Task name or "None"]

- [ ] Review: [File/PR/Feature description]
  - **What to Review**: Specific aspects
  - **Priority**: High/Medium/Low
- [ ] Bug Investigation: [Bug description]
  - **Location**: File/component
  - **Priority**: High/Medium/Low
- [ ] Code Quality Audit: [Area/Module]
  - **Focus**: Specific concerns
  - **Priority**: High/Medium/Low

### Data Pipeline Agent
**Status**: [Idle/Working/Blocked] | **Current Task**: [Task name or "None"]

- [ ] Task description
  - **Context**: Additional details
  - **Goal**: [Link to goal if applicable]
  - **Priority**: High/Medium/Low

### Refactoring Agent
**Status**: [Idle/Working/Blocked] | **Current Task**: [Task name or "None"]

- [ ] Refactor: [File/Module/Pattern]
  - **Current Issues**: What needs improvement
  - **Goal**: [Link to goal if applicable]
  - **Priority**: High/Medium/Low

### Type Safety Agent
**Status**: [Idle/Working/Blocked] | **Current Task**: [Task name or "None"]

- [ ] Fix Type Errors: [File/Module]
  - **Errors**: Description of type issues
  - **Priority**: High/Medium/Low
- [ ] Improve Type Definitions: [Area]
  - **Current State**: What needs improvement
  - **Priority**: High/Medium/Low

### Performance Agent
**Status**: [Idle/Working/Blocked] | **Current Task**: [Task name or "None"]

- [ ] Optimize: [Component/API/Query]
  - **Performance Issue**: What's slow
  - **Goal**: [Link to goal if applicable]
  - **Priority**: High/Medium/Low

### Security Agent
**Status**: [Idle/Working/Blocked] | **Current Task**: [Task name or "None"]

- [ ] Security Review: [Area/Feature]
  - **Focus**: Authentication, validation, etc.
  - **Priority**: High/Medium/Low
- [ ] Audit: [Dependencies/Rules/Config]
  - **What to Audit**: Specific concerns
  - **Priority**: High/Medium/Low

### Commit Assistant Agent
**Status**: [Idle/Working/Blocked] | **Current Task**: [Task name or "None"]

- [ ] Prepare Commit: [Feature/Bug/Change]
  - **Changes**: Summary of what changed
  - **Files**: List of modified files
  - **Priority**: High/Medium/Low

---

## Blocked Tasks

Tasks that are waiting on something (another agent, external dependency, etc.):

- [ ] **[Agent Name]**: Task description
  - **Blocked By**: What/who is blocking
  - **Expected Resolution**: When/how it will be unblocked

---

## Completed Tasks

Recent completed work (move to archive after 30 days):

### [Date]

- [x] **[Agent Name]**: Task description
  - **Completed**: [Date]
  - **Related Goal**: [Goal name if applicable]
  - **Files Changed**: [List if significant]

---

## Notes

### General Notes
- Add any important coordination notes here
- Agent-to-agent dependencies
- Important context for all agents

### Agent-Specific Notes

#### Test Agent Notes
- 

#### Documentation Agent Notes
- 

#### UI/Component Agent Notes
- 

#### API/Database Agent Notes
- 

#### Quality Control Agent Notes
- 

#### Data Pipeline Agent Notes
- 

#### Refactoring Agent Notes
- 

#### Type Safety Agent Notes
- 

#### Performance Agent Notes
- 

#### Security Agent Notes
- 

#### Commit Assistant Agent Notes
- 

