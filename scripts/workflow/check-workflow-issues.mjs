#!/usr/bin/env node

/**
 * Check Workflow Failure Issues Script
 * 
 * Lists GitHub issues created by the Workflow Monitor for workflow failures.
 * Requires GitHub CLI (gh) to be installed and authenticated.
 * 
 * Usage: node scripts/workflow/check-workflow-issues.mjs
 */

import { execSync } from 'child_process';

function checkGitHubCLI() {
  try {
    execSync('gh --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function listWorkflowIssues() {
  if (!checkGitHubCLI()) {
    console.log('⚠️  GitHub CLI (gh) is not installed or not in PATH.');
    console.log('\nTo install GitHub CLI:');
    console.log('  - Windows: winget install GitHub.cli');
    console.log('  - Mac: brew install gh');
    console.log('  - Linux: See https://github.com/cli/cli/blob/trunk/docs/install_linux.md\n');
    console.log('Then authenticate: gh auth login\n');
    return;
  }

  try {
    console.log('\n📋 Checking for workflow failure issues...\n');
    
    // List issues with workflow-failure label
    const output = execSync(
      'gh issue list --label workflow-failure --state open --limit 10 --json number,title,createdAt,labels',
      { encoding: 'utf-8', stdio: 'pipe' }
    );
    
    const issues = JSON.parse(output);
    
    if (issues.length === 0) {
      console.log('✅ No open workflow failure issues found.\n');
      console.log('This means either:');
      console.log('  - All workflows are passing ✅');
      console.log('  - Issues have been closed');
      console.log('  - No workflows have failed recently\n');
      return;
    }
    
    console.log(`Found ${issues.length} open workflow failure issue(s):\n`);
    
    issues.forEach((issue, index) => {
      const labels = issue.labels.map(l => l.name).join(', ');
      const createdAt = new Date(issue.createdAt).toLocaleString();
      
      console.log(`${index + 1}. #${issue.number}: ${issue.title}`);
      console.log(`   Created: ${createdAt}`);
      console.log(`   Labels: ${labels}`);
      console.log(`   View: gh issue view ${issue.number}`);
      console.log('');
    });
    
    console.log(`\nView all issues: gh issue list --label workflow-failure`);
    console.log(`View issue details: gh issue view <number>`);
    console.log('');
    
  } catch (error) {
    if (error.message.includes('authentication')) {
      console.error('❌ GitHub CLI authentication required.');
      console.error('Run: gh auth login\n');
    } else {
      console.error('❌ Error checking issues:', error.message);
      console.error('\nMake sure you have:');
      console.error('  1. GitHub CLI installed (gh --version)');
      console.error('  2. Authenticated (gh auth login)');
      console.error('  3. Access to the repository\n');
    }
  }
}

function showManualInstructions() {
  console.log('\n📝 Manual Check Instructions:\n');
  console.log('1. Go to your GitHub repository');
  console.log('2. Click on "Issues" tab');
  console.log('3. Filter by label: "workflow-failure"');
  console.log('4. You should see issues created by the Workflow Monitor\n');
  
  console.log('Expected issue format:');
  console.log('  Title: "Workflow Failure: <Workflow Name> - <Commit SHA>"');
  console.log('  Labels: workflow-failure, ci/cd, devops');
  console.log('  Content: Details about the failed workflow run\n');
}

function main() {
  console.log('🔍 Workflow Failure Issues Check\n');
  
  listWorkflowIssues();
  showManualInstructions();
}

main();

