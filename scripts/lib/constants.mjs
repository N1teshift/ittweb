/**
 * Shared constants and path utilities
 * 
 * Central location for all path constants used across scripts
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..', '..');

export const PATHS = {
  ROOT: ROOT_DIR,
  ICONS_DIR: path.join(ROOT_DIR, 'public', 'icons', 'itt'),
  ICON_MAP_FILE: path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'utils', 'iconMap.ts'),
  ITEMS_DIR: path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'data', 'items'),
  ABILITIES_DIR: path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'data', 'abilities'),
  UNITS_FILE: path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'data', 'units', 'allUnits.ts'),
  CLASSES_FILE: path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'data', 'units', 'classes.ts'),
  DERIVED_CLASSES_FILE: path.join(ROOT_DIR, 'src', 'features', 'modules', 'guides', 'data', 'units', 'derivedClasses.ts'),
  EXTRACTED_DIR: path.join(ROOT_DIR, 'data', 'island_troll_tribes', 'extracted_from_w3x'),
};

export const ICON_CATEGORIES = ['abilities', 'items', 'buildings', 'trolls', 'units', 'base', 'unclassified'];

export const ITEM_FILES = [
  'armor.ts',
  'weapons.ts',
  'potions.ts',
  'raw-materials.ts',
  'scrolls.ts',
  'buildings.ts',
  'unknown.ts'
];

export const ABILITY_FILES = [
  'basic.ts',
  'beastmaster.ts',
  'gatherer.ts',
  'hunter.ts',
  'item.ts',
  'mage.ts',
  'priest.ts',
  'scout.ts',
  'thief.ts',
  'unknown.ts'
];

