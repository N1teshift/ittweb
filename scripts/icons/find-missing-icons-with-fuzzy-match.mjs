/**
 * Find Missing Icons with Fuzzy Matching
 * 
 * This script tries to find missing icons using fuzzy matching
 * and suggests potential matches
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ICON_CATEGORIES } from '../lib/constants.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..', '..');

const ICONS_DIR = path.join(ROOT_DIR, 'public', 'icons', 'itt');
const ICON_MAP_FILE = path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'utils', 'iconMap.ts');

/**
 * Get all icon files
 */
function getAllIconFiles() {
  const icons = new Map(); // lowercase -> { category, filename }
  const allFilenames = []; // All actual filenames for fuzzy matching
  const categories = ICON_CATEGORIES;
  
  for (const category of categories) {
    const categoryDir = path.join(ICONS_DIR, category);
    if (fs.existsSync(categoryDir)) {
      const files = fs.readdirSync(categoryDir);
      for (const file of files) {
        if (file.endsWith('.png')) {
          const lowerKey = file.toLowerCase();
          if (!icons.has(lowerKey)) {
            icons.set(lowerKey, { category, filename: file });
          }
          allFilenames.push(file);
        }
      }
      
      const subdirs = fs.readdirSync(categoryDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      for (const subdir of subdirs) {
        const subdirPath = path.join(categoryDir, subdir);
        const subFiles = fs.readdirSync(subdirPath);
        for (const file of subFiles) {
          if (file.endsWith('.png')) {
            const lowerKey = file.toLowerCase();
            if (!icons.has(lowerKey)) {
              icons.set(lowerKey, { category, filename: file });
            }
            allFilenames.push(file);
          }
        }
      }
    }
  }
  
  return { icons, allFilenames };
}

/**
 * Extract filename from path
 */
function extractIconFilename(iconPath) {
  if (!iconPath) return null;
  const pathParts = iconPath.split(/[/\\]/);
  return pathParts[pathParts.length - 1];
}

/**
 * Find exact match (case-insensitive)
 */
function findExactMatch(iconPath, icons) {
  const filename = extractIconFilename(iconPath);
  if (!filename) return null;
  const lowerKey = filename.toLowerCase();
  return icons.get(lowerKey) || null;
}

/**
 * Fuzzy match - find similar filenames
 */
function findFuzzyMatch(iconPath, allFilenames) {
  const target = extractIconFilename(iconPath);
  if (!target) return [];
  
  const targetLower = target.toLowerCase();
  const targetBase = targetLower.replace(/\.png$/, '').replace(/^(btn|atc|pas|dis)/, '');
  
  const matches = [];
  
  for (const filename of allFilenames) {
    const fileLower = filename.toLowerCase();
    const fileBase = fileLower.replace(/\.png$/, '').replace(/^(btn|atc|pas|dis)/, '');
    
    // Check if base names are similar
    if (fileBase.includes(targetBase) || targetBase.includes(fileBase)) {
      matches.push(filename);
    }
    // Also check if target is contained in filename (without extension)
    else if (fileLower.includes(targetLower.replace('.png', '')) || 
             targetLower.replace('.png', '').includes(fileLower.replace('.png', ''))) {
      matches.push(filename);
    }
  }
  
  return matches.slice(0, 3); // Return top 3 matches
}

/**
 * Read unmapped entities from analysis
 */
function getUnmappedEntities() {
  // We'll read from the data files and check against ICON_MAP
  // For now, let's focus on the ones with iconPath that aren't found
  return {
    items: [
      { name: 'Mammoth Boots', iconPath: 'bTNMammothBoots.png' },
      { name: 'Tidebringer', iconPath: 'BTNNagaWeaponUp2.png' },
      { name: 'Magefist', iconPath: 'BTNSpellSteal.png' },
      { name: 'Oracle Potion', iconPath: 'BTNGreaterInvisibility.png' },
    ],
    abilities: [
      { name: 'Overcharge', iconPath: 'BTNFeedBack.png' },
      { name: 'Aura Dummy: Spell Damage Reduction', iconPath: 'BTNThickFur.png' },
    ],
    units: [
      { name: 'Effect Dummy Unit', iconPath: 'BTNTemp.png' },
      { name: 'Dummy Caster', iconPath: 'BTNtemp.png' },
    ]
  };
}

function main() {
  console.log('🔍 Finding Missing Icons with Fuzzy Matching\n');
  console.log('='.repeat(70));
  
  const { icons, allFilenames } = getAllIconFiles();
  console.log(`\n📁 Found ${icons.size} unique icon files`);
  console.log(`   Total filenames: ${allFilenames.length}`);
  
  // Test some known missing icons
  const testCases = [
    'bTNMammothBoots.png',
    'BTNNagaWeaponUp2.png',
    'BTNSpellSteal.png',
    'BTNGreaterInvisibility.png',
    'BTNFeedBack.png',
    'BTNThickFur.png',
    'BTNTemp.png',
    'BTNtemp.png',
    'BTNOrcMeleeUpOne.png',
    'BTNSpiritWalkerAdeptTraining.png',
  ];
  
  console.log('\n🔍 Testing case-insensitive matching...\n');
  
  const results = {
    found: [],
    notFound: [],
    fuzzyMatches: [],
  };
  
  for (const testCase of testCases) {
    const exact = findExactMatch(testCase, icons);
    if (exact) {
      results.found.push({ original: testCase, found: exact.filename });
      console.log(`✅ ${testCase} -> Found as: ${exact.filename}`);
    } else {
      const fuzzy = findFuzzyMatch(testCase, allFilenames);
      if (fuzzy.length > 0) {
        results.fuzzyMatches.push({ original: testCase, matches: fuzzy });
        console.log(`🔍 ${testCase} -> Fuzzy matches: ${fuzzy.join(', ')}`);
      } else {
        results.notFound.push(testCase);
        console.log(`❌ ${testCase} -> Not found`);
      }
    }
  }
  
  console.log('\n📊 Summary\n');
  console.log('-'.repeat(70));
  console.log(`✅ Exact matches (case-insensitive): ${results.found.length}`);
  console.log(`🔍 Fuzzy matches found: ${results.fuzzyMatches.length}`);
  console.log(`❌ Not found: ${results.notFound.length}`);
  
  // Check if files exist with different case
  console.log('\n🔍 Checking for case variations...\n');
  for (const notFound of results.notFound) {
    const baseName = notFound.replace(/\.png$/i, '');
    const variations = allFilenames.filter(f => 
      f.replace(/\.png$/i, '').toLowerCase() === baseName.toLowerCase()
    );
    if (variations.length > 0) {
      console.log(`   ${notFound} -> Found variations: ${variations.join(', ')}`);
    }
  }
  
  console.log('\n✅ Analysis complete!\n');
}

main();

