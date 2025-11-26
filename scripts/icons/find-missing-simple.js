const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.join(__dirname, '..', '..', 'public', 'icons', 'itt');
const ICON_MAP_FILE = path.join(__dirname, '..', '..', 'src', 'features', 'modules', 'guides', 'data', 'iconMap.ts');
const OUTPUT_FILE = path.join(__dirname, '..', '..', 'missing-icons-report.txt');

// Get existing icons
const existingIcons = new Set();
if (fs.existsSync(ICONS_DIR)) {
  fs.readdirSync(ICONS_DIR).forEach(file => {
    if (file.toLowerCase().endsWith('.png')) {
      existingIcons.add(file.toLowerCase());
    }
  });
}

// Read and parse iconMap
const content = fs.readFileSync(ICON_MAP_FILE, 'utf-8');
const allMatches = [...content.matchAll(/'([^']+)':\s*'([^']+\.png)'/g)];

// Categorize matches
const byCategory = { abilities: [], items: [], units: [], buildings: [], trolls: [] };
allMatches.forEach(match => {
  const entityName = match[1];
  const iconFilename = match[2];
  const iconLower = iconFilename.toLowerCase();
  
  if (!existingIcons.has(iconLower)) {
    // Determine category by finding which section it's in
    const matchIndex = match.index;
    const beforeMatch = content.substring(0, matchIndex);
    
    // Find the last occurrence of each category marker
    const abilitiesIdx = beforeMatch.lastIndexOf('abilities:');
    const itemsIdx = beforeMatch.lastIndexOf('items:');
    const unitsIdx = beforeMatch.lastIndexOf('units:');
    const buildingsIdx = beforeMatch.lastIndexOf('buildings:');
    const trollsIdx = beforeMatch.lastIndexOf('trolls:');
    
    // Find which category marker is closest before this match
    const indices = [
      { name: 'abilities', idx: abilitiesIdx },
      { name: 'items', idx: itemsIdx },
      { name: 'units', idx: unitsIdx },
      { name: 'buildings', idx: buildingsIdx },
      { name: 'trolls', idx: trollsIdx }
    ].filter(x => x.idx >= 0).sort((a, b) => b.idx - a.idx);
    
    const category = indices.length > 0 ? indices[0].name : 'unknown';
    byCategory[category].push({ entityName, iconFilename });
  }
});

// Generate report
let report = 'Missing Icon Files Report\n';
report += '='.repeat(50) + '\n\n';
report += `Total mappings checked: ${allMatches.length}\n`;
const totalMissing = Object.values(byCategory).reduce((sum, arr) => sum + arr.length, 0);
report += `Total missing icons: ${totalMissing}\n\n`;

if (totalMissing > 0) {
  Object.entries(byCategory).forEach(([cat, arr]) => {
    if (arr.length > 0) {
      report += `${cat.toUpperCase()} (${arr.length}):\n`;
      arr.forEach(m => {
        report += `  "${m.entityName}" → ${m.iconFilename}\n`;
      });
      report += '\n';
    }
  });
  
  const uniqueMissing = [...new Set(Object.values(byCategory).flat().map(m => m.iconFilename))];
  report += `\nUnique missing icon files (${uniqueMissing.length}):\n`;
  uniqueMissing.sort().forEach(icon => {
    report += `  ${icon}\n`;
  });
} else {
  report += '✅ All icons exist!\n';
}

fs.writeFileSync(OUTPUT_FILE, report);
// Force output
process.stdout.write(report);
process.stdout.write(`\nReport written to: ${path.relative(path.join(__dirname, '..', '..'), OUTPUT_FILE)}\n`);
process.exit(0);

