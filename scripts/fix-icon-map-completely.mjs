/**
 * Completely fix iconMap.ts escaping issues
 * Replace all instances of 'Key\'': with 'Key\\'': 
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');
const ICON_MAP_FILE = path.join(ROOT_DIR, 'src', 'features', 'ittweb', 'guides', 'utils', 'iconMap.ts');

let content = fs.readFileSync(ICON_MAP_FILE, 'utf-8');

// Fix pattern: 'Key\'': 'value' -> 'Key\\'': 'value'
// We need to match: single quote, any chars (non-greedy), backslash, single quote, single quote, colon, space, single quote
// The tricky part is that \' in the source needs to become \\' in the output

// First, let's find all lines with this pattern and fix them line by line
const lines = content.split('\n');
const fixedLines = lines.map(line => {
  // Match pattern: '...\'': '...
  // We need to replace \': with \\':
  // But we need to be careful - in the source file, \' is already escaped
  // So we're looking for the literal backslash-quote-quote pattern
  
  // Pattern 1: 'Key\'': 'value' (single backslash before closing quotes)
  if (line.match(/'[^']*\\'': '/)) {
    // Replace the \': with \\':
    return line.replace(/(\s+)'([^']*)\\'': '/g, "$1'$2\\\\'': '");
  }
  
  // Pattern 2: 'Key\\'': 'value' but value is missing quote
  if (line.match(/'[^']*\\\\'': [^']/)) {
    // Add missing quote
    return line.replace(/(\s+)'([^']*)\\\\'': ([a-zA-Z][^']*)/g, "$1'$2\\\\'': '$3");
  }
  
  return line;
});

content = fixedLines.join('\n');
fs.writeFileSync(ICON_MAP_FILE, content);
console.log('✅ Fixed all escaping in iconMap.ts');


