# Quick Start Guide: Using the Agent Workflow System

This guide will help you get started with managing multiple agents working on your project.

## Step 1: Understand the System

Read `docs/workflow/README.md` to understand:
- How the workflow system works
- What agents are available
- How agents communicate
- How tasks are managed

## Step 2: Review Agent Roles

Browse `docs/workflow/agent-roles/` to see what each agent does:
- **Test Agent** - Creates tests
- **Documentation Agent** - Writes documentation
- **UI/Component Agent** - Builds React components
- **API/Database Agent** - Works with APIs and Firebase
- **Quality Control Agent** - Reviews code and finds bugs
- **Data Pipeline Agent** - Manages data generation scripts
- **Refactoring Agent** - Improves code structure
- **Type Safety Agent** - Ensures TypeScript correctness
- **Performance Agent** - Optimizes performance
- **Security Agent** - Security reviews
- **Commit Assistant Agent** - Helps with commits

## Step 3: Set Up Your First Agent

1. **Choose an Agent**: Pick which agent you want to start with
2. **Read Role Definition**: Open the agent's role file in `docs/workflow/agent-roles/`
3. **Copy Role Definition**: Copy the entire content of the role file
4. **Start Conversation**: Start a new conversation in Cursor
5. **Paste Role**: Paste the role definition as the initial prompt
6. **Assign Task**: Give the agent a specific task from `docs/workflow/agent-tasks.md`

## Step 4: Manage Tasks

### Adding a Task

1. Open `docs/workflow/agent-tasks.md`
2. Find the appropriate agent's section
3. Add a new task with:
   ```markdown
   - [ ] Task description
     - **Context**: Additional details
     - **Goal**: [Link to goal if applicable]
     - **Priority**: High/Medium/Low
   ```
4. Update the agent's status line

### Assigning a Task

1. Tell the agent: "Check `docs/workflow/agent-tasks.md` for your next task"
2. The agent will read the file and start working
3. Monitor progress through status updates

### Completing a Task

Agents will:
1. Mark the task complete with `- [x]`
2. Update their status in `docs/workflow/agent-tasks.md`
3. Update their status file in `docs/workflow/progress/agent-status/`

## Step 5: Track Progress

### Goals

1. Define goals in `docs/workflow/progress/goals.md`
2. Link tasks to goals
3. Update progress percentages as work completes

### Agent Status

1. Check individual agent status files in `docs/workflow/progress/agent-status/`
2. Agents update these regularly with:
   - Current work
   - Blockers
   - Completed items
   - Next steps

## Step 6: Coordinate Multiple Agents

### Parallel Work

- Start multiple agent conversations simultaneously
- Each agent works on different tasks
- All agents read/write to the same `agent-tasks.md` file
- You coordinate through task assignment

### Communication

- Agents communicate through:
  - Task list updates
  - Status notes
  - Documentation
  - Code comments
- No direct agent-to-agent communication
- Everything flows through you or shared docs

## Example Workflow

### Day 1: Setting Up

1. **Morning**: Start Test Agent conversation, assign test creation task
2. **Afternoon**: Start Documentation Agent conversation, assign documentation task
3. **Evening**: Review progress, assign next day's tasks

### Day 2: Parallel Work

1. **Morning**: 
   - Test Agent continues test creation
   - Start UI/Component Agent for new feature
2. **Afternoon**:
   - Documentation Agent documents new feature
   - Quality Control Agent reviews Test Agent's work
3. **Evening**: Review all progress, plan next day

### Day 3: Coordination

1. **Morning**: API/Database Agent creates API for UI feature
2. **Afternoon**: 
   - UI/Component Agent integrates with API
   - Test Agent tests the integration
3. **Evening**: Quality Control Agent reviews everything

## Tips

1. **Start Small**: Begin with 2-3 agents, add more as you get comfortable
2. **Clear Tasks**: Be specific in task descriptions
3. **Regular Reviews**: Check progress daily
4. **Balance Workload**: Ensure agents aren't idle
5. **Use Goals**: Link tasks to goals for better tracking

## Troubleshooting

### Agent is Blocked

1. Check agent's status file
2. Review blockers in `agent-tasks.md`
3. Resolve the blocker or reassign the task

### Agent Needs Information

1. Agent will note it in task list or status
2. Provide the information
3. Agent continues work

### Task is Unclear

1. Agent will ask for clarification
2. Provide more context
3. Update task description if needed

## Next Steps

- Read [Workflow README](./README.md) for full details
- Review [Communication Protocol](./communication-protocol.md)
- Check [Agent Tasks](./agent-tasks.md) for current work
- Browse [Agent Roles](./agent-roles/) for role definitions

