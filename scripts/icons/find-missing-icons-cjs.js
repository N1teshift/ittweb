/**
 * Find icons that are mapped but don't exist in the filesystem
 * CommonJS version for better compatibility
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');
const ICONS_DIR = path.join(ROOT_DIR, 'public', 'icons', 'itt');
const ICON_MAP_FILE = path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'data', 'iconMap.ts');
const OUTPUT_FILE = path.join(ROOT_DIR, 'missing-icons-report.txt');

// Get all icon files that actually exist
function getExistingIcons() {
  const existingIcons = new Set();
  if (!fs.existsSync(ICONS_DIR)) {
    console.warn(`Icons directory not found: ${ICONS_DIR}`);
    return existingIcons;
  }
  
  const entries = fs.readdirSync(ICONS_DIR, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile() && entry.name.toLowerCase().endsWith('.png')) {
      existingIcons.add(entry.name.toLowerCase());
    }
  }
  
  return existingIcons;
}

// Parse iconMap.ts to extract mappings
function parseIconMap() {
  const content = fs.readFileSync(ICON_MAP_FILE, 'utf-8');
  const mappings = {
    items: [],
    abilities: [],
    units: [],
    buildings: [],
    trolls: []
  };
  
  // Extract items mappings
  const itemsMatch = content.match(/items:\s*\{([\s\S]*?)\},/);
  if (itemsMatch) {
    const itemsContent = itemsMatch[1];
    const itemMatches = [...itemsContent.matchAll(/'([^']+)':\s*'([^']+)'/g)];
    for (const match of itemMatches) {
      mappings.items.push({
        entityName: match[1],
        iconFilename: match[2]
      });
    }
  }
  
  // Extract abilities mappings
  const abilitiesMatch = content.match(/abilities:\s*\{([\s\S]*?)\},/);
  if (abilitiesMatch) {
    const abilitiesContent = abilitiesMatch[1];
    const abilityMatches = [...abilitiesContent.matchAll(/'([^']+)':\s*'([^']+)'/g)];
    for (const match of abilityMatches) {
      mappings.abilities.push({
        entityName: match[1],
        iconFilename: match[2]
      });
    }
  }
  
  // Extract units mappings
  const unitsMatch = content.match(/units:\s*\{([\s\S]*?)\},/);
  if (unitsMatch) {
    const unitsContent = unitsMatch[1];
    const unitMatches = [...unitsContent.matchAll(/'([^']+)':\s*'([^']+)'/g)];
    for (const match of unitMatches) {
      mappings.units.push({
        entityName: match[1],
        iconFilename: match[2]
      });
    }
  }
  
  // Extract buildings mappings
  const buildingsMatch = content.match(/buildings:\s*\{([\s\S]*?)\},/);
  if (buildingsMatch) {
    const buildingsContent = buildingsMatch[1];
    const buildingMatches = [...buildingsContent.matchAll(/'([^']+)':\s*'([^']+)'/g)];
    for (const match of buildingMatches) {
      mappings.buildings.push({
        entityName: match[1],
        iconFilename: match[2]
      });
    }
  }
  
  // Extract trolls mappings
  const trollsMatch = content.match(/trolls:\s*\{([\s\S]*?)\},/);
  if (trollsMatch) {
    const trollsContent = trollsMatch[1];
    const trollMatches = [...trollsContent.matchAll(/'([^']+)':\s*'([^']+)'/g)];
    for (const match of trollMatches) {
      mappings.trolls.push({
        entityName: match[1],
        iconFilename: match[2]
      });
    }
  }
  
  return mappings;
}

function main() {
  console.log('🔍 Finding missing icon files...\n');
  
  // Get existing icons
  console.log('📁 Scanning icon directory...');
  const existingIcons = getExistingIcons();
  console.log(`   Found ${existingIcons.size} icon files\n`);
  
  // Parse iconMap
  console.log('📖 Reading iconMap.ts...');
  const mappings = parseIconMap();
  console.log(`   Items: ${mappings.items.length}`);
  console.log(`   Abilities: ${mappings.abilities.length}`);
  console.log(`   Units: ${mappings.units.length}`);
  console.log(`   Buildings: ${mappings.buildings.length}`);
  console.log(`   Trolls: ${mappings.trolls.length}\n`);
  
  // Find missing icons
  const missing = {
    items: [],
    abilities: [],
    units: [],
    buildings: [],
    trolls: []
  };
  
  function checkMappings(category, categoryMappings) {
    for (const mapping of categoryMappings) {
      const iconLower = mapping.iconFilename.toLowerCase();
      if (!existingIcons.has(iconLower)) {
        missing[category].push(mapping);
      }
    }
  }
  
  checkMappings('items', mappings.items);
  checkMappings('abilities', mappings.abilities);
  checkMappings('units', mappings.units);
  checkMappings('buildings', mappings.buildings);
  checkMappings('trolls', mappings.trolls);
  
  // Report results
  const totalMissing = Object.values(missing).reduce((sum, arr) => sum + arr.length, 0);
  
  let report = 'Missing Icon Files Report\n';
  report += '='.repeat(50) + '\n\n';
  
  if (totalMissing === 0) {
    console.log('✅ All mapped icons exist in the filesystem!');
    report += 'All mapped icons exist in the filesystem!\n';
  } else {
    console.log(`❌ Found ${totalMissing} entities mapped to missing icons:\n`);
    report += `Total entities with missing icons: ${totalMissing}\n`;
    
    const uniqueMissingIcons = new Set();
    Object.values(missing).forEach(arr => {
      arr.forEach(m => uniqueMissingIcons.add(m.iconFilename));
    });
    report += `Unique missing icon files: ${uniqueMissingIcons.size}\n\n`;
    
    if (missing.items.length > 0) {
      console.log(`📦 Items (${missing.items.length}):`);
      report += `ITEMS (${missing.items.length}):\n`;
      missing.items.forEach(m => {
        console.log(`   "${m.entityName}" → ${m.iconFilename}`);
        report += `  "${m.entityName}" → ${m.iconFilename}\n`;
      });
      console.log();
      report += '\n';
    }
    
    if (missing.abilities.length > 0) {
      console.log(`✨ Abilities (${missing.abilities.length}):`);
      report += `ABILITIES (${missing.abilities.length}):\n`;
      missing.abilities.forEach(m => {
        console.log(`   "${m.entityName}" → ${m.iconFilename}`);
        report += `  "${m.entityName}" → ${m.iconFilename}\n`;
      });
      console.log();
      report += '\n';
    }
    
    if (missing.units.length > 0) {
      console.log(`👤 Units (${missing.units.length}):`);
      report += `UNITS (${missing.units.length}):\n`;
      missing.units.forEach(m => {
        console.log(`   "${m.entityName}" → ${m.iconFilename}`);
        report += `  "${m.entityName}" → ${m.iconFilename}\n`;
      });
      console.log();
      report += '\n';
    }
    
    if (missing.buildings.length > 0) {
      console.log(`🏠 Buildings (${missing.buildings.length}):`);
      report += `BUILDINGS (${missing.buildings.length}):\n`;
      missing.buildings.forEach(m => {
        console.log(`   "${m.entityName}" → ${m.iconFilename}`);
        report += `  "${m.entityName}" → ${m.iconFilename}\n`;
      });
      console.log();
      report += '\n';
    }
    
    if (missing.trolls.length > 0) {
      console.log(`👥 Trolls (${missing.trolls.length}):`);
      report += `TROLLS (${missing.trolls.length}):\n`;
      missing.trolls.forEach(m => {
        console.log(`   "${m.entityName}" → ${m.iconFilename}`);
        report += `  "${m.entityName}" → ${m.iconFilename}\n`;
      });
      console.log();
      report += '\n';
    }
    
    report += '\nMissing Icon Files:\n';
    Array.from(uniqueMissingIcons).sort().forEach(icon => {
      report += `  ${icon}\n`;
    });
  }
  
  fs.writeFileSync(OUTPUT_FILE, report);
  console.log(`\n📄 Detailed report written to: ${path.relative(ROOT_DIR, OUTPUT_FILE)}`);
}

main();


