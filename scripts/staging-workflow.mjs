#!/usr/bin/env node

/**
 * Staging Workflow Helper Script
 * 
 * Helps manage the staging → production deployment workflow.
 * 
 * Usage:
 *   node scripts/staging-workflow.mjs push-staging    # Push current branch to staging
 *   node scripts/staging-workflow.mjs deploy-prod     # Merge staging to main and deploy
 *   node scripts/staging-workflow.mjs status           # Show current branch status
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

const commands = {
  'push-staging': async () => {
    console.log('🚀 Pushing to staging branch...\n');
    
    try {
      // Get current branch
      const currentBranch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
      console.log(`Current branch: ${currentBranch}\n`);
      
      // Check if there are uncommitted changes
      const status = execSync('git status --porcelain', { encoding: 'utf-8' });
      if (status.trim()) {
        console.error('❌ Error: You have uncommitted changes. Please commit or stash them first.');
        process.exit(1);
      }
      
      // Switch to staging branch
      console.log('📦 Switching to staging branch...');
      execSync('git checkout staging', { stdio: 'inherit' });
      
      // Merge current branch into staging
      console.log(`\n🔄 Merging ${currentBranch} into staging...`);
      execSync(`git merge ${currentBranch} --no-edit`, { stdio: 'inherit' });
      
      // Push to staging
      console.log('\n⬆️  Pushing to staging...');
      execSync('git push origin staging', { stdio: 'inherit' });
      
      console.log('\n✅ Successfully pushed to staging!');
      console.log('📋 Your staging deployment will be available shortly.');
      console.log('   Check Vercel dashboard for the deployment URL.\n');
      
      // Switch back to original branch
      console.log(`🔄 Switching back to ${currentBranch}...`);
      execSync(`git checkout ${currentBranch}`, { stdio: 'inherit' });
      
    } catch (error) {
      console.error('\n❌ Error:', error.message);
      process.exit(1);
    }
  },
  
  'deploy-prod': async () => {
    console.log('🚀 Deploying to production...\n');
    
    try {
      // Get current branch
      const currentBranch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
      
      // Check if there are uncommitted changes
      const status = execSync('git status --porcelain', { encoding: 'utf-8' });
      if (status.trim()) {
        console.error('❌ Error: You have uncommitted changes. Please commit or stash them first.');
        process.exit(1);
      }
      
      // Ensure we're on staging or main
      if (currentBranch !== 'staging' && currentBranch !== 'main') {
        console.log(`⚠️  Warning: You're on ${currentBranch}, not staging or main.`);
        const proceed = await askQuestion('Do you want to merge staging to main? (y/n): ');
        if (proceed.toLowerCase() !== 'y') {
          console.log('Cancelled.');
          process.exit(0);
        }
      }
      
      // Switch to main branch
      console.log('📦 Switching to main branch...');
      execSync('git checkout main', { stdio: 'inherit' });
      
      // Pull latest changes
      console.log('\n⬇️  Pulling latest changes from main...');
      execSync('git pull origin main', { stdio: 'inherit' });
      
      // Merge staging into main
      console.log('\n🔄 Merging staging into main...');
      execSync('git merge staging --no-edit', { stdio: 'inherit' });
      
      // Push to main (this triggers production deployment)
      console.log('\n⬆️  Pushing to main (triggering production deployment)...');
      execSync('git push origin main', { stdio: 'inherit' });
      
      console.log('\n✅ Successfully deployed to production!');
      console.log('📋 Your production deployment is in progress.');
      console.log('   Check Vercel dashboard for deployment status.\n');
      
    } catch (error) {
      console.error('\n❌ Error:', error.message);
      process.exit(1);
    }
  },
  
  'status': async () => {
    try {
      const currentBranch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
      const status = execSync('git status --porcelain', { encoding: 'utf-8' });
      const hasUncommitted = status.trim().length > 0;
      
      console.log('📊 Current Status:\n');
      console.log(`Branch: ${currentBranch}`);
      console.log(`Uncommitted changes: ${hasUncommitted ? 'Yes ⚠️' : 'No ✅'}`);
      
      // Check if staging branch exists
      try {
        execSync('git rev-parse --verify staging', { stdio: 'ignore' });
        const stagingAhead = execSync(`git rev-list --left-right --count ${currentBranch}...staging`, { encoding: 'utf-8' }).trim();
        const [behind, ahead] = stagingAhead.split('\t').map(Number);
        
        console.log(`\nStaging branch: exists`);
        if (behind > 0 || ahead > 0) {
          console.log(`  ${currentBranch} is ${behind} commits behind, ${ahead} commits ahead of staging`);
        } else {
          console.log(`  ${currentBranch} is in sync with staging`);
        }
      } catch {
        console.log('\n⚠️  Staging branch does not exist locally.');
        console.log('   Run: git checkout -b staging && git push -u origin staging');
      }
      
      // Check if main branch exists
      try {
        const mainAhead = execSync(`git rev-list --left-right --count ${currentBranch}...main`, { encoding: 'utf-8' }).trim();
        const [behind, ahead] = mainAhead.split('\t').map(Number);
        
        console.log(`\nMain branch: exists`);
        if (behind > 0 || ahead > 0) {
          console.log(`  ${currentBranch} is ${behind} commits behind, ${ahead} commits ahead of main`);
        } else {
          console.log(`  ${currentBranch} is in sync with main`);
        }
      } catch {
        console.log('\n⚠️  Main branch does not exist locally.');
      }
      
      console.log('\n💡 Quick commands:');
      console.log('   Push to staging:    node scripts/staging-workflow.mjs push-staging');
      console.log('   Deploy to prod:     node scripts/staging-workflow.mjs deploy-prod');
      
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  }
};

// Helper function to ask question (simple version)
function askQuestion(question) {
  // For now, we'll use a simple approach
  // In a real implementation, you might want to use readline
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    readline.question(question, (answer) => {
      readline.close();
      resolve(answer);
    });
  });
}

// Main execution
const command = process.argv[2];

if (!command || !commands[command]) {
  console.log('Staging Workflow Helper\n');
  console.log('Usage: node scripts/staging-workflow.mjs <command>\n');
  console.log('Commands:');
  console.log('  push-staging    Push current branch to staging for testing');
  console.log('  deploy-prod     Merge staging to main and deploy to production');
  console.log('  status          Show current branch and deployment status\n');
  console.log('Examples:');
  console.log('  node scripts/staging-workflow.mjs push-staging');
  console.log('  node scripts/staging-workflow.mjs deploy-prod');
  console.log('  node scripts/staging-workflow.mjs status');
  process.exit(1);
}

commands[command]().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});

