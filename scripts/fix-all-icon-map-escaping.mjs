/**
 * Fix ALL escaping issues in iconMap.ts
 * The problem is that keys with trailing apostrophes like "Bear'" 
 * are being escaped as "Bear\'" which breaks the syntax
 * They need to be "Bear\\'" (double backslash)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');
const ICON_MAP_FILE = path.join(ROOT_DIR, 'src', 'features', 'ittweb', 'guides', 'utils', 'iconMap.ts');

let content = fs.readFileSync(ICON_MAP_FILE, 'utf-8');

// Fix the pattern: 'Key\'': 'value'
// Should be: 'Key\\'': 'value'
// We need to match: single quote, any characters, backslash, single quote, single quote, colon, space, single quote
// And replace with: single quote, same characters, double backslash, single quote, single quote, colon, space, single quote

// Pattern 1: 'Key\'': 'value' (single backslash before closing quote)
content = content.replace(/'([^']*)\\'': '/g, "'$1\\\\'': '");

// Pattern 2: 'Key\\'': 'value' but value is missing quote (already broken)
// This shouldn't happen, but let's fix it if it does
content = content.replace(/'([^']*)\\\\'': ([a-zA-Z][^']*)/g, "'$1\\\\'': '$2");

fs.writeFileSync(ICON_MAP_FILE, content);
console.log('✅ Fixed all escaping in iconMap.ts');


