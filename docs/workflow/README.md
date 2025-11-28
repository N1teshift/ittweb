# Agent Workflow System

This directory contains the infrastructure for managing multiple specialized AI agents working on the ITT Web project.

## Overview

The workflow system enables parallel, asynchronous work across multiple agents, each with specialized roles. You (the orchestrator) manage task assignment and coordination, while agents work independently and communicate through shared documentation and task lists.

## Directory Structure

```
docs/workflow/
├── README.md                    # This file - workflow overview
├── agent-tasks.md              # Central task management (all agents read/write here)
├── communication-protocol.md   # How agents communicate and coordinate
├── agent-roles/                # Role definitions for each agent
│   ├── test-agent-role.md
│   ├── documentation-agent-role.md
│   ├── ui-component-agent-role.md
│   ├── api-database-agent-role.md
│   ├── quality-control-agent-role.md
│   ├── data-pipeline-agent-role.md
│   ├── refactoring-agent-role.md
│   ├── type-safety-agent-role.md
│   ├── performance-agent-role.md
│   ├── security-agent-role.md
│   └── commit-assistant-agent-role.md
└── progress/                   # Goal tracking and progress reports
    ├── goals.md                # Active goals with progress tracking
    └── agent-status/           # Individual agent status reports
        ├── test-agent-status.md
        ├── documentation-agent-status.md
        └── [other agents...]
```

## Quick Start

1. **Review Agent Roles**: Read the role definitions in `agent-roles/` to understand what each agent does
2. **Check Tasks**: Open `agent-tasks.md` to see current work queue
3. **Assign Tasks**: Add tasks to the appropriate agent's section
4. **Track Progress**: Monitor `progress/goals.md` for goal completion
5. **Review Status**: Check `progress/agent-status/` for individual agent updates

## Workflow Principles

### Parallel Asynchronous Work
- Multiple agents work simultaneously on different tasks
- No direct agent-to-agent communication (all through you or shared docs)
- Agents update shared task lists and documentation

### Central Orchestration
- You assign tasks to agents
- You review and coordinate work
- You commit changes (or use Commit Assistant Agent)

### Communication Through Documentation
- Agents write documentation as they work
- Agents update task checkboxes
- Agents leave status notes in their sections
- Quality Control Agent reviews and critiques

### Goal-Based Progress
- Each goal has clear success criteria
- Progress tracked as percentage complete
- Related tasks linked to goals

## Agent Roles

### Core Development Agents
- **Test Agent** - Creates and maintains test suites
- **Documentation Agent** - Writes and maintains documentation
- **UI/Component Agent** - Builds React components and UI
- **API/Database Agent** - Works with API routes and Firebase

### Quality & Maintenance Agents
- **Quality Control Agent** - Reviews code, finds bugs, suggests improvements
- **Refactoring Agent** - Improves code structure and patterns
- **Type Safety Agent** - Ensures TypeScript correctness
- **Performance Agent** - Optimizes performance
- **Security Agent** - Security reviews and audits

### Specialized Agents
- **Data Pipeline Agent** - Manages data generation scripts
- **Commit Assistant Agent** - Helps with commit messages and organization

## Getting Started with an Agent

1. Open the agent's role definition file in `agent-roles/`
2. Copy the role definition content
3. Start a new conversation with the agent in Cursor
4. Paste the role definition as the initial prompt
5. Assign a specific task from `agent-tasks.md`
6. Monitor progress through status updates

## Task Management

All tasks are managed in `agent-tasks.md`. This file is:
- Read by all agents to understand current work
- Updated by agents when completing tasks
- Used by you to assign new work
- The single source of truth for what needs to be done

## Progress Tracking

- **Goals**: Defined in `progress/goals.md` with success criteria and progress percentages
- **Status Reports**: Each agent maintains a status file in `progress/agent-status/`
- **Completed Work**: Tracked in `agent-tasks.md` under "Completed Tasks"

## Related Documentation

- [Agent Tasks](./agent-tasks.md) - Current task queue
- [Communication Protocol](./communication-protocol.md) - How agents coordinate
- [Progress Goals](./progress/goals.md) - Active goals and progress
- [Agent Roles](./agent-roles/) - Individual agent role definitions

