#!/usr/bin/env node

/**
 * Workflow Dashboard Generator
 * 
 * Generates a comprehensive dashboard by aggregating:
 * - Agent statuses
 * - Active tasks across all agents
 * - Goal progress
 * - Blocked items
 * - Recent completions
 * 
 * Usage:
 *   node scripts/workflow/generate-dashboard.js
 * 
 * Output:
 *   .workflow/progress/DASHBOARD.md
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKFLOW_DIR = path.join(__dirname, '../../.workflow');
const PROGRESS_DIR = path.join(WORKFLOW_DIR, 'progress');
const STATUS_DIR = path.join(PROGRESS_DIR, 'agent-status');
const OUTPUT_FILE = path.join(PROGRESS_DIR, 'DASHBOARD.md');

// Agent names mapping
const AGENT_NAMES = {
  'test-tasks.md': 'Test Agent',
  'documentation-tasks.md': 'Documentation Agent',
  'frontend-tasks.md': 'Frontend Agent',
  'backend-tasks.md': 'Backend Agent',
  'quality-control-tasks.md': 'Quality Control Agent',
  'data-pipeline-tasks.md': 'Data Pipeline Agent',
  'refactoring-tasks.md': 'Refactoring Agent',
  'type-safety-tasks.md': 'Type Safety Agent',
  'performance-tasks.md': 'Performance Agent',
  'security-tasks.md': 'Security Agent',
  'devops-tasks.md': 'DevOps/Infrastructure Agent',
  'product-feature-tasks.md': 'Product/Feature Agent',
  'commit-assistant-tasks.md': 'Commit Assistant Agent',
  'workflow-manager-tasks.md': 'Workflow Manager Agent',
  'ceo-tasks.md': 'CEO Agent',
};

const AGENT_STATUS_NAMES = {
  'test-agent-status.md': 'Test Agent',
  'documentation-agent-status.md': 'Documentation Agent',
  'frontend-agent-status.md': 'Frontend Agent',
  'backend-agent-status.md': 'Backend Agent',
  'quality-control-agent-status.md': 'Quality Control Agent',
  'data-pipeline-agent-status.md': 'Data Pipeline Agent',
  'refactoring-agent-status.md': 'Refactoring Agent',
  'type-safety-agent-status.md': 'Type Safety Agent',
  'performance-agent-status.md': 'Performance Agent',
  'security-agent-status.md': 'Security Agent',
  'devops-infrastructure-agent-status.md': 'DevOps/Infrastructure Agent',
  'product-feature-agent-status.md': 'Product/Feature Agent',
  'commit-assistant-agent-status.md': 'Commit Assistant Agent',
  'workflow-manager-agent-status.md': 'Workflow Manager Agent',
  'ceo-agent-status.md': 'CEO Agent',
};

// Status emoji mapping
const STATUS_EMOJI = {
  'Active': '🟢',
  'Idle': '🟡',
  'Blocked': '🔴',
  'Reviewing': '🟠',
  'Unknown': '⚪',
};

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    return null;
  }
}

function extractStatusFromTasks(content) {
  if (!content) return 'Unknown';
  
  const statusMatch = content.match(/\*\*Status\*\*:\s*(Active|Idle|Blocked|Reviewing)/i);
  return statusMatch ? statusMatch[1] : 'Unknown';
}

function extractCurrentTask(content) {
  if (!content) return 'None';
  
  const taskMatch = content.match(/\*\*Current Task\*\*:\s*(.+?)(?:\n|$)/i);
  if (taskMatch) {
    return taskMatch[1].trim().replace(/\|.*$/, '').trim(); // Remove status after pipe
  }
  return 'None';
}

function extractLastUpdated(content) {
  if (!content) return 'Never';
  
  const dateMatch = content.match(/\*\*Last Updated\*\*:\s*(\d{4}-\d{2}-\d{2})/i);
  return dateMatch ? dateMatch[1] : 'Unknown';
}

function extractTasks(content, agentName) {
  if (!content) return [];
  
  const tasks = [];
  // Match tasks: - [ ] Task text followed by optional metadata lines
  const taskRegex = /^- \[ \] (.+?)(?:\n(?:  - \*\*.*?\*\*:.*?\n?)+)?/gms;
  let match;
  
  while ((match = taskRegex.exec(content)) !== null) {
    const taskText = match[1].trim();
    const fullMatch = match[0];
    
    // Extract priority (matches "  - **Priority**: High" format)
    const priorityMatch = fullMatch.match(/  - \*\*Priority\*\*:\s*(High|Medium|Low|Critical)/i) ||
                         fullMatch.match(/\*\*Priority\*\*:\s*(High|Medium|Low|Critical)/i);
    const priority = priorityMatch ? priorityMatch[1] : 'Medium';
    
    // Extract tags
    const tagsMatch = fullMatch.match(/  - \*\*Tags\*\*:\s*(.+?)(?:\n|$)/i) ||
                     fullMatch.match(/\*\*Tags\*\*:\s*(.+?)(?:\n|$)/i);
    const tags = tagsMatch ? tagsMatch[1] : '';
    
    // Extract status (if mentioned)
    const statusMatch = fullMatch.match(/  - \*\*Status\*\*:\s*(.+?)(?:\n|$)/i) ||
                       fullMatch.match(/\*\*Status\*\*:\s*(.+?)(?:\n|$)/i);
    const taskStatus = statusMatch ? statusMatch[1].trim() : '';
    
    // Check if blocked (look for blocked status, waiting, or pause emoji)
    const isBlocked = taskStatus.toLowerCase().includes('blocked') || 
                     taskStatus.toLowerCase().includes('waiting') ||
                     taskStatus.toLowerCase().includes('⏸️') ||
                     taskStatus.toLowerCase().includes('⏸');
    
    tasks.push({
      agent: agentName,
      text: taskText.length > 80 ? taskText.substring(0, 77) + '...' : taskText,
      priority,
      tags,
      status: taskStatus,
      blocked: isBlocked,
    });
  }
  
  return tasks;
}

function extractGoals(content) {
  if (!content) return [];
  
  const goals = [];
  // Split by goal headers and parse each section
  const goalSections = content.split(/^### (Goal \d+:)/gm);
  
  // Skip first section (everything before first goal)
  for (let i = 2; i < goalSections.length; i += 2) {
    const goalTitle = goalSections[i - 1].trim();
    const goalContent = goalSections[i];
    
    // Extract status
    const statusMatch = goalContent.match(/\*\*Status\*\*:\s*(.+?)(?:\n|$)/);
    const status = statusMatch ? statusMatch[1].trim() : 'Unknown';
    
    // Extract progress percentage
    const progressMatch = goalContent.match(/\*\*Progress\*\*:\s*(\d+)%/);
    const progress = progressMatch ? parseInt(progressMatch[1], 10) : 0;
    
    // Extract full goal name (title + first line of content)
    const firstLine = goalContent.split('\n')[0].trim();
    const goalName = firstLine ? `${goalTitle} ${firstLine}` : goalTitle;
    
    goals.push({
      name: goalName,
      status,
      progress,
    });
  }
  
  return goals;
}

function generateAgentStatusTable(statusInfos) {
  const rows = statusInfos.map(info => {
    const emoji = STATUS_EMOJI[info.status] || '⚪';
    const status = `${emoji} ${info.status}`;
    const task = info.currentTask.length > 50 ? info.currentTask.substring(0, 47) + '...' : info.currentTask;
    const blockers = info.blockers && info.blockers !== 'None' ? 'Yes' : 'No';
    
    return `| ${info.agent} | ${status} | ${task} | ${info.lastUpdated} | ${blockers} |`;
  }).join('\n');
  
  return rows;
}

function generateTasksByPriority(allTasks) {
  const high = allTasks.filter(t => t.priority === 'High' || t.priority === 'Critical').slice(0, 10);
  const medium = allTasks.filter(t => t.priority === 'Medium').slice(0, 10);
  const low = allTasks.filter(t => t.priority === 'Low').slice(0, 10);
  
  const formatTask = (task) => {
    return `- **${task.agent}**: ${task.text}`;
  };
  
  return {
    high: high.length > 0 ? high.map(formatTask).join('\n') : '- No high priority tasks',
    medium: medium.length > 0 ? medium.map(formatTask).join('\n') : '- No medium priority tasks',
    low: low.length > 0 ? low.map(formatTask).join('\n') : '- No low priority tasks',
  };
}

function generateGoalProgress(goals) {
  if (goals.length === 0) return 'No active goals found.';
  
  return goals.map(goal => {
    const statusIcon = goal.status === 'Complete' ? '✅' : 
                      goal.status === 'In Progress' ? '⏳' : 
                      goal.status === 'Blocked' ? '🔴' : '⚪';
    const progressBar = '█'.repeat(Math.floor(goal.progress / 5)) + '░'.repeat(20 - Math.floor(goal.progress / 5));
    
    return `- ${statusIcon} **${goal.name}**: ${goal.progress}% ${progressBar}`;
  }).join('\n');
}

function generateBlockedItems(allTasks) {
  const blocked = allTasks.filter(t => t.blocked);
  
  if (blocked.length === 0) return '- No blocked items';
  
  return blocked.map(task => {
    return `- **${task.agent}**: ${task.text}`;
  }).join('\n');
}

function generateDashboard(data) {
  const timestamp = new Date().toISOString().split('T')[0];
  
  return `# Workflow Dashboard

**Last Generated**: ${timestamp}  
**Purpose**: Comprehensive overview of all workflow activity, tasks, goals, and agent status

> 💡 **Tip**: This dashboard is auto-generated. Run \`node scripts/workflow/generate-dashboard.js\` to regenerate it.

---

## Quick Stats

| Metric | Value |
|--------|-------|
| **Total Agents** | ${data.totalAgents} |
| **Active Agents** | ${data.activeAgents} |
| **Idle Agents** | ${data.idleAgents} |
| **Blocked Agents** | ${data.blockedAgents} |
| **Total Active Tasks** | ${data.totalTasks} |
| **High Priority Tasks** | ${data.highPriorityTasks} |
| **Blocked Tasks** | ${data.blockedTasks} |
| **Overall Goal Progress** | ${typeof data.goalProgress === 'number' ? data.goalProgress + '%' : data.goalProgress} |

---

## Agent Status Overview

| Agent | Status | Current Task | Last Updated | Blockers |
|-------|--------|--------------|--------------|----------|
${data.agentStatusTable}

**Legend**: 🟢 Active | 🟡 Idle | 🔴 Blocked | 🟠 Reviewing | ⚪ Unknown

[View detailed status →](agent-status/)

---

## Active Tasks by Priority

### 🔴 High Priority Tasks

${data.tasksByPriority.high}

[View all tasks →](../TASK_INDEX.md)

### 🟡 Medium Priority Tasks

${data.tasksByPriority.medium}

[View all tasks →](../TASK_INDEX.md)

### 🟢 Low Priority Tasks

${data.tasksByPriority.low}

[View all tasks →](../TASK_INDEX.md)

---

## Goal Progress

${data.goalProgress}

[View detailed goals →](goals.md)

---

## Blocked Items

${data.blockedItems}

---

## Navigation

- [📋 Task Index](../TASK_INDEX.md) - Find tasks by agent, priority, feature, goal
- [📊 Agent Status](agent-status/) - Detailed agent status reports
- [🎯 Goals](goals.md) - Goal tracking and progress
- [✅ Completed Tasks](../completed-tasks.md) - Archive of completed work
- [📚 Workflow README](../README.md) - Workflow system overview

---

## Quick Actions

- **Find High Priority Work**: See [High Priority Tasks](#-high-priority-tasks) above
- **Check Agent Status**: See [Agent Status Overview](#agent-status-overview) above
- **Track Goal Progress**: See [Goal Progress](#goal-progress) above
- **View Blocked Items**: See [Blocked Items](#blocked-items) above

---

**How to Use This Dashboard**:

1. **Quick Overview**: Check Quick Stats and Agent Status Overview
2. **Find Work**: Browse tasks by priority in Active Tasks section
3. **Track Progress**: Monitor goal completion in Goal Progress section
4. **Identify Blockers**: Check Blocked Items section for items needing attention

---

**Dashboard Generation**: This dashboard is generated automatically. To regenerate:
\`\`\`bash
node scripts/workflow/generate-dashboard.js
\`\`\`
`;
}

function main() {
  console.log('Generating workflow dashboard...');

  // Collect agent statuses
  const statusInfos = [];
  for (const [fileName, agentName] of Object.entries(AGENT_STATUS_NAMES)) {
    const filePath = path.join(STATUS_DIR, fileName);
    const content = readFile(filePath);
    
    const status = extractStatusFromTasks(content);
    const currentTask = extractCurrentTask(content);
    const lastUpdated = extractLastUpdated(content);
    
    // Extract blockers (simplified)
    const blockersMatch = content ? content.match(/### Blockers\s*\n((?:- .+\n?)+|None)/) : null;
    const blockers = blockersMatch && blockersMatch[1] !== 'None' ? blockersMatch[1] : 'None';
    
    statusInfos.push({
      agent: agentName,
      status,
      currentTask,
      lastUpdated,
      blockers,
    });
  }

  // Collect tasks from all task files
  const allTasks = [];
  for (const [fileName, agentName] of Object.entries(AGENT_NAMES)) {
    const filePath = path.join(PROGRESS_DIR, fileName);
    const content = readFile(filePath);
    const tasks = extractTasks(content, agentName);
    allTasks.push(...tasks);
  }

  // Read goals
  const goalsContent = readFile(path.join(PROGRESS_DIR, 'goals.md'));
  const goals = extractGoals(goalsContent || '');

  // Calculate statistics
  const stats = {
    totalAgents: statusInfos.length,
    activeAgents: statusInfos.filter(s => s.status === 'Active').length,
    idleAgents: statusInfos.filter(s => s.status === 'Idle').length,
    blockedAgents: statusInfos.filter(s => s.status === 'Blocked').length,
    totalTasks: allTasks.length,
    highPriorityTasks: allTasks.filter(t => t.priority === 'High' || t.priority === 'Critical').length,
    blockedTasks: allTasks.filter(t => t.blocked).length,
    goalProgress: goals.length > 0 
      ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
      : 'N/A',
  };

  // Generate dashboard sections
  const dashboardData = {
    ...stats,
    agentStatusTable: generateAgentStatusTable(statusInfos),
    tasksByPriority: generateTasksByPriority(allTasks),
    goalProgress: generateGoalProgress(goals),
    blockedItems: generateBlockedItems(allTasks),
  };

  // Generate and write dashboard
  const dashboard = generateDashboard(dashboardData);
  fs.writeFileSync(OUTPUT_FILE, dashboard, 'utf-8');

  console.log(`✅ Dashboard generated: ${OUTPUT_FILE}`);
  console.log(`   Agents: ${stats.activeAgents} active, ${stats.idleAgents} idle, ${stats.blockedAgents} blocked`);
  console.log(`   Tasks: ${stats.totalTasks} total, ${stats.highPriorityTasks} high priority, ${stats.blockedTasks} blocked`);
  console.log(`   Goals: ${goals.length} active, ${stats.goalProgress}% average progress`);
}

main();

