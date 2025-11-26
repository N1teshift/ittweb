/**
 * Unified Icon Mapping Management Script
 * 
 * This script consolidates the functionality of:
 * - extract-and-organize-icons.mjs
 * - find-missing-icons-with-fuzzy-match.mjs
 * - map-available-icons-and-generate-extraction-list.mjs
 * - map-icons-to-files.mjs
 * - map-all-icons-fixed.mjs
 * 
 * Usage:
 *   node scripts/icons/manage-icon-mapping.mjs [--map] [--find-missing] [--fuzzy] [--generate-list] [--update-map]
 * 
 * If no flags are provided, all operations are performed.
 */

import fs from 'fs';
import path from 'path';
import { getAllIconFiles, findIconFile, extractIconFilename, findFuzzyMatch, suggestIconFilename } from '../lib/icon-utils.mjs';
import { readItemsFromTS, readAbilitiesFromTS } from '../lib/data-readers.mjs';
import { parseIconMap, updateIconMap } from '../lib/iconmap-utils.mjs';
import { PATHS } from '../lib/constants.mjs';

// Parse command line arguments
const args = process.argv.slice(2);
const doMap = args.includes('--map') || args.length === 0;
const doFindMissing = args.includes('--find-missing') || args.length === 0;
const doFuzzy = args.includes('--fuzzy') || args.length === 0;
const doGenerateList = args.includes('--generate-list') || args.length === 0;
const doUpdateMap = args.includes('--update-map') || args.length === 0;

function main() {
  console.log('🗺️  Icon Mapping Management\n');
  console.log('='.repeat(70));
  
  // Load data using shared utilities
  console.log('\n📁 Loading icon files...');
  const { icons, allFilenames } = getAllIconFiles();
  console.log(`   Found ${icons.size} unique icon files`);
  
  console.log('\n📦 Reading entities...');
  const items = readItemsFromTS();
  const abilities = readAbilitiesFromTS();
  console.log(`   Items: ${items.length}`);
  console.log(`   Abilities: ${abilities.length}`);
  
  const iconMap = parseIconMap();
  const newMappings = {
    abilities: {},
    items: {},
    buildings: {},
    trolls: {},
    units: {},
  };
  
  let mappedCount = 0;
  let missingCount = 0;
  const missingItems = [];
  const missingAbilities = [];
  const fuzzyMatches = [];
  
  // Map available icons
  if (doMap) {
    console.log('\n🔗 Mapping available icons...');
    
    for (const item of items) {
      if (iconMap.items[item.name]) continue; // Already mapped
      
      if (item.iconPath) {
        const iconFile = findIconFile(item.iconPath, icons);
        if (iconFile) {
          newMappings.items[item.name] = iconFile.filename;
          mappedCount++;
        } else {
          missingItems.push(item);
          missingCount++;
        }
      } else {
        missingItems.push(item);
        missingCount++;
      }
    }
    
    for (const ability of abilities) {
      if (iconMap.abilities[ability.name]) continue; // Already mapped
      
      if (ability.iconPath) {
        const iconFile = findIconFile(ability.iconPath, icons);
        if (iconFile) {
          newMappings.abilities[ability.name] = iconFile.filename;
          mappedCount++;
        } else {
          missingAbilities.push(ability);
          missingCount++;
        }
      } else {
        missingAbilities.push(ability);
        missingCount++;
      }
    }
    
    console.log(`   ✅ Mapped ${mappedCount} entities`);
    console.log(`   ❌ Missing ${missingCount} icons`);
  }
  
  // Find missing with fuzzy matching
  if (doFindMissing && doFuzzy) {
    console.log('\n🔍 Finding fuzzy matches for missing icons...');
    
    for (const item of missingItems.slice(0, 20)) {
      if (item.iconPath) {
        const matches = findFuzzyMatch(item.iconPath, allFilenames);
        if (matches.length > 0) {
          fuzzyMatches.push({
            entity: item.name,
            category: 'items',
            iconPath: item.iconPath,
            suggestions: matches
          });
        }
      }
    }
    
    for (const ability of missingAbilities.slice(0, 20)) {
      if (ability.iconPath) {
        const matches = findFuzzyMatch(ability.iconPath, allFilenames);
        if (matches.length > 0) {
          fuzzyMatches.push({
            entity: ability.name,
            category: 'abilities',
            iconPath: ability.iconPath,
            suggestions: matches
          });
        }
      }
    }
    
    if (fuzzyMatches.length > 0) {
      console.log(`   Found ${fuzzyMatches.length} potential matches`);
      fuzzyMatches.slice(0, 5).forEach(match => {
        console.log(`   - ${match.entity}: ${match.suggestions[0].filename} (${Math.round(match.suggestions[0].similarity * 100)}% match)`);
      });
    }
  }
  
  // Generate extraction list
  if (doGenerateList) {
    console.log('\n📋 Generating extraction list...');
    const reportPath = path.join(PATHS.ROOT, 'MISSING_ICONS_REPORT.md');
    let report = '# Missing Icons Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;
    report += `## Summary\n\n`;
    report += `- Missing Items: ${missingItems.length}\n`;
    report += `- Missing Abilities: ${missingAbilities.length}\n\n`;
    
    if (missingItems.length > 0) {
      report += `## Missing Items\n\n`;
      missingItems.slice(0, 50).forEach(item => {
        const suggested = item.iconPath ? extractIconFilename(item.iconPath) : suggestIconFilename(item.name);
        report += `- ${item.name} (suggested: ${suggested})\n`;
      });
      if (missingItems.length > 50) {
        report += `... and ${missingItems.length - 50} more\n\n`;
      }
    }
    
    if (missingAbilities.length > 0) {
      report += `## Missing Abilities\n\n`;
      missingAbilities.slice(0, 50).forEach(ability => {
        const suggested = ability.iconPath ? extractIconFilename(ability.iconPath) : suggestIconFilename(ability.name);
        report += `- ${ability.name} (suggested: ${suggested})\n`;
      });
      if (missingAbilities.length > 50) {
        report += `... and ${missingAbilities.length - 50} more\n\n`;
      }
    }
    
    fs.writeFileSync(reportPath, report, 'utf-8');
    console.log(`   ✅ Report saved to: ${reportPath}`);
  }
  
  // Update iconMap
  if (doUpdateMap && Object.keys(newMappings.items).length + Object.keys(newMappings.abilities).length > 0) {
    console.log('\n💾 Updating iconMap.ts...');
    updateIconMap(newMappings);
    console.log(`   ✅ Updated ${Object.keys(newMappings.items).length} items`);
    console.log(`   ✅ Updated ${Object.keys(newMappings.abilities).length} abilities`);
  }
  
  console.log('\n✅ Icon mapping management complete!\n');
}

main();

