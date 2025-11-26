/**
 * Unified Icon Cleanup Script
 * 
 * This script consolidates the functionality of:
 * - cleanup-icon-duplicates.cjs
 * - normalize-icon-filenames.cjs
 * - delete-icons-from-list.cjs
 * - delete-marked-icons.cjs
 * 
 * Usage:
 *   node scripts/icons/cleanup-icons.mjs [--remove-duplicates] [--normalize] [--delete-list <file>] [--delete-marked <file>] [--execute]
 * 
 * By default, runs in dry-run mode. Use --execute to actually perform deletions/renames.
 */

import fs from 'fs';
import path from 'path';
import { PATHS, ICON_CATEGORIES } from '../lib/constants.mjs';

const ICONS_DIR = PATHS.ICONS_DIR;

// Parse command line arguments
const args = process.argv.slice(2);
const removeDuplicates = args.includes('--remove-duplicates');
const normalize = args.includes('--normalize');
const deleteListIndex = args.indexOf('--delete-list');
const deleteMarkedIndex = args.indexOf('--delete-marked');
const execute = args.includes('--execute');

const deleteListFile = deleteListIndex >= 0 && args[deleteListIndex + 1] ? args[deleteListIndex + 1] : null;
const deleteMarkedFile = deleteMarkedIndex >= 0 && args[deleteMarkedIndex + 1] ? args[deleteMarkedIndex + 1] : null;

const dryRun = !execute;

/**
 * Find duplicate icons (same filename in root and subdirectories)
 */
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

/**
 * Remove duplicate icons (keep root, remove from subdirectories)
 */
function removeDuplicates(category) {
  const categoryDir = path.join(ICONS_DIR, category);
  if (!fs.existsSync(categoryDir)) {
    return { removed: 0, errors: [] };
  }
  
  const duplicates = findDuplicates(categoryDir, category);
  const removed = [];
  const errors = [];
  
  for (const dup of duplicates) {
    // Keep root files, remove subdirectory files
    for (const subdirFile of dup.subdirFiles) {
      if (dryRun) {
        console.log(`[DRY RUN] Would remove: ${subdirFile.path}`);
        removed.push(subdirFile);
      } else {
        try {
          fs.unlinkSync(subdirFile.fullPath);
          console.log(`✓ Removed: ${subdirFile.path}`);
          removed.push(subdirFile);
        } catch (err) {
          errors.push({ file: subdirFile.path, error: err.message });
        }
      }
    }
  }
  
  return { removed: removed.length, errors };
}

/**
 * Normalize filename by replacing special characters
 */
