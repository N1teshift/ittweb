/**
 * Fix iconPath casing to match actual files on disk.
 * This resolves case-sensitivity issues between Windows (dev) and Linux (prod).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

// Build lookup of actual icon filenames (lowercase key -> actual name)
const iconsDir = path.join(ROOT, 'public/icons/itt');
const iconFiles = fs.readdirSync(iconsDir).filter(f => f.endsWith('.png'));
const iconLookup = new Map();
for (const file of iconFiles) {
  iconLookup.set(file.toLowerCase(), file);
}
console.log(`Built lookup of ${iconLookup.size} icon files`);

// Data directories to fix
const dataDirs = [
  'src/features/modules/guides/data/abilities',
  'src/features/modules/guides/data/items',
  'src/features/modules/guides/data/units',
];

let totalFixed = 0;

for (const dir of dataDirs) {
  const fullDir = path.join(ROOT, dir);
  if (!fs.existsSync(fullDir)) continue;
  
  const files = fs.readdirSync(fullDir).filter(f => f.endsWith('.ts'));
  
  for (const file of files) {
    const filePath = path.join(fullDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let fileFixCount = 0;
    
    // Match iconPath: 'something.png' or iconPath: 'path/to/something.png'
    const newContent = content.replace(/iconPath:\s*'([^']+)'/g, (match, iconPath) => {
      // Handle paths with directories (like ReplaceableTextures/...)
      const filename = path.basename(iconPath);
      const actualFile = iconLookup.get(filename.toLowerCase());
      
      if (!actualFile) {
        // File doesn't exist in our icons folder - might be a path reference
        return match;
      }
      
      // If the casing is different, fix it
      if (actualFile !== filename) {
        modified = true;
        fileFixCount++;
        // Replace just the filename, keeping any directory prefix
        const dir = path.dirname(iconPath);
        const newPath = dir === '.' ? actualFile : `${dir}/${actualFile}`;
        return `iconPath: '${newPath}'`;
      }
      
      return match;
    });
    
    if (modified) {
      fs.writeFileSync(filePath, newContent);
      console.log(`Fixed ${fileFixCount} iconPath entries in ${dir}/${file}`);
      totalFixed += fileFixCount;
    }
  }
}

console.log(`\nTotal fixed: ${totalFixed} iconPath entries`);

