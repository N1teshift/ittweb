#!/usr/bin/env node

/**
 * Status Aggregation Script
 * 
 * Generates a system-wide status report by aggregating all agent status files.
 * 
 * Usage:
 *   node scripts/workflow/generate-status-report.js
 * 
 * Output:
 *   .workflow/progress/system-status.md
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKFLOW_DIR = path.join(__dirname, '../../.workflow');
const STATUS_DIR = path.join(WORKFLOW_DIR, 'progress/agent-status');
const OUTPUT_FILE = path.join(WORKFLOW_DIR, 'progress/system-status.md');

// Agent names mapping (file name to display name)
const AGENT_NAMES = {
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
};

function readStatusFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content;
  } catch (error) {
    return null;
  }
}

function extractStatusInfo(content, agentName) {
  if (!content) {
    return {
      agent: agentName,
      lastUpdated: 'Never',
      status: 'Unknown',
      hasStatus: false,
    };
  }

  // Extract last updated date
  const lastUpdatedMatch = content.match(/\*\*Last Updated\*\*:\s*(\d{4}-\d{2}-\d{2})/i);
  const lastUpdated = lastUpdatedMatch ? lastUpdatedMatch[1] : 'Unknown';

  // Extract status
  const statusMatch = content.match(/\*\*Status\*\*:\s*(Idle|Active|Blocked|Reviewing)/i);
  const status = statusMatch ? statusMatch[1] : 'Unknown';

  // Extract current work (first few lines)
  const currentWorkMatch = content.match(/### Current Work\s*\n((?:- .+\n?)+)/);
  const currentWork = currentWorkMatch ? currentWorkMatch[1].trim().split('\n').slice(0, 3).join('\n') : 'None';

  // Extract blockers
  const blockersMatch = content.match(/### Blockers\s*\n((?:- .+\n?)+|None)/);
  const blockers = blockersMatch ? blockersMatch[1].trim() : 'None';

  return {
    agent: agentName,
    lastUpdated,
    status,
    currentWork,
    blockers,
    hasStatus: true,
  };
}

function generateReport(statusInfos) {
  const timestamp = new Date().toISOString().split('T')[0];
  
  let report = `# System-Wide Status Report

**Generated**: ${timestamp}
**Purpose**: Aggregated view of all agent statuses

---

## Summary

**Total Agents**: ${statusInfos.length}
**Active Agents**: ${statusInfos.filter(s => s.status === 'Active').length}
**Idle Agents**: ${statusInfos.filter(s => s.status === 'Idle').length}
**Blocked Agents**: ${statusInfos.filter(s => s.status === 'Blocked').length}
**Agents with Status Files**: ${statusInfos.filter(s => s.hasStatus).length}

---

## Agent Statuses

`;

  // Group by status
  const byStatus = {
    'Active': statusInfos.filter(s => s.status === 'Active'),
    'Blocked': statusInfos.filter(s => s.status === 'Blocked'),
    'Reviewing': statusInfos.filter(s => s.status === 'Reviewing'),
    'Idle': statusInfos.filter(s => s.status === 'Idle'),
    'Unknown': statusInfos.filter(s => s.status === 'Unknown' || !s.hasStatus),
  };

  for (const [status, agents] of Object.entries(byStatus)) {
    if (agents.length === 0) continue;

    report += `### ${status} (${agents.length})\n\n`;
    
    for (const agent of agents) {
      report += `#### ${agent.agent}\n`;
      report += `- **Last Updated**: ${agent.lastUpdated}\n`;
      if (agent.currentWork && agent.currentWork !== 'None') {
        report += `- **Current Work**:\n${agent.currentWork.split('\n').map(line => `  ${line}`).join('\n')}\n`;
      }
      if (agent.blockers && agent.blockers !== 'None') {
        report += `- **Blockers**:\n${agent.blockers.split('\n').map(line => `  ${line}`).join('\n')}\n`;
      }
      report += `- **Status File**: \`.workflow/progress/agent-status/${agent.agent.toLowerCase().replace(/\s+/g, '-')}-status.md\`\n\n`;
    }
  }

  report += `---

## Notes

- This report is auto-generated from individual agent status files
- Update individual status files to update this report
- Run this script manually: \`node scripts/workflow/generate-status-report.js\`
- Status files location: \`.workflow/progress/agent-status/\`

---

**Last Generated**: ${timestamp}
`;

  return report;
}

function main() {
  console.log('Generating system-wide status report...');

  // Read all status files
  const statusInfos = [];
  
  for (const [fileName, agentName] of Object.entries(AGENT_NAMES)) {
    const filePath = path.join(STATUS_DIR, fileName);
    const content = readStatusFile(filePath);
    const info = extractStatusInfo(content, agentName);
    statusInfos.push(info);
  }

  // Generate report
  const report = generateReport(statusInfos);

  // Write report
  fs.writeFileSync(OUTPUT_FILE, report, 'utf-8');

  console.log(`✅ Status report generated: ${OUTPUT_FILE}`);
  console.log(`   Active: ${statusInfos.filter(s => s.status === 'Active').length}`);
  console.log(`   Idle: ${statusInfos.filter(s => s.status === 'Idle').length}`);
  console.log(`   Blocked: ${statusInfos.filter(s => s.status === 'Blocked').length}`);
}

main();

