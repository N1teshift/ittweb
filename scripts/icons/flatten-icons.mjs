/**
 * Flatten icon directory structure
 * Moves all icon files from subdirectories into a single flat directory
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..', '..');
const ICONS_DIR = path.join(ROOT_DIR, 'public', 'icons', 'itt');

const categories = ['abilities', 'items', 'buildings', 'trolls', 'units', 'base', 'unclassified', 'wowpedia'];

const conflicts = [];
const moved = [];
const skipped = [];

/**
 * Recursively move files from source directory to target
 */
function moveFilesFromDir(sourceDir, category, targetDir) {
  if (!fs.existsSync(sourceDir)) return;

  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(sourceDir, entry.name);

    if (entry.isDirectory()) {
      // Recursively process subdirectories
      moveFilesFromDir(fullPath, category, targetDir);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.png')) {
      const targetPath = path.join(targetDir, entry.name);

      if (fs.existsSync(targetPath)) {
        // Conflict: file already exists in target
        conflicts.push({ file: entry.name, from: category });
        skipped.push(entry.name);
      } else {
        // Move file to target
        fs.copyFileSync(fullPath, targetPath);
        moved.push({ file: entry.name, from: category });
      }
    }
  }
}

console.log('🔄 Flattening icon directory structure...\n');

// Move files from each category directory
for (const cat of categories) {
  const catDir = path.join(ICONS_DIR, cat);
  if (fs.existsSync(catDir)) {
    moveFilesFromDir(catDir, cat, ICONS_DIR);
  }
}

console.log(`✅ Moved: ${moved.length} files`);
console.log(`⚠️  Skipped (conflicts): ${skipped.length} files`);

if (conflicts.length > 0) {
  console.log('\n📋 Conflicts (files that already existed in target):');
  conflicts.slice(0, 20).forEach(c => {
    console.log(`   ${c.file} (from ${c.from})`);
  });
  if (conflicts.length > 20) {
    console.log(`   ... and ${conflicts.length - 20} more`);
  }
}

console.log('\n✨ Done! All icons are now in the flat directory structure.');

