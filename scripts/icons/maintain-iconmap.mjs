/**
 * Unified Icon Map Maintenance Script
 * 
 * This script consolidates the functionality of:
 * - fix-iconmap-duplicates.mjs
 * - fix-iconmap-escaping.mjs
 * - regenerate-iconmap.mjs
 * 
 * Usage:
 *   node scripts/icons/maintain-iconmap.mjs [--fix-duplicates] [--fix-escaping] [--regenerate]
 * 
 * If no flags are provided, all operations are performed.
 */

import fs from 'fs';
import { parseIconMap, generateIconMap } from '../lib/iconmap-utils.mjs';
import { PATHS } from '../lib/constants.mjs';

// Parse command line arguments
const args = process.argv.slice(2);
const fixDuplicates = args.includes('--fix-duplicates') || args.length === 0;
const fixEscaping = args.includes('--fix-escaping') || args.length === 0;
const regenerate = args.includes('--regenerate') || args.length === 0;

/**
 * Fix escaping issues in iconMap content
 */
function fixEscapingIssues(content) {
  let fixed = content;
  
  // Fix entries with trailing backslash before closing quote: 'key\': 'value'
  fixed = fixed.replace(/(\s+)'([^']*?)\\\':\s*'([^']+)'/g, (match, indent, key, value) => {
    const cleanKey = key.replace(/\\$/, '');
    const escapedKey = cleanKey.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const escapedValue = value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    return `${indent}'${escapedKey}': '${escapedValue}'`;
  });
  
  // Fix entries with double backslash: 'key\\': 'value' -> 'key': 'value'
  fixed = fixed.replace(/(\s+)'([^']*?)\\\\\':\s*'([^']+)'/g, (match, indent, key, value) => {
    const cleanKey = key.replace(/\\$/, '');
    const escapedKey = cleanKey.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const escapedValue = value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    return `${indent}'${escapedKey}': '${escapedValue}'`;
  });
  
  return fixed;
}

/**
 * Fix escaping issues in iconMap content
 */
function fixEscapingIssues(content) {
  let fixed = content;
  
  // Fix entries with trailing backslash before closing quote: 'key\': 'value'
  fixed = fixed.replace(/(\s+)'([^']*?)\\\':\s*'([^']+)'/g, (match, indent, key, value) => {
    const cleanKey = key.replace(/\\$/, '');
    const escapedKey = cleanKey.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const escapedValue = value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    return `${indent}'${escapedKey}': '${escapedValue}'`;
  });
  
  // Fix entries with double backslash: 'key\\': 'value' -> 'key': 'value'
  fixed = fixed.replace(/(\s+)'([^']*?)\\\\\':\s*'([^']+)'/g, (match, indent, key, value) => {
    const cleanKey = key.replace(/\\$/, '');
    const escapedKey = cleanKey.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const escapedValue = value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    return `${indent}'${escapedKey}': '${escapedValue}'`;
  });
  
  return fixed;
}

function main() {
  console.log('🔧 Icon Map Maintenance\n');
  console.log('='.repeat(70));
  
  if (!fs.existsSync(PATHS.ICON_MAP_FILE)) {
    console.error(`❌ Icon map file not found: ${PATHS.ICON_MAP_FILE}`);
    process.exit(1);
  }
  
  let content = fs.readFileSync(PATHS.ICON_MAP_FILE, 'utf-8');
  let iconMap = null;
  
  // Fix duplicates
  if (fixDuplicates) {
    console.log('\n📖 Fixing duplicates...');
    iconMap = parseIconMap(content);
    const totalMappings = Object.values(iconMap).reduce((sum, cat) => sum + Object.keys(cat).length, 0);
    console.log(`   Found ${totalMappings} total mappings`);
    console.log(`   Abilities: ${Object.keys(iconMap.abilities).length}`);
    console.log(`   Items: ${Object.keys(iconMap.items).length}`);
    console.log(`   Buildings: ${Object.keys(iconMap.buildings).length}`);
    console.log(`   Trolls: ${Object.keys(iconMap.trolls).length}`);
    console.log(`   Units: ${Object.keys(iconMap.units).length}`);
  }
  
  // Fix escaping
  if (fixEscaping) {
    console.log('\n🔤 Fixing escaping issues...');
    content = fixEscapingIssues(content);
    console.log('   ✅ Fixed escaping');
  }
  
  // Regenerate (if requested, or if we parsed for duplicates)
  if (regenerate && iconMap) {
    console.log('\n🔄 Regenerating iconMap.ts...');
    content = generateIconMap(iconMap);
    console.log('   ✅ Regenerated');
  } else if (fixDuplicates && iconMap) {
    // If we fixed duplicates but didn't regenerate, update content
    content = generateIconMap(iconMap);
  }
  
  // Write the fixed content
  fs.writeFileSync(PATHS.ICON_MAP_FILE, content, 'utf-8');
  
  console.log('\n✅ Icon map maintenance complete!');
  console.log(`   File: ${PATHS.ICON_MAP_FILE}\n`);
}

main();

