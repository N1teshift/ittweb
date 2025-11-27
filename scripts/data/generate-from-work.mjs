/**
 * Master script to generate TypeScript data files directly from external/Work/ decompiled map files
 * 
 * ============================================================================
 * DATA GENERATION PIPELINE ORCHESTRATOR
 * ============================================================================
 * 
 * This script orchestrates the complete data generation pipeline:
 * 1. Uses static category mappings from category-mappings.json (manually curated)
 * 2. Extracts raw data from war3map files in external/Work/
 * 3. Extracts metadata (units, buildings, recipes)
 * 4. Converts extracted data to TypeScript format (items, abilities, units)
 * 5. Generates icon mapping (iconMap.ts)
 * 
 * PIPELINE SCRIPTS (automatically called in order):
 * ============================================================================
 * 1. extract-from-w3x.mjs           - Extracts raw game data from war3map files
 * 2. extract-metadata.mjs           - Extracts units, buildings, and recipe metadata
 * 3. convert-extracted-to-typescript.mjs - Converts JSON to TypeScript data files
 * 4. regenerate-iconmap.mjs         - Generates icon mapping from icon files
 * 
 * See scripts/data/README.md for detailed documentation.
 * 
 * Usage: node scripts/data/generate-from-work.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import {
  ROOT_DIR,
  WORK_DIR,
  DATA_TS_DIR,
  ITEMS_TS_DIR,
  ABILITIES_TS_DIR,
  UNITS_TS_DIR,
  TMP_ROOT,
  ensureTmpDirs,
} from './paths.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Static category mappings file (manually curated, not regenerated)
const CATEGORY_MAPPINGS_FILE = path.join(ROOT_DIR, 'scripts', 'data', 'category-mappings.json');

// ============================================================================
// PIPELINE SCRIPTS - Called automatically by this master script
// ============================================================================
const EXTRACT_FROM_W3X_SCRIPT = path.join(__dirname, 'extract-from-w3x.mjs');
const EXTRACT_METADATA_SCRIPT = path.join(__dirname, 'extract-metadata.mjs');
const CONVERT_SCRIPT = path.join(__dirname, 'convert-extracted-to-typescript.mjs');
const REGENERATE_ICONMAP_SCRIPT = path.join(__dirname, 'regenerate-iconmap.mjs');

/**
 * Clean a directory by removing all .ts files
 */
function cleanDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`📁 Directory doesn't exist: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir);
  let removedCount = 0;

  for (const file of files) {
    if (file.endsWith('.ts')) {
      const filePath = path.join(dir, file);
      fs.unlinkSync(filePath);
      removedCount++;
    }
  }

  if (removedCount > 0) {
    console.log(`🧹 Cleaned ${removedCount} files from ${path.relative(ROOT_DIR, dir)}`);
  }
}

/**
 * Reset all data directories
 */
function resetDataDirectories() {
  console.log('\n🧹 Resetting data directories...\n');

  cleanDirectory(ITEMS_TS_DIR);
  cleanDirectory(ABILITIES_TS_DIR);
  cleanDirectory(UNITS_TS_DIR);

  // Remove iconMap.ts from data directory
  const iconMapPath = path.join(DATA_TS_DIR, 'iconMap.ts');
  if (fs.existsSync(iconMapPath)) {
    fs.unlinkSync(iconMapPath);
    console.log(`🧹 Removed ${path.relative(ROOT_DIR, iconMapPath)}`);
  }

  // Remove data/index.ts (will be regenerated)
  const dataIndexPath = path.join(DATA_TS_DIR, 'index.ts');
  if (fs.existsSync(dataIndexPath)) {
    fs.unlinkSync(dataIndexPath);
    console.log(`🧹 Removed ${path.relative(ROOT_DIR, dataIndexPath)}`);
  }

  // Ensure tmp workspace is clean for this run
  if (fs.existsSync(TMP_ROOT)) {
    fs.rmSync(TMP_ROOT, { recursive: true, force: true });
  }
  ensureTmpDirs();

  console.log('✅ Data directories reset\n');
}

/**
 * Check if category mappings file exists
 */
function checkCategoryMappings() {
  if (fs.existsSync(CATEGORY_MAPPINGS_FILE)) {
    const mappings = JSON.parse(fs.readFileSync(CATEGORY_MAPPINGS_FILE, 'utf-8'));
    const itemCount = Object.keys(mappings.items || {}).length;
    const abilityCount = Object.keys(mappings.abilities || {}).length;
    console.log(`📚 Using static category mappings: ${itemCount} items, ${abilityCount} abilities\n`);
    return true;
  }

  console.warn('⚠️  Category mappings file not found:');
  console.warn(`   ${path.relative(ROOT_DIR, CATEGORY_MAPPINGS_FILE)}`);
  console.warn('   Items and abilities will default to "unknown" category\n');
  return false;
}

/**
 * Run a script and wait for it to complete
 */
function runScript(scriptPath, scriptName) {
  return new Promise((resolve, reject) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔄 Running: ${scriptName}`);
    console.log('='.repeat(60) + '\n');

    const script = spawn('node', [scriptPath], {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      shell: true
    });

    script.on('close', (code) => {
      if (code === 0) {
        console.log(`\n✅ ${scriptName} completed successfully\n`);
        resolve();
      } else {
        console.error(`\n❌ ${scriptName} failed with exit code ${code}\n`);
        reject(new Error(`${scriptName} failed with exit code ${code}`));
      }
    });

    script.on('error', (error) => {
      console.error(`\n❌ Error running ${scriptName}:`, error);
      reject(error);
    });
  });
}

