/**
 * Fix escaping issues in iconMap.ts
 * Removes trailing backslashes from keys and properly escapes strings
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..', '..');

const ICON_MAP_FILE = path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'utils', 'iconMap.ts');

function main() {
  console.log('🔧 Fixing iconMap.ts escaping issues...\n');
  
  const content = fs.readFileSync(ICON_MAP_FILE, 'utf-8');
  
  // Find all mapping entries and fix them
  // Pattern: 'key': 'value'
  // We need to:
  // 1. Remove trailing backslashes from keys (like 'A Thief\' -> 'A Thief')
  // 2. Properly escape backslashes and quotes
  
  let fixed = content;
  
  // Fix entries with trailing backslash before closing quote: 'key\': 'value'
  // Replace with: 'key': 'value' (remove the backslash)
  fixed = fixed.replace(/(\s+)'([^']*?)\\\':\s*'([^']+)'/g, (match, indent, key, value) => {
    // Remove trailing backslash from key
    const cleanKey = key.replace(/\\$/, '');
    // Properly escape the key and value
    const escapedKey = cleanKey.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const escapedValue = value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    return `${indent}'${escapedKey}': '${escapedValue}'`;
  });
  
  // Also fix entries that already have double backslash but we want to remove trailing backslash
  // Pattern: 'key\\': 'value' -> 'key': 'value'
  fixed = fixed.replace(/(\s+)'([^']*?)\\\\\':\s*'([^']+)'/g, (match, indent, key, value) => {
    // Remove trailing backslash from key
    const cleanKey = key.replace(/\\$/, '');
    // Properly escape
    const escapedKey = cleanKey.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const escapedValue = value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    return `${indent}'${escapedKey}': '${escapedValue}'`;
  });
  
  // Fix any remaining entries with single backslash before quote (shouldn't happen but just in case)
  fixed = fixed.replace(/(\s+)'([^']*?)\\\':\s*'([^']+)'/g, (match, indent, key, value) => {
    const cleanKey = key.replace(/\\$/, '');
    const escapedKey = cleanKey.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const escapedValue = value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    return `${indent}'${escapedKey}': '${escapedValue}'`;
  });
  
  // Write the fixed content
  fs.writeFileSync(ICON_MAP_FILE, fixed, 'utf-8');
  
  console.log('✅ Fixed iconMap.ts');
  console.log('   - Removed trailing backslashes from keys');
  console.log('   - Properly escaped all strings\n');
}

main();

