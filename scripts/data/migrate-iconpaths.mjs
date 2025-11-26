/**
 * Unified Icon Path Migration Script
 * 
 * This script consolidates the functionality of:
 * - migrate-iconpaths-to-iconmap.mjs
 * - fix-icon-mapping-issues.mjs
 * 
 * Usage:
 *   node scripts/data/migrate-iconpaths.mjs [--fix-case] [--handle-paths] [--auto-map] [--report]
 * 
 * If no flags are provided, all operations are performed.
 */

import fs from 'fs';
import path from 'path';
import { getAllIconFiles, findIconFile, extractIconFilename } from '../lib/icon-utils.mjs';
import { readItemsFromTS, readAbilitiesFromTS, readUnitsFromTS, readClassesFromTS } from '../lib/data-readers.mjs';
import { parseIconMap, updateIconMap } from '../lib/iconmap-utils.mjs';
import { PATHS } from '../lib/constants.mjs';

// Parse command line arguments
const args = process.argv.slice(2);
const fixCase = args.includes('--fix-case') || args.length === 0;
const handlePaths = args.includes('--handle-paths') || args.length === 0;
const autoMap = args.includes('--auto-map') || args.length === 0;
const generateReport = args.includes('--report') || args.length === 0;

function main() {
  console.log('🔄 Icon Path Migration\n');
  console.log('='.repeat(70));
  
  // Load data using shared utilities
  console.log('\n📁 Loading icon files...');
  const { icons: allIcons } = getAllIconFiles();
  console.log(`   Found ${allIcons.size} unique icon files`);
  
  console.log('\n📦 Reading entities...');
  const items = readItemsFromTS();
  const abilities = readAbilitiesFromTS();
  const units = readUnitsFromTS();
  const classes = readClassesFromTS();
  console.log(`   Items: ${items.length}`);
  console.log(`   Abilities: ${abilities.length}`);
  console.log(`   Units: ${units.length}`);
  console.log(`   Classes: ${classes.length}`);
  
  const iconMap = parseIconMap();
  const newMappings = {
    abilities: {},
    items: {},
    buildings: {},
    trolls: {},
    units: {},
  };
  
  const issues = {
    canBeMapped: [],
    pathBased: [],
    missingIcons: [],
    caseSensitivity: [],
  };
  
  // Process items
  if (autoMap) {
    console.log('\n🔗 Processing items...');
    for (const item of items) {
      if (iconMap.items[item.name]) continue; // Already mapped
      
      if (item.iconPath) {
        const iconFile = findIconFile(item.iconPath, allIcons);
        if (iconFile) {
          newMappings.items[item.name] = iconFile.filename;
          issues.canBeMapped.push({
            category: 'items',
            name: item.name,
            iconPath: item.iconPath,
            foundIcon: iconFile.filename
          });
        } else {
          if (handlePaths && (item.iconPath.includes('/') || item.iconPath.includes('\\'))) {
            issues.pathBased.push({
              category: 'items',
              name: item.name,
              iconPath: item.iconPath,
              extractedFilename: extractIconFilename(item.iconPath)
            });
          } else {
            issues.missingIcons.push({
              category: 'items',
              name: item.name,
              iconPath: item.iconPath
            });
          }
        }
      } else {
        issues.missingIcons.push({
          category: 'items',
          name: item.name,
          iconPath: null
        });
      }
    }
  }
  
  // Process abilities
  if (autoMap) {
    console.log('✨ Processing abilities...');
    for (const ability of abilities) {
      if (iconMap.abilities[ability.name]) continue; // Already mapped
      
      if (ability.iconPath) {
        const iconFile = findIconFile(ability.iconPath, allIcons);
        if (iconFile) {
          newMappings.abilities[ability.name] = iconFile.filename;
          issues.canBeMapped.push({
            category: 'abilities',
            name: ability.name,
            iconPath: ability.iconPath,
            foundIcon: iconFile.filename
          });
        } else {
          if (handlePaths && (ability.iconPath.includes('/') || ability.iconPath.includes('\\'))) {
            issues.pathBased.push({
              category: 'abilities',
              name: ability.name,
              iconPath: ability.iconPath,
              extractedFilename: extractIconFilename(ability.iconPath)
            });
          } else {
            issues.missingIcons.push({
              category: 'abilities',
              name: ability.name,
              iconPath: ability.iconPath
            });
          }
        }
      } else {
        issues.missingIcons.push({
          category: 'abilities',
          name: ability.name,
          iconPath: null
        });
      }
    }
  }
  
  // Process units
  if (autoMap) {
    console.log('👤 Processing units...');
    for (const unit of units) {
      if (iconMap.units[unit.name]) continue;
      
      if (unit.iconPath) {
        const iconFile = findIconFile(unit.iconPath, allIcons);
        if (iconFile) {
          newMappings.units[unit.name] = iconFile.filename;
        }
      }
    }
  }
  
  // Process classes
  if (autoMap) {
    console.log('🎭 Processing classes...');
    for (const cls of classes) {
      if (iconMap.trolls[cls.name]) continue;
      
      if (cls.iconSrc) {
        const iconFile = findIconFile(cls.iconSrc, allIcons);
        if (iconFile) {
          newMappings.trolls[cls.name] = iconFile.filename;
        }
      }
    }
  }
  
  // Update iconMap
  if (autoMap && Object.keys(newMappings.items).length + Object.keys(newMappings.abilities).length > 0) {
    console.log('\n💾 Updating iconMap.ts...');
    updateIconMap(newMappings);
    console.log(`   ✅ Mapped ${issues.canBeMapped.length} entities`);
  }
  
  // Generate report
  if (generateReport) {
    console.log('\n📊 Generating report...');
    const reportPath = path.join(PATHS.ROOT, 'ICON_MAPPING_ISSUES_REPORT.md');
    let report = '# Icon Mapping Issues Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;
    report += `## Summary\n\n`;
    report += `- Can be mapped: ${issues.canBeMapped.length}\n`;
    report += `- Path-based references: ${issues.pathBased.length}\n`;
    report += `- Missing icons: ${issues.missingIcons.length}\n\n`;
    
    if (issues.pathBased.length > 0) {
      report += `## Path-Based Icon References\n\n`;
      issues.pathBased.slice(0, 50).forEach(item => {
        report += `- **${item.name}** (${item.category})\n`;
        report += `  - Path: \`${item.iconPath}\`\n`;
        report += `  - Extracted filename: \`${item.extractedFilename}\`\n\n`;
      });
    }
    
    if (issues.missingIcons.length > 0) {
      report += `## Missing Icons\n\n`;
      const byCategory = {};
      for (const item of issues.missingIcons) {
        if (!byCategory[item.category]) {
          byCategory[item.category] = [];
        }
        byCategory[item.category].push(item);
      }
      
      for (const [category, items] of Object.entries(byCategory)) {
        report += `### ${category}\n\n`;
        items.slice(0, 30).forEach(item => {
          report += `- ${item.name}${item.iconPath ? ` (expected: ${item.iconPath})` : ''}\n`;
        });
        if (items.length > 30) {
          report += `... and ${items.length - 30} more\n`;
        }
        report += '\n';
      }
    }
    
    fs.writeFileSync(reportPath, report, 'utf-8');
    console.log(`   ✅ Report saved to: ${reportPath}`);
  }
  
  console.log('\n✅ Icon path migration complete!\n');
}

main();

