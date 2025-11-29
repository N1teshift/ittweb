#!/usr/bin/env node

/**
 * Get System Info Script
 * 
 * Returns workflow system information including current date/time and workflow version.
 * Agents can run this script to get system information.
 * 
 * Usage: node scripts/workflow/get-system-info.mjs
 */

import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '../..');

async function getSystemInfo() {
  const now = new Date();
  
  try {
    // Read workflow version
    const versionPath = join(PROJECT_ROOT, '.workflow', 'VERSION.md');
    const versionContent = await readFile(versionPath, 'utf-8');
    const versionMatch = versionContent.match(/Current Version.*?(\d+\.\d+\.\d+)/);
    
    const info = {
      currentDate: now.toISOString().split('T')[0],
      currentTime: now.toISOString().split('T')[1].split('.')[0] + 'Z',
      iso: now.toISOString(),
      timestamp: now.getTime(),
      workflowVersion: versionMatch?.[1] || 'unknown',
      timezone: 'UTC'
    };
    
    console.log(JSON.stringify(info, null, 2));
  } catch (error) {
    // If version file doesn't exist, just return date/time
    const info = {
      currentDate: now.toISOString().split('T')[0],
      currentTime: now.toISOString().split('T')[1].split('.')[0] + 'Z',
      iso: now.toISOString(),
      timestamp: now.getTime(),
      workflowVersion: 'unknown',
      timezone: 'UTC',
      error: 'Could not read workflow version file'
    };
    
    console.log(JSON.stringify(info, null, 2));
    process.exit(1);
  }
}

getSystemInfo();

