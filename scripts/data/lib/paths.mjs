/**
 * Centralized filesystem paths for the data generation pipeline.
 * Having a single source of truth keeps all scripts in sync and prevents
 * accidental reads from disallowed directories (like data/island_troll_tribes).
 */

import fs from 'fs';
import path from 'path';
import { getRootDir } from './utils.mjs';

export const ROOT_DIR = getRootDir();

// -----------------------------------------------------------------------------
// Source inputs
// -----------------------------------------------------------------------------

export const WORK_DIR = path.join(ROOT_DIR, 'external', 'Work');

// -----------------------------------------------------------------------------
// Temporary working directories (generated during each pipeline run)
// -----------------------------------------------------------------------------

export const TMP_ROOT = path.join(ROOT_DIR, 'tmp', 'work-data');
export const TMP_RAW_DIR = path.join(TMP_ROOT, 'raw');          // Output from extract-from-w3x
export const TMP_METADATA_DIR = path.join(TMP_ROOT, 'metadata'); // Output from extract-metadata

/**
 * Ensure the temporary working directories exist.
 */
export function ensureTmpDirs() {
  [TMP_ROOT, TMP_RAW_DIR, TMP_METADATA_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

/**
 * Remove a directory (if it exists) and recreate it as empty.
 */
export function resetDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
  fs.mkdirSync(dirPath, { recursive: true });
}

// -----------------------------------------------------------------------------
// Generated TypeScript data targets
// -----------------------------------------------------------------------------

export const DATA_TS_DIR = path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'data');
export const ITEMS_TS_DIR = path.join(DATA_TS_DIR, 'items');
export const ABILITIES_TS_DIR = path.join(DATA_TS_DIR, 'abilities');
export const UNITS_TS_DIR = path.join(DATA_TS_DIR, 'units');


