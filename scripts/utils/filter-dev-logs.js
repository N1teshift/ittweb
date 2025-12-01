#!/usr/bin/env node

/**
 * Development log filter
 * Filters out Next.js Fast Refresh logs to reduce terminal noise
 * 
 * Usage: node scripts/filter-dev-logs.js next dev
 * 
 * Set SHOW_ALL_LOGS=true to disable filtering
 */

import { spawn } from 'child_process';
const args = process.argv.slice(2);

// Patterns to filter out
const FILTER_PATTERNS = [
  /\[Fast Refresh\]/i,
  /\[HMR\]/i,
  /hot-reloader-pages/i,
  /report-hmr-latency/i,
];

// Check if filtering is disabled
const SKIP_FILTER = process.env.SHOW_ALL_LOGS === 'true';

function shouldFilter(line) {
  if (SKIP_FILTER) return false;
  return FILTER_PATTERNS.some(pattern => pattern.test(line));
}

// Spawn the actual command
const child = spawn(args[0], args.slice(1), {
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true,
});

// Filter stdout
child.stdout.on('data', (data) => {
  const lines = data.toString().split('\n');
  lines.forEach(line => {
    if (!shouldFilter(line)) {
      process.stdout.write(line + '\n');
    }
  });
});

// Filter stderr
child.stderr.on('data', (data) => {
  const lines = data.toString().split('\n');
  lines.forEach(line => {
    if (!shouldFilter(line)) {
      process.stderr.write(line + '\n');
    }
  });
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

// Forward signals
process.on('SIGINT', () => {
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  child.kill('SIGTERM');
});

