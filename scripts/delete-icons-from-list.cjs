const fs = require('fs');
const path = require('path');

/**
 * Delete icons from a text file list
 * 
 * Usage:
 *   node scripts/delete-icons-from-list.cjs <text-file> [category] [--execute]
 * 
 * The text file should contain one filename per line, like:
 *   btn3m1.png
 *   btn3m2.png
 *   btnabomination.png
 * 
 * Or with category prefix:
 *   wowpedia/btn3m1.png
 *   wowpedia/btn3m2.png
 * 
 * If category is provided, it will be used as the base category.
 * Default category is 'wowpedia'.
 */

function deleteIconsFromList(textFilePath, category = 'wowpedia', dryRun = true) {
  if (!fs.existsSync(textFilePath)) {
    console.error(`❌ File not found: ${textFilePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(textFilePath, 'utf-8');
  const lines = content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#') && line.endsWith('.png'));

  if (lines.length === 0) {
    console.log('ℹ️  No icon filenames found in the file.');
    return;
  }

  const publicDir = path.join(__dirname, '..', 'public', 'icons', 'itt');
  const deleted = [];
  const notFound = [];
  const errors = [];

  console.log(`\n${dryRun ? '🔍 DRY RUN MODE' : '⚠️  DELETE MODE'}`);
  console.log(`Found ${lines.length} icons to delete\n`);

  for (const line of lines) {
    // Determine the full path
    let iconPath;
    let fullPath;
    
    if (line.includes('/')) {
      // Has category prefix (e.g., "wowpedia/btn3m1.png")
      const parts = line.split('/');
      const iconCategory = parts[0];
      const filename = parts[parts.length - 1];
      iconPath = `/icons/itt/${iconCategory}/${filename}`;
      fullPath = path.join(publicDir, iconCategory, filename);
    } else {
      // Just filename, use provided category
      iconPath = `/icons/itt/${category}/${line}`;
      fullPath = path.join(publicDir, category, line);
    }

    if (!fs.existsSync(fullPath)) {
      notFound.push({ path: iconPath, fullPath, line });
      console.log(`⚠️  Not found: ${iconPath} (from: ${line})`);
      continue;
    }

    if (dryRun) {
      console.log(`[DRY RUN] Would delete: ${iconPath}`);
      deleted.push({ path: iconPath, fullPath, line });
    } else {
      try {
        fs.unlinkSync(fullPath);
        console.log(`✓ Deleted: ${iconPath}`);
        deleted.push({ path: iconPath, fullPath, line });
      } catch (err) {
        console.error(`❌ Error deleting ${iconPath}: ${err.message}`);
        errors.push({ path: iconPath, fullPath, line, error: err.message });
      }
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Deleted: ${deleted.length}`);
  console.log(`   Not found: ${notFound.length}`);
  console.log(`   Errors: ${errors.length}`);

  if (dryRun && deleted.length > 0) {
    console.log(`\n💡 Run with --execute flag to actually delete the files:`);
    console.log(`   node scripts/delete-icons-from-list.cjs "${textFilePath}" ${category} --execute`);
  }

  if (notFound.length > 0) {
    console.log(`\n⚠️  Files not found (may have been already deleted):`);
    notFound.slice(0, 10).forEach(item => {
      console.log(`   - ${item.line} -> ${item.path}`);
    });
    if (notFound.length > 10) {
      console.log(`   ... and ${notFound.length - 10} more`);
    }
  }

  if (errors.length > 0) {
    console.log(`\n❌ Errors:`);
    errors.forEach(item => {
      console.log(`   - ${item.path}: ${item.error}`);
    });
  }
}

// Main execution
const args = process.argv.slice(2);
const execute = args.includes('--execute');
const textFile = args.find(arg => !arg.startsWith('--') && !arg.match(/^(wowpedia|abilities|items|buildings|trolls|unclassified|base)$/));
const category = args.find(arg => arg.match(/^(wowpedia|abilities|items|buildings|trolls|unclassified|base)$/)) || 'wowpedia';

if (!textFile) {
  console.error('Usage: node scripts/delete-icons-from-list.cjs <text-file> [category] [--execute]');
  console.error('\nExample:');
  console.error('  node scripts/delete-icons-from-list.cjs icons-to-delete.txt');
  console.error('  node scripts/delete-icons-from-list.cjs icons-to-delete.txt wowpedia --execute');
  console.error('\nThe text file should contain one filename per line.');
  process.exit(1);
}

deleteIconsFromList(textFile, category, !execute);