function normalizeFilename(filename) {
  return filename
    .replace(/%26/g, '-and-')
    .replace(/&/g, '-and-')
    .replace(/%21/g, '')
    .replace(/!/g, '')
    .replace(/%28/g, '-')
    .replace(/\(/g, '-')
    .replace(/%29/g, '-')
    .replace(/\)/g, '-')
    .replace(/%/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Normalize icon filenames
 */
function normalizeFilenames(category) {
  const categoryDir = path.join(ICONS_DIR, category);
  if (!fs.existsSync(categoryDir)) {
    return { renamed: 0, errors: [] };
  }
  
  const renamed = [];
  const errors = [];
  
  function scanDirectory(currentDir, relativePath = '') {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relativeFilePath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
      
      if (entry.isDirectory()) {
        scanDirectory(fullPath, relativeFilePath);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.png')) {
        const originalName = entry.name;
        const normalizedName = normalizeFilename(originalName);
        
        if (originalName !== normalizedName) {
          const newFullPath = path.join(currentDir, normalizedName);
          
          if (fs.existsSync(newFullPath)) {
            errors.push({
              original: relativeFilePath,
              normalized: normalizedName,
              error: 'Target file already exists'
            });
            continue;
          }
          
          if (dryRun) {
            console.log(`[DRY RUN] Would rename: ${relativeFilePath} -> ${normalizedName}`);
            renamed.push({ original: relativeFilePath, normalized: normalizedName });
          } else {
            try {
              fs.renameSync(fullPath, newFullPath);
              console.log(`✓ Renamed: ${relativeFilePath} -> ${normalizedName}`);
              renamed.push({ original: relativeFilePath, normalized: normalizedName });
            } catch (err) {
              errors.push({
                original: relativeFilePath,
                normalized: normalizedName,
                error: err.message
              });
            }
          }
        }
      }
    }
  }
  
  scanDirectory(categoryDir);
  return { renamed: renamed.length, errors };
}

/**
 * Delete icons from a text file list
 */
function deleteIconsFromList(textFilePath, category = 'wowpedia') {
  if (!fs.existsSync(textFilePath)) {
    console.error(`❌ File not found: ${textFilePath}`);
    return { deleted: 0, notFound: 0, errors: [] };
  }
  
  const content = fs.readFileSync(textFilePath, 'utf-8');
  const lines = content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#') && line.endsWith('.png'));
  
  if (lines.length === 0) {
    console.log('ℹ️  No icon filenames found in the file.');
    return { deleted: 0, notFound: 0, errors: [] };
  }
  
  const deleted = [];
  const notFound = [];
  const errors = [];
  
  for (const line of lines) {
    let iconPath;
    let fullPath;
    
    if (line.includes('/')) {
      const parts = line.split('/');
      const iconCategory = parts[0];
      const filename = parts[parts.length - 1];
      iconPath = `/icons/itt/${iconCategory}/${filename}`;
      fullPath = path.join(ICONS_DIR, iconCategory, filename);
    } else {
      iconPath = `/icons/itt/${category}/${line}`;
      fullPath = path.join(ICONS_DIR, category, line);
    }
    
    if (fs.existsSync(fullPath)) {
      if (dryRun) {
        console.log(`[DRY RUN] Would delete: ${iconPath}`);
        deleted.push(iconPath);
      } else {
        try {
          fs.unlinkSync(fullPath);
          console.log(`✓ Deleted: ${iconPath}`);
          deleted.push(iconPath);
        } catch (err) {
          errors.push({ path: iconPath, error: err.message });
        }
      }
    } else {
      notFound.push(iconPath);
    }
  }
  
  return { deleted: deleted.length, notFound: notFound.length, errors };
}

/**
 * Delete marked icons from JSON file
 */
function deleteMarkedIcons(jsonFilePath) {
  if (!fs.existsSync(jsonFilePath)) {
    console.error(`❌ File not found: ${jsonFilePath}`);
    return { deleted: 0, notFound: 0, errors: [] };
  }
  
  const jsonContent = fs.readFileSync(jsonFilePath, 'utf-8');
  let markedForDeletion = [];
  
  try {
    const data = JSON.parse(jsonContent);
    
    if (Array.isArray(data)) {
      markedForDeletion = data;
    } else if (data.markedForDeletion && Array.isArray(data.markedForDeletion)) {
      markedForDeletion = data.markedForDeletion;
    } else {
      console.error('❌ Invalid JSON format.');
      return { deleted: 0, notFound: 0, errors: [] };
    }
  } catch (err) {
    console.error(`❌ Error parsing JSON: ${err.message}`);
    return { deleted: 0, notFound: 0, errors: [] };
  }
  
  if (markedForDeletion.length === 0) {
    console.log('ℹ️  No icons marked for deletion.');
    return { deleted: 0, notFound: 0, errors: [] };
  }
  
  const deleted = [];
  const notFound = [];
  const errors = [];
  
  for (const iconPath of markedForDeletion) {
    // Convert /icons/itt/... to actual file path
    const relativePath = iconPath.replace(/^\/icons\/itt\//, '');
    const fullPath = path.join(ICONS_DIR, relativePath);
    
    if (fs.existsSync(fullPath)) {
      if (dryRun) {
        console.log(`[DRY RUN] Would delete: ${iconPath}`);
        deleted.push(iconPath);
      } else {
        try {
          fs.unlinkSync(fullPath);
          console.log(`✓ Deleted: ${iconPath}`);
          deleted.push(iconPath);
        } catch (err) {
          errors.push({ path: iconPath, error: err.message });
        }
      }
    } else {
      notFound.push(iconPath);
    }
  }
  
  return { deleted: deleted.length, notFound: notFound.length, errors };
}

/**
 * Remove empty directories
 */
function removeEmptyDirectories(dir) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subdirPath = path.join(dir, entry.name);
        removeEmptyDirectories(subdirPath);
        
        const subdirEntries = fs.readdirSync(subdirPath);
        if (subdirEntries.length === 0) {
          if (dryRun) {
            console.log(`[DRY RUN] Would remove empty directory: ${entry.name}/`);
          } else {
            fs.rmdirSync(subdirPath);
            console.log(`✓ Removed empty directory: ${entry.name}/`);
          }
        }
      }
    }
  } catch (err) {
    // Directory might not exist
  }
}