/**
 * Check if Work directory has required files
 */
function checkWorkDirectory() {
  if (!fs.existsSync(WORK_DIR)) {
    throw new Error(`Work directory not found: ${WORK_DIR}`);
  }

  const requiredFiles = ['war3map.w3t', 'war3map.w3a', 'war3map.w3u', 'war3map.w3b'];
  const missingFiles = requiredFiles.filter(file => !fs.existsSync(path.join(WORK_DIR, file)));

  if (missingFiles.length > 0) {
    throw new Error(`Missing required files in Work directory: ${missingFiles.join(', ')}`);
  }

  console.log('✅ Work directory check passed\n');
}

/**
 * Main function
 */
async function main() {
  console.log('='.repeat(60));
  console.log('🚀 Master Data Generation from Work Directory');
  console.log('='.repeat(60));
  console.log('\nThis script will:');
  console.log('  1. Use static category mappings file (category-mappings.json)');
  console.log('  2. Extract raw data from war3map files in external/Work/');
  console.log('  3. Extract metadata (units, buildings, recipes)');
  console.log('  4. Convert to TypeScript data files (items, abilities, units)');
  console.log('  5. Generate icon mapping (iconMap.ts)');
  console.log('\n' + '='.repeat(60) + '\n');

  try {
    // Step 0: Check Work directory
    checkWorkDirectory();

    // Step 1: Check category mappings file exists
    checkCategoryMappings();

    // Step 2: Reset data directories
    resetDataDirectories();

    // Step 3: Extract from Work files (this will create extracted_from_w3x/ JSON files)
    await runScript(EXTRACT_FROM_W3X_SCRIPT, 'extract-from-w3x.mjs');

    // Step 4: Extract metadata (recipes, buildings, units)
    await runScript(EXTRACT_METADATA_SCRIPT, 'extract-metadata.mjs');

    // Step 5: Generate TypeScript data files
    // Uses static category-mappings.json file for categorization
    await runScript(CONVERT_SCRIPT, 'convert-extracted-to-typescript.mjs');

    // Step 6: Generate icon mapping
    await runScript(REGENERATE_ICONMAP_SCRIPT, 'regenerate-iconmap.mjs');

    console.log('='.repeat(60));
    console.log('✅ All data generation complete!');
    console.log('='.repeat(60));
    console.log('\nGenerated files:');
    console.log(`  📦 Items: ${ITEMS_TS_DIR}`);
    console.log(`  ✨ Abilities: ${ABILITIES_TS_DIR}`);
    console.log(`  👤 Units: ${UNITS_TS_DIR}`);
    console.log(`  🗺️  Icon Map: ${path.join(DATA_TS_DIR, 'iconMap.ts')}`);
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Error during data generation:', error.message);
    process.exit(1);
  }
}

main();

