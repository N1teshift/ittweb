/**
 * Fix escaping issues in iconMap.ts
 * The problem is that keys with trailing apostrophes like "Philosopher'" 
 * are being escaped as "Philosopher\'" which breaks the syntax
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');
const ICON_MAP_FILE = path.join(ROOT_DIR, 'src', 'features', 'ittweb', 'guides', 'utils', 'iconMap.ts');

let content = fs.readFileSync(ICON_MAP_FILE, 'utf-8');

// Fix the pattern: 'Key\'': 'value' or 'Key\'': value (missing quote)
// Should be: 'Key\\'': 'value'
// The issue is that \' needs to be \\' to properly escape the quote
// First, fix cases where the value quote is missing
content = content.replace(/\\'': ([a-zA-Z][^']*)/g, "\\\\'': '$1");

// Then fix all the keys with trailing apostrophes
content = content.replace(/'([^']*)\\'': '/g, (match, key) => {
  // The key has a trailing apostrophe that needs to be escaped
  // We need to escape the backslash before the quote
  return `'${key.replace(/'/g, "\\'")}\\'': `;
});

fs.writeFileSync(ICON_MAP_FILE, content);
console.log('✅ Fixed escaping in iconMap.ts');

