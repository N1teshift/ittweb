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
        });
      }
    }
  }
  
  scanDirectory(dir);
  
  // Find duplicates
  for (const [filename, locations] of Object.entries(files)) {
    if (locations.length > 1) {
      duplicates.push({
        filename,
        locations,
        count: locations.length,
      });
    }
  }
  
  return duplicates;
}

function analyzeIcons() {
  const categories = ['abilities', 'items', 'buildings', 'trolls', 'unclassified', 'base'];
  const allDuplicates = {};
  let totalDuplicates = 0;
  
  console.log('🔍 Analyzing icon duplicates...\n');
  
  for (const category of categories) {
    const categoryDir = path.join(iconsDir, category);
    if (!fs.existsSync(categoryDir)) {
      console.log(`⚠️  Category ${category} does not exist, skipping...`);
      continue;
    }
    
    const duplicates = findDuplicates(categoryDir, category);
    if (duplicates.length > 0) {
      allDuplicates[category] = duplicates;
      totalDuplicates += duplicates.length;
      console.log(`📁 ${category}: ${duplicates.length} duplicate filenames found`);
      
      // Show first few examples
      duplicates.slice(0, 3).forEach(dup => {
        console.log(`   - ${dup.filename} (${dup.count} copies)`);
        dup.locations.forEach(loc => {
          console.log(`     → ${loc.path}`);
        });
      });
      if (duplicates.length > 3) {
        console.log(`   ... and ${duplicates.length - 3} more`);
      }
      console.log('');
    }
  }
  
  console.log(`\n📊 Summary: ${totalDuplicates} duplicate filenames found across all categories\n`);
  
  // Generate cleanup recommendations
  console.log('💡 Recommendations:');
  console.log('   1. Keep icons in subdirectories (enabled/, disabled/) and remove from root');
  console.log('   2. Or keep icons in root and remove from subdirectories');
  console.log('   3. Update icon resolution logic to check subdirectories if needed\n');
  
  return allDuplicates;
}

if (require.main === module) {
  analyzeIcons();
}

module.exports = { analyzeIcons, findDuplicates };

