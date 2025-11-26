/**
 * Check for missing icon files - simpler version
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..', '..');
const ICONS_DIR = path.join(ROOT_DIR, 'public', 'icons', 'itt');
const ICON_MAP_FILE = path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'data', 'iconMap.ts');

// Get existing icons (case-insensitive)
const existingIcons = new Set();
if (fs.existsSync(ICONS_DIR)) {
  const files = fs.readdirSync(ICONS_DIR);
  files.forEach(file => {
    if (file.toLowerCase().endsWith('.png')) {
      existingIcons.add(file.toLowerCase());
    }
  });
}

// Read iconMap
const content = fs.readFileSync(ICON_MAP_FILE, 'utf-8');

// Extract all mappings
const allMappings = [];
const categories = ['abilities', 'items', 'units', 'buildings', 'trolls'];

categories.forEach(category => {
  const regex = new RegExp(`${category}:\\s*\\{([\\s\\S]*?)\\},`, 'g');
  const match = content.match(regex);
  if (match) {
    const categoryContent = match[0];
    const mappingRegex = /'([^']+)':\s*'([^']+)'/g;
    let m;
    while ((m = mappingRegex.exec(categoryContent)) !== null) {
      allMappings.push({
        category,
        entityName: m[1],
        iconFilename: m[2]
      });
    }
  }
});

// Find missing
const missing = allMappings.filter(m => !existingIcons.has(m.iconFilename.toLowerCase()));

// Group by category
const byCategory = {};
missing.forEach(m => {
  if (!byCategory[m.category]) byCategory[m.category] = [];
  byCategory[m.category].push(m);
});

// Write to file
const outputFile = path.join(ROOT_DIR, 'missing-icons-report.txt');
let output = `Missing Icon Files Report\n`;
output += `Generated: ${new Date().toISOString()}\n`;
output += `=${'='.repeat(50)}\n\n`;
output += `Total mappings: ${allMappings.length}\n`;
output += `Missing icons: ${missing.length}\n\n`;

if (missing.length > 0) {
  Object.entries(byCategory).forEach(([cat, arr]) => {
    if (arr.length > 0) {
      output += `${cat.toUpperCase()} (${arr.length}):\n`;
      arr.forEach(m => {
        output += `  "${m.entityName}" → ${m.iconFilename}\n`;
      });
      output += `\n`;
    }
  });
  
  const uniqueMissing = [...new Set(missing.map(m => m.iconFilename))];
  output += `\nUnique missing icon files (${uniqueMissing.length}):\n`;
  uniqueMissing.sort().forEach(icon => output += `  ${icon}\n`);
} else {
  output += '✅ All icons exist!\n';
}

fs.writeFileSync(outputFile, output);
// Also output to console
process.stdout.write(output);
process.stdout.write(`\n📄 Report written to: ${path.relative(ROOT_DIR, outputFile)}\n`);