function main() {
  console.log('🧹 Icon Cleanup\n');
  console.log('='.repeat(70));
  console.log(`${dryRun ? '🔍 DRY RUN MODE' : '⚠️  EXECUTE MODE'}\n`);
  
  const categories = [...ICON_CATEGORIES, 'wowpedia'];
  let totalRemoved = 0;
  let totalRenamed = 0;
  let totalDeleted = 0;
  
  // Remove duplicates
  if (removeDuplicates) {
    console.log('🔍 Removing duplicate icons...\n');
    for (const category of categories) {
      const result = removeDuplicates(category);
      totalRemoved += result.removed;
      if (result.removed > 0) {
        console.log(`   ${category}: ${result.removed} duplicates removed`);
      }
      if (result.errors.length > 0) {
        console.log(`   ${category}: ${result.errors.length} errors`);
      }
    }
    console.log(`\n✅ Total duplicates removed: ${totalRemoved}\n`);
  }
  
  // Normalize filenames
  if (normalize) {
    console.log('📝 Normalizing icon filenames...\n');
    for (const category of categories) {
      const result = normalizeFilenames(category);
      totalRenamed += result.renamed;
      if (result.renamed > 0) {
        console.log(`   ${category}: ${result.renamed} files renamed`);
      }
      if (result.errors.length > 0) {
        console.log(`   ${category}: ${result.errors.length} errors`);
      }
    }
    console.log(`\n✅ Total files renamed: ${totalRenamed}\n`);
  }
  
  // Delete from list
  if (deleteListFile) {
    console.log(`🗑️  Deleting icons from list: ${deleteListFile}\n`);
    const result = deleteIconsFromList(deleteListFile);
    totalDeleted += result.deleted;
    console.log(`   Deleted: ${result.deleted}`);
    console.log(`   Not found: ${result.notFound}`);
    if (result.errors.length > 0) {
      console.log(`   Errors: ${result.errors.length}`);
    }
    console.log();
  }
  
  // Delete marked icons
  if (deleteMarkedFile) {
    console.log(`🗑️  Deleting marked icons from: ${deleteMarkedFile}\n`);
    const result = deleteMarkedIcons(deleteMarkedFile);
    totalDeleted += result.deleted;
    console.log(`   Deleted: ${result.deleted}`);
    console.log(`   Not found: ${result.notFound}`);
    if (result.errors.length > 0) {
      console.log(`   Errors: ${result.errors.length}`);
    }
    console.log();
  }
  
  // Clean up empty directories
  if ((removeDuplicates || deleteListFile || deleteMarkedFile) && totalRemoved + totalDeleted > 0) {
    console.log('🧹 Removing empty directories...\n');
    removeEmptyDirectories(ICONS_DIR);
  }
  
  if (!removeDuplicates && !normalize && !deleteListFile && !deleteMarkedFile) {
    console.log('ℹ️  No operations specified. Use --remove-duplicates, --normalize, --delete-list, or --delete-marked');
    console.log('   Add --execute to actually perform operations (default is dry-run)\n');
  } else {
    console.log('✅ Icon cleanup complete!\n');
  }
}

main();

