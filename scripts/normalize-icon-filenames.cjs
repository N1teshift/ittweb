const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '..', 'public', 'icons', 'itt');

/**
 * Normalize filename by replacing special characters with safe alternatives
 */
function normalizeFilename(filename) {
  return filename
    .replace(/%26/g, '-and-')  // %26 is URL-encoded &
    .replace(/&/g, '-and-')     // & -> -and-
    .replace(/%21/g, '')        // %21 is URL-encoded !
    .replace(/!/g, '')          // ! -> remove
    .replace(/%28/g, '-')       // %28 is URL-encoded (
    .replace(/\(/g, '-')        // ( -> -
    .replace(/%29/g, '-')       // %29 is URL-encoded )
    .replace(/\)/g, '-')        // ) -> -
    .replace(/%/g, '')          // Any remaining % -> remove
    .replace(/-+/g, '-')        // Multiple dashes -> single dash
    .replace(/^-|-$/g, '');     // Remove leading/trailing dashes
}

/**
 * Recursively find and rename files with special characters
 */
function normalizeFiles(dir, category, dryRun = true) {
  const renamed = [];
  const errors = [];
  
  function scanDirectory(currentDir, relativePath = '') {
    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        const relativeFilePath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
        
        if (entry.isDirectory()) {
          scanDirectory(fullPath, relativeFilePath);
        } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.png')) {
          const originalName = entry.name;
          const normalizedName = normalizeFilename(originalName);
          
          // Only rename if the name actually changed
          if (originalName !== normalizedName) {
            const newFullPath = path.join(currentDir, normalizedName);
            
            // Check if target already exists
            if (fs.existsSync(newFullPath)) {
              errors.push({
                original: relativeFilePath,
                normalized: normalizedName,
                error: 'Target file already exists'
              });
              continue;
            }
            
            renamed.push({
              category,
              original: relativeFilePath,
              normalized: normalizedName,
              oldPath: fullPath,
              newPath: newFullPath
            });
            
            if (!dryRun) {
              try {
                fs.renameSync(fullPath, newFullPath);
                console.log(`✓ Renamed: ${relativeFilePath} -> ${normalizedName}`);
              } catch (err) {
                errors.push({
                  original: relativeFilePath,
                  normalized: normalizedName,
                  error: err.message
                });
              }
            } else {
              console.log(`[DRY RUN] Would rename: ${relativeFilePath} -> ${normalizedName}`);
            }
          }
        }
      }
    } catch (err) {
      console.error(`Error scanning ${currentDir}:`, err.message);
    }
  }
  
  scanDirectory(dir);
  
  return { renamed, errors };
}

// Main execution
const categories = ['abilities', 'items', 'buildings', 'trolls', 'unclassified', 'base', 'wowpedia'];
const dryRun = process.argv.includes('--execute') ? false : true;

if (dryRun) {
  console.log('🔍 DRY RUN MODE - No files will be renamed. Use --execute to actually rename files.\n');
} else {
  console.log('⚠️  EXECUTE MODE - Files will be renamed!\n');
}

let totalRenamed = 0;
let totalErrors = 0;

for (const category of categories) {
  const categoryPath = path.join(iconsDir, category);
  
  if (!fs.existsSync(categoryPath)) {
    console.log(`⚠️  Category directory not found: ${category}`);
    continue;
  }
  
  console.log(`\n📁 Processing category: ${category}`);
  const { renamed, errors } = normalizeFiles(categoryPath, category, dryRun);
  
  totalRenamed += renamed.length;
  totalErrors += errors.length;
  
  if (renamed.length > 0) {
    console.log(`   Found ${renamed.length} files to rename`);
  }
  
  if (errors.length > 0) {
    console.log(`   ⚠️  ${errors.length} errors:`);
    errors.forEach(err => {
      console.log(`      - ${err.original}: ${err.error}`);
    });
  }
}

console.log(`\n📊 Summary:`);
console.log(`   Files to rename: ${totalRenamed}`);
console.log(`   Errors: ${totalErrors}`);

if (dryRun && totalRenamed > 0) {
  console.log(`\n💡 Run with --execute flag to actually rename the files:`);
  console.log(`   node scripts/normalize-icon-filenames.cjs --execute`);
}

