# Agent Status Reports

Each agent maintains a status file in this directory. Status files are updated regularly to track:
- Current work
- Blockers
- Completed items
- Next steps

## Status File Naming

Format: `[agent-name]-status.md`

Examples:
- `test-agent-status.md`
- `documentation-agent-status.md`
- `ui-component-agent-status.md`

## Status Update Frequency

Agents should update their status:
- When starting a new task
- When completing a task
- When encountering a blocker
- At least once per work session
- When making significant progress (every 2-4 hours)

## Status File Template

See any existing status file for the format, or use this template:

```markdown
# [Agent Name] Status

**Last Updated**: YYYY-MM-DD HH:MM

## Current Work
- Task description
- Estimated completion: [time]

## Blockers
- None / [Description of blocker]

## Recently Completed
- ✅ Completed task 1
- ✅ Completed task 2

## Next Steps
- Next task 1
- Next task 2

## Notes
- Any important context or observations
```

