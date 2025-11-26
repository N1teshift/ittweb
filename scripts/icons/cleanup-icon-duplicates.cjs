const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '..', 'public', 'icons', 'itt');

function findDuplicates(dir, category) {
  const files = {};
  const duplicates = [];
  
  function scanDirectory(currentDir, relativePath = '') {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relativeFilePath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
      
      if (entry.isDirectory()) {
        scanDirectory(fullPath, relativeFilePath);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.png')) {
        const filename = entry.name;
        if (!files[filename]) {
          files[filename] = [];
        }
        files[filename].push({
          category,
          path: relativeFilePath,
          fullPath: fullPath.replace(/\\/g, '/'),
          isInSubdir: relativePath !== '',
        });
      }
    }
  }
  
  scanDirectory(dir);
  
  // Find duplicates - files that exist in both root and subdirectories
  for (const [filename, locations] of Object.entries(files)) {
    const rootFiles = locations.filter(loc => !loc.isInSubdir);
    const subdirFiles = locations.filter(loc => loc.isInSubdir);
    
    if (rootFiles.length > 0 && subdirFiles.length > 0) {
      duplicates.push({
        filename,
        rootFiles,
        subdirFiles,
      });
    }
  }
  
  return duplicates;
}

function removeEmptyDirectories(dir) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    // First, recursively remove empty subdirectories
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subdirPath = path.join(dir, entry.name);
        removeEmptyDirectories(subdirPath);
        
        // Check if directory is now empty
        const subdirEntries = fs.readdirSync(subdirPath);
        if (subdirEntries.length === 0) {
          fs.rmdirSync(subdirPath);
          console.log(`   ✓ Removed empty directory: ${entry.name}/`);
        }
      }
    }
  } catch (err) {
    // Directory might not exist or already removed
  }
}

function cleanupCategory(category) {
  const categoryDir = path.join(iconsDir, category);
  if (!fs.existsSync(categoryDir)) {
    return { removed: 0, errors: [] };
  }
  
  const duplicates = findDuplicates(categoryDir, category);
  let removed = 0;
  const errors = [];
  
  for (const dup of duplicates) {
    // Remove files from subdirectories (keep root versions)
    for (const subdirFile of dup.subdirFiles) {
      try {
        const fullPath = path.resolve(categoryDir, subdirFile.path);
        fs.unlinkSync(fullPath);
        removed++;
      } catch (err) {
        errors.push(`Failed to remove ${subdirFile.path}: ${err.message}`);
      }
    }
  }
  
  // Remove empty subdirectories
  removeEmptyDirectories(categoryDir);
  
  return { removed, errors, duplicates: duplicates.length };
}

function cleanupIcons() {
  const categories = ['abilities', 'items', 'buildings', 'trolls', 'unclassified', 'base'];
  let totalRemoved = 0;
  let totalDuplicates = 0;
  const allErrors = [];
  
  console.log('🧹 Cleaning up icon duplicates...\n');
  console.log('Strategy: Keep icons in root, remove from subdirectories\n');
  
  for (const category of categories) {
    const categoryDir = path.join(iconsDir, category);
    if (!fs.existsSync(categoryDir)) {
      console.log(`⚠️  Category ${category} does not exist, skipping...`);
      continue;
    }
    
    const result = cleanupCategory(category);
    if (result.removed > 0 || result.duplicates > 0) {
      console.log(`📁 ${category}:`);
      console.log(`   - Removed ${result.removed} duplicate files from subdirectories`);
      console.log(`   - Found ${result.duplicates} duplicate filenames`);
      if (result.errors.length > 0) {
        console.log(`   - ⚠️  ${result.errors.length} errors`);
        allErrors.push(...result.errors);
      }
      console.log('');
      totalRemoved += result.removed;
      totalDuplicates += result.duplicates;
    }
  }
  
  console.log(`\n✅ Cleanup complete!`);
  console.log(`   - Total files removed: ${totalRemoved}`);
  console.log(`   - Total duplicate filenames: ${totalDuplicates}`);
  if (allErrors.length > 0) {
    console.log(`   - ⚠️  Errors: ${allErrors.length}`);
    allErrors.forEach(err => console.log(`      ${err}`));
  }
  console.log(`\n💡 All icons are now in root directories only.`);
}

if (require.main === module) {
  cleanupIcons();
}

module.exports = { cleanupIcons, cleanupCategory };


