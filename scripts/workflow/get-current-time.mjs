#!/usr/bin/env node

/**
 * Get Current Time Script
 * 
 * Returns current date and time in various formats.
 * Agents can run this script to get accurate current date/time.
 * 
 * Usage: node scripts/workflow/get-current-time.mjs [format]
 * 
 * Formats:
 *   date      - YYYY-MM-DD
 *   time      - HH:MM:SS
 *   iso       - ISO 8601 format
 *   timestamp - Unix timestamp (milliseconds)
 *   all       - All formats (default)
 */

const now = new Date();
const format = process.argv[2] || 'all';

const result = {};

if (format === 'all' || format === 'date') {
  result.date = now.toISOString().split('T')[0]; // YYYY-MM-DD
}

if (format === 'all' || format === 'time') {
  result.time = now.toISOString().split('T')[1].split('.')[0] + 'Z'; // HH:MM:SSZ
}

if (format === 'all' || format === 'iso') {
  result.iso = now.toISOString();
}

if (format === 'all' || format === 'timestamp') {
  result.timestamp = now.getTime();
}

result.timezone = 'UTC';

// Output as JSON for easy parsing
console.log(JSON.stringify(result, null, 2));

