const fs = require('fs');
const path = require('path');

// Adjust paths for running from scripts/ directory
const ROOT_DIR = path.join(__dirname, '..');
const ICONS_DIR = path.join(ROOT_DIR, 'public', 'icons', 'itt');
const ICON_MAP_FILE = path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'data', 'iconMap.ts');
const OUTPUT_FILE = path.join(ROOT_DIR, 'missing-icons-report.txt');

console.log('Reading icons directory...');
const existingIcons = new Set();
if (fs.existsSync(ICONS_DIR)) {
  const files = fs.readdirSync(ICONS_DIR);
  files.forEach(file => {
    if (file.toLowerCase().endsWith('.png')) {
      existingIcons.add(file.toLowerCase());
    }
  });
  console.log(`Found ${existingIcons.size} icon files`);
} else {
  console.error(`Icons directory not found: ${ICONS_DIR}`);
  process.exit(1);
}

console.log('Reading iconMap.ts...');
const content = fs.readFileSync(ICON_MAP_FILE, 'utf-8');
const allMatches = [...content.matchAll(/'([^']+)':\s*'([^']+\.png)'/g)];
console.log(`Found ${allMatches.length} mappings`);

const missing = [];
allMatches.forEach(match => {
  const iconFilename = match[2];
  if (!existingIcons.has(iconFilename.toLowerCase())) {
    missing.push({
      entity: match[1],
      icon: iconFilename
    });
  }
});

// Categorize
const byCategory = { abilities: [], items: [], units: [], buildings: [], trolls: [] };
missing.forEach(m => {
  const matchIndex = content.indexOf(`'${m.entity}': '${m.icon}'`);
  const beforeMatch = content.substring(0, matchIndex);
  const abilitiesIdx = beforeMatch.lastIndexOf('abilities:');
  const itemsIdx = beforeMatch.lastIndexOf('items:');
  const unitsIdx = beforeMatch.lastIndexOf('units:');
  const buildingsIdx = beforeMatch.lastIndexOf('buildings:');
  const trollsIdx = beforeMatch.lastIndexOf('trolls:');
  
  const indices = [
    { name: 'abilities', idx: abilitiesIdx },
    { name: 'items', idx: itemsIdx },
    { name: 'units', idx: unitsIdx },
    { name: 'buildings', idx: buildingsIdx },
    { name: 'trolls', idx: trollsIdx }
  ].filter(x => x.idx >= 0).sort((a, b) => b.idx - a.idx);
  
  const category = indices.length > 0 ? indices[0].name : 'unknown';
  byCategory[category].push(m);
});

let report = 'Missing Icon Files Report\n';
report += '='.repeat(50) + '\n\n';
report += `Total mappings checked: ${allMatches.length}\n`;
report += `Total missing icons: ${missing.length}\n\n`;

if (missing.length > 0) {
  Object.entries(byCategory).forEach(([cat, arr]) => {
    if (arr.length > 0) {
      report += `${cat.toUpperCase()} (${arr.length}):\n`;
      arr.forEach(m => {
        report += `  "${m.entity}" → ${m.icon}\n`;
      });
      report += '\n';
    }
  });
  
  const uniqueMissing = [...new Set(missing.map(m => m.icon))];
  report += `\nUnique missing icon files (${uniqueMissing.length}):\n`;
  uniqueMissing.sort().forEach(icon => {
    report += `  ${icon}\n`;
  });
} else {
  report += '✅ All icons exist!\n';
}

fs.writeFileSync(OUTPUT_FILE, report);
console.log('\n' + report);
console.log(`Report written to: ${OUTPUT_FILE}`);

