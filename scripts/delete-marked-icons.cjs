const fs = require('fs');
const path = require('path');

/**
 * Delete icons marked for deletion
 * 
 * Usage:
 *   node scripts/delete-marked-icons.cjs <json-file>
 * 
 * The JSON file should be in the format:
 * {
 *   "mappings": { ... },
 *   "markedForDeletion": [
 *     "/icons/itt/wowpedia/btnabomination.png",
 *     ...
 *   ]
 * }
 * 
 * Or just an array of paths:
 * [
 *   "/icons/itt/wowpedia/btnabomination.png",
 *   ...
 * ]
 */

function deleteMarkedIcons(jsonFilePath, dryRun = true) {
  if (!fs.existsSync(jsonFilePath)) {
    console.error(`❌ File not found: ${jsonFilePath}`);
    process.exit(1);
  }

  const jsonContent = fs.readFileSync(jsonFilePath, 'utf-8');
  let markedForDeletion = [];

  try {
    const data = JSON.parse(jsonContent);
    
    // Handle both formats: full export or just array
    if (Array.isArray(data)) {
      markedForDeletion = data;
    } else if (data.markedForDeletion && Array.isArray(data.markedForDeletion)) {
      markedForDeletion = data.markedForDeletion;
    } else {
      console.error('❌ Invalid JSON format. Expected array or object with "markedForDeletion" property.');
      process.exit(1);
    }
  } catch (err) {
    console.error(`❌ Error parsing JSON: ${err.message}`);
    process.exit(1);
  }

  if (markedForDeletion.length === 0) {
    console.log('ℹ️  No icons marked for deletion.');
    return;
  }

  const publicDir = path.join(__dirname, '..', 'public');
  const deleted = [];
  const notFound = [];
  const errors = [];

  console.log(`\n${dryRun ? '🔍 DRY RUN MODE' : '⚠️  DELETE MODE'}`);
  console.log(`Found ${markedForDeletion.length} icons marked for deletion\n`);

  for (const iconPath of markedForDeletion) {
    // Convert /icons/itt/... to public/icons/itt/...
    const relativePath = iconPath.startsWith('/') ? iconPath.substring(1) : iconPath;
    const fullPath = path.join(publicDir, relativePath);

    if (!fs.existsSync(fullPath)) {
      notFound.push({ path: iconPath, fullPath });
      console.log(`⚠️  Not found: ${iconPath}`);
      continue;
    }

    if (dryRun) {
      console.log(`[DRY RUN] Would delete: ${iconPath}`);
      deleted.push({ path: iconPath, fullPath });
    } else {
      try {
        fs.unlinkSync(fullPath);
        console.log(`✓ Deleted: ${iconPath}`);
        deleted.push({ path: iconPath, fullPath });
      } catch (err) {
        console.error(`❌ Error deleting ${iconPath}: ${err.message}`);
        errors.push({ path: iconPath, fullPath, error: err.message });
      }
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Deleted: ${deleted.length}`);
  console.log(`   Not found: ${notFound.length}`);
  console.log(`   Errors: ${errors.length}`);

  if (dryRun && deleted.length > 0) {
    console.log(`\n💡 Run with --execute flag to actually delete the files:`);
    console.log(`   node scripts/delete-marked-icons.cjs "${jsonFilePath}" --execute`);
  }

  if (notFound.length > 0) {
    console.log(`\n⚠️  Files not found (may have been already deleted):`);
    notFound.forEach(item => {
      console.log(`   - ${item.path}`);
    });
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
const jsonFile = args.find(arg => !arg.startsWith('--'));

if (!jsonFile) {
  console.error('Usage: node scripts/delete-marked-icons.cjs <json-file> [--execute]');
  console.error('\nExample:');
  console.error('  node scripts/delete-marked-icons.cjs marked-icons.json');
  console.error('  node scripts/delete-marked-icons.cjs marked-icons.json --execute');
  process.exit(1);
}

deleteMarkedIcons(jsonFile, !execute);

