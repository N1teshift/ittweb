/**
 * Comprehensive Icon Mapping Analysis
 * 
 * This script properly reads all TypeScript data files and provides
 * accurate statistics on icon mapping coverage.
 */

import { getAllIconFiles } from '../lib/icon-utils.mjs';
import { readItemsFromTS, readAbilitiesFromTS, readUnitsFromTS, readBaseClassesFromTS, readDerivedClassesFromTS } from '../lib/data-readers.mjs';
import { parseIconMap } from '../lib/iconmap-utils.mjs';
import { PATHS } from '../lib/constants.mjs';

/**
 * Strip color codes from text
 */
function stripColorCodes(text) {
  return text.replace(/\|c[0-9A-Fa-f]{8}/g, '').replace(/\|r/g, '').trim();
}

function main() {
  console.log('📊 Comprehensive Icon Mapping Analysis\n');
  console.log('='.repeat(70));
  
  // Get all icons using shared utility
  console.log('\n📁 Scanning icon directories...');
  const { icons: iconsMap, allFilenames } = getAllIconFiles();
  // Convert Map to array for compatibility
  const allIcons = [];
  const iconsByCategory = {};
  for (const [lowerKey, iconData] of iconsMap) {
    allIcons.push(iconData);
    if (!iconsByCategory[iconData.category]) {
      iconsByCategory[iconData.category] = [];
    }
    iconsByCategory[iconData.category].push(iconData.filename);
  }
  
  console.log(`   Total icons found: ${allIcons.length}`);
  for (const [category, files] of Object.entries(iconsByCategory)) {
    console.log(`   ${category}: ${files.length} icons`);
  }
  
  // Read data using shared utilities
  console.log('\n📦 Reading game data...');
  const items = readItemsFromTS();
  const abilities = readAbilitiesFromTS();
  const units = readUnitsFromTS();
  const baseClasses = readBaseClassesFromTS();
  const derivedClasses = readDerivedClassesFromTS();
  
  console.log(`   Items: ${items.length}`);
  console.log(`   Abilities: ${abilities.length}`);
  console.log(`   Units: ${units.length}`);
  console.log(`   Base Classes: ${baseClasses.length}`);
  console.log(`   Derived Classes: ${derivedClasses.length}`);
  
  // Read icon map using shared utility
  console.log('\n🗺️  Reading icon mappings...');
  const iconMap = parseIconMap();
  console.log(`   Abilities mapped: ${Object.keys(iconMap.abilities).length}`);
  console.log(`   Items mapped: ${Object.keys(iconMap.items).length}`);
  console.log(`   Buildings mapped: ${Object.keys(iconMap.buildings).length}`);
  console.log(`   Trolls mapped: ${Object.keys(iconMap.trolls).length}`);
  console.log(`   Units mapped: ${Object.keys(iconMap.units).length}`);
  
  // Analyze coverage
  console.log('\n📈 Coverage Analysis\n');
  console.log('-'.repeat(70));
  
  // Items
  const itemsWithIconPath = items.filter(i => i.iconPath).length;
  const itemsMapped = items.filter(i => iconMap.items[i.name]).length;
  const itemsUnmapped = items.length - itemsMapped;
  console.log(`\nItems:`);
  console.log(`   Total: ${items.length}`);
  console.log(`   With iconPath in data: ${itemsWithIconPath} (${Math.round(itemsWithIconPath/items.length*100)}%)`);
  console.log(`   Mapped in ICON_MAP: ${itemsMapped} (${Math.round(itemsMapped/items.length*100)}%)`);
  console.log(`   Unmapped: ${itemsUnmapped} (${Math.round(itemsUnmapped/items.length*100)}%)`);
  
  // Abilities
  const abilitiesWithIconPath = abilities.filter(a => a.iconPath).length;
  const abilitiesMapped = abilities.filter(a => iconMap.abilities[a.name] || iconMap.abilities[stripColorCodes(a.name)]).length;
  const abilitiesUnmapped = abilities.length - abilitiesMapped;
  console.log(`\nAbilities:`);
  console.log(`   Total: ${abilities.length}`);
  console.log(`   With iconPath in data: ${abilitiesWithIconPath} (${Math.round(abilitiesWithIconPath/abilities.length*100)}%)`);
  console.log(`   Mapped in ICON_MAP: ${abilitiesMapped} (${Math.round(abilitiesMapped/abilities.length*100)}%)`);
  console.log(`   Unmapped: ${abilitiesUnmapped} (${Math.round(abilitiesUnmapped/abilities.length*100)}%)`);
  
  // Units
  const unitsWithIconPath = units.filter(u => u.iconPath).length;
  const unitsMapped = units.filter(u => iconMap.units[u.name]).length;
  const unitsUnmapped = units.length - unitsMapped;
  console.log(`\nUnits:`);
  console.log(`   Total: ${units.length}`);
  console.log(`   With iconPath in data: ${unitsWithIconPath} (${Math.round(unitsWithIconPath/units.length*100)}%)`);
  console.log(`   Mapped in ICON_MAP: ${unitsMapped} (${Math.round(unitsMapped/units.length*100)}%)`);
  console.log(`   Unmapped: ${unitsUnmapped} (${Math.round(unitsUnmapped/units.length*100)}%)`);
  
  // Classes
  const classesWithIconSrc = baseClasses.filter(c => c.iconSrc).length;
  const classesMapped = baseClasses.filter(c => iconMap.trolls[c.name]).length;
  const classesUnmapped = baseClasses.length - classesMapped;
  console.log(`\nBase Classes:`);
  console.log(`   Total: ${baseClasses.length}`);
  console.log(`   With iconSrc in data: ${classesWithIconSrc} (${Math.round(classesWithIconSrc/baseClasses.length*100)}%)`);
  console.log(`   Mapped in ICON_MAP: ${classesMapped} (${Math.round(classesMapped/baseClasses.length*100)}%)`);
  console.log(`   Unmapped: ${classesUnmapped} (${Math.round(classesUnmapped/baseClasses.length*100)}%)`);
  
  // Derived Classes
  const derivedWithIconSrc = derivedClasses.filter(c => c.iconSrc).length;
  const derivedMapped = derivedClasses.filter(c => iconMap.trolls[c.name]).length;
  const derivedUnmapped = derivedClasses.length - derivedMapped;
  console.log(`\nDerived Classes:`);
  console.log(`   Total: ${derivedClasses.length}`);
  console.log(`   With iconSrc in data: ${derivedWithIconSrc} (${Math.round(derivedWithIconSrc/derivedClasses.length*100)}%)`);
  console.log(`   Mapped in ICON_MAP: ${derivedMapped} (${Math.round(derivedMapped/derivedClasses.length*100)}%)`);
  console.log(`   Unmapped: ${derivedUnmapped} (${Math.round(derivedUnmapped/derivedClasses.length*100)}%)`);
  
  // Show unmapped examples
  console.log('\n🔍 Sample Unmapped Items (first 10):');
  const unmappedItems = items.filter(i => !iconMap.items[i.name]).slice(0, 10);
  unmappedItems.forEach(item => {
    console.log(`   - ${item.name}${item.iconPath ? ` (has iconPath: ${item.iconPath})` : ''}`);
  });
  
  console.log('\n🔍 Sample Unmapped Abilities (first 10):');
  const unmappedAbilities = abilities.filter(a => !iconMap.abilities[a.name] && !iconMap.abilities[stripColorCodes(a.name)]).slice(0, 10);
  unmappedAbilities.forEach(ability => {
    console.log(`   - ${ability.name}${ability.iconPath ? ` (has iconPath: ${ability.iconPath})` : ''}`);
  });
  
  console.log('\n🔍 Sample Unmapped Units (first 10):');
  const unmappedUnits = units.filter(u => !iconMap.units[u.name]).slice(0, 10);
  unmappedUnits.forEach(unit => {
    console.log(`   - ${unit.name}${unit.iconPath ? ` (has iconPath: ${unit.iconPath})` : ''}`);
  });
  
  // Summary
  console.log('\n📋 Summary\n');
  console.log('-'.repeat(70));
  const totalEntities = items.length + abilities.length + units.length + baseClasses.length + derivedClasses.length;
  const totalMapped = itemsMapped + abilitiesMapped + unitsMapped + classesMapped + derivedMapped;
  const totalUnmapped = totalEntities - totalMapped;
  
  console.log(`Total entities: ${totalEntities}`);
  console.log(`Total mapped: ${totalMapped} (${Math.round(totalMapped/totalEntities*100)}%)`);
  console.log(`Total unmapped: ${totalUnmapped} (${Math.round(totalUnmapped/totalEntities*100)}%)`);
  
  console.log('\n✅ Analysis complete!\n');
}

main();

