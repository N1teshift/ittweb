const fs = require('fs');
const path = require('path');

const WOWPEDIA_DIR = path.join(__dirname, '..', 'public', 'icons', 'itt', 'wowpedia');

function removeReforgedIcons() {
  if (!fs.existsSync(WOWPEDIA_DIR)) {
    console.log('❌ Wowpedia directory does not exist:', WOWPEDIA_DIR);
    return;
  }

  console.log('🗑️  Removing Reforged icons...\n');
  console.log(`📁 Scanning directory: ${WOWPEDIA_DIR}\n`);

  const files = fs.readdirSync(WOWPEDIA_DIR);
  const reforgedFiles = files.filter(file => 
    file.toLowerCase().includes('-reforged') && 
    (file.toLowerCase().endsWith('.png') || file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg'))
  );

  if (reforgedFiles.length === 0) {
    console.log('✅ No Reforged icons found to delete.');
    return;
  }

  console.log(`🔍 Found ${reforgedFiles.length} Reforged icons to delete\n`);

  let deleted = 0;
  let errors = 0;
  const errorsList = [];

  for (const file of reforgedFiles) {
    const filePath = path.join(WOWPEDIA_DIR, file);
    try {
      fs.unlinkSync(filePath);
      deleted++;
      if (deleted % 100 === 0) {
        console.log(`   ✅ Deleted ${deleted}/${reforgedFiles.length}...`);
      }
    } catch (err) {
      errors++;
      errorsList.push({ file, error: err.message });
      console.log(`   ❌ Failed to delete ${file}: ${err.message}`);
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   ✅ Deleted: ${deleted}`);
  console.log(`   ❌ Errors: ${errors}`);
  if (errors > 0) {
    console.log('\n⚠️  Files with errors:');
    errorsList.forEach(({ file, error }) => {
      console.log(`   - ${file}: ${error}`);
    });
  }
  console.log(`\n💡 Remaining icons: ${files.length - reforgedFiles.length}`);
}

if (require.main === module) {
  removeReforgedIcons();
}

module.exports = { removeReforgedIcons };

