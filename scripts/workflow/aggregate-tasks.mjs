#!/usr/bin/env node

/**
 * Task Aggregation Script
 * 
 * Aggregates and reports on open tasks across all agent task files.
 * Based on workflow efficiency analysis findings.
 * 
 * Usage:
 *   node scripts/workflow/aggregate-tasks.mjs [options]
 * 
 * Options:
 *   --output <file>    Output file path (default: .workflow/progress/TASK_REPORT.md)
 *   --format <format>  Output format: markdown, json, summary (default: markdown)
 *   --agent <name>     Filter by agent name
 *   --priority <level> Filter by priority (High, Medium, Low)
 *   --stats-only       Only output statistics, no task list
 * 
 * Output:
 *   Generates comprehensive task report with statistics and task listings
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKFLOW_DIR = path.join(__dirname, '../../.workflow');
const PROGRESS_DIR = path.join(WORKFLOW_DIR, 'progress');
const DEFAULT_OUTPUT = path.join(PROGRESS_DIR, 'TASK_REPORT.md');

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

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    output: DEFAULT_OUTPUT,
    format: 'markdown',
    agent: null,
    priority: null,
    statsOnly: false,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--output' && i + 1 < args.length) {
      options.output = args[i + 1];
      i++;
    } else if (args[i] === '--format' && i + 1 < args.length) {
      options.format = args[i + 1];
      i++;
    } else if (args[i] === '--agent' && i + 1 < args.length) {
      options.agent = args[i + 1];
      i++;
    } else if (args[i] === '--priority' && i + 1 < args.length) {
      options.priority = args[i + 1];
      i++;
    } else if (args[i] === '--stats-only') {
      options.statsOnly = true;
    }
  }

  return options;
}

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    return null;
  }
}

function extractTasks(content, agentName) {
  if (!content) return [];

  const tasks = [];
  const lines = content.split('\n');
  let inSpecificTasks = false;
  let currentSection = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Track section headers
    if (line.match(/^##+ /)) {
      currentSection = line.replace(/^##+\s+/, '');
      inSpecificTasks = currentSection.toLowerCase().includes('specific task');
    }

    // Match task items: - [ ] or - [🚧] or - [x] or - [🚧] with emoji
    const taskMatch = line.match(/^- \[([ 🚧x🚧]|🚧)\] (.+)$/);
    
    if (taskMatch) {
      const checkbox = taskMatch[1].trim();
      const taskText = taskMatch[2].trim();
      
      // Only process open tasks (not completed)
      if (checkbox === 'x' || checkbox === 'X') continue;
      
      // Check if line contains emoji directly
      const hasEmoji = line.includes('🚧');
      
      if (!taskText || taskText.length === 0) continue;
      
      // Extract metadata from following lines (next 30 lines max)
      let priority = 'Medium';
      let tags = [];
      let status = 'Available';
      let assignedTo = 'Unassigned';
      let type = '';
      let context = '';
      let files = [];
      let notes = '';
      let claimed = '';
      let started = '';
      let isBlocked = false;
      let isInProgress = checkbox === '🚧' || checkbox.includes('🚧');
      
      for (let j = i + 1; j < Math.min(i + 30, lines.length); j++) {
        const metaLine = lines[j];
        
        // Stop if we hit another task or section header
        if (metaLine.match(/^- \[/) || metaLine.match(/^##+ /)) break;
        
        // Extract priority
        const priorityMatch = metaLine.match(/  - \*\*Priority\*\*:\s*(High|Medium|Low|Critical)/i);
        if (priorityMatch) priority = priorityMatch[1];
        
        // Extract tags
        const tagsMatch = metaLine.match(/  - \*\*Tags\*\*:\s*(.+)$/i);
        if (tagsMatch) {
          tags = tagsMatch[1].split(/\s+/).filter(t => t.startsWith('`') || t.includes(':'));
        }
        
        // Extract status
        const statusMatch = metaLine.match(/  - \*\*Status\*\*:\s*(.+?)(?:\s*\||$)/i);
        if (statusMatch) {
          status = statusMatch[1].trim();
          if (status.toLowerCase().includes('in progress')) isInProgress = true;
          if (status.toLowerCase().includes('blocked') || status.toLowerCase().includes('waiting')) {
            isBlocked = true;
          }
        }
        
        // Extract assigned to
        const assignedMatch = metaLine.match(/  - \*\*Assigned To\*\*:\s*(.+?)(?:\s*\||$)/i);
        if (assignedMatch) assignedTo = assignedMatch[1].trim();
        
        // Extract type
        const typeMatch = metaLine.match(/  - \*\*Type\*\*:\s*(.+?)(?:\s*\||$)/i);
        if (typeMatch) type = typeMatch[1].trim();
        
        // Extract context
        const contextMatch = metaLine.match(/  - \*\*Context\*\*:\s*(.+)$/i);
        if (contextMatch) context = contextMatch[1].trim();
        
        // Extract files
        const filesMatch = metaLine.match(/  - \*\*Files\*\*:\s*(.+)$/i);
        if (filesMatch) {
          files = filesMatch[1].split(',').map(f => f.trim());
        }
        
        // Extract notes
        const notesMatch = metaLine.match(/  - \*\*Notes\*\*:\s*(.+)$/i);
        if (notesMatch) notes = notesMatch[1].trim();
        
        // Extract dates
        const claimedMatch = metaLine.match(/  - \*\*Claimed\*\*:\s*(\d{4}-\d{2}-\d{2})/i);
        if (claimedMatch) claimed = claimedMatch[1];
        
        const startedMatch = metaLine.match(/  - \*\*Started\*\*:\s*(\d{4}-\d{2}-\d{2})/i);
        if (startedMatch) started = startedMatch[1];
        
        // Check for blocked indicators
        if (metaLine.includes('⏸️') || metaLine.includes('⏸') || 
            metaLine.toLowerCase().includes('blocked') ||
            metaLine.toLowerCase().includes('waiting')) {
          isBlocked = true;
        }
      }
      
      // Update status based on checkbox or emoji
      if (hasEmoji || checkbox.includes('🚧')) {
        isInProgress = true;
      }
      if (isInProgress) {
        status = status.includes('In Progress') ? status : 'In Progress';
      }
      
      tasks.push({
        agent: agentName,
        text: taskText,
        priority,
        tags,
        status,
        assignedTo,
        type,
        context,
        files,
        notes,
        claimed,
        started,
        blocked: isBlocked,
        inProgress: isInProgress,
        section: currentSection,
        isSpecificTask: inSpecificTasks,
      });
    }
  }
  
  return tasks;
}

function collectAllTasks(options) {
  const allTasks = [];
  const taskFiles = fs.readdirSync(PROGRESS_DIR)
    .filter(file => file.endsWith('-tasks.md'))
    .sort();

  for (const taskFile of taskFiles) {
    const agentName = AGENT_NAMES[taskFile] || taskFile.replace('-tasks.md', '');
    
    // Filter by agent if specified
    if (options.agent && !agentName.toLowerCase().includes(options.agent.toLowerCase())) {
      continue;
    }
    
    const filePath = path.join(PROGRESS_DIR, taskFile);
    const content = readFile(filePath);
    
    if (content) {
      const tasks = extractTasks(content, agentName);
      
      // Filter by priority if specified
      if (options.priority) {
        const filtered = tasks.filter(t => 
          t.priority.toLowerCase() === options.priority.toLowerCase()
        );
        allTasks.push(...filtered);
      } else {
        allTasks.push(...tasks);
      }
    }
  }

  return allTasks;
}

function calculateStatistics(tasks) {
  const stats = {
    total: tasks.length,
    byPriority: {
      High: 0,
      Critical: 0,
      Medium: 0,
      Low: 0,
    },
    byStatus: {
      Available: 0,
      'In Progress': 0,
      Claimed: 0,
      Blocked: 0,
    },
    byAgent: {},
    blocked: 0,
    inProgress: 0,
    assigned: 0,
    unassigned: 0,
    specificTasks: 0,
    prePopulated: 0,
  };

  for (const task of tasks) {
    // Priority
    const priority = task.priority || 'Medium';
    stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1;
    
    // Status
    const status = task.status || 'Available';
    stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
    
    // Agent
    stats.byAgent[task.agent] = (stats.byAgent[task.agent] || 0) + 1;
    
    // Flags
    if (task.blocked) stats.blocked++;
    if (task.inProgress) stats.inProgress++;
    if (task.assignedTo && task.assignedTo !== 'Unassigned') stats.assigned++;
    else stats.unassigned++;
    if (task.isSpecificTask) stats.specificTasks++;
    else stats.prePopulated++;
  }

  return stats;
}

function generateMarkdownReport(tasks, stats, options) {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0];

  let report = `# Task Aggregation Report

**Generated**: ${dateStr} ${timeStr}  
**Total Open Tasks**: ${stats.total}

> 💡 **Tip**: This report is auto-generated. Run \`node scripts/workflow/aggregate-tasks.mjs\` to regenerate.

---

## Quick Statistics

| Metric | Count |
|--------|-------|
| **Total Open Tasks** | ${stats.total} |
| **High Priority** | ${stats.byPriority.High + stats.byPriority.Critical} |
| **Medium Priority** | ${stats.byPriority.Medium} |
| **Low Priority** | ${stats.byPriority.Low} |
| **In Progress** | ${stats.inProgress} |
| **Blocked** | ${stats.blocked} |
| **Assigned** | ${stats.assigned} |
| **Unassigned** | ${stats.unassigned} |
| **Specific Tasks** | ${stats.specificTasks} |
| **Pre-populated Work Items** | ${stats.prePopulated} |

---

## Tasks by Priority

### 🔴 High Priority Tasks (${stats.byPriority.High + stats.byPriority.Critical})

`;

  const highPriorityTasks = tasks.filter(t => 
    t.priority === 'High' || t.priority === 'Critical'
  ).sort((a, b) => {
    // Sort by priority (Critical > High), then by agent
    if (a.priority === 'Critical' && b.priority !== 'Critical') return -1;
    if (a.priority !== 'Critical' && b.priority === 'Critical') return 1;
    return a.agent.localeCompare(b.agent);
  });

  if (highPriorityTasks.length === 0) {
    report += '- No high priority tasks\n';
  } else {
    for (const task of highPriorityTasks) {
      const statusIcon = task.blocked ? '🔴' : task.inProgress ? '🚧' : '⚪';
      const assigned = task.assignedTo && task.assignedTo !== 'Unassigned' 
        ? ` | Assigned: ${task.assignedTo}` 
        : '';
      report += `- ${statusIcon} **${task.agent}**: ${task.text}${assigned}\n`;
    }
  }

  report += `\n### 🟡 Medium Priority Tasks (${stats.byPriority.Medium})\n\n`;

  const mediumPriorityTasks = tasks.filter(t => t.priority === 'Medium')
    .sort((a, b) => a.agent.localeCompare(b.agent));

  if (mediumPriorityTasks.length === 0) {
    report += '- No medium priority tasks\n';
  } else {
    for (const task of mediumPriorityTasks.slice(0, 20)) {
      const statusIcon = task.blocked ? '🔴' : task.inProgress ? '🚧' : '⚪';
      const assigned = task.assignedTo && task.assignedTo !== 'Unassigned' 
        ? ` | Assigned: ${task.assignedTo}` 
        : '';
      report += `- ${statusIcon} **${task.agent}**: ${task.text}${assigned}\n`;
    }
    if (mediumPriorityTasks.length > 20) {
      report += `\n_... and ${mediumPriorityTasks.length - 20} more medium priority tasks_\n`;
    }
  }

  report += `\n### 🟢 Low Priority Tasks (${stats.byPriority.Low})\n\n`;

  const lowPriorityTasks = tasks.filter(t => t.priority === 'Low')
    .sort((a, b) => a.agent.localeCompare(b.agent));

  if (lowPriorityTasks.length === 0) {
    report += '- No low priority tasks\n';
  } else {
    report += `_${lowPriorityTasks.length} low priority tasks available_\n`;
  }

  report += `\n---

## Tasks by Agent

`;

  const agents = Object.keys(stats.byAgent).sort();
  for (const agent of agents) {
    const agentTasks = tasks.filter(t => t.agent === agent);
    report += `### ${agent} (${agentTasks.length} tasks)\n\n`;
    
    const high = agentTasks.filter(t => t.priority === 'High' || t.priority === 'Critical');
    const medium = agentTasks.filter(t => t.priority === 'Medium');
    const low = agentTasks.filter(t => t.priority === 'Low');
    
    if (high.length > 0) {
      report += `**High Priority (${high.length})**:\n`;
      for (const task of high.slice(0, 5)) {
        const statusIcon = task.blocked ? '🔴' : task.inProgress ? '🚧' : '⚪';
        report += `- ${statusIcon} ${task.text}\n`;
      }
      if (high.length > 5) report += `_... and ${high.length - 5} more_\n`;
      report += '\n';
    }
    
    if (medium.length > 0 && high.length === 0) {
      report += `**Medium Priority (${medium.length})**:\n`;
      for (const task of medium.slice(0, 3)) {
        const statusIcon = task.blocked ? '🔴' : task.inProgress ? '🚧' : '⚪';
        report += `- ${statusIcon} ${task.text}\n`;
      }
      if (medium.length > 3) report += `_... and ${medium.length - 3} more_\n`;
      report += '\n';
    }
  }

  report += `---

## Task Status Breakdown

| Status | Count |
|--------|-------|
| Available | ${stats.byStatus.Available} |
| In Progress | ${stats.inProgress} |
| Claimed | ${stats.byStatus.Claimed} |
| Blocked | ${stats.blocked} |

---

## Navigation

- [📋 Task Index](../TASK_INDEX.md) - Find tasks by agent, priority, feature, goal
- [📊 Dashboard](./DASHBOARD.md) - Comprehensive workflow overview
- [📚 Workflow README](../README.md) - Workflow system overview

---

**Report Generation**: Run \`node scripts/workflow/aggregate-tasks.mjs\` to regenerate this report.
`;

  return report;
}

function generateJSONReport(tasks, stats) {
  return JSON.stringify({
    generated: new Date().toISOString(),
    statistics: stats,
    tasks: tasks,
  }, null, 2);
}

function generateSummaryReport(tasks, stats) {
  return `Task Aggregation Summary
Generated: ${new Date().toISOString()}

Total Open Tasks: ${stats.total}
- High Priority: ${stats.byPriority.High + stats.byPriority.Critical}
- Medium Priority: ${stats.byPriority.Medium}
- Low Priority: ${stats.byPriority.Low}
- In Progress: ${stats.inProgress}
- Blocked: ${stats.blocked}
- Assigned: ${stats.assigned}
- Unassigned: ${stats.unassigned}

Top Agents by Task Count:
${Object.entries(stats.byAgent)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([agent, count]) => `  - ${agent}: ${count}`)
  .join('\n')}
`;
}

// Main execution
const options = parseArgs();
const tasks = collectAllTasks(options);
const stats = calculateStatistics(tasks);

if (options.statsOnly) {
  console.log(generateSummaryReport(tasks, stats));
} else {
  let report;
  
  switch (options.format) {
    case 'json':
      report = generateJSONReport(tasks, stats);
      break;
    case 'summary':
      report = generateSummaryReport(tasks, stats);
      break;
    case 'markdown':
    default:
      report = generateMarkdownReport(tasks, stats, options);
      break;
  }
  
  // Write to file
  fs.writeFileSync(options.output, report, 'utf-8');
  console.log(`Task report generated: ${options.output}`);
  console.log(`Total tasks: ${stats.total}`);
  console.log(`High priority: ${stats.byPriority.High + stats.byPriority.Critical}`);
  console.log(`In progress: ${stats.inProgress}`);
  console.log(`Blocked: ${stats.blocked}`);
}

